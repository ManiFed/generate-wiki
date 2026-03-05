import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSuggestedPages } from "@/lib/ai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const suggestedPages = await prisma.suggestedPage.findMany({
    where: { wikiId: id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(suggestedPages);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wiki = await prisma.wiki.findUnique({
    where: { id },
    include: { pages: { select: { title: true } } },
  });

  if (!wiki) {
    return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
  }

  const existingTitles = wiki.pages.map((p) => p.title);
  const suggestions = await generateSuggestedPages(
    wiki.topic,
    wiki.description,
    existingTitles
  );

  const created = await Promise.all(
    suggestions.map((s) =>
      prisma.suggestedPage.create({
        data: {
          wikiId: id,
          title: s.title,
          reason: s.reason,
          prompt: s.prompt,
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}
