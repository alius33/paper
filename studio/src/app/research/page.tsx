import { getRepoPath } from "@/lib/repo-config";
import { getFileTree } from "@/lib/files";
import { ResearchPageClient } from "./research-page-client";
import type { FileNode } from "@/types/files";

interface FileInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

function collectResearchFiles(
  nodes: FileNode[],
  researchFiles: FileInfo[],
  digestFiles: FileInfo[]
): void {
  for (const node of nodes) {
    if (node.type === "file" && node.name.endsWith(".md")) {
      const info: FileInfo = {
        name: node.name.replace(/\.md$/, "").replace(/-/g, " "),
        path: node.path,
        wordCount: node.wordCount || 0,
        lastModified: node.lastModified || "",
      };

      if (
        node.category === "research" &&
        !node.path.startsWith("research/digests/")
      ) {
        researchFiles.push(info);
      }

      if (node.path.startsWith("research/digests/")) {
        digestFiles.push(info);
      }
    } else if (node.children) {
      collectResearchFiles(node.children, researchFiles, digestFiles);
    }
  }
}

export default async function ResearchPage() {
  let researchFiles: FileInfo[] = [];
  let digestFiles: FileInfo[] = [];

  try {
    const repoPath = getRepoPath();
    const tree = await getFileTree(repoPath);
    collectResearchFiles(tree, researchFiles, digestFiles);
    researchFiles.sort((a, b) => a.path.localeCompare(b.path));
    digestFiles.sort((a, b) => a.path.localeCompare(b.path));
  } catch {
    // Page will render with empty arrays
  }

  return (
    <ResearchPageClient
      researchFiles={researchFiles}
      digestFiles={digestFiles}
    />
  );
}
