"use client";

import * as React from "react";

/**
 * TestimonialWall — a wall of love: three columns of testimonials drifting
 * in opposite directions forever, fading at the edges, pausing when you
 * hover so you can read. Duplicated content makes the loop seamless.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Testimonial = { quote: string; name: string; role: string; color?: string };

export type TestimonialWallProps = {
  items?: Testimonial[];
  title?: string;
  /** Seconds for one loop (default 38). */
  speed?: number;
  /** false = static masonry (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

// Placeholder copy for a fictional product ("Northwind"): replace with your real customers.
const ITEMS: Testimonial[] = [
  { quote: "Northwind replaced three tools for us in a week.", name: "Sample Customer", role: "Studio lead", color: "#f472b6" },
  { quote: "Onboarding took ten minutes. The team actually uses it.", name: "Alex Example", role: "Engineering manager", color: "#22d3ee" },
  { quote: "Checkout feels instant now. Our support inbox got quieter.", name: "Jordan Placeholder", role: "E-commerce", color: "#4ade80" },
  { quote: "Finally a product with taste, not another dashboard.", name: "Sam Demo", role: "Design engineer", color: "#a78bfa" },
  { quote: "The museum kiosk runs it all day without a hiccup.", name: "Riley Sample", role: "Curator", color: "#facc15" },
  { quote: "Zero setup. That is the real feature.", name: "Taylor Example", role: "Staff engineer", color: "#fb923c" },
  { quote: "I opened the docs for one thing and stayed two hours.", name: "Casey Demo", role: "Frontend dev", color: "#38bdf8" },
  { quote: "Accessible AND fun. Rare combo.", name: "Morgan Sample", role: "A11y consultant", color: "#f87171" },
  { quote: "Our customers screenshot it and share it. Free marketing.", name: "Jamie Placeholder", role: "Founder", color: "#34d399" },
];

const css = `
@keyframes gx-tw-up{to{transform:translateY(-50%)}}
@keyframes gx-tw-down{from{transform:translateY(-50%)}to{transform:translateY(0)}}
.gx-tw[data-animated="true"] .gx-tw-col{animation:var(--name) var(--dur) linear infinite}
.gx-tw[data-animated="true"] .gx-tw-col:hover{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.gx-tw .gx-tw-col{animation:none!important}}
`;

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="rounded-2xl border border-white/10 bg-[#111113] p-5">
      <blockquote className="text-sm leading-relaxed text-white/80">“{t.quote}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-black" style={{ background: t.color ?? "#fff" }}>
          {t.name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">{t.name}</span>
          <span className="block text-xs text-white/45">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialWall({ items = ITEMS, title = "Loved by people who notice details", speed = 38, animated = true, className = "" }: TestimonialWallProps) {
  const cols = [0, 1, 2].map((c) => items.filter((_, i) => i % 3 === c));
  return (
    <section className={`gx-tw w-full px-4 py-8 ${className}`} data-animated={animated} aria-label="Testimonials">
      <style>{css}</style>
      <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-white">{title}</h2>
      <div className="relative mx-auto grid h-[440px] max-w-5xl grid-cols-1 gap-4 overflow-hidden [mask-image:linear-gradient(transparent,#000_15%,#000_85%,transparent)] sm:grid-cols-2 lg:grid-cols-3">
        {cols.map((col, ci) => (
          <div key={ci} className={ci === 1 ? "hidden sm:block" : ci === 2 ? "hidden lg:block" : ""}>
            <div className="gx-tw-col flex flex-col gap-4" style={{ "--name": ci % 2 ? "gx-tw-down" : "gx-tw-up", "--dur": `${speed + ci * 6}s` } as React.CSSProperties}>
              {[...col, ...col].map((t, i) => (
                <div key={i} aria-hidden={i >= col.length}>
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialWall;
