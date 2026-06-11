import { NextRequest, NextResponse } from "next/server";
import { runDailyRecalculation } from "@/lib/jobs/recalculate";

// Vercel Cron hits this endpoint once a day (see vercel.json). Protect it
// with CRON_SECRET so it can't be triggered by random requests.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const summary = runDailyRecalculation();
  return NextResponse.json({ ok: true, ...summary });
}
