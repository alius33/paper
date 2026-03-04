import { getRepoPath } from "@/lib/repo-config";
import { getFileTree } from "@/lib/files";
import { getLog } from "@/lib/git";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { FileNode } from "@/types/files";

interface ChapterInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
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
    if (node.type === "file") {
      stats.totalFiles++;
      if (node.wordCount) {
        stats.totalWords += node.wordCount;
      }
      const category = node.category || "other";
      stats.filesByCategory[category] =
        (stats.filesByCategory[category] || 0) + 1;

      if (node.category === "chapter" && node.name.endsWith(".md")) {
        stats.chapters.push({
          name: node.name.replace(/\.md$/, "").replace(/-/g, " "),
          path: node.path,
          wordCount: node.wordCount || 0,
          lastModified: node.lastModified || "",
        });
      }
    } else if (node.children) {
      collectStats(node.children, stats);
    }
  }
}

export default async function HomePage() {
  let totalWords = 0;
  let totalFiles = 0;
  let chapterCount = 0;
  let totalChapterWords = 0;
  let chapters: ChapterInfo[] = [];
  let recentCommits: {
    hash: string;
    shortHash: string;
    message: string;
    date: string;
    author: string;
  }[] = [];
  let filesByCategory: Record<string, number> = {};

  try {
    const repoPath = getRepoPath();
    const [tree, commits] = await Promise.all([
      getFileTree(repoPath),
      getLog(repoPath, undefined, 10),
    ]);

    const stats = {
      totalFiles: 0,
      totalWords: 0,
      chapters: [] as ChapterInfo[],
      filesByCategory: {} as Record<string, number>,
    };

    collectStats(tree, stats);
    stats.chapters.sort((a, b) => a.path.localeCompare(b.path));

    totalWords = stats.totalWords;
    totalFiles = stats.totalFiles;
    chapters = stats.chapters;
    chapterCount = chapters.length;
    totalChapterWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    filesByCategory = stats.filesByCategory;
    recentCommits = commits.map((c) => ({
      hash: c.hash,
      shortHash: c.shortHash,
      message: c.message,
      date: c.date,
      author: c.author,
    }));
  } catch {
    // Dashboard will render with zeros if stats fail
  }

  return (
    <DashboardContent
      totalWords={totalWords}
      totalFiles={totalFiles}
      chapterCount={chapterCount}
      totalChapterWords={totalChapterWords}
      chapters={chapters}
      recentCommits={recentCommits}
      filesByCategory={filesByCategory}
    />
  );
}
