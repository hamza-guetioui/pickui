"use client";

import * as React from "react";

/**
 * NixieCounter — glowing Nixie tubes (1950s cold-cathode displays). Every
 * tube holds all ten stacked digit cathodes; the lit one glows orange while
 * the others stay faintly visible behind it, exactly like real glass. Digits
 * "cathode-poison" flicker when they change. Shows a clock by default.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type NixieCounterProps = {
  /** Fixed value to show (digits and ":" only). Omit for a live clock. */
  value?: string;
  /** false = no flicker on change (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-nx-flick{0%{opacity:.2}30%{opacity:1}45%{opacity:.4}60%,100%{opacity:1}}
.gx-nx[data-animated="true"] .gx-nx-on{animation:gx-nx-flick .25s steps(1,end)}
@media (prefers-reduced-motion:reduce){.gx-nx *{animation:none!important}}
`;

function useClock(enabled: boolean) {
  const [t, setT] = React.useState("");
  React.useEffect(() => {
    if (!enabled) return;
    const f = () => {
      const d = new Date();
      setT([d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":"));
    };
    f();
    const id = window.setInterval(f, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return t;
}

function Tube({ d }: { d: string }) {
  return (
    <span
      className="relative inline-grid h-[86px] w-[54px] place-items-center rounded-t-[26px] rounded-b-lg border border-white/15"
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.02) 30%, rgba(255,255,255,.06) 70%, rgba(255,255,255,.12)), rgba(20,12,8,.85)",
        boxShadow: "inset 0 0 14px rgba(0,0,0,.9), 0 6px 14px -4px rgba(0,0,0,.8)",
      }}
    >
      {/* mesh */}
      <span className="absolute inset-2 rounded-t-[22px] opacity-30 [background:repeating-linear-gradient(60deg,transparent_0_3px,rgba(255,255,255,.12)_3px_4px),repeating-linear-gradient(-60deg,transparent_0_3px,rgba(255,255,255,.12)_3px_4px)]" />
      {/* unlit cathodes stacked */}
      {"0123456789".split("").map((n) => (
        <span key={n} aria-hidden className="absolute font-mono text-[46px] font-light leading-none text-[#8a5a3a]/15">
          {n}
        </span>
      ))}
      <span
        key={d}
        className="gx-nx-on relative font-mono text-[46px] font-light leading-none text-[#ffb36b]"
        style={{ textShadow: "0 0 4px #ff8a3d, 0 0 10px #ff6a1a, 0 0 22px #ff5a00, 0 0 40px rgba(255,90,0,.6)" }}
      >
        {d}
      </span>
      <span className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 rounded-b bg-neutral-700" />
    </span>
  );
}

export function NixieCounter({ value, animated = true, className = "" }: NixieCounterProps) {
  const clock = useClock(value === undefined);
  const text = value ?? clock;

  return (
    <div
      className={`gx-nx inline-flex items-end gap-2 rounded-2xl border border-[#3a2a1d] bg-gradient-to-b from-[#2a1f17] to-[#140e0a] px-5 pb-6 pt-5 shadow-[0_20px_40px_-14px_rgba(0,0,0,.9)] ${className}`}
      data-animated={animated}
      role="timer"
      aria-label={text}
    >
      <style>{css}</style>
      {[...(text || "00:00:00")].map((c, i) =>
        c === ":" ? (
          <span key={i} aria-hidden className="mb-6 flex flex-col gap-3">
            {[0, 1].map((k) => (
              <span key={k} className="h-2 w-2 rounded-full bg-[#ff8a3d] shadow-[0_0_8px_#ff6a1a]" />
            ))}
          </span>
        ) : (
          <Tube key={i} d={c} />
        ),
      )}
    </div>
  );
}

export default NixieCounter;
