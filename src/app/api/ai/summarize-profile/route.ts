import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { summarizeProfile } from "@/lib/ai/summarize";

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: "请先填写个人画像" }, { status: 400 });
    }

    const result = await summarizeProfile(profile as unknown as Record<string, unknown>);

    await prisma.aiSummary.create({
      data: {
        type: "profile_summary",
        content: result,
      },
    });

    return NextResponse.json({ content: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("summarize-profile error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
