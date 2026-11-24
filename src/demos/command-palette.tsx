"use client";

import { useState } from "react";
import CommandPalette, { type CommandItem } from "../library/command-palette";

const ITEMS: CommandItem[] = [
  { id: "new", label: "Create new project", group: "Actions", hint: "N" },
  { id: "deploy", label: "Deploy to production", group: "Actions", hint: "⇧D" },
  { id: "invite", label: "Invite teammate", group: "Actions" },
  { id: "billing", label: "Billing & invoices", group: "Navigation", keywords: ["payment", "plan"] },
  { id: "settings", label: "Settings", group: "Navigation", keywords: ["preferences"] },
  { id: "logs", label: "Runtime logs", group: "Navigation" },
  { id: "docs", label: "Read the docs", group: "Help" },
  { id: "shortcuts", label: "Keyboard shortcuts", group: "Help", hint: "?" },
];

export default function CommandPaletteDemo({ variant = "animated" }: { variant?: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      {/* hotkey disabled here so it doesn't fight the site's own ⌘K */}
      <CommandPalette items={ITEMS} onSelect={(it) => setPicked(it.label)} hotkey={null} placeholder="Type a command or search…" animated={variant !== "regular"} />
      <p className="font-mono text-xs text-white/50" aria-live="polite">
        {picked ? `→ ${picked}` : "Click the bar, type “dep” or “bill”"}
      </p>
    </div>
  );
}
