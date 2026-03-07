"use client";

import { ThemeProvider } from "./theme-provider";
import { TopBar } from "./top-bar";
import { StatusBar } from "./status-bar";
import { SearchModal } from "./search-modal";

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-screen h-[100dvh] flex-col bg-background">
        <TopBar />
        <main className="flex-1 overflow-hidden">{children}</main>
        <StatusBar />
        <SearchModal />
      </div>
    </ThemeProvider>
  );
}
