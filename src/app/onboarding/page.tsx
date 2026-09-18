import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { SetupNotice } from "@/components/SetupNotice";
import { clerkConfigured } from "@/services/clerkConfig";
import { profileFromMetadata } from "@/services/onboarding";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = {
  title: "Set your level — French retention",
};

export default async function OnboardingPage() {
  if (!clerkConfigured()) return <SetupNotice />;

  const user = await currentUser();
  if (!user) redirect("/welcome");
  if (profileFromMetadata(user.publicMetadata)) redirect("/");

  return <OnboardingFlow firstName={user.firstName} />;
}
