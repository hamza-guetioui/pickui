"use client";

import * as React from "react";

/**
 * DashboardShell — an app starter layout with taste: a sidebar that morphs
 * between full and icon-rail (labels fade, a sliding active indicator), a
 * top bar with breadcrumbs, search and avatar, KPI cards with bar
 * micro-charts, an area chart with a hover crosshair + tooltip that draws
 * itself in, and an activity feed. On mobile the sidebar becomes a drawer.
 * Template · zero dependencies · respects prefers-reduced-motion.
 */

export type DashboardShellProps = {
  brand?: string;
  /** false = no chart drawing / indicator glide (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const NAV = [
  { id: "home", label: "Overview", icon: "◧" },
  { id: "analytics", label: "Analytics", icon: "◔" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "customers", label: "Customers", icon: "◍" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const SERIES = [32, 41, 38, 52, 49, 61, 58, 72, 69, 84, 80, 96];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AreaChart({ animated }: { animated: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const W = 600;
  const H = 200;
  const max = Math.max(...SERIES) * 1.1;
  const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * W, H - (v / max) * H] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-48 w-full overflow-visible"
        role="img"
        aria-label={`Revenue by month, from ${SERIES[0]}k to ${SERIES[SERIES.length - 1]}k`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(((e.clientX - r.left) / r.width) * (SERIES.length - 1)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gx-ds-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4ade80" stopOpacity=".35" />
            <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,.06)" />
        ))}
        <path d={`${line} L${W} ${H} L0 ${H}Z`} fill="url(#gx-ds-fill)" />
        <path d={line} fill="none" stroke="#4ade80" strokeWidth="2.5" pathLength={1} strokeDasharray="1" className={animated ? "[animation:gx-ds-draw_1.6s_ease_both]" : ""} />
        {hover !== null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1="0" y2={H} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="5" fill="#0b0b0d" stroke="#4ade80" strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-2.5 py-1.5 text-xs backdrop-blur" style={{ left: `${(hover / (SERIES.length - 1)) * 100}%` }}>
          <span className="text-white/50">{MONTHS[hover]}</span> <b className="text-white">${SERIES[hover]}k</b>
        </div>
      )}
      <div className="mt-1 flex justify-between font-mono text-[10px] text-white/30">
        {MONTHS.filter((_, i) => i % 2 === 0).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function DashboardShell({ brand = "Northwind", animated = true, className = "" }: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const Sidebar = (
    <nav aria-label="App" className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400 text-sm font-black text-black">{brand[0]}</span>
        <span className={`whitespace-nowrap font-bold text-white transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100"}`}>{brand}</span>
      </div>
      <div className="relative flex flex-col gap-1">
        <span aria-hidden className="absolute left-0 right-0 h-10 rounded-lg bg-white/[0.07]" style={{ top: active * 44, transition: animated ? "top .35s cubic-bezier(.3,1.3,.5,1)" : "none" }} />
        {NAV.map((n, i) => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              setActive(i);
              setDrawer(false);
            }}
            aria-current={i === active ? "page" : undefined}
            title={collapsed ? n.label : undefined}
            className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${i === active ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            <span aria-hidden className="w-4 shrink-0 text-center">
              {n.icon}
            </span>
            <span className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100"}`}>{n.label}</span>
            {i === active && <span aria-hidden className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-emerald-400" />}
          </button>
        ))}
      </div>
      <div className={`mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60 transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
        <p className="font-semibold text-white">Pro trial</p>
        <p>9 days left</p>
        <div className="mt-2 h-1 rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-emerald-400" />
        </div>
      </div>
    </nav>
  );

  return (
    <div className={`flex h-full min-h-[640px] w-full bg-[#0a0a0b] text-white ${className}`}>
      <style>{`@keyframes gx-ds-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
      <aside className="hidden shrink-0 border-r border-white/10 transition-[width] duration-300 md:block" style={{ width: collapsed ? 68 : 220 }}>
        {Sidebar}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0a0a0b]">{Sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
          <button type="button" onClick={() => (window.matchMedia("(min-width: 768px)").matches ? setCollapsed((c) => !c) : setDrawer(true))} aria-label="Toggle sidebar" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 hover:text-white">
            ☰
          </button>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/45">
            <span>{brand}</span>
            <span>/</span>
            <span className="text-white">{NAV[active].label}</span>
          </nav>
          <div className="ml-auto hidden h-8 w-56 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/40 sm:flex">
            ⌕ Search… <kbd className="ml-auto rounded border border-white/15 px-1 font-mono text-[10px]">⌘K</kbd>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-violet-500 text-xs font-bold">A</span>
        </header>

        <main className="flex-1 space-y-4 overflow-auto p-4 sm:p-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">{NAV[active].label}</h1>
              <p className="text-sm text-white/45">Sample data · last 12 months</p>
            </div>
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black">
              Export
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Revenue", "$842k", "+12.4%", [4, 6, 5, 7, 8, 7, 9]],
              ["Orders", "12,904", "+8.1%", [5, 5, 6, 6, 7, 8, 8]],
              ["Customers", "3,271", "+3.2%", [6, 6, 6, 7, 7, 7, 8]],
              ["Refunds", "1.2%", "−0.4%", [8, 7, 7, 6, 5, 5, 4]],
            ].map(([label, value, delta, bars]) => (
              <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs text-white/50">{label as string}</p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-2xl font-black">{value as string}</p>
                  <div className="flex h-8 items-end gap-0.5" aria-hidden>
                    {(bars as number[]).map((b, i) => (
                      <span key={i} className="w-1.5 rounded-sm bg-emerald-400/70" style={{ height: `${b * 11}%` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-emerald-300">{delta as string}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4" aria-label="Revenue chart">
              <h2 className="mb-3 text-sm font-semibold">Revenue</h2>
              <AreaChart key={active} animated={animated} />
            </section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4" aria-label="Activity">
              <h2 className="mb-3 text-sm font-semibold">Activity</h2>
              <ol className="space-y-3 text-sm">
                {[
                  ["#f472b6", "New order #2041", "2m"],
                  ["#4ade80", "Payout sent — $12,400", "1h"],
                  ["#22d3ee", "Sam joined the team", "3h"],
                  ["#facc15", "Refund requested #1987", "5h"],
                ].map(([c, t, time]) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c }} />
                    <span className="flex-1 text-white/75">{t}</span>
                    <span className="font-mono text-[10px] text-white/35">{time}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
