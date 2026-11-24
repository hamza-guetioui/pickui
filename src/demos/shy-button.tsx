"use client";

import ShyButton from "../library/shy-button";

export default function ShyButtonDemo({ variant = "dodge" }: { variant?: string }) {
  return (
    <div className="relative grid h-full min-h-[360px] w-full place-items-center bg-[#0b0b0d] p-6 text-center">
      <div>
        <h3 className="text-2xl font-black text-white">Leaving so soon?</h3>
        <p className="mt-2 text-sm text-white/55">You’ll miss the monthly components drop.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">
            Stay subscribed
          </button>
          <ShyButton mode={variant as "dodge" | "teleport" | "shrink"} key={variant}>
            Unsubscribe
          </ShyButton>
        </div>
        <p className="mt-6 font-mono text-[11px] text-white/35">try to click “Unsubscribe” (keyboard users can just Tab to it)</p>
      </div>
    </div>
  );
}
