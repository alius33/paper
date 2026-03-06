"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
} from "react-resizable-panels";
import type { PanelSize } from "react-resizable-panels";
import { PanelLeftOpen, PanelRightOpen, Menu, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar } from "./status-bar";
import { PanelContext } from "./panel-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function AppShell({ sidebar, main, rightPanel }: AppShellProps) {
  const isMobile = useIsMobile();
  const sidebarRef = usePanelRef();
  const rightPanelRef = usePanelRef();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Mobile overlay states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileRightPanelOpen, setMobileRightPanelOpen] = useState(false);

  // Close overlays when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
      setMobileRightPanelOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when an overlay is open
  useEffect(() => {
    if (isMobile && (mobileSidebarOpen || mobileRightPanelOpen)) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobile, mobileSidebarOpen, mobileRightPanelOpen]);

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
    if (isMobile) {
      setMobileSidebarOpen(false);
    } else {
      const panel = sidebarRef.current;
      if (panel && !panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [sidebarRef, isMobile]);

  const collapseRightPanel = useCallback(() => {
    if (isMobile) {
      setMobileRightPanelOpen(false);
    } else {
      const panel = rightPanelRef.current;
      if (panel && !panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [rightPanelRef, isMobile]);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
    setMobileRightPanelOpen(false);
  }, []);

  const toggleMobileRightPanel = useCallback(() => {
    setMobileRightPanelOpen((prev) => !prev);
    setMobileSidebarOpen(false);
  }, []);

  const handleSidebarResize = useCallback((size: PanelSize) => {
    setSidebarCollapsed(size.asPercentage === 0);
  }, []);

  const handleRightPanelResize = useCallback((size: PanelSize) => {
    setRightCollapsed(size.asPercentage === 0);
  }, []);

  const contextValue = {
    collapseSidebar,
    collapseRightPanel,
    toggleMobileSidebar,
    toggleMobileRightPanel,
    isMobile,
  };

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <PanelContext value={contextValue}>
        <div className="flex h-[100dvh] flex-col bg-background">
          {/* Mobile top bar */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-border bg-card px-3 py-2">
            <button
              onClick={toggleMobileSidebar}
              className="flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-serif text-sm font-semibold text-primary truncate px-2">
              Paper House Studio
            </span>
            <button
              onClick={toggleMobileRightPanel}
              className="flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open tools panel"
            >
              <BookOpen className="h-5 w-5" />
            </button>
          </div>

          {/* Main content — full width */}
          <div className="flex-1 overflow-hidden bg-background">
            {main}
          </div>

          <StatusBar />

          {/* Sidebar overlay */}
          <div
            className={cn(
              "fixed inset-0 z-50 transition-opacity duration-200",
              mobileSidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div
              className={cn(
                "absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-sidebar shadow-xl transition-transform duration-200 ease-out",
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              {sidebar}
            </div>
          </div>

          {/* Right panel overlay */}
          <div
            className={cn(
              "fixed inset-0 z-50 transition-opacity duration-200",
              mobileRightPanelOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileRightPanelOpen(false)}
            />
            {/* Drawer */}
            <div
              className={cn(
                "absolute top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-card shadow-xl transition-transform duration-200 ease-out",
                mobileRightPanelOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              {rightPanel}
            </div>
          </div>
        </div>
      </PanelContext>
    );
  }

  // ── Desktop layout (unchanged) ──
  return (
    <PanelContext value={contextValue}>
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
