"use client";

import { useActionState } from "react";
import { dumpNoteAction } from "@/app/actions/notes";
import { Surface } from "@/components/Surface";

function todayStamp(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function DumpForm() {
  const [state, action, pending] = useActionState(dumpNoteAction, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-pink">
        Date
        <input
          type="date"
          name="dumpedOn"
          defaultValue={todayStamp()}
          required
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-pink">
        Dump
        <textarea
          name="rawText"
          required
          rows={12}
          placeholder={`le fromage (m), plural: fromages - cheese\naller /ale/\nje vais, tu vas, il va\nOn utilise être avec les verbes de mouvement.`}
          className="resize-y rounded-3xl border border-line bg-surface px-4 py-3 text-base leading-relaxed text-cream outline-none focus:border-pink"
        />
      </label>
      {state?.error ? <p className="text-sm text-coral">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-pink px-5 py-3 font-semibold text-canvas disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save and extract"}
      </button>
      <Surface className="px-4 py-3 text-sm leading-6 text-cream/80">
        One line per word or verb helps. Mark gender with (m) or (f), add a
        plural, and write conjugations as je / tu / il.
      </Surface>
    </form>
  );
}
