"use client";

import * as React from "react";

/**
 * Oscilloscope — a green-phosphor CRT scope: real knobs (drag or scroll)
 * for frequency, amplitude and waveform, a beam that leaves a fading
 * phosphor trail, graticule, and XY mode that draws Lissajous figures.
 * Great for audio, IoT and engineering dashboards — or just to stare at.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type OscilloscopeProps = {
  /** Trace color (default P31 phosphor green). */
  color?: string;
  /** false = static trace, no sweep / persistence (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

type Wave = "sine" | "square" | "saw" | "xy";
const WAVES: Wave[] = ["sine", "square", "saw", "xy"];

function Knob({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const start = React.useRef<{ y: number; v: number } | null>(null);
  const p = (value - min) / (max - min);
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 10) / 10}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = { y: e.clientY, v: value };
        }}
        onPointerMove={(e) => start.current && onChange(Math.max(min, Math.min(max, start.current.v + ((start.current.y - e.clientY) / 120) * (max - min))))}
        onPointerUp={() => (start.current = null)}
        onWheel={(e) => onChange(Math.max(min, Math.min(max, value - Math.sign(e.deltaY) * (max - min) * 0.04)))}
        onKeyDown={(e) => {
          const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
          if (d) {
            e.preventDefault();
            onChange(Math.max(min, Math.min(max, value + d * (max - min) * 0.05)));
          }
        }}
        className="relative h-12 w-12 cursor-ns-resize touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        style={{ background: "radial-gradient(circle at 35% 30%, #4a4a50, #121214 70%)", boxShadow: "0 4px 8px rgba(0,0,0,.6), inset 0 1px 1px rgba(255,255,255,.2)" }}
      >
        <span className="absolute left-1/2 top-1/2 h-5 w-[3px] origin-bottom rounded bg-white/80" style={{ transform: `translate(-50%,-100%) rotate(${-135 + p * 270}deg)` }} />
      </button>
      <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">{label}</span>
    </div>
  );
}

export function Oscilloscope({ color = "#5cff9d", animated = true, className = "" }: OscilloscopeProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [freq, setFreq] = React.useState(3);
  const [amp, setAmp] = React.useState(0.6);
  const [wave, setWave] = React.useState<Wave>("sine");
  const params = React.useRef({ freq, amp, wave });
  params.current = { freq, amp, wave };

  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth;
    const H = c.clientHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const still = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    const f = (x: number, kind: Wave) => {
      if (kind === "square") return Math.sign(Math.sin(x)) || 1;
      if (kind === "saw") return ((x / Math.PI) % 2) - 1;
      return Math.sin(x);
    };
    const draw = () => {
      const { freq: fq, amp: a, wave: w } = params.current;
      ctx.fillStyle = still ? "#06100a" : "rgba(6,16,10,.22)"; // persistence
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const k = i / N;
        let x: number;
        let y: number;
        if (w === "xy") {
          const s = k * Math.PI * 2;
          x = W / 2 + Math.sin(s * fq + t) * (W * 0.38) * a;
          y = H / 2 + Math.sin(s * (fq + 1)) * (H * 0.38) * a;
        } else {
          x = k * W;
          y = H / 2 - f(k * Math.PI * 2 * fq + t * 3, w) * (H * 0.4) * a;
        }
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      t += 0.02;
    };
    if (still) draw();
    else {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [color, animated, freq, amp, wave]);

  return (
    <div className={`w-full max-w-xl rounded-[22px] border border-white/10 bg-gradient-to-b from-[#2a2c2a] to-[#161716] p-4 shadow-[0_20px_40px_-14px_rgba(0,0,0,.9)] ${className}`}>
      <div className="flex gap-4 max-sm:flex-col">
        <div className="relative aspect-[4/3] flex-1 overflow-hidden rounded-[14px] bg-[#06100a] shadow-[inset_0_0_30px_rgba(0,0,0,.9)]">
          <canvas ref={ref} role="img" aria-label={`Oscilloscope trace: ${wave} wave, ${freq.toFixed(1)} cycles, amplitude ${Math.round(amp * 100)}%`} className="absolute inset-0 h-full w-full" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
              backgroundSize: "10% 12.5%",
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.6))]" />
          <span className="absolute left-2 top-1.5 font-mono text-[9px] text-emerald-300/70">CH1 · {wave.toUpperCase()} · {freq.toFixed(1)}×</span>
        </div>
        <div className="grid grid-cols-3 content-center gap-3 sm:w-36 sm:grid-cols-2">
          <Knob label="Freq" value={freq} min={0.5} max={8} onChange={setFreq} />
          <Knob label="Amp" value={amp} min={0.1} max={1} onChange={setAmp} />
          <div className="col-span-1 flex flex-col gap-1 sm:col-span-2">
            {WAVES.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={wave === w}
                onClick={() => setWave(w)}
                className={`rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition ${wave === w ? "bg-emerald-400 text-black" : "bg-black/40 text-white/60 hover:text-white"}`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Oscilloscope;
