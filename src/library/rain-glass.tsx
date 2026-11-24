"use client";

import * as React from "react";

/**
 * rain-glass — it's raining on your screen. Drops land on the "glass",
 * grow, merge when they touch, and when heavy enough slide down in wobbly
 * paths, eating the small drops below and leaving a wet trail. Each drop
 * has a highlight and a dark rim so it reads as refracting water.
 *
 * Framework-agnostic core (`rainGlass()`) + React wrapper (`<RainGlass />`).
 * Zero dependencies · one canvas · respects prefers-reduced-motion.
 */

export type RainGlassOptions = {
  /** New drops per second (default 40). */
  intensity?: number;
  /** Max drop radius (default 9). */
  maxSize?: number;
  container?: HTMLElement;
  zIndex?: number;
};

type Drop = { x: number; y: number; r: number; vy: number; moving: boolean; wob: number };

export function rainGlass(options: RainGlassOptions = {}) {
  const { intensity = 40, maxSize = 12, container, zIndex = 9993 } = options;
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return { destroy() {} };
  const host = container ?? document.body;
  const fixed = !container;
  const c = document.createElement("canvas");
  c.setAttribute("aria-hidden", "true");
  Object.assign(c.style, { position: fixed ? "fixed" : "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(c);
  const g = c.getContext("2d")!;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0;
  let H = 0;
  const resize = () => {
    W = fixed ? window.innerWidth : host.clientWidth;
    H = fixed ? window.innerHeight : host.clientHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const drops: Drop[] = [];
  const trails: { x: number; y: number; r: number; life: number }[] = [];
  let raf = 0;
  let last = performance.now();
  let acc = 0;

  const drawDrop = (x: number, y: number, r: number) => {
    // body
    const body = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
    body.addColorStop(0, "rgba(255,255,255,.5)");
    body.addColorStop(0.6, "rgba(180,210,255,.12)");
    body.addColorStop(1, "rgba(10,20,40,.6)");
    g.fillStyle = body;
    g.beginPath();
    g.ellipse(x, y, r * 0.92, r, 0, 0, Math.PI * 2);
    g.fill();
    // specular highlight
    g.fillStyle = "rgba(255,255,255,.75)";
    g.beginPath();
    g.ellipse(x - r * 0.3, y - r * 0.45, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
    g.fill();
  };

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    acc += intensity * dt;
    while (acc > 1) {
      acc--;
      drops.push({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.5, vy: 0, moving: false, wob: Math.random() * 6 });
    }
    g.clearRect(0, 0, W, H);
    // trails (wet glass)
    for (let i = trails.length - 1; i >= 0; i--) {
      const tr = trails[i];
      tr.life -= dt * 0.35;
      if (tr.life <= 0) {
        trails.splice(i, 1);
        continue;
      }
      g.fillStyle = `rgba(200,225,255,${0.06 * tr.life})`;
      g.beginPath();
      g.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (!d.moving && d.r > maxSize * 0.62) d.moving = true;
      if (d.moving) {
        d.vy = Math.min(420, d.vy + 600 * dt * (d.r / maxSize));
        d.y += d.vy * dt;
        d.wob += dt * 8;
        d.x += Math.sin(d.wob) * 0.6;
        if (Math.random() < 0.6) trails.push({ x: d.x, y: d.y - d.r, r: d.r * 0.35, life: 1 });
        d.r = Math.max(2, d.r - dt * 0.6);
        // swallow drops in the path
        for (let j = drops.length - 1; j >= 0; j--) {
          if (j === i) continue;
          const o = drops[j];
          if (!o.moving && Math.abs(o.x - d.x) < d.r + o.r && Math.abs(o.y - d.y) < d.r + o.r) {
            d.r = Math.min(maxSize, Math.sqrt(d.r * d.r + o.r * o.r));
            drops.splice(j, 1);
            if (j < i) i--;
          }
        }
        if (d.y - d.r > H) {
          drops.splice(i, 1);
          continue;
        }
      }
      drawDrop(d.x, d.y, d.r);
    }
    // merge resting drops that touch (cheap: random pairs)
    for (let k = 0; k < 30 && drops.length > 1; k++) {
      const a = drops[Math.floor(Math.random() * drops.length)];
      const b = drops[Math.floor(Math.random() * drops.length)];
      if (a !== b && !a.moving && !b.moving && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) {
        a.r = Math.min(maxSize, Math.sqrt(a.r * a.r + b.r * b.r));
        drops.splice(drops.indexOf(b), 1);
      }
    }
    if (drops.length > 900) drops.splice(0, drops.length - 900);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      c.remove();
    },
  };
}

export type RainGlassProps = Omit<RainGlassOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function RainGlass({ fullscreen = false, animated = true, className = "", ...opts }: RainGlassProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const inst = rainGlass({ ...(JSON.parse(key) as RainGlassOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

export default RainGlass;
