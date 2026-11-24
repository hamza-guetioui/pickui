"use client";

import * as React from "react";

/**
 * SlideToConfirm — the "slide to unlock" gesture for destructive or
 * important actions: drag the handle all the way, the track fills, the text
 * shimmers, and releasing early springs it back. Done = check + callback.
 * Keyboard: focus the handle and press → / End, or Enter.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SlideToConfirmProps = {
  label?: string;
  doneLabel?: string;
  onConfirm?: () => void;
  /** Track color when completed. */
  color?: string;
  /** false = no shimmer / spring (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-sc-shine{from{background-position:200% 0}to{background-position:-200% 0}}
.gx-stc[data-animated="true"] .gx-stc-text{background:linear-gradient(90deg,rgba(255,255,255,.35) 0%,rgba(255,255,255,.35) 40%,#fff 50%,rgba(255,255,255,.35) 60%,rgba(255,255,255,.35) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gx-sc-shine 2.4s linear infinite}
@media (prefers-reduced-motion:reduce){.gx-stc-text{animation:none!important}}
`;

const H = 56;

export function SlideToConfirm({
  label = "Slide to delete project",
  doneLabel = "Deleted",
  onConfirm,
  color = "#ef4444",
  animated = true,
  className = "",
}: SlideToConfirmProps) {
  const track = React.useRef<HTMLDivElement>(null);
  const [x, setX] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const start = React.useRef(0);
  const max = () => (track.current?.clientWidth ?? 300) - H;

  const finish = () => {
    setX(max());
    setDone(true);
    onConfirm?.();
  };

  const p = Math.min(1, x / Math.max(1, max()));

  return (
    <div className={`gx-stc w-full max-w-sm ${className}`} data-animated={animated}>
      <style>{css}</style>
      <div
        ref={track}
        className="relative h-14 select-none overflow-hidden rounded-full border border-white/10 bg-[#111113] shadow-[inset_0_2px_8px_rgba(0,0,0,.6)]"
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: x + H,
            background: `linear-gradient(90deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} ${done ? 90 : 55}%, transparent))`,
            transition: drag ? "none" : "width .45s cubic-bezier(.3,1.4,.5,1), background .3s",
          }}
        />
        <span
          className="gx-stc-text pointer-events-none absolute inset-0 grid place-items-center text-sm font-semibold text-white/70"
          style={{ opacity: done ? 0 : 1 - p * 1.4 }}
        >
          {label}
        </span>
        {done && <span className="absolute inset-0 grid place-items-center text-sm font-bold text-white">{doneLabel}</span>}
        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p * 100)}
          disabled={done}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = e.clientX - x;
            setDrag(true);
          }}
          onPointerMove={(e) => drag && setX(Math.max(0, Math.min(max(), e.clientX - start.current)))}
          onPointerUp={() => {
            setDrag(false);
            if (x > max() * 0.92) finish();
            else setX(0);
          }}
          onKeyDown={(e) => {
            if (["ArrowRight", "End", "Enter"].includes(e.key)) {
              e.preventDefault();
              finish();
            }
          }}
          className="absolute left-1 top-1 grid h-12 w-12 cursor-grab touch-none place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_rgba(0,0,0,.5)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:cursor-grabbing disabled:cursor-default"
          style={{
            transform: `translateX(${x}px)`,
            transition: drag ? "none" : animated ? "transform .45s cubic-bezier(.3,1.4,.5,1)" : "transform .2s ease",
            background: done ? color : "#fff",
          }}
        >
          {done ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#fff" strokeWidth="3" aria-hidden>
              <path d="M5 12l5 5 9-10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
      {done && (
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setX(0);
          }}
          className="mt-3 w-full text-center font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white"
        >
          Undo
        </button>
      )}
    </div>
  );
}

export default SlideToConfirm;
