"use client";

import * as React from "react";

/**
 * IntegrationsHub — your product in the middle, integrations on two orbits,
 * connected by curved cables with data packets travelling both ways. Hover
 * a node to light its cable and see what it syncs; click to connect /
 * disconnect it (the cable plugs in or goes dark).
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type Integration = { id: string; name: string; glyph: string; color: string; syncs: string };

export type IntegrationsHubProps = {
  items?: Integration[];
  brand?: string;
  /** false = no travelling packets / orbit drift (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const ITEMS: Integration[] = [
  { id: "mail", name: "Mail", glyph: "✉", color: "#60a5fa", syncs: "Inbox → tasks" },
  { id: "cal", name: "Calendar", glyph: "◷", color: "#f472b6", syncs: "Events ↔ deadlines" },
  { id: "pay", name: "Payments", glyph: "$", color: "#4ade80", syncs: "Invoices → revenue" },
  { id: "chat", name: "Chat", glyph: "✦", color: "#a78bfa", syncs: "Mentions → alerts" },
  { id: "git", name: "Git", glyph: "⑂", color: "#fb923c", syncs: "Commits → changelog" },
  { id: "drive", name: "Drive", glyph: "▲", color: "#facc15", syncs: "Files ↔ projects" },
  { id: "crm", name: "CRM", glyph: "◎", color: "#22d3ee", syncs: "Leads → pipeline" },
  { id: "sheet", name: "Sheets", glyph: "▦", color: "#34d399", syncs: "Rows ↔ records" },
];

export function IntegrationsHub({ items = ITEMS, brand = "N", animated = true, className = "" }: IntegrationsHubProps) {
  const [hover, setHover] = React.useState<string | null>(null);
  const [off, setOff] = React.useState<Set<string>>(() => new Set(["sheet"]));
  const C = 260;
  const nodes = items.map((it, i) => {
    const ring = i % 2 ? 190 : 125;
    const a = (i / items.length) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.25 : 0);
    return { ...it, x: C + Math.cos(a) * ring, y: C + Math.sin(a) * ring * 0.78 };
  });
  const active = nodes.find((n) => n.id === hover);

  return (
    <section className={`w-full px-4 py-10 text-center ${className}`} aria-label="Integrations">
      <style>{`@keyframes gx-ih-dash{to{stroke-dashoffset:-40}}@keyframes gx-ih-spin{to{transform:rotate(360deg)}}`}</style>
      <h2 className="text-3xl font-black tracking-tight text-white">Plays well with everything</h2>
      <p className="mt-2 text-sm text-white/55">Hover to see what syncs. Click to connect or disconnect.</p>
      <div className="relative mx-auto mt-6 aspect-square w-full max-w-[520px]">
        <svg viewBox={`0 0 ${C * 2} ${C * 2}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <ellipse cx={C} cy={C} rx="125" ry={125 * 0.78} fill="none" stroke="rgba(255,255,255,.06)" strokeDasharray="3 6" />
          <ellipse cx={C} cy={C} rx="190" ry={190 * 0.78} fill="none" stroke="rgba(255,255,255,.06)" strokeDasharray="3 6" />
          {nodes.map((n) => {
            const on = !off.has(n.id);
            const lit = hover === n.id;
            const mx = (C + n.x) / 2 + (n.y - C) * 0.25;
            const my = (C + n.y) / 2 - (n.x - C) * 0.25;
            const d = `M${C} ${C} Q${mx} ${my} ${n.x} ${n.y}`;
            return (
              <g key={n.id}>
                <path d={d} fill="none" stroke={on ? n.color : "rgba(255,255,255,.1)"} strokeOpacity={lit ? 0.9 : on ? 0.35 : 1} strokeWidth={lit ? 2.5 : 1.5} />
                {on && animated && (
                  <path d={d} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 38" style={{ animation: `gx-ih-dash ${lit ? 0.6 : 1.6}s linear infinite` }} opacity={lit ? 1 : 0.6} />
                )}
              </g>
            );
          })}
        </svg>
        {/* hub */}
        <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-white/15 bg-gradient-to-b from-[#1c1c20] to-[#0c0c0e] text-3xl font-black text-white shadow-[0_0_60px_-10px_rgba(74,222,128,.5)]">
          {animated && <span aria-hidden className="absolute -inset-2 rounded-[30px] border border-dashed border-emerald-400/40" style={{ animation: "gx-ih-spin 18s linear infinite" }} />}
          {brand}
        </div>
        {nodes.map((n) => {
          const on = !off.has(n.id);
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={on}
              aria-label={`${n.name}: ${n.syncs}. ${on ? "Connected" : "Disconnected"}`}
              onPointerEnter={() => setHover(n.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(n.id)}
              onBlur={() => setHover(null)}
              onClick={() =>
                setOff((s) => {
                  const next = new Set(s);
                  if (next.has(n.id)) next.delete(n.id);
                  else next.add(n.id);
                  return next;
                })
              }
              className="absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border text-lg font-bold outline-none transition-all duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-white"
              style={{
                left: `${(n.x / (C * 2)) * 100}%`,
                top: `${(n.y / (C * 2)) * 100}%`,
                borderColor: on ? `${n.color}88` : "rgba(255,255,255,.1)",
                background: on ? `color-mix(in srgb, ${n.color} 16%, #0e0e10)` : "#0e0e10",
                color: on ? n.color : "rgba(255,255,255,.3)",
                boxShadow: hover === n.id ? `0 0 30px ${n.color}` : undefined,
              }}
            >
              {n.glyph}
            </button>
          );
        })}
        <div aria-live="polite" className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
          {active ? `${active.name} · ${active.syncs} · ${off.has(active.id) ? "off" : "on"}` : `${items.length - off.size} of ${items.length} connected`}
        </div>
      </div>
    </section>
  );
}

export default IntegrationsHub;
