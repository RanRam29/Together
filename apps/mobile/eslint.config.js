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
    // Shared UI kit guardrail: flag raw touchables in screens so new work
    // routes through @/components/ui. `warn` keeps it visible without blocking
    // the tsc/lint gate; screens migrate incrementally across the Stitch waves.
    // Scoped to app/** only — the kit components themselves are allowed to use
    // the RN primitives. Cards can't be detected reliably in the AST (they are
    // styled <View>s), so this covers buttons; card consistency relies on the
    // exemplar screens + review.
    files: ["app/**/*.{tsx,ts}"],
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
]);
