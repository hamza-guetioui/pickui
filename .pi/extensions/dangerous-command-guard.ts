/**
 * Dangerous Command Guard — PickUI
 *
 * Intercepts shell commands and blocks (or, with UI, confirms) destructive operations:
 * force pushes, hard resets, recursive deletes, npm publish, etc.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Each pattern is matched against the full command string.
const DANGEROUS: { pattern: RegExp; label: string }[] = [
	{ pattern: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, label: "recursive force delete (rm -rf)" },
	{ pattern: /\bgit\s+push\b[^\n]*--force|\bgit\s+push\b[^\n]*\s-f(\s|$)/i, label: "git force push" },
	{ pattern: /\bgit\s+reset\s+--hard\b/i, label: "git reset --hard" },
	{ pattern: /\bgit\s+clean\s+-[a-z]*f/i, label: "git clean -f" },
	{ pattern: /\bgit\s+checkout\s+--\s+\./i, label: "git checkout -- . (discard all)" },
	{ pattern: /\bnpm\s+publish\b/i, label: "npm publish" },
	{ pattern: /\bnpm\s+install\b[^\n]*(zod|prettier)/i, label: "adding a dependency (needs approval)" },
	{ pattern: />\s*\.env|\brm\b[^\n]*\.env/i, label: "modifying/deleting .env" },
];

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash" && event.toolName !== "shell") {
			return undefined;
		}

		const cmd = (event.input?.command as string) ?? "";
		const match = DANGEROUS.find((d) => d.pattern.test(cmd));
		if (!match) return undefined;

		if (!ctx.hasUI) {
			// Non-interactive: block by default.
			return { block: true, reason: `Blocked dangerous command: ${match.label}` };
		}

		const choice = await ctx.ui.select(
			`Dangerous command detected (${match.label}). Run it?\n${cmd}`,
			["No, cancel", "Yes, I approve"],
		);

		if (choice !== "Yes, I approve") {
			ctx.ui.notify("Command cancelled", "warning");
			return { block: true, reason: `User cancelled: ${match.label}` };
		}

		return undefined;
	});
}
