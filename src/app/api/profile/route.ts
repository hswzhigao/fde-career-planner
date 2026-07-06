import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    let profile = await prisma.profile.findFirst({ where: { userId: session.userId } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.userId } });
    }
    return NextResponse.json(profile);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const existing = await prisma.profile.findFirst({ where: { userId: session.userId } });

    if (!existing) {
      const created = await prisma.profile.create({ data: { ...body, userId: session.userId } });
      return NextResponse.json(created);
    }

    const updated = await prisma.profile.update({
      where: { id: existing.id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return authErrorResponse(e);
  }
}
