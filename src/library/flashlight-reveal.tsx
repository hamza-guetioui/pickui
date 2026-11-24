"use client";

import * as React from "react";

/**
 * FlashlightReveal — the lights are out. Your cursor (or finger) is a
 * flashlight with a soft hot-spot and a dying-battery flicker; its beam
 * reveals a hidden layer drawn under the dark surface. Keyboard users get a
 * "lights on" switch that reveals everything.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type FlashlightRevealProps = {
  /** What the beam reveals. */
  hidden: React.ReactNode;
  /** The dark surface (visible faintly without light). */
  children?: React.ReactNode;
  /** Beam radius in px (default 130). */
  radius?: number;
  /** Beam tint (default warm white). */
  beamColor?: string;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-fl-flicker{0%,100%{opacity:1}6%{opacity:.35}9%{opacity:1}13%{opacity:.6}15%{opacity:1}}
.gx-fl-beam{animation:gx-fl-flicker 4.5s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.gx-fl-beam{animation:none}}
`;

export function FlashlightReveal({
  hidden,
  children,
  radius = 130,
  beamColor = "rgba(255,244,214,0.16)",
  animated = true,
  className = "",
}: FlashlightRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inside, setInside] = React.useState(false);
  const [lights, setLights] = React.useState(false);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const r = lights ? 4000 : inside ? radius : 0;
  const mask = `radial-gradient(circle var(--r) at var(--x) var(--y), #000 0%, #000 55%, rgba(0,0,0,.55) 75%, transparent 100%)`;

  return (
    <div
      ref={ref}
      className={`relative isolate h-[360px] w-full touch-none overflow-hidden bg-[#060607] ${className}`}
      style={{ "--x": "50%", "--y": "50%", "--r": `${r}px`, cursor: inside && !lights ? "none" : undefined } as React.CSSProperties}
      onPointerEnter={(e) => {
        move(e);
        setInside(true);
      }}
      onPointerMove={move}
      onPointerLeave={() => setInside(false)}
    >
      <style>{css}</style>

      {/* dark surface */}
      <div className="absolute inset-0">{children}</div>

      {/* hidden layer, masked by the beam */}
      <div
        className="absolute inset-0"
        aria-hidden={!lights}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        {hidden}
      </div>

      {/* beam glow + hot-spot */}
      {!lights && (
        <div
          aria-hidden
          className={`${animated ? "gx-fl-beam " : ""}pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-300 ${inside ? "opacity-100" : "opacity-0"}`}
          style={{
            background: `radial-gradient(circle ${radius * 1.4}px at var(--x) var(--y), ${beamColor}, transparent 70%), radial-gradient(circle 10px at var(--x) var(--y), rgba(255,255,255,.35), transparent)`,
          }}
        />
      )}

      <button
        type="button"
        aria-pressed={lights}
        onClick={() => setLights((v) => !v)}
        className="absolute bottom-3 right-3 z-10 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ cursor: "pointer" }}
      >
        {lights ? "Lights off" : "Lights on"}
      </button>
    </div>
  );
}

export default FlashlightReveal;
