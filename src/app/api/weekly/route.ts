import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const logs = await prisma.weeklyLog.findMany({
      where: { userId: session.userId },
      orderBy: { week_number: "desc" },
    });
    return NextResponse.json(logs);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const maxWeek = await prisma.weeklyLog.aggregate({
      _max: { week_number: true },
      where: { userId: session.userId },
    });
    const weekNumber = (maxWeek._max.week_number ?? 0) + 1;
    const created = await prisma.weeklyLog.create({
      data: { ...body, week_number: weekNumber, userId: session.userId },
    });
    return NextResponse.json(created);
  } catch (e) {
    return authErrorResponse(e);
  }
}
