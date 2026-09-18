import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { Kicker } from "@/components/editorial";

export const metadata: Metadata = {
  title: "Welcome — French retention",
};

/**
 * First screen for a signed-out visitor. One clear primary action (create
 * an account), one quiet secondary (log in). Middleware sends signed-in
 * users straight to the app.
 */
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 py-16 sm:px-8">
      <Kicker>Mes notes de français</Kicker>
      <h1 className="mt-3 text-[2.6rem] font-bold leading-[1.04] tracking-tight text-pink sm:text-6xl">
        Keep the French you meet.
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/90 sm:text-xl">
        Dump your notes, and get the vocabulary, verbs and grammar inside
        them extracted, organised and quizzed back to you.
      </p>

      <div className="mt-12 flex flex-col gap-4">
        <Link
          href="/sign-up"
          className="mono-label flex items-center justify-center gap-3 rounded-full bg-pink-pale px-8 py-4 text-[0.8rem] text-surface transition-opacity hover:opacity-90"
        >
          <UserPlus strokeWidth={1.8} className="h-[1.15rem] w-[1.15rem]" />
          Create account
        </Link>
        <Link
          href="/sign-in"
          className="mono-label flex items-center justify-center gap-3 rounded-full border border-edge px-8 py-4 text-[0.8rem] text-cream transition-colors hover:border-pink-hot/60 hover:text-pink-pale"
        >
          <LogIn strokeWidth={1.8} className="h-[1.15rem] w-[1.15rem]" />
          Log in
        </Link>
      </div>
    </main>
  );
}
