/**
 * One place to ask "is Clerk wired up?". Server-side only — the check reads
 * process.env at render/request time, so keys added to the host (Vercel,
 * .env.local) are picked up without code changes.
 *
 * When the keys are missing the app still builds and runs: middleware lets
 * requests through and the pages show a setup notice instead of crashing.
 */
export function clerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}
