import fs from 'fs/promises';
import path from 'path';
import { EXCLUDED_DIRS, EDITABLE_EXTENSIONS } from './constants';
import { categorizeFile } from './file-categories';
import { countWords } from './word-count';
import type { FileNode, FileContent } from '@/types/files';

/**
 * Validates that a file path does not escape the repository root.
 * Prevents directory traversal attacks.
 *
 * @param repoPath - The root repository path
 * @param filePath - The relative file path to validate
 * @returns The resolved absolute path
 * @throws Error if the path escapes the repo root
 */
function resolveAndValidate(repoPath: string, filePath: string): string {
  const resolvedRepo = path.resolve(repoPath);
  const resolvedFile = path.resolve(resolvedRepo, filePath);

  if (!resolvedFile.startsWith(resolvedRepo + path.sep) && resolvedFile !== resolvedRepo) {
    throw new Error('Path traversal detected: file path escapes repository root');
  }

  return resolvedFile;
}

/**
 * Recursively reads a directory and builds a file tree structure.
 * Excludes directories listed in EXCLUDED_DIRS.
 * Includes word counts for markdown files and file categories.
 *
 * @param repoPath - The root repository path
 * @returns Array of FileNode objects representing the tree
 */
export async function getFileTree(repoPath: string): Promise<FileNode[]> {
  const resolvedRepo = path.resolve(repoPath);

  async function readDir(dirPath: string, relativePath: string): Promise<FileNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    // Sort entries: directories first, then files, both alphabetically
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of sorted) {
      const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const entryAbsPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.includes(entry.name)) {
          continue;
        }

        const children = await readDir(entryAbsPath, entryRelPath);
        nodes.push({
          name: entry.name,
          path: entryRelPath,
          type: 'directory',
          children,
          category: categorizeFile(entryRelPath),
        });
      } else {
        const stat = await fs.stat(entryAbsPath);
        const ext = path.extname(entry.name).toLowerCase();
        const node: FileNode = {
          name: entry.name,
          path: entryRelPath,
          type: 'file',
          lastModified: stat.mtime.toISOString(),
          size: stat.size,
          category: categorizeFile(entryRelPath),
        };

        // Add word count for markdown files
        if (EDITABLE_EXTENSIONS.includes(ext)) {
          try {
            const content = await fs.readFile(entryAbsPath, 'utf-8');
            node.wordCount = countWords(content);
          } catch {
            // If we can't read the file, skip word count
          }
        }

        nodes.push(node);
      }
    }

    return nodes;
  }

  return readDir(resolvedRepo, '');
}

/**
 * Reads a file and returns its content along with metadata.
 *
 * @param repoPath - The root repository path
 * @param filePath - Relative path to the file within the repo
 * @returns File content and metadata (word count, last modified, size)
 */
export async function readFileContent(repoPath: string, filePath: string): Promise<FileContent> {
  const absPath = resolveAndValidate(repoPath, filePath);
  const stat = await fs.stat(absPath);
  const content = await fs.readFile(absPath, 'utf-8');

  return {
    content,
    metadata: {
      wordCount: countWords(content),
      lastModified: stat.mtime.toISOString(),
      size: stat.size,
    },
  };
}

/**
 * Writes content to a file, creating parent directories if needed.
 *
 * @param repoPath - The root repository path
 * @param filePath - Relative path to the file within the repo
 * @param content - The content to write
 */
export async function writeFileContent(
  repoPath: string,
  filePath: string,
  content: string
): Promise<void> {
  const absPath = resolveAndValidate(repoPath, filePath);

  // Ensure parent directory exists
  const dir = path.dirname(absPath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(absPath, content, 'utf-8');
}
