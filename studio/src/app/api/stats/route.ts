import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getFileTree } from '@/lib/files';
import { getLog } from '@/lib/git';
import type { FileNode } from '@/types/files';

interface FileInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface ProjectStats {
  totalFiles: number;
  totalWords: number;
  chapters: FileInfo[];
  chapterCount: number;
  totalChapterWords: number;
  researchFiles: FileInfo[];
  digestFiles: FileInfo[];
  recentCommits: { hash: string; shortHash: string; message: string; date: string; author: string }[];
  filesByCategory: Record<string, number>;
}

function collectStats(
  nodes: FileNode[],
  stats: {
    totalFiles: number;
    totalWords: number;
    chapters: FileInfo[];
    researchFiles: FileInfo[];
    digestFiles: FileInfo[];
    filesByCategory: Record<string, number>;
  }
): void {
  for (const node of nodes) {
    if (node.type === 'file') {
      stats.totalFiles++;
      if (node.wordCount) {
        stats.totalWords += node.wordCount;
      }

      const category = node.category || 'other';
      stats.filesByCategory[category] = (stats.filesByCategory[category] || 0) + 1;

      if (node.name.endsWith('.md')) {
        const info: FileInfo = {
          name: node.name.replace(/\.md$/, '').replace(/-/g, ' '),
          path: node.path,
          wordCount: node.wordCount || 0,
          lastModified: node.lastModified || '',
        };

        if (node.category === 'chapter') {
          stats.chapters.push(info);
        }

        // Research files (excluding digests)
        if (node.category === 'research' && !node.path.startsWith('research/digests/')) {
          stats.researchFiles.push(info);
        }

        // Digest files
        if (node.path.startsWith('research/digests/')) {
          stats.digestFiles.push(info);
        }
      }
    } else if (node.children) {
      collectStats(node.children, stats);
    }
  }
}

export async function GET() {
  try {
    const repoPath = getRepoPath();

    const [tree, commits] = await Promise.all([
      getFileTree(repoPath),
      getLog(repoPath, undefined, 10),
    ]);

    const stats = {
      totalFiles: 0,
      totalWords: 0,
      chapters: [] as FileInfo[],
      researchFiles: [] as FileInfo[],
      digestFiles: [] as FileInfo[],
      filesByCategory: {} as Record<string, number>,
    };

    collectStats(tree, stats);

    stats.chapters.sort((a, b) => a.path.localeCompare(b.path));
    stats.researchFiles.sort((a, b) => a.path.localeCompare(b.path));
    stats.digestFiles.sort((a, b) => a.path.localeCompare(b.path));

    const totalChapterWords = stats.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

    const response: ProjectStats = {
      totalFiles: stats.totalFiles,
      totalWords: stats.totalWords,
      chapters: stats.chapters,
      chapterCount: stats.chapters.length,
      totalChapterWords,
      researchFiles: stats.researchFiles,
      digestFiles: stats.digestFiles,
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
