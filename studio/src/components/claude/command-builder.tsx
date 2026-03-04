"use client";

import { useState, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CommandTemplate, GeneratedCommand } from "@/types/claude";

interface CommandBuilderProps {
  selectedTemplate: CommandTemplate | null;
  filePath: string | null;
  onGenerate: (command: GeneratedCommand) => void;
}

const CONTEXT_FILES = [
  { path: "CLAUDE.md", label: "CLAUDE.md" },
  { path: "series_plot.md", label: "series_plot.md" },
];

export function CommandBuilder({
  selectedTemplate,
  filePath,
  onGenerate,
}: CommandBuilderProps) {
  const [instruction, setInstruction] = useState("");
  const [includeCurrentFile, setIncludeCurrentFile] = useState(true);
  const [selectedContextFiles, setSelectedContextFiles] = useState<string[]>([
    "CLAUDE.md",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleContextFile = (path: string) => {
    setSelectedContextFiles((prev) =>
      prev.includes(path)
        ? prev.filter((f) => f !== path)
        : [...prev, path]
    );
  };

  const placeholder = selectedTemplate
    ? `Additional instructions for "${selectedTemplate.name}"...`
    : "Describe what you want Claude to do...";

  const canGenerate = instruction.trim().length > 0 || selectedTemplate !== null;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const contextFiles = [...selectedContextFiles];
      if (includeCurrentFile && filePath && !contextFiles.includes(filePath)) {
        contextFiles.push(filePath);
      }

      const res = await fetch("/api/claude/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate?.id || null,
          instruction: instruction.trim() || selectedTemplate?.name || "",
          filePath: includeCurrentFile && filePath ? filePath : "",
          contextFiles,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate command");
      }

      const data = await res.json();
      onGenerate(data.command);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate command";
      toast.error("Generation failed", { description: message });
    } finally {
      setIsGenerating(false);
    }
  }, [
    canGenerate,
    instruction,
    selectedTemplate,
    filePath,
    includeCurrentFile,
    selectedContextFiles,
    onGenerate,
  ]);

  return (
    <div className="space-y-3">
      {/* Instruction textarea */}
      <div>
        <label
          htmlFor="claude-instruction"
          className="block text-xs font-medium text-foreground mb-1"
        >
          Instruction
        </label>
        <textarea
          id="claude-instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-xs",
            "text-foreground placeholder:text-muted-foreground resize-none",
            "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          )}
        />
      </div>

      {/* File context */}
      <div>
        <p className="text-xs font-medium text-foreground mb-1.5">
          Context files
        </p>
        <div className="space-y-1">
          {/* Current file */}
          {filePath && (
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeCurrentFile}
                onChange={(e) => setIncludeCurrentFile(e.target.checked)}
                className="rounded border-border accent-accent h-3.5 w-3.5"
              />
              <span className="truncate font-mono text-muted-foreground">
                {filePath}
              </span>
              <span className="text-sidebar-muted text-[10px] flex-shrink-0">
                (current)
              </span>
            </label>
          )}

          {/* Standard context files */}
          {CONTEXT_FILES.map((file) => (
            <label
              key={file.path}
              className="flex items-center gap-2 text-xs text-foreground cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedContextFiles.includes(file.path)}
                onChange={() => toggleContextFile(file.path)}
                className="rounded border-border accent-accent h-3.5 w-3.5"
              />
              <span className="font-mono text-muted-foreground">
                {file.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Generate Command
          </>
        )}
      </button>
    </div>
  );
}
