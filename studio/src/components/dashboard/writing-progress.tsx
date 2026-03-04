"use client";

import { Feather } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface WritingProgressProps {
  totalWords: number;
  chapterStats: ChapterInfo[];
}

// Book 1 target: ~15 chapters x 6,000 avg = 90,000 words
const BOOK_1_TARGET = 90000;
const TARGET_PER_CHAPTER = 6000;

function formatChapterLabel(name: string): string {
  const match = name.match(/^ch(\d+)/i);
  if (match) return `Ch ${parseInt(match[1], 10)}`;
  return name.substring(0, 5);
}

export function WritingProgress({
  totalWords,
  chapterStats,
}: WritingProgressProps) {
  const totalChapterWords = chapterStats.reduce(
    (sum, ch) => sum + ch.wordCount,
    0
  );
  const progressPercent = Math.min(
    (totalChapterWords / BOOK_1_TARGET) * 100,
    100
  );
  const avgWords =
    chapterStats.length > 0
      ? Math.round(totalChapterWords / chapterStats.length)
      : 0;

  // Find max word count for scaling bars
  const maxWords = Math.max(
    ...chapterStats.map((ch) => ch.wordCount),
    TARGET_PER_CHAPTER
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Feather className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Writing Progress
        </h3>
      </div>

      {/* Total word count */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif font-bold text-primary tabular-nums">
            {totalChapterWords.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            / {BOOK_1_TARGET.toLocaleString()} words
          </span>
        </div>
        <p className="text-[10px] text-sidebar-muted mt-0.5">
          {totalWords.toLocaleString()} total words across all files
        </p>
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">
            Book 1 Progress
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Per-chapter bars */}
      {chapterStats.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground">
            Per chapter ({avgWords.toLocaleString()} avg)
          </p>
          {chapterStats.map((ch) => {
            const pct = (ch.wordCount / maxWords) * 100;
            const atTarget = ch.wordCount >= TARGET_PER_CHAPTER;
            return (
              <div key={ch.path} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0 tabular-nums">
                  {formatChapterLabel(ch.name)}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      atTarget ? "bg-primary" : "bg-accent"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-sidebar-muted w-10 text-right flex-shrink-0 tabular-nums">
                  {(ch.wordCount / 1000).toFixed(1)}k
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
