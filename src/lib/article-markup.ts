import type { ArticleSection } from "@/types/content";

/**
 * Simple authoring format for travel guide articles:
 *
 *   ## Section heading
 *   First paragraph.
 *
 *   Second paragraph.
 *
 * Stored in the database as structured JSON ({ heading, paragraphs[] }), so no
 * HTML is ever accepted from the editor or rendered unescaped.
 */
export function parseArticleMarkup(markup: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const paragraphs = current.lines
      .join("\n")
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);
    if (current.heading || paragraphs.length > 0) {
      sections.push({ heading: current.heading, paragraphs });
    }
  };

  for (const line of markup.replace(/\r\n/g, "\n").split("\n")) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      flush();
      current = { heading: heading[1].trim(), lines: [] };
    } else {
      current ??= { heading: "", lines: [] };
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

export function serializeArticleMarkup(sections: ArticleSection[]): string {
  return sections
    .map((s) =>
      [s.heading ? `## ${s.heading}` : null, s.paragraphs.join("\n\n")]
        .filter((part) => part !== null && part !== "")
        .join("\n"),
    )
    .join("\n\n");
}
