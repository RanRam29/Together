// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

const uiKitMessage =
  "Prefer <Button>/<Card> from @/components/ui for buttons and cards. " +
  "If this is a genuine non-button (list row, tab, inline link), add an " +
  "eslint-disable-next-line no-restricted-syntax comment with a short reason.";

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Shared UI kit guardrail: flag raw touchables so new work routes through
    // @/components/ui. `warn` keeps it visible without blocking the tsc/lint
    // gate. Covers screens (app/**) and feature components (components/**).
    // Cards can't be detected reliably in the AST (they are styled <View>s),
    // so this covers buttons; card consistency relies on review.
    files: ["app/**/*.{tsx,ts}", "components/**/*.{tsx,ts}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name='TouchableOpacity']",
          message: uiKitMessage,
        },
        {
          selector: "JSXOpeningElement[name.name='Pressable']",
          message: uiKitMessage,
        },
      ],
    },
  },
  {
    // components/ui/** IS the kit — Button/Card/ChipSelect/Form/etc. legitimately
    // build on the RN primitives. Exempt them from the guardrail.
    files: ["components/ui/**/*.{tsx,ts}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);
