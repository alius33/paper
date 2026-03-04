"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, RotateCcw, GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { HistoryPanel } from "@/components/version-control/history-panel";
import { DiffViewer } from "@/components/version-control/diff-viewer";
import { RestoreDialog } from "@/components/version-control/restore-dialog";

interface HistoryPageClientProps {
  filePath: string;
}

export function HistoryPageClient({ filePath }: HistoryPageClientProps) {
  // Track up to 2 selected commit hashes: [first selected, second selected]
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");

  const handleSelectCommit = useCallback((hash: string) => {
    setSelectedCommits((prev) => {
      // If already selected, deselect it
      if (prev.includes(hash)) {
        return prev.filter((h) => h !== hash);
      }
      // If we have 2 already, replace the oldest (shift out first, push new)
      if (prev.length >= 2) {
        return [prev[1], hash];
      }
      return [...prev, hash];
    });
  }, []);

  // When user clicks "Restore", fetch the commit message for the selected hash
  const handleRestoreClick = useCallback(async () => {
    const restoreHash = selectedCommits.length >= 1 ? selectedCommits[0] : null;
    if (!restoreHash) return;

    try {
      const res = await fetch(`/api/git/log?limit=50`);
      if (res.ok) {
        const data = await res.json();
        const commits = data.commits || [];
        const match = commits.find(
          (c: { hash: string; message: string }) => c.hash === restoreHash
        );
        setRestoreMessage(match?.message || "");
      }
    } catch {
      setRestoreMessage("");
    }
    setShowRestore(true);
  }, [selectedCommits]);

  // Determine from/to for diffing.
  // Since commits come in reverse chronological order in the list,
  // we use the order they were selected: first = to, second = from
  // This way: clicking commit A then commit B shows diff from B -> A
  const fromHash = selectedCommits.length === 2 ? selectedCommits[1] : null;
  const toHash = selectedCommits.length >= 1 ? selectedCommits[0] : null;

  const restoreHash = selectedCommits.length >= 1 ? selectedCommits[0] : null;

  const handleRestoreConfirm = useCallback(() => {
    setShowRestore(false);
    setSelectedCommits([]);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-sidebar">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground truncate">
          History: {filePath}
        </h1>
        <div className="flex-1" />
        {restoreHash && (
          <button
            type="button"
            onClick={handleRestoreClick}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Restore to {restoreHash.substring(0, 7)}
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel: commit history (40%) */}
        <div className="w-2/5 border-r border-border flex flex-col min-h-0">
          <HistoryPanel
            filePath={filePath}
            onSelectCommit={handleSelectCommit}
            selectedHashes={selectedCommits}
          />
        </div>

        {/* Right panel: diff viewer (60%) */}
        <div className="w-3/5 flex flex-col min-h-0">
          {fromHash && toHash ? (
            <DiffViewer
              filePath={filePath}
              fromHash={fromHash}
              toHash={toHash}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <GitCompareArrows className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {selectedCommits.length === 0
                  ? "Select two commits to compare"
                  : "Select one more commit to compare"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click on commits in the history panel to select them
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Restore dialog */}
      {restoreHash && (
        <RestoreDialog
          filePath={filePath}
          hash={restoreHash}
          commitMessage={restoreMessage}
          onConfirm={handleRestoreConfirm}
          onCancel={() => setShowRestore(false)}
          isOpen={showRestore}
        />
      )}
    </div>
  );
}
