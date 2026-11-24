"use client";

import * as React from "react";

/**
 * SignalLost — a CRT "no carrier" error screen (404 / 500 / offline).
 * RGB-split glitch slices, rolling scan bar, animated film grain, VHS tracking
 * text and a REC counter. Hover to push the glitch harder.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SignalLostProps = {
  /** Big glitching text, e.g. "404". */
  code?: string;
  title?: string;
  message?: string;
  /** Small monospace channel line in the top-left corner. */
  channel?: string;
  /** "calm" | "normal" | "chaos" — base glitch speed. Hover always boosts it. */
  intensity?: "calm" | "normal" | "chaos";
  /** Action buttons/links rendered under the message. */
  children?: React.ReactNode;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const SPEED = { calm: 3.2, normal: 2.2, chaos: 1.1 } as const;

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

const css = `
.gx-sl{--sp:2.2s}
.gx-sl:hover{--sp:.7s}
.gx-sl-a{animation:gx-sl-s1 var(--sp) steps(1) infinite}
.gx-sl-b{animation:gx-sl-s2 calc(var(--sp)*1.27) steps(1) infinite}
.gx-sl-main{animation:gx-sl-jit calc(var(--sp)*2.3) steps(1) infinite}
.gx-sl-noise{animation:gx-sl-grain .5s steps(6) infinite}
.gx-sl-roll{animation:gx-sl-roll 5.5s linear infinite}
.gx-sl-flick{animation:gx-sl-flick 4s infinite}
.gx-sl-rec{animation:gx-sl-blink 1s steps(1) infinite}
@keyframes gx-sl-s1{0%{clip-path:inset(12% 0 70% 0);transform:translate(-6px,0)}14%{clip-path:inset(62% 0 18% 0);transform:translate(5px,0)}28%{clip-path:inset(38% 0 44% 0);transform:translate(-3px,0)}42%{clip-path:inset(84% 0 4% 0);transform:translate(7px,0)}56%{clip-path:inset(4% 0 88% 0);transform:translate(-5px,0)}70%{clip-path:inset(50% 0 30% 0);transform:translate(2px,0)}84%{clip-path:inset(24% 0 60% 0);transform:translate(-8px,0)}100%{clip-path:inset(0 0 100% 0)}}
@keyframes gx-sl-s2{0%{clip-path:inset(70% 0 10% 0);transform:translate(6px,0)}16%{clip-path:inset(8% 0 76% 0);transform:translate(-4px,0)}32%{clip-path:inset(46% 0 36% 0);transform:translate(6px,0)}48%{clip-path:inset(90% 0 2% 0);transform:translate(-7px,0)}64%{clip-path:inset(28% 0 54% 0);transform:translate(3px,0)}80%{clip-path:inset(58% 0 26% 0);transform:translate(-2px,0)}100%{clip-path:inset(100% 0 0 0)}}
@keyframes gx-sl-jit{0%,86%,100%{transform:none}88%{transform:translate(3px,-1px) skewX(10deg)}90%{transform:translate(-4px,1px) skewX(-8deg)}92%{transform:translate(2px,0) skewX(3deg)}}
@keyframes gx-sl-grain{0%{transform:translate(0,0)}20%{transform:translate(-8%,4%)}40%{transform:translate(6%,-6%)}60%{transform:translate(-4%,8%)}80%{transform:translate(8%,2%)}100%{transform:translate(0,0)}}
@keyframes gx-sl-roll{from{transform:translateY(-30%)}to{transform:translateY(130%)}}
@keyframes gx-sl-flick{0%,100%{opacity:1}47%{opacity:1}48%{opacity:.78}49%{opacity:1}72%{opacity:.9}73%{opacity:1}}
@keyframes gx-sl-blink{0%{opacity:1}50%{opacity:0}}
.gx-sl[data-animated="false"] *{animation:none!important}.gx-sl[data-animated="false"] .gx-sl-a{clip-path:inset(30% 0 50% 0);transform:translate(-4px,0)}.gx-sl[data-animated="false"] .gx-sl-b{clip-path:inset(60% 0 20% 0);transform:translate(4px,0)}
@media (prefers-reduced-motion:reduce){.gx-sl *{animation:none!important}.gx-sl-a{clip-path:inset(30% 0 50% 0);transform:translate(-4px,0)}.gx-sl-b{clip-path:inset(60% 0 20% 0);transform:translate(4px,0)}}
`;

function useClock() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setT((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const s = t % 60;
  const m = Math.floor(t / 60) % 60;
  return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SignalLost({
  code = "404",
  title = "Signal lost",
  message = "The page you were tuned to stopped broadcasting. It may have moved, or never existed.",
  channel = "CH 04 · NO CARRIER",
  intensity = "normal",
  children,
  animated = true,
  className = "",
}: SignalLostProps) {
  const clock = useClock();
  const titleId = React.useId();

  return (
    <section
      className={`gx-sl relative isolate flex h-full min-h-[360px] w-full items-center justify-center overflow-hidden bg-[#050505] text-white ${className}`}
      style={{ "--sp": `${SPEED[intensity]}s` } as React.CSSProperties}
      aria-labelledby={titleId}
      data-animated={animated}
    >
      <style>{css}</style>

      {/* phosphor glow + film grain + scanlines + rolling bar + vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,255,180,0.08),transparent_65%)]" />
      <div
        aria-hidden
        className="gx-sl-noise pointer-events-none absolute -inset-[20%] opacity-[0.22] mix-blend-screen"
        style={{ backgroundImage: NOISE }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-40"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.55) 0 1px, transparent 1px 3px)" }}
      />
      <div
        aria-hidden
        className="gx-sl-roll pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_140px_40px_rgba(0,0,0,0.95)]" />

      {/* HUD */}
      <div aria-hidden className="absolute left-4 top-4 z-30 font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/70 sm:text-xs">
        {channel}
      </div>
      <div aria-hidden className="absolute right-4 top-4 z-30 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/70 sm:text-xs">
        <span className="gx-sl-rec h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
        REC {clock}
      </div>
      <div aria-hidden className="absolute bottom-4 left-4 z-30 font-mono text-[10px] tracking-[0.3em] text-white/40 sm:text-xs">
        ◀◀ TRACKING ▶▶
      </div>

      <div className="gx-sl-flick relative z-10 flex flex-col items-center px-6 text-center">
        <div className="gx-sl-main relative select-none font-black leading-none tracking-tighter text-[clamp(4.5rem,18vw,10rem)]">
          <span className="relative z-10 text-white [text-shadow:0_0_24px_rgba(255,255,255,0.35)]">{code}</span>
          <span aria-hidden className="gx-sl-a absolute inset-0 text-cyan-300 mix-blend-screen">
            {code}
          </span>
          <span aria-hidden className="gx-sl-b absolute inset-0 text-red-500 mix-blend-screen">
            {code}
          </span>
        </div>
        <h2 id={titleId} className="mt-4 font-mono text-sm uppercase tracking-[0.4em] text-emerald-300 sm:text-base">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{message}</p>
        {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}

export default SignalLost;
