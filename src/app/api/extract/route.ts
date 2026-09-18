import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkConfigured } from "@/services/clerkConfig";
import {
  isCefrLevel,
  profileFromMetadata,
  type CefrLevel,
  type ConjugationStage,
} from "@/services/onboarding";
import type { ExtractApiResponse } from "@/services/extraction";

/**
 * POST /api/extract — correct one French note and extract vocabulary,
 * verbs and grammar from it. Server-side only: the Gemini key never
 * reaches the browser, and only a signed-in Clerk user can call this.
 *
 * The user's CEFR level and A1 conjugation stage come from Clerk
 * publicMetadata (set during onboarding) and steer which tense the verbs
 * are conjugated in.
 */

// The model call can take a while on long notes; allow up to a minute on Vercel.
export const maxDuration = 60;

const MAX_NOTE_LENGTH = 6000;

const STAGE_TENSE: Record<ConjugationStage, string> = {
  1: "the present tense (le présent)",
  2: "the passé composé",
  3: "the simple future (le futur simple)",
};

export async function POST(req: Request) {
  if (!clerkConfigured()) {
    return NextResponse.json(
      { error: "Accounts are not set up yet." },
      { status: 401 }
    );
  }
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to extract notes." },
      { status: 401 }
    );
  }

  // GOOGLE_GENERATIVE_AI_API_KEY is the Vercel AI SDK's spelling; accept
  // both so a key added under either name works.
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        code: "missing-key",
        error:
          "Extraction needs a Google Gemini key. Add GEMINI_API_KEY in Vercel (Project → Settings → Environment Variables) or .env.local, then redeploy or restart. Free keys: aistudio.google.com.",
      },
      { status: 503 }
    );
  }

  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    text = "";
  }
  if (!text) {
    return NextResponse.json({ error: "The note is empty." }, { status: 400 });
  }
  if (text.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      { error: "That note is too long to extract in one go. Split it up." },
      { status: 400 }
    );
  }

  // Onboarding stores the profile in publicMetadata; a missing profile
  // (older account) falls back to the gentlest setting.
  const profile = profileFromMetadata(user.publicMetadata);
  const level: CefrLevel = profile?.cefrLevel ?? "A1";
  const stage: ConjugationStage =
    level === "A1" ? profile?.conjugationStage ?? 1 : 1;

  let raw: unknown;
  try {
    raw = await callGemini(apiKey, text, level, stage);
  } catch (error) {
    // Log the full (secret-free) upstream error so Vercel Function logs show
    // exactly what Gemini said, and pass a short sanitized detail to the UI
    // so a hiccup is diagnosable without leaking the key or the note.
    console.error("[extract] Gemini call failed:", error);
    const detail =
      error instanceof UpstreamError ? error.safeDetail : null;
    return NextResponse.json(
      {
        error: "The extraction service had a hiccup. Please try again.",
        detail,
      },
      { status: 502 }
    );
  }

  const result = normalizeModelOutput(raw, text, stage);
  if (!result) {
    console.error("[extract] Model returned an unusable shape:", raw);
    return NextResponse.json(
      { error: "The extraction came back malformed. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}

/** Redact anything that looks like a Google API key ("AIza…") so upstream
 * error text is safe to log and to show to the user. */
function redactSecrets(text: string): string {
  return text.replace(/AIza[0-9A-Za-z_-]{10,}/g, "AIza[redacted]");
}

/** A Gemini-side failure carrying a short, secret-free summary that the
 * route may safely include in its JSON error response. */
class UpstreamError extends Error {
  readonly safeDetail: string;
  /** HTTP status Gemini answered with, when the failure was an HTTP error. */
  readonly status: number | null;

  constructor(message: string, safeDetail: string, status: number | null = null) {
    super(redactSecrets(message));
    this.name = "UpstreamError";
    this.safeDetail = redactSecrets(safeDetail);
    this.status = status;
  }
}

// Default must be a current stable model that supports generateContent with
// responseJsonSchema structured output; override with GEMINI_MODEL.
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Google's moving alias for the current stable Flash model. Used as a
// one-shot fallback when the configured model 404s (retired or renamed),
// so extraction keeps working without waiting for a code change.
const FALLBACK_GEMINI_MODEL = "gemini-flash-latest";

async function callGemini(
  apiKey: string,
  noteText: string,
  level: CefrLevel,
  stage: ConjugationStage
): Promise<unknown> {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  try {
    return await requestGemini(apiKey, model, noteText, level, stage);
  } catch (error) {
    if (
      error instanceof UpstreamError &&
      error.status === 404 &&
      model !== FALLBACK_GEMINI_MODEL
    ) {
      console.warn(
        `[extract] Model "${model}" not found (404); retrying with "${FALLBACK_GEMINI_MODEL}".`
      );
      return await requestGemini(
        apiKey,
        FALLBACK_GEMINI_MODEL,
        noteText,
        level,
        stage
      );
    }
    throw error;
  }
}

async function requestGemini(
  apiKey: string,
  model: string,
  noteText: string,
  level: CefrLevel,
  stage: ConjugationStage
): Promise<unknown> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt(level, stage) }],
        },
        contents: [{ parts: [{ text: noteText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    // Error bodies look like { error: { code, message, status } }; pull the
    // message out for a readable one-liner, keeping the raw body for logs.
    let upstreamMessage = "";
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed?.error?.message === "string") {
        upstreamMessage = parsed.error.message;
      }
    } catch {
      // Non-JSON body; the raw text goes to the logs below.
    }
    throw new UpstreamError(
      `Gemini ${response.status} for model "${model}": ${body.slice(0, 1000)}`,
      `Gemini returned ${response.status}${
        upstreamMessage ? `: ${upstreamMessage.slice(0, 300)}` : ""
      }` +
        (response.status === 404
          ? ` (model "${model}" — check GEMINI_MODEL)`
          : ""),
      response.status
    );
  }
  const payload = await response.json();
  if (payload?.promptFeedback?.blockReason) {
    const reason = String(payload.promptFeedback.blockReason);
    throw new UpstreamError(
      `Model blocked the prompt: ${reason}`,
      `The model blocked this note (${reason}).`
    );
  }
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new UpstreamError(
      `No content in Gemini response: ${JSON.stringify(payload).slice(0, 1000)}`,
      "The model returned an empty response."
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new UpstreamError(
      `Gemini returned non-JSON text: ${text.slice(0, 1000)}`,
      "The model returned malformed JSON."
    );
  }
}

