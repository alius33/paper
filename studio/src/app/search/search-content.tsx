"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  filePath: string;
  line: string;
  lineNumber: number;
  contextBefore: string[];
  contextAfter: string[];
}

type Scope = "all" | "chapters" | "research" | "plot";

const SCOPE_MAP: Record<Scope, string | undefined> = {
  all: undefined,
  chapters: "chapters",
  research: "research",
  plot: "research/plot",
};

const SCOPE_LABELS: Record<Scope, string> = {
  all: "All",
  chapters: "Chapters",
  research: "Research",
  plot: "Plot",
};

function isChapterPath(filePath: string): boolean {
  return filePath.startsWith("chapters/") && filePath.endsWith(".md");
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-accent/40 text-foreground rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<Scope>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, searchScope: Scope) => {
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      setHasSearched(true);

      try {
        const params = new URLSearchParams({ q: searchQuery.trim() });
        const scopeValue = SCOPE_MAP[searchScope];
        if (scopeValue) {
          params.set("scope", scopeValue);
        }

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Search failed");
        }
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery, scope);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, scope);
    }
  };

  const handleResultClick = (filePath: string) => {
    if (isChapterPath(filePath)) {
      router.push(`/editor/${filePath}`);
    } else {
      router.push(`/viewer/${filePath}`);
    }
  };

  const fileName = (filePath: string) => {
    const parts = filePath.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all files..."
              autoFocus
              className="w-full rounded-md border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-1">
            {(Object.keys(SCOPE_LABELS) as Scope[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  scope === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {SCOPE_LABELS[s]}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Searching...
            </span>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Search className="h-8 w-8 text-sidebar-muted mb-3" />
            <p className="text-sm text-muted-foreground">No results found</p>
            <p className="mt-1 text-xs text-sidebar-muted">
              Try a different query or broaden your search scope.
            </p>
          </div>
        )}

        {!isSearching && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Search className="h-8 w-8 text-sidebar-muted mb-3" />
            <p className="font-serif italic text-sm text-muted-foreground">
              Search across chapters, research, and notes
            </p>
            <p className="mt-2 text-xs text-sidebar-muted">
              Press Enter to search.
            </p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={`${result.filePath}:${result.lineNumber}:${index}`}
                  className="rounded-md border border-border bg-card hover:border-accent transition-colors cursor-pointer"
                  onClick={() => handleResultClick(result.filePath)}
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {fileName(result.filePath)}
                    </span>
                    <span className="text-[10px] text-sidebar-muted truncate">
                      {result.filePath}
                    </span>
                    <span className="ml-auto text-[10px] text-sidebar-muted whitespace-nowrap">
                      line {result.lineNumber}
                    </span>
                  </div>

                  <div className="px-3 py-2 font-mono text-xs leading-relaxed">
                    {result.contextBefore.map((line, i) => (
                      <div key={`before-${i}`} className="text-muted-foreground truncate">
                        {line}
                      </div>
                    ))}
                    <div className="text-foreground bg-accent/10 -mx-3 px-3 py-0.5 truncate">
                      {highlightMatch(result.line, query)}
                    </div>
                    {result.contextAfter.map((line, i) => (
                      <div key={`after-${i}`} className="text-muted-foreground truncate">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
