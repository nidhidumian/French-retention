/**
 * Onboarding profile — the two choices Nidhi makes on first sign-up.
 * Stored on the Clerk user's publicMetadata (see app/onboarding/actions.ts),
 * so it follows her across devices without a database of our own yet.
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type ConjugationStage = 1 | 2 | 3;

export type FrenchProfile = {
  cefrLevel: CefrLevel;
  /** Only meaningful at A1; null for A2 and up. */
  conjugationStage: ConjugationStage | null;
};

export const CEFR_LEVELS: {
  id: CefrLevel;
  name: string;
  blurb: string;
}[] = [
  {
    id: "A1",
    name: "Débutant",
    blurb: "First words, first phrases. You order the croissant carefully.",
  },
  {
    id: "A2",
    name: "Survivor",
    blurb: "Everyday errands work. Small talk survives, mostly.",
  },
  {
    id: "B1",
    name: "Conversational",
    blurb: "You hold a real conversation and only sometimes stall.",
  },
  {
    id: "B2",
    name: "Confident",
    blurb: "Films, arguments, long dinners — you keep up.",
  },
  {
    id: "C1",
    name: "Fluent-ish",
    blurb: "Nuance, jokes, the subjunctive on purpose.",
  },
];

export const CONJUGATION_STAGES: {
  id: ConjugationStage;
  name: string;
  blurb: string;
}[] = [
  { id: 1, name: "Present", blurb: "je parle, tu parles, nous parlons…" },
  { id: 2, name: "Past (passé composé)", blurb: "j'ai parlé, tu as parlé…" },
  { id: 3, name: "Future", blurb: "je parlerai, tu parleras…" },
];

export function isCefrLevel(value: unknown): value is CefrLevel {
  return CEFR_LEVELS.some((l) => l.id === value);
}

export function isConjugationStage(value: unknown): value is ConjugationStage {
  return CONJUGATION_STAGES.some((s) => s.id === value);
}

/**
 * Read the profile back out of Clerk publicMetadata, tolerating missing or
 * malformed values (e.g. a user created before this slice shipped).
 */
export function profileFromMetadata(
  metadata: Record<string, unknown> | undefined | null
): FrenchProfile | null {
  if (!metadata || metadata.onboardingComplete !== true) return null;
  if (!isCefrLevel(metadata.cefrLevel)) return null;
  const stage = metadata.conjugationStage;
  return {
    cefrLevel: metadata.cefrLevel,
    conjugationStage: isConjugationStage(stage) ? stage : null,
  };
}