function systemPrompt(level: CefrLevel, stage: ConjugationStage): string {
  const stageNote =
    level === "A1"
      ? ` They are at conjugation stage ${stage}, so conjugate verbs in ${STAGE_TENSE[stage]}.`
      : ` Conjugate verbs in ${STAGE_TENSE[1]} (present-tense-first).`;

  return `You are the extraction engine of a personal French retention app. The user dumps informal French study notes (often mixing French and English). The user's French level is CEFR ${level}.${stageNote} All explanations must be in simple, friendly English a beginner can follow. Never scold.

Do four things with the note:

1. CORRECT. Produce "correctedText": the note with every French mistake fixed — spelling, accents, gender, agreement, conjugation, word order, missing words, anything wrong. Keep the user's own wording, structure and line breaks; change only what is wrong, and leave English parts untouched. For each fix add one item to "corrections" with the original snippet, the corrected snippet, and "why": one short plain-English sentence explaining the fix. If nothing is wrong, return the note unchanged and an empty corrections list.

2. VOCABULARY. Extract the French nouns, adjectives, adverbs and fixed expressions worth remembering (verbs go in the verbs list instead). For each: "headword" (dictionary form, lowercase unless a proper noun); "meaning" (short English); "gender" ("m" or "f" for nouns, null otherwise); "phonetic" (sound-it-out for an English speaker, like "boo-lonzh-REE" — not IPA); "singular" and "plural" forms with articles where they exist (null when not applicable); "masculine" and "feminine" forms where the word varies (null otherwise); and "examples": 1–2 short French sentences using the word — taken from the corrected note when possible — each with "english": a short English gloss (null only if a gloss is impossible).

3. VERBS. Extract every French verb the note uses or mentions. For each: "infinitive" (capitalised, e.g. "Parler"), "meaning" (e.g. "to talk"), and "forms": exactly six conjugated forms in the tense given above, in this exact order: je, tu, il/elle/on, nous, vous, ils/elles. Include the pronoun in each form (use j' where French elides), e.g. "je parle".

4. GRAMMAR. Extract the grammar rules the note touches, as short plain-English rules. For each: "topic" — a stable kebab-case slug for deduplication (e.g. "gender-of-nouns", "passe-compose-with-avoir"); "rule" — one or two short sentences a beginner can follow; "example" — one French example, from the corrected note when possible (null if none fits); "level" — the CEFR level of the rule ("A1" to "C1", null if unsure).

Set "encouragement" to null normally. If the note touches material above the user's level, still extract everything and set "encouragement" to one warm sentence, e.g. "Nice — you're also touching a bit of A2 here." Never block or scold.

Extract only what the note actually contains. If the note has no French at all, return it unchanged with empty lists.`;
}

