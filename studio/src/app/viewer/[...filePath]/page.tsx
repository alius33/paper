import { FileWarning } from "lucide-react";
import { readFileContent } from "@/lib/files";
import { getRepoPath } from "@/lib/repo-config";
import { ViewerClient } from "./viewer-client";

interface ViewerPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  let content: string | null = null;
  let error: string | null = null;

  try {
    const repoPath = getRepoPath();
    const file = await readFileContent(repoPath, path);
    content = file.content;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read file";
    if (message.includes("ENOENT") || message.includes("no such file")) {
      error = "File not found";
    } else {
      error = message;
    }
  }

  if (error || content === null) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="max-w-md px-8 text-center">
          <FileWarning className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
            {error === "File not found" ? "File Not Found" : "Error"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error || "Could not load file."}
          </p>
          <p className="mt-2 text-xs text-sidebar-muted font-mono">{path}</p>
        </div>
      </div>
    );
  }

  return <ViewerClient content={content} filePath={path} />;
}
