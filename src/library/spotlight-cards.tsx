"use client";

import * as React from "react";

/**
 * SpotlightCards — a grid where ONE light follows the cursor across every
 * card: borders light up near the pointer (even on cards you are not
 * touching), and the hovered card gets a soft inner spotlight.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SpotlightItem = { title: string; body: string; icon?: React.ReactNode };

export type SpotlightCardsProps = {
  items?: SpotlightItem[];
  /** Spotlight color (any CSS color). */
  color?: string;
  /** Light radius in px (default 260). */
  radius?: number;
  /** false = static borders, hover only (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT: SpotlightItem[] = [
  { title: "Edge-fast", body: "Rendered at the edge, cached forever, revalidated in the background.", icon: "⚡" },
  { title: "Type-safe", body: "Schemas at every boundary. If it compiles, the data is right.", icon: "◆" },
  { title: "Accessible", body: "Keyboard, screen readers and reduced motion, from day one.", icon: "◎" },
  { title: "Observable", body: "Every request traced. Every error grouped. Nothing silent.", icon: "◉" },
  { title: "Composable", body: "Small pieces with clear contracts. Swap any of them.", icon: "▣" },
  { title: "Delightful", body: "The details nobody asks for, and everybody notices.", icon: "✦" },
];

export function SpotlightCards({ items = DEFAULT, color = "#4ade80", radius = 260, animated = true, className = "" }: SpotlightCardsProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-spot]").forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - r.left}px`);
      card.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={animated ? move : undefined}
      className={`group/spot grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      style={{ "--c": color, "--r": `${radius}px` } as React.CSSProperties}
    >
      {items.map((it) => (
        <article
          key={it.title}
          data-spot
          className="relative overflow-hidden rounded-2xl bg-white/[0.06] p-px motion-reduce:transition-none"
          style={{ "--x": "-999px", "--y": "-999px" } as React.CSSProperties}
        >
          {/* border light: visible on every card while the pointer is over the grid */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${animated ? "opacity-0 group-hover/spot:opacity-100" : "opacity-0"}`}
            style={{ background: `radial-gradient(var(--r) circle at var(--x) var(--y), ${color}, transparent 45%)` }}
          />
          <div className="group/card relative h-full rounded-[15px] bg-[#0b0b0c] p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
              style={{ background: `radial-gradient(calc(var(--r) * 1.2) circle at var(--x) var(--y), color-mix(in srgb, ${color} 12%, transparent), transparent 60%)` }}
            />
            {it.icon && (
              <span className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sm text-white/80">
                {it.icon}
              </span>
            )}
            <h3 className="relative mt-4 text-sm font-semibold text-white">{it.title}</h3>
            <p className="relative mt-1.5 text-sm leading-relaxed text-white/55">{it.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default SpotlightCards;
