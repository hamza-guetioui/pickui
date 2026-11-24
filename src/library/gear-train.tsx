"use client";

import * as React from "react";

/**
 * GearTrain — an engineering drawing come alive: meshed spur gears with
 * real involute-ish teeth, correct speed ratios (small gears spin faster,
 * neighbours counter-rotate) and teeth that actually interlock. Drag the
 * drive gear to crank the whole train; a readout shows RPM per gear.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type GearTrainProps = {
  /** Tooth counts, driver first (default [24, 12, 36, 16]). */
  teeth?: number[];
  /** Driver RPM when idling (default 8). */
  rpm?: number;
  /** false = static gears, drag still works (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const MODULE = 4.2; // px per tooth (pitch radius = teeth * MODULE / 2)

function gearPath(n: number) {
  const r = (n * MODULE) / 2;
  const ro = r + MODULE * 0.9;
  const ri = r - MODULE * 1.1;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const t = (Math.PI * 2) / n;
    const pts = [
      [ri, a],
      [ro, a + t * 0.18],
      [ro, a + t * 0.42],
      [ri, a + t * 0.6],
      [ri, a + t],
    ];
    pts.forEach(([rad, ang], k) => {
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      d += `${i === 0 && k === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    });
  }
  return d + "Z";
}

export function GearTrain({ teeth = [24, 12, 36, 16], rpm = 8, animated = true, className = "" }: GearTrainProps) {
  const svg = React.useRef<SVGSVGElement>(null);
  const angle = React.useRef(0);
  const groups = React.useRef<(SVGGElement | null)[]>([]);
  const drag = React.useRef<number | null>(null);
  const [speed, setSpeed] = React.useState(rpm);

  // layout: chain gears left→right, alternating up/down so it looks designed
  const layout = React.useMemo(() => {
    const out: { x: number; y: number; n: number; phase: number }[] = [];
    teeth.forEach((n, i) => {
      if (i === 0) return out.push({ x: 0, y: 0, n, phase: 0 });
      const p = out[i - 1];
      const dist = ((p.n + n) * MODULE) / 2;
      const outer = (k: number) => (k * MODULE) / 2 + MODULE * 1.2;
      // zig-zag, flattening the angle until the gear clears every non-neighbour
      let ang = 0;
      let x = p.x + dist;
      let y = p.y;
      for (const tryA of [0.55, 0.45, 0.35, 0.25, 0.15, 0]) {
        ang = (i % 2 ? -1 : 1) * tryA;
        x = p.x + Math.cos(ang) * dist;
        y = p.y + Math.sin(ang) * dist;
        const clear = out.slice(0, -1).every((g) => Math.hypot(g.x - x, g.y - y) > outer(g.n) + outer(n) + 4);
        if (clear) break;
      }
      // phase so teeth interlock: rotate by half a tooth relative to contact angle
      const contact = Math.atan2(p.y - y, p.x - x);
      const prevContact = contact + Math.PI;
      const phase = ((-(prevContact - p.phase) * p.n) / n + contact + Math.PI / n) % (Math.PI * 2);
      out.push({ x, y, n, phase });
    });
    return out;
  }, [teeth]);

  const xs = layout.map((g) => g.x);
  const ys = layout.map((g) => g.y);
  const pad = 60;
  const vb = `${Math.min(...xs) - pad - 40} ${Math.min(...ys) - pad - 40} ${Math.max(...xs) - Math.min(...xs) + (pad + 40) * 2} ${Math.max(...ys) - Math.min(...ys) + (pad + 40) * 2}`;

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const still = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const render = () => {
      layout.forEach((g, i) => {
        const ratio = layout[0].n / g.n;
        const a = (i % 2 ? -1 : 1) * angle.current * ratio + g.phase;
        groups.current[i]?.setAttribute("transform", `translate(${g.x} ${g.y}) rotate(${(a * 180) / Math.PI})`);
      });
    };
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (drag.current === null && !still) angle.current += ((speed * Math.PI * 2) / 60) * dt;
      render();
      raf = requestAnimationFrame(loop);
    };
    render();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layout, speed, animated]);

  const toLocal = (e: React.PointerEvent) => {
    const pt = svg.current!.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    return Math.atan2(p.y - layout[0].y, p.x - layout[0].x);
  };

  const COLORS = ["#4ade80", "#22d3ee", "#a78bfa", "#fb923c", "#f472b6"];

  return (
    <div className={`relative h-full min-h-[320px] w-full overflow-hidden bg-[#0b1d33] ${className}`}>
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(125,211,252,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.12)_1px,transparent_1px)] [background-size:20px_20px]" />
      <svg ref={svg} viewBox={vb} className="absolute inset-0 h-full w-full" role="img" aria-label={`Gear train with ${teeth.length} gears`}>
        {layout.map((g, i) => (
          <g key={i}>
            <g ref={(el) => {
              groups.current[i] = el;
            }}>
              <path d={gearPath(g.n)} fill={`${COLORS[i % 5]}22`} stroke={COLORS[i % 5]} strokeWidth="1.4" />
              <circle r={(g.n * MODULE) / 2} fill="none" stroke={COLORS[i % 5]} strokeDasharray="3 4" strokeWidth=".6" opacity=".6" />
              <circle r={Math.max(6, g.n * 0.5)} fill="#0b1d33" stroke={COLORS[i % 5]} strokeWidth="1.4" />
              <line x1="0" y1="0" x2={(g.n * MODULE) / 2 - 8} y2="0" stroke={COLORS[i % 5]} strokeWidth="1.2" />
              {i === 0 && (
                <circle
                  r={(g.n * MODULE) / 2 + 6}
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    (e.currentTarget as Element).setPointerCapture(e.pointerId);
                    drag.current = toLocal(e);
                  }}
                  onPointerMove={(e) => {
                    if (drag.current === null) return;
                    const a = toLocal(e);
                    let d = a - drag.current;
                    if (d > Math.PI) d -= Math.PI * 2;
                    if (d < -Math.PI) d += Math.PI * 2;
                    angle.current += d;
                    drag.current = a;
                  }}
                  onPointerUp={() => (drag.current = null)}
                />
              )}
            </g>
            <text x={g.x} y={g.y + (g.n * MODULE) / 2 + 22} fill="#bae6fd" fontSize="9" textAnchor="middle" fontFamily="ui-monospace,monospace">
              Z{g.n} · {((speed * layout[0].n) / g.n).toFixed(1)} rpm
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 font-mono text-[11px] text-sky-200/80">
        <span>DRIVE</span>
        <input
          type="range"
          min={0}
          max={40}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Drive speed (rpm)"
          className="flex-1 accent-emerald-400"
        />
        <span>{speed} rpm</span>
      </div>
      <p className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.3em] text-sky-200/60">DWG-04 · Spur gear train · drag the green gear</p>
    </div>
  );
}

export default GearTrain;
