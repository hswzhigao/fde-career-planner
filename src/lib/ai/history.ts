import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

/**
 * Returns the most recent AiSummary of the given type for the authenticated user.
 * If `relatedId` query param is provided, filters by it (e.g. weekly review for a specific log).
 */
export async function getLatestSummary(
  req: NextRequest,
  type: string,
) {
  try {
    const session = await requireUser(req);
    const relatedId = req.nextUrl.searchParams.get("relatedId");

    const summary = await prisma.aiSummary.findFirst({
      where: {
        userId: session.userId,
        type,
        ...(relatedId ? { related_id: Number(relatedId) } : {}),
      },
      orderBy: { created_at: "desc" },
      select: { id: true, content: true, created_at: true },
    });

    return NextResponse.json(summary ?? null);
  } catch (e) {
    return authErrorResponse(e);
  }
}
