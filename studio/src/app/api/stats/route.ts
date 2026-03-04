import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getFileTree } from '@/lib/files';
import { getLog } from '@/lib/git';
import type { FileNode } from '@/types/files';

interface ChapterInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface ProjectStats {
  totalFiles: number;
  totalWords: number;
  chapters: ChapterInfo[];
  chapterCount: number;
  totalChapterWords: number;
  recentCommits: { hash: string; shortHash: string; message: string; date: string; author: string }[];
  filesByCategory: Record<string, number>;
}

function collectStats(
  nodes: FileNode[],
  stats: {
    totalFiles: number;
    totalWords: number;
    chapters: ChapterInfo[];
    filesByCategory: Record<string, number>;
  }
): void {
  for (const node of nodes) {
    if (node.type === 'file') {
      stats.totalFiles++;
      if (node.wordCount) {
        stats.totalWords += node.wordCount;
      }

      // Track files by category
      const category = node.category || 'other';
      stats.filesByCategory[category] = (stats.filesByCategory[category] || 0) + 1;

      // Collect chapter info
      if (node.category === 'chapter' && node.name.endsWith('.md')) {
        stats.chapters.push({
          name: node.name.replace(/\.md$/, '').replace(/-/g, ' '),
          path: node.path,
          wordCount: node.wordCount || 0,
          lastModified: node.lastModified || '',
        });
      }
    } else if (node.children) {
      collectStats(node.children, stats);
    }
  }
}

export async function GET() {
  try {
    const repoPath = getRepoPath();

    // Get file tree and commit log in parallel
    const [tree, commits] = await Promise.all([
      getFileTree(repoPath),
      getLog(repoPath, undefined, 10),
    ]);

    const stats: {
      totalFiles: number;
      totalWords: number;
      chapters: ChapterInfo[];
      filesByCategory: Record<string, number>;
    } = {
      totalFiles: 0,
      totalWords: 0,
      chapters: [],
      filesByCategory: {},
    };

    collectStats(tree, stats);

    // Sort chapters by path for consistent ordering
    stats.chapters.sort((a, b) => a.path.localeCompare(b.path));

    const totalChapterWords = stats.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

    const response: ProjectStats = {
      totalFiles: stats.totalFiles,
      totalWords: stats.totalWords,
      chapters: stats.chapters,
      chapterCount: stats.chapters.length,
      totalChapterWords,
      recentCommits: commits.map((c) => ({
        hash: c.hash,
        shortHash: c.shortHash,
        message: c.message,
        date: c.date,
        author: c.author,
      })),
      filesByCategory: stats.filesByCategory,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
