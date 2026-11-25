/**
 * Dirty Repo Guard — PickUI
 *
 * Warns before switching/forking a session when there are uncommitted git changes,
 * so in-progress work is not silently abandoned.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

async function checkDirtyRepo(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	action: string,
): Promise<{ cancel: boolean } | undefined> {
	const { stdout, code } = await pi.exec("git", ["status", "--porcelain"]);
	if (code !== 0) return; // not a git repo

	const changed = stdout.trim().split("\n").filter(Boolean).length;
	if (changed === 0) return;

	if (!ctx.hasUI) return { cancel: true };

	const choice = await ctx.ui.select(
		`You have ${changed} uncommitted file(s). ${action} anyway?`,
		["No, let me commit first", "Yes, proceed anyway"],
	);

	if (choice !== "Yes, proceed anyway") {
		ctx.ui.notify("Commit or stash your changes first", "warning");
		return { cancel: true };
	}
}

export default function (pi: ExtensionAPI) {
	pi.on("session_before_switch", async (event, ctx) => {
		const action = event.reason === "new" ? "start a new session" : "switch session";
		return checkDirtyRepo(pi, ctx, action);
	});

	pi.on("session_before_fork", async (_event, ctx) => {
		return checkDirtyRepo(pi, ctx, "fork");
	});
}
