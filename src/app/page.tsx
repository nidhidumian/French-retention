import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AppShell } from "@/components/AppShell";
import { SetupNotice } from "@/components/SetupNotice";
import { clerkConfigured } from "@/services/clerkConfig";
import { profileFromMetadata } from "@/services/onboarding";

export default async function Home() {
  if (!clerkConfigured()) return <SetupNotice />;

  const user = await currentUser();
  if (!user) redirect("/welcome"); // middleware handles this too; belt and braces
  const profile = profileFromMetadata(user.publicMetadata);
  if (!profile) redirect("/onboarding");

  return (
    <AppShell
      userId={user.id}
      firstName={user.firstName}
      email={user.primaryEmailAddress?.emailAddress ?? null}
      profile={profile}
    />
  );
}