/**
 * Structured-output JSON Schema for Gemini's responseJsonSchema (every
 * property required, additionalProperties false, null allowed via type
 * arrays). Enums and array lengths are re-checked in normalizeModelOutput
 * rather than encoded here, since the models support only a schema subset
 * and silently ignore what they don't.
 */
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    correctedText: { type: "string" },
    corrections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          original: { type: "string" },
          corrected: { type: "string" },
          why: { type: "string" },
        },
        required: ["original", "corrected", "why"],
      },
    },
    encouragement: { type: ["string", "null"] },
    vocabulary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          headword: { type: "string" },
          meaning: { type: "string" },
          gender: { type: ["string", "null"], description: '"m", "f", or null' },
          phonetic: { type: "string" },
          singular: { type: ["string", "null"] },
          plural: { type: ["string", "null"] },
          masculine: { type: ["string", "null"] },
          feminine: { type: ["string", "null"] },
          examples: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                french: { type: "string" },
                english: { type: ["string", "null"] },
              },
              required: ["french", "english"],
            },
          },
        },
        required: [
          "headword",
          "meaning",
          "gender",
          "phonetic",
          "singular",
          "plural",
          "masculine",
          "feminine",
          "examples",
        ],
      },
    },
    verbs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          infinitive: { type: "string" },
          meaning: { type: "string" },
          forms: {
            type: "array",
            items: { type: "string" },
            description:
              "Exactly six forms in order: je, tu, il/elle/on, nous, vous, ils/elles",
          },
        },
        required: ["infinitive", "meaning", "forms"],
      },
    },
    grammar: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          topic: { type: "string" },
          rule: { type: "string" },
          example: { type: ["string", "null"] },
          level: { type: ["string", "null"] },
        },
        required: ["topic", "rule", "example", "level"],
      },
    },
  },
  required: [
    "correctedText",
    "corrections",
    "encouragement",
    "vocabulary",
    "verbs",
    "grammar",
  ],
} as const;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown): string | null {
  const s = asString(value);
  return s ? s : null;
}

/**
 * Turn whatever the model produced into a guaranteed ExtractApiResponse,
 * or null when the top-level shape is beyond saving. Individual malformed
 * list items are dropped rather than failing the whole extraction.
 */
function normalizeModelOutput(
  raw: unknown,
  originalText: string,
  stage: ConjugationStage
): ExtractApiResponse | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;

  const correctedText = asString(o.correctedText) || originalText;

  const corrections = (Array.isArray(o.corrections) ? o.corrections : [])
    .map((c: unknown) => {
      const item = c as Record<string, unknown>;
      return {
        original: asString(item?.original),
        corrected: asString(item?.corrected),
        why: asString(item?.why),
      };
    })
    .filter((c) => c.original && c.corrected && c.why);

  const vocabulary = (Array.isArray(o.vocabulary) ? o.vocabulary : [])
    .map((v: unknown) => {
      const item = v as Record<string, unknown>;
      const gender = asString(item?.gender).toLowerCase();
      return {
        headword: asString(item?.headword),
        meaning: asString(item?.meaning),
        gender: gender === "m" || gender === "f" ? (gender as "m" | "f") : null,
        phonetic: asString(item?.phonetic),
        singular: asNullableString(item?.singular),
        plural: asNullableString(item?.plural),
        masculine: asNullableString(item?.masculine),
        feminine: asNullableString(item?.feminine),
        examples: (Array.isArray(item?.examples) ? item.examples : [])
          .map((e: unknown) => {
            const ex = e as Record<string, unknown>;
            return {
              french: asString(ex?.french),
              english: asNullableString(ex?.english),
            };
          })
          .filter((e) => e.french),
      };
    })
    .filter((v) => v.headword && v.meaning);

  const verbs = (Array.isArray(o.verbs) ? o.verbs : [])
    .map((v: unknown) => {
      const item = v as Record<string, unknown>;
      return {
        infinitive: asString(item?.infinitive),
        meaning: asString(item?.meaning),
        forms: (Array.isArray(item?.forms) ? item.forms : []).map(asString),
      };
    })
    .filter(
      (v) =>
        v.infinitive && v.forms.length === 6 && v.forms.every((f) => f !== "")
    );

  const grammar = (Array.isArray(o.grammar) ? o.grammar : [])
    .map((g: unknown) => {
      const item = g as Record<string, unknown>;
      const level = asString(item?.level).toUpperCase();
      return {
        topic: asString(item?.topic).toLowerCase().replace(/\s+/g, "-"),
        rule: asString(item?.rule),
        example: asNullableString(item?.example),
        level: isCefrLevel(level) ? level : null,
      };
    })
    .filter((g) => g.topic && g.rule);

  return {
    correctedText,
    corrections,
    encouragement: asNullableString(o.encouragement),
    stage,
    vocabulary,
    verbs,
    grammar,
  };
}
