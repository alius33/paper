'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';

import { SceneBreak } from './extensions/scene-break';
import { EmDash } from './extensions/em-dash';
import { EditorToolbar } from './editor-toolbar';
import { useAppStore } from '@/lib/store';
import { countWords } from '@/lib/word-count';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/constants';

/**
 * Helper to retrieve markdown from the tiptap-markdown extension storage.
 * The tiptap-markdown package adds `editor.storage.markdown` at runtime
 * but does not augment the TypeScript types, so we cast through `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMarkdown(editor: { storage: any }): string {
  return editor.storage.markdown.getMarkdown() as string;
}

interface ChapterEditorProps {
  filePath: string;
  initialContent: string;
}

export function ChapterEditor({ filePath, initialContent }: ChapterEditorProps) {
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);

  const setWordCount = useAppStore((s) => s.setWordCount);
  const setSelectionWordCount = useAppStore((s) => s.setSelectionWordCount);
  const setSaveStatus = useAppStore((s) => s.setSaveStatus);
  const setCurrentFile = useAppStore((s) => s.setCurrentFile);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      Typography.configure({
        // Disable the built-in em-dash rule to avoid conflict with our
        // custom EmDash extension (which triggers on `---` instead of `--`).
        emDash: false,
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Begin writing...',
      }),
      SceneBreak,
      EmDash,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
    onUpdate: ({ editor: ed }) => {
      // Update word count from markdown output
      const md = getMarkdown(ed);
      setWordCount(countWords(md));

      // Mark as unsaved
      setSaveStatus('unsaved');

      // Reset autosave timer
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      autosaveTimer.current = setTimeout(() => {
        save(getMarkdown(ed));
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      if (from === to) {
        setSelectionWordCount(0);
        return;
      }
      const selectedText = ed.state.doc.textBetween(from, to, ' ');
      setSelectionWordCount(countWords(selectedText));
    },
    immediatelyRender: false,
  });

  const save = useCallback(
    async (markdown?: string) => {
      if (isSaving.current) return;
      if (!editor && !markdown) return;

      isSaving.current = true;
      setSaveStatus('saving');

      try {
        const content = markdown ?? getMarkdown(editor!);
        const response = await fetch(`/api/files/${filePath}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            autoCommit: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Save failed: ${response.statusText}`);
        }

        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save:', err);
        setSaveStatus('unsaved');
      } finally {
        isSaving.current = false;
      }
    },
    [editor, filePath, setSaveStatus],
  );

  // Set current file and initial word count on mount
  useEffect(() => {
    setCurrentFile(filePath);
    setWordCount(countWords(initialContent));

    return () => {
      // Clear autosave timer on unmount
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [filePath, initialContent, setCurrentFile, setWordCount]);

  // Expose save and getMarkdown for external use via keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (autosaveTimer.current) {
          clearTimeout(autosaveTimer.current);
        }
        save();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default ChapterEditor;
