// eslint.config.cjs (ESLint v9 - flat config en CommonJS)
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const prettier = require("eslint-config-prettier");

module.exports = [
  // Ignorados (reemplaza .eslintignore)
  {
    ignores: ["node_modules", ".esbuild", ".build", "coverage", "dist"],
  },

  // Reglas base JS
  js.configs.recommended,

  // Reglas TypeScript
  ...tseslint.configs.recommended,

  // Reglas del proyecto
  {
    files: ["**/*.ts"],
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
        },
      ],
    },
  },

  // Desactiva reglas que chocan con Prettier
  prettier,

  // Entorno de tests (Jest)
  {
    files: ["tests/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
  },
];

