"use client";

import { formatDistanceToNow } from "date-fns";

interface FileMetadataProps {
  wordCount?: number;
  lastModified?: string;
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k words`;
  }
  return `${count} words`;
}

export function FileMetadata({ wordCount, lastModified }: FileMetadataProps) {
  if (!wordCount && !lastModified) {
    return null;
  }

  return (
    <span className="ml-auto flex items-center gap-2 text-[10px] text-sidebar-muted whitespace-nowrap">
      {wordCount !== undefined && wordCount > 0 && (
        <span>{formatWordCount(wordCount)}</span>
      )}
      {lastModified && (
        <span>
          {formatDistanceToNow(new Date(lastModified), { addSuffix: true })}
        </span>
      )}
    </span>
  );
}
