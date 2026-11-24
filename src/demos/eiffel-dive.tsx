"use client";

import EiffelDive from "../library/eiffel-dive";
import type { SkyMood } from "../library/sky-dive";

export default function EiffelDiveDemo({ variant = "day" }: { variant?: string }) {
  const mood = (["day", "night", "rain"].includes(variant) ? variant : "day") as SkyMood;
  return <EiffelDive mood={mood} />;
}
