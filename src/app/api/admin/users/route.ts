import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.max(
      1,
      Math.min(100, Number(searchParams.get("pageSize") ?? "20") || 20),
    );

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatarSeed: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({ users, page, pageSize, total });
  } catch (e) {
    return authErrorResponse(e);
  }
}
