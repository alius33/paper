import { readFileContent } from "@/lib/files";
import { getRepoPath } from "@/lib/repo-config";
import { EditorHeader } from "@/components/editor/editor-header";
import { ChapterEditor } from "@/components/editor/chapter-editor";
import { FileText } from "lucide-react";

interface EditorPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  let content: string;
  try {
    const repoPath = getRepoPath();
    const file = await readFileContent(repoPath, path);
    content = file.content;
  } catch {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="max-w-md px-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            File not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Could not open{" "}
            <span className="font-medium text-foreground">{path}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorHeader filePath={path} />
      <ChapterEditor filePath={path} initialContent={content} />
    </div>
  );
}
