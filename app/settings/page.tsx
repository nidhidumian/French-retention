import { AppShell } from "@/components/AppShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getSettings } from "@/lib/services/settings";

export default function SettingsPage() {
  const settings = getSettings();
  return (
    <AppShell title="Settings">
      <p className="mb-5 text-sm leading-6 text-cream/75">
        Email hours for Resend. This stays a gear, not a dock pin.
      </p>
      <SettingsForm settings={settings} />
    </AppShell>
  );
}
