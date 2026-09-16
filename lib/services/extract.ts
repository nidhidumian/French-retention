import type { ExtractResult, Gender, GrammarDraft, VerbDraft, VocabDraft } from "@/lib/types";

const ARTICLE_GENDER: Record<string, Gender> = {
  le: "m",
  un: "m",
  du: "m",
  la: "f",
  une: "f",
};

const PRONOUNS = ["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"] as const;

const INFINITIVE_RE = /^[a-zàâäéèêëïîôùûüçœæ'-]+(er|ir|re)$/i;
const KNOWN_IRREGULARS = new Set([
  "être",
  "etre",
  "avoir",
  "aller",
  "faire",
  "dire",
  "voir",
  "savoir",
  "pouvoir",
  "vouloir",
  "venir",
  "tenir",
  "prendre",
  "mettre",
  "boire",
  "croire",
  "lire",
  "écrire",
  "ecrire",
  "ouvrir",
  "devoir",
  "falloir",
  "pleuvoir",
]);

function stripPhonetics(line: string): { text: string; phonetics: string | null } {
  const slash = line.match(/\s\/([^/]+)\/\s*$/);
  if (slash) {
    return { text: line.replace(slash[0], "").trim(), phonetics: slash[1].trim() };
  }
  const bracket = line.match(/\s\[([^\]]+)\]\s*$/);
  if (bracket) {
    return { text: line.replace(bracket[0], "").trim(), phonetics: bracket[1].trim() };
  }
  return { text: line, phonetics: null };
}

function splitGloss(line: string): { head: string; meaning: string | null } {
  const parts = line.split(/\s+[-–—:]\s+/);
  if (parts.length >= 2) {
    return { head: parts[0].trim(), meaning: parts.slice(1).join(" - ").trim() || null };
  }
  return { head: line.trim(), meaning: null };
}

function parseGenderMarker(text: string): { rest: string; gender: Gender } {
  const match = text.match(/\(([mf])\)/i);
  if (!match) return { rest: text, gender: null };
  return {
    rest: text.replace(match[0], " ").replace(/\s+/g, " ").trim(),
    gender: match[1].toLowerCase() as "m" | "f",
  };
}

