import { Resend } from "resend";
import { countDueCards } from "@/lib/services/quiz";
import {
  getSettings,
  localDateInZone,
  localHourInZone,
  markEmailSent,
} from "@/lib/services/settings";
import { hourInWindow } from "@/lib/services/srs";
import { writeTrace } from "@/lib/services/traces";

export type EmailResult =
  | { ok: true; skipped?: undefined; reason?: undefined }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped?: false; reason: string };

function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendQuizEmail(force = false, now = new Date()): Promise<EmailResult> {
  const settings = getSettings();
  if (!settings.email) {
    return { ok: false, reason: "Add an email in Settings first." };
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, reason: "Add RESEND_API_KEY to send mail." };
  }

  const hour = localHourInZone(settings.timezone, now);
  const today = localDateInZone(settings.timezone, now);
  if (!force && !hourInWindow(hour, settings.windowStartHour, settings.windowEndHour)) {
    return { ok: false, skipped: true, reason: "Outside your email hours." };
  }
  if (!force && settings.lastEmailSentOn === today) {
    return { ok: false, skipped: true, reason: "Already sent today." };
  }

  const due = countDueCards(now);
  const resend = new Resend(key);
  const from = process.env.RESEND_FROM || "French retention <onboarding@resend.dev>";
  const quizUrl = `${appUrl()}/quiz`;
  const { error } = await resend.emails.send({
    from,
    to: settings.email,
    subject: due > 0 ? `${due} cards are waiting` : "Open a revise session",
    html: `<p>Time for a 10-card revise session.</p>
<p><a href="${quizUrl}">Open Quiz</a></p>
<p>${due} card${due === 1 ? "" : "s"} due.</p>`,
  });
  if (error) {
    writeTrace("email_quiz", { ok: false, error: error.message, due });
    return { ok: false, reason: error.message };
  }
  markEmailSent(today);
  writeTrace("email_quiz", { ok: true, due, to: settings.email, force });
  return { ok: true };
}
