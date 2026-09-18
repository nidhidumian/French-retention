"use client";

import { useEffect, useState } from "react";
import { listVerbs, PRONOUNS, type VerbEntry } from "@/services/verbs";
import type { FrenchProfile } from "@/services/onboarding";
import { PrimaryPill, ScreenHeader } from "./editorial";
import { ScrollIcon } from "./icons";

/**
 * Verbs — every verb from the notes with per-pronoun conjugations. The
 * extractor hasn't shipped, so the list renders its empty state; the entry
 * layout below is the pattern real verbs will use. Which tense shows is
 * driven by the user's stored conjugation stage (A1: 1 present / 2 passé
 * composé / 3 future); other levels default to present for now.
 */
export function VerbsView({
  userId,
  profile,
  onDumpNote,
}: {
  userId: string;
  profile: FrenchProfile;
  onDumpNote: () => void;
}) {
  const [entries, setEntries] = useState<VerbEntry[]>([]);

  useEffect(() => {
    setEntries(listVerbs(userId));
  }, [userId]);

  const stage = profile.conjugationStage ?? 1;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <ScreenHeader
        kicker="All verbs from notes"
        title="Verbs"
        uppercaseTitle
        standfirst="Every verb from your notes with meaning and conjugation for each pronoun at your level."
        icon={<ScrollIcon strokeWidth={1.5} className="h-8 w-8" />}
      />

      {entries.length === 0 ? (
        <div className="mt-10 rounded-card border border-edge bg-surface p-7 sm:p-8">
          <p className="text-lg leading-relaxed text-cream/90">
            No verbs yet. They&apos;ll be pulled from your notes, conjugated
            for your level.
          </p>
          <PrimaryPill onClick={onDumpNote} className="mt-6">
            Dump a note
          </PrimaryPill>
        </div>
      ) : (
        <ol className="mt-4">
          {entries.map((entry, i) => (
            <VerbRow key={entry.id} entry={entry} index={i} stage={stage} />
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * One verb entry: 01 Parler — to talk, then a pronoun-by-pronoun table
 * (je / tu / il·elle·on / nous / vous / ils·elles) with pink hairline rules
 * between the rows.
 */
function VerbRow({
  entry,
  index,
  stage,
}: {
  entry: VerbEntry;
  index: number;
  stage: 1 | 2 | 3;
}) {
  const forms = entry.conjugations[stage] ?? entry.conjugations[1] ?? [];
  return (
    <li className="hairline flex gap-4 border-b py-7 sm:gap-5">
      <span className="mono-label pt-1 text-[0.72rem] text-pink-hot">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold tracking-tight text-pink-pale">
          {entry.infinitive}
          <span className="font-normal text-cream"> — {entry.meaning}</span>
        </p>
        <ul className="mt-4">
          {PRONOUNS.map((pronoun, i) => (
            <li
              key={pronoun}
              className="flex items-baseline gap-4 border-b border-pink-hot/25 py-2.5 last:border-b-0"
            >
              <span className="mono-label w-24 shrink-0 text-[0.68rem] text-pink-hot">
                {pronoun}
              </span>
              <span className="text-[0.98rem] leading-relaxed text-cream">
                {forms[i] ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
