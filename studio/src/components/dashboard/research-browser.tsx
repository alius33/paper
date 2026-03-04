"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, FileText, Library, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface ResearchBrowserProps {
  researchFiles: FileInfo[];
  digestFiles: FileInfo[];
}

/** Group research files by their subdirectory (e.g. "characters", "journeys") */
function groupBySubdir(files: FileInfo[]): Record<string, FileInfo[]> {
  const groups: Record<string, FileInfo[]> = {};
  for (const file of files) {
    // path like "research/characters/foo.md" → "characters"
    const parts = file.path.split("/");
    const subdir = parts.length >= 3 ? parts[1] : "other";
    if (!groups[subdir]) groups[subdir] = [];
    groups[subdir].push(file);
  }
  return groups;
}

function formatTitle(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatCategory(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
}

function CollapsibleSection({
  title,
  icon,
  files,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  files: FileInfo[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-secondary/20 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
        {icon}
        <span className="text-xs font-medium text-foreground flex-1">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {files.length}
        </span>
      </button>
      {isOpen && (
        <div className="divide-y divide-border">
          {files.map((file) => (
            <Link
              key={file.path}
              href={`/viewer/${file.path}`}
              className="flex items-center gap-3 px-4 pl-9 py-2 hover:bg-secondary/20 transition-colors group"
            >
              <FileText className="h-3 w-3 text-muted-foreground group-hover:text-accent flex-shrink-0" />
              <span className="text-xs text-foreground truncate flex-1 group-hover:text-primary">
                {formatTitle(file.name)}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                {(file.wordCount / 1000).toFixed(1)}k
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResearchBrowser({
  researchFiles,
  digestFiles,
}: ResearchBrowserProps) {
  const [activeTab, setActiveTab] = useState<"research" | "digests">(
    "research"
  );

  const researchGroups = groupBySubdir(researchFiles);
  const categoryOrder = [
    "world-building",
    "characters",
    "journeys",
    "finance",
    "craft",
    "plot",
  ];
  const sortedCategories = Object.keys(researchGroups).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header with tabs */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <Library className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Research Library
        </h3>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setActiveTab("research")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors",
              activeTab === "research"
                ? "bg-background text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Research ({researchFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("digests")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors",
              activeTab === "digests"
                ? "bg-background text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Book Digests ({digestFiles.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === "research" && (
          <>
            {researchFiles.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                No research files found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedCategories.map((category) => (
                  <CollapsibleSection
                    key={category}
                    title={formatCategory(category)}
                    icon={
                      <FileText className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    }
                    files={researchGroups[category]}
                    defaultOpen={false}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "digests" && (
          <>
            {digestFiles.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                No digest files found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {digestFiles.map((file) => (
                  <Link
                    key={file.path}
                    href={`/viewer/${file.path}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/20 transition-colors group"
                  >
                    <BookMarked className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                        {formatTitle(file.name)}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                      {(file.wordCount / 1000).toFixed(1)}k words
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
