/**
 * Pull a human-readable message out of a Clerk error without depending on
 * Clerk's error classes (keeps the client bundles lean). Clerk v7 flow
 * methods return `{ error }` objects whose `longMessage` is written for
 * end users; `message` is the developer-facing fallback.
 */
export function clerkErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      longMessage?: string;
      message?: string;
      errors?: { longMessage?: string; message?: string }[];
    };
    if (e.longMessage) return e.longMessage;
    const first = e.errors?.[0];
    if (first?.longMessage || first?.message) {
      return first.longMessage ?? first.message!;
    }
    if (typeof e.message === "string" && e.message) {
      return e.message.replace(/^Clerk:\s*/i, "").split("\n")[0];
    }
  }
  return "Something went wrong. Try again.";
}

const SIGN_UP_FIELD_LABELS: Record<string, string> = {
  email_address: "an email address",
  phone_number: "a phone number",
  username: "a username",
  password: "a password",
  first_name: "a first name",
  last_name: "a last name",
  legal_accepted: "accepting the terms",
};

function listOut(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Explain an incomplete sign-up in the user's terms. Clerk keeps a sign-up
 * in `missing_requirements` when the instance wants fields this form never
 * collected (say, a phone number configured as required in the Clerk
 * Dashboard) — without this, the user would only see the opaque
 * "Cannot finalize sign-up without a created session." from finalize().
 */
export function signUpIncompleteMessage(
  missingFields: string[],
  unverifiedFields: string[]
): string {
  const needs = [
    ...missingFields.map(
      (f) => SIGN_UP_FIELD_LABELS[f] ?? f.replace(/_/g, " ")
    ),
    ...unverifiedFields.map((f) => `verifying your ${f.replace(/_/g, " ")}`),
  ];
  if (needs.length === 0) {
    return (
      "Clerk reports this sign-up as incomplete but didn't say what's " +
      "missing. Try again, or review the sign-up requirements in the Clerk " +
      "Dashboard (Configure → User & authentication)."
    );
  }
  return (
    `Almost there — your account still needs ${listOut(needs)}. This form ` +
    "doesn't collect that yet, so adjust the required sign-up fields in " +
    "the Clerk Dashboard (Configure → User & authentication)."
  );
}
