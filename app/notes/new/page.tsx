import { AppShell } from "@/components/AppShell";
import { DumpForm } from "@/components/DumpForm";

export default function NewNotePage() {
  return (
    <AppShell title="Add note">
      <DumpForm />
    </AppShell>
  );
}
