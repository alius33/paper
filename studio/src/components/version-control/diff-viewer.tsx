"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Splits a unified diff string into an array of hunk strings.
 * Each hunk starts with an @@ line.
 */
function splitDiffIntoHunks(diff: string): string[] {
  const hunks: string[] = [];
  const lines = diff.split("\n");
  let currentHunk: string[] = [];

  for (const line of lines) {
    if (line.startsWith("@@")) {
      if (currentHunk.length > 0) {
        hunks.push(currentHunk.join("\n"));
      }
      currentHunk = [line];
    } else if (currentHunk.length > 0) {
      currentHunk.push(line);
    }
    // Skip lines before the first @@ (diff header)
  }

  if (currentHunk.length > 0) {
    hunks.push(currentHunk.join("\n"));
  }

  return hunks;
}

interface DiffViewerProps {
  filePath: string;
  fromHash: string;
  toHash: string;
}

export function DiffViewer({ filePath, fromHash, toHash }: DiffViewerProps) {
  const [diff, setDiff] = useState<string | null>(null);
  const [oldContent, setOldContent] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [DiffViewComponent, setDiffViewComponent] = useState<React.ComponentType<any> | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const shortFrom = fromHash.substring(0, 7);
  const shortTo = toHash.substring(0, 7);

  // Dynamically import DiffView to avoid SSR issues with CSS
  useEffect(() => {
    let cancelled = false;

    async function loadDiffView() {
      try {
        const mod = await import("@git-diff-view/react");
        if (!cancelled) {
          setDiffViewComponent(() => mod.DiffView);
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true);
        }
      }
    }

    loadDiffView();
    return () => { cancelled = true; };
  }, []);

  // Fetch diff and file contents
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: fromHash,
        to: toHash,
        file: filePath,
      });

      const [diffRes, oldRes, newRes] = await Promise.all([
        fetch(`/api/git/diff?${params.toString()}`),
        fetch(
          `/api/git/show?hash=${encodeURIComponent(fromHash)}&file=${encodeURIComponent(filePath)}`
        ).catch(() => null),
        fetch(
          `/api/git/show?hash=${encodeURIComponent(toHash)}&file=${encodeURIComponent(filePath)}`
        ).catch(() => null),
      ]);

      if (!diffRes.ok) {
        throw new Error("Failed to fetch diff");
      }

      const diffData = await diffRes.json();
      setDiff(diffData.diff || "");

      if (oldRes && oldRes.ok) {
        const oldData = await oldRes.json();
        setOldContent(oldData.content || "");
      } else {
        setOldContent("");
      }

      if (newRes && newRes.ok) {
        const newData = await newRes.json();
        setNewContent(newData.content || "");
      } else {
        setNewContent("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch diff");
    } finally {
      setIsLoading(false);
    }
  }, [fromHash, toHash, filePath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hunks = useMemo(() => {
    if (!diff) return [];
    return splitDiffIntoHunks(diff);
  }, [diff]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading diff...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!diff || diff.trim() === "") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground italic">
          No changes between these versions
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-sidebar text-sm">
        <span className="text-muted-foreground">Comparing</span>
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {shortFrom}
        </span>
        <span className="text-muted-foreground">&rarr;</span>
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {shortTo}
        </span>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        {!useFallback && DiffViewComponent && hunks.length > 0 ? (
          <RichDiffView
            DiffView={DiffViewComponent}
            filePath={filePath}
            oldContent={oldContent}
            newContent={newContent}
            hunks={hunks}
          />
        ) : (
          <FallbackDiffView diff={diff} />
        )}
      </div>
    </div>
  );
}

/** Wrapper to render the @git-diff-view/react DiffView with error boundary */
function RichDiffView({
  DiffView,
  filePath,
  oldContent,
  newContent,
  hunks,
}: {
  DiffView: React.ComponentType<any>;
  filePath: string;
  oldContent: string;
  newContent: string;
  hunks: string[];
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <FallbackDiffView diff={hunks.join("\n")} />
    );
  }

  try {
    return (
      <DiffView
        data={{
          oldFile: {
            fileName: filePath,
            fileLang: "markdown",
            content: oldContent,
          },
          newFile: {
            fileName: filePath,
            fileLang: "markdown",
            content: newContent,
          },
          hunks,
        }}
        diffViewMode={4}
        diffViewWrap={true}
        diffViewTheme="light"
        diffViewFontSize={13}
        diffViewHighlight={true}
      />
    );
  } catch {
    if (!hasError) setHasError(true);
    return <FallbackDiffView diff={hunks.join("\n")} />;
  }
}

/** Fallback diff viewer: renders unified diff with colored lines */
function FallbackDiffView({ diff }: { diff: string }) {
  const lines = diff.split("\n");

  return (
    <div className="font-mono text-xs leading-5 p-0">
      {lines.map((line, i) => {
        let lineClass = "px-4 py-0";
        if (line.startsWith("+") && !line.startsWith("+++")) {
          lineClass = cn(lineClass, "bg-green-50 text-green-800");
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          lineClass = cn(lineClass, "bg-red-50 text-red-800");
        } else if (line.startsWith("@@")) {
          lineClass = cn(lineClass, "bg-blue-50 text-blue-700 font-semibold");
        } else {
          lineClass = cn(lineClass, "text-muted-foreground");
        }

        return (
          <div key={i} className={lineClass}>
            <pre className="whitespace-pre-wrap break-all m-0">{line}</pre>
          </div>
        );
      })}
    </div>
  );
}
