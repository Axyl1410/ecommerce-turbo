import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.ts",
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.test.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/__tests__/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
};

export default config;
