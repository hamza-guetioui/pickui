"use client";

import * as React from "react";

/**
 * ArcadeCabinet — the shared shell + drawing kit behind the PickUI mini-games
 * (Bug Runner, Snake.dev, Ship It!, Brick Breaker, Pong, Bug Invaders).
 *
 * A game is a small framework-free object (`ArcadeGame`): the cabinet owns the
 * canvas (DPR-sharp, fixed 640×360 logical screen scaled by CSS), the
 * requestAnimationFrame loop, input (keyboard while focused, pointer, tap,
 * swipe), pause when hidden/off-screen, score + best (localStorage) and the
 * attract / game-over screens. Style: "neon night" — deep indigo sky, a
 * scrolling synthwave grid, soft bloom, particles and a little screen shake.
 * Zero dependencies.
 */

export const SCREEN = { w: 640, h: 360 } as const;

export type Action = "primary" | "up" | "down" | "left" | "right";

export interface ArcadeGame {
  reset(): void;
  /** Advance by `dt` seconds (clamped to 1/30). */
  step(dt: number): void;
  /** Paint a frame. `t` = seconds since the cabinet mounted. */
  draw(ctx: CanvasRenderingContext2D, t: number): void;
  /** Input; `pressed` is false on key/pointer release (held-key games). */
  input(action: Action, pressed: boolean): void;
  /** Pointer position in logical (640×360) coordinates. */
  pointer?(x: number, y: number): void;
  readonly score: number;
  readonly over: boolean;
  /** Optional game-over headline (e.g. "You win!"). */
  readonly message?: string;
}

/* ───────────────────────── palette + drawing kit ───────────────────────── */

export const PAL = {
  bg0: "#05041a",
  bg1: "#170b33",
  pink: "#ff4d8d",
  violet: "#8b5cf6",
  cyan: "#22d3ee",
  lime: "#a3e635",
  amber: "#fbbf24",
  red: "#fb7185",
  ink: "#f5f3ff",
  dim: "rgba(245,243,255,0.45)",
  faint: "rgba(245,243,255,0.08)",
} as const;

export const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

let reducedMotion = false;
/** True when the visitor prefers reduced motion (no shake, fewer particles). */
export const calm = () => reducedMotion;

export function glow(ctx: CanvasRenderingContext2D, color: string, blur = 12) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}
export function noGlow(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0;
}

/** Rounded-rect path (call fill/stroke after). */
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size = 14, color: string = PAL.ink, align: CanvasTextAlign = "left") {
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * SCREEN.w, y: r(2) * SCREEN.h * 0.62, s: 0.5 + r(3) * 1.3, p: r(4) * 6.28 };
});

/**
 * The shared backdrop: indigo gradient sky, twinkling stars, a soft horizon
 * glow and (optionally) a perspective grid floor scrolling at `speed` px/s.
 */
export function sky(ctx: CanvasRenderingContext2D, t: number, opts: { horizon?: number; speed?: number; tint?: string; grid?: boolean } = {}) {
  const { w, h } = SCREEN;
  const hz = opts.horizon ?? h * 0.7;
  const tint = opts.tint ?? PAL.pink;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, PAL.bg0);
  g.addColorStop(0.7, PAL.bg1);
  g.addColorStop(1, PAL.bg0);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (const s of STARS) {
    if (s.y > hz - 8) continue;
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.6 + s.p);
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  const hg = ctx.createRadialGradient(w / 2, hz, 0, w / 2, hz, w * 0.55);
  hg.addColorStop(0, tint + "55");
  hg.addColorStop(1, "transparent");
  ctx.fillStyle = hg;
  ctx.fillRect(0, hz - h * 0.4, w, h * 0.8);
  if (opts.grid === false) return;
  // perspective floor
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hz, w, h - hz);
  ctx.clip();
  ctx.strokeStyle = tint;
  ctx.lineWidth = 1;
  const depth = h - hz;
  const off = ((t * (opts.speed ?? 40)) % 40) / 40;
  for (let i = 0; i < 12; i++) {
    const k = (i + off) / 12;
    const y = hz + depth * k * k;
    ctx.globalAlpha = 0.08 + 0.4 * k;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.22;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 26, hz);
    ctx.lineTo(w / 2 + i * 150, h);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.fillStyle = tint;
  glow(ctx, tint, 14);
  ctx.fillRect(0, hz, w, 1.5);
  noGlow(ctx);
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };

