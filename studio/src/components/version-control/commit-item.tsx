"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Commit } from "@/types/git";

interface CommitItemProps {
  commit: Commit;
  onSelect?: (hash: string) => void;
  isSelected?: boolean;
}

export function CommitItem({ commit, onSelect, isSelected }: CommitItemProps) {
  const relativeDate = formatDistanceToNow(new Date(commit.date), {
    addSuffix: true,
  });

  return (
    <button
      type="button"
      onClick={() => onSelect?.(commit.hash)}
      className={cn(
        "w-full text-left px-3 py-2 border-b border-border transition-colors",
        "hover:bg-secondary/60",
        isSelected && "bg-secondary border-l-2 border-l-accent"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-xs text-muted-foreground flex-shrink-0">
          {commit.shortHash}
        </span>
        <span className="text-sm text-foreground truncate flex-1">
          {commit.message}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-muted-foreground">{commit.author}</span>
        <span className="text-xs text-muted-foreground">&middot;</span>
        <span className="text-xs text-muted-foreground">{relativeDate}</span>
      </div>
    </button>
  );
}
