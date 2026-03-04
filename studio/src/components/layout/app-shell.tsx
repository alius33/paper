"use client";

import { ReactNode, useState, useCallback } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
} from "react-resizable-panels";
import type { PanelSize } from "react-resizable-panels";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar } from "./status-bar";
import { PanelContext } from "./panel-context";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function AppShell({ sidebar, main, rightPanel }: AppShellProps) {
  const sidebarRef = usePanelRef();
  const rightPanelRef = usePanelRef();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    const panel = sidebarRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  }, [sidebarRef]);

  const toggleRightPanel = useCallback(() => {
    const panel = rightPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  }, [rightPanelRef]);

  const collapseSidebar = useCallback(() => {
    const panel = sidebarRef.current;
    if (panel && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [sidebarRef]);

  const collapseRightPanel = useCallback(() => {
    const panel = rightPanelRef.current;
    if (panel && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [rightPanelRef]);

  const handleSidebarResize = useCallback((size: PanelSize) => {
    setSidebarCollapsed(size.asPercentage === 0);
  }, []);

  const handleRightPanelResize = useCallback((size: PanelSize) => {
    setRightCollapsed(size.asPercentage === 0);
  }, []);

  return (
    <PanelContext value={{ collapseSidebar, collapseRightPanel }}>
      <div className="flex h-screen flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <Group orientation="horizontal" id="paper-house-panels">
            {/* Sidebar */}
            <Panel
              id="sidebar"
              panelRef={sidebarRef}
              minSize="15%"
              defaultSize="20%"
              collapsible
              collapsedSize="0%"
              onResize={handleSidebarResize}
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
              <div className="relative h-full">
                {/* Sidebar expand button (shown when sidebar is collapsed) */}
                {sidebarCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className={cn(
                      "absolute left-2 top-2 z-10 rounded-md border border-border bg-background p-1.5",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      "shadow-sm transition-colors"
                    )}
                    title="Expand sidebar"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                )}

                {/* Right panel expand button (shown when right panel is collapsed) */}
                {rightCollapsed && (
                  <button
                    onClick={toggleRightPanel}
                    className={cn(
                      "absolute right-2 top-2 z-10 rounded-md border border-border bg-background p-1.5",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      "shadow-sm transition-colors"
                    )}
                    title="Expand right panel"
                  >
                    <PanelRightOpen className="h-4 w-4" />
                  </button>
                )}

                {main}
              </div>
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
              onResize={handleRightPanelResize}
              className="bg-card"
            >
              {rightPanel}
            </Panel>
          </Group>
        </div>
        <StatusBar />
      </div>
    </PanelContext>
  );
}
