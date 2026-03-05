import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const wikis = await prisma.wiki.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });
  return NextResponse.json(wikis);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, topic, description } = body;

  if (!title || !topic) {
    return NextResponse.json(
      { error: "Title and topic are required" },
      { status: 400 }
    );
  }

  const wiki = await prisma.wiki.create({
    data: { title, topic, description: description || "" },
  });

  return NextResponse.json(wiki, { status: 201 });
}
