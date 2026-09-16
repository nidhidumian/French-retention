import { AppShell } from "@/components/AppShell";
import { QuizSession } from "@/components/QuizSession";
import { startQuiz } from "@/lib/services/quiz";

export default function QuizPage() {
  const cards = startQuiz();
  return (
    <AppShell title="Quiz">
      <p className="mb-5 text-sm leading-6 text-cream/75">
        Type, flip, then mark remembered or forgot. Forgot cards come back sooner.
      </p>
      <QuizSession cards={cards} />
    </AppShell>
  );
}
