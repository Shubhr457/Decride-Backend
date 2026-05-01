module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  testTimeout: 30000,
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],
};
