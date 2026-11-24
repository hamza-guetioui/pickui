"use client";

import * as React from "react";

/**
 * BentoGrid — a feature section in the Vercel/Apple bento style where every
 * tile is ALIVE: a globe of pinging regions, a deploy log typing itself, a
 * latency chart drawing, a shield scanning, and a stack of avatars. Shared
 * cursor spotlight across the grid. Replace the copy, keep the motion.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type BentoGridProps = {
  title?: string;
  subtitle?: string;
  /** false = static illustrations (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-bg-ping{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.6);opacity:0}}
@keyframes gx-bg-draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}
@keyframes gx-bg-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
@keyframes gx-bg-spin{to{transform:rotate(360deg)}}
@keyframes gx-bg-type{from{width:0}}
.gx-bg[data-animated="true"] .gx-bg-ping{animation:gx-bg-ping 2s ease-out infinite}
.gx-bg[data-animated="true"] .gx-bg-draw{stroke-dasharray:400;animation:gx-bg-draw 3s ease-in-out infinite alternate}
.gx-bg[data-animated="true"] .gx-bg-scan{animation:gx-bg-scan 2.4s linear infinite}
.gx-bg[data-animated="true"] .gx-bg-globe{animation:gx-bg-spin 30s linear infinite}
.gx-bg[data-animated="true"] .gx-bg-type{animation:gx-bg-type 1.2s steps(28) both}
@media (prefers-reduced-motion:reduce){.gx-bg *{animation:none!important}}
`;

const LOG = ["▲ Building…", "✓ Compiled in 4.1s", "✓ 42 static pages", "✓ Edge functions ready", "● Deployed to production"];

function Tile({ className = "", title, body, children }: { className?: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <article
      data-bento
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0e] p-6 ${className}`}
      style={{ "--x": "-500px", "--y": "-500px" } as React.CSSProperties}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,.07), transparent 60%)" }} />
      <div className="relative h-36">{children}</div>
      <h3 className="relative mt-4 font-semibold text-white">{title}</h3>
      <p className="relative mt-1 text-sm text-white/50">{body}</p>
    </article>
  );
}

export function BentoGrid({
  title = "Everything you need to ship.",
  subtitle = "Infrastructure that disappears, so the product doesn’t.",
  animated = true,
  className = "",
}: BentoGridProps) {
  const [lines, setLines] = React.useState(1);
  React.useEffect(() => {
    if (!animated) return setLines(LOG.length);
    const t = window.setInterval(() => setLines((l) => (l >= LOG.length ? 1 : l + 1)), 1300);
    return () => window.clearInterval(t);
  }, [animated]);

  return (
    <section
      className={`gx-bg w-full px-4 py-10 ${className}`}
      data-animated={animated}
      onPointerMove={(e) =>
        e.currentTarget.querySelectorAll<HTMLElement>("[data-bento]").forEach((t) => {
          const r = t.getBoundingClientRect();
          t.style.setProperty("--x", `${e.clientX - r.left}px`);
          t.style.setProperty("--y", `${e.clientY - r.top}px`);
        })
      }
    >
      <style>{css}</style>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h2>
        <p className="mt-2 text-white/55">{subtitle}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Tile className="md:col-span-2" title="Global by default" body="Requests are served from the region closest to your users.">
            <div className="relative mx-auto h-36 w-36">
              <div className="gx-bg-globe absolute inset-0 rounded-full border border-white/15 [background:repeating-radial-gradient(circle,transparent_0_14px,rgba(255,255,255,.06)_14px_15px),repeating-linear-gradient(90deg,transparent_0_17px,rgba(255,255,255,.06)_17px_18px)]" />
              {[
                [30, 40],
                [70, 30],
                [55, 70],
                [20, 65],
                [80, 60],
              ].map(([x, y], i) => (
                <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className="gx-bg-ping absolute -left-2 -top-2 h-4 w-4 rounded-full bg-emerald-400/40" style={{ animationDelay: `${i * 0.4}s` }} />
                  <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              ))}
            </div>
          </Tile>
          <Tile title="Deploys in seconds" body="Push to git. Get a URL. That’s it.">
            <div className="h-full rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed">
              {LOG.slice(0, lines).map((l, i) => (
                <div key={i} className={`gx-bg-type overflow-hidden whitespace-nowrap ${l.startsWith("●") ? "text-emerald-400" : l.startsWith("▲") ? "text-white/60" : "text-white/80"}`}>
                  {l}
                </div>
              ))}
            </div>
          </Tile>
          <Tile title="Real-user latency" body="p75 under 80 ms, everywhere.">
            <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden>
              <path d="M0 80 L200 80" stroke="rgba(255,255,255,.1)" />
              <path className="gx-bg-draw" d="M0 70 C 20 60, 30 72, 50 50 S 80 30, 100 42 S 140 20, 160 26 S 190 12, 200 14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
            </svg>
          </Tile>
          <Tile title="Secure by design" body="DDoS mitigation and a firewall on every edge.">
            <div className="relative mx-auto grid h-full w-28 place-items-center overflow-hidden">
              <svg viewBox="0 0 24 24" className="h-24 w-24 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#4ade80" strokeWidth="1.8" />
              </svg>
              <div className="gx-bg-scan absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
            </div>
          </Tile>
          <Tile title="Made for teams" body="Previews, comments and roles built in.">
            <div className="flex h-full items-center justify-center -space-x-3">
              {["#f472b6", "#a78bfa", "#22d3ee", "#facc15", "#4ade80"].map((c, i) => (
                <span key={c} className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#0c0c0e] text-sm font-bold text-black transition-transform group-hover:-translate-y-1" style={{ background: c, transitionDelay: `${i * 40}ms` }}>
                  {"HSAKM"[i]}
                </span>
              ))}
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
