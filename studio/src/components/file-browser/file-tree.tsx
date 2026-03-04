"use client";

import { useMemo, useCallback } from "react";
import { Tree, NodeRendererProps } from "react-arborist";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFileTree } from "@/hooks/use-file-tree";
import { FileIcon } from "./file-icon";
import { FileMetadata } from "./file-metadata";
import type { FileNode, FileCategory } from "@/types/files";

interface ArboristNode {
  id: string;
  name: string;
  category: FileCategory;
  isDirectory: boolean;
  wordCount?: number;
  lastModified?: string;
  children?: ArboristNode[];
}

function convertToArboristData(nodes: FileNode[]): ArboristNode[] {
  return nodes.map((node) => ({
    id: node.path,
    name: node.name,
    category: node.category || "other",
    isDirectory: node.type === "directory",
    wordCount: node.wordCount,
    lastModified: node.lastModified,
    children:
      node.type === "directory" && node.children
        ? convertToArboristData(node.children)
        : undefined,
  }));
}

function isChapter(filePath: string): boolean {
  return filePath.startsWith("chapters/") && filePath.endsWith(".md");
}

function isMarkdown(filePath: string): boolean {
  return filePath.endsWith(".md");
}

function Node({ node, style, dragHandle }: NodeRendererProps<ArboristNode>) {
  const data = node.data;

  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 cursor-pointer rounded-sm text-xs group",
        "hover:bg-sidebar-accent",
        node.isSelected && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
      onClick={() => node.isInternal && node.toggle()}
    >
      <FileIcon
        category={data.category}
        isDirectory={data.isDirectory}
        isExpanded={node.isOpen}
        className="h-3.5 w-3.5"
      />
      <span className="truncate flex-1 leading-tight text-sidebar-foreground">
        {data.name}
      </span>
      {!data.isDirectory && data.wordCount !== undefined && data.wordCount > 0 && (
        <FileMetadata wordCount={data.wordCount} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1 px-2 py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-3.5 w-3.5 rounded bg-sidebar-accent animate-pulse"
            style={{ marginLeft: `${(i % 3) * 12}px` }}
          />
          <div
            className="h-3 rounded bg-sidebar-accent animate-pulse"
            style={{ width: `${60 + Math.random() * 80}px` }}
          />
        </div>
      ))}
    </div>
  );
}

export function FileTree() {
  const { tree, isLoading, error } = useFileTree();
  const router = useRouter();

  const arboristData = useMemo(() => convertToArboristData(tree), [tree]);

  const handleActivate = useCallback(
    (node: { data: ArboristNode; isLeaf: boolean }) => {
      if (!node.isLeaf) return;

      const filePath = node.data.id;

      if (!isMarkdown(filePath)) {
        toast.info("Cannot preview this file type", {
          description: filePath,
        });
        return;
      }

      if (isChapter(filePath)) {
        router.push(`/editor/${filePath}`);
      } else {
        router.push(`/viewer/${filePath}`);
      }
    },
    [router]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="px-3 py-4 text-xs text-destructive">
        <p className="font-medium">Failed to load files</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (arboristData.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground italic">
        No files found.
      </div>
    );
  }

  return (
    <div className="h-full">
      <Tree<ArboristNode>
        data={arboristData}
        openByDefault={false}
        width="100%"
        height={800}
        indent={14}
        rowHeight={26}
        overscanCount={10}
        disableDrag
        disableDrop
        disableEdit
        disableMultiSelection
        onActivate={handleActivate}
      >
        {Node}
      </Tree>
    </div>
  );
}
