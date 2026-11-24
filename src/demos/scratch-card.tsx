"use client";

import ScratchCard from "../library/scratch-card";

export default function ScratchCardDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <ScratchCard animated={variant !== "regular"} hint="Scratch to reveal">
      <div
        className="grid h-full place-items-center text-center"
        style={{ background: "radial-gradient(circle at 30% 20%, #f472b6, transparent 50%), radial-gradient(circle at 80% 80%, #22d3ee, transparent 50%), #0b0b10" }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/70">You won</p>
          <p className="text-5xl font-black text-white">-30%</p>
          <p className="mt-1 font-mono text-xs text-white/70">code: SCRATCHED</p>
        </div>
      </div>
    </ScratchCard>
  );
}
