"use client";

import * as React from "react";

/**
 * LiveStats — a metrics section that is actually live: counters tick up in
 * real time, sparklines scroll with each new data point, delta badges flip
 * green/red, and a "LIVE" pulse shows freshness. Feed your own `sample`
 * function or use the built-in simulation.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type LiveStat = { label: string; value: number; unit?: string; decimals?: number; color: string };

export type LiveStatsProps = {
  stats?: LiveStat[];
  /** ms between ticks (default 1200). */
  every?: number;
  /** false = static numbers and charts (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const STATS: LiveStat[] = [
  { label: "Requests / sec", value: 12840, color: "#22d3ee" },
  { label: "p75 latency", value: 74, unit: "ms", color: "#4ade80" },
  { label: "Active users", value: 3271, color: "#a78bfa" },
  { label: "Error rate", value: 0.12, unit: "%", decimals: 2, color: "#fb923c" },
];

function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26 - 2}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
      <defs>
        <linearGradient id={`g${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,30 ${pts} 100,30`} fill={`url(#g${color.slice(1)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function LiveStats({ stats = STATS, every = 1200, animated = true, className = "" }: LiveStatsProps) {
  const [series, setSeries] = React.useState(() => stats.map((s) => Array.from({ length: 24 }, (_, i) => s.value * (0.9 + 0.1 * Math.sin(i / 2) + ((i * 7) % 5) / 100))));

  React.useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setSeries((all) => all.map((arr) => [...arr.slice(1), Math.max(0, arr[arr.length - 1] * (0.96 + Math.random() * 0.08))]));
    }, every);
    return () => window.clearInterval(t);
  }, [animated, every]);

  return (
    <section className={`w-full px-6 py-12 ${className}`} aria-label="Live metrics">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-white">Platform, right now</h2>
          <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/60">
            <span className="relative flex h-2 w-2">
              {animated && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {animated ? "Live" : "Snapshot"}
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const arr = series[i];
            const now = arr[arr.length - 1];
            const prev = arr[arr.length - 2];
            const delta = ((now - prev) / (prev || 1)) * 100;
            const bad = s.label.toLowerCase().includes("error") || s.label.toLowerCase().includes("latency");
            const good = bad ? delta <= 0 : delta >= 0;
            return (
              <div key={s.label} className="bg-[#0c0c0e] p-5">
                <p className="text-xs text-white/50">{s.label}</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black tabular-nums text-white">
                    {now.toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0 })}
                    {s.unit && <span className="ml-0.5 text-base text-white/50">{s.unit}</span>}
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${good ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
                  </span>
                </p>
                <div className="mt-3">
                  <Spark data={arr} color={s.color} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] text-white/30">Simulated data — pass your own stats.</p>
      </div>
    </section>
  );
}

export default LiveStats;
