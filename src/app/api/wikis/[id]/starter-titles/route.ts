import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateStarterPageTitles } from "@/lib/ai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wiki = await prisma.wiki.findUnique({ where: { id } });

  if (!wiki) {
    return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
  }

  const titles = await generateStarterPageTitles(wiki.topic, wiki.description);
  return NextResponse.json(titles);
}
