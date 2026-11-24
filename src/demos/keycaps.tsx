"use client";

import { useState } from "react";
import Keycaps, { type Keycap } from "../library/keycaps";

const KEYS: Keycap[] = [
  { label: "esc", match: ["Escape"], variant: "dark" },
  { label: "⌘", match: ["Meta", "Control"], variant: "dark", width: 1.5, ariaLabel: "Command" },
  { label: "K", match: ["k"], variant: "accent" },
  { label: "space", match: [" "], width: 2.5 },
  { label: "↵", match: ["Enter"], variant: "dark", width: 1.5, ariaLabel: "Enter" },
];

export default function KeycapsDemo({ variant = "animated" }: { variant?: string }) {
  const [last, setLast] = useState("Try ⌘ / Ctrl + K on your keyboard");
  return (
    <div className="flex flex-col items-center gap-5">
      <Keycaps animated={variant !== "regular"} keys={KEYS} sound accent="#4ade80" onPress={(i) => setLast(`Pressed ${KEYS[i].ariaLabel ?? String(KEYS[i].label)}`)} />
      <p className="font-mono text-xs text-white/50" aria-live="polite">
        {last}
      </p>
    </div>
  );
}
