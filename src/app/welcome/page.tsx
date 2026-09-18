import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { Kicker } from "@/components/editorial";

export const metadata: Metadata = {
  title: "Welcome — French retention",
};

/**
 * First screen for a signed-out visitor: create an account or log in.
 * Middleware sends signed-in users straight to the app.
 */
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-5 py-14 sm:px-8">
      <Kicker>Mes notes de français</Kicker>
      <h1 className="mt-2 text-5xl font-bold leading-[1.05] tracking-tight text-pink sm:text-6xl">
        Keep the French you meet.
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream sm:text-xl">
        Dump your notes, and get the vocabulary, verbs and grammar inside
        them extracted, organised and quizzed back to you.
      </p>

      <hr className="hairline mt-9 border-t" />

      <div className="mt-9 space-y-4 sm:space-y-5">
        <AuthCard
          href="/sign-up"
          tag="New here"
          title="Create account"
          sub="Email, a password, two minutes"
          icon={<UserPlus strokeWidth={1.6} className="h-6 w-6" />}
        />
        <AuthCard
          href="/sign-in"
          tag="Back again"
          title="Log in"
          sub="Pick up where you left off"
          icon={<LogIn strokeWidth={1.6} className="h-6 w-6" />}
        />
      </div>
    </main>
  );
}

function AuthCard({
  href,
  tag,
  title,
  sub,
  icon,
}: {
  href: string;
  tag: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex w-full items-center justify-between gap-5 rounded-card border border-edge bg-surface px-5 py-5 transition-colors hover:border-pink-hot/60 hover:bg-surface-raised sm:px-7 sm:py-6"
    >
      <span className="flex flex-col gap-1">
        <span className="mono-label text-[0.68rem] text-pink-hot">{tag}</span>
        <span className="text-2xl font-bold tracking-tight text-pink-pale">
          {title}
        </span>
        <span className="mono-label text-[0.66rem] text-cream-dim">{sub}</span>
      </span>
      <span className="shrink-0 text-pink transition-transform group-hover:translate-x-0.5">
        {icon}
      </span>
    </Link>
  );
}
