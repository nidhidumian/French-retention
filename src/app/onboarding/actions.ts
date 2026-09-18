"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  isCefrLevel,
  isConjugationStage,
  type CefrLevel,
  type ConjugationStage,
} from "@/services/onboarding";

export type OnboardingInput = {
  cefrLevel: CefrLevel;
  conjugationStage: ConjugationStage | null;
};

export type OnboardingResult = { ok: true } | { ok: false; error: string };

/**
 * Persist the onboarding choices on the Clerk user's publicMetadata so they
 * follow the account across devices. `updateUserMetadata` merges, so later
 * slices can add keys without clobbering these.
 */
export async function completeOnboarding(
  input: OnboardingInput
): Promise<OnboardingResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "You're not signed in." };

  if (!isCefrLevel(input.cefrLevel)) {
    return { ok: false, error: "Pick a level between A1 and C1." };
  }
  const needsStage = input.cefrLevel === "A1";
  if (needsStage && !isConjugationStage(input.conjugationStage)) {
    return { ok: false, error: "Pick a conjugation stage." };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        cefrLevel: input.cefrLevel,
        conjugationStage: needsStage ? input.conjugationStage : null,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your choices. Try again." };
  }
}
