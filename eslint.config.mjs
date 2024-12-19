import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  {
    plugins: {
      perfectionist,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
