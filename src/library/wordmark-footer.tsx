"use client";

import * as React from "react";

/**
 * WordmarkFooter — a site footer with a giant wordmark that reacts to the
 * cursor: letters near the pointer rise, widen and light up with a moving
 * gradient (a wave that follows you). Link columns, newsletter, a status
 * pill and back-to-top included. Ready as a starter footer.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type FooterColumn = { title: string; links: { label: string; href: string }[] };

export type WordmarkFooterProps = {
  brand?: string;
  columns?: FooterColumn[];
  /** false = static wordmark (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const COLS: FooterColumn[] = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"].map((l) => ({ label: l, href: "#" })) },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"].map((l) => ({ label: l, href: "#" })) },
  { title: "Resources", links: ["Docs", "Guides", "Status", "Security"].map((l) => ({ label: l, href: "#" })) },
];

export function WordmarkFooter({ brand = "NORTHWIND", columns = COLS, animated = true, className = "" }: WordmarkFooterProps) {
  const letters = React.useRef<(HTMLSpanElement | null)[]>([]);
  const wrap = React.useRef<HTMLDivElement>(null);
  const [year] = React.useState(() => new Date().getFullYear());

  const onMove = (e: React.PointerEvent) => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    letters.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2)) / r.width;
      const k = Math.max(0, 1 - d / 2.4);
      el.style.transform = `translateY(${-k * 18}%) scaleY(${1 + k * 0.25})`;
      el.style.setProperty("--k", k.toFixed(3));
    });
    wrap.current?.style.setProperty("--mx", `${e.clientX - (wrap.current?.getBoundingClientRect().left ?? 0)}px`);
  };
  const reset = () =>
    letters.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "";
      el.style.setProperty("--k", "0");
    });

  return (
    <footer className={`w-full overflow-hidden border-t border-white/10 bg-[#070708] text-white ${className}`}>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-6 pt-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <p className="font-black tracking-[0.2em]">{brand}</p>
          <p className="mt-3 max-w-xs text-sm text-white/55">Tools for people who ship. Built in public, one release at a time.</p>
          <form className="mt-5 flex max-w-xs gap-2" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="gx-wf-mail" className="sr-only">
              Email
            </label>
            <input id="gx-wf-mail" type="email" placeholder="Your email" className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm outline-none placeholder:text-white/35 focus:border-white/30" />
            <button type="submit" className="rounded-lg bg-white px-3 text-sm font-bold text-black">
              Join
            </button>
          </form>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/65 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        ref={wrap}
        aria-hidden
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="relative flex select-none justify-center px-2 pt-6 [container-type:inline-size]"
        style={{ "--mx": "50%" } as React.CSSProperties}
      >
        {[...brand].map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              letters.current[i] = el;
            }}
            className="inline-block origin-bottom bg-clip-text font-black leading-[0.8] tracking-tighter text-transparent transition-transform duration-300 ease-out"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,calc(.08 + var(--k,0) * .9)), rgba(255,255,255,.02) 85%), radial-gradient(240px circle at var(--mx) 40%, #4ade80, transparent 70%)",
              WebkitTextStroke: "1px rgba(255,255,255,.08)",
              fontSize: `min(12rem, calc(100cqw / ${(brand.length * 0.72).toFixed(2)}))`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-xs text-white/45">
        <span suppressHydrationWarning>© {year} {brand}. Sample footer.</span>
        <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" /> All systems normal
        </span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}

export default WordmarkFooter;
