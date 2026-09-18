"use client";

import { useEffect, useMemo, useState } from "react";
import { MoveRight } from "lucide-react";
import { listVocabulary, type VocabEntry } from "@/services/vocabulary";
import { PrimaryPill, ScreenHeader } from "./editorial";
import { BookMagnifierIcon } from "./icons";

const SEARCH_PLACEHOLDER = "Search any word";

/**
 * Vocabulary — a living index of the words extracted from notes. Today the
 * extractor hasn't shipped, so the list renders its empty state; the entry
 * layout below is the pattern real words will use.
 */
export function VocabularyView({
  userId,
  onDumpNote,
}: {
  userId: string;
  onDumpNote: () => void;
}) {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState(SEARCH_PLACEHOLDER);

  useEffect(() => {
    setEntries(listVocabulary(userId));
  }, [userId]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.headword.toLowerCase().includes(q) ||
        e.meaning.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <ScreenHeader
        kicker="Words from notes"
        title="Vocabulary"
        standfirst="Every word extracted from your notes and kept the way a book keeps an index — gender, plural, the lot."
        icon={
          <BookMagnifierIcon strokeWidth={1.5} className="h-8 w-8" />
        }
      />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setPlaceholder("")}
        onBlur={() => setPlaceholder(SEARCH_PLACEHOLDER)}
        placeholder={placeholder}
        aria-label="Search any word"
        className="mono-label mt-9 w-full rounded-2xl border border-edge bg-surface px-5 py-3.5 text-[0.78rem] text-cream placeholder:text-cream-dim/50 focus:border-pink-hot/60 focus:outline-none"
      />

      {visible.length === 0 ? (
        <div className="mt-9 rounded-card border border-edge bg-surface p-7 sm:p-8">
          <p className="text-lg leading-relaxed text-cream/90">
            {query.trim()
              ? "Nothing in the index matches that — yet."
              : "No words yet. Dump a note and the index starts building itself."}
          </p>
          {!query.trim() && (
            <PrimaryPill onClick={onDumpNote} className="mt-6">
              Dump a note
            </PrimaryPill>
          )}
        </div>
      ) : (
        <ol className="mt-4">
          {visible.map((entry, i) => (
            <VocabRow key={entry.id} entry={entry} index={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * One index entry: 01 headword (gender) — meaning, the phonetic on its own
 * quiet line, examples, then the sing/plur and m/f variations with arrows.
 */
function VocabRow({ entry, index }: { entry: VocabEntry; index: number }) {
  return (
    <li className="hairline flex gap-4 border-b py-6 sm:gap-5">
      <span className="mono-label pt-1 text-[0.72rem] text-pink-hot">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold tracking-tight text-pink-pale">
          {entry.headword}
          {entry.gender && (
            <span className="font-normal text-pink-hot"> ({entry.gender})</span>
          )}
          <span className="font-normal text-cream"> — {entry.meaning}</span>
        </p>
        <p className="mono-label mt-1.5 text-[0.68rem] text-cream-dim">
          {entry.phonetic}
        </p>
        {entry.examples.map((example) => (
          <p
            key={example}
            className="mt-2.5 text-[0.98rem] italic leading-relaxed text-quote"
          >
            {example}
          </p>
        ))}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <FormPair label="sing" from={entry.forms.singular} to={entry.forms.plural} toLabel="plur" />
          <FormPair label="m" from={entry.forms.masculine} to={entry.forms.feminine} toLabel="f" />
        </div>
      </div>
    </li>
  );
}

function FormPair({
  label,
  toLabel,
  from,
  to,
}: {
  label: string;
  toLabel: string;
  from: string | null;
  to: string | null;
}) {
  if (!from && !to) return null;
  return (
    <p className="mono-label flex items-center gap-2 text-[0.68rem] text-cream-dim">
      <span className="text-pink-hot">{label}</span>
      <span className="text-cream">{from ?? "—"}</span>
      <MoveRight strokeWidth={1.6} className="h-3.5 w-3.5 text-pink-hot" aria-hidden />
      <span className="text-pink-hot">{toLabel}</span>
      <span className="text-cream">{to ?? "—"}</span>
    </p>
  );
}
