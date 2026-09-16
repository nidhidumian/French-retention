"use client";

import { useActionState } from "react";
import { saveSettingsAction, sendQuizEmailAction } from "@/app/actions/settings";
import { Surface } from "@/components/Surface";
import type { Settings } from "@/lib/types";

const hours = Array.from({ length: 24 }, (_, hour) => hour);

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [saveState, saveAction, saving] = useActionState(saveSettingsAction, null);
  const [mailState, mailAction, sending] = useActionState(sendQuizEmailAction, null);

  return (
    <div className="flex flex-col gap-6">
      <form action={saveAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-pink">
          Email
          <input
            type="email"
            name="email"
            defaultValue={settings.email ?? ""}
            placeholder="you@example.com"
            className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-sm text-pink">
            From
            <select
              name="windowStartHour"
              defaultValue={settings.windowStartHour}
              className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hourLabel(hour)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-pink">
            To
            <select
              name="windowEndHour"
              defaultValue={settings.windowEndHour}
              className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hourLabel(hour)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm text-pink">
          Timezone
          <input
            name="timezone"
            defaultValue={settings.timezone}
            placeholder="Europe/Paris"
            className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
          />
        </label>
        {saveState?.error ? <p className="text-sm text-coral">{saveState.error}</p> : null}
        {saveState?.ok ? <p className="text-sm text-pink">Saved.</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-pink px-5 py-3 font-semibold text-canvas disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save hours"}
        </button>
      </form>

      <Surface className="px-5 py-4 text-sm leading-6 text-cream/85">
        Resend sends a Quiz link in this window. Call /api/cron/email once an
        hour, or send one now to test.
      </Surface>

      <form action={mailAction}>
        {mailState?.error ? <p className="mb-3 text-sm text-coral">{mailState.error}</p> : null}
        {mailState?.ok ? <p className="mb-3 text-sm text-pink">{mailState.info}</p> : null}
        <button
          type="submit"
          disabled={sending}
          className="rounded-full border border-line px-5 py-3 font-semibold text-cream disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send quiz email now"}
        </button>
      </form>
    </div>
  );
}
