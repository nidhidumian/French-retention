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
