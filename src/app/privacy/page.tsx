import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Privacy — French retention",
};

/** Placeholder privacy page. Real copy arrives when the app leaves personal use. */
export default function PrivacyPage() {
  return (
    <AuthShell
      kicker="The paperwork"
      title="Privacy"
      intro="Placeholder privacy notes for a personal app. The short version: your data is yours."
    >
      <div className="space-y-5 rounded-card border border-edge bg-surface p-6 text-[1.02rem] leading-relaxed text-cream sm:p-7">
        <p>
          Accounts are handled by Clerk, which stores your email, name and
          password on our behalf.
        </p>
        <p>
          Your French notes currently stay in your own browser
          (localStorage), keyed to your account. Moving them to a database
          you control is a planned step.
        </p>
        <p>
          Nothing is sold, shared or used for advertising. This is a
          personal study app.
        </p>
      </div>
    </AuthShell>
  );
}
