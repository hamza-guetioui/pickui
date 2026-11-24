"use client";

import * as React from "react";

/**
 * HoldToConfirm — press and HOLD: a ring fills around the button, the button
 * slowly compresses, releasing early drains it back; completing bursts into
 * particles and a check. Works with mouse, touch, Space and Enter.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type HoldToConfirmProps = {
  label?: string;
  doneLabel?: string;
  /** ms to hold (default 1400). */
  duration?: number;
  color?: string;
  onConfirm?: () => void;
  /** false = no compress / burst (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-hc2-burst{0%{transform:translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(1);opacity:1}100%{transform:translate(-50%,-50%) rotate(var(--a)) translateY(-56px) scale(0);opacity:0}}
.gx-htc-p{animation:gx-hc2-burst .7s cubic-bezier(.2,.8,.3,1) forwards}
@media (prefers-reduced-motion:reduce){.gx-htc-p{display:none}}
`;

export function HoldToConfirm({
  label = "Hold to publish",
  doneLabel = "Published",
  duration = 1400,
  color = "#4ade80",
  onConfirm,
  animated = true,
  className = "",
}: HoldToConfirmProps) {
  const [p, setP] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const holding = React.useRef(false);
  const raf = React.useRef(0);
  const last = React.useRef(0);

  const tick = React.useCallback(
    (now: number) => {
      const dt = now - last.current;
      last.current = now;
      setP((v) => {
        const n = holding.current ? v + dt / duration : v - dt / (duration * 0.4);
        if (n >= 1) {
          holding.current = false;
          setDone(true);
          onConfirm?.();
          return 1;
        }
        return Math.max(0, n);
      });
      raf.current = requestAnimationFrame(tick);
    },
    [duration, onConfirm],
  );

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);
  React.useEffect(() => {
    if (done) cancelAnimationFrame(raf.current);
  }, [done]);

  const startHold = () => {
    if (done) return;
    holding.current = true;
    cancelAnimationFrame(raf.current);
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  const stopHold = () => {
    holding.current = false;
  };

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div className={`relative inline-grid place-items-center ${className}`}>
      <style>{css}</style>
      <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute h-[136px] w-[136px] -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <button
        type="button"
        aria-label={done ? doneLabel : `${label} (press and hold)`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startHold();
        }}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onPointerLeave={stopHold}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            startHold();
          }
        }}
        onKeyUp={(e) => (e.key === " " || e.key === "Enter") && stopHold()}
        onContextMenu={(e) => e.preventDefault()}
        className="relative grid h-[112px] w-[112px] touch-none select-none place-items-center rounded-full border border-white/10 bg-[#121214] text-center text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        style={{
          transform: animated ? `scale(${1 - p * 0.08})` : undefined,
          boxShadow: `inset 0 0 ${20 + p * 30}px color-mix(in srgb, ${color} ${Math.round(p * 45)}%, transparent)`,
          background: done ? color : undefined,
          color: done ? "#000" : undefined,
          transition: "background .3s, color .3s",
        }}
      >
        <span className="px-3 leading-tight">{done ? `✓ ${doneLabel}` : label}</span>
      </button>
      {done &&
        animated &&
        Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="gx-htc-p pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ "--a": `${(i / 14) * 360}deg`, background: i % 2 ? color : "#fff" } as React.CSSProperties}
          />
        ))}
      {done && (
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setP(0);
          }}
          className="absolute -bottom-8 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default HoldToConfirm;
