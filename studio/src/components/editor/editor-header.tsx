"use client";

interface EditorHeaderProps {
  filePath: string;
}

/**
 * Extracts a human-readable chapter title from a file path.
 *
 * Converts paths like "chapters/book-1/ch05-the-suq-al-warraqin.md"
 * into "Chapter 5: The Suq al-Warraqin".
 */
function parseChapterInfo(filePath: string): {
  chapterNumber: string | null;
  title: string;
} {
  const filename = filePath.split("/").pop()?.replace(/\.md$/, "") ?? filePath;
  const match = filename.match(/^ch(\d+)-(.+)$/);
  if (!match) {
    return { chapterNumber: null, title: formatTitle(filename) };
  }

  const num = parseInt(match[1], 10);
  const rawTitle = match[2];

  return {
    chapterNumber: String(num),
    title: formatTitle(rawTitle),
  };
}

function formatTitle(kebab: string): string {
  const lowerWords = new Set([
    "a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "but", "or", "al",
  ]);

  return kebab
    .split("-")
    .map((word, i) => {
      if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      if (lowerWords.has(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function EditorHeader({ filePath }: EditorHeaderProps) {
  const { chapterNumber, title } = parseChapterInfo(filePath);

  return (
    <div className="border-b border-border bg-card px-4 py-3 md:px-6">
      {chapterNumber && (
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          Chapter {chapterNumber}
        </p>
      )}
      <h1 className="text-[22px] font-semibold tracking-tight text-foreground mt-1">
        {title}
      </h1>
    </div>
  );
}

export default EditorHeader;
