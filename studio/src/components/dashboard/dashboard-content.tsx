"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface FileInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  author: string;
}

interface DashboardContentProps {
  totalWords: number;
  totalFiles: number;
  chapterCount: number;
  totalChapterWords: number;
  chapters: FileInfo[];
  researchFiles: FileInfo[];
  digestFiles: FileInfo[];
  recentCommits: CommitInfo[];
  filesByCategory: Record<string, number>;
}

const CHAPTER_STATUS_MAP: Record<string, string> = {
  "ch01": "Revised",
  "ch02": "Draft",
  "ch03": "Draft",
};

function getChapterStatus(path: string): string {
  for (const [key, status] of Object.entries(CHAPTER_STATUS_MAP)) {
    if (path.includes(key)) return status;
  }
  return "Draft";
}

function getStatusClasses(status: string): { bg: string; fg: string; dot: string } {
  switch (status) {
    case "Final":
      return {
        bg: "bg-[var(--status-final-bg)]",
        fg: "text-[var(--status-final-fg)]",
        dot: "bg-[var(--status-final-dot)]",
      };
    case "Revised":
      return {
        bg: "bg-[var(--status-revised-bg)]",
        fg: "text-[var(--status-revised-fg)]",
        dot: "bg-[var(--status-revised-dot)]",
      };
    default:
      return {
        bg: "bg-[var(--status-draft-bg)]",
        fg: "text-[var(--status-draft-fg)]",
        dot: "bg-[var(--status-draft-dot)]",
      };
  }
}

function parseChapterNumber(path: string): string {
  const match = path.match(/ch(\d+)/);
  return match ? String(parseInt(match[1], 10)) : "?";
}

function parseChapterTitle(name: string): string {
  // name is like "ch05 the suq al warraqin" (already has dashes replaced with spaces)
  const match = name.match(/^ch\d+\s+(.+)$/);
  if (!match) return name;
  return match[1]
    .split(" ")
    .map((w, i) => {
      const lower = new Set(["a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "but", "or", "al"]);
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
      if (lower.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

export function DashboardContent({
  totalChapterWords,
  chapters,
  recentCommits,
}: DashboardContentProps) {
  const TARGET_WORDS = 90000;
  const progressPct = Math.min((totalChapterWords / TARGET_WORDS) * 100, 100);
  const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div>
            {/* Header */}
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-foreground">
                The House of Paper
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Abbasid Caliphate, 770-814 CE
              </p>
              <span className="inline-block bg-[var(--cat-chapter-bg)] text-[var(--cat-chapter-fg)] text-[11px] font-semibold px-3 py-1 rounded mt-3">
                Book 1 of 4
              </span>
            </div>

            {/* Progress section */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Writing Progress
              </p>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-1.5">
                {totalChapterWords.toLocaleString()} / 90,000 words
                <span className="ml-2">{progressPct.toFixed(1)}%</span>
              </p>
            </div>

            {/* Chapter list */}
            <div className="mt-8 space-y-2">
              {chapters.map((ch) => {
                const status = getChapterStatus(ch.path);
                const statusClasses = getStatusClasses(status);
                const chNum = parseChapterNumber(ch.path);
                const title = parseChapterTitle(ch.name);

                return (
                  <Link
                    key={ch.path}
                    href={`/editor/${ch.path}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-md px-3 py-2.5 hover:bg-secondary/50 hover:border-muted-foreground/20 transition-colors"
                  >
                    <span className="bg-[var(--cat-chapter-bg)] text-[var(--cat-chapter-fg)] font-mono text-[11px] px-2 py-0.5 rounded flex-shrink-0">
                      Ch {chNum}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {title}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">
                      {ch.wordCount.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0",
                        statusClasses.bg,
                        statusClasses.fg
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusClasses.dot)} />
                      {status}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Resume Writing */}
            {lastChapter && (
              <Link
                href={`/editor/${lastChapter.path}`}
                className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity mt-4"
              >
                Resume Writing
              </Link>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Recent Activity
              </p>
              {recentCommits.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No commits yet.
                </p>
              ) : (
                <div>
                  {recentCommits.slice(0, 8).map((commit) => (
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

            {/* Quick Links */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Quick Links
              </p>
              <div className="space-y-0.5">
                <a
                  href="/viewer/CLAUDE.md"
                  className="block text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md px-2 py-1.5 transition-colors"
                >
                  View project bible
                </a>
                <a
                  href="/viewer/series-overview.md"
                  className="block text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md px-2 py-1.5 transition-colors"
                >
                  View series plot
                </a>
                <button
                  onClick={() => {
                    const { setActiveView } = useAppStore.getState();
                    setActiveView("research");
                    window.history.pushState(null, "", "/");
                  }}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md px-2 py-1.5 transition-colors"
                >
                  Research library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
