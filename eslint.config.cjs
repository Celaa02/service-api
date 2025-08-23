// eslint.config.cjs (ESLint v9 - flat config, CommonJS)
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const prettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  // Ignorados (reemplaza .eslintignore)
  {
    ignores: ["node_modules", ".esbuild", ".build", "coverage", "dist"],
  },

  // Reglas base JS
  js.configs.recommended,

  // Reglas TypeScript
  ...tseslint.configs.recommended,

  // Código de la app (TS/ESM)
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.es2021 },
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

  // Archivos de configuración CJS (permitir require/module y globals de Node)
  {
    files: [
      "eslint.config.cjs",
      "jest.config.cjs",
      "jest.config.js",
      "commitlint.config.cjs",
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
    },
  },

  // Entorno de tests (globals de Jest)
  {
    files: ["tests/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },

  // Desactiva conflictos con Prettier
  prettier,
];

