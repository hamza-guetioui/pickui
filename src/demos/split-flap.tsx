"use client";

import SplitFlap from "../library/split-flap";

export default function SplitFlapDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300/80">Departures · Gate 7</p>
      <SplitFlap animated={variant !== "regular"} className="text-2xl sm:text-4xl" words={["SHIPPING", "DESIGNING", "DEBUGGING", "DEPLOYED!"]} interval={3600} />
    </div>
  );
}
