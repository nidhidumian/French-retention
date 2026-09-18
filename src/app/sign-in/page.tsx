import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupNotice } from "@/components/SetupNotice";
import { clerkConfigured } from "@/services/clerkConfig";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Log in — French retention",
};

export default function SignInPage() {
  if (!clerkConfigured()) return <SetupNotice />;
  // Suspense: the form reads ?notice=… via useSearchParams, which Next
  // requires to be inside a boundary so the page can still prerender.
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
