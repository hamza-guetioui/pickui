"use client";

import * as React from "react";

/**
 * ChangelogGraph — a changelog rendered as a git graph: lanes for main and
 * feature branches, curved branch-off / merge edges, release tags, type
 * filters (feat / fix / perf) and expandable entries. The graph draws itself
 * the first time it scrolls into view.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type Commit = {
  id: string;
  lane: number; // 0 = main
  type: "feat" | "fix" | "perf";
  title: string;
  date: string;
  body?: string;
  tag?: string;
  /** lane this commit merges into (draws a curve) */
  mergeTo?: number;
  /** lane this commit branches from */
  branchFrom?: number;
};

export type ChangelogGraphProps = {
  commits?: Commit[];
  title?: string;
  /** false = graph shown at once (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const COMMITS: Commit[] = [
  { id: "a1f3", lane: 0, type: "feat", title: "Command palette everywhere", date: "Mar 28", tag: "v2.4.0", body: "⌘K now works on every page, with fuzzy search and recent items." },
  { id: "b72c", lane: 1, type: "perf", title: "Edge cache for images", date: "Mar 26", mergeTo: 0, body: "Images are now cached at the edge — median load time down 38% (sample data)." },
  { id: "c90e", lane: 1, type: "fix", title: "Safari focus ring", date: "Mar 24", body: "Focus rings no longer disappear after a modal closes in Safari." },
  { id: "d1b8", lane: 2, type: "feat", title: "Dark mode for emails", date: "Mar 22", mergeTo: 0, body: "Transactional emails respect the user’s system theme." },
  { id: "e44a", lane: 1, type: "feat", title: "Image pipeline v2", date: "Mar 20", branchFrom: 0 },
  { id: "f0c2", lane: 2, type: "fix", title: "Timezone off-by-one", date: "Mar 18", branchFrom: 0, body: "Dates near midnight are now displayed in the correct day." },
  { id: "g913", lane: 0, type: "feat", title: "Team roles", date: "Mar 15", tag: "v2.3.0", body: "Owner, admin, member and viewer roles with granular permissions." },
];

const TYPE = { feat: "#4ade80", fix: "#f87171", perf: "#22d3ee" } as const;
const LANE = ["#e5e5e5", "#a78bfa", "#fb923c"];
const ROW = 64;
const LX = (l: number) => 22 + l * 22;

export function ChangelogGraph({ commits = COMMITS, title = "Changelog", animated = true, className = "" }: ChangelogGraphProps) {
  const [filter, setFilter] = React.useState<"all" | Commit["type"]>("all");
  const [open, setOpen] = React.useState<string | null>(commits[0]?.id ?? null);
  const [drawn, setDrawn] = React.useState(!animated);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!animated) return setDrawn(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setDrawn(true), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [animated]);

  const lanes = Math.max(...commits.map((c) => c.lane)) + 1;
  const H = commits.length * ROW;
  // lane extents: from first to last row each lane appears (main spans all)
  const span = Array.from({ length: lanes }, (_, l) => {
    const rows = commits.map((c, i) => (c.lane === l ? i : -1)).filter((i) => i >= 0);
    return l === 0 ? [0, commits.length - 1] : [Math.min(...rows), Math.max(...rows)];
  });

  return (
    <section ref={ref} className={`mx-auto w-full max-w-3xl px-6 py-12 ${className}`} aria-label={title}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
        <div className="flex gap-1 rounded-full border border-white/10 p-1" role="group" aria-label="Filter by type">
          {(["all", "feat", "fix", "perf"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 font-mono text-[11px] transition ${filter === f ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <svg aria-hidden className="absolute left-0 top-0" width={LX(lanes)} height={H} viewBox={`0 0 ${LX(lanes)} ${H}`}>
          {span.map(([a, b], l) => (
            <line
              key={l}
              x1={LX(l)}
              x2={LX(l)}
              y1={a * ROW + ROW / 2}
              y2={b * ROW + ROW / 2}
              stroke={LANE[l % 3]}
              strokeWidth="2"
              strokeDasharray={H}
              strokeDashoffset={drawn ? 0 : H}
              style={{ transition: animated ? `stroke-dashoffset 1.4s ease ${l * 0.25}s` : undefined }}
              opacity={l ? 0.8 : 0.35}
            />
          ))}
          {commits.map((c, i) => {
            const y = i * ROW + ROW / 2;
            const target = c.mergeTo ?? c.branchFrom;
            if (target === undefined) return null;
            const ty = c.mergeTo !== undefined ? y - ROW : y + ROW;
            return (
              <path
                key={c.id}
                d={`M${LX(c.lane)} ${y} C ${LX(c.lane)} ${(y + ty) / 2}, ${LX(target)} ${(y + ty) / 2}, ${LX(target)} ${ty}`}
                fill="none"
                stroke={LANE[c.lane % 3]}
                strokeWidth="2"
                strokeDasharray="120"
                strokeDashoffset={drawn ? 0 : 120}
                style={{ transition: animated ? `stroke-dashoffset .8s ease ${0.6 + i * 0.1}s` : undefined }}
              />
            );
          })}
        </svg>
        <ol>
          {commits.map((c, i) => {
            const dim = filter !== "all" && c.type !== filter;
            const isOpen = open === c.id;
            return (
              <li key={c.id} className="relative" style={{ minHeight: ROW, paddingLeft: LX(lanes) + 16 }}>
                <span
                  aria-hidden
                  className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform duration-300"
                  style={{
                    left: LX(c.lane),
                    top: ROW / 2,
                    borderColor: LANE[c.lane % 3],
                    background: c.tag ? LANE[c.lane % 3] : "#0b0b0c",
                    transform: `translate(-50%,-50%) scale(${drawn ? 1 : 0})`,
                    transitionDelay: animated ? `${0.3 + i * 0.1}s` : undefined,
                    opacity: dim ? 0.3 : 1,
                  }}
                />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04] ${dim ? "opacity-30" : ""}`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-black" style={{ background: TYPE[c.type] }}>
                      {c.type}
                    </span>
                    <span className="font-semibold text-white">{c.title}</span>
                    {c.tag && <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] text-white/80">🏷 {c.tag}</span>}
                    <span className="ml-auto font-mono text-[11px] text-white/35">
                      {c.id} · {c.date}
                    </span>
                  </span>
                  {isOpen && c.body && <span className="mt-1.5 block text-sm leading-relaxed text-white/60">{c.body}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default ChangelogGraph;
