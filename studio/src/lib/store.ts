import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type ActiveView = 'dashboard' | 'write' | 'manuscript' | 'research';

interface AppState {
  currentFile: string | null;
  wordCount: number;
  selectionWordCount: number;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'idle';
  gitBranch: string;
  theme: Theme;
  activeView: ActiveView;
  isSearchOpen: boolean;
  setCurrentFile: (file: string | null) => void;
  setWordCount: (count: number) => void;
  setSelectionWordCount: (count: number) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'idle') => void;
  setGitBranch: (branch: string) => void;
  setTheme: (theme: Theme) => void;
  setActiveView: (view: ActiveView) => void;
  setSearchOpen: (open: boolean) => void;
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('paper-house-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect system preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  wordCount: 0,
  selectionWordCount: 0,
  saveStatus: 'idle',
  gitBranch: 'main',
  theme: getStoredTheme(),
  activeView: 'dashboard',
  isSearchOpen: false,
  setCurrentFile: (file) => set({ currentFile: file }),
  setWordCount: (count) => set({ wordCount: count }),
  setSelectionWordCount: (count) => set({ selectionWordCount: count }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setGitBranch: (branch) => set({ gitBranch: branch }),
  setTheme: (theme) => {
    localStorage.setItem('paper-house-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setActiveView: (view) => set({ activeView: view }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
