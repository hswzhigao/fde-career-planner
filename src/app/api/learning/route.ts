import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.learningTask.findMany({
    orderBy: [{ phase: "asc" }, { created_at: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.learningTask.create({ data: body });
  return NextResponse.json(created);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.learningTask.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.learningTask.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
