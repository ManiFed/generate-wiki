// AI integration module
// Uses a configurable AI provider. For Phase One, provides a built-in generator
// that creates structured encyclopedia content. Can be swapped for any LLM API.

export interface GeneratedPage {
  title: string;
  content: string;
}

export interface PageSuggestion {
  title: string;
  reason: string;
  prompt: string;
}

function generateMarkdownArticle(
  title: string,
  wikiTopic: string,
  wikiDescription: string,
  existingPages: string[]
): string {
  const internalLinks = existingPages
    .filter((p) => p !== title)
    .slice(0, 3)
    .map((p) => `[${p}](/wiki/WIKI_ID/${encodeURIComponent(p)})`)
    .join(", ");

  const linkSection = internalLinks
    ? `\n\n## Related Topics\n\nSee also: ${internalLinks}`
    : "";

  return `# ${title}

## Overview

${title} is a key topic within the scope of ${wikiTopic}. ${wikiDescription ? `This article explores ${title} in the context of: ${wikiDescription}.` : ""}

## Background

${title} plays a significant role in understanding ${wikiTopic}. This section provides foundational context and historical background relevant to the subject.

## Details

This section covers the main aspects of ${title}:

- **Core Concepts**: The fundamental ideas and principles related to ${title}
- **Key Elements**: Important components and features
- **Connections**: How ${title} relates to other topics in ${wikiTopic}

## Significance

Understanding ${title} is essential for a comprehensive view of ${wikiTopic}. It connects to many other areas of knowledge within this domain.${linkSection}
`;
}

export async function generateStarterPageTitles(
  topic: string,
  description: string
): Promise<string[]> {
  // Generate contextually relevant starter pages based on the topic
  const basePages = [
    `Overview of ${topic}`,
    `History of ${topic}`,
    `Key Concepts in ${topic}`,
    `Notable Figures in ${topic}`,
    `Major Events in ${topic}`,
    `Cultural Impact of ${topic}`,
  ];

  return basePages.slice(0, 5);
}

export async function generatePageContent(
  title: string,
  wikiTopic: string,
  wikiDescription: string,
  existingPages: string[]
): Promise<GeneratedPage> {
  const content = generateMarkdownArticle(
    title,
    wikiTopic,
    wikiDescription,
    existingPages
  );
  return { title, content };
}

export async function generateSuggestedPages(
  wikiTopic: string,
  wikiDescription: string,
  existingPages: string[]
): Promise<PageSuggestion[]> {
  const possibleTopics = [
    {
      title: `Timeline of ${wikiTopic}`,
      reason: "A chronological overview would help readers understand the sequence of events.",
      prompt: `Write an encyclopedia article about the timeline and chronology of ${wikiTopic}.`,
    },
    {
      title: `Glossary of ${wikiTopic}`,
      reason: "A glossary of terms would help readers unfamiliar with the subject.",
      prompt: `Write a glossary article defining key terms related to ${wikiTopic}.`,
    },
    {
      title: `Controversies in ${wikiTopic}`,
      reason: "Documenting debates and controversies provides a balanced perspective.",
      prompt: `Write an encyclopedia article about major controversies and debates within ${wikiTopic}.`,
    },
    {
      title: `Future of ${wikiTopic}`,
      reason: "An article about future developments and predictions would round out the wiki.",
      prompt: `Write an encyclopedia article about the future outlook and emerging trends in ${wikiTopic}.`,
    },
  ];

  // Filter out pages that already exist
  const existingTitlesLower = existingPages.map((p) => p.toLowerCase());
  return possibleTopics.filter(
    (t) => !existingTitlesLower.includes(t.title.toLowerCase())
  );
}

export async function generateEditSuggestion(
  pageContent: string,
  suggestionDescription: string,
  type: string
): Promise<string> {
  switch (type) {
    case "expand":
      return `${pageContent}\n\n## Additional Information\n\nThis section has been expanded based on the suggestion: "${suggestionDescription}". Further details and context have been added to provide a more comprehensive treatment of the subject.`;
    case "rewrite":
      return pageContent.replace(
        /## Overview\n\n[^\n]+/,
        `## Overview\n\nThis section has been rewritten for clarity based on the suggestion: "${suggestionDescription}".`
      );
    case "fix":
      return `${pageContent}\n\n> **Editor's note**: A correction has been suggested: "${suggestionDescription}". This article has been updated accordingly.`;
    case "add_info":
      return `${pageContent}\n\n## Supplementary Information\n\n${suggestionDescription}`;
    default:
      return pageContent;
  }
}
