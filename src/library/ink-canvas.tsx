"use client";

import * as React from "react";

/**
 * InkCanvas — a sumi-e brush on rice paper. Stroke width follows your speed
 * (slow = heavy, fast = thin and dry), the ink bleeds softly at the edges,
 * flicks leave splatter, and ink runs out until you dip again. Download as PNG.
 * Zero dependencies · React + Tailwind.
 */

export type InkCanvasProps = {
  /** Ink color (default sumi black). */
  ink?: string;
  /** Paper color. */
  paper?: string;
  /** Max brush size in px (default 26). */
  size?: number;
  /** false = uniform pen, no bleed/splatter (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

export function InkCanvas({ ink = "#141210", paper = "#f3ecdc", size = 26, animated = true, className = "" }: InkCanvasProps) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const last = React.useRef<{ x: number; y: number; t: number; w: number } | null>(null);
  const [load, setLoad] = React.useState(1); // ink left on the brush

  const paint = React.useCallback(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = w.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    // rice-paper fibres
    for (let i = 0; i < 260; i++) {
      ctx.strokeStyle = `rgba(120,100,70,${0.03 + ((i * 7) % 5) / 100})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const x = (i * 97.3) % width;
      const y = (i * 61.7) % height;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 8, y + 3, x + 16 + (i % 9), y + ((i % 5) - 2));
      ctx.stroke();
    }
  }, [paper]);

  React.useEffect(() => {
    paint();
  }, [paint]);

  const draw = (e: React.PointerEvent) => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const t = performance.now();
    const prev = last.current;
    if (!prev) {
      last.current = { x, y, t, w: size * 0.5 };
      return;
    }
    const dist = Math.hypot(x - prev.x, y - prev.y);
    const v = dist / Math.max(1, t - prev.t); // px/ms
    const target = animated ? Math.max(1.5, size * (1 - Math.min(1, v / 2.2))) * (0.35 + load * 0.65) : 4;
    const w = prev.w + (target - prev.w) * 0.35;
    const steps = Math.max(1, Math.ceil(dist / 2));
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      const px = prev.x + (x - prev.x) * k;
      const py = prev.y + (y - prev.y) * k;
      const pw = prev.w + (w - prev.w) * k;
      if (animated) {
        // soft bleed halo
        ctx.globalAlpha = 0.05 * load;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(px, py, pw * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // dry brush when fast or low ink: broken bristles
      ctx.globalAlpha = animated ? 0.55 + load * 0.4 : 1;
      ctx.beginPath();
      ctx.arc(px, py, pw / 2, 0, Math.PI * 2);
      ctx.fill();
      if (animated && (v > 1.4 || load < 0.35)) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 0.5;
        for (let b = 0; b < 3; b++) {
          ctx.fillRect(px + (Math.random() - 0.5) * pw, py + (Math.random() - 0.5) * pw, 1.2, 1.2);
        }
        ctx.globalCompositeOperation = "source-over";
      }
    }
    // flick → splatter
    if (animated && v > 2.6) {
      ctx.globalAlpha = 0.7;
      for (let s = 0; s < 6; s++) {
        const a = Math.atan2(y - prev.y, x - prev.x) + (Math.random() - 0.5) * 0.8;
        const d = 10 + Math.random() * 40;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.random() * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    last.current = { x, y, t, w };
    if (animated) setLoad((l) => Math.max(0.12, l - dist / 5200));
  };

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div ref={wrap} className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-black/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,.7)]">
        <canvas
          ref={canvas}
          role="img"
          aria-label="Ink drawing canvas"
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            draw(e);
          }}
          onPointerMove={(e) => e.buttons === 1 && draw(e)}
          onPointerUp={() => (last.current = null)}
        />
        <span className="pointer-events-none absolute bottom-3 right-4 select-none font-serif text-2xl text-red-700/70 [writing-mode:vertical-rl]">墨</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
        <span className="mr-auto flex items-center gap-2">
          Ink
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10" role="meter" aria-label="Ink left" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(load * 100)}>
            <span className="block h-full rounded-full bg-white/70 transition-[width]" style={{ width: `${load * 100}%` }} />
          </span>
        </span>
        <button type="button" onClick={() => setLoad(1)} className="rounded-full border border-white/15 px-3 py-1.5 hover:text-white">
          Dip brush
        </button>
        <button type="button" onClick={paint} className="rounded-full border border-white/15 px-3 py-1.5 hover:text-white">
          New sheet
        </button>
        <button
          type="button"
          onClick={() => {
            const a = document.createElement("a");
            a.download = "ink.png";
            a.href = canvas.current?.toDataURL("image/png") ?? "";
            a.click();
          }}
          className="rounded-full bg-white px-3 py-1.5 font-semibold text-black hover:bg-white/85"
        >
          Save PNG
        </button>
      </div>
    </div>
  );
}

export default InkCanvas;
