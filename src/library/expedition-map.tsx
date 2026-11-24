"use client";

import * as React from "react";

/**
 * ExpeditionMap — an explorer's chart on aged parchment: an ink route draws
 * itself from waypoint to waypoint, a compass rose turns, sea monsters lurk
 * at the edges, and each waypoint opens a journal entry. Perfect for
 * timelines, company history, onboarding steps or museum stories.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Waypoint = { x: number; y: number; title: string; year?: string; text: string };

export type ExpeditionMapProps = {
  /** Points in a 600×380 coordinate space. */
  waypoints?: Waypoint[];
  title?: string;
  /** false = route shown complete, no drawing / compass spin (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

// A fictional voyage (placeholder copy): replace with your own story, timeline or steps.
const POINTS: Waypoint[] = [
  { x: 70, y: 300, year: "1721", title: "Port of Saltmere", text: "The Aurora leaves harbour at dawn. Provisions for a year, charts for a month." },
  { x: 190, y: 220, year: "1721", title: "Isle of Lanterns", text: "Repairs to the rudder. The crew’s last sight of a known shore." },
  { x: 330, y: 260, year: "1721", title: "The Quiet Sea", text: "Weeks without wind. The captain’s log grows shorter every day." },
  { x: 450, y: 150, year: "1722", title: "Weedwater", text: "Kelp so thick the sailors fear the sea itself has turned to meadow." },
  { x: 545, y: 90, year: "1722", title: "Cape Hopeful", text: "“Land!” — a lantern seen at two in the morning from the crow’s nest." },
];

const PARCH =
  "radial-gradient(ellipse at 30% 20%, rgba(255,250,235,.6), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(120,80,30,.35), transparent 50%), radial-gradient(ellipse at center, #e8d6ad 40%, #c9ad79 100%)";

export function ExpeditionMap({ waypoints = POINTS, title = "The Voyage of the Aurora", animated = true, className = "" }: ExpeditionMapProps) {
  const [active, setActive] = React.useState(0);
  const [drawn, setDrawn] = React.useState(animated ? 0 : waypoints.length - 1);
  const pathRef = React.useRef<SVGPathElement>(null);
  const [len, setLen] = React.useState(1000);

  const d = waypoints.reduce((acc, p, i) => {
    if (!i) return `M${p.x} ${p.y}`;
    const prev = waypoints[i - 1];
    const cx = (prev.x + p.x) / 2 + (i % 2 ? -30 : 30);
    const cy = (prev.y + p.y) / 2 + (i % 2 ? 40 : -40);
    return `${acc} Q${cx} ${cy} ${p.x} ${p.y}`;
  }, "");

  React.useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);

  React.useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(waypoints.length - 1);
      return;
    }
    const t = window.setInterval(() => setDrawn((v) => (v < waypoints.length - 1 ? v + 1 : v)), 1400);
    return () => window.clearInterval(t);
  }, [animated, waypoints.length]);

  const go = (i: number) => {
    setActive(i);
    setDrawn((v) => Math.max(v, i));
  };

  const fraction = drawn / Math.max(1, waypoints.length - 1);
  const wp = waypoints[active];

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div className="relative overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)]" style={{ background: PARCH }}>
        <svg viewBox="0 0 600 380" className="h-auto w-full" role="img" aria-label={`Map: ${title}`}>
          <defs>
            <filter id="gx-em-rough">
              <feTurbulence baseFrequency=".03" numOctaves="3" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="4" />
            </filter>
          </defs>
          {/* coastlines */}
          <g fill="rgba(140,100,50,.25)" stroke="#6b4a22" strokeWidth="1.4" filter="url(#gx-em-rough)">
            <path d="M0 250 C 40 240, 60 280, 90 320 C 100 350, 60 380, 0 380 Z" />
            <path d="M600 0 C 560 30, 520 60, 560 120 C 580 150, 600 160, 600 160 Z" />
            <path d="M160 200 C 175 190, 200 196, 205 212 C 200 228, 172 232, 160 220 Z" />
          </g>
          {/* rhumb lines */}
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="300" y1="190" x2={300 + Math.cos((i / 16) * Math.PI * 2) * 600} y2={190 + Math.sin((i / 16) * Math.PI * 2) * 600} stroke="rgba(107,74,34,.12)" strokeWidth=".6" />
          ))}
          {/* sea serpent */}
          <path d="M360 330 q10 -18 20 0 q10 18 20 0 q10 -18 20 0" stroke="#6b4a22" strokeWidth="2" fill="none" opacity=".6" />
          <circle cx="422" cy="328" r="1.6" fill="#6b4a22" />
          {/* route */}
          <path ref={pathRef} d={d} fill="none" stroke="rgba(107,74,34,.25)" strokeWidth="2" strokeDasharray="2 6" />
          <path
            d={d}
            fill="none"
            stroke="#8b1e1e"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len * (1 - fraction)}
            style={{ transition: animated ? "stroke-dashoffset 1.3s ease-in-out" : undefined }}
          />
          {waypoints.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`} opacity={i <= drawn ? 1 : 0.35} style={{ transition: "opacity .6s" }}>
              <circle r={i === active ? 11 : 8} fill={i === active ? "#8b1e1e" : "#f3e6c6"} stroke="#6b4a22" strokeWidth="1.6" />
              <text y="4" textAnchor="middle" fontSize="10" fontFamily="Georgia,serif" fontWeight="bold" fill={i === active ? "#f3e6c6" : "#6b4a22"}>
                {i + 1}
              </text>
            </g>
          ))}
          {/* compass rose */}
          <g transform="translate(520 300)">
            <g style={{ transformOrigin: "0 0", animation: animated ? "gx-em-spin 40s linear infinite" : undefined }}>
              {[0, 45, 90, 135].map((a) => (
                <path key={a} d="M0 -34 L5 0 L0 34 L-5 0Z" fill={a % 90 ? "rgba(107,74,34,.35)" : "#6b4a22"} transform={`rotate(${a})`} />
              ))}
            </g>
            <text y="-40" textAnchor="middle" fontSize="11" fontFamily="Georgia,serif" fill="#6b4a22">
              N
            </text>
          </g>
          <text x="24" y="40" fontSize="24" fontFamily="Georgia,serif" fontStyle="italic" fill="#5a3b18">
            {title}
          </text>
        </svg>
        <style>{`@keyframes gx-em-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){[style*="gx-em-spin"]{animation:none!important}}`}</style>
        {/* hit targets */}
        {waypoints.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`${i + 1}. ${p.title}`}
            aria-pressed={i === active}
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#8b1e1e]"
            style={{ left: `${(p.x / 600) * 100}%`, top: `${(p.y / 380) * 100}%` }}
          />
        ))}
      </div>
      <article className="mt-3 rounded-xl p-4 text-[#3b2a17]" style={{ background: PARCH }} aria-live="polite">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
          Entry {active + 1} of {waypoints.length} {wp.year && `· ${wp.year}`}
        </p>
        <h3 className="mt-1 font-serif text-xl font-bold italic">{wp.title}</h3>
        <p className="mt-1 font-serif text-sm leading-relaxed">{wp.text}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={!active} onClick={() => go(active - 1)} className="rounded-full border border-[#6b4a22]/40 px-3 py-1 text-xs disabled:opacity-40">
            ← Previous
          </button>
          <button type="button" disabled={active === waypoints.length - 1} onClick={() => go(active + 1)} className="rounded-full bg-[#6b4a22] px-3 py-1 text-xs text-[#f3e6c6] disabled:opacity-40">
            Next leg →
          </button>
        </div>
      </article>
    </div>
  );
}

export default ExpeditionMap;
