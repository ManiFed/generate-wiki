import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { pageId } = await params;
  const suggestions = await prisma.suggestion.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(suggestions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { pageId } = await params;
  const body = await request.json();
  const { description, type, aiGenerated } = body;

  if (!description || !type) {
    return NextResponse.json(
      { error: "Description and type are required" },
      { status: 400 }
    );
  }

  const validTypes = ["fix", "expand", "rewrite", "add_info"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      pageId,
      description,
      type,
      aiGenerated: aiGenerated || false,
    },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
