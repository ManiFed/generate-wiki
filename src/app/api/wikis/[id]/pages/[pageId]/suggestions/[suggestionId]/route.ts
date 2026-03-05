import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEditSuggestion } from "@/lib/ai";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; pageId: string; suggestionId: string }>;
  }
) {
  const { pageId, suggestionId } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be approved or rejected" },
      { status: 400 }
    );
  }

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return NextResponse.json(
      { error: "Suggestion not found" },
      { status: 404 }
    );
  }

  // If approving, apply the edit to the page
  if (status === "approved") {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
      const updatedContent = await generateEditSuggestion(
        page.content,
        suggestion.description,
        suggestion.type
      );
      await prisma.page.update({
        where: { id: pageId },
        data: { content: updatedContent },
      });
    }
  }

  const updated = await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status },
  });

  return NextResponse.json(updated);
}
