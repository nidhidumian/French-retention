import { AuthShell } from "./AuthShell";

/**
 * Shown instead of any auth-dependent screen when the Clerk keys are not in
 * the environment yet. The app builds and runs; it just can't sign anyone
 * in until the keys arrive.
 */
export function SetupNotice() {
  return (
    <AuthShell
      kicker="One-time setup"
      title="Connect Clerk to unlock accounts"
      intro="This app uses Clerk for accounts, and its keys aren't set yet. Two environment variables and you're in."
    >
      <div className="rounded-card border border-edge bg-surface p-6 sm:p-7">
        <p className="mono-label text-[0.7rem] text-pink-hot">What to do</p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-[1.02rem] leading-relaxed text-cream">
          <li>
            Create a free application at{" "}
            <span className="text-pink-pale">clerk.com</span> (email +
            password enabled).
          </li>
          <li>
            Copy <span className="font-mono text-[0.9em] text-pink-pale">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>{" "}
            and <span className="font-mono text-[0.9em] text-pink-pale">CLERK_SECRET_KEY</span>{" "}
            into <span className="font-mono text-[0.9em] text-pink-pale">.env.local</span>{" "}
            (see <span className="font-mono text-[0.9em] text-pink-pale">.env.example</span>).
          </li>
          <li>Restart the app. The README has the step-by-step.</li>
        </ol>
      </div>
    </AuthShell>
  );
}
