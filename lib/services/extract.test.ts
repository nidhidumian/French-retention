import { describe, expect, it } from "vitest";
import { extractFromNote, vocabAnswer } from "@/lib/services/extract";

const SAMPLE = `le fromage (m), plural: fromages - cheese
la baguette (f) - stick of bread
aller /ale/
je vais, tu vas, il va, nous allons, vous allez, ils vont
On utilise être avec les verbes de mouvement. Example: je suis allé.
`;

describe("extractFromNote", () => {
  it("pulls vocab gender, plural, and meaning", () => {
    const result = extractFromNote(SAMPLE);
    const fromage = result.vocab.find((item) => item.term === "fromage");
    const baguette = result.vocab.find((item) => item.term === "baguette");
    expect(fromage).toMatchObject({
      gender: "m",
      plural: "fromages",
      meaning: "cheese",
    });
    expect(baguette).toMatchObject({
      gender: "f",
      meaning: "stick of bread",
    });
    expect(vocabAnswer(fromage!)).toContain("(m)");
  });

  it("pulls verb phonetics and conjugations", () => {
    const result = extractFromNote(SAMPLE);
    const aller = result.verbs.find((item) => item.infinitive === "aller");
    expect(aller?.phonetics).toBe("ale");
    expect(aller?.conjugations.je).toBe("vais");
    expect(aller?.conjugations.nous).toBe("allons");
  });

  it("keeps a grammar line from the dump", () => {
    const result = extractFromNote(SAMPLE);
    expect(result.grammar.length).toBeGreaterThan(0);
    expect(result.grammar[0]?.explanation).toMatch(/être/);
  });

  it("attaches a following plural line to the last vocab item", () => {
    const result = extractFromNote("le chat (m)\nplural: chats");
    expect(result.vocab[0]).toMatchObject({ term: "chat", plural: "chats", gender: "m" });
  });
});
