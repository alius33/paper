'use client';

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
  // Get the filename without extension
  const filename = filePath.split('/').pop()?.replace(/\.md$/, '') ?? filePath;

  // Try to match the chapter pattern: ch01-the-title-here
  const match = filename.match(/^ch(\d+)-(.+)$/);
  if (!match) {
    // Not a chapter file — show the filename as title
    return { chapterNumber: null, title: formatTitle(filename) };
  }

  const num = parseInt(match[1], 10);
  const rawTitle = match[2];

  return {
    chapterNumber: String(num),
    title: formatTitle(rawTitle),
  };
}

/**
 * Converts kebab-case to Title Case.
 * "the-suq-al-warraqin" → "The Suq al-Warraqin"
 *
 * Keeps lowercase for common short words (articles, prepositions)
 * except when they appear at the start.
 */
function formatTitle(kebab: string): string {
  const lowerWords = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'but', 'or', 'al']);

  return kebab
    .split('-')
    .map((word, i) => {
      if (i === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (lowerWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function EditorHeader({ filePath }: EditorHeaderProps) {
  const { chapterNumber, title } = parseChapterInfo(filePath);

  return (
    <div className="border-b border-border bg-card px-4 py-3 md:px-6">
      <h1 className="font-serif text-xl font-semibold text-primary">
        {chapterNumber ? (
          <>Chapter {chapterNumber}: {title}</>
        ) : (
          title
        )}
      </h1>
      <p className="mt-0.5 text-xs text-muted-foreground">{filePath}</p>
    </div>
  );
}

export default EditorHeader;
