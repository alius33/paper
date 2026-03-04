export type FileCategory = 'chapter' | 'research' | 'plot' | 'reference' | 'media' | 'project-guide' | 'other';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  wordCount?: number;
  lastModified?: string;
  size?: number;
  category?: FileCategory;
}

export interface FileContent {
  content: string;
  metadata: {
    wordCount: number;
    lastModified: string;
    size: number;
  };
}
