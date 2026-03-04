"use client";

import { GitBranch } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function GitStatusBadge() {
  const gitBranch = useAppStore((s) => s.gitBranch);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <GitBranch className="h-3 w-3" />
      <span className="truncate max-w-[120px]">{gitBranch}</span>
    </span>
  );
}
