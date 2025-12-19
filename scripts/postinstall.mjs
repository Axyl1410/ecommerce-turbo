import { spawn } from "node:child_process";
import { resolve } from "node:path";

const shouldSkip =
	process.env.SKIP_PRISMA_GENERATE === "1" || process.env.SKIP_DATABASE === "1";

if (shouldSkip) {
	console.log("[postinstall] Skipping Prisma generate for @workspace/database");
	process.exit(0);
}

console.log("[postinstall] Running Prisma generate for @workspace/database...");

// Run Prisma generate inside the @workspace/database package using Bun
const child = spawn("bun", ["run", "database:generate"], {
	stdio: "inherit",
	shell: true,
	cwd: resolve(process.cwd(), "packages/database"),
});

child.on("exit", (code) => {
	if (code !== 0) {
		console.error(
			`[postinstall] Prisma generate failed with exit code ${code}`,
		);
		process.exit(code ?? 1);
	}
	process.exit(0);
});
