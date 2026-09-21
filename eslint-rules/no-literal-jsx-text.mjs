/**
 * CLAUDE.md rule 7 / Prompt 6 acceptance: all user-facing strings come from
 * /src/messages/*.json — no literal strings in JSX. Flags JSX text nodes with
 * letters in them. Symbols, numbers and separators ("·", "→", "24 m²") pass:
 * they are typography, not copy.
 */

const HAS_LETTERS = /\p{L}{2,}/u;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow literal user-facing text in JSX; use next-intl messages from /src/messages.',
    },
    schema: [],
    messages: {
      literalText:
        'Literal user-facing text in JSX: "{{text}}". Add it to /src/messages/en.json and render it with useTranslations()/getTranslations().',
    },
  },
  create(context) {
    return {
      JSXText(node) {
        const text = node.value.trim();
        if (text && HAS_LETTERS.test(text)) {
          context.report({
            node,
            messageId: 'literalText',
            data: { text: text.length > 40 ? `${text.slice(0, 40)}…` : text },
          });
        }
      },
    };
  },
};

const plugin = { rules: { 'no-literal-jsx-text': rule } };

export default plugin;
