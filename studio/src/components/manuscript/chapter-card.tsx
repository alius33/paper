"use client";

import { cn } from "@/lib/utils";

interface ChapterCardProps {
  number: number;
  title: string;
  summary: string;
  status: "Draft" | "Revised" | "Final" | "Planned";
  wordCount?: number;
  path?: string;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Final":
      return {
        bg: "bg-[var(--status-final-bg)]",
        fg: "text-[var(--status-final-fg)]",
        dot: "bg-[var(--status-final-dot)]",
      };
    case "Revised":
      return {
        bg: "bg-[var(--status-revised-bg)]",
        fg: "text-[var(--status-revised-fg)]",
        dot: "bg-[var(--status-revised-dot)]",
      };
    case "Planned":
      return {
        bg: "bg-[var(--status-planned-bg)]",
        fg: "text-[var(--status-planned-fg)]",
        dot: "bg-[var(--status-planned-dot)]",
      };
    default:
      return {
        bg: "bg-[var(--status-draft-bg)]",
        fg: "text-[var(--status-draft-fg)]",
        dot: "bg-[var(--status-draft-dot)]",
      };
  }
}

export function ChapterCard({
  number,
  title,
  summary,
  status,
  wordCount,
  path,
}: ChapterCardProps) {
  const statusClasses = getStatusClasses(status);
  const isPlanned = status === "Planned";

  const handleClick = () => {
    if (path) {
      window.location.href = `/editor/${path}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-card border rounded-md p-4 transition-all",
        isPlanned
          ? "border-dashed border-border opacity-60"
          : "border-border hover:border-muted-foreground/30 hover:shadow-sm cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-medium text-foreground">
          <span className="text-muted-foreground">Ch {number}:</span> {title}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0",
            statusClasses.bg,
            statusClasses.fg
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusClasses.dot)} />
          {status}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
        {summary}
      </p>

      {/* Footer */}
      <p className="text-[11px] font-mono text-muted-foreground mt-3">
        {wordCount ? `${wordCount.toLocaleString()} words` : "Not started"}
      </p>
    </div>
  );
}
