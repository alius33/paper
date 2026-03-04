'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SaveIndicator() {
  const saveStatus = useAppStore((s) => s.saveStatus);

  if (saveStatus === 'idle') {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          saveStatus === 'saved' && 'bg-green-600',
          saveStatus === 'saving' && 'animate-pulse bg-yellow-500',
          saveStatus === 'unsaved' && 'bg-red-500',
        )}
      />
      {saveStatus === 'saved' && 'Saved'}
      {saveStatus === 'saving' && 'Saving...'}
      {saveStatus === 'unsaved' && 'Unsaved'}
    </span>
  );
}

export default SaveIndicator;
