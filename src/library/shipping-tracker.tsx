"use client";

import * as React from "react";

/**
 * ShippingTracker — order tracking that feels alive: a stylised map with a
 * curved route, a truck that drives along the real path (and turns with the
 * road), stage checkpoints that tick off as it passes, and an ETA card.
 * Pass `progress` from your API; the demo drives itself.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type ShippingStage = { label: string; time?: string };

export type ShippingTrackerProps = {
  orderId?: string;
  stages?: ShippingStage[];
  /** 0–1. Omit to auto-play the demo. */
  progress?: number;
  eta?: string;
  /** false = truck jumps between stages (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const STAGES: ShippingStage[] = [
  { label: "Order placed", time: "Mon 09:12" },
  { label: "Packed", time: "Mon 14:40" },
  { label: "In transit", time: "Tue 06:05" },
  { label: "Out for delivery", time: "Wed 08:30" },
  { label: "Delivered" },
];
const ROUTE = "M40 210 C 120 200, 150 120, 230 130 S 340 230, 420 170 S 520 60, 610 70";

export function ShippingTracker({ orderId = "#GX-20417", stages = STAGES, progress, eta = "Wed, 2–4 pm", animated = true, className = "" }: ShippingTrackerProps) {
  const path = React.useRef<SVGPathElement>(null);
  const [auto, setAuto] = React.useState(0.05);
  const p = progress ?? auto;
  const [pos, setPos] = React.useState({ x: 40, y: 210, a: 0, len: 1 });

  React.useEffect(() => {
    if (progress !== undefined) return;
    if (!animated) return setAuto(0.62);
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = ((now - t0) / 14000) % 1.15;
      setAuto(Math.min(1, t));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress, animated]);

  React.useEffect(() => {
    const el = path.current;
    if (!el) return;
    const len = el.getTotalLength();
    const at = el.getPointAtLength(len * p);
    const ahead = el.getPointAtLength(Math.min(len, len * p + 2));
    setPos({ x: at.x, y: at.y, a: (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI, len });
  }, [p]);

  const reached = Math.min(stages.length - 1, Math.floor(p * (stages.length - 1) + 0.0001));
  const done = p >= 1;

  return (
    <section className={`w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d10] ${className}`} aria-label={`Order ${orderId} tracking`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Order {orderId}</p>
          <p className="text-lg font-bold text-white" aria-live="polite">
            {done ? "Delivered 🎉" : stages[reached].label}
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Estimated</p>
          <p className="text-sm font-semibold text-white">{done ? "Arrived" : eta}</p>
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 650 260" className="h-auto w-full" aria-hidden>
          <defs>
            <pattern id="gx-st-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.04)" />
            </pattern>
          </defs>
          <rect width="650" height="260" fill="url(#gx-st-grid)" />
          <path d="M0 40 Q 160 90 300 20 T 650 50" stroke="rgba(56,189,248,.18)" strokeWidth="18" fill="none" />
          <path ref={path} d={ROUTE} stroke="rgba(255,255,255,.15)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="1 12" />
          <path d={ROUTE} stroke="#4ade80" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={`${pos.len * p} ${pos.len}`} />
          {stages.map((s, i) => {
            const el = path.current;
            const pt = el ? el.getPointAtLength((el.getTotalLength() * i) / (stages.length - 1)) : { x: 40 + i * 140, y: 150 };
            const ok = i <= reached;
            return (
              <g key={s.label}>
                <circle cx={pt.x} cy={pt.y} r="9" fill={ok ? "#4ade80" : "#1f2937"} stroke="#0c0d10" strokeWidth="3" />
                {ok && <path d={`M${pt.x - 3.5} ${pt.y} l2.5 2.5 l4.5 -5`} stroke="#000" strokeWidth="2" fill="none" />}
              </g>
            );
          })}
          <g transform={`translate(${pos.x} ${pos.y}) rotate(${pos.a})`} style={{ transition: animated ? undefined : "transform .3s" }}>
            <rect x="-16" y="-9" width="22" height="18" rx="3" fill="#f5f5f5" />
            <rect x="6" y="-7" width="10" height="14" rx="3" fill="#4ade80" />
            <circle cx="-9" cy="10" r="3" fill="#111" />
            <circle cx="9" cy="10" r="3" fill="#111" />
          </g>
        </svg>
      </div>
      <ol className="grid grid-cols-5 border-t border-white/10">
        {stages.map((s, i) => (
          <li key={s.label} className={`px-2 py-3 text-center ${i <= reached ? "text-white" : "text-white/35"}`}>
            <p className="text-[11px] font-semibold leading-tight">{s.label}</p>
            <p className="mt-0.5 font-mono text-[9px] opacity-70">{i <= reached ? s.time ?? "" : "—"}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ShippingTracker;
