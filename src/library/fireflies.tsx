"use client";

import * as React from "react";

/**
 * fireflies — a summer-night decoration: glowing fireflies drift on smooth
 * noise paths, each blinking with its own rhythm (and sometimes in sync
 * with its neighbours, like real fireflies). They're curious: they drift
 * toward your cursor and scatter when you move fast.
 *
 * Framework-agnostic core (`fireflies()`) + React wrapper (`<Fireflies />`).
 * Zero dependencies · one canvas · respects prefers-reduced-motion.
 */

export type FirefliesOptions = {
  count?: number;
  /** Glow color as "r,g,b" (default warm yellow-green). */
  color?: string;
  /** Glow size multiplier (default 1). */
  size?: number;
  container?: HTMLElement;
  zIndex?: number;
};

export function fireflies(options: FirefliesOptions = {}) {
  const { count = 40, color = "214,255,120", size = 1, container, zIndex = 9994 } = options;
  if (typeof window === "undefined") return { destroy() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = container ?? document.body;
  const fixed = !container;
  const c = document.createElement("canvas");
  c.setAttribute("aria-hidden", "true");
  Object.assign(c.style, { position: fixed ? "fixed" : "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: String(zIndex), mixBlendMode: "screen" });
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
  const flies = Array.from({ length: count }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, a: Math.random() * 6.28, ph: Math.random() * 6.28, f: 0.6 + Math.random() * 0.9, r: (1.5 + Math.random() * 1.5) * size, i }));
  const mouse = { x: -999, y: -999, v: 0 };
  const onMove = (e: PointerEvent) => {
    const r = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
    const nx = e.clientX - r.left;
    const ny = e.clientY - r.top;
    mouse.v = Math.hypot(nx - mouse.x, ny - mouse.y);
    mouse.x = nx;
    mouse.y = ny;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let raf = 0;
  let t = 0;
  const draw = () => {
    t += 0.016;
    g.clearRect(0, 0, W, H);
    mouse.v *= 0.9;
    for (const f of flies) {
      if (!reduced) {
        f.a += Math.sin(t * 0.7 + f.i) * 0.04;
        let vx = Math.cos(f.a) * 0.45;
        let vy = Math.sin(f.a) * 0.35 - 0.05;
        const dx = mouse.x - f.x;
        const dy = mouse.y - f.y;
        const d = Math.hypot(dx, dy);
        if (d < 220) {
          const k = mouse.v > 18 ? -2.4 : 0.35; // fast cursor scares them
          vx += (dx / d) * k;
          vy += (dy / d) * k;
        }
        f.x = (f.x + vx + W) % W;
        f.y = (f.y + vy + H) % H;
      }
      // blink: mostly dim, short bright pulses; neighbours share a phase bucket → occasional sync
      const phase = t * f.f + f.ph + (f.i % 4) * 0.3;
      const glow = reduced ? 0.7 : Math.pow(Math.max(0, Math.sin(phase)), 6);
      const R = f.r * (6 + glow * 10);
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
      grad.addColorStop(0, `rgba(${color},${0.25 + glow * 0.75})`);
      grad.addColorStop(0.25, `rgba(${color},${0.08 + glow * 0.3})`);
      grad.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(f.x, f.y, R, 0, Math.PI * 2);
      g.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      c.remove();
    },
  };
}

export type FirefliesProps = Omit<FirefliesOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function Fireflies({ fullscreen = false, animated = true, className = "", ...opts }: FirefliesProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const inst = fireflies({ ...(JSON.parse(key) as FirefliesOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

export default Fireflies;
