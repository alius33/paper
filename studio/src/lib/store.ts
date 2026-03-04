import { create } from 'zustand';

interface AppState {
  currentFile: string | null;
  wordCount: number;
  selectionWordCount: number;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'idle';
  gitBranch: string;
  setCurrentFile: (file: string | null) => void;
  setWordCount: (count: number) => void;
  setSelectionWordCount: (count: number) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'idle') => void;
  setGitBranch: (branch: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  wordCount: 0,
  selectionWordCount: 0,
  saveStatus: 'idle',
  gitBranch: 'main',
  setCurrentFile: (file) => set({ currentFile: file }),
  setWordCount: (count) => set({ wordCount: count }),
  setSelectionWordCount: (count) => set({ selectionWordCount: count }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setGitBranch: (branch) => set({ gitBranch: branch }),
}));
