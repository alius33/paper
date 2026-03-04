"use client";

import { GitCommitHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  author: string;
}

interface RecentActivityProps {
  commits: CommitInfo[];
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

export function RecentActivity({ commits }: RecentActivityProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <GitCommitHorizontal className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Recent Activity
        </h3>
      </div>

      {commits.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
          No commits yet.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {commits.slice(0, 10).map((commit) => (
            <div
              key={commit.hash}
              className="flex items-start gap-2.5 px-4 py-2.5"
            >
              <GitCommitHorizontal className="h-3.5 w-3.5 text-sidebar-muted flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug truncate">
                  {commit.message}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[10px] text-accent font-mono">
                    {commit.shortHash}
                  </code>
                  <span className="text-[10px] text-sidebar-muted">
                    {formatRelativeDate(commit.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
