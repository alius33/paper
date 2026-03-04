"use client";

import { cn } from "@/lib/utils";
import type { CommandTemplate } from "@/types/claude";

interface CommandTemplateCardProps {
  template: CommandTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export function CommandTemplateCard({
  template,
  isSelected,
  onSelect,
}: CommandTemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-md border px-3 py-2 transition-colors",
        isSelected
          ? "border-accent bg-accent/10 ring-1 ring-accent"
          : "border-border bg-card hover:border-accent/50 hover:bg-card/80"
      )}
    >
      <p className="text-xs font-semibold text-foreground">{template.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
        {template.description}
      </p>
    </button>
  );
}
