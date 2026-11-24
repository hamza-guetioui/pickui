"use client";

import * as React from "react";

/**
 * AgencyKinetic — a studio landing page the way award sites do it: a giant
 * kinetic headline whose letters lean and stretch away from the cursor, a
 * project index where hovering a row makes a floating preview follow your
 * cursor (tilting with velocity), an infinite services marquee, and a huge
 * outlined "Let’s talk" that fills with color on hover.
 * Template · zero dependencies · respects prefers-reduced-motion.
 */

export type AgencyProject = { name: string; kind: string; year: string; gradient: string };

export type AgencyKineticProps = {
  studio?: string;
  projects?: AgencyProject[];
  /** false = static type, no cursor preview (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const PROJECTS: AgencyProject[] = [
  { name: "Halcyon Bank", kind: "Brand & product", year: "2026", gradient: "linear-gradient(135deg,#22d3ee,#1e3a8a)" },
  { name: "Mirage Hotels", kind: "Website", year: "2025", gradient: "linear-gradient(135deg,#fb923c,#7c2d12)" },
  { name: "Orbit Audio", kind: "App & motion", year: "2025", gradient: "linear-gradient(135deg,#a78bfa,#312e81)" },
  { name: "Verdant Foods", kind: "Packaging", year: "2024", gradient: "linear-gradient(135deg,#a3e635,#14532d)" },
];

const css = `
@keyframes gx-ak-marq{to{transform:translateX(-50%)}}
.gx-ak[data-animated="true"] .gx-ak-marq{animation:gx-ak-marq 24s linear infinite}
.gx-ak-talk{-webkit-text-stroke:1.5px rgba(255,255,255,.6);color:transparent;background:linear-gradient(90deg,#f472b6,#facc15) no-repeat 0 0/0% 100%;-webkit-background-clip:text;background-clip:text;transition:background-size .6s cubic-bezier(.2,.9,.3,1)}
.gx-ak-talk:hover,.gx-ak-talk:focus-visible{background-size:100% 100%}
@media (prefers-reduced-motion:reduce){.gx-ak *{animation:none!important}}
`;

export function AgencyKinetic({ studio = "FORM&FUNCTION", projects = PROJECTS, animated = true, className = "" }: AgencyKineticProps) {
  const letters = React.useRef<(HTMLSpanElement | null)[]>([]);
  const preview = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const last = React.useRef({ x: 0, t: 0 });
  const motion = animated;

  const onHeroMove = (e: React.PointerEvent) => {
    if (!motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    letters.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (r.left + r.width / 2 - e.clientX) / 220;
      const dy = (r.top + r.height / 2 - e.clientY) / 220;
      const k = Math.max(0, 1 - Math.hypot(dx, dy));
      el.style.transform = `translate(${dx * k * 24}px, ${dy * k * 18}px) skewX(${-dx * k * 18}deg) scaleY(${1 + k * 0.18})`;
    });
  };
  const resetHero = () => letters.current.forEach((el) => el && (el.style.transform = ""));

  const onListMove = (e: React.PointerEvent) => {
    const el = preview.current;
    if (!el || !motion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const now = performance.now();
    const v = (e.clientX - last.current.x) / Math.max(1, now - last.current.t);
    last.current = { x: e.clientX, t: now };
    el.style.transform = `translate(${e.clientX - r.left - 130}px, ${e.clientY - r.top - 90}px) rotate(${Math.max(-12, Math.min(12, v * 8))}deg)`;
  };

  return (
    <div className={`gx-ak w-full overflow-hidden bg-[#0b0a09] text-[#f2efe9] ${className}`} data-animated={animated}>
      <style>{css}</style>
      <header className="flex items-center justify-between px-6 py-5 text-sm">
        <span className="font-black tracking-[0.15em]">{studio}</span>
        <nav aria-label="Studio" className="flex gap-5 text-white/60">
          <a href="#" className="hover:text-white">Work</a>
          <a href="#" className="hover:text-white">Studio</a>
          <a href="#" className="hover:text-white">Contact</a>
        </nav>
      </header>

      <section className="px-6 pb-10 pt-6" onPointerMove={onHeroMove} onPointerLeave={resetHero} aria-label="Intro">
        <h1 className="select-none text-[clamp(3.2rem,13vw,10rem)] font-black uppercase leading-[0.85] tracking-tighter" aria-label="We make brands move">
          {["We make", "brands move"].map((line, li) => (
            <span key={line} className="block" aria-hidden>
              {line.split(" ").map((word, wi, words) => {
                // words never break mid-letter; letters keep their own transforms
                const offset = words.slice(0, wi).join(" ").length + (wi ? 1 : 0);
                return (
                  <span key={wi} className="inline-block whitespace-nowrap">
                    {[...word].map((ch, i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          letters.current[li * 20 + offset + i] = el;
                        }}
                        className="inline-block origin-bottom transition-transform duration-300 ease-out"
                      >
                        {ch}
                      </span>
                    ))}
                    {wi < words.length - 1 && "\u00a0"}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-md text-white/55">An independent design studio for brands that refuse to sit still. (Sample studio.)</p>
      </section>

      <div className="overflow-hidden border-y border-white/10 py-4" aria-hidden>
        <div className="gx-ak-marq flex w-max gap-10 whitespace-nowrap text-2xl font-black uppercase tracking-tight text-white/80">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-10">
              {["Brand identity", "Websites", "Motion", "Product design", "Art direction"].map((s) => (
                <span key={s} className="flex items-center gap-10">
                  {s} <span className="text-pink-400">✺</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="relative px-6 py-10" onPointerMove={onListMove} onPointerLeave={() => setHover(null)} aria-label="Selected work">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">Selected work</p>
        <ul>
          {projects.map((p, i) => (
            <li key={p.name}>
              <a
                href="#"
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className={`flex items-baseline justify-between gap-4 border-b border-white/10 py-5 transition-colors ${hover !== null && hover !== i ? "text-white/30" : ""}`}
              >
                <span className="text-3xl font-black tracking-tight sm:text-4xl">{p.name}</span>
                <span className="text-right font-mono text-xs text-white/50">
                  {p.kind} · {p.year}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {motion && (
          <div
            ref={preview}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[180px] w-[260px] overflow-hidden rounded-xl transition-opacity duration-300"
            style={{ opacity: hover === null ? 0 : 1, transitionProperty: "opacity", willChange: "transform" }}
          >
            {projects.map((p, i) => (
              <div key={p.name} className="absolute inset-0 grid place-items-center text-2xl font-black text-white/90 transition-opacity duration-300" style={{ background: p.gradient, opacity: hover === i ? 1 : 0 }}>
                {p.name.split(" ")[0]}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-6 pb-14 pt-4 text-center">
        <a href="#" className="gx-ak-talk inline-block text-[clamp(3rem,12vw,9rem)] font-black uppercase leading-none tracking-tighter outline-none">
          Let’s talk →
        </a>
        <p className="mt-4 font-mono text-xs text-white/40">hello@studio.example · Casablanca / Lisbon</p>
      </section>
    </div>
  );
}

export default AgencyKinetic;
