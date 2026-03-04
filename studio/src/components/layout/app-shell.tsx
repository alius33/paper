"use client";

import { ReactNode } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
} from "react-resizable-panels";
import { StatusBar } from "./status-bar";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function AppShell({ sidebar, main, rightPanel }: AppShellProps) {
  const rightPanelRef = usePanelRef();

  const toggleRightPanel = () => {
    const panel = rightPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal" id="paper-house-panels">
          {/* Sidebar */}
          <Panel
            id="sidebar"
            minSize="15%"
            defaultSize="20%"
            collapsible
            className="bg-sidebar"
          >
            {sidebar}
          </Panel>

          <Separator className="w-px bg-border hover:w-1 hover:bg-accent transition-all data-[separator]:active:bg-accent data-[separator]:active:w-1" />

          {/* Main Content */}
          <Panel
            id="main"
            defaultSize="55%"
            minSize="30%"
            className="bg-background"
          >
            {main}
          </Panel>

          <Separator className="w-px bg-border hover:w-1 hover:bg-accent transition-all data-[separator]:active:bg-accent data-[separator]:active:w-1" />

          {/* Right Panel */}
          <Panel
            id="right"
            panelRef={rightPanelRef}
            minSize="0%"
            defaultSize="25%"
            collapsible
            collapsedSize="0%"
            className="bg-card"
          >
            <RightPanelWrapper onToggle={toggleRightPanel}>
              {rightPanel}
            </RightPanelWrapper>
          </Panel>
        </Group>
      </div>
      <StatusBar />
    </div>
  );
}

function RightPanelWrapper({
  children,
  onToggle,
}: {
  children: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div className="h-full flex flex-col" data-right-panel-toggle={onToggle}>
      {children}
    </div>
  );
}
