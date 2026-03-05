import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePageContent } from "@/lib/ai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pages = await prisma.page.findMany({
    where: { wikiId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(pages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { titles } = body;

  const wiki = await prisma.wiki.findUnique({ where: { id } });
  if (!wiki) {
    return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
  }

  const existingPages = await prisma.page.findMany({
    where: { wikiId: id },
    select: { title: true },
  });
  const existingTitles = existingPages.map((p) => p.title);

  const pageTitles: string[] = Array.isArray(titles) ? titles : [titles];
  const created = [];

  for (let i = 0; i < pageTitles.length; i++) {
    const title = pageTitles[i];
    const allTitles = [...existingTitles, ...created.map((c) => c.title)];
    const generated = await generatePageContent(
      title,
      wiki.topic,
      wiki.description,
      allTitles
    );

    // Replace WIKI_ID placeholder with actual wiki id
    const content = generated.content.replace(/WIKI_ID/g, id);

    const page = await prisma.page.create({
      data: {
        wikiId: id,
        title: generated.title,
        content,
        order: existingTitles.length + i,
      },
    });
    created.push(page);
  }

  return NextResponse.json(created, { status: 201 });
}