function parsePlural(text: string): { rest: string; plural: string | null } {
  const match = text.match(/,?\s*(?:plural|pluriel|pl)\s*[.:]?\s*([a-zàâäéèêëïîôùûüçœæ'-]+)/i);
  if (!match) return { rest: text, plural: null };
  return {
    rest: text.replace(match[0], " ").replace(/\s+/g, " ").trim(),
    plural: match[1],
  };
}

function firstWord(text: string): string {
  return text.split(/\s+/)[0] ?? "";
}

function looksLikeInfinitive(word: string): boolean {
  const lower = word.toLowerCase();
  return KNOWN_IRREGULARS.has(lower) || INFINITIVE_RE.test(lower);
}

function parseConjugations(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chunk of text.split(/[,;]+/)) {
    const bit = chunk.trim();
    if (!bit) continue;
    const match = bit.match(/^(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s+(.+)$/i);
    if (match) {
      const pronoun = match[1].toLowerCase().replace(/'$/, "'");
      out[pronoun] = match[2].trim();
    }
  }
  return out;
}

function hasPronounForms(text: string): boolean {
  return /(^|[\s,;])(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s+\S+/i.test(text);
}

function isConjugationContinuation(line: string): boolean {
  const forms = parseConjugations(line);
  const count = Object.keys(forms).length;
  if (count >= 2) return true;
  if (count === 1 && line.split(/\s+/).length <= 6) return true;
  return false;
}

function parseVocabLine(line: string): VocabDraft | null {
  const { rest: withoutGender, gender: markedGender } = parseGenderMarker(line);
  const { rest: withoutPlural, plural } = parsePlural(withoutGender);
  const { head, meaning } = splitGloss(withoutPlural);

  const articleMatch = head.match(
    /^(le|la|l'|l’|les|un|une|des|du|de la)\s+(.+)$/i,
  );
  let termSource = head;
  let articleGender: Gender = null;
  if (articleMatch) {
    const article = articleMatch[1].toLowerCase().replace("l’", "l'");
    termSource = articleMatch[2];
    articleGender = ARTICLE_GENDER[article] ?? null;
  }

  const term = firstWord(termSource).replace(/[.,;:]+$/, "");
  if (!term || term.length < 2) return null;
  if (looksLikeInfinitive(term) && hasPronounForms(line)) return null;
  if (PRONOUNS.includes(term.toLowerCase() as (typeof PRONOUNS)[number])) return null;

  const wordCount = head.split(/\s+/).filter(Boolean).length;
  const hasVocabCue = Boolean(markedGender || plural || meaning || articleMatch);
  if (!hasVocabCue) return null;
  if (wordCount > 8 && !markedGender) return null;

  return {
    term: term.toLowerCase(),
    gender: markedGender ?? articleGender,
    plural: plural ? plural.toLowerCase() : null,
    meaning,
  };
}

function parseVerbLine(line: string): VerbDraft | null {
  const { text, phonetics } = stripPhonetics(line);
  const { head, meaning } = splitGloss(text);
  const conjugations = parseConjugations(text);
  const candidate = firstWord(head).replace(/[.,;:]+$/, "");
  if (!candidate) return null;

  const isVerb = looksLikeInfinitive(candidate) || Object.keys(conjugations).length >= 2;
  if (!isVerb) return null;
  if (!looksLikeInfinitive(candidate) && Object.keys(conjugations).length < 2) return null;

  if (meaning && Object.keys(conjugations).length === 0 && !looksLikeInfinitive(candidate)) {
    return null;
  }

  return {
    infinitive: candidate.toLowerCase(),
    phonetics,
    conjugations,
  };
}

function parseGrammarLine(line: string): GrammarDraft | null {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 5) return null;
  const title = words.slice(0, 8).join(" ");
  return {
    title: title.replace(/[.,;:]+$/, ""),
    explanation: line,
    example: null,
  };
}

function uniqueVocab(items: VocabDraft[]): VocabDraft[] {
  const seen = new Set<string>();
  const out: VocabDraft[] = [];
  for (const item of items) {
    const key = item.term;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function uniqueVerbs(items: VerbDraft[]): VerbDraft[] {
  const seen = new Set<string>();
  const out: VerbDraft[] = [];
  for (const item of items) {
    if (seen.has(item.infinitive)) continue;
    seen.add(item.infinitive);
    out.push(item);
  }
  return out;
}

export function extractFromNote(rawText: string): ExtractResult {
  const correctedText = rawText.replace(/\r\n/g, "\n").trim();
  const vocab: VocabDraft[] = [];
  const verbs: VerbDraft[] = [];
  const grammar: GrammarDraft[] = [];
  let lastVocab: VocabDraft | null = null;
  let lastVerb: VerbDraft | null = null;

  for (const rawLine of correctedText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const pluralOnly = line.match(/^(?:plural|pluriel|pl)\s*[.:]?\s*([a-zàâäéèêëïîôùûüçœæ'-]+)$/i);
    if (pluralOnly && lastVocab) {
      lastVocab.plural = pluralOnly[1].toLowerCase();
      continue;
    }

    if (lastVerb && isConjugationContinuation(line) && !looksLikeInfinitive(firstWord(line))) {
      lastVerb.conjugations = { ...lastVerb.conjugations, ...parseConjugations(line) };
      continue;
    }

    const verb = parseVerbLine(line);
    if (verb) {
      verbs.push(verb);
      lastVerb = verb;
      lastVocab = null;
      continue;
    }

    const word = parseVocabLine(line);
    if (word) {
      vocab.push(word);
      lastVocab = word;
      lastVerb = null;
      continue;
    }

    const rule = parseGrammarLine(line);
    if (rule) {
      grammar.push(rule);
      lastVocab = null;
      lastVerb = null;
    }
  }

  if (grammar.length === 0) {
    const leftover = correctedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 40);
    if (leftover[0]) {
      grammar.push({
        title: leftover[0].slice(0, 48),
        explanation: leftover[0],
        example: null,
      });
    }
  }

  return {
    correctedText,
    correctionWhy:
      "Kept your wording. Open the note to fix a form and add a short why.",
    vocab: uniqueVocab(vocab),
    verbs: uniqueVerbs(verbs),
    grammar,
  };
}

export function formatConjugations(conjugations: Record<string, string>): string {
  const order = ["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
  const bits = order
    .filter((key) => conjugations[key])
    .map((key) => `${key} ${conjugations[key]}`);
  const extras = Object.entries(conjugations)
    .filter(([key]) => !order.includes(key))
    .map(([key, value]) => `${key} ${value}`);
  return [...bits, ...extras].join(", ");
}

export function vocabPrompt(item: VocabDraft): string {
  if (item.meaning) return item.meaning;
  const extra = [item.gender ? `(${item.gender})` : null, item.plural ? `plural ${item.plural}` : null]
    .filter(Boolean)
    .join(" · ");
  return extra ? `Recall: ${item.term} ${extra}` : `Recall: ${item.term}`;
}

export function vocabAnswer(item: VocabDraft): string {
  const gender = item.gender ? ` (${item.gender})` : "";
  const plural = item.plural ? `, plural ${item.plural}` : "";
  const meaning = item.meaning ? `: ${item.meaning}` : "";
  return `${item.term}${gender}${plural}${meaning}`;
}

export function verbPrompt(item: VerbDraft): string {
  const phonetics = item.phonetics ? ` /${item.phonetics}/` : "";
  return `Conjugate ${item.infinitive}${phonetics}`;
}

export function verbAnswer(item: VerbDraft): string {
  const forms = formatConjugations(item.conjugations);
  return forms ? `${item.infinitive}: ${forms}` : item.infinitive;
}

export function grammarPrompt(item: GrammarDraft): string {
  return item.title;
}

export function grammarAnswer(item: GrammarDraft): string {
  return item.example ? `${item.explanation}\n${item.example}` : item.explanation;
}
