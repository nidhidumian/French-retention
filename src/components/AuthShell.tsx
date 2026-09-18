import Link from "next/link";
import { Kicker } from "./editorial";

/**
 * Frame for the signed-out screens (welcome, sign-up, sign-in, terms,
 * privacy): centered editorial column with the app wordmark up top.
 */
export function AuthShell({
  kicker,
  title,
  intro,
  children,
  wide = false,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className={`mx-auto flex min-h-dvh w-full flex-col justify-center px-5 py-14 sm:px-8 ${
        wide ? "max-w-2xl" : "max-w-xl"
      }`}
    >
      <Link
        href="/welcome"
        className="mono-label mb-10 inline-block w-fit text-[0.7rem] text-cream-dim transition-colors hover:text-pink"
      >
        French retention
      </Link>
      <Kicker>{kicker}</Kicker>
      <h1 className="mt-2 text-4xl font-bold leading-[1.05] tracking-tight text-pink sm:text-5xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-cream">
          {intro}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </main>
  );
}
