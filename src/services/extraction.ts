import type { CefrLevel, ConjugationStage } from "./onboarding";
import {
  setNoteExtraction,
  type Correction,
  type Note,
  type NoteExtraction,
} from "./notes";
import { mergeVocabulary, type VocabGender } from "./vocabulary";
import { mergeVerbs } from "./verbs";
import { mergeGrammar } from "./grammar";

/**
 * Extraction service — turns one dumped note into corrections plus new
 * vocabulary, verb and grammar entries.
 *
 * The LLM call lives server-side in /api/extract (the OpenAI key never
 * reaches the browser). This module owns the client half: call the API,
 * merge the results into the per-user libraries, and stamp the note with
 * its correction receipt.
 */

/** What /api/extract returns on success. Kept flat and JSON-friendly so the
 * route and this client stay in lockstep. */
export type ExtractApiResponse = {
  correctedText: string;
  corrections: Correction[];
  encouragement: string | null;
  /** Which conjugation stage the verbs were conjugated at (from the user's
   * stored level/stage; A2+ get present tense = stage 1). */
  stage: ConjugationStage;
  vocabulary: {
    headword: string;
    meaning: string;
    gender: VocabGender;
    phonetic: string;
    singular: string | null;
    plural: string | null;
    masculine: string | null;
    feminine: string | null;
    examples: { french: string; english: string | null }[];
  }[];
  verbs: {
    infinitive: string;
    meaning: string;
    /** Six forms: je, tu, il·elle·on, nous, vous, ils·elles. */
    forms: string[];
  }[];
  grammar: {
    topic: string;
    rule: string;
    example: string | null;
    level: CefrLevel | null;
  }[];
};

export type ExtractOutcome =
  | { ok: true; extraction: NoteExtraction }
  | { ok: false; error: string; missingKey: boolean };

/**
 * Correct + extract one note. On success the libraries are already merged
 * and the note carries its extraction receipt; the caller only needs to
 * re-read state and render.
 */
export async function extractNote(
  userId: string,
  note: Note
): Promise<ExtractOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: note.text }),
    });
  } catch {
    return {
      ok: false,
      error: "Could not reach the extraction service. Check your connection and try again.",
      missingKey: false,
    };
  }

  if (!response.ok) {
    let code: string | null = null;
    let message: string | null = null;
    try {
      const body = await response.json();
      if (typeof body?.code === "string") code = body.code;
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // Non-JSON error body; fall through to the generic message.
    }
    return {
      ok: false,
      error: message ?? "Extraction failed. Please try again.",
      missingKey: code === "missing-key",
    };
  }

  let data: ExtractApiResponse;
  try {
    data = (await response.json()) as ExtractApiResponse;
  } catch {
    // e.g. an expired session bounced the request to an HTML page.
    return {
      ok: false,
      error: "Extraction returned something unexpected. Refresh and try again.",
      missingKey: false,
    };
  }

  mergeVocabulary(
    userId,
    data.vocabulary.map((v) => ({
      headword: v.headword,
      meaning: v.meaning,
      gender: v.gender,
      phonetic: v.phonetic,
      examples: v.examples.map((e) =>
        e.english ? `${e.french} — ${e.english}` : e.french
      ),
      forms: {
        singular: v.singular,
        plural: v.plural,
        masculine: v.masculine,
        feminine: v.feminine,
      },
    }))
  );

  mergeVerbs(
    userId,
    data.verbs.map((v) => ({
      infinitive: v.infinitive,
      meaning: v.meaning,
      stage: data.stage,
      forms: v.forms,
    }))
  );

  mergeGrammar(userId, data.grammar);

  const extraction: NoteExtraction = {
    correctedText: data.correctedText,
    corrections: data.corrections,
    encouragement: data.encouragement,
    extractedAt: new Date().toISOString(),
    // Counts are what the note contained (repeats reinforce the libraries
    // rather than duplicating, so "added" alone would under-report).
    counts: {
      words: data.vocabulary.length,
      verbs: data.verbs.length,
      rules: data.grammar.length,
    },
  };
  setNoteExtraction(userId, note.id, extraction);

  return { ok: true, extraction };
}
