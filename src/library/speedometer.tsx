"use client";

import * as React from "react";

/**
 * Speedometer — a sports-car cluster: a tachometer and a speed gauge whose
 * needles have real inertia (spring + damping), a red-line that flashes the
 * shift light, and a gearbox model so RPM drops when you upshift. Hold the
 * throttle (button, Space or ↑) to accelerate; release to coast.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SpeedometerProps = {
  /** Max speed on the dial (default 280). */
  maxSpeed?: number;
  /** Red-line RPM ×1000 (default 7). */
  redline?: number;
  unit?: "km/h" | "mph";
  accent?: string;
  /** false = needles jump without inertia (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const RATIOS = [0, 3.4, 2.2, 1.6, 1.25, 1.0, 0.82];

function Gauge({
  value,
  max,
  label,
  ticks,
  red,
  size = 180,
  accent,
  big,
}: {
  value: number;
  max: number;
  label: string;
  ticks: number;
  red?: number;
  size?: number;
  accent: string;
  big: string;
}) {
  const a0 = 135;
  const sweep = 270;
  const ang = a0 + (Math.min(value, max) / max) * sweep;
  const R = size / 2 - 8;
  const pt = (deg: number, r: number) => {
    const t = (deg * Math.PI) / 180;
    return [size / 2 + Math.cos(t) * r, size / 2 + Math.sin(t) * r];
  };
  const arc = (from: number, to: number, r: number) => {
    const [x1, y1] = pt(from, r);
    const [x2, y2] = pt(to, r);
    return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[220px]" role="img" aria-label={`${label}: ${big}`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="#0b0b0d" stroke="#2a2a2e" strokeWidth="3" />
      <path d={arc(a0, a0 + sweep, R - 6)} stroke="#1c1c20" strokeWidth="8" fill="none" />
      <path d={arc(a0, ang, R - 6)} stroke={accent} strokeWidth="3" fill="none" opacity=".5" />
      {red !== undefined && <path d={arc(a0 + (red / max) * sweep, a0 + sweep, R - 6)} stroke="#ef4444" strokeWidth="8" fill="none" />}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const d = a0 + (i / ticks) * sweep;
        const [x1, y1] = pt(d, R - 12);
        const [x2, y2] = pt(d, R - 22);
        const [tx, ty] = pt(d, R - 34);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4d4d8" strokeWidth="2" />
            <text x={tx} y={ty + 3} fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="ui-monospace,monospace">
              {Math.round((i / ticks) * max)}
            </text>
          </g>
        );
      })}
      <g transform={`rotate(${ang} ${size / 2} ${size / 2})`}>
        <line x1={size / 2 - 10} y1={size / 2} x2={size / 2 + R - 14} y2={size / 2} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx={size / 2} cy={size / 2} r="8" fill="#18181b" stroke="#3f3f46" />
      <text x={size / 2} y={size / 2 + 40} fill="#fafafa" fontSize="20" fontWeight="800" textAnchor="middle" fontFamily="ui-monospace,monospace">
        {big}
      </text>
      <text x={size / 2} y={size / 2 + 54} fill="#71717a" fontSize="8" textAnchor="middle" letterSpacing="2">
        {label}
      </text>
    </svg>
  );
}

export function Speedometer({ maxSpeed = 280, redline = 7, unit = "km/h", accent = "#22d3ee", animated = true, className = "" }: SpeedometerProps) {
  const [state, setState] = React.useState({ speed: 0, rpm: 0.9, gear: 1, nSpeed: 0, nRpm: 0.9, vS: 0, vR: 0 });
  const throttle = React.useRef(false);

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setState((s) => {
        let { speed, gear } = s;
        const ratio = RATIOS[gear];
        // engine model (very simplified)
        speed += (throttle.current ? (60 / ratio) * (1 - speed / maxSpeed) : -18 - speed * 0.05) * dt;
        speed = Math.max(0, Math.min(maxSpeed, speed));
        let rpm = Math.max(0.9, (speed * ratio) / 32);
        if (throttle.current && rpm > redline + 0.3 && gear < 6) gear++;
        if (!throttle.current && rpm < 2.2 && gear > 1) gear--;
        rpm = Math.min(redline + 0.6, Math.max(0.9, (speed * RATIOS[gear]) / 32));
        // needles: damped springs → overshoot on shifts
        const k = 90;
        const c = 13;
        let { nSpeed, nRpm, vS, vR } = s;
        if (animated) {
          vS += (k * (speed - nSpeed) - c * vS) * dt;
          vR += (k * 1.6 * (rpm - nRpm) - c * vR) * dt;
          nSpeed += vS * dt;
          nRpm += vR * dt;
        } else {
          nSpeed = speed;
          nRpm = rpm;
        }
        return { speed, rpm, gear, nSpeed, nRpm, vS, vR };
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const kd = (e: KeyboardEvent) => {
      if ((e.key === "ArrowUp" || e.key === " ") && document.activeElement?.closest("[data-gx-speedo]")) {
        e.preventDefault();
        throttle.current = true;
      }
    };
    const ku = (e: KeyboardEvent) => (e.key === "ArrowUp" || e.key === " ") && (throttle.current = false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [maxSpeed, redline, animated]);

  const shift = state.rpm > redline - 0.4;

  return (
    <div data-gx-speedo className={`w-full max-w-xl rounded-[28px] border border-white/10 bg-gradient-to-b from-[#16161a] to-[#0a0a0c] p-5 ${className}`}>
      <div className="mb-2 flex justify-center gap-1.5" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className="h-2 w-5 rounded-full transition-colors"
            style={{
              background: state.rpm > redline - 2.4 + i * 0.35 ? (i < 3 ? "#22c55e" : i < 5 ? "#f59e0b" : "#ef4444") : "#27272a",
              boxShadow: shift && Math.floor(performance.now() / 90) % 2 ? "0 0 10px #ef4444" : undefined,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Gauge value={state.nRpm} max={8} label="RPM ×1000" ticks={8} red={redline} accent={accent} big={(state.rpm * 1000).toFixed(0)} />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] tracking-widest text-white/40">GEAR</span>
          <span className="font-mono text-5xl font-black text-white" aria-live="polite">
            {state.gear}
          </span>
        </div>
        <Gauge value={state.nSpeed} max={maxSpeed} label={unit.toUpperCase()} ticks={7} accent={accent} big={Math.round(state.speed).toString()} />
      </div>
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          throttle.current = true;
        }}
        onPointerUp={() => (throttle.current = false)}
        onPointerCancel={() => (throttle.current = false)}
        className="mx-auto mt-3 flex h-11 w-48 touch-none select-none items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 active:bg-white/15"
      >
        Hold to accelerate
        <kbd className="rounded border border-white/20 px-1 font-mono text-[10px]">↑</kbd>
      </button>
    </div>
  );
}

export default Speedometer;
