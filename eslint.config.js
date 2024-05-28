import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import svelteParser from "svelte-eslint-parser";
import eslintPluginTypescript from "@typescript-eslint/eslint-plugin";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginImport from "eslint-plugin-import-x";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
// compat stuff: https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // global ignores: https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
  {
    ignores: [
      "node_modules/",
      "build/",
      "dist/",
      ".svelte-kit/",
      ".env",
      ".env.*",
      "!.env.example",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      ".DS_Store",
    ],
  },
  // configs to extend
  js.configs.recommended,
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  ...eslintPluginSvelte.configs["flat/recommended"],
  eslintConfigPrettier,
  // our config
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypescript,
      unicorn: eslintPluginUnicorn,
      import: eslintPluginImport,
      svelte: eslintPluginSvelte,
    },
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
          ignore: ["\\.shim\\.d\\.ts$"],
        },
      ],
      curly: ["error"],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "$**",
              group: "internal",
            },
            {
              pattern: "$*/**",
              group: "internal",
            },
          ],
        },
      ],
      "no-undef": ["off"],
      "object-shorthand": "error",
      "svelte/valid-compile": ["error", { ignoreWarnings: true }],
      "svelte/no-at-html-tags": ["warn"],
    },
  },
  // adjustments for .svelte files
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
];
