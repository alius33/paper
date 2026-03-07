import type { FileCategory } from '@/types/files';

/**
 * Categorizes a file based on its path within the repository.
 *
 * @param filePath - Relative file path within the repo (e.g. "chapters/book-1/ch01.md")
 * @returns The category of the file
 */
export function categorizeFile(filePath: string): FileCategory {
  // Normalize separators and remove leading slashes
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');

  if (normalized === 'CLAUDE.md') {
    return 'project-guide';
  }

  if (normalized === 'series-overview.md' || normalized.startsWith('research/plot/')) {
    return 'plot';
  }

  if (normalized.startsWith('chapters/')) {
    return 'chapter';
  }

  if (normalized.startsWith('research/')) {
    return 'research';
  }

  if (normalized.startsWith('reference/')) {
    return 'reference';
  }

  if (normalized.startsWith('media/')) {
    return 'media';
  }

  return 'other';
}
