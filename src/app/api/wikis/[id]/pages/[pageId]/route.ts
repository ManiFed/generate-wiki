import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { id, pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, wikiId: id },
    include: {
      suggestions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { pageId } = await params;
  const body = await request.json();
  const { title, content } = body;

  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json(page);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { pageId } = await params;
  await prisma.page.delete({ where: { id: pageId } });
  return NextResponse.json({ success: true });
}
