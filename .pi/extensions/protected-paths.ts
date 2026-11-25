/**
 * Protected Paths Guard — PickUI
 *
 * Blocks write/edit to sensitive files without explicit human approval.
 * Adjust the globs here if the repo's protected surface changes (keep AGENTS.md in sync).
 */

import { relative, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Substring / path fragments that mark a protected file.
const PROTECTED = [
	".env",
	".git/",
	"node_modules/",
	"package.json",
	"package-lock.json",
	"next.config.ts",
	"tsconfig.json",
	"eslint.config.mjs",
	"tailwind.config.ts",
	"postcss.config.mjs",
	".github/workflows/", // CI = the done-gate
	"scripts/check-registry.mjs", // consistency gate
	"LICENSE",
];

/**
 * Explicit, narrowly scoped owner approvals for otherwise-protected files.
 *
 * Each entry unblocks exactly ONE file (exact repo-relative path, no globs or
 * substrings), only for the listed tools, and only until `expires` (UTC).
 * Everything else in PROTECTED stays blocked. Remove the entry once the
 * approved change has landed. Changes here take effect after `/reload`.
 */
type ApprovedException = {
	path: string; // exact repo-relative path, forward slashes
	tools: ReadonlyArray<"edit" | "write">;
	expires: string; // ISO-8601 UTC; approval is void after this instant
	reason: string;
};

// No active approvals. Add an entry only with explicit owner approval, e.g.:
// { path: "src/features/X/server/file.ts", tools: ["edit"], expires: "YYYY-MM-DDT23:59:59Z", reason: "…" }
const APPROVED_EXCEPTIONS: ReadonlyArray<ApprovedException> = [];

function normalize(p: string): string {
	return p.replace(/\\/g, "/");
}

/** Repo-relative, forward-slash path; null if it resolves outside the repo. */
function repoRelative(cwd: string, raw: string): string | null {
	const rel = normalize(relative(resolve(cwd), resolve(cwd, raw)));
	if (!rel || rel.startsWith("../") || rel === ".." || /^[a-zA-Z]:/.test(rel)) return null;
	return rel;
}

function findApproval(cwd: string, raw: string, tool: string): ApprovedException | undefined {
	const rel = repoRelative(cwd, raw);
	if (!rel) return undefined;
	const caseInsensitive = process.platform === "win32";
	const same = (a: string, b: string) => (caseInsensitive ? a.toLowerCase() === b.toLowerCase() : a === b);
	const now = Date.now();
	return APPROVED_EXCEPTIONS.find(
		(e) =>
			same(e.path, rel) &&
			(e.tools as ReadonlyArray<string>).includes(tool) &&
			Number.isFinite(Date.parse(e.expires)) &&
			now <= Date.parse(e.expires),
	);
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") {
			return undefined;
		}

		const raw = (event.input?.path as string) ?? "";
		const path = normalize(raw);
		const hit = PROTECTED.find((p) => path.includes(p));

		if (hit) {
			const approval = findApproval(ctx.cwd, raw, event.toolName);
			if (approval) {
				if (ctx.hasUI) {
					ctx.ui.notify(
						`Owner-approved ${event.toolName} to protected path ${approval.path} (expires ${approval.expires}): ${approval.reason}`,
						"info",
					);
				}
				return undefined;
			}

			if (ctx.hasUI) {
				ctx.ui.notify(
					`Blocked write to protected path (matched "${hit}"): ${raw}. Ask the owner before editing.`,
					"warning",
				);
			}
			return {
				block: true,
				reason: `"${raw}" is a protected path in PickUI (matched "${hit}"). Requires explicit approval.`,
			};
		}

		return undefined;
	});
}
