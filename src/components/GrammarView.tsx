"use client";

import { useEffect, useState } from "react";
import { listGrammar, type GrammarEntry } from "@/services/grammar";
import { PrimaryPill, ScreenHeader } from "./editorial";
import { TicketCheckIcon } from "./icons";

/**
 * Grammar — the rules extracted from notes, each a short plain-English
 * "why" with a French example. Same living-index layout as Vocabulary and
 * Verbs: numbered, hairline rules between entries, growing as notes are
 * extracted.
 */
export function GrammarView({
  userId,
  onDumpNote,
}: {
  userId: string;
  onDumpNote: () => void;
}) {
  const [entries, setEntries] = useState<GrammarEntry[]>([]);

  useEffect(() => {
    setEntries(listGrammar(userId));
  }, [userId]);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <ScreenHeader
        kicker="Rules from notes"
        title="Grammar"
        standfirst="The rules hiding in your notes, each with a short why — explained like a margin note, not a lecture."
        icon={<TicketCheckIcon strokeWidth={1.5} className="h-8 w-8" />}
      />

      {entries.length === 0 ? (
        <div className="mt-10 rounded-card border border-edge bg-surface p-7 sm:p-8">
          <p className="text-lg leading-relaxed text-cream/90">
            No rules yet. Dump a note and the grammar hiding in it lands here.
          </p>
          <PrimaryPill onClick={onDumpNote} className="mt-6">
            Dump a note
          </PrimaryPill>
        </div>
      ) : (
        <ol className="mt-4">
          {entries.map((entry, i) => (
            <GrammarRow key={entry.id} entry={entry} index={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

/** One rule: 01 the rule in plain English, an italic French example, and a
 * quiet level tag when the extractor knew it. */
function GrammarRow({ entry, index }: { entry: GrammarEntry; index: number }) {
  return (
    <li className="hairline flex gap-4 border-b py-6 sm:gap-5">
      <span className="mono-label pt-1 text-[0.72rem] text-pink-hot">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[1.05rem] leading-relaxed text-cream">
          {entry.rule}
        </p>
        {entry.example && (
          <p className="mt-2.5 text-[0.98rem] italic leading-relaxed text-quote">
            {entry.example}
          </p>
        )}
        {entry.level && (
          <p className="mono-label mt-3 text-[0.66rem] text-cream-dim">
            {entry.level}
          </p>
        )}
      </div>
    </li>
  );
}
