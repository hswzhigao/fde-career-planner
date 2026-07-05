import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 单用户场景：只取第一条
export async function GET() {
  const profile = await prisma.profile.findFirst();
  if (!profile) {
    await prisma.profile.create({ data: {} });
    return NextResponse.json(await prisma.profile.findFirst());
  }
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.profile.findFirst();

  if (!existing) {
    const created = await prisma.profile.create({ data: body });
    return NextResponse.json(created);
  }

  const updated = await prisma.profile.update({
    where: { id: existing.id },
    data: body,
  });
  return NextResponse.json(updated);
}
