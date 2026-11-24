"use client";

import FlashlightReveal from "../library/flashlight-reveal";

export default function FlashlightRevealDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FlashlightReveal animated={variant !== "regular"}
      className="h-full min-h-[360px]"
      hidden={
        <div className="relative h-full w-full bg-[#0b1d33] [background-image:linear-gradient(rgba(125,211,252,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.18)_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-sky-300">Blueprint · Rev 3</p>
              <p className="mt-3 text-4xl font-black text-white">You found the secret.</p>
              <p className="mt-2 font-mono text-sm text-sky-200/80">promo code: LIGHTS-ON</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid h-full place-items-center text-center">
        <div>
          <p className="text-3xl font-black text-white/[0.07]">Nothing to see here.</p>
          <p className="mt-2 font-mono text-xs text-white/20">move your flashlight around</p>
        </div>
      </div>
    </FlashlightReveal>
  );
}
