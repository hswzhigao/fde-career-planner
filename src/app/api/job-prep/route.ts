import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.jobChecklistItem.findMany({
    orderBy: [{ section: "asc" }, { sort_order: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxOrder = await prisma.jobChecklistItem.aggregate({
    _max: { sort_order: true },
    where: { section: body.section },
  });
  const created = await prisma.jobChecklistItem.create({
    data: {
      ...body,
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
  });
  return NextResponse.json(created);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.jobChecklistItem.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.jobChecklistItem.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
