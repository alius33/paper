import { getRepoPath } from "@/lib/repo-config";
import { getFileTree } from "@/lib/files";
import { getLog } from "@/lib/git";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { FileNode } from "@/types/files";

interface FileInfo {
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
    chapters: FileInfo[];
    researchFiles: FileInfo[];
    digestFiles: FileInfo[];
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

      if (node.name.endsWith(".md")) {
        const info: FileInfo = {
          name: node.name.replace(/\.md$/, "").replace(/-/g, " "),
          path: node.path,
          wordCount: node.wordCount || 0,
          lastModified: node.lastModified || "",
        };

        if (node.category === "chapter") {
          stats.chapters.push(info);
        }

        if (node.category === "research" && !node.path.startsWith("research/digests/")) {
          stats.researchFiles.push(info);
        }

        if (node.path.startsWith("research/digests/")) {
          stats.digestFiles.push(info);
        }
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
  let chapters: FileInfo[] = [];
  let researchFiles: FileInfo[] = [];
  let digestFiles: FileInfo[] = [];
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
      chapters: [] as FileInfo[],
      researchFiles: [] as FileInfo[],
      digestFiles: [] as FileInfo[],
      filesByCategory: {} as Record<string, number>,
    };

    collectStats(tree, stats);
    stats.chapters.sort((a, b) => a.path.localeCompare(b.path));
    stats.researchFiles.sort((a, b) => a.path.localeCompare(b.path));
    stats.digestFiles.sort((a, b) => a.path.localeCompare(b.path));

    totalWords = stats.totalWords;
    totalFiles = stats.totalFiles;
    chapters = stats.chapters;
    researchFiles = stats.researchFiles;
    digestFiles = stats.digestFiles;
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
      researchFiles={researchFiles}
      digestFiles={digestFiles}
      recentCommits={recentCommits}
      filesByCategory={filesByCategory}
    />
  );
}
