/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/infrastructure/http/handlers/**", // si no quieres medir handlers aún
    "!src/**/index.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json-summary"],
  // Umbrales mínimos de cobertura (ajústalos a tu gusto)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 70,
      lines: 85,
      statements: 85
    }
  },
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"]
};
