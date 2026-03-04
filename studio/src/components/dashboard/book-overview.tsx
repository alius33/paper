"use client";

import Link from "next/link";
import { BookOpen, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChapterInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface BookOverviewProps {
  chapterStats: ChapterInfo[];
}

function formatChapterTitle(name: string): string {
  // name comes in as e.g. "ch01 the journey to kufa"
  const match = name.match(/^ch(\d+)\s+(.+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    const title = match[2]
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `Chapter ${num}: ${title}`;
  }
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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

export function BookOverview({ chapterStats }: BookOverviewProps) {
  const book1Chapters = chapterStats.filter((ch) =>
    ch.path.startsWith("chapters/book-1/")
  );
  const otherBooks = [2, 3, 4];

  return (
    <div className="space-y-4">
      {/* Book 1 */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Book 1: The House of Paper
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {book1Chapters.length} chapter{book1Chapters.length !== 1 ? "s" : ""}
          </span>
        </div>

        {book1Chapters.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
            No chapters written yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {book1Chapters.map((chapter) => (
              <Link
                key={chapter.path}
                href={`/editor/${chapter.path}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/20 transition-colors group"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                    {formatChapterTitle(chapter.name)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {chapter.wordCount.toLocaleString()} words
                  </span>
                  {chapter.lastModified && (
                    <span className="flex items-center gap-1 text-[10px] text-sidebar-muted">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelativeDate(chapter.lastModified)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Books 2-4 placeholders */}
      <div className="grid grid-cols-3 gap-3">
        {otherBooks.map((bookNum) => {
          const titles: Record<number, string> = {
            2: "The House of Silver",
            3: "The House of Gold",
            4: "The House of Wisdom",
          };
          return (
            <div
              key={bookNum}
              className={cn(
                "rounded-lg border border-border bg-card p-4 text-center",
                "opacity-60"
              )}
            >
              <p className="text-xs font-semibold text-foreground">
                Book {bookNum}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground italic">
                {titles[bookNum]}
              </p>
              <p className="mt-2 text-[10px] text-sidebar-muted">
                Coming soon
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
