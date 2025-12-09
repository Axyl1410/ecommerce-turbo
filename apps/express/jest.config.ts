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
		"<rootDir>/src/test/**/*.test.ts",
		"<rootDir>/src/test/**/*.spec.ts",
	],
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!src/**/index.ts",
		"!src/test/**",
	],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	clearMocks: true,
};

export default config;
