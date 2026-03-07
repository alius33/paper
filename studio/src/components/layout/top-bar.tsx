"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  PenLine,
  BookText,
  Library,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore, type ActiveView } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-is-mobile";

const VIEWS: { key: ActiveView; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "write", label: "Write", icon: PenLine },
  { key: "manuscript", label: "Manuscript", icon: BookText },
  { key: "research", label: "Research", icon: Library },
];

export function TopBar() {
  const theme = useAppStore((s) => s.theme);
  const activeView = useAppStore((s) => s.activeView);
  const setTheme = useAppStore((s) => s.setTheme);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGitPull = async () => {
    try {
      const res = await fetch("/api/git/pull", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Pull successful");
      } else {
        toast.error(data.error || "Pull failed");
      }
    } catch {
      toast.error("Pull failed");
    }
  };

  const handleGitPush = async () => {
    try {
      const res = await fetch("/api/git/push", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Push successful");
      } else {
        toast.error(data.error || "Push failed");
      }
    } catch {
      toast.error("Push failed");
    }
  };

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    // Navigate to home if on a sub-route (e.g. /editor/...)
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <>
      <header
        className="flex h-12 flex-shrink-0 items-center justify-between border-b px-3 md:px-4"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--background)",
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          )}
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Paper House Studio
          </span>
        </div>

        {/* Center: View tabs (desktop) */}
        {!isMobile && (
          <nav className="flex items-center gap-1">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleViewChange(key)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                  activeView === key
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleGitPull}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            title="Git Pull"
          >
            <ArrowDownToLine className="h-4 w-4" />
          </button>
          <button
            onClick={handleGitPush}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            title="Git Push"
          >
            <ArrowUpFromLine className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          className="flex-shrink-0 border-b px-3 py-2 space-y-1"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleViewChange(key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                activeView === key
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
