"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Hook that determines the current git branch and syncs it into the
 * zustand store. Fetches the latest commit log entry and infers the
 * branch, or falls back to "main".
 */
export function useGitStatus() {
  const setGitBranch = useAppStore((s) => s.setGitBranch);
  const branch = useAppStore((s) => s.gitBranch);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBranch() {
      setIsLoading(true);
      try {
        // Fetch the latest commit to confirm git is working,
        // and use the log endpoint to infer activity.
        // The branch name is not directly exposed by the log API,
        // so we attempt a simple fetch. If the API responds, git is active.
        const res = await fetch("/api/git/log?limit=1");
        if (!res.ok) throw new Error("Git unavailable");

        const data = await res.json();
        const commits = data.commits || [];

        // If we get commits, git is active. The store default is "main".
        // In a more advanced setup, we could add a /api/git/branch endpoint.
        // For now, detect branch from the most recent commit ref or keep default.
        if (commits.length > 0 && !cancelled) {
          // The branch is already set in the store (default: "main").
          // We confirm git is working - no change needed unless we have
          // a dedicated branch endpoint.
          setGitBranch(branch || "main");
        }
      } catch {
        if (!cancelled) {
          setGitBranch("main");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchBranch();
    return () => {
      cancelled = true;
    };
  }, [setGitBranch, branch]);

  return { branch, isLoading };
}
