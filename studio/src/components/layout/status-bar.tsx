"use client";

import { useAppStore } from "@/lib/store";
import { GitBranch, Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const currentFile = useAppStore((s) => s.currentFile);
  const wordCount = useAppStore((s) => s.wordCount);
  const selectionWordCount = useAppStore((s) => s.selectionWordCount);
  const saveStatus = useAppStore((s) => s.saveStatus);
  const gitBranch = useAppStore((s) => s.gitBranch);

  const saveStatusDisplay = () => {
    switch (saveStatus) {
      case "saved":
        return (
          <span className="flex items-center gap-1 status-saved">
            <Check className="h-3 w-3" />
            Saved
          </span>
        );
      case "saving":
        return (
          <span className="flex items-center gap-1 text-accent-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        );
      case "unsaved":
        return (
          <span className="flex items-center gap-1 text-destructive">
            <Circle className="h-2.5 w-2.5 fill-current" />
            Unsaved
          </span>
        );
      case "idle":
      default:
        return null;
    }
  };

  const wordCountDisplay = () => {
    if (wordCount === 0 && !currentFile) return null;
    if (selectionWordCount > 0) {
      return `${wordCount.toLocaleString()} words (${selectionWordCount.toLocaleString()} sel)`;
    }
    return `${wordCount.toLocaleString()} words`;
  };

  return (
    <div className="status-bar flex items-center justify-between px-3 py-1.5 select-none md:px-4">
      {/* Left: File path — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 min-w-0 flex-shrink">
        <span className={cn("truncate text-xs", !currentFile && "italic")}>
          {currentFile || "No file open"}
        </span>
      </div>

      {/* Mobile left: save status */}
      <div className="flex md:hidden items-center">
        <span className="text-xs">{saveStatusDisplay()}</span>
      </div>

      {/* Center: Word count */}
      <div className="flex-shrink-0 text-xs">
        {wordCountDisplay()}
      </div>

      {/* Right: Git branch + save status (desktop) */}
      <div className="hidden md:flex items-center gap-3 flex-shrink-0">
        <span className="flex items-center gap-1 text-xs">
          <GitBranch className="h-3 w-3" />
          {gitBranch}
        </span>
        <span className="text-xs">{saveStatusDisplay()}</span>
      </div>

      {/* Mobile right: abbreviated git branch */}
      <div className="flex md:hidden items-center flex-shrink-0">
        <span className="flex items-center gap-1 text-xs">
          <GitBranch className="h-3 w-3" />
          <span className="max-w-[80px] truncate">{gitBranch}</span>
        </span>
      </div>
    </div>
  );
}
