"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Library,
  BookMarked,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Search,
  Globe,
  Users,
  Route,
  Coins,
  Paintbrush,
  Map,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

interface FileInfo {
  name: string;
  path: string;
  wordCount: number;
  lastModified: string;
}

interface ResearchGap {
  topic: string;
  resolved: boolean;
}

interface ResearchSession {
  date: string;
  title: string;
  query: string;
  existingCoverage: string;
  actionTaken: string;
  newFile: string;
  findings: string[];
  gaps: string;
  crossReferences: string;
  relevance: string;
}

interface ResearchData {
  gaps: ResearchGap[];
  sessions: ResearchSession[];
  counts: Record<string, number>;
  totalResearchFiles: number;
}

interface ResearchPageClientProps {
  researchFiles: FileInfo[];
  digestFiles: FileInfo[];
}

/* ---------- Category config ---------- */

const CATEGORIES: {
  key: string;
  label: string;
  icon: typeof Globe;
  description: string;
}[] = [
  {
    key: "world-building",
    label: "World Building",
    icon: Globe,
    description: "Baghdad, society, politics, material culture",
  },
  {
    key: "characters",
    label: "Characters",
    icon: Users,
    description: "Backstories, family trees, character studies",
  },
  {
    key: "journeys",
    label: "Journeys",
    icon: Route,
    description: "Caravan routes, logistics, travel conditions",
  },
  {
    key: "finance",
    label: "Finance",
    icon: Coins,
    description: "Financial instruments, deals, trade networks",
  },
  {
    key: "craft",
    label: "Craft",
    icon: Paintbrush,
    description: "Scene-level research, walks, sensory details",
  },
  {
    key: "plot",
    label: "Plot",
    icon: Map,
    description: "Plot outlines, chapter breakdowns, structure",
  },
];

/* ---------- Helpers ---------- */

