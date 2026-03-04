export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  author: string;
  files?: string[];
}

export interface Snapshot {
  name: string;
  hash: string;
  date: string;
  message?: string;
}

export interface DiffResult {
  diff: string;
  oldContent: string;
  newContent: string;
}
