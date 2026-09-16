"use client";

import { useState, useTransition } from "react";
import { gradeCardAction } from "@/app/actions/quiz";
import { Surface } from "@/components/Surface";
import type { QuizCard } from "@/lib/types";

export function QuizSession({ cards }: { cards: QuizCard[] }) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return (
      <Surface className="px-5 py-8 text-center">
        <p className="text-lg text-cream">Nothing due.</p>
        <p className="mt-2 text-sm text-pink">Dump a note first, then come back to revise.</p>
      </Surface>
    );
  }

  if (done) {
    return (
      <Surface className="px-5 py-8 text-center">
        <p className="text-lg text-cream">Session done.</p>
        <p className="mt-2 text-sm text-pink">{cards.length} cards graded. Forgot ones will come back sooner.</p>
      </Surface>
    );
  }

  const card = cards[index];
  if (!card) return null;

  function finishGrade(grade: "remembered" | "forgot") {
    startTransition(async () => {
      await gradeCardAction(card.id, grade);
      setTyped("");
      setFlipped(false);
      if (index + 1 >= cards.length) setDone(true);
      else setIndex(index + 1);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm tracking-[0.18em] text-pink uppercase">
        {index + 1} / {cards.length} · {card.kind}
      </p>
      <Surface className="px-5 py-6">
        <p className="text-xl font-semibold leading-snug text-cream">{card.prompt}</p>
      </Surface>
      <label className="flex flex-col gap-2 text-sm text-pink">
        Type what you recall
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-pink"
        />
      </label>
      {!flipped ? (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="rounded-full bg-pink px-5 py-3 font-semibold text-canvas"
        >
          Flip
        </button>
      ) : (
        <>
          <Surface className="px-5 py-4">
            <p className="text-xs tracking-[0.18em] text-pink uppercase">Answer</p>
            <p className="mt-2 whitespace-pre-wrap text-cream">{card.answer}</p>
            {typed ? (
              <p className="mt-3 text-sm text-pink">You typed: {typed}</p>
            ) : (
              <p className="mt-3 text-sm text-pink">You left it blank.</p>
            )}
          </Surface>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => finishGrade("forgot")}
              className="rounded-full border border-coral/70 px-4 py-3 font-semibold text-coral disabled:opacity-60"
            >
              Forgot
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => finishGrade("remembered")}
              className="rounded-full bg-pink px-4 py-3 font-semibold text-canvas disabled:opacity-60"
            >
              Remembered
            </button>
          </div>
        </>
      )}
    </div>
  );
}
