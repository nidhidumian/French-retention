import type { Metadata } from "next";
import { SetupNotice } from "@/components/SetupNotice";
import { clerkConfigured } from "@/services/clerkConfig";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Log in — French retention",
};

export default function SignInPage() {
  if (!clerkConfigured()) return <SetupNotice />;
  return <SignInForm />;
}
