export interface EditorState {
  filePath: string;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
  wordCount: number;
  selectionWordCount: number;
}
