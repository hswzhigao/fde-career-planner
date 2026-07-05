import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const logs = await prisma.weeklyLog.findMany({
    orderBy: { week_number: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxWeek = await prisma.weeklyLog.aggregate({ _max: { week_number: true } });
  const weekNumber = (maxWeek._max.week_number ?? 0) + 1;
  const created = await prisma.weeklyLog.create({
    data: { ...body, week_number: weekNumber },
  });
  return NextResponse.json(created);
}
