"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface FileInfo {
  name: string;
  path: string;
}

interface WriteViewProps {
  filePath: string;
  children: React.ReactNode;
}

function parseChapterLabel(filename: string): string {
  const name = filename.replace(/\.md$/, "");
  const match = name.match(/^ch(\d+)-(.+)$/);
  if (!match) return name;
  const num = parseInt(match[1], 10);
  const rawTitle = match[2];
  const lower = new Set(["a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "but", "or", "al"]);
  const title = rawTitle
    .split("-")
    .map((w, i) => {
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
      if (lower.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
  return `${num}. ${title}`;
}

function formatResearchName(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

function collectFiles(nodes: FileNode[], predicate: (n: FileNode) => boolean): FileInfo[] {
  const result: FileInfo[] = [];
  for (const node of nodes) {
    if (node.type === "file" && predicate(node)) {
      result.push({ name: node.name, path: node.path });
    }
    if (node.children) {
      result.push(...collectFiles(node.children, predicate));
    }
  }
  return result;
}

export function WriteView({ filePath, children }: WriteViewProps) {
  const [chapters, setChapters] = useState<FileInfo[]>([]);
  const [researchFiles, setResearchFiles] = useState<FileInfo[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        if (data.tree) {
          const chs = collectFiles(data.tree, (n) =>
            n.path.startsWith("chapters/book-1/") && n.name.endsWith(".md")
          );
          chs.sort((a, b) => a.path.localeCompare(b.path));
          setChapters(chs);

          const rFiles = collectFiles(data.tree, (n) =>
            n.path.startsWith("research/") && n.name.endsWith(".md")
          );
          rFiles.sort((a, b) => a.path.localeCompare(b.path));
          setResearchFiles(rFiles);
        }
      })
      .catch(() => {});
  }, []);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <Group orientation="horizontal" className="h-full">
      {/* Left: Chapter nav */}
      <Panel
        defaultSize={17}
        minSize={12}
        maxSize={25}
        collapsible
        className="bg-sidebar"
      >
        <div className="h-full flex flex-col border-r" style={{ borderColor: "var(--border)" }}>
          <div className="px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chapters
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            {chapters.map((ch) => (
              <a
                key={ch.path}
                href={`/editor/${ch.path}`}
                className={cn(
                  "block text-sm px-3 py-2 rounded cursor-pointer transition-colors",
                  filePath === ch.path
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-medium"
                    : "text-sidebar-foreground hover:bg-secondary"
                )}
              >
                {parseChapterLabel(ch.name)}
              </a>
            ))}
          </div>
        </div>
      </Panel>

      <Separator className="w-px bg-border hover:bg-primary transition-colors" />

      {/* Center: Editor content */}
      <Panel defaultSize={66}>
        {children}
      </Panel>

      <Separator className="w-px bg-border hover:bg-primary transition-colors" />

      {/* Right: Research panel */}
      <Panel
        defaultSize={17}
        minSize={12}
        maxSize={25}
        collapsible
        className="bg-sidebar"
      >
        <div className="h-full flex flex-col border-l" style={{ borderColor: "var(--border)" }}>
          <div className="px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Related Research
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            {researchFiles.map((rf) => (
              <a
                key={rf.path}
                href={`/viewer/${rf.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs px-3 py-1.5 rounded cursor-pointer text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors truncate"
              >
                {formatResearchName(rf.name)}
              </a>
            ))}
          </div>
        </div>
      </Panel>
    </Group>
  );
}
