import { Dock } from "@/components/Dock";
import { TopBar } from "@/components/TopBar";
import { countDueCards } from "@/lib/services/quiz";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const dueCount = countDueCards();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title={title} />
      <main className="flex-1 px-5 pb-32 pt-4">{children}</main>
      <Dock dueCount={dueCount} />
    </div>
  );
}
