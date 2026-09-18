/**
 * Vocabulary service — the words extracted from notes.
 *
 * Storage is localStorage for now, keyed per Clerk user (same pattern as
 * notes.ts), so swapping in a database later means changing this file only.
 * The library is cumulative: extraction merges new words in, reinforcing
 * repeats instead of duplicating or wiping anything.
 */

export type VocabGender = "m" | "f" | null;

export type VocabEntry = {
  id: string;
  /** The word as it appears in the index, e.g. "boulangerie". */
  headword: string;
  gender: VocabGender;
  /** English meaning, e.g. "bakery". */
  meaning: string;
  /** Sound-it-out phonetic, e.g. "boo-lonzh-REE". */
  phonetic: string;
  /** Example sentences lifted from (or built around) the user's notes. */
  examples: string[];
  /** Singular/plural and masculine/feminine variations where they exist. */
  forms: {
    singular: string | null;
    plural: string | null;
    masculine: string | null;
    feminine: string | null;
  };
};

/** What the extractor hands us for one word (no id yet). */
export type IncomingVocab = Omit<VocabEntry, "id">;

const MAX_EXAMPLES = 4;

function storageKey(userId: string): string {
  return `french-retention.vocab.v1.${userId}`;
}

function readAll(userId: string): VocabEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is VocabEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.headword === "string" &&
        typeof e.meaning === "string"
    );
  } catch {
    return [];
  }
}

function writeAll(userId: string, entries: VocabEntry[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalize(word: string): string {
  return word.trim().toLowerCase();
}

/** Alphabetical, the way a book index reads. */
export function listVocabulary(userId: string): VocabEntry[] {
  return [...readAll(userId)].sort((a, b) =>
    a.headword.localeCompare(b.headword, "fr")
  );
}

/**
 * Merge freshly extracted words into the library. Repeats reinforce the
 * existing entry (fill missing gender/forms, add new examples) instead of
 * duplicating it. Returns how many entries are new.
 */
export function mergeVocabulary(
  userId: string,
  incoming: IncomingVocab[]
): number {
  const entries = readAll(userId);
  const byWord = new Map(entries.map((e) => [normalize(e.headword), e]));
  let added = 0;

  for (const item of incoming) {
    const headword = item.headword.trim();
    if (!headword) continue;
    const existing = byWord.get(normalize(headword));
    if (!existing) {
      const entry: VocabEntry = {
        id: newId(),
        headword,
        gender: item.gender,
        meaning: item.meaning.trim(),
        phonetic: item.phonetic.trim(),
        examples: item.examples.slice(0, MAX_EXAMPLES),
        forms: { ...item.forms },
      };
      entries.push(entry);
      byWord.set(normalize(headword), entry);
      added += 1;
      continue;
    }
    existing.gender = existing.gender ?? item.gender;
    if (!existing.meaning.trim()) existing.meaning = item.meaning.trim();
    if (!existing.phonetic.trim()) existing.phonetic = item.phonetic.trim();
    existing.forms.singular = existing.forms.singular ?? item.forms.singular;
    existing.forms.plural = existing.forms.plural ?? item.forms.plural;
    existing.forms.masculine = existing.forms.masculine ?? item.forms.masculine;
    existing.forms.feminine = existing.forms.feminine ?? item.forms.feminine;
    for (const example of item.examples) {
      if (existing.examples.length >= MAX_EXAMPLES) break;
      if (!existing.examples.includes(example)) existing.examples.push(example);
    }
  }

  writeAll(userId, entries);
  return added;
}
