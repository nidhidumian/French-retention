"use server";

import { revalidatePath } from "next/cache";
import { gradeCard, startQuiz } from "@/lib/services/quiz";
import type { Grade } from "@/lib/services/srs";
import type { QuizCard } from "@/lib/types";

export async function loadQuizAction(): Promise<QuizCard[]> {
  return startQuiz();
}

export async function gradeCardAction(cardId: string, grade: Grade): Promise<void> {
  gradeCard(cardId, grade);
  revalidatePath("/quiz");
  revalidatePath("/");
}
