"use server";

import { revalidatePath } from "next/cache";
import { sendQuizEmail } from "@/lib/services/email";
import { saveSettings } from "@/lib/services/settings";

export async function saveSettingsAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  try {
    saveSettings({
      email: String(formData.get("email") || ""),
      windowStartHour: Number(formData.get("windowStartHour")),
      windowEndHour: Number(formData.get("windowEndHour")),
      timezone: String(formData.get("timezone") || "Europe/Paris"),
    });
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function sendQuizEmailAction(): Promise<{
  error?: string;
  ok?: boolean;
  info?: string;
}> {
  const result = await sendQuizEmail(true);
  revalidatePath("/settings");
  if (result.ok) return { ok: true, info: "Quiz email sent." };
  return { error: result.reason };
}
