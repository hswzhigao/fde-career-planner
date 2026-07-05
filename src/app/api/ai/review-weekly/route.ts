import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reviewWeekly } from "@/lib/ai/weekly";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const logId = body.logId;
    if (!logId) {
      return NextResponse.json({ error: "缺少 logId" }, { status: 400 });
    }

    const log = await prisma.weeklyLog.findUnique({ where: { id: logId } });
    if (!log) {
      return NextResponse.json({ error: "周报不存在" }, { status: 404 });
    }

    const history = await prisma.weeklyLog.findMany({
      where: { week_number: { lt: log.week_number } },
      orderBy: { week_number: "asc" },
      select: {
        week_number: true,
        delivery_practice: true,
        ai_practice: true,
        business_practice: true,
      },
    });

    const result = await reviewWeekly(
      log as unknown as Record<string, unknown>,
      history,
    );

    await prisma.aiSummary.create({
      data: { type: "weekly_review", content: result, related_id: log.id },
    });

    return NextResponse.json({ content: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("review-weekly error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
