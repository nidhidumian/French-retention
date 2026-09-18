import type { ConjugationStage } from "./onboarding";

/**
 * Verbs service — the verbs extracted from notes with per-pronoun
 * conjugations. Extraction ships in a later slice; today this returns an
 * empty list so the Verbs screen renders its index layout with an empty
 * state. Conjugations are stored per stage so the screen can respect the
 * user's A1 conjugation stage (1 present / 2 passé composé / 3 future).
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

export function listVerbs(_userId: string): VerbEntry[] {
  return [];
}
