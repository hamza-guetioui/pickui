"use client";

import * as React from "react";

/**
 * MagneticButton — a CTA that leans toward the cursor like a magnet. The
 * body and the label move by different amounts (parallax), a light follows
 * the pointer across the surface, and a click sends out a ripple.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** How far the button may travel toward the cursor, in px (default 14). */
  strength?: number;
  /** Accent used for the glow (any CSS color). */
  accent?: string;
  /** false = no magnet / ripple (the calm "regular" version). Default true. */
  animated?: boolean;
};

const css = `
@keyframes gx-mb-ripple{from{transform:translate(-50%,-50%) scale(0);opacity:.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}}
.gx-mb-ripple{animation:gx-mb-ripple .7s ease-out forwards}
`;

export function MagneticButton({
  strength = 14,
  accent = "#4ade80",
  animated = true,
  className = "",
  children = "Get started →",
  onClick,
  ...rest
}: MagneticButtonProps) {
  const wrap = React.useRef<HTMLSpanElement>(null);
  const btn = React.useRef<HTMLButtonElement>(null);
  const label = React.useRef<HTMLSpanElement>(null);
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);
  const reduced = React.useRef(false);

  React.useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const move = (e: React.PointerEvent) => {
    const b = btn.current;
    if (!b || !animated || reduced.current) return;
    const r = wrap.current!.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    b.style.transform = `translate(${dx * strength}px, ${dy * strength * 0.7}px)`;
    if (label.current) label.current.style.transform = `translate(${dx * strength * 0.45}px, ${dy * strength * 0.35}px)`;
    const br = b.getBoundingClientRect();
    b.style.setProperty("--lx", `${e.clientX - br.left}px`);
    b.style.setProperty("--ly", `${e.clientY - br.top}px`);
  };
  const leave = () => {
    if (btn.current) btn.current.style.transform = "";
    if (label.current) label.current.style.transform = "";
  };

  return (
    // generous hit area so the pull starts before the cursor touches the button
    <span ref={wrap} className="inline-flex p-6" onPointerMove={move} onPointerLeave={leave}>
      <style>{css}</style>
      <button
        ref={btn}
        type="button"
        {...rest}
        onClick={(e) => {
          if (animated && !reduced.current) {
            const r = e.currentTarget.getBoundingClientRect();
            const id = Date.now();
            setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
            window.setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 700);
          }
          onClick?.(e);
        }}
        className={`group relative isolate overflow-hidden rounded-full border border-white/15 bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.8)] outline-none transition-[transform,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
        style={{ "--lx": "50%", "--ly": "50%", boxShadow: `0 0 0 0 transparent` } as React.CSSProperties}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(120px circle at var(--lx) var(--ly), color-mix(in srgb, ${accent} 45%, transparent), transparent 70%)` }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-px -z-10 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            className="gx-mb-ripple pointer-events-none absolute h-[240px] w-[240px] rounded-full"
            style={{ left: r.x, top: r.y, background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
          />
        ))}
        <span ref={label} className="relative inline-block transition-transform duration-300 ease-out">
          {children}
        </span>
      </button>
    </span>
  );
}

export default MagneticButton;
