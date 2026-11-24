"use client";

import * as React from "react";

/**
 * BeforeAfter — a comparison slider for retouching, redesigns or
 * restorations. Drag the handle (or click anywhere, or use ← →) to wipe
 * between two layers.
 * Takes any two nodes (images, components, screenshots).
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type BeforeAfterProps = {
  before?: React.ReactNode;
  after?: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Start position 0–100 (default 50). */
  initial?: number;
  /** false = no intro wiggle (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-ba-hint{0%,100%{left:50%}30%{left:38%}65%{left:60%}}
`;

/* Default demo: an old faded photo restored (pure CSS scene). */
function Scene({ restored }: { restored: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 50% at 70% 30%, #ffd27a, transparent 60%), linear-gradient(180deg,#5aa9e6 0%,#bfe3ff 45%,#2f6b3a 46%,#1d4a27 100%)",
        filter: restored ? "none" : "sepia(.85) contrast(.75) brightness(1.05) blur(.6px)",
      }}
    >
      <div className="absolute bottom-[40%] left-[12%] h-[34%] w-[22%] rounded-t-full bg-[#2e5b33]" />
      <div className="absolute bottom-[40%] left-[28%] h-[24%] w-[18%] rounded-t-full bg-[#3d7a44]" />
      <div className="absolute bottom-[40%] right-[18%] h-[28%] w-[16%] bg-[#e9e2d0] [clip-path:polygon(50%_0,100%_35%,100%_100%,0_100%,0_35%)]" />
      <div className="absolute bottom-[40%] right-[22%] h-[12%] w-[5%] bg-[#7a4b2a]" />
      {!restored && (
        <div
          className="absolute inset-0 opacity-50 mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 37px, rgba(60,40,20,.35) 37px 38px), radial-gradient(circle at 20% 70%, rgba(80,50,20,.45) 0 6%, transparent 7%), radial-gradient(circle at 80% 20%, rgba(80,50,20,.35) 0 4%, transparent 5%)",
          }}
        />
      )}
    </div>
  );
}

export function BeforeAfter({
  before = <Scene restored={false} />,
  after = <Scene restored />,
  beforeLabel = "1952 original",
  afterLabel = "Restored",
  initial = 50,
  animated = true,
  className = "",
}: BeforeAfterProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState(initial);
  const [touched, setTouched] = React.useState(false);
  const [drag, setDrag] = React.useState(false);

  const setFrom = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
    setTouched(true);
  };

  return (
    <div
      ref={ref}
      className={`relative aspect-[16/10] w-full max-w-2xl touch-none select-none overflow-hidden rounded-2xl border border-white/10 ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(true);
        setFrom(e.clientX);
      }}
      onPointerMove={(e) => drag && setFrom(e.clientX)}
      onPointerUp={() => setDrag(false)}
    >
      <style>{css}</style>
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
        {afterLabel}
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,.6)] motion-reduce:!animate-none"
        style={{ left: `${pos}%`, animation: animated && !touched ? "gx-ba-hint 2.4s ease-in-out .6s 1" : undefined }}
      >
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            const d = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0;
            if (d) {
              e.preventDefault();
              setTouched(true);
              setPos((p) => Math.max(0, Math.min(100, p + d)));
            }
          }}
          className="pointer-events-auto absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/40 text-white shadow-lg outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default BeforeAfter;
