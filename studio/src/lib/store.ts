import { create } from 'zustand';

export type Theme = 'parchment' | 'standard' | 'dark';

interface AppState {
  currentFile: string | null;
  wordCount: number;
  selectionWordCount: number;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'idle';
  gitBranch: string;
  theme: Theme;
  setCurrentFile: (file: string | null) => void;
  setWordCount: (count: number) => void;
  setSelectionWordCount: (count: number) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'idle') => void;
  setGitBranch: (branch: string) => void;
  setTheme: (theme: Theme) => void;
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'parchment';
  const stored = localStorage.getItem('paper-house-theme');
  if (stored === 'parchment' || stored === 'standard' || stored === 'dark') return stored;
  return 'parchment';
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  wordCount: 0,
  selectionWordCount: 0,
  saveStatus: 'idle',
  gitBranch: 'main',
  theme: getStoredTheme(),
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
}));
