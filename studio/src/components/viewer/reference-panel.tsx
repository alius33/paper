"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "./markdown-viewer";
import type { FileNode } from "@/types/files";

function flattenMarkdownFiles(nodes: FileNode[]): { path: string; name: string }[] {
  const files: { path: string; name: string }[] = [];

  function walk(items: FileNode[]) {
    for (const item of items) {
      if (item.type === "directory" && item.children) {
        walk(item.children);
      } else if (item.type === "file" && item.path.endsWith(".md")) {
        files.push({ path: item.path, name: item.name });
      }
    }
  }

  walk(nodes);
  return files;
}

export function ReferencePanel() {
  const [fileList, setFileList] = useState<{ path: string; name: string }[]>(
    []
  );
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Fetch file tree on mount
  useEffect(() => {
    async function fetchFiles() {
      setIsLoadingTree(true);
      try {
        const res = await fetch("/api/files");
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        const mdFiles = flattenMarkdownFiles(data.tree);
        setFileList(mdFiles);
      } catch {
        // Silently fail, the list will just be empty
      } finally {
        setIsLoadingTree(false);
      }
    }
    fetchFiles();
  }, []);

  // Fetch content when a file is selected
  const loadFileContent = useCallback(async (filePath: string) => {
    if (!filePath) {
      setFileContent("");
      return;
    }
    setIsLoadingContent(true);
    try {
      const res = await fetch(`/api/files/${filePath}`);
      if (!res.ok) throw new Error("Failed to fetch file");
      const data = await res.json();
      setFileContent(data.content);
    } catch {
      setFileContent("Failed to load file content.");
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const handleSelectFile = (filePath: string) => {
    setSelectedFile(filePath);
    loadFileContent(filePath);
  };

  // Filter file list
  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return fileList;
    const q = filterQuery.toLowerCase();
    return fileList.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
  }, [fileList, filterQuery]);

  return (
    <div className="flex h-full flex-col">
      {/* File selector area */}
      <div className="flex-shrink-0 border-b border-border p-3 space-y-2">
        {/* Filter input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* File dropdown */}
        <select
          value={selectedFile}
          onChange={(e) => handleSelectFile(e.target.value)}
          disabled={isLoadingTree}
          className={cn(
            "w-full rounded-md border border-border bg-background py-1.5 px-2 text-xs text-foreground",
            "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <option value="">
            {isLoadingTree ? "Loading files..." : "Select a reference file"}
          </option>
          {filteredFiles.map((file) => (
            <option key={file.path} value={file.path}>
              {file.path}
            </option>
          ))}
        </select>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingContent && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoadingContent && !selectedFile && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 text-center">
            <BookOpen className="h-8 w-8 mb-3 text-sidebar-muted" />
            <p className="font-serif italic text-sm">Select a reference file</p>
            <p className="mt-2 text-xs">
              Choose a file from the dropdown above to view its contents.
            </p>
          </div>
        )}

        {!isLoadingContent && selectedFile && fileContent && (
          <MarkdownViewer content={fileContent} filePath={selectedFile} />
        )}
      </div>
    </div>
  );
}
