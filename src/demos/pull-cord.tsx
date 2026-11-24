"use client";

import PullCord from "../library/pull-cord";

export default function PullCordDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <PullCord animated={variant !== "regular"} label="Desk lamp" className="h-full min-h-[420px]">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-200/80">Pull the cord</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight text-white">Ideas need light.</h3>
        <p className="mt-2 max-w-xs text-sm text-white/60">Drag the brass bead down, tap it, or press Enter.</p>
      </div>
    </PullCord>
  );
}