/** Tiny particle system: sparks, debris, exhaust. */
export class Particles {
  list: Particle[] = [];
  burst(x: number, y: number, color: string, n = 14, speed = 160, size = 2.5) {
    const count = calm() ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      const max = 0.35 + Math.random() * 0.45;
      this.list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: max, max, color, size: size * (0.6 + Math.random() * 0.8) });
    }
  }
  step(dt: number, gravity = 260) {
    for (const p of this.list) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += gravity * dt;
      p.vx *= 1 - 1.5 * dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      glow(ctx, p.color, 8);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    noGlow(ctx);
    ctx.globalAlpha = 1;
  }
  clear() {
    this.list = [];
  }
}

/** Screen shake: `kick(px)`, `step(dt)`, then `apply(ctx)` inside save/restore. */
export class Shake {
  amount = 0;
  kick(px: number) {
    if (!calm()) this.amount = Math.max(this.amount, px);
  }
  step(dt: number) {
    this.amount = Math.max(0, this.amount - dt * 40);
  }
  apply(ctx: CanvasRenderingContext2D) {
    if (this.amount > 0) ctx.translate((Math.random() - 0.5) * this.amount, (Math.random() - 0.5) * this.amount);
  }
}

/** A cute neon bug (enemy / food). (x, y) is its centre; `t` animates legs. */
export function bug(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, t = 0) {
  const s = size / 16;
  const wig = Math.sin(t * 14) * 1.2 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6 * s;
  ctx.lineCap = "round";
  glow(ctx, color, 10);
  for (const side of [-1, 1]) {
    for (const k of [-3.5, 0, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(side * 4 * s, k * s);
      ctx.lineTo(side * 8 * s, k * s + (k === 0 ? wig : -wig) * side);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(side * 1.5 * s, -6 * s);
    ctx.quadraticCurveTo(side * 3 * s, -9 * s, side * 5 * s, -9.5 * s);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 1 * s, 5 * s, 6.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-0.5 * s, -4 * s, 1 * s, 11 * s);
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(-2 * s, -3.5 * s, 1.3 * s, 0, Math.PI * 2);
  ctx.arc(2 * s, -3.5 * s, 1.3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Hearts / lives row, top-left. */
export function lives(ctx: CanvasRenderingContext2D, n: number, color: string = PAL.pink) {
  for (let i = 0; i < n; i++) {
    const x = 18 + i * 18;
    ctx.fillStyle = color;
    glow(ctx, color, 8);
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.bezierCurveTo(x - 7, 16, x - 4, 10, x, 14);
    ctx.bezierCurveTo(x + 4, 10, x + 7, 16, x, 22);
    ctx.fill();
  }
  noGlow(ctx);
}

/* ───────────────────────────── the cabinet ───────────────────────────── */

export type ArcadeCabinetProps = {
  /** Factory for a fresh game instance. */
  create: () => ArcadeGame;
  title: string;
  /** Short controls hint ("Space / tap to jump"). */
  controls: string;
  /** Label for the score ("points", "bugs fixed"…). */
  scoreLabel?: string;
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  /** Marquee accent color. */
  accent?: string;
  className?: string;
};

type Phase = "attract" | "play" | "paused" | "over";

const KEYS: Record<string, Action> = {
  " ": "primary",
  Enter: "primary",
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

export function ArcadeCabinet({ create, title, controls, scoreLabel = "points", storageKey = null, accent = PAL.pink, className = "" }: ArcadeCabinetProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameRef = React.useRef<ArcadeGame | null>(null);
  const phaseRef = React.useRef<Phase>("attract");
  const [phase, setPhaseState] = React.useState<Phase>("attract");
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [message, setMessage] = React.useState<string | undefined>();
  const visibleRef = React.useRef(true);
  const createRef = React.useRef(create);
  createRef.current = create;

  const setPhase = React.useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  if (!gameRef.current && typeof window !== "undefined") gameRef.current = createRef.current();

  // best score
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      setBest(Number(localStorage.getItem(storageKey)) || 0);
    } catch {}
  }, [storageKey]);

  // canvas + loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = (gameRef.current ??= createRef.current());
    const t0 = performance.now();
    let raf = 0;
    let last = t0;
    let shown = -1;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = SCREEN.w * dpr;
      canvas.height = SCREEN.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      game.draw(ctx, (performance.now() - t0) / 1000);
    };
    size();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (phaseRef.current !== "play" || !visibleRef.current) return;
      game.step(dt);
      game.draw(ctx, (now - t0) / 1000);
      const s = Math.floor(game.score);
      if (s !== shown) {
        shown = s;
        setScore(s);
      }
      if (game.over) {
        setMessage(game.message);
        setPhase("over");
        if (storageKey) {
          try {
            const prev = Number(localStorage.getItem(storageKey)) || 0;
            if (s > prev) localStorage.setItem(storageKey, String(s));
          } catch {}
        }
        setBest((b) => Math.max(b, s));
      }
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
      if (!e.isIntersecting && phaseRef.current === "play") setPhase("paused");
    });
    io.observe(canvas);
    const onVis = () => document.hidden && phaseRef.current === "play" && setPhase("paused");
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", size);
    };
  }, [setPhase, storageKey]);

  const start = React.useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    rootRef.current?.focus({ preventScroll: true });
    const p = phaseRef.current;
    if (p === "paused") return setPhase("play");
    if (p === "play") return;
    game.reset();
    setScore(0);
    setMessage(undefined);
    setPhase("play");
  }, [setPhase]);

  const send = React.useCallback(
    (a: Action, pressed: boolean) => {
      if (phaseRef.current !== "play") {
        if (pressed && a === "primary") start();
        return;
      }
      gameRef.current?.input(a, pressed);
    },
    [start],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (phaseRef.current === "play") setPhase("paused");
      else if (phaseRef.current === "paused") setPhase("play");
      return;
    }
    const a = KEYS[e.key];
    if (!a) return;
    e.preventDefault(); // keep the page from scrolling while playing
    if (!e.repeat) send(a, true);
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    const a = KEYS[e.key];
    if (a) send(a, false);
  };

  // pointer: move = aim; tap = primary; swipe = direction
  const down = React.useRef<{ x: number; y: number; t: number } | null>(null);
  const toLogical = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SCREEN.w, y: ((e.clientY - r.top) / r.height) * SCREEN.h };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    rootRef.current?.focus({ preventScroll: true });
    const p = toLogical(e);
    down.current = { ...p, t: performance.now() };
    gameRef.current?.pointer?.(p.x, p.y);
    send("primary", true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (phaseRef.current !== "play") return;
    const p = toLogical(e);
    gameRef.current?.pointer?.(p.x, p.y);
    const d = down.current;
    if (d && e.pointerType !== "mouse") {
      const dx = p.x - d.x;
      const dy = p.y - d.y;
      if (Math.hypot(dx, dy) > 28) {
        const a: Action = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
        gameRef.current?.input(a, true);
        down.current = { ...p, t: performance.now() };
      }
    }
  };
  const onPointerUp = () => {
    down.current = null;
    send("primary", false);
  };

  const overlay = phase !== "play";
  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label={`${title} — game. ${controls}. Press Space to start, Escape to pause.`}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={(e) => {
        if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
        if (phaseRef.current === "play") setPhase("paused");
      }}
      className={`group/arcade relative w-full max-w-3xl select-none rounded-[22px] p-[3px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      style={{ background: `linear-gradient(135deg, ${accent}, ${PAL.violet} 55%, ${PAL.cyan})`, ["--arcade" as string]: accent }}
    >
      <div className="overflow-hidden rounded-[19px] bg-[#07061a]">
        {/* marquee */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </span>
          <span className="truncate font-mono text-[13px] font-bold uppercase tracking-[0.22em] text-white" style={{ textShadow: `0 0 12px ${accent}` }}>
            {title}
          </span>
          <span className="ml-auto flex items-baseline gap-4 font-mono text-[11px] uppercase tracking-wider text-white/45">
            <span>
              {scoreLabel} <b className="ml-1 text-[15px] tabular-nums text-white" aria-live="polite">{String(score).padStart(4, "0")}</b>
            </span>
            {storageKey && (
              <span className="hidden sm:inline">
                best <b className="ml-1 text-[15px] tabular-nums" style={{ color: accent }}>{String(Math.max(best, 0)).padStart(4, "0")}</b>
              </span>
            )}
          </span>
        </div>

        {/* screen */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="block aspect-video w-full touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]" />
          {overlay && (
            <button
              type="button"
              onClick={start}
              className="absolute inset-0 grid place-items-center bg-[#05041a]/55 text-center backdrop-blur-[2px] transition-colors hover:bg-[#05041a]/45"
            >
              <span className="grid justify-items-center gap-3 px-6">
                {phase === "over" && (
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-white/55">
                    {message ?? "Game over"} · {score} {scoreLabel}
                  </span>
                )}
                <span className="font-mono text-2xl font-black uppercase tracking-[0.12em] text-white sm:text-3xl" style={{ textShadow: `0 0 18px ${accent}, 0 0 42px ${accent}` }}>
                  {phase === "attract" ? title : phase === "paused" ? "Paused" : "Play again"}
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white motion-safe:animate-pulse"
                  style={{ borderColor: accent, boxShadow: `0 0 18px -4px ${accent}` }}
                >
                  ▶ {phase === "paused" ? "Resume" : "Press start"}
                </span>
                <span className="font-mono text-[11px] text-white/50">{controls}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArcadeCabinet;
