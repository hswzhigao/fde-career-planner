import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [userCount, activeUserCount, learningTaskCount, aiSummaryCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.learningTask.count(),
        prisma.aiSummary.count(),
      ]);
    return NextResponse.json({
      userCount,
      activeUserCount,
      learningTaskCount,
      aiSummaryCount,
    });
  } catch (e) {
    return authErrorResponse(e);
  }
}
