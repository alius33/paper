"use client";

import { ReactNode, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, ArrowDownToLine, ArrowUpFromLine, Search, Sun, Moon, Scroll } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore, type Theme } from "@/lib/store";

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    try {
      const res = await fetch("/api/git/pull", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pull successful", {
          description: data.message || "Repository updated.",
        });
      } else {
        toast.error("Pull failed", {
          description: data.error || "Could not pull from remote.",
        });
      }
    } catch {
      toast.error("Pull failed", {
        description: "Network error. Could not reach the server.",
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const res = await fetch("/api/git/push", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Push successful", {
          description: data.message || "Changes pushed to remote.",
        });
      } else {
        toast.error("Push failed", {
          description: data.error || "Could not push to remote.",
        });
      }
    } catch {
      toast.error("Push failed", {
        description: "Network error. Could not reach the server.",
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-sidebar-border px-4 py-3">
        <h1 className="font-serif text-lg font-semibold text-sidebar-foreground tracking-tight">
          Paper House Studio
        </h1>
        <p className="text-xs text-sidebar-muted mt-0.5">Manuscript Manager</p>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-3 py-2">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-md border border-sidebar-border bg-sidebar py-1.5 pl-8 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </form>
      </div>

      {/* File Tree Area */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {children}
      </div>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Git Actions */}
      <div className="flex-shrink-0 border-t border-sidebar-border px-3 py-2">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 text-xs text-sidebar-muted mr-auto">
            <GitBranch className="h-3.5 w-3.5" />
            <span>git</span>
          </div>
          <button
            onClick={handlePull}
            disabled={isPulling}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Pull from remote"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            {isPulling ? "Pulling..." : "Pull"}
          </button>
          <button
            onClick={handlePush}
            disabled={isPushing}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Push to remote"
          >
            <ArrowUpFromLine className="h-3.5 w-3.5" />
            {isPushing ? "Pushing..." : "Push"}
          </button>
        </div>
      </div>
    </div>
  );
}

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "standard", label: "Standard", icon: Sun },
  { value: "parchment", label: "Parchment", icon: Scroll },
  { value: "dark", label: "Dark", icon: Moon },
];

function ThemeSelector() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <div className="flex-shrink-0 border-t border-sidebar-border px-3 py-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-sidebar-muted mr-auto">Theme</span>
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              theme === value
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
