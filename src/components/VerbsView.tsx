"use client";

import { useEffect, useState } from "react";
import { listVerbs, PRONOUNS, type VerbEntry } from "@/services/verbs";
import type { FrenchProfile } from "@/services/onboarding";
import { Kicker } from "./editorial";
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
}: {
  userId: string;
  profile: FrenchProfile;
}) {
  const [entries, setEntries] = useState<VerbEntry[]>([]);

  useEffect(() => {
    setEntries(listVerbs(userId));
  }, [userId]);

  const stage = profile.conjugationStage ?? 1;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Kicker>All verbs from notes</Kicker>
          <h1 className="mt-2 text-5xl font-bold uppercase leading-[1.05] tracking-tight text-pink sm:text-6xl">
            Verbs
          </h1>
        </div>
        <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-card border border-edge bg-surface text-pink sm:h-20 sm:w-20">
          <ScrollIcon strokeWidth={1.5} className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>
      </div>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream sm:text-xl">
        Every verb from your notes with meaning and conjugation for each
        pronoun at your level.
      </p>

      <hr className="hairline mt-9 border-t" />

      {entries.length === 0 ? (
        <div className="mt-9 rounded-card border border-edge bg-surface p-6 sm:p-7">
          <p className="text-lg italic leading-relaxed text-quote">
            No verbs yet. They&apos;ll be pulled from your notes, conjugated
            for your level.
          </p>
        </div>
      ) : (
        <ol className="mt-2">
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
    <li className="hairline flex gap-4 border-b py-6 sm:gap-5">
      <span className="mono-label pt-1 text-[0.72rem] text-pink-hot">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold tracking-tight text-pink-pale">
          {entry.infinitive}
          <span className="font-normal text-cream"> — {entry.meaning}</span>
        </p>
        <ul className="mt-3">
          {PRONOUNS.map((pronoun, i) => (
            <li
              key={pronoun}
              className="flex items-baseline gap-4 border-b border-pink-hot/25 py-2 last:border-b-0"
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
