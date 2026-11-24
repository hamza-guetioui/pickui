"use client";

import * as React from "react";

/**
 * DocsStarter — a documentation layout to start from: collapsible nav
 * groups, prose with callouts, numbered steps, code blocks with copy, a
 * right table of contents with scroll-spy and a reading-progress rail, and
 * prev / next. Structure is semantic so AI tools can extend it cleanly.
 * Template · zero dependencies · respects prefers-reduced-motion.
 */

export type DocsStarterProps = {
  brand?: string;
  /** false = no smooth indicator glide (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const NAV = [
  { group: "Getting started", items: ["Introduction", "Installation", "Quick start"] },
  { group: "Guides", items: ["Routing", "Data fetching", "Deploying"] },
  { group: "Reference", items: ["CLI", "Config", "API"] },
];

const SECTIONS = [
  { id: "install", title: "Install the CLI" },
  { id: "create", title: "Create a project" },
  { id: "config", title: "Configure" },
  { id: "deploy", title: "Deploy" },
];

function Code({ code }: { code: string }) {
  const [ok, setOk] = React.useState(false);
  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-white/10 bg-black">
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-white/85">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
          } catch {}
          setOk(true);
          window.setTimeout(() => setOk(false), 1200);
        }}
        className="absolute right-2 top-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        {ok ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function DocsStarter({ brand = "Northwind Docs", animated = true, className = "" }: DocsStarterProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ "Getting started": true, Guides: true, Reference: false });
  const [current, setCurrent] = React.useState(SECTIONS[0].id);
  const [progress, setProgress] = React.useState(0);
  const article = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`gx-docs-${s.id}`);
      if (el) io.observe(el);
    });
    const onScroll = () => {
      const el = article.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight * 0.6))));
    };
    window.addEventListener("scroll", onScroll, true);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const idx = SECTIONS.findIndex((s) => `gx-docs-${s.id}` === current || s.id === current);

  return (
    <div className={`w-full bg-[#09090b] text-white ${className}`}>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/10 bg-[#09090b]/85 px-5 backdrop-blur">
        <span className="font-bold">{brand}</span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/50">v2.4</span>
        <div className="ml-auto hidden h-8 w-60 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/40 sm:flex">⌕ Search docs…</div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[200px_minmax(0,1fr)_180px]">
        <nav aria-label="Docs" className="hidden py-8 lg:block">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              <button type="button" aria-expanded={open[g.group]} onClick={() => setOpen((o) => ({ ...o, [g.group]: !o[g.group] }))} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white">
                {g.group}
                <span className="transition-transform" style={{ transform: open[g.group] ? "rotate(90deg)" : "none" }}>
                  ›
                </span>
              </button>
              {open[g.group] && (
                <ul className="mt-2 space-y-1 border-l border-white/10">
                  {g.items.map((it) => (
                    <li key={it}>
                      <a href="#" aria-current={it === "Quick start" ? "page" : undefined} className={`-ml-px block border-l py-1 pl-3 text-sm ${it === "Quick start" ? "border-white text-white" : "border-transparent text-white/55 hover:text-white"}`}>
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <article ref={article} className="min-w-0 py-8">
          <p className="font-mono text-xs text-emerald-400">Getting started</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Quick start</h1>
          <p className="mt-3 text-lg text-white/60">Go from zero to a deployed app in about five minutes. This page is sample content for the template.</p>
          <div className="mt-6 flex gap-3 rounded-xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100" role="note">
            <span aria-hidden>ℹ</span>
            <p>You’ll need Node.js 20 or newer. Check with <code className="rounded bg-black/40 px-1">node -v</code>.</p>
          </div>
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={`gx-docs-${s.id}`} className="scroll-mt-20 pt-10" aria-labelledby={`gx-docs-h-${s.id}`}>
              <h2 id={`gx-docs-h-${s.id}`} className="flex items-center gap-3 text-2xl font-bold">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20 font-mono text-xs">{i + 1}</span>
                {s.title}
              </h2>
              <p className="mt-3 leading-relaxed text-white/65">
                {
                  [
                    "Install the command-line tool globally. It scaffolds projects, runs the dev server and deploys.",
                    "Create a new project from the default template. Pick TypeScript when asked.",
                    "Configuration lives in one file at the project root. Every option has a sensible default.",
                    "Deploy with one command. You’ll get a preview URL for every branch automatically.",
                  ][i]
                }
              </p>
              <Code code={["npm i -g northwind", "northwind create my-app", "export default {\n  region: \"eu\",\n  previews: true,\n};", "northwind deploy --prod"][i]} />
              {i === 2 && (
                <div className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100" role="note">
                  <span aria-hidden>⚠</span>
                  <p>Never commit secrets to the config file — use environment variables.</p>
                </div>
              )}
            </section>
          ))}
          <nav aria-label="Pagination" className="mt-12 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 pb-10">
            <a href="#" className="rounded-xl border border-white/10 p-4 hover:border-white/30">
              <span className="text-xs text-white/40">← Previous</span>
              <span className="block font-semibold">Installation</span>
            </a>
            <a href="#" className="rounded-xl border border-white/10 p-4 text-right hover:border-white/30">
              <span className="text-xs text-white/40">Next →</span>
              <span className="block font-semibold">Routing</span>
            </a>
          </nav>
        </article>

        <aside className="hidden py-8 lg:block">
          <div className="sticky top-20">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">On this page</p>
            <div className="relative pl-4">
              <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-white/10" />
              <span aria-hidden className="absolute left-0 top-0 w-px bg-emerald-400" style={{ height: `${progress * 100}%`, transition: animated ? "height .2s" : undefined }} />
              <span aria-hidden className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-emerald-400" style={{ top: Math.max(0, idx) * 30 + 8, transition: animated ? "top .3s cubic-bezier(.3,1.3,.5,1)" : undefined }} />
              <ul className="space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#gx-docs-${s.id}`} className={`block h-[22px] text-sm transition-colors ${current.endsWith(s.id) ? "text-white" : "text-white/45 hover:text-white"}`}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DocsStarter;
