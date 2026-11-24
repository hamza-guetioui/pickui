"use client";

import * as React from "react";

/**
 * FlowField — generative art: thousands of particles drift through a
 * curl-like noise field and leave silk trails. Every seed is a new artwork;
 * the cursor bends the field like a stone in a river.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type FlowFieldProps = {
  /** Same seed = same artwork. */
  seed?: number;
  /** Colors of the trails. */
  palette?: string[];
  /** Particle count (default 900). */
  count?: number;
  /** false = render one still artwork, no animation (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FlowField({
  seed: seed0 = 7,
  palette = ["#f472b6", "#a78bfa", "#22d3ee", "#fde68a"],
  count = 900,
  animated = true,
  className = "",
}: FlowFieldProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const mouse = React.useRef({ x: -9999, y: -9999 });
  const [seed, setSeed] = React.useState(seed0);
  const palKey = palette.join("|");

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
    ctx.fillStyle = "#07070a";
    ctx.fillRect(0, 0, W, H);
    const r = rng(seed);
    const f1 = 0.002 + r() * 0.004;
    const f2 = 0.003 + r() * 0.005;
    const twist = 1 + r() * 3;
    const angle = (x: number, y: number) =>
      (Math.sin(x * f1 + Math.cos(y * f2) * twist) + Math.cos(y * f1 * 1.3 + Math.sin(x * f2) * twist)) * Math.PI;
    const cols = palKey.split("|");
    const ps = Array.from({ length: count }, () => ({ x: r() * W, y: r() * H, c: cols[Math.floor(r() * cols.length)], life: r() * 200 }));
    const still = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const step = () => {
      ctx.globalAlpha = 0.06;
      for (const p of ps) {
        let a = angle(p.x, p.y);
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) a += Math.atan2(dy, dx) * 0.9;
        const nx = p.x + Math.cos(a) * 1.4;
        const ny = p.y + Math.sin(a) * 1.4;
        ctx.strokeStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        if (--p.life < 0 || nx < 0 || ny < 0 || nx > W || ny > H) {
          p.x = r() * W;
          p.y = r() * H;
          p.life = 100 + r() * 200;
        }
      }
      ctx.globalAlpha = 1;
    };

    if (still) {
      for (let i = 0; i < 260; i++) step();
    } else {
      const loop = () => {
        step();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [seed, palKey, count, animated]);

  return (
    <div className={`relative h-full min-h-[320px] w-full overflow-hidden ${className}`}>
      <canvas
        ref={ref}
        role="img"
        aria-label={`Generative flow-field artwork, seed ${seed}`}
        className="absolute inset-0 h-full w-full"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }}
        onPointerLeave={() => (mouse.current = { x: -9999, y: -9999 })}
      />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] text-white/60">
        <span>seed #{seed}</span>
        <button
          type="button"
          onClick={() => setSeed(Math.floor(Math.random() * 99999))}
          className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-white backdrop-blur hover:bg-white hover:text-black"
        >
          New artwork
        </button>
      </div>
    </div>
  );
}

export default FlowField;
