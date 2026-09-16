import Link from "next/link";
import { IconGear } from "@/components/Icons";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
      <h1 className="text-2xl font-semibold tracking-tight text-pink">{title}</h1>
      <Link
        href="/settings"
        aria-label="Settings, email hours"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-cream"
      >
        <IconGear />
      </Link>
    </header>
  );
}
