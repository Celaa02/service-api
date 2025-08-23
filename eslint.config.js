// eslint.config.js (flat config para ESLint v9)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default [
  // Ignorados (reemplaza .eslintignore)
  {
    ignores: [
      "node_modules",
      ".esbuild",
      ".build",
      "coverage",
      "dist",
      "**/*.js", // si tu código fuente es solo TS
    ],
  },

  // Reglas base JS
  js.configs.recommended,

  // Reglas TypeScript
  ...tseslint.configs.recommended,

  // Reglas del proyecto
  {
    files: ["**/*.ts"],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      // Si NO necesitas reglas type-aware, déjalo sin "project"
      // parserOptions: { project: "./tsconfig.json", tsconfigRootDir: import.meta.dirname },
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
        // mínimos para Jest
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
