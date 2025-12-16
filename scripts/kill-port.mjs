#!/usr/bin/env node

import { execSync } from "node:child_process";
import { platform } from "node:os";

const port = process.argv[2] || process.env.PORT || "3000";

try {
	if (platform() === "win32") {
		// Windows PowerShell command
		const command = `powershell -Command "$process = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($process) { Stop-Process -Id $process -Force; Write-Host 'Process on port ${port} has been stopped' } else { Write-Host 'No process found on port ${port}' }"`;
		execSync(command, { stdio: "inherit" });
	} else {
		// Unix/Linux/Mac command
		const pid = execSync(`lsof -ti:${port}`, {
			encoding: "utf-8",
			stdio: "pipe",
		}).trim();
		if (pid) {
			execSync(`kill -9 ${pid}`, { stdio: "inherit" });
			console.log(`Process on port ${port} has been stopped`);
		} else {
			console.log(`No process found on port ${port}`);
		}
	}
} catch (error) {
	if (error.status === 1) {
		console.log(`No process found on port ${port}`);
	} else {
		console.error(`Error killing process on port ${port}:`, error.message);
		process.exit(1);
	}
}
