import { getDb } from "@/lib/db";
import type { Settings } from "@/lib/types";

type SettingsRow = {
  email: string | null;
  window_start_hour: number;
  window_end_hour: number;
  timezone: string;
  last_email_sent_on: string | null;
};

function mapSettings(row: SettingsRow): Settings {
  return {
    email: row.email,
    windowStartHour: row.window_start_hour,
    windowEndHour: row.window_end_hour,
    timezone: row.timezone,
    lastEmailSentOn: row.last_email_sent_on,
  };
}

export function getSettings(): Settings {
  const row = getDb().prepare("SELECT * FROM settings WHERE id = 1").get() as SettingsRow;
  return mapSettings(row);
}

export function saveSettings(input: {
  email: string;
  windowStartHour: number;
  windowEndHour: number;
  timezone: string;
}): Settings {
  const email = input.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email looks wrong");
  }
  const start = clampHour(input.windowStartHour);
  const end = clampHour(input.windowEndHour);
  const timezone = input.timezone.trim() || "Europe/Paris";
  if (!isValidTimeZone(timezone)) throw new Error("Timezone looks wrong");

  getDb()
    .prepare(
      `UPDATE settings
       SET email = ?, window_start_hour = ?, window_end_hour = ?, timezone = ?
       WHERE id = 1`,
    )
    .run(email || null, start, end, timezone);
  return getSettings();
}

export function markEmailSent(on = localDateInZone(getSettings().timezone)): void {
  getDb().prepare("UPDATE settings SET last_email_sent_on = ? WHERE id = 1").run(on);
}

export function clampHour(value: number): number {
  if (!Number.isFinite(value)) return 8;
  return Math.min(23, Math.max(0, Math.round(value)));
}

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function localDateInZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function localHourInZone(timeZone: string, now = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return Number.parseInt(hour, 10);
}
