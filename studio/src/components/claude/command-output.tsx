"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GeneratedCommand } from "@/types/claude";

interface CommandOutputProps {
  command: GeneratedCommand | null;
}

export function CommandOutput({ command }: CommandOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      toast.success("Command copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy command");
    }
  };

  if (!command) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <Terminal className="h-6 w-6 text-sidebar-muted mb-2" />
        <p className="text-xs text-muted-foreground italic">
          Select a template and generate a command, or write a custom
          instruction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Description */}
      <p className="text-xs text-muted-foreground px-1">{command.description}</p>

      {/* Code block */}
      <div className="relative group">
        <pre
          className={cn(
            "rounded-md bg-foreground/95 text-primary-foreground p-3 text-xs",
            "font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words",
            "max-h-48 overflow-y-auto"
          )}
        >
          {command.command}
        </pre>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "absolute top-2 right-2 rounded-md p-1.5 transition-colors",
            "bg-white/10 hover:bg-white/20 text-primary-foreground"
          )}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
