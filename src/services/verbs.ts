import type { ConjugationStage } from "./onboarding";

/**
 * Verbs service — the verbs extracted from notes with per-pronoun
 * conjugations. Storage is localStorage for now, keyed per Clerk user (same
 * pattern as notes.ts), so swapping in a database later means changing this
 * file only. Conjugations are stored per stage so the screen can respect
 * the user's A1 conjugation stage (1 present / 2 passé composé / 3 future);
 * a verb seen again at a new stage gains that tense without losing the old.
 */

export const PRONOUNS = [
  "je",
  "tu",
  "il·elle·on",
  "nous",
  "vous",
  "ils·elles",
] as const;

export type Pronoun = (typeof PRONOUNS)[number];

export type VerbEntry = {
  id: string;
  /** e.g. "Parler". */
  infinitive: string;
  /** e.g. "to talk". */
  meaning: string;
  /**
   * Six forms in PRONOUNS order, keyed by stage. A user at A1 stage 1 only
   * sees stage-1 (present) forms; later stages unlock past and future.
   */
  conjugations: Partial<Record<ConjugationStage, string[]>>;
};

/** What the extractor hands us for one verb, at one stage. */
export type IncomingVerb = {
  infinitive: string;
  meaning: string;
  stage: ConjugationStage;
  /** Six forms in PRONOUNS order. */
  forms: string[];
};

function storageKey(userId: string): string {
  return `french-retention.verbs.v1.${userId}`;
}

function readAll(userId: string): VerbEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is VerbEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.infinitive === "string" &&
        typeof e.meaning === "string" &&
        typeof e.conjugations === "object" &&
        e.conjugations !== null
    );
  } catch {
    return [];
  }
}

function writeAll(userId: string, entries: VerbEntry[]): boolean {
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

function normalize(infinitive: string): string {
  return infinitive.trim().toLowerCase();
}

/** Alphabetical by infinitive. */
export function listVerbs(userId: string): VerbEntry[] {
  return [...readAll(userId)].sort((a, b) =>
    a.infinitive.localeCompare(b.infinitive, "fr")
  );
}

/**
 * Merge freshly extracted verbs into the library. A repeat verb keeps its
 * entry and gains (or refreshes) the conjugations for the extracted stage.
 * Returns how many entries are new.
 */
export function mergeVerbs(userId: string, incoming: IncomingVerb[]): number {
  const entries = readAll(userId);
  const byVerb = new Map(entries.map((e) => [normalize(e.infinitive), e]));
  let added = 0;

  for (const item of incoming) {
    const infinitive = item.infinitive.trim();
    if (!infinitive || item.forms.length !== PRONOUNS.length) continue;
    const existing = byVerb.get(normalize(infinitive));
    if (!existing) {
      const entry: VerbEntry = {
        id: newId(),
        infinitive,
        meaning: item.meaning.trim(),
        conjugations: { [item.stage]: item.forms },
      };
      entries.push(entry);
      byVerb.set(normalize(infinitive), entry);
      added += 1;
      continue;
    }
    if (!existing.meaning.trim()) existing.meaning = item.meaning.trim();
    existing.conjugations[item.stage] = item.forms;
  }

  writeAll(userId, entries);
  return added;
}
