import type { Metadata } from "next";
import { SetupNotice } from "@/components/SetupNotice";
import { clerkConfigured } from "@/services/clerkConfig";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account — French retention",
};

export default function SignUpPage() {
  if (!clerkConfigured()) return <SetupNotice />;
  return <SignUpForm />;
}
