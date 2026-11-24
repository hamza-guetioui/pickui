"use client";

import * as React from "react";

/**
 * ghost-walker — cute ghosts that wander your website and flee when the
 * cursor gets close (they get scared: eyes wide, a little shiver). Click one
 * and it goes *poof*, then sneaks back in later. Bring your own shape
 * (SVG markup, emoji or image URL) or use the default ghost.
 *
 * Framework-agnostic core (`ghostWalker()`) + a React wrapper (`<GhostWalker />`).
 * Zero dependencies · respects prefers-reduced-motion.
 */

export type GhostWalkerOptions = {
  /** Number of ghosts (default 3). */
  count?: number;
  /** Ghost size in px (default 46). */
  size?: number;
  /** Speed multiplier (default 1). */
  speed?: number;
  /** Distance at which they flee from the cursor (default 150). */
  fleeRadius?: number;
  /** Custom shape: SVG markup, a single emoji, or an image URL. */
  shape?: string;
  /** Body color of the default ghost. */
  color?: string;
  /** Click to poof (default true). */
  clickable?: boolean;
  /** Element to haunt (default: the whole page, fixed). */
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-ghost-walker-style";
const CSS = `
.gxg{position:absolute;left:0;top:0;will-change:transform;user-select:none;-webkit-user-select:none}
.gxg-in{display:block;animation:gxg-bob 2.2s ease-in-out infinite}
.gxg[data-scared] .gxg-in{animation:gxg-shiver .12s linear infinite}
.gxg-eye{transition:transform .15s}
.gxg[data-scared] .gxg-eye{transform:scale(1.5)}
.gxg[data-poof]{transition:opacity .4s,transform .4s;opacity:0!important}
@keyframes gxg-bob{50%{transform:translateY(-6px)}}
@keyframes gxg-shiver{25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}
@media (prefers-reduced-motion:reduce){.gxg-in{animation:none!important}}
`;

function defaultGhost(color: string) {
  return `<svg viewBox="0 0 60 70" width="100%" height="100%" aria-hidden="true">
  <path d="M30 2C15 2 5 13 5 28v38l7-6 6 6 6-6 6 6 6-6 6 6 6-6 7 6V28C55 13 45 2 30 2z" fill="${color}"/>
  <path d="M30 2C15 2 5 13 5 28v38l7-6 6 6 6-6 6 6 6-6 6 6 6-6 7 6V28C55 13 45 2 30 2z" fill="url(#gxg-shade)" opacity=".35"/>
  <defs><radialGradient id="gxg-shade" cx=".7" cy=".8" r=".9"><stop offset="0" stop-color="#7c6fb0"/><stop offset="1" stop-color="#7c6fb0" stop-opacity="0"/></radialGradient></defs>
  <g class="gxg-eye" style="transform-origin:22px 28px"><ellipse cx="22" cy="28" rx="4" ry="5.5" fill="#1e1b4b"/><circle cx="23.2" cy="26" r="1.4" fill="#fff"/></g>
  <g class="gxg-eye" style="transform-origin:38px 28px"><ellipse cx="38" cy="28" rx="4" ry="5.5" fill="#1e1b4b"/><circle cx="39.2" cy="26" r="1.4" fill="#fff"/></g>
  <ellipse cx="16" cy="37" rx="4" ry="2.5" fill="#f9a8d4" opacity=".7"/><ellipse cx="44" cy="37" rx="4" ry="2.5" fill="#f9a8d4" opacity=".7"/>
  <path d="M26 38q4 4 8 0" stroke="#1e1b4b" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
}

function renderShape(shape: string | undefined, color: string) {
  if (!shape) return defaultGhost(color);
  if (shape.trim().startsWith("<")) return shape;
  if (/^(https?:|\/|data:)/.test(shape)) return `<img src="${shape}" alt="" width="100%" height="100%" style="object-fit:contain" draggable="false">`;
  return `<span style="display:grid;place-items:center;width:100%;height:100%;font-size:100%">${shape}</span>`;
}

/** Start the haunting. Returns a handle with destroy(). */
export function ghostWalker(options: GhostWalkerOptions = {}) {
  const { count = 3, size = 46, speed = 1, fleeRadius = 150, shape, color = "#f5f3ff", clickable = true, container, zIndex = 9999 } = options;
  if (typeof window === "undefined") return { destroy() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  const host = container ?? document.body;
  const fixed = !container;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: fixed ? "fixed" : "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: String(zIndex) });
  host.appendChild(layer);

  const bounds = () => (fixed ? { w: window.innerWidth, h: window.innerHeight, x: 0, y: 0 } : (() => {
    const r = host.getBoundingClientRect();
    return { w: r.width, h: r.height, x: r.left, y: r.top };
  })());

  const mouse = { x: -9999, y: -9999 };
  const onMove = (e: PointerEvent) => {
    const b = bounds();
    mouse.x = e.clientX - b.x;
    mouse.y = e.clientY - b.y;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  type G = { el: HTMLDivElement; x: number; y: number; vx: number; vy: number; tx: number; ty: number; gone: number };
  const b0 = bounds();
  const ghosts: G[] = Array.from({ length: count }, () => {
    const el = document.createElement("div");
    el.className = "gxg";
    el.style.width = `${size}px`;
    el.style.height = `${size * 1.15}px`;
    el.style.pointerEvents = clickable ? "auto" : "none";
    el.style.cursor = clickable ? "pointer" : "default";
    el.innerHTML = `<span class="gxg-in" style="width:100%;height:100%">${renderShape(shape, color)}</span>`;
    layer.appendChild(el);
    const g: G = { el, x: Math.random() * b0.w, y: Math.random() * b0.h, vx: 0, vy: 0, tx: Math.random() * b0.w, ty: Math.random() * b0.h, gone: 0 };
    if (clickable)
      el.addEventListener("click", () => {
        el.dataset.poof = "";
        g.gone = 4 + Math.random() * 4;
      });
    return g;
  });

  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const b = bounds();
    for (const g of ghosts) {
      if (g.gone > 0) {
        g.gone -= dt;
        if (g.gone <= 0) {
          // sneak back in from an edge
          g.x = Math.random() < 0.5 ? -size : b.w + size;
          g.y = Math.random() * b.h;
          delete g.el.dataset.poof;
        }
        continue;
      }
      const dx = g.x - mouse.x;
      const dy = g.y - mouse.y;
      const d = Math.hypot(dx, dy);
      const scared = d < fleeRadius;
      if (scared) {
        const f = (1 - d / fleeRadius) * 2600 * speed;
        g.vx += (dx / (d || 1)) * f * dt;
        g.vy += (dy / (d || 1)) * f * dt;
        g.el.dataset.scared = "";
      } else {
        delete g.el.dataset.scared;
        if (Math.hypot(g.tx - g.x, g.ty - g.y) < 30 || Math.random() < 0.003) {
          g.tx = size + Math.random() * (b.w - size * 2);
          g.ty = size + Math.random() * (b.h - size * 2);
        }
        g.vx += (g.tx - g.x) * 0.6 * speed * dt;
        g.vy += (g.ty - g.y) * 0.6 * speed * dt;
      }
      const max = (scared ? 520 : 70) * speed;
      const v = Math.hypot(g.vx, g.vy);
      if (v > max) {
        g.vx *= max / v;
        g.vy *= max / v;
      }
      g.vx *= 0.985;
      g.vy *= 0.985;
      g.x = Math.max(size / 2, Math.min(b.w - size / 2, g.x + g.vx * dt));
      g.y = Math.max(size / 2, Math.min(b.h - size / 2, g.y + g.vy * dt));
      const flip = g.vx < -2 ? -1 : 1;
      g.el.style.transform = `translate(${g.x - size / 2}px, ${g.y - size / 2}px) scaleX(${flip}) rotate(${Math.max(-14, Math.min(14, g.vx * 0.05))}deg)`;
      g.el.style.opacity = scared ? "1" : "0.92";
    }
    raf = requestAnimationFrame(loop);
  };
  if (reduced) {
    ghosts.forEach((g) => (g.el.style.transform = `translate(${g.x - size / 2}px, ${g.y - size / 2}px)`));
  } else raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      layer.remove();
    },
  };
}

export type GhostWalkerProps = Omit<GhostWalkerOptions, "container"> & {
  /** Haunt the whole page (fixed) instead of the parent box. */
  fullscreen?: boolean;
  /** false = disabled (the "regular" version shows nothing). Default true. */
  animated?: boolean;
  className?: string;
};

/** React wrapper: haunts its positioned parent (or the whole page with `fullscreen`). */
export function GhostWalker({ fullscreen = false, animated = true, className = "", ...opts }: GhostWalkerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const inst = ghostWalker({ ...(JSON.parse(key) as GhostWalkerOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

export default GhostWalker;
