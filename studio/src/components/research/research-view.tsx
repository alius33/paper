"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  wordCount?: number;
}

interface ResearchFile {
  name: string;
  path: string;
  wordCount: number;
  category: string;
}

type FilterTab = "all" | "world-building" | "characters" | "journeys" | "finance" | "craft" | "plot" | "digests";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "world-building", label: "World-building" },
  { key: "characters", label: "Characters" },
  { key: "journeys", label: "Journeys" },
  { key: "finance", label: "Finance" },
  { key: "craft", label: "Craft" },
  { key: "plot", label: "Plot" },
  { key: "digests", label: "Digests" },
];

function getCategoryFromPath(path: string): string {
  if (path.startsWith("research/digests/")) return "digests";
  if (path.startsWith("research/world-building/")) return "world-building";
  if (path.startsWith("research/characters/")) return "characters";
  if (path.startsWith("research/journeys/")) return "journeys";
  if (path.startsWith("research/finance/")) return "finance";
  if (path.startsWith("research/craft/")) return "craft";
  if (path.startsWith("research/plot/")) return "plot";
  return "research";
}

function getCategoryBadgeClasses(category: string): { bg: string; fg: string } {
  switch (category) {
    case "world-building":
      return { bg: "bg-[var(--cat-world-building-bg)]", fg: "text-[var(--cat-world-building-fg)]" };
    case "characters":
      return { bg: "bg-[var(--cat-characters-bg)]", fg: "text-[var(--cat-characters-fg)]" };
    case "journeys":
      return { bg: "bg-[var(--cat-journeys-bg)]", fg: "text-[var(--cat-journeys-fg)]" };
    case "finance":
      return { bg: "bg-[var(--cat-finance-bg)]", fg: "text-[var(--cat-finance-fg)]" };
    case "craft":
      return { bg: "bg-[var(--cat-craft-bg)]", fg: "text-[var(--cat-craft-fg)]" };
    case "plot":
      return { bg: "bg-[var(--cat-plot-bg)]", fg: "text-[var(--cat-plot-fg)]" };
    case "digests":
      return { bg: "bg-[var(--cat-digests-bg)]", fg: "text-[var(--cat-digests-fg)]" };
    default:
      return { bg: "bg-[var(--cat-research-bg)]", fg: "text-[var(--cat-research-fg)]" };
  }
}

function formatTitle(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .split("-")
    .map((w, i) => {
      const lower = new Set(["a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "but", "or", "al"]);
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
      if (lower.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function formatCategoryLabel(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function collectResearchFiles(nodes: FileNode[]): ResearchFile[] {
  const result: ResearchFile[] = [];
  for (const node of nodes) {
    if (
      node.type === "file" &&
      node.path.startsWith("research/") &&
      node.name.endsWith(".md")
    ) {
      result.push({
        name: node.name,
        path: node.path,
        wordCount: node.wordCount || 0,
        category: getCategoryFromPath(node.path),
      });
    }
    if (node.children) {
      result.push(...collectResearchFiles(node.children));
    }
  }
  return result;
}

export function ResearchView() {
  const [files, setFiles] = useState<ResearchFile[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        if (data.tree) {
          const resFiles = collectResearchFiles(data.tree);
          resFiles.sort((a, b) => a.path.localeCompare(b.path));
          setFiles(resFiles);
        }
      })
      .catch(() => {});
  }, []);

  const filteredFiles = useMemo(() => {
    let filtered = files;

    if (activeFilter !== "all") {
      filtered = filtered.filter((f) => f.category === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.path.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [files, activeFilter, search]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:px-8 md:py-10">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
          Research Library
        </h1>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter research files..."
            className="w-full bg-card border border-border rounded-md pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mt-4 mb-6">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors",
                activeFilter === key
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              {search.trim() ? "No files match your search." : "No research files found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFiles.map((file) => {
              const catClasses = getCategoryBadgeClasses(file.category);
              return (
                <a
                  key={file.path}
                  href={`/viewer/${file.path}`}
                  className="bg-card border border-border rounded-md p-4 hover:border-muted-foreground/30 hover:shadow-sm transition-all cursor-pointer block"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                      {formatTitle(file.name)}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0",
                        catClasses.bg,
                        catClasses.fg
                      )}
                    >
                      {formatCategoryLabel(file.category)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {file.path}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-3">
                    {file.wordCount > 0
                      ? `${(file.wordCount / 1000).toFixed(1)}k words`
                      : "0 words"}
                  </p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
