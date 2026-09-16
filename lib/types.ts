export type Gender = "m" | "f" | null;

export type Note = {
  id: string;
  dumpedOn: string;
  rawText: string;
  correctedText: string | null;
  correctionWhy: string | null;
  createdAt: string;
};

export type Vocab = {
  id: string;
  noteId: string;
  term: string;
  gender: Gender;
  plural: string | null;
  meaning: string | null;
  createdAt: string;
};

export type Verb = {
  id: string;
  noteId: string;
  infinitive: string;
  phonetics: string | null;
  conjugations: Record<string, string>;
  createdAt: string;
};

export type Grammar = {
  id: string;
  noteId: string;
  title: string;
  explanation: string;
  example: string | null;
  createdAt: string;
};

export type SrsKind = "vocab" | "verb" | "grammar";

export type SrsCard = {
  id: string;
  kind: SrsKind;
  itemId: string;
  prompt: string;
  answer: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
  createdAt: string;
};

export type Settings = {
  email: string | null;
  windowStartHour: number;
  windowEndHour: number;
  timezone: string;
  lastEmailSentOn: string | null;
};

export type VocabDraft = {
  term: string;
  gender: Gender;
  plural: string | null;
  meaning: string | null;
};

export type VerbDraft = {
  infinitive: string;
  phonetics: string | null;
  conjugations: Record<string, string>;
};

export type GrammarDraft = {
  title: string;
  explanation: string;
  example: string | null;
};

export type ExtractResult = {
  correctedText: string;
  correctionWhy: string;
  vocab: VocabDraft[];
  verbs: VerbDraft[];
  grammar: GrammarDraft[];
};

export type QuizCard = Pick<SrsCard, "id" | "kind" | "prompt" | "answer">;