function groupBySubdir(files: FileInfo[]): Record<string, FileInfo[]> {
  const groups: Record<string, FileInfo[]> = {};
  for (const file of files) {
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

/* ---------- Sub-components ---------- */

function CategorySection({
  category,
  files,
  filter,
  defaultOpen,
}: {
  category: (typeof CATEGORIES)[number];
  files: FileInfo[];
  filter: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = category.icon;

  const filtered = filter
    ? files.filter(
        (f) =>
          f.name.toLowerCase().includes(filter.toLowerCase()) ||
          f.path.toLowerCase().includes(filter.toLowerCase())
      )
    : files;

  if (filter && filtered.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left bg-secondary/20 hover:bg-secondary/40 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <Icon className="h-4 w-4 text-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">
            {category.label}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {category.description}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums bg-background rounded-full px-2 py-0.5">
          {filtered.length}
        </span>
      </button>
      {isOpen && (
        <div className="divide-y divide-border">
          {filtered.map((file) => (
            <Link
              key={file.path}
              href={`/viewer/${file.path}`}
              className="flex items-center gap-3 px-4 pl-11 py-2.5 hover:bg-secondary/20 transition-colors group"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent flex-shrink-0" />
              <span className="text-sm text-foreground truncate flex-1 group-hover:text-primary">
                {formatTitle(file.name)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                {(file.wordCount / 1000).toFixed(1)}k words
              </span>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 pl-11 py-3 text-xs text-muted-foreground italic">
              No files in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapItem({ gap }: { gap: ResearchGap }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors",
        gap.resolved
          ? "border-border bg-secondary/10 opacity-60"
          : "border-accent/30 bg-accent/5"
      )}
    >
      {gap.resolved ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            gap.resolved
              ? "text-muted-foreground line-through"
              : "text-foreground font-medium"
          )}
        >
          {gap.topic}
        </p>
      </div>
    </div>
  );
}

function SessionEntry({ session }: { session: ResearchSession }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <Clock className="h-4 w-4 text-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">
            {session.title}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
          {session.date}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pl-11 pb-4 space-y-2 text-sm">
          {session.query && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Query
              </span>
              <p className="text-foreground mt-0.5">{session.query}</p>
            </div>
          )}
          {session.existingCoverage && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Existing Coverage
              </span>
              <p className="text-foreground mt-0.5">
                {session.existingCoverage}
              </p>
            </div>
          )}
          {session.newFile && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                File Created
              </span>
              <p className="text-foreground mt-0.5 font-mono text-xs">
                {session.newFile}
              </p>
            </div>
          )}
          {session.findings.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Key Findings
              </span>
              <ul className="mt-1 space-y-1">
                {session.findings.map((finding, i) => (
                  <li
                    key={i}
                    className="text-foreground flex items-start gap-2"
                  >
                    <span className="text-accent mt-1.5 text-[6px]">●</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {session.relevance && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Relevance
              </span>
              <p className="text-foreground mt-0.5">{session.relevance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Tab definitions ---------- */

type TabKey = "topics" | "digests" | "gaps" | "sessions";

const TABS: { key: TabKey; label: string; icon: typeof Library }[] = [
  { key: "topics", label: "By Topic", icon: Library },
  { key: "digests", label: "Book Digests", icon: BookMarked },
  { key: "gaps", label: "Research Gaps", icon: AlertCircle },
  { key: "sessions", label: "Session Log", icon: Clock },
];

/* ---------- Main component ---------- */

export function ResearchPageClient({
  researchFiles,
  digestFiles,
}: ResearchPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("topics");
  const [filter, setFilter] = useState("");
  const [researchData, setResearchData] = useState<ResearchData | null>(null);

  const fetchResearchData = useCallback(async () => {
    try {
      const res = await fetch("/api/research");
      if (res.ok) {
        const data = await res.json();
        setResearchData(data);
      }
    } catch {
      // Silently fail — gaps and sessions are supplementary
    }
  }, []);

  useEffect(() => {
    fetchResearchData();
  }, [fetchResearchData]);

  const researchGroups = groupBySubdir(researchFiles);
  const openGaps = researchData?.gaps.filter((g) => !g.resolved) || [];
  const resolvedGaps = researchData?.gaps.filter((g) => g.resolved) || [];

  const filteredDigests = filter
    ? digestFiles.filter(
        (f) =>
          f.name.toLowerCase().includes(filter.toLowerCase()) ||
          f.path.toLowerCase().includes(filter.toLowerCase())
      )
    : digestFiles;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-md p-2 md:p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl font-semibold text-primary tracking-tight">
              Research Library
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {researchFiles.length + digestFiles.length} research files
              {researchData &&
                ` · ${openGaps.length} open gap${openGaps.length !== 1 ? "s" : ""}`}
              {researchData &&
                researchData.sessions.length > 0 &&
                ` · ${researchData.sessions.length} session${researchData.sessions.length !== 1 ? "s" : ""} logged`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto flex-nowrap -mx-1 px-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 md:py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap min-h-[44px] md:min-h-0",
                activeTab === key
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {key === "gaps" && openGaps.length > 0 && (
                <span className="ml-1 bg-accent/20 text-accent rounded-full px-1.5 py-0 text-[10px] font-semibold">
                  {openGaps.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar for topics and digests */}
      {(activeTab === "topics" || activeTab === "digests") && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-border md:px-6">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={
                activeTab === "topics"
                  ? "Filter research files..."
                  : "Filter digests..."
              }
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4 md:px-6 md:py-6">
          {/* By Topic tab */}
          {activeTab === "topics" && (
            <>
              {CATEGORIES.map((category) => {
                const files = researchGroups[category.key] || [];
                if (files.length === 0) return null;
                return (
                  <CategorySection
                    key={category.key}
                    category={category}
                    files={files}
                    filter={filter}
                    defaultOpen={false}
                  />
                );
              })}
              {researchFiles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm italic">
                  No research files found.
                </div>
              )}
            </>
          )}

          {/* Digests tab */}
          {activeTab === "digests" && (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                Markdown summaries of reference books, with page references,
                scene-ready extracts, and relevance annotations.
              </div>
              <div className="space-y-1">
                {filteredDigests.map((file) => (
                  <Link
                    key={file.path}
                    href={`/viewer/${file.path}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-accent/30 hover:bg-secondary/20 transition-colors group"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                        {formatTitle(file.name)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                        {file.path}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                      {(file.wordCount / 1000).toFixed(1)}k words
                    </span>
                  </Link>
                ))}
                {filteredDigests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm italic">
                    {filter
                      ? "No digests match your filter."
                      : "No digest files found."}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Research Gaps tab */}
          {activeTab === "gaps" && (
            <>
              {openGaps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Open Gaps ({openGaps.length})
                  </h3>
                  <div className="space-y-2">
                    {openGaps.map((gap, i) => (
                      <GapItem key={`open-${i}`} gap={gap} />
                    ))}
                  </div>
                </div>
              )}
              {resolvedGaps.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Resolved ({resolvedGaps.length})
                  </h3>
                  <div className="space-y-2">
                    {resolvedGaps.map((gap, i) => (
                      <GapItem key={`resolved-${i}`} gap={gap} />
                    ))}
                  </div>
                </div>
              )}
              {openGaps.length === 0 && resolvedGaps.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No research gaps tracked yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gaps are parsed from the Research Gaps section in{" "}
                    <code className="bg-secondary px-1 rounded">
                      research-index.md
                    </code>
                  </p>
                </div>
              )}
            </>
          )}

          {/* Session Log tab */}
          {activeTab === "sessions" && (
            <>
              {researchData && researchData.sessions.length > 0 ? (
                <div className="space-y-3">
                  {researchData.sessions.map((session, i) => (
                    <SessionEntry key={i} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No research sessions logged yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use{" "}
                    <code className="bg-secondary px-1 rounded">/research</code>{" "}
                    in Claude Code to start a session. Each session is
                    automatically logged here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
