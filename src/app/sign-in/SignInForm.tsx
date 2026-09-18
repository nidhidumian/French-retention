"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
import {
  Field,
  FormError,
  PrimaryButton,
  TextInput,
} from "@/components/formControls";
import { clerkErrorMessage } from "@/services/clerkErrors";

/** Custom Clerk sign-in (v7 "future" API): email + password, then finalize. */
export function SignInForm() {
  const router = useRouter();
  const { signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: signInError } = await signIn.password({
        identifier: email,
        password,
      });
      if (signInError) {
        setError(clerkErrorMessage(signInError));
        return;
      }
      if (signIn.status !== "complete") {
        setError(
          "This account needs another verification step this form doesn't support yet."
        );
        return;
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(clerkErrorMessage(finalizeError));
        return;
      }
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      kicker="Welcome back"
      title="Log in"
      intro="Your notes are where you left them."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>

        <FormError message={error} />

        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </PrimaryButton>
          <Link
            href="/sign-up"
            className="mono-label text-[0.72rem] text-cream-dim transition-colors hover:text-pink"
          >
            I need an account
          </Link>
        </div>

        <p className="mono-label pt-1 text-[0.62rem] text-cream-dim/70">
          You stay logged in on this device until you log out.
        </p>
      </form>
    </AuthShell>
  );
}
