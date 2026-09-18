import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Terms of use — French retention",
};

/** Placeholder terms page. Real copy arrives when the app leaves personal use. */
export default function TermsPage() {
  return (
    <AuthShell
      kicker="The paperwork"
      title="Terms of use"
      intro="Placeholder terms for a personal app. Real ones arrive if this ever serves more than its owner."
    >
      <div className="space-y-5 rounded-card border border-edge bg-surface p-6 text-[1.02rem] leading-relaxed text-cream sm:p-7">
        <p>
          French retention is a personal study tool. Use it for learning
          French; don&apos;t use it to break the law or other people&apos;s
          rights.
        </p>
        <p>
          Your notes belong to you. The app stores them so it can extract
          vocabulary, verbs and grammar for your own study.
        </p>
        <p>
          The service is provided as-is, without warranty. It may change or
          pause at any time while it&apos;s under construction.
        </p>
      </div>
    </AuthShell>
  );
}
