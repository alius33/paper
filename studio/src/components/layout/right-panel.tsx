"use client";

import { ReactNode, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "research" | "claude" | "history";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "research", label: "Research" },
  { id: "claude", label: "Claude" },
  { id: "history", label: "History" },
];

interface RightPanelProps {
  researchContent?: ReactNode;
  claudeContent?: ReactNode;
  historyContent?: ReactNode;
  onCollapse?: () => void;
}

export function RightPanel({
  researchContent,
  claudeContent,
  historyContent,
  onCollapse,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("research");

  const renderContent = () => {
    switch (activeTab) {
      case "research":
        return (
          researchContent || (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm px-6 text-center">
              <p className="font-serif italic">Research panel</p>
              <p className="mt-2 text-xs">Reference materials and notes will appear here.</p>
            </div>
          )
        );
      case "claude":
        return (
          claudeContent || (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm px-6 text-center">
              <p className="font-serif italic">Claude panel</p>
              <p className="mt-2 text-xs">AI writing assistance will appear here.</p>
            </div>
          )
        );
      case "history":
        return (
          historyContent || (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm px-6 text-center">
              <p className="font-serif italic">History panel</p>
              <p className="mt-2 text-xs">Version history and diffs will appear here.</p>
            </div>
          )
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with tabs and collapse button */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-2 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors",
                  activeTab === tab.id
                    ? "bg-background text-foreground border border-b-0 border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Collapse button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Collapse panel"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
