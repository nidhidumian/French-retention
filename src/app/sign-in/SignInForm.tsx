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

/**
 * Custom Clerk sign-in (v7 "future" API): email + password, then finalize.
 * On a new device Clerk asks for an email code (Device Trust /
 * second factor), so the form has a verify step for that.
 */
export function SignInForm() {
  const router = useRouter();
  const { signIn } = useSignIn();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finishAndEnter() {
    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setError(clerkErrorMessage(finalizeError));
      return;
    }
    router.push("/");
  }

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
      if (signIn.status === "complete") {
        await finishAndEnter();
        return;
      }
      if (
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_second_factor"
      ) {
        // New device: Clerk wants the email verified once on this device.
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(clerkErrorMessage(sendError));
          return;
        }
        setStep("verify");
        return;
      }
      setError(
        "This account needs another verification step this form doesn't support yet."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: verifyError } = await signIn.mfa.verifyEmailCode({
        code,
      });
      if (verifyError) {
        setError(clerkErrorMessage(verifyError));
        return;
      }
      await finishAndEnter();
    } finally {
      setBusy(false);
    }
  }

  if (step === "verify") {
    return (
      <AuthShell
        kicker="New device"
        title="Check your inbox"
        intro={`First time on this device, so we sent a six-digit code to ${email}.`}
      >
        <form onSubmit={handleVerify} className="space-y-6">
          <Field label="Verification code">
            <TextInput
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              autoFocus
              required
            />
          </Field>
          <FormError message={error} />
          <PrimaryButton disabled={busy}>
            {busy ? "Verifying…" : "Verify and log in"}
          </PrimaryButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      kicker="Welcome back"
      title="Log in"
      intro="Your notes are where you left them."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex flex-col items-start gap-5 pt-1">
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

        <p className="mono-label pt-1 text-[0.68rem] text-cream-dim">
          You stay logged in on this device until you log out.
        </p>
      </form>
    </AuthShell>
  );
}
