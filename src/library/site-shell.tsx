"use client";

import * as React from "react";
import WordmarkFooter from "./wordmark-footer";

/**
 * SiteShell — the skeleton every marketing site needs, done properly: a
 * glass header that shrinks on scroll, a mega-menu whose panel morphs size
 * and slides between sections (one panel, not three), a mobile drawer with
 * staggered links, an announcement bar you can dismiss, a content slot,
 * and the WordmarkFooter. Use it as the start of a new site.
 * Template · uses ./wordmark-footer (installed together).
 */

export type SiteShellProps = {
  brand?: string;
  children?: React.ReactNode;
  /** false = no morphing panel / stagger (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const MENU = [
  {
    id: "product",
    label: "Product",
    w: 520,
    cols: [
      { title: "Platform", items: [["Analytics", "Real-time insights"], ["Automations", "Workflows that run themselves"], ["Integrations", "Connect 100+ tools"]] },
      { title: "For teams", items: [["Startups", "Ship fast"], ["Enterprise", "Control & compliance"]] },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    w: 380,
    cols: [{ title: "Learn", items: [["Docs", "Guides and API"], ["Blog", "Product news"], ["Changelog", "What’s new"]] }],
  },
  {
    id: "company",
    label: "Company",
    w: 300,
    cols: [{ title: "About", items: [["Story", "Why we exist"], ["Careers", "We’re hiring"]] }],
  },
];

export function SiteShell({ brand = "Northwind", children, animated = true, className = "" }: SiteShellProps) {
  const [open, setOpen] = React.useState<number | null>(null);
  const [prev, setPrev] = React.useState<number | null>(null);
  const [drawer, setDrawer] = React.useState(false);
  const [bar, setBar] = React.useState(true);
  const [small, setSmall] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);
  const closeT = React.useRef(0);

  // condense the header once the shell scrolls (works for page or any scroll container)
  React.useEffect(() => {
    const on = () => setSmall((scroller.current?.getBoundingClientRect().top ?? 0) < -20);
    window.addEventListener("scroll", on, true);
    return () => window.removeEventListener("scroll", on, true);
  }, []);

  const show = (i: number) => {
    window.clearTimeout(closeT.current);
    setPrev(open);
    setOpen(i);
  };
  const hide = () => {
    closeT.current = window.setTimeout(() => setOpen(null), 120);
  };

  const m = open !== null ? MENU[open] : null;
  const dir = open !== null && prev !== null ? Math.sign(open - prev) : 0;

  return (
    <div ref={scroller} className={`w-full bg-[#09090b] text-white ${className}`}>
      {bar && (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 px-4 py-2 text-center text-xs font-semibold text-black">
          <span>New: Automations 2.0 is live →</span>
          <button type="button" onClick={() => setBar(false)} aria-label="Dismiss announcement" className="rounded px-1 hover:bg-black/10">
            ✕
          </button>
        </div>
      )}
      <header className="sticky top-0 z-30 transition-all duration-300" style={{ padding: small ? "8px 12px" : "14px 20px" }}>
        <div className={`mx-auto flex max-w-6xl items-center gap-6 rounded-2xl border px-4 transition-all duration-300 ${small ? "h-12 border-white/10 bg-black/60 backdrop-blur-xl" : "h-14 border-transparent bg-transparent"}`}>
          <a href="#" className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-xs font-black text-black">{brand[0]}</span>
            {brand}
          </a>
          <nav aria-label="Main" className="relative hidden md:block" onPointerLeave={hide}>
            <ul className="flex gap-1">
              {MENU.map((it, i) => (
                <li key={it.id}>
                  <button
                    type="button"
                    aria-expanded={open === i}
                    aria-controls="gx-ss-panel"
                    onPointerEnter={() => show(i)}
                    onFocus={() => show(i)}
                    onClick={() => (open === i ? setOpen(null) : show(i))}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${open === i ? "bg-white/10 text-white" : "text-white/65 hover:text-white"}`}
                  >
                    {it.label} <span aria-hidden className="inline-block text-[10px] transition-transform" style={{ transform: open === i ? "rotate(180deg)" : "none" }}>▾</span>
                  </button>
                </li>
              ))}
              <li>
                <a href="#" className="block rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
            {/* one morphing panel */}
            <div
              id="gx-ss-panel"
              onPointerEnter={() => window.clearTimeout(closeT.current)}
              className="absolute left-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/95 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl"
              style={{
                width: m?.w ?? 300,
                height: m ? 60 + Math.max(...m.cols.map((c) => c.items.length)) * 52 : 0,
                opacity: m ? 1 : 0,
                transform: m ? "translateY(0)" : "translateY(-6px)",
                pointerEvents: m ? "auto" : "none",
                transition: animated ? "width .35s cubic-bezier(.2,.9,.3,1), height .35s cubic-bezier(.2,.9,.3,1), opacity .2s, transform .2s" : "opacity .1s",
              }}
            >
              {m && (
                <div key={m.id} className="flex gap-6 p-5" style={{ animation: animated && dir ? `gx-ss-in-${dir > 0 ? "r" : "l"} .3s cubic-bezier(.2,.9,.3,1)` : undefined }}>
                  {m.cols.map((c) => (
                    <div key={c.title} className="min-w-[180px] flex-1">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{c.title}</p>
                      <ul className="space-y-1">
                        {c.items.map(([t, d]) => (
                          <li key={t}>
                            <a href="#" className="block rounded-lg px-2 py-1.5 hover:bg-white/[0.06]">
                              <span className="block text-sm font-semibold">{t}</span>
                              <span className="block text-xs text-white/45">{d}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href="#" className="hidden text-sm text-white/65 hover:text-white sm:block">
              Sign in
            </a>
            <a href="#" className="rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-black">
              Get started
            </a>
            <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 md:hidden">
              ☰
            </button>
          </div>
        </div>
      </header>
      <style>{`@keyframes gx-ss-in-r{from{opacity:0;transform:translateX(24px)}}@keyframes gx-ss-in-l{from{opacity:0;transform:translateX(-24px)}}@keyframes gx-ss-st{from{opacity:0;transform:translateY(10px)}}`}</style>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-hidden />
          <nav className="absolute inset-y-0 right-0 w-72 border-l border-white/10 bg-[#0e0e10] p-6">
            <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="mb-6 ml-auto block text-white/60">
              ✕
            </button>
            <ul className="space-y-1">
              {[...MENU.map((x) => x.label), "Pricing", "Sign in"].map((l, i) => (
                <li key={l} style={{ animation: animated ? `gx-ss-st .4s ease ${i * 60}ms both` : undefined }}>
                  <a href="#" className="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-white/5">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-6">
        {children ?? (
          <section className="py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">Your content here</p>
            <h1 className="mt-4 text-5xl font-black tracking-tighter sm:text-6xl">Start every site from a shell that already feels finished.</h1>
            <p className="mx-auto mt-4 max-w-lg text-white/55">Hover the menu: one panel morphs between sections. Scroll: the header condenses into glass. Resize: the drawer takes over.</p>
            <div className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl border border-dashed border-white/15" />
              ))}
            </div>
          </section>
        )}
      </main>
      <WordmarkFooter brand={brand.toUpperCase()} animated={animated} />
    </div>
  );
}

export default SiteShell;
