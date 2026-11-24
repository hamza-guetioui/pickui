"use client";

import * as React from "react";

/**
 * NeonSign — glass-tube neon lettering on a brick wall. Every letter warms up
 * with its own stutter, the wall picks up the glow, and "broken" tubes keep
 * buzzing forever. Tubes are drawn as stroked glyphs with stacked
 * drop-shadows, so it looks like bent glass instead of glowing text.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type NeonSignProps = {
  text: string;
  /** Second, smaller line (e.g. "open late"). */
  subtext?: string;
  color?: string;
  subColor?: string;
  /** Indexes of letters in `text` that keep flickering. */
  broken?: number[];
  /** Brick wall background (default true). */
  wall?: boolean;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-ns-on{0%{opacity:0}10%{opacity:.9}12%{opacity:0}30%{opacity:0}32%{opacity:1}34%{opacity:.2}36%{opacity:1}62%{opacity:1}63%{opacity:.3}64%,100%{opacity:1}}
@keyframes gx-ns-buzz{0%,100%{opacity:1}4%{opacity:.15}6%{opacity:1}8%{opacity:.4}9%{opacity:1}52%{opacity:1}53%{opacity:.1}57%{opacity:.1}58%{opacity:1}}
.gx-ns-lit{opacity:0;animation:gx-ns-on 1.8s steps(1,end) var(--d) forwards}
.gx-ns-lit[data-broken="true"]{animation:gx-ns-on 1.8s steps(1,end) var(--d) forwards,gx-ns-buzz 3.3s steps(1,end) calc(var(--d) + 1.8s) infinite}
.gx-ns-wallglow{opacity:0;animation:gx-ns-on 1.8s steps(1,end) .1s forwards}
[data-gx-ns-calm="true"] .gx-ns-lit,[data-gx-ns-calm="true"] .gx-ns-wallglow{animation:none!important;opacity:1}
@media (prefers-reduced-motion:reduce){.gx-ns-lit,.gx-ns-wallglow{animation:none;opacity:1}}
`;

const BRICKS =
  "linear-gradient(0deg, rgba(0,0,0,.55) 2px, transparent 2px) 0 0/100% 28px, linear-gradient(90deg, rgba(0,0,0,.55) 2px, transparent 2px) 0 0/64px 56px, linear-gradient(90deg, rgba(0,0,0,.55) 2px, transparent 2px) 32px 28px/64px 56px, linear-gradient(180deg,#2a1a17,#1a1110)";

function Tube({ text, color, delay0, broken = [], className }: { text: string; color: string; delay0: number; broken?: number[]; className?: string }) {
  return (
    <span aria-hidden className={`relative inline-flex whitespace-pre ${className ?? ""}`}>
      {[...text].map((ch, i) => (
        <span key={i} className="relative">
          {/* unlit glass */}
          <span className="text-transparent [-webkit-text-stroke:0.04em_rgba(255,255,255,.14)]">{ch}</span>
          {/* lit gas */}
          <span
            className="gx-ns-lit absolute inset-0 text-transparent"
            data-broken={broken.includes(i)}
            style={
              {
                "--d": `${delay0 + ((i * 7) % 5) * 0.14}s`,
                WebkitTextStroke: `0.045em color-mix(in srgb, ${color} 35%, white)`,
                filter: `drop-shadow(0 0 1px ${color}) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 18px ${color})`,
              } as React.CSSProperties
            }
          >
            {ch}
          </span>
        </span>
      ))}
    </span>
  );
}

export function NeonSign({
  text,
  subtext,
  color = "#ff2d95",
  subColor = "#38e1ff",
  broken = [],
  wall = true,
  animated = true,
  className = "",
}: NeonSignProps) {
  return (
    <div
      className={`relative isolate flex h-full min-h-[260px] w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: wall ? BRICKS : "#08080a" }}
      data-gx-ns-calm={!animated}
      role="img"
      aria-label={subtext ? `${text} — ${subtext}` : text}
    >
      <style>{css}</style>
      <div
        aria-hidden
        className="gx-ns-wallglow absolute inset-0"
        style={{ background: `radial-gradient(45% 50% at 50% 50%, color-mix(in srgb, ${color} 30%, transparent), transparent 70%)` }}
      />
      <div aria-hidden className="absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(0,0,0,.9)]" />
      <div className="relative flex flex-col items-center gap-2 font-black tracking-tight [font-family:ui-rounded,'Arial_Rounded_MT_Bold','Nunito',system-ui,sans-serif]">
        <Tube text={text} color={color} delay0={0.1} broken={broken} className="text-[clamp(2.75rem,9vw,5.5rem)] leading-none" />
        {subtext && (
          <Tube text={subtext} color={subColor} delay0={0.9} className="text-[clamp(.9rem,2.6vw,1.4rem)] uppercase tracking-[0.35em]" />
        )}
      </div>
    </div>
  );
}

export default NeonSign;
