import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { pageId } = await params;
  const body = await request.json();
  const { description, type } = body;

  if (!description || !type) {
    return NextResponse.json(
      { error: "Description and type are required" },
      { status: 400 }
    );
  }

  // AI edits are created as suggestions that must be approved
  const suggestion = await prisma.suggestion.create({
    data: {
      pageId,
      description,
      type,
      aiGenerated: true,
    },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
