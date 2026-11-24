"use client";

import * as React from "react";

/**
 * snow-pile — snow that actually SETTLES on your website. Flakes drift
 * down with wind and wobble; when they hit the top edge of a heading, a
 * button, an image (any selector) they stay there and build a soft, bumpy
 * pile. Hover an element to brush its snow off — it falls as powder.
 *
 * Framework-agnostic core (`snowPile()`) + React wrapper (`<SnowPile />`).
 * Zero dependencies · one canvas · respects prefers-reduced-motion.
 */

export type SnowPileOptions = {
  /** Elements snow settles on (default "h1, h2, h3, button, img, [data-snow]"). */
  selector?: string;
  /** Flakes alive at once (default 160). */
  density?: number;
  /** Max pile height in px (default 18). */
  maxPile?: number;
  /** Horizontal wind (-1..1, default 0.2). */
  wind?: number;
  color?: string;
  container?: HTMLElement;
  zIndex?: number;
};

export function snowPile(options: SnowPileOptions = {}) {
  const { selector = "h1, h2, h3, button, img, [data-snow]", density = 160, maxPile = 18, wind = 0.2, color = "255,255,255", container, zIndex = 9996 } = options;
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return { destroy() {} };
  const host = container ?? document.body;
  const fixed = !container;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: fixed ? "fixed" : "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0;
  let H = 0;
  const resize = () => {
    W = fixed ? window.innerWidth : host.clientWidth;
    H = fixed ? window.innerHeight : host.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const COL = 4; // px per pile column
  const piles = new Map<Element, number[]>();
  const flakes = Array.from({ length: density }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4, s: 20 + Math.random() * 40, ph: Math.random() * 6 }));
  const powder: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  const mouse = { x: -1, y: -1 };
  const onMove = (e: PointerEvent) => {
    const r = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let raf = 0;
  let last = performance.now();
  let t = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    const origin = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
    const targets = [...host.querySelectorAll(selector)]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
      })
      .filter((b) => b.w > 20 && b.y > 0 && b.y < H);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = `rgba(${color},.95)`;

    // piles
    for (const b of targets) {
      let pile = piles.get(b.el);
      const cols = Math.max(1, Math.round(b.w / COL));
      if (!pile || pile.length !== cols) {
        pile = new Array(cols).fill(0);
        piles.set(b.el, pile);
      }
      const hovered = mouse.x > b.x && mouse.x < b.x + b.w && mouse.y > b.y - maxPile && mouse.y < b.y + b.h;
      if (hovered) {
        for (let i = 0; i < pile.length; i++) {
          if (pile[i] > 0.5 && Math.random() < 0.3) {
            powder.push({ x: b.x + i * COL, y: b.y - pile[i], vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 40, life: 1 });
            pile[i] = Math.max(0, pile[i] - 2);
          }
        }
      }
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      for (let i = 0; i < pile.length; i++) {
        // smooth neighbours so it looks like soft snow
        const h = (pile[i - 1] ?? pile[i]) * 0.25 + pile[i] * 0.5 + (pile[i + 1] ?? pile[i]) * 0.25;
        ctx.lineTo(b.x + i * COL + COL / 2, b.y - h);
      }
      ctx.lineTo(b.x + b.w, b.y);
      ctx.closePath();
      ctx.fill();
    }

    // flakes
    for (const f of flakes) {
      f.y += f.s * dt;
      f.x += (Math.sin(t + f.ph) * 12 + wind * 40) * dt;
      let landed = false;
      for (const b of targets) {
        if (f.x > b.x && f.x < b.x + b.w) {
          const pile = piles.get(b.el)!;
          const i = Math.min(pile.length - 1, Math.floor((f.x - b.x) / COL));
          const top = b.y - pile[i];
          if (f.y >= top - 1 && f.y <= top + 6) {
            // edges hold less snow
            const edge = Math.min(i, pile.length - 1 - i);
            const cap = maxPile * Math.min(1, edge / 4 + 0.2);
            if (pile[i] < cap) pile[i] += f.r * 0.45;
            landed = true;
            break;
          }
        }
      }
      if (landed || f.y > H + 5) {
        f.y = -5;
        f.x = Math.random() * W;
      }
      if (f.x > W + 5) f.x = -5;
      if (f.x < -5) f.x = W + 5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // powder from brushing
    for (let i = powder.length - 1; i >= 0; i--) {
      const p = powder[i];
      p.vy += 300 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.2;
      if (p.life <= 0) {
        powder.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      canvas.remove();
    },
  };
}

export type SnowPileProps = Omit<SnowPileOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

/** React wrapper: snows inside its positioned parent (or the page with `fullscreen`). */
export function SnowPile({ fullscreen = false, animated = true, className = "", ...opts }: SnowPileProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const host = fullscreen ? undefined : ref.current?.parentElement ?? undefined;
    const inst = snowPile({ ...(JSON.parse(key) as SnowPileOptions), container: host });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <span ref={ref} hidden className={className} />;
}

export default SnowPile;
