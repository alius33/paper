"use client";

import {
  FileText,
  FolderOpen,
  BookOpen,
  Feather,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { BookOverview } from "./book-overview";
import { WritingProgress } from "./writing-progress";
import { RecentActivity } from "./recent-activity";
import { ResearchBrowser } from "./research-browser";

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

export function DashboardContent({
  totalWords,
  totalFiles,
  chapterCount,
  totalChapterWords,
  chapters,
  researchFiles,
  digestFiles,
  recentCommits,
  filesByCategory,
}: DashboardContentProps) {
  const researchCount = (filesByCategory["research"] || 0) + (filesByCategory["plot"] || 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Paper House Studio
          </h1>
          <div className="mt-1.5 h-px w-16 bg-accent" />
          <p className="mt-3 font-serif text-sm italic text-muted-foreground">
            The House of Paper — Abbasid Caliphate, 770-814 CE
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatsCard
            title="Total Words"
            value={totalChapterWords}
            description="across all chapters"
            icon={<Feather className="h-4 w-4" />}
          />
          <StatsCard
            title="Chapters Written"
            value={chapterCount}
            description="of ~15 planned"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <StatsCard
            title="Research Files"
            value={researchCount}
            icon={<FolderOpen className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Files"
            value={totalFiles}
            description="in repository"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>

        {/* Two-column layout: Book Overview + Writing Progress */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BookOverview chapterStats={chapters} />
          </div>
          <div className="lg:col-span-2">
            <WritingProgress
              totalWords={totalWords}
              chapterStats={chapters}
            />
          </div>
        </div>

        {/* Research Library */}
        <ResearchBrowser
          researchFiles={researchFiles}
          digestFiles={digestFiles}
        />

        {/* Recent Activity */}
        <RecentActivity commits={recentCommits} />

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <QuickActionLink
              href="/editor/chapters/book-1/ch05-the-suq-al-warraqin.md"
              label="Open latest chapter"
            />
            <QuickActionLink
              href="/viewer/CLAUDE.md"
              label="View project bible"
            />
            <QuickActionLink
              href="/viewer/series_plot.md"
              label="View series plot"
            />
            <QuickActionLink
              href="/research"
              label="Research library"
            />
            <QuickActionLink
              href="/search"
              label="Search files"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent hover:bg-secondary/30 transition-colors"
    >
      {label}
    </a>
  );
}
