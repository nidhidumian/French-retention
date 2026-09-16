import { NextResponse } from "next/server";
import { sendQuizEmail } from "@/lib/services/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await sendQuizEmail(false);
  const status = result.ok || result.skipped ? 200 : 400;
  return NextResponse.json(result, { status });
}
