"use client";

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
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Recent Activity
      </p>
      {commits.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No commits yet.
        </p>
      ) : (
        <div>
          {commits.slice(0, 8).map((commit) => (
            <div
              key={commit.hash}
              className="border-b border-border py-2.5"
            >
              <p className="text-sm text-foreground truncate">
                {commit.message}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {formatRelativeDate(commit.date)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
