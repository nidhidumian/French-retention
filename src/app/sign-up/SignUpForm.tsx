"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
import {
  CheckboxRow,
  Field,
  FormError,
  PrimaryButton,
  TextInput,
} from "@/components/formControls";
import { clerkErrorMessage } from "@/services/clerkErrors";

/**
 * Custom Clerk sign-up flow (v7 "future" API): create the account with
 * email + name + password, verify the email with a one-time code, then
 * finalize to activate the session and head into onboarding.
 */
export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finishAndEnter() {
    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setError(clerkErrorMessage(finalizeError));
      return;
    }
    router.push("/onboarding");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== retypePassword) {
      setError("The two passwords don't match.");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the terms of use and privacy policy.");
      return;
    }

    setBusy(true);
    try {
      const { error: createError } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
        legalAccepted: true,
        unsafeMetadata: { termsAcceptedAt: new Date().toISOString() },
      });
      if (createError) {
        setError(clerkErrorMessage(createError));
        return;
      }
      if (signUp.status === "complete") {
        // Instance doesn't require email verification — straight in.
        await finishAndEnter();
        return;
      }
      if (signUp.unverifiedFields.includes("email_address")) {
        const { error: sendError } =
          await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(clerkErrorMessage(sendError));
          return;
        }
        setStep("verify");
        return;
      }
      setError("Sign-up needs a step this form doesn't support yet.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({ code });
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
        kicker="One last step"
        title="Check your inbox"
        intro={`We sent a six-digit code to ${email}. Type it here and your account is live.`}
      >
        <form onSubmit={handleVerify} className="space-y-5">
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
            {busy ? "Verifying…" : "Verify email"}
          </PrimaryButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      kicker="New account"
      title="Create account"
      intro="Your notes, vocabulary and progress will live under this account."
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name">
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Last name">
            <TextInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </Field>
        </div>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Retype password">
          <TextInput
            type="password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>

        <CheckboxRow checked={acceptedTerms} onChange={setAcceptedTerms}>
          I accept the{" "}
          <Link
            href="/terms"
            className="text-pink-pale underline underline-offset-2 hover:text-pink"
            target="_blank"
          >
            terms of use
          </Link>{" "}
          and the{" "}
          <Link
            href="/privacy"
            className="text-pink-pale underline underline-offset-2 hover:text-pink"
            target="_blank"
          >
            privacy policy
          </Link>
          .
        </CheckboxRow>

        {/* Clerk mounts its bot-protection widget here when enabled. */}
        <div id="clerk-captcha" />

        <FormError message={error} />

        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </PrimaryButton>
          <Link
            href="/sign-in"
            className="mono-label text-[0.72rem] text-cream-dim transition-colors hover:text-pink"
          >
            I already have an account
          </Link>
        </div>

        <p className="mono-label pt-1 text-[0.68rem] text-cream-dim">
          You stay logged in on this device until you log out.
        </p>
      </form>
    </AuthShell>
  );
}
