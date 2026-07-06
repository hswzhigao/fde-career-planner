import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const tasks = await prisma.learningTask.findMany({
      where: { userId: session.userId },
      orderBy: [{ phase: "asc" }, { created_at: "asc" }],
    });
    return NextResponse.json(tasks);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const created = await prisma.learningTask.create({ data: { ...body, userId: session.userId } });
    return NextResponse.json(created);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const { id, ...data } = body;
    const result = await prisma.learningTask.updateMany({
      where: { id, userId: session.userId },
      data,
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }
    const updated = await prisma.learningTask.findFirst({ where: { id, userId: session.userId } });
    return NextResponse.json(updated);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const result = await prisma.learningTask.deleteMany({ where: { id, userId: session.userId } });
    if (result.count === 0) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return authErrorResponse(e);
  }
}
