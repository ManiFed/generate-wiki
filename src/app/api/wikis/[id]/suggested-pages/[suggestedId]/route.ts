import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePageContent } from "@/lib/ai";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; suggestedId: string }> }
) {
  const { suggestedId } = await params;
  const body = await request.json();
  const { prompt, title } = body;

  const updated = await prisma.suggestedPage.update({
    where: { id: suggestedId },
    data: {
      ...(prompt !== undefined && { prompt }),
      ...(title !== undefined && { title }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; suggestedId: string }> }
) {
  const { suggestedId } = await params;
  await prisma.suggestedPage.update({
    where: { id: suggestedId },
    data: { status: "dismissed" },
  });
  return NextResponse.json({ success: true });
}

// Generate the suggested page (creates an actual page from the suggestion)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; suggestedId: string }> }
) {
  const { id, suggestedId } = await params;

  const suggestedPage = await prisma.suggestedPage.findUnique({
    where: { id: suggestedId },
  });

  if (!suggestedPage) {
    return NextResponse.json(
      { error: "Suggested page not found" },
      { status: 404 }
    );
  }

  const wiki = await prisma.wiki.findUnique({
    where: { id },
    include: { pages: { select: { title: true } } },
  });

  if (!wiki) {
    return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
  }

  const existingTitles = wiki.pages.map((p) => p.title);
  const generated = await generatePageContent(
    suggestedPage.title,
    wiki.topic,
    wiki.description,
    existingTitles
  );

  const content = generated.content.replace(/WIKI_ID/g, id);

  const page = await prisma.page.create({
    data: {
      wikiId: id,
      title: generated.title,
      content,
      order: wiki.pages.length,
    },
  });

  await prisma.suggestedPage.update({
    where: { id: suggestedId },
    data: { status: "generated" },
  });

  return NextResponse.json(page, { status: 201 });
}
