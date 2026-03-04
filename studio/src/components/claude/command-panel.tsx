"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { CommandTemplateCard } from "./command-template";
import { CommandBuilder } from "./command-builder";
import { CommandOutput } from "./command-output";
import type { CommandTemplate, GeneratedCommand } from "@/types/claude";

const MAX_HISTORY = 5;

export function CommandPanel() {
  const currentFile = useAppStore((s) => s.currentFile);

  const [templates, setTemplates] = useState<CommandTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CommandTemplate | null>(null);
  const [commandHistory, setCommandHistory] = useState<GeneratedCommand[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      setIsLoadingTemplates(true);
      try {
        const res = await fetch("/api/claude/templates");
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch {
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template: CommandTemplate) => {
    setSelectedTemplate((prev) =>
      prev?.id === template.id ? null : template
    );
  };

  const handleGenerate = useCallback((command: GeneratedCommand) => {
    setCommandHistory((prev) => [command, ...prev].slice(0, MAX_HISTORY));
  }, []);

  const latestCommand =
    commandHistory.length > 0 ? commandHistory[0] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-sidebar">
        <Terminal className="h-4 w-4 text-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Claude Commands
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Templates */}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Templates</p>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No templates available.
            </p>
          ) : (
            <div className="space-y-1.5">
              {templates.map((template) => (
                <CommandTemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Builder */}
        <CommandBuilder
          selectedTemplate={selectedTemplate}
          filePath={currentFile}
          onGenerate={handleGenerate}
        />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Output */}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">
            Generated Command
          </p>
          <CommandOutput command={latestCommand} />
        </div>

        {/* History */}
        {commandHistory.length > 1 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showHistory ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Previous commands ({commandHistory.length - 1})
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2">
                {commandHistory.slice(1).map((cmd, i) => (
                  <div
                    key={`${cmd.timestamp}-${i}`}
                    className={cn(
                      "rounded-md border border-border p-2 text-xs",
                      "bg-muted/30"
                    )}
                  >
                    <p className="font-medium text-foreground truncate">
                      {cmd.description}
                    </p>
                    <pre className="mt-1 text-[10px] text-muted-foreground font-mono truncate">
                      {cmd.command.substring(0, 120)}
                      {cmd.command.length > 120 ? "..." : ""}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
