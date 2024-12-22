import globals from "globals";
import jslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["eslint.config.mjs", "commitlint.config.js"] },
  { files: ["src/**/*.{js,mjs,cjs,ts}"] },
  {
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
      ],
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",
    },
  },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  jslint.configs.recommended,
  // ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  eslintConfigPrettier,
];
