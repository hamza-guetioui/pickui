"use client";

import * as React from "react";

/**
 * ScratchCard — a metallic foil you scratch off with mouse or finger. The foil
 * is painted on a canvas (brushed-metal gradient, glitter, embossed hint),
 * scratching erases it along a smooth stroke, and once enough is cleared the
 * rest dissolves and a burst of sparks celebrates the reveal.
 * Keyboard/screen-reader users get a "Reveal" button.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type ScratchCardProps = {
  /** Revealed content. */
  children: React.ReactNode;
  /** Text embossed on the foil. */
  hint?: string;
  /** 0–1 share of foil to clear before auto-reveal (default 0.5). */
  threshold?: number;
  /** Brush radius in px (default 22). */
  brush?: number;
  onReveal?: () => void;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-sc-spark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
.gx-sc-spark{animation:gx-sc-spark .9s cubic-bezier(.2,.7,.3,1) forwards}
@media (prefers-reduced-motion:reduce){.gx-sc-spark{display:none}}
`;

const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  const d = 70 + ((i * 37) % 50);
  return { tx: `${Math.cos(a) * d}px`, ty: `${Math.sin(a) * d}px`, c: ["#fde68a", "#f472b6", "#67e8f9", "#a7f3d0"][i % 4] };
});

export function ScratchCard({ children, hint = "Scratch here", threshold = 0.5, brush = 22, onReveal, animated = true, className = "" }: ScratchCardProps) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const last = React.useRef<{ x: number; y: number } | null>(null);
  const moves = React.useRef(0);
  const [revealed, setRevealed] = React.useState(false);

  const paint = React.useCallback(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = w.getBoundingClientRect();
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#8d8f96");
    g.addColorStop(0.35, "#e6e7ea");
    g.addColorStop(0.5, "#a4a6ad");
    g.addColorStop(0.75, "#dcdde1");
    g.addColorStop(1, "#7c7e85");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // brushed lines
    for (let y = 0; y < height; y += 2) {
      ctx.fillStyle = `rgba(255,255,255,${0.04 + ((y * 13) % 7) / 100})`;
      ctx.fillRect(0, y, width, 1);
    }
    // glitter
    for (let i = 0; i < (width * height) / 90; i++) {
      const x = (i * 97.13) % width;
      const y = (i * 57.71 * 1.7) % height;
      ctx.fillStyle = i % 3 ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.18)";
      ctx.fillRect(x, y, 1, 1);
    }
    // embossed hint
    ctx.font = "800 15px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText(hint.toUpperCase(), width / 2 + 1, height / 2 + 1);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillText(hint.toUpperCase(), width / 2, height / 2);
  }, [hint]);

  React.useEffect(() => {
    paint();
    const ro = new ResizeObserver(() => !revealed && paint());
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [paint, revealed]);

  const reveal = React.useCallback(() => {
    setRevealed(true);
    onReveal?.();
  }, [onReveal]);

  const cleared = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return 0;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] === 0) clear++;
    }
    return clear / total;
  };

  const scratch = (e: React.PointerEvent) => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || revealed) return;
    const r = c.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brush * 2;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 8 === 0 && cleared() >= threshold) reveal();
  };

  return (
    <div
      ref={wrap}
      className={`relative isolate aspect-[16/10] w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 ${className}`}
    >
      <style>{css}</style>
      <div className="absolute inset-0" aria-hidden={!revealed}>
        {children}
      </div>

      {revealed &&
        animated &&
        SPARKS.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="gx-sc-spark pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{ background: s.c, boxShadow: `0 0 6px ${s.c}`, "--tx": s.tx, "--ty": s.ty } as React.CSSProperties}
          />
        ))}

      <canvas
        ref={canvas}
        aria-hidden
        className={`absolute inset-0 h-full w-full cursor-crosshair touch-none transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : ""}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          last.current = null;
          scratch(e);
        }}
        onPointerMove={(e) => e.buttons === 1 && scratch(e)}
        onPointerUp={() => (last.current = null)}
      />

      {!revealed && (
        <button
          type="button"
          onClick={reveal}
          className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 opacity-70 outline-none backdrop-blur transition hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Reveal
        </button>
      )}
    </div>
  );
}

export default ScratchCard;
