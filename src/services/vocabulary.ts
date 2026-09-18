/**
 * Vocabulary service — the words extracted from notes.
 *
 * Extraction ships in a later slice; today this returns an empty list so the
 * Vocabulary screen renders its living-index layout with an empty state.
 * The entry shape below is what the extractor will produce.
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

export function listVocabulary(_userId: string): VocabEntry[] {
  return [];
}
