import type { CefrLevel } from "./onboarding";

/**
 * Grammar service — short English rules drawn from the notes. Storage is
 * localStorage for now, keyed per Clerk user (same pattern as notes.ts), so
 * swapping in a database later means changing this file only. Rules are
 * cumulative and deduped by topic: seeing a rule again refreshes its wording
 * and example instead of adding a twin.
 */

export type GrammarEntry = {
  id: string;
  /** Stable kebab-case dedupe key from the extractor, e.g. "gender-of-nouns". */
  topic: string;
  /** The rule in one or two plain-English sentences. */
  rule: string;
  /** A French example, from the user's notes when possible. */
  example: string | null;
  /** CEFR level of the rule, when the extractor is confident. */
  level: CefrLevel | null;
};

/** What the extractor hands us for one rule (no id yet). */
export type IncomingGrammar = Omit<GrammarEntry, "id">;

function storageKey(userId: string): string {
  return `french-retention.grammar.v1.${userId}`;
}

function readAll(userId: string): GrammarEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GrammarEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.topic === "string" &&
        typeof e.rule === "string"
    );
  } catch {
    return [];
  }
}

function writeAll(userId: string, entries: GrammarEntry[]): boolean {
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

/** In the order the rules were first met — the notebook grows downward. */
export function listGrammar(userId: string): GrammarEntry[] {
  return readAll(userId);
}

/**
 * Merge freshly extracted rules into the library. A repeat topic keeps its
 * place and gets the newest wording and example; nothing is ever wiped.
 * Returns how many entries are new.
 */
export function mergeGrammar(
  userId: string,
  incoming: IncomingGrammar[]
): number {
  const entries = readAll(userId);
  const byTopic = new Map(entries.map((e) => [e.topic, e]));
  let added = 0;

  for (const item of incoming) {
    const topic = item.topic.trim().toLowerCase();
    if (!topic || !item.rule.trim()) continue;
    const existing = byTopic.get(topic);
    if (!existing) {
      const entry: GrammarEntry = {
        id: newId(),
        topic,
        rule: item.rule.trim(),
        example: item.example,
        level: item.level,
      };
      entries.push(entry);
      byTopic.set(topic, entry);
      added += 1;
      continue;
    }
    existing.rule = item.rule.trim();
    existing.example = item.example ?? existing.example;
    existing.level = existing.level ?? item.level;
  }

  writeAll(userId, entries);
  return added;
}
