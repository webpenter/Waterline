const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
const PX_ARBITRARY = /\[-?\d+(\.\d+)?px\]/;
const HEX_ARBITRARY = /\[#[0-9a-fA-F]{3,8}\]/;

function report(context, node, messageId) {
  context.report({ node, messageId });
}

function checkValue(context, node, value) {
  if (typeof value !== 'string') return;
  if (HEX_ARBITRARY.test(value) || HEX_COLOR.test(value)) {
    report(context, node, 'hexColor');
    return;
  }
  if (PX_ARBITRARY.test(value)) {
    report(context, node, 'arbitraryPx');
  }
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded hex colours, arbitrary px font-sizes and arbitrary Tailwind spacing outside /src/tokens.',
    },
    schema: [],
    messages: {
      hexColor:
        'Hardcoded hex colours are not allowed outside /src/tokens. Add the colour to tokens.ts and use the generated Tailwind class instead.',
      arbitraryPx:
        'Arbitrary px values are not allowed outside /src/tokens. Add the size/spacing to tokens.ts and use the generated Tailwind class instead.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        checkValue(context, node, node.value);
      },
      TemplateElement(node) {
        checkValue(context, node, node.value.raw);
      },
    };
  },
};

const plugin = { rules: { 'no-hardcoded-design-values': rule } };

export default plugin;
