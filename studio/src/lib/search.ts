import fs from 'fs/promises';
import path from 'path';
import { EXCLUDED_DIRS, EDITABLE_EXTENSIONS, MAX_SEARCH_RESULTS } from './constants';

export interface SearchResult {
  filePath: string;
  line: string;
  lineNumber: number;
  contextBefore: string[];
  contextAfter: string[];
}

/**
 * Searches markdown files in the repository for a query string.
 * Returns matching lines with surrounding context.
 *
 * @param repoPath - The root repository path
 * @param query - The search string (case-insensitive)
 * @param scope - Optional directory scope to limit the search (e.g. "chapters/book-1")
 * @param limit - Maximum number of results (defaults to MAX_SEARCH_RESULTS)
 * @returns Array of search results with file path, matching line, line number, and context
 */
export async function searchFiles(
  repoPath: string,
  query: string,
  scope?: string,
  limit: number = MAX_SEARCH_RESULTS
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const resolvedRepo = path.resolve(repoPath);
  const searchRoot = scope
    ? path.resolve(resolvedRepo, scope)
    : resolvedRepo;

  // Validate that the search root is within the repo
  if (!searchRoot.startsWith(resolvedRepo)) {
    throw new Error('Search scope escapes repository root');
  }

  const queryLower = query.toLowerCase();
  const contextLines = 2;

  async function walkAndSearch(dirPath: string): Promise<void> {
    if (results.length >= limit) return;

    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (results.length >= limit) return;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.includes(entry.name)) continue;
        await walkAndSearch(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!EDITABLE_EXTENSIONS.includes(ext)) continue;

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          const relativePath = path.relative(resolvedRepo, fullPath);

          for (let i = 0; i < lines.length; i++) {
            if (results.length >= limit) break;

            if (lines[i].toLowerCase().includes(queryLower)) {
              const contextBefore: string[] = [];
              const contextAfter: string[] = [];

              for (let b = Math.max(0, i - contextLines); b < i; b++) {
                contextBefore.push(lines[b]);
              }

              for (let a = i + 1; a <= Math.min(lines.length - 1, i + contextLines); a++) {
                contextAfter.push(lines[a]);
              }

              results.push({
                filePath: relativePath,
                line: lines[i],
                lineNumber: i + 1,
                contextBefore,
                contextAfter,
              });
            }
          }
        } catch {
          // Skip files we can't read
        }
      }
    }
  }

  await walkAndSearch(searchRoot);
  return results;
}
