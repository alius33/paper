import { Extension } from '@tiptap/core';
import { InputRule } from '@tiptap/core';

/**
 * Em-dash input rule extension.
 *
 * When the user types `---` followed by a space, the three hyphens are
 * replaced with an em-dash `—` plus the trailing space. This matches the
 * manuscript style described in CLAUDE.md, where em dashes are used freely
 * for parenthetical interjections, appositional detail, and mid-thought pivots.
 */
export const EmDash = Extension.create({
  name: 'emDash',

  addInputRules() {
    return [
      new InputRule({
        // Match three hyphens followed by a space at the end of input.
        // The space is the trigger character.
        find: /---\s$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          // Replace the `--- ` with `— `
          tr.insertText('\u2014 ', range.from, range.to);
        },
      }),
    ];
  },
});

export default EmDash;
