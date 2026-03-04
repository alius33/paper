/**
 * Counts words in a text string after stripping markdown formatting.
 *
 * Handles:
 * - Headings (# ## ### etc.)
 * - Bold/italic markers (* ** _ __)
 * - Links [text](url) — counts only the text
 * - Images ![alt](url) — counts only the alt text
 * - Inline code backticks
 * - Code blocks (fenced ``` and indented)
 * - HTML tags
 * - Horizontal rules (---, ***, ___)
 * - List markers (-, *, 1.)
 * - Blockquote markers (>)
 * - Scene break markers (* * *)
 *
 * @param text - The raw markdown text
 * @returns The number of words
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  let cleaned = text;

  // Remove fenced code blocks entirely
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  cleaned = cleaned.replace(/`[^`]*`/g, '');

  // Remove images, keep alt text
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Remove links, keep link text
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Remove heading markers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove blockquote markers
  cleaned = cleaned.replace(/^>\s*/gm, '');

  // Remove list markers (unordered: - * +, ordered: 1. 2. etc.)
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove bold/italic markers
  cleaned = cleaned.replace(/(\*{1,3}|_{1,3})/g, '');

  // Remove scene break markers (e.g., "* * *")
  cleaned = cleaned.replace(/^\s*\*\s+\*\s+\*\s*$/gm, '');

  // Collapse multiple whitespace into single spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (cleaned.length === 0) {
    return 0;
  }

  // Split on whitespace and filter out empty strings
  const words = cleaned.split(/\s+/).filter((word) => word.length > 0);

  return words.length;
}
