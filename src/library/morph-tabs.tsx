"use client";

import * as React from "react";

/**
 * MorphTabs — tabs whose pill indicator stretches like taffy between tabs
 * (the leading edge moves first, the trailing edge follows), with content
 * that slides in from the direction you moved. Arrow keys, Home/End.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type MorphTab = { id: string; label: string; content: React.ReactNode };

export type MorphTabsProps = {
  tabs?: MorphTab[];
  /** false = simple sliding pill, no stretch / slide (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT: MorphTab[] = [
  { id: "overview", label: "Overview", content: "Everything at a glance: traffic, errors and deploys in one calm view." },
  { id: "analytics", label: "Analytics", content: "Real-user metrics, segmented by country, device and release." },
  { id: "logs", label: "Logs", content: "Structured logs, searchable in milliseconds, retained for 30 days." },
  { id: "settings", label: "Settings", content: "Domains, environment variables and team permissions." },
];

const css = `
@keyframes gx-mt-in{from{opacity:0;transform:translateX(calc(var(--dir)*18px));filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
.gx-mt[data-animated="true"] .gx-mt-panel{animation:gx-mt-in .38s cubic-bezier(.2,.9,.3,1)}
@media (prefers-reduced-motion:reduce){.gx-mt *{animation:none!important;transition:none!important}}
`;

export function MorphTabs({ tabs = DEFAULT, animated = true, className = "" }: MorphTabsProps) {
  const [active, setActive] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = React.useState({ l: 0, w: 0 });
  const uid = React.useId();

  React.useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setBox({ l: el.offsetLeft, w: el.offsetWidth });
  }, [active, tabs]);

  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setDir(n > active ? 1 : -1);
    setActive(n);
    refs.current[n]?.focus();
  };

  // stretch: leading edge fast, trailing edge slow
  const lead = "cubic-bezier(.2,.9,.3,1) .28s";
  const trail = "cubic-bezier(.6,0,.2,1) .5s";
  const transition = animated
    ? dir > 0
      ? `left .5s ${trail.split(" ")[0]}, right ${lead.split(" ")[1]} ${lead.split(" ")[0]}`
      : `left ${lead.split(" ")[1]} ${lead.split(" ")[0]}, right .5s ${trail.split(" ")[0]}`
    : "left .25s ease, right .25s ease";

  return (
    <div className={`gx-mt w-full max-w-lg ${className}`} data-animated={animated}>
      <style>{css}</style>
      <div role="tablist" className="relative flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-lg bg-white shadow-[0_2px_10px_rgba(0,0,0,.4)]"
          style={{ left: box.l, right: `calc(100% - ${box.l + box.w}px)`, transition }}
        />
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${uid}-t-${t.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${uid}-p`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => go(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(active + 1);
              else if (e.key === "ArrowLeft") go(active - 1);
              else if (e.key === "Home") go(0);
              else if (e.key === "End") go(tabs.length - 1);
            }}
            className={`relative z-10 flex-1 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/60 ${
              i === active ? "text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${uid}-p`}
        role="tabpanel"
        aria-labelledby={`${uid}-t-${tabs[active].id}`}
        className="relative mt-3 min-h-[96px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5"
      >
        <div key={active} className="gx-mt-panel text-sm leading-relaxed text-white/75" style={{ "--dir": dir } as React.CSSProperties}>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{tabs[active].label}</p>
          {tabs[active].content}
        </div>
      </div>
    </div>
  );
}

export default MorphTabs;
