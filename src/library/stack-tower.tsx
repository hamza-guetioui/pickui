"use client";

import * as React from "react";

/**
 * StackTower — the stacking game, reimagined as a climb to orbit. A glass
 * slab slides back and forth; tap to drop it. Whatever overhangs is sliced
 * off and falls; a ghost outline shows where the slab below is. Perfect drops
 * chain a combo (rings, sparks, rising chimes) and a 3-streak grows the slab
 * back. As the tower rises the sky travels with you — dusk city, clouds,
 * stratosphere, then orbit — with altitude milestones every 10 floors. When
 * the tower falls, the camera pulls back to show everything you built.
 * Game · zero dependencies · Space / Enter / tap · optional sound.
 */

export type StackTowerProps = {
  /** localStorage key for the high score (null disables). */
  storageKey?: string | null;
  /** Start with sound on (it can be toggled in the corner). Default false. */
  sound?: boolean;
  /** false = no falling pieces / camera ease / particles (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

type Slab = { x: number; z: number; w: number; d: number; hue: number };
type Debris = Slab & { y: number; vy: number; vx: number; vz: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; hue: number };
type Float = { text: string; y: number; life: number; color: string };

const H = 16; // slab height (world units)
const BASE = 120;
const RANGE = 170;
const ZONES = [
  { at: 0, name: "City", top: [250, 45, 18], bottom: [20, 55, 10] },
  { at: 10, name: "Clouds", top: [205, 70, 42], bottom: [330, 60, 62] },
  { at: 20, name: "Stratosphere", top: [255, 60, 14], bottom: [220, 70, 32] },
  { at: 35, name: "Orbit", top: [250, 50, 3], bottom: [265, 60, 9] },
] as const;

const mix = (a: readonly number[], b: readonly number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const hsl = ([h, s, l]: number[], a = 1) => `hsla(${h} ${s}% ${l}% / ${a})`;

/** Sky colours for a (fractional) floor, blended between zones. */
function skyAt(floor: number) {
  let i = 0;
  while (i < ZONES.length - 1 && floor >= ZONES[i + 1].at) i++;
  const z = ZONES[i];
  const n = ZONES[i + 1];
  const k = n ? Math.max(0, Math.min(1, (floor - (n.at - 4)) / 4)) : 0;
  return { top: n ? mix(z.top, n.top, k) : [...z.top], bottom: n ? mix(z.bottom, n.bottom, k) : [...z.bottom], zone: z.name };
}

export function StackTower({ storageKey = "pickui-stack-best", sound = false, animated = true, className = "" }: StackTowerProps) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const game = React.useRef({
    stack: [{ x: 0, z: 0, w: BASE, d: BASE, hue: 330 }] as Slab[],
    mover: null as (Slab & { axis: "x" | "z"; dir: number; speed: number }) | null,
    debris: [] as Debris[],
    sparks: [] as Spark[],
    floats: [] as Float[],
    cam: 0,
    zoom: 1,
    combo: 0,
    pulse: 0,
    flash: 0,
    banner: { text: "", life: 0 },
    over: false,
    started: false,
  });
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [over, setOver] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [zone, setZone] = React.useState("City");
  const [muted, setMuted] = React.useState(!sound);
  const audio = React.useRef<AudioContext | null>(null);
  const motion = React.useRef(animated);

  React.useEffect(() => {
    motion.current = animated && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!storageKey) return;
    try {
      setBest(Number(localStorage.getItem(storageKey)) || 0);
    } catch {}
  }, [storageKey, animated]);

  const tone = React.useCallback(
    (freq: number, dur = 0.12, type: OscillatorType = "sine", gain = 0.06) => {
      if (muted) return;
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ac = (audio.current ??= new Ctx());
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(gain, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
        o.connect(g).connect(ac.destination);
        o.start();
        o.stop(ac.currentTime + dur);
      } catch {}
    },
    [muted],
  );

  const spawn = React.useCallback(() => {
    const g = game.current;
    const top = g.stack[g.stack.length - 1];
    const axis: "x" | "z" = g.stack.length % 2 ? "x" : "z";
    const n = g.stack.length;
    const from = Math.random() < 0.5 ? -1 : 1; // enter from a side, moving toward the tower
    g.mover = { ...top, hue: (top.hue + 7) % 360, axis, dir: -from, speed: Math.min(330, 130 + n * 5), [axis]: top[axis] + from * RANGE } as typeof g.mover;
  }, []);

  const reset = React.useCallback(() => {
    const g = game.current;
    g.stack = [{ x: 0, z: 0, w: BASE, d: BASE, hue: 330 }];
    g.debris = [];
    g.sparks = [];
    g.floats = [];
    g.combo = 0;
    g.over = false;
    g.started = true;
    g.banner = { text: "", life: 0 };
    setScore(0);
    setCombo(0);
    setZone("City");
    setOver(false);
    spawn();
  }, [spawn]);

  const drop = React.useCallback(() => {
    const g = game.current;
    if (g.over) return reset();
    g.started = true;
    const m = g.mover;
    if (!m) return;
    const top = g.stack[g.stack.length - 1];
    const ax = m.axis;
    const size = ax === "x" ? "w" : "d";
    const y = g.stack.length * H;
    let delta = m[ax] - top[ax];
    const perfect = Math.abs(delta) < 4;
    if (perfect) {
      delta = 0;
      m[ax] = top[ax];
      g.combo++;
      g.pulse = 1;
      // the rising chime: a pentatonic step per combo
      const steps = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      tone(440 * Math.pow(2, steps[Math.min(g.combo - 1, steps.length - 1)] / 12), 0.25, "triangle", 0.07);
      navigator.vibrate?.(18);
      if (motion.current) {
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          g.sparks.push({ x: top.x + Math.cos(a) * top.w * 0.55, y: y + H, vx: Math.cos(a) * 60, vy: 40 + Math.random() * 60, life: 0.7, hue: m.hue });
        }
        g.floats.push({ text: g.combo > 1 ? `PERFECT ×${g.combo}` : "PERFECT", y: y + H * 3, life: 1, color: "#ffd666" });
      }
    } else {
      g.combo = 0;
      tone(180 + Math.min(g.stack.length, 40) * 6, 0.08, "square", 0.03);
      navigator.vibrate?.(8);
    }
    setCombo(g.combo);
    const overlap = top[size] - Math.abs(delta);
    if (overlap <= 0) {
      g.debris.push({ ...m, y, vy: 0, vx: 0, vz: 0 });
      g.mover = null;
      g.over = true;
      tone(110, 0.5, "sawtooth", 0.05);
      navigator.vibrate?.([30, 40, 60]);
      setOver(true);
      setBest((b) => {
        const nb = Math.max(b, g.stack.length - 1);
        if (storageKey && nb > b) {
          try {
            localStorage.setItem(storageKey, String(nb));
          } catch {}
        }
        return nb;
      });
      return;
    }
    const placed: Slab = { ...m, [size]: overlap, [ax]: top[ax] + delta / 2 } as Slab;
    if (delta !== 0) {
      const cut = Math.abs(delta);
      const side = delta > 0 ? 1 : -1;
      const cutPos = placed[ax] + side * (overlap / 2 + cut / 2);
      g.debris.push({ ...m, [size]: cut, [ax]: cutPos, y, vy: 60, vx: ax === "x" ? side * 40 : 0, vz: ax === "z" ? side * 40 : 0 } as Debris);
      g.flash = 1;
    } else if (g.combo >= 3) {
      placed[size] = Math.min(BASE, placed[size] + 10); // streak reward: grow back
      if (motion.current) g.floats.push({ text: "+ GROW", y: y + H * 1.5, life: 1, color: "#a3e635" });
    }
    g.stack.push(placed);
    const floors = g.stack.length - 1;
    setScore(floors);
    const z = skyAt(floors).zone;
    setZone(z);
    if (floors % 10 === 0) {
      g.banner = { text: `${floors * 3} m · ${z.toUpperCase()}`, life: 1 };
      tone(660, 0.4, "sine", 0.05);
    }
    spawn();
  }, [reset, spawn, storageKey, tone]);

  React.useEffect(() => {
    spawn();
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const iso = (x: number, y: number, z: number) => [(x - z) * 0.866, (x + z) * 0.5 - y] as const;

    const box = (s: Slab, y: number, ox: number, oy: number, alpha = 1, glass = true) => {
      const x0 = s.x - s.w / 2;
      const x1 = s.x + s.w / 2;
      const z0 = s.z - s.d / 2;
      const z1 = s.z + s.d / 2;
      const P = (x: number, yy: number, z: number) => {
        const [a, b] = iso(x, yy, z);
        return [ox + a, oy + b] as const;
      };
      const top = [P(x0, y + H, z0), P(x1, y + H, z0), P(x1, y + H, z1), P(x0, y + H, z1)];
      const left = [P(x0, y, z1), P(x1, y, z1), P(x1, y + H, z1), P(x0, y + H, z1)];
      const right = [P(x1, y, z0), P(x1, y, z1), P(x1, y + H, z1), P(x1, y + H, z0)];
      const path = (pts: (readonly [number, number])[]) => {
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.closePath();
      };
      ctx.globalAlpha = alpha;
      // sides
      for (const [pts, l] of [
        [left, 42],
        [right, 30],
      ] as const) {
        const g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
        g.addColorStop(0, `hsl(${s.hue} 75% ${l - 8}%)`);
        g.addColorStop(1, `hsl(${s.hue} 80% ${l + 6}%)`);
        ctx.fillStyle = g;
        path(pts);
        ctx.fill();
      }
      // top: glassy gradient + specular
      const tg = ctx.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]);
      tg.addColorStop(0, `hsl(${s.hue} 85% 72%)`);
      tg.addColorStop(1, `hsl(${(s.hue + 25) % 360} 80% 58%)`);
      ctx.fillStyle = tg;
      path(top);
      ctx.fill();
      if (glass) {
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(...top[3]);
        ctx.lineTo(...top[0]);
        ctx.lineTo(...top[1]);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.moveTo(...left[3]);
        ctx.lineTo(...left[0]);
        ctx.moveTo(...right[2]);
        ctx.lineTo(...right[1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const outline = (s: { x: number; z: number; w: number; d: number }, y: number, ox: number, oy: number) => {
      const pts = [
        [s.x - s.w / 2, s.z - s.d / 2],
        [s.x + s.w / 2, s.z - s.d / 2],
        [s.x + s.w / 2, s.z + s.d / 2],
        [s.x - s.w / 2, s.z + s.d / 2],
      ].map(([x, z]) => iso(x, y, z));
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(ox + px, oy + py) : ctx.moveTo(ox + px, oy + py)));
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const stars = Array.from({ length: 90 }, (_, i) => ({ x: ((i * 9301 + 49297) % 233280) / 233280, y: ((i * 4517 + 1123) % 99991) / 99991, p: i }));
    const clouds = Array.from({ length: 9 }, (_, i) => ({ floor: 9 + i * 1.6, x: ((i * 37) % 100) / 100, w: 90 + ((i * 53) % 80) }));

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const anim = motion.current;
      const g = game.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth;
      const Hh = c.clientHeight;
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(Hh * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(Hh * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // camera: follow the top; on game over, pull back to frame the whole tower
      const towerPx = g.stack.length * H + BASE;
      const targetCam = g.over ? towerPx / 2 - Hh * 0.12 : Math.max(0, g.stack.length * H - Hh * 0.32);
      const targetZoom = g.over ? Math.min(1, (Hh * 0.72) / towerPx) : 1;
      const k = anim ? 1 - Math.pow(0.001, dt * (g.over ? 0.6 : 1.4)) : 1;
      g.cam += (targetCam - g.cam) * k;
      g.zoom += (targetZoom - g.zoom) * k;
      const floorF = Math.max(0, g.cam / H + 6);

      // sky
      const sky = skyAt(floorF);
      const bg = ctx.createLinearGradient(0, 0, 0, Hh);
      bg.addColorStop(0, hsl(sky.top));
      bg.addColorStop(1, hsl(sky.bottom));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, Hh);
      const starA = Math.max(0, Math.min(1, (floorF - 16) / 12));
      if (starA > 0) {
        ctx.fillStyle = "#fff";
        for (const s of stars) {
          ctx.globalAlpha = starA * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + s.p)));
          ctx.fillRect(s.x * W, s.y * Hh, 1.3, 1.3);
        }
        ctx.globalAlpha = 1;
      }
      if (floorF > 30) {
        // the planet's glowing rim far below
        const a = Math.min(1, (floorF - 30) / 10);
        const rg = ctx.createRadialGradient(W / 2, Hh * 2.3, Hh * 1.2, W / 2, Hh * 2.3, Hh * 1.55);
        rg.addColorStop(0, `rgba(34,211,238,${0.5 * a})`);
        rg.addColorStop(0.5, `rgba(139,92,246,${0.25 * a})`);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, Hh);
      }
      // sun glow (dusk) fading with altitude
      const sunA = Math.max(0, 1 - floorF / 14);
      if (sunA > 0) {
        const sg = ctx.createRadialGradient(W * 0.78, Hh * 0.75, 0, W * 0.78, Hh * 0.75, W * 0.6);
        sg.addColorStop(0, `rgba(255,140,90,${0.45 * sunA})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, Hh);
      }

      ctx.save();
      const ox = W / 2;
      const oy = Hh * 0.66;
      ctx.translate(ox, oy);
      ctx.scale(g.zoom, g.zoom);
      ctx.translate(0, g.cam);

      // clouds pass behind the tower around floors 9–24
      for (const cl of clouds) {
        const cy = -cl.floor * H * 1.4;
        const cx = ((cl.x * W + t * 8) % (W + 200)) - W / 2 - 100;
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, cl.w, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + cl.w * 0.4, cy - 8, cl.w * 0.5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ground plate + soft shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, BASE * 0.05, BASE * 1.25, BASE * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      box({ x: 0, z: 0, w: BASE + 30, d: BASE + 30, hue: 250 }, -H * 2, 0, 0, 1, false);

      // moving slab
      if (g.mover && !g.over) {
        const m = g.mover;
        m[m.axis] += m.dir * m.speed * dt;
        if (Math.abs(m[m.axis]) > RANGE) {
          m[m.axis] = Math.sign(m[m.axis]) * RANGE;
          m.dir *= -1;
        }
      }
      g.stack.forEach((s, i) => box(s, i * H, 0, 0));
      if (g.mover && !g.over) {
        const top = g.stack[g.stack.length - 1];
        outline(top, g.stack.length * H, 0, 0); // ghost guide: where the slab below is
        box(g.mover, g.stack.length * H, 0, 0, 0.92);
      }

      // perfect ring
      if (g.pulse > 0 && anim) {
        const top = g.stack[g.stack.length - 1];
        const [px, py] = iso(top.x, g.stack.length * H, top.z);
        const s = 1.15 + (1 - g.pulse) * 0.6;
        ctx.strokeStyle = `rgba(255,255,255,${g.pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, top.w * 0.866 * s, top.d * 0.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        g.pulse -= dt * 1.8;
      }

      // debris
      g.debris = g.debris.filter((d) => {
        if (anim) {
          d.vy -= 1000 * dt;
          d.y += d.vy * dt;
          d.x += d.vx * dt;
          d.z += d.vz * dt;
        } else d.y = -9999;
        box(d, d.y, 0, 0, Math.max(0, 1 + (d.y - g.stack.length * H) / 500));
        return d.y > g.stack.length * H - 700 && d.y > -2000;
      });

      // sparks
      g.sparks = g.sparks.filter((s) => {
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy -= 60 * dt;
        const [px, py] = iso(s.x, s.y, 0);
        ctx.globalAlpha = Math.max(0, s.life / 0.7);
        ctx.fillStyle = `hsl(${s.hue} 100% 80%)`;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        return s.life > 0;
      });
      ctx.globalAlpha = 1;

      // floating labels
      g.floats = g.floats.filter((f) => {
        f.life -= dt * 0.9;
        f.y += dt * 30;
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.font = "800 15px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.fillText(f.text, 0, -f.y - 30);
        ctx.shadowBlur = 0;
        return f.life > 0;
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      // cut flash
      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.12})`;
        ctx.fillRect(0, 0, W, Hh);
        g.flash -= dt * 4;
      }
      // altitude banner
      if (g.banner.life > 0) {
        const a = Math.min(1, g.banner.life * 2);
        ctx.globalAlpha = a;
        ctx.font = "800 13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.fillText(g.banner.text, W / 2, Hh * 0.42);
        ctx.fillRect(W / 2 - 60 * a, Hh * 0.42 + 10, 120 * a, 1);
        ctx.globalAlpha = 1;
        g.banner.life -= dt * 0.45;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [spawn]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) drop();
    }
  };

  return (
    <div
      tabIndex={0}
      role="application"
      aria-label={`Stack tower game. ${score} floors. Press Space or tap to drop the slab.`}
      onKeyDown={onKey}
      className={`relative h-full min-h-[460px] w-full select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${className}`}
    >
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget.parentElement as HTMLElement).focus({ preventScroll: true });
          drop();
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-5 text-center">
        <p className="text-6xl font-black tabular-nums text-white drop-shadow-[0_4px_20px_rgba(0,0,0,.4)]" aria-live="polite">
          {score}
        </p>
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.3em] text-white/65">
          {score * 3} m · {zone} · best {best}
        </p>
        {combo >= 2 && !over && <p className="mt-1 font-mono text-xs font-bold text-[#ffd666]">perfect ×{combo}</p>}
      </div>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-sm text-white/70 backdrop-blur transition hover:text-white"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      {over && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center">
          <p className="text-2xl font-black text-white">{score} floors · {score * 3} m</p>
          <p className="font-mono text-xs text-white/65">{score >= best && score > 0 ? "new best! · " : ""}tap to build again</p>
        </div>
      )}
      {score === 0 && !over && (
        <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center font-mono text-xs text-white/65">tap / Space to drop · match the dashed outline · climb to orbit</p>
      )}
    </div>
  );
}

export default StackTower;
