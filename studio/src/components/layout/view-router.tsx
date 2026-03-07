"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ManuscriptView } from "@/components/manuscript/manuscript-view";
import { ResearchView } from "@/components/research/research-view";

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

interface ViewRouterProps {
  dashboardData: {
    totalWords: number;
    totalFiles: number;
    chapterCount: number;
    totalChapterWords: number;
    chapters: FileInfo[];
    researchFiles: FileInfo[];
    digestFiles: FileInfo[];
    recentCommits: CommitInfo[];
    filesByCategory: Record<string, number>;
  };
}

export function ViewRouter({ dashboardData }: ViewRouterProps) {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <div className="h-full overflow-hidden view-animate-in" key={activeView}>
      {activeView === "dashboard" && <DashboardContent {...dashboardData} />}
      {activeView === "write" && (
        <WriteChapterList chapters={dashboardData.chapters} />
      )}
      {activeView === "manuscript" && <ManuscriptView />}
      {activeView === "research" && <ResearchView />}
    </div>
  );
}

const CHAPTER_STATUS_MAP: Record<string, string> = {
  ch01: "Revised",
  ch02: "Draft",
  ch03: "Draft",
  ch04: "Draft",
  ch05: "Final",
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
  const match = name.match(/^ch\d+\s+(.+)$/);
  if (!match) return name;
  return match[1]
    .split(" ")
    .map((w, i) => {
      const lower = new Set([
        "a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "but", "or", "al",
      ]);
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
      if (lower.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function WriteChapterList({ chapters }: { chapters: FileInfo[] }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[700px] mx-auto px-6 py-8 md:px-8 md:py-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Write
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a chapter to continue writing
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {chapters.map((ch) => {
            const status = getChapterStatus(ch.path);
            const statusClasses = getStatusClasses(status);
            const chNum = parseChapterNumber(ch.path);
            const title = parseChapterTitle(ch.name);

            return (
              <Link
                key={ch.path}
                href={`/editor/${ch.path}`}
                className="flex items-center gap-3 bg-card border border-border rounded-md px-4 py-3 hover:bg-secondary/50 hover:border-muted-foreground/20 transition-colors"
              >
                <span className="bg-[var(--cat-chapter-bg)] text-[var(--cat-chapter-fg)] font-mono text-[11px] px-2 py-0.5 rounded flex-shrink-0">
                  Ch {chNum}
                </span>
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {title}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">
                  {ch.wordCount.toLocaleString()} words
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0",
                    statusClasses.bg,
                    statusClasses.fg
                  )}
                >
                  <span
                    className={cn("w-1.5 h-1.5 rounded-full", statusClasses.dot)}
                  />
                  {status}
                </span>
              </Link>
            );
          })}
        </div>

        {chapters.length === 0 && (
          <p className="text-sm text-muted-foreground mt-8 text-center">
            No chapters found.
          </p>
        )}
      </div>
    </div>
  );
}
