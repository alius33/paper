import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sceneBreak: {
      /**
       * Insert a scene break
       * @example editor.commands.setSceneBreak()
       */
      setSceneBreak: () => ReturnType;
    };
  }
}

/**
 * Scene break node for chapter manuscripts.
 *
 * Renders as an <hr> with a data-scene-break attribute.
 * CSS in globals.css already styles hr elements to display "* * *".
 *
 * Markdown serialization outputs `* * *` with surrounding blank lines.
 * Markdown parsing picks up `* * *` (and `---`, `***`, etc.) via
 * markdown-it's built-in hr rule, which produces <hr> elements that
 * match this node's parseHTML spec.
 */
export const SceneBreak = Node.create({
  name: 'sceneBreak',

  group: 'block',

  atom: true,

  parseHTML() {
    return [{ tag: 'hr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, { 'data-scene-break': '' })];
  },

  addCommands() {
    return {
      setSceneBreak:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.setSceneBreak(),
    };
  },

  addStorage() {
    return {
      markdown: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serialize(state: any, node: any) {
          // Output `* * *` with blank lines before and after, matching the
          // manuscript convention defined in CLAUDE.md.
          state.write('\n* * *\n\n');
          state.closeBlock(node);
        },
        parse: {
          // markdown-it already parses `* * *`, `---`, `***` etc. as <hr>.
          // Our parseHTML rule matches <hr>, so no custom parse setup needed.
        },
      },
    };
  },
});

export default SceneBreak;
