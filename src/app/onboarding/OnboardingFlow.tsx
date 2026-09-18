"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { FormError, PrimaryButton } from "@/components/formControls";
import {
  CEFR_LEVELS,
  CONJUGATION_STAGES,
  type CefrLevel,
  type ConjugationStage,
} from "@/services/onboarding";
import { completeOnboarding } from "./actions";

/**
 * One-time onboarding after sign-up: pick a CEFR level (A1–C1) and, at A1,
 * a conjugation stage. Saved to Clerk publicMetadata by the server action.
 */
export function OnboardingFlow({ firstName }: { firstName: string | null }) {
  const router = useRouter();
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [stage, setStage] = useState<ConjugationStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const needsStage = level === "A1";
  const ready = level !== null && (!needsStage || stage !== null);

  async function handleSave() {
    if (!ready || level === null) return;
    setError(null);
    setBusy(true);
    const result = await completeOnboarding({
      cefrLevel: level,
      conjugationStage: needsStage ? stage : null,
    });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      kicker="Before your first note"
      title={firstName ? `Where are you at, ${firstName}?` : "Where are you at?"}
      intro="Pick your level so extractions and quizzes meet you there. You can change this later."
      wide
    >
      <p className="mono-label text-[0.7rem] text-pink-hot">Your CEFR level</p>
      <div className="mt-4 space-y-3">
        {CEFR_LEVELS.map((option) => (
          <PickCard
            key={option.id}
            tag={option.id}
            title={option.name}
            body={option.blurb}
            selected={level === option.id}
            onClick={() => {
              setLevel(option.id);
              if (option.id !== "A1") setStage(null);
            }}
          />
        ))}
      </div>

      {needsStage && (
        <>
          <p className="mono-label mt-12 text-[0.7rem] text-pink-hot">
            Your conjugation stage
          </p>
          <p className="mt-2.5 max-w-md text-[0.98rem] leading-relaxed text-cream-dim">
            At A1 the app introduces tenses one at a time. Where are your
            conjugations today?
          </p>
          <div className="mt-4 space-y-3">
            {CONJUGATION_STAGES.map((option) => (
              <PickCard
                key={option.id}
                tag={String(option.id)}
                title={option.name}
                body={option.blurb}
                selected={stage === option.id}
                onClick={() => setStage(option.id)}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-12 space-y-4">
        <FormError message={error} />
        <PrimaryButton type="button" onClick={handleSave} disabled={!ready || busy}>
          {busy ? "Saving…" : "Start taking notes"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}

function PickCard({
  tag,
  title,
  body,
  selected,
  onClick,
}: {
  tag: string;
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-baseline gap-4 rounded-card border px-5 py-4.5 text-left transition-colors sm:gap-6 sm:px-6 sm:py-5 ${
        selected
          ? "border-pink-hot bg-surface-raised ring-1 ring-pink-hot/60"
          : "border-edge bg-surface hover:border-pink-hot/60 hover:bg-surface-raised/60"
      }`}
    >
      <span
        className={`mono-label w-8 shrink-0 text-[0.78rem] ${
          selected ? "text-pink-hot" : "text-cream-dim"
        }`}
      >
        {tag}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-lg font-bold tracking-tight text-pink-pale">
          {title}
        </span>
        <span className="text-[0.95rem] leading-relaxed text-cream-dim">
          {body}
        </span>
      </span>
    </button>
  );
}
