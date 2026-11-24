"use client";

import * as React from "react";

/**
 * page-gravity — turn gravity on for your website. Elements detach from
 * the layout, fall, bounce, stack on each other and on the floor; grab and
 * throw them around; then `reset()` flies everything back into place.
 * Perfect easter egg (bind it to a secret key) or a 404 page.
 *
 * Framework-agnostic core (`pageGravity()`) + React wrapper (`<PageGravity />`).
 * Zero dependencies · tiny AABB physics · respects prefers-reduced-motion.
 */

export type PageGravityOptions = {
  /** Elements that fall (default "[data-gravity]"). */
  selector?: string;
  /** Gravity in px/s² (default 2200). */
  gravity?: number;
  /** Bounciness 0–1 (default 0.35). */
  bounce?: number;
  /** Scope (default: document). Also the floor/walls when set. */
  container?: HTMLElement;
};

type Body = { el: HTMLElement; x: number; y: number; w: number; h: number; vx: number; vy: number; ox: number; oy: number; rot: number; prev: string };

export function pageGravity(options: PageGravityOptions = {}) {
  const { selector = "[data-gravity]", gravity = 2200, bounce = 0.35, container } = options;
  let bodies: Body[] = [];
  let raf = 0;
  let running = false;
  let grab: { b: Body; dx: number; dy: number; lx: number; ly: number; lt: number } | null = null;
  const scope: ParentNode = container ?? document;

  const area = () => {
    if (container) {
      const r = container.getBoundingClientRect();
      return { left: r.left, top: r.top, w: r.width, h: r.height };
    }
    return { left: 0, top: 0, w: window.innerWidth, h: window.innerHeight };
  };

  const onDown = (e: PointerEvent) => {
    const b = bodies.find((x) => x.el === e.currentTarget);
    if (!b) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const a = area();
    grab = { b, dx: e.clientX - a.left - b.x, dy: e.clientY - a.top - b.y, lx: e.clientX, ly: e.clientY, lt: performance.now() };
  };
  const onMove = (e: PointerEvent) => {
    if (!grab) return;
    const a = area();
    const now = performance.now();
    const dt = Math.max(1, now - grab.lt) / 1000;
    grab.b.vx = (e.clientX - grab.lx) / dt;
    grab.b.vy = (e.clientY - grab.ly) / dt;
    grab.b.x = e.clientX - a.left - grab.dx;
    grab.b.y = e.clientY - a.top - grab.dy;
    grab.lx = e.clientX;
    grab.ly = e.clientY;
    grab.lt = now;
  };
  const onUp = () => (grab = null);

  const step = (dt: number) => {
    const a = area();
    for (const b of bodies) {
      if (grab?.b === b) continue;
      b.vy += gravity * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= 0.995;
      if (b.y + b.h > a.h) {
        b.y = a.h - b.h;
        b.vy = -b.vy * bounce;
        b.vx *= 0.8;
        if (Math.abs(b.vy) < 40) b.vy = 0;
      }
      if (b.x < 0) {
        b.x = 0;
        b.vx = -b.vx * bounce;
      }
      if (b.x + b.w > a.w) {
        b.x = a.w - b.w;
        b.vx = -b.vx * bounce;
      }
      b.rot += (b.vx * 0.02 - b.rot) * 0.1;
    }
    // stack: resolve overlaps (vertical first — things rest on each other)
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const p = bodies[i];
        const q = bodies[j];
        const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
        const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
        if (ox <= 0 || oy <= 0) continue;
        if (oy < ox) {
          const top = p.y < q.y ? p : q;
          if (grab?.b !== top) top.y -= oy;
          if (top.vy > 0) top.vy = -top.vy * bounce * 0.5;
          top.vx *= 0.9;
        } else {
          const [l, r] = p.x < q.x ? [p, q] : [q, p];
          if (grab?.b !== l) l.x -= ox / 2;
          if (grab?.b !== r) r.x += ox / 2;
          l.vx = -Math.abs(l.vx) * bounce;
          r.vx = Math.abs(r.vx) * bounce;
        }
      }
    for (const b of bodies) b.el.style.transform = `translate(${b.x - b.ox}px, ${b.y - b.oy}px) rotate(${b.rot}deg)`;
  };

  const start = () => {
    if (running || typeof window === "undefined") return;
    running = true;
    const a = area();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bodies = [...scope.querySelectorAll<HTMLElement>(selector)].map((el) => {
      const r = el.getBoundingClientRect();
      const b: Body = { el, x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 300, ox: r.left - a.left, oy: r.top - a.top, rot: 0, prev: el.style.cssText };
      el.style.transition = "none";
      el.style.willChange = "transform";
      el.style.position = el.style.position || "relative";
      el.style.zIndex = "50";
      el.style.cursor = "grab";
      el.style.touchAction = "none";
      el.addEventListener("pointerdown", onDown);
      return b;
    });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      step(reduced ? 0.016 : dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    running = false;
  };

  /** Fly everything back home. */
  const reset = () => {
    stop();
    bodies.forEach((b, i) => {
      b.el.removeEventListener("pointerdown", onDown);
      b.el.style.transition = `transform .8s cubic-bezier(.3,1.3,.5,1) ${i * 30}ms`;
      b.el.style.transform = "";
      window.setTimeout(() => (b.el.style.cssText = b.prev), 900 + i * 30);
    });
    bodies = [];
  };

  return { start, reset, destroy: reset, get running() {
    return running;
  } };
}

export type PageGravityProps = Omit<PageGravityOptions, "container"> & {
  /** Scope to the parent element (default true) or the whole page. */
  scoped?: boolean;
  animated?: boolean;
  className?: string;
};

/** React wrapper: renders a toggle button ("Gravity on / Restore"). */
export function PageGravity({ scoped = true, animated = true, className = "", ...opts }: PageGravityProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const inst = React.useRef<ReturnType<typeof pageGravity> | null>(null);
  const [on, setOn] = React.useState(false);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const host = scoped ? ref.current?.parentElement ?? undefined : undefined;
    inst.current = pageGravity({ ...(JSON.parse(key) as PageGravityOptions), container: host });
    return () => inst.current?.destroy();
  }, [scoped, key]);
  return (
    <button
      ref={ref}
      type="button"
      disabled={!animated}
      onClick={() => {
        if (on) inst.current?.reset();
        else inst.current?.start();
        setOn(!on);
      }}
      className={`absolute right-3 top-3 z-[60] rounded-full px-4 py-2 text-xs font-bold shadow-lg transition ${on ? "bg-white text-black" : "bg-rose-500 text-white"} disabled:opacity-50 ${className}`}
    >
      {on ? "↺ Restore page" : "⬇ Gravity on"}
    </button>
  );
}

export default PageGravity;
