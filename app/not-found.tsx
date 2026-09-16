import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Surface } from "@/components/Surface";

export default function NotFound() {
  return (
    <AppShell title="French">
      <Surface className="px-5 py-8 text-center">
        <p className="text-cream">That page is missing.</p>
        <Link href="/" className="mt-3 inline-block text-pink">
          Back to Notes
        </Link>
      </Surface>
    </AppShell>
  );
}
