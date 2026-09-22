/** Plain paragraphs → a minimal Lexical rich-text value Payload accepts. */
export function textToLexical(...paragraphs: string[]): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.filter(Boolean).map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [{ type: 'text', version: 1, text }],
      })),
    },
  };
}
