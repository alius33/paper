"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";

interface ViewerClientProps {
  content: string;
  filePath: string;
}

export function ViewerClient({ content, filePath }: ViewerClientProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-mono truncate">
            {filePath}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <MarkdownViewer content={content} filePath={filePath} />
      </div>
    </div>
  );
}
