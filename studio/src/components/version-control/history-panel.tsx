"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { CommitItem } from "./commit-item";
import { SnapshotDialog } from "./snapshot-dialog";
import type { Commit } from "@/types/git";

interface HistoryPanelProps {
  filePath?: string;
  onSelectCommit?: (hash: string) => void;
  selectedHashes?: string[];
}

const PAGE_SIZE = 30;

export function HistoryPanel({
  filePath,
  onSelectCommit,
  selectedHashes = [],
}: HistoryPanelProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);

  const fetchCommits = useCallback(
    async (currentLimit: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filePath) params.set("file", filePath);
        params.set("limit", String(currentLimit));

        const res = await fetch(`/api/git/log?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch commits");

        const data = await res.json();
        const fetched: Commit[] = data.commits || [];
        setCommits(fetched);
        setHasMore(fetched.length >= currentLimit);
      } catch {
        setCommits([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [filePath]
  );

  useEffect(() => {
    fetchCommits(limit);
  }, [fetchCommits, limit]);

  const handleLoadMore = () => {
    setLimit((prev) => prev + PAGE_SIZE);
  };

  const handleSnapshotCreated = () => {
    setShowSnapshotDialog(false);
    fetchCommits(limit);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-sidebar">
        <h2 className="text-sm font-semibold text-foreground">
          Commit History
        </h2>
        <button
          type="button"
          onClick={() => setShowSnapshotDialog(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-accent/20 text-accent-foreground hover:bg-accent/40 transition-colors"
        >
          <Camera className="h-3 w-3" />
          Snapshot
        </button>
      </div>

      {/* Commit list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && commits.length === 0 ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="flex gap-2">
                  <div className="h-4 w-14 bg-muted rounded" />
                  <div className="h-4 flex-1 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : commits.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground italic">
            No commits yet
          </div>
        ) : (
          <>
            {commits.map((commit) => (
              <CommitItem
                key={commit.hash}
                commit={commit}
                onSelect={onSelectCommit}
                isSelected={selectedHashes.includes(commit.hash)}
              />
            ))}
            {hasMore && (
              <div className="p-3">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Snapshot dialog */}
      {showSnapshotDialog && (
        <SnapshotDialog
          onClose={() => setShowSnapshotDialog(false)}
          onCreated={handleSnapshotCreated}
        />
      )}
    </div>
  );
}
