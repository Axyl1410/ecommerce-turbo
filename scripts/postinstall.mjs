import { spawn } from "node:child_process";

const shouldSkip =
  process.env.SKIP_PRISMA_GENERATE === "1" || process.env.SKIP_DATABASE === "1";

if (shouldSkip) {
  console.log("[postinstall] Skipping Prisma generate for @workspace/database");
  process.exit(0);
}

console.log("[postinstall] Running Prisma generate for @workspace/database...");

const child = spawn(
  "pnpm",
  ["--filter", "@workspace/database", "run", "database:generate"],
  { stdio: "inherit", shell: true }
);

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(
      `[postinstall] Prisma generate failed with exit code ${code}`
    );
    process.exit(code ?? 1);
  }
  process.exit(0);
});
