"use client";

import * as React from "react";

/**
 * StackTower — the hyper-casual stacking game in isometric 3D (pure canvas):
 * a slab slides back and forth, tap to drop it; whatever overhangs gets
 * sliced off and falls away; perfect drops grow a combo and a ring pulse.
 * The camera rises with the tower and the colors drift through a gradient.
 * Game · zero dependencies.
 */

export type StackTowerProps = {
  /** localStorage key for the high score (null disables). */
  storageKey?: string | null;
  /** false = no falling pieces / camera ease (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

type Slab = { x: number; z: number; w: number; d: number; hue: number };
type Debris = { x: number; z: number; w: number; d: number; y: number; vy: number; hue: number };

const H = 18; // slab height (world units)

export function StackTower({ storageKey = "gx-stack-best", animated = true, className = "" }: StackTowerProps) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const game = React.useRef({
    stack: [{ x: 0, z: 0, w: 120, d: 120, hue: 200 }] as Slab[],
    mover: null as (Slab & { axis: "x" | "z"; dir: number; speed: number }) | null,
    debris: [] as Debris[],
    cam: 0,
    combo: 0,
    pulse: 0,
    over: false,
  });
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [over, setOver] = React.useState(false);

  React.useEffect(() => {
    if (storageKey) setBest(Number(localStorage.getItem(storageKey)) || 0);
  }, [storageKey]);

  const spawn = React.useCallback(() => {
    const g = game.current;
    const top = g.stack[g.stack.length - 1];
    const axis: "x" | "z" = g.stack.length % 2 ? "x" : "z";
    g.mover = { ...top, hue: (top.hue + 9) % 360, axis, dir: 1, speed: 140 + g.stack.length * 4, [axis]: -160 } as typeof g.mover;
  }, []);

  const reset = React.useCallback(() => {
    const g = game.current;
    g.stack = [{ x: 0, z: 0, w: 120, d: 120, hue: 200 }];
    g.debris = [];
    g.cam = 0;
    g.combo = 0;
    g.over = false;
    setScore(0);
    setOver(false);
    spawn();
  }, [spawn]);

  const drop = React.useCallback(() => {
    const g = game.current;
    if (g.over) return reset();
    const m = g.mover;
    if (!m) return;
    const top = g.stack[g.stack.length - 1];
    const ax = m.axis;
    const size = ax === "x" ? "w" : "d";
    let delta = m[ax] - top[ax];
    if (Math.abs(delta) < 4) {
      delta = 0; // perfect
      m[ax] = top[ax];
      g.combo++;
      g.pulse = 1;
    } else g.combo = 0;
    const overlap = top[size] - Math.abs(delta);
    if (overlap <= 0) {
      g.debris.push({ ...m, y: g.stack.length * H, vy: 0 });
      g.mover = null;
      g.over = true;
      setOver(true);
      setBest((b) => {
        const nb = Math.max(b, g.stack.length - 1);
        if (storageKey) localStorage.setItem(storageKey, String(nb));
        return nb;
      });
      return;
    }
    const placed: Slab = { ...m, [size]: overlap, [ax]: top[ax] + delta / 2 } as Slab;
    if (delta !== 0) {
      const cut = Math.abs(delta);
      const cutPos = delta > 0 ? placed[ax] + overlap / 2 + cut / 2 : placed[ax] - overlap / 2 - cut / 2;
      g.debris.push({ ...m, [size]: cut, [ax]: cutPos, y: g.stack.length * H, vy: 0 } as Debris);
    } else if (g.combo >= 3) {
      // reward: perfect streak grows the slab back a little
      placed[size] = Math.min(120, placed[size] + 8);
    }
    g.stack.push(placed);
    setScore(g.stack.length - 1);
    spawn();
  }, [reset, spawn, storageKey]);

  React.useEffect(() => {
    spawn();
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    const iso = (x: number, y: number, z: number) => [(x - z) * 0.866, (x + z) * 0.5 - y] as const;
    const box = (s: { x: number; z: number; w: number; d: number; hue: number }, y: number, ox: number, oy: number, alpha = 1) => {
      const x0 = s.x - s.w / 2;
      const x1 = s.x + s.w / 2;
      const z0 = s.z - s.d / 2;
      const z1 = s.z + s.d / 2;
      const P = (x: number, yy: number, z: number) => {
        const [a, b] = iso(x, yy, z);
        return [ox + a, oy + b] as const;
      };
      ctx.globalAlpha = alpha;
      const faces: [readonly (readonly [number, number])[], number][] = [
        [[P(x0, y + H, z0), P(x1, y + H, z0), P(x1, y + H, z1), P(x0, y + H, z1)], 62],
        [[P(x0, y, z1), P(x1, y, z1), P(x1, y + H, z1), P(x0, y + H, z1)], 46],
        [[P(x1, y, z0), P(x1, y, z1), P(x1, y + H, z1), P(x1, y + H, z0)], 36],
      ];
      for (const [pts, l] of faces) {
        ctx.fillStyle = `hsl(${s.hue} 70% ${l}%)`;
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const g = game.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth;
      const Hh = c.clientHeight;
      if (c.width !== W * dpr) {
        c.width = W * dpr;
        c.height = Hh * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hue = g.stack[g.stack.length - 1].hue;
      const bg = ctx.createLinearGradient(0, 0, 0, Hh);
      bg.addColorStop(0, `hsl(${hue + 30} 40% 14%)`);
      bg.addColorStop(1, `hsl(${hue} 45% 6%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, Hh);

      const targetCam = Math.max(0, g.stack.length * H - Hh * 0.35);
      g.cam += (targetCam - g.cam) * (animated ? 0.08 : 1);
      const ox = W / 2;
      const oy = Hh * 0.62 + g.cam;

      if (g.mover && !g.over) {
        const m = g.mover;
        m[m.axis] += m.dir * m.speed * dt;
        if (Math.abs(m[m.axis]) > 160) m.dir *= -1;
      }
      g.stack.forEach((s, i) => box(s, i * H, ox, oy));
      if (g.mover && !g.over) box(g.mover, g.stack.length * H, ox, oy);
      g.debris = g.debris.filter((d) => {
        if (animated) {
          d.vy -= 900 * dt;
          d.y += d.vy * dt;
        } else d.y = -9999;
        box(d, d.y, ox, oy, Math.max(0, 1 + d.y / 400));
        return d.y > -600;
      });
      if (g.pulse > 0 && animated) {
        const top = g.stack[g.stack.length - 1];
        const [px, py] = iso(top.x, g.stack.length * H, top.z);
        ctx.strokeStyle = `rgba(255,255,255,${g.pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(ox + px, oy + py, (top.w * (1.6 - g.pulse * 0.6)) / 1.1, (top.d * (1.6 - g.pulse * 0.6)) / 2.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        g.pulse -= dt * 2;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animated, spawn]);

  return (
    <div className={`relative h-full min-h-[460px] w-full select-none overflow-hidden ${className}`}>
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full cursor-pointer touch-none"
        role="img"
        aria-label={`Stack tower game. Score ${score}.`}
        onPointerDown={(e) => {
          e.preventDefault();
          drop();
        }}
      />
      <button type="button" onClick={drop} className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:bg-white focus:px-2 focus:text-black">
        Drop slab
      </button>
      <div className="pointer-events-none absolute inset-x-0 top-6 text-center">
        <p className="text-6xl font-black tabular-nums text-white drop-shadow-lg" aria-live="polite">
          {score}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">best {best}</p>
        {game.current.combo >= 2 && !over && <p className="mt-1 font-mono text-xs text-amber-300">perfect ×{game.current.combo}</p>}
      </div>
      {over && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 text-center">
          <p className="text-2xl font-black text-white">Tower fell!</p>
          <p className="font-mono text-xs text-white/60">tap to play again</p>
        </div>
      )}
      {score === 0 && !over && <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center font-mono text-xs text-white/60">tap / Space to drop · line it up perfectly</p>}
    </div>
  );
}

export default StackTower;
