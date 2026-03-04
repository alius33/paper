"use client";

import { useState, useEffect, useCallback } from "react";
import type { FileNode } from "@/types/files";

interface UseFileTreeReturn {
  tree: FileNode[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFileTree(): UseFileTreeReturn {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/files");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch file tree");
      }
      const data = await res.json();
      setTree(data.tree);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch file tree";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { tree, isLoading, error, refresh: fetchTree };
}
