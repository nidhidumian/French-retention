"use client";

import { useActionState } from "react";
import { updateCorrectionAction } from "@/app/actions/notes";
import type { Note } from "@/lib/types";

export function CorrectionForm({ note }: { note: Note }) {
  const [state, action, pending] = useActionState(updateCorrectionAction, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={note.id} />
      <label className="flex flex-col gap-2 text-sm text-pink">
        Corrected
        <textarea
          name="correctedText"
          defaultValue={note.correctedText ?? note.rawText}
          rows={5}
          className="rounded-2xl border border-line bg-canvas px-3 py-2 text-cream outline-none focus:border-pink"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-pink">
        Short why
        <input
          name="correctionWhy"
          defaultValue={note.correctionWhy ?? ""}
          className="rounded-2xl border border-line bg-canvas px-3 py-2 text-cream outline-none focus:border-pink"
        />
      </label>
      {state?.error ? <p className="text-sm text-coral">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-line px-4 py-2 text-sm text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save correction"}
      </button>
    </form>
  );
}
