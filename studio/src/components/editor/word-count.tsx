'use client';

import { useAppStore } from '@/lib/store';

export function WordCount() {
  const wordCount = useAppStore((s) => s.wordCount);
  const selectionWordCount = useAppStore((s) => s.selectionWordCount);

  return (
    <span className="text-xs text-muted-foreground">
      {wordCount.toLocaleString()} words
      {selectionWordCount > 0 && (
        <> ({selectionWordCount.toLocaleString()} selected)</>
      )}
    </span>
  );
}

export default WordCount;
