"use client";

import * as React from "react";

/**
 * WarpCta — a final call-to-action set in space. Stars drift; hover the
 * button and the ship goes to warp: stars stretch into light streaks and
 * the speed ramps with real easing; click and the screen flashes white
 * like a jump. Canvas, ~60 lines of physics, no libraries.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type WarpCtaProps = {
  title?: string;
  sub?: string;
  cta?: string;
  onClick?: () => void;
  /** false = static starfield (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

export function WarpCta({
  title = "Ready when you are.",
  sub = "Start free. Ship today. Upgrade when it takes off.",
  cta = "Engage →",
  onClick,
  animated = true,
  className = "",
}: WarpCtaProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const target = React.useRef(0.4);
  const [flash, setFlash] = React.useState(0);

  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const size = () => {
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const stars = Array.from({ length: 420 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    const still = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let speed = 0.4;
    let raf = 0;
    const draw = () => {
      speed += (target.current - speed) * 0.04;
      ctx.fillStyle = `rgba(4,4,10,${speed > 3 ? 0.35 : 0.9})`;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      for (const s of stars) {
        const pz = s.z;
        if (!still) s.z -= 0.0025 * speed;
        if (s.z <= 0.01) {
          s.z = 1;
          s.x = (Math.random() - 0.5) * 2;
          s.y = (Math.random() - 0.5) * 2;
          continue;
        }
        const k = 0.5 * Math.max(W, H);
        const x = cx + (s.x / s.z) * k * 0.5;
        const y = cy + (s.y / s.z) * k * 0.5;
        const px = cx + (s.x / pz) * k * 0.5;
        const py = cy + (s.y / pz) * k * 0.5;
        const b = 1 - s.z;
        ctx.strokeStyle = `rgba(${200 + b * 55},${210 + b * 45},255,${b})`;
        ctx.lineWidth = b * 2.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x + (speed < 1.5 ? 0.6 : 0), y);
        ctx.stroke();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [animated]);

  return (
    <section className={`relative isolate grid min-h-[420px] w-full place-items-center overflow-hidden bg-[#04040a] px-6 py-16 text-center ${className}`}>
      <canvas ref={ref} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(4,4,10,.85))]" />
      {flash > 0 && <div key={flash} aria-hidden className="pointer-events-none absolute inset-0 z-20 animate-[gx-wc-flash_.7s_ease-out_forwards] bg-white" />}
      <style>{`@keyframes gx-wc-flash{from{opacity:.95}to{opacity:0}}`}</style>
      <div>
        <h2 className="text-[clamp(2.2rem,6vw,4rem)] font-black tracking-tighter text-white">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-white/60">{sub}</p>
        <button
          type="button"
          onPointerEnter={() => (target.current = 9)}
          onPointerLeave={() => (target.current = 0.4)}
          onFocus={() => (target.current = 9)}
          onBlur={() => (target.current = 0.4)}
          onClick={() => {
            if (animated) setFlash((f) => f + 1);
            onClick?.();
          }}
          className="group relative mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-black text-black shadow-[0_0_40px_rgba(147,197,253,.35)] transition-shadow hover:shadow-[0_0_80px_rgba(147,197,253,.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {cta}
        </button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">hover to warp</p>
      </div>
    </section>
  );
}

export default WarpCta;
