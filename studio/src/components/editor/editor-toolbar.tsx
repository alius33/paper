'use client';

import { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Minus,
  Undo2,
  Redo2,
  BookOpen,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  disabled: boolean;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  disabled,
  active = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'text-muted-foreground hover:bg-secondary hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-secondary text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);

  const toggleReadingMode = useCallback(() => {
    if (!editor) return;
    const next = !isReadingMode;
    setIsReadingMode(next);
    editor.setEditable(!next);
  }, [editor, isReadingMode]);

  const disabled = !editor;

  return (
    <div className="flex items-center gap-0.5 border-b border-border bg-card px-3 py-1.5">
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        disabled={disabled}
        active={editor?.isActive('bold') ?? false}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        disabled={disabled}
        active={editor?.isActive('italic') ?? false}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor?.commands.setSceneBreak()}
        disabled={disabled}
        title="Scene Break (Ctrl+Shift+B)"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={disabled || !(editor?.can().undo() ?? false)}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={disabled || !(editor?.can().redo() ?? false)}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={toggleReadingMode}
        disabled={disabled}
        active={isReadingMode}
        title={isReadingMode ? 'Switch to Edit Mode' : 'Switch to Reading Mode'}
      >
        {isReadingMode ? (
          <BookOpen className="h-4 w-4" />
        ) : (
          <Edit3 className="h-4 w-4" />
        )}
      </ToolbarButton>
    </div>
  );
}

export default EditorToolbar;
