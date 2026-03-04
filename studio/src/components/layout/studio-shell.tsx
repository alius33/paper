"use client";

import { ReactNode } from "react";
import { AppShell } from "./app-shell";
import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./sidebar";
import { RightPanel } from "./right-panel";
import { FileTree } from "@/components/file-browser/file-tree";
import { ReferencePanel } from "@/components/viewer/reference-panel";
import { CommandPanel } from "@/components/claude/command-panel";
import { HistoryPanel } from "@/components/version-control/history-panel";

interface StudioShellProps {
  children: ReactNode;
}

export function StudioShell({ children }: StudioShellProps) {
  return (
    <ThemeProvider>
      <AppShell
        sidebar={
          <Sidebar>
            <FileTree />
          </Sidebar>
        }
        main={children}
        rightPanel={
          <RightPanel
            researchContent={<ReferencePanel />}
            claudeContent={<CommandPanel />}
            historyContent={<HistoryPanel />}
          />
        }
      />
    </ThemeProvider>
  );
}
