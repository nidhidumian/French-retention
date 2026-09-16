"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dumpNote, reextractNote, updateCorrection } from "@/lib/services/notes";

function refreshLists() {
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/vocab");
  revalidatePath("/verbs");
  revalidatePath("/grammar");
  revalidatePath("/quiz");
}

export async function dumpNoteAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const rawText = String(formData.get("rawText") || "").trim();
  const dumpedOn = String(formData.get("dumpedOn") || "");
  if (!rawText) return { error: "Write something first." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dumpedOn)) return { error: "Pick a date." };
  const note = dumpNote(rawText, dumpedOn);
  refreshLists();
  revalidatePath(`/notes/${note.id}`);
  redirect(`/notes/${note.id}`);
}

export async function reextractNoteAction(noteId: string): Promise<void> {
  const note = reextractNote(noteId);
  refreshLists();
  revalidatePath(`/notes/${note.id}`);
}

export async function updateCorrectionAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const id = String(formData.get("id") || "");
  const correctedText = String(formData.get("correctedText") || "");
  const correctionWhy = String(formData.get("correctionWhy") || "");
  if (!id) return { error: "Missing note." };
  if (!correctedText.trim()) return { error: "Correction cannot be empty." };
  updateCorrection(id, correctedText, correctionWhy);
  revalidatePath(`/notes/${id}`);
  return null;
}
