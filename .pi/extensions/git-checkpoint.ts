/**
 * Git Checkpoint — PickUI
 *
 * Creates a lightweight git stash checkpoint at the start of each turn so a later /fork can offer
 * to restore the code state. Non-destructive: uses `git stash create` (does not touch the worktree).
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	const checkpoints = new Map<string, string>();
	let currentEntryId: string | undefined;

	pi.on("tool_result", async (_event, ctx) => {
		const leaf = ctx.sessionManager.getLeafEntry();
		if (leaf) currentEntryId = leaf.id;
	});

	pi.on("turn_start", async () => {
		const { stdout } = await pi.exec("git", ["stash", "create"]);
		const ref = stdout.trim();
		if (ref && currentEntryId) checkpoints.set(currentEntryId, ref);
	});

	pi.on("session_before_fork", async (event, ctx) => {
		const ref = checkpoints.get(event.entryId);
		if (!ref || !ctx.hasUI) return;

		const choice = await ctx.ui.select("Restore code to this checkpoint?", [
			"No, keep current code",
			"Yes, restore code to that point",
		]);

		if (choice?.startsWith("Yes")) {
			await pi.exec("git", ["stash", "apply", ref]);
			ctx.ui.notify("Code restored to checkpoint", "info");
		}
	});

	pi.on("agent_settled", async () => {
		checkpoints.clear();
	});
}
