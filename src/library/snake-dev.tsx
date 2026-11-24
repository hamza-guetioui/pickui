"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, bug, glow, noGlow, rr, sky, text, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * SnakeDev — the Nokia classic, rewritten for developers: steer a glowing
 * line of code around a neon board, eat bugs to fix them and grow, don't hit
 * the walls or your own tail. Every fix speeds it up a little; golden bugs are
 * worth 3 and vanish after a few seconds.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type SnakeDevProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  className?: string;
};

const CELL = 20;
const COLS = SCREEN.w / CELL; // 32
const ROWS = (SCREEN.h - 40) / CELL; // 16 (a 40px HUD band on top)
const TOP = 40;

type P = { x: number; y: number };
const DIRS: Record<string, P> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

class Snake implements ArcadeGame {
  score = 0;
  over = false;
  private body: P[] = [];
  private prev: P[] = [];
  private dir: P = DIRS.right;
  private queue: P[] = [];
  private food: P = { x: 0, y: 0 };
  private gold: (P & { life: number }) | null = null;
  private tick = 0;
  private every = 0.12;
  private fx = new Particles();
  private shake = new Shake();
  private grow = 0;

  constructor() {
    this.reset();
  }
  reset() {
    this.score = 0;
    this.over = false;
    this.body = [3, 2, 1, 0].map((x) => ({ x: x + 4, y: 8 }));
    this.prev = this.body.map((p) => ({ ...p }));
    this.dir = DIRS.right;
    this.queue = [];
    this.every = 0.12;
    this.tick = 0;
    this.grow = 0;
    this.gold = null;
    this.fx.clear();
    this.food = this.free();
  }
  private free(): P {
    for (;;) {
      const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!this.body.some((b) => b.x === p.x && b.y === p.y) && !(this.food && this.food.x === p.x && this.food.y === p.y)) return p;
    }
  }
  input(a: Action, pressed: boolean) {
    if (!pressed || a === "primary") return;
    const d = DIRS[a];
    const last = this.queue[this.queue.length - 1] ?? this.dir;
    if (d.x === -last.x && d.y === -last.y) return; // no reversing into yourself
    if (d.x === last.x && d.y === last.y) return;
    if (this.queue.length < 2) this.queue.push(d);
  }
  step(dt: number) {
    this.fx.step(dt, 0);
    this.shake.step(dt);
    if (this.over) return;
    if (this.gold && (this.gold.life -= dt) <= 0) this.gold = null;
    this.tick += dt;
    if (this.tick < this.every) return;
    this.tick -= this.every;
    this.dir = this.queue.shift() ?? this.dir;
    this.prev = this.body.map((p) => ({ ...p }));
    const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };
    const hitsSelf = this.body.slice(0, this.grow > 0 ? undefined : -1).some((b) => b.x === head.x && b.y === head.y);
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || hitsSelf) {
      this.over = true;
      this.shake.kick(10);
      this.fx.burst(this.cx(this.body[0].x), this.cy(this.body[0].y), PAL.pink, 30, 200, 3);
      return;
    }
    this.body.unshift(head);
    if (this.grow > 0) this.grow--;
    else this.body.pop();
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 1;
      this.grow += 2;
      this.every = Math.max(0.055, this.every * 0.97);
      this.fx.burst(this.cx(head.x), this.cy(head.y), PAL.red, 16, 150);
      this.food = this.free();
      if (!this.gold && Math.random() < 0.18) this.gold = { ...this.free(), life: 6 };
    }
    if (this.gold && head.x === this.gold.x && head.y === this.gold.y) {
      this.score += 3;
      this.grow += 3;
      this.fx.burst(this.cx(head.x), this.cy(head.y), PAL.amber, 24, 190);
      this.gold = null;
    }
  }
  private cx(x: number) {
    return x * CELL + CELL / 2;
  }
  private cy(y: number) {
    return TOP + y * CELL + CELL / 2;
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { grid: false, tint: PAL.violet, horizon: SCREEN.h });
    // board
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (let y = 0; y < ROWS; y++) for (let x = (y % 2); x < COLS; x += 2) ctx.fillRect(x * CELL, TOP + y * CELL, CELL, CELL);
    ctx.strokeStyle = PAL.violet;
    ctx.lineWidth = 2;
    glow(ctx, PAL.violet, 14);
    rr(ctx, 1, TOP + 1, SCREEN.w - 2, ROWS * CELL - 2, 6);
    ctx.stroke();
    noGlow(ctx);
    text(ctx, "// eat bugs · grow the codebase", 14, 20, 12, PAL.dim);
    text(ctx, `len ${this.body.length}`, SCREEN.w - 14, 20, 12, PAL.dim, "right");
    // food
    bug(ctx, this.cx(this.food.x), this.cy(this.food.y), 15 + Math.sin(t * 6) * 1.5, PAL.red, t);
    if (this.gold) {
      ctx.globalAlpha = this.gold.life < 2 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 10)) : 1;
      bug(ctx, this.cx(this.gold.x), this.cy(this.gold.y), 17, PAL.amber, t);
      ctx.globalAlpha = 1;
    }
    // snake: interpolated between ticks for a smooth glide
    const k = this.over ? 1 : Math.min(1, this.tick / this.every);
    const pts = this.body.map((b, i) => {
      const p = this.prev[i] ?? this.prev[this.prev.length - 1] ?? b;
      return { x: this.cx(p.x + (b.x - p.x) * k), y: this.cy(p.y + (b.y - p.y) * k) };
    });
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const n = pts.length;
    for (let i = n - 1; i > 0; i--) {
      const f = i / n;
      ctx.strokeStyle = `rgb(${Math.round(255 - 116 * f)}, ${Math.round(77 + 15 * f)}, ${Math.round(141 + 105 * f)})`;
      ctx.lineWidth = 15 - 6 * f;
      if (i < 4) glow(ctx, PAL.pink, 12);
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
      ctx.stroke();
      noGlow(ctx);
    }
    // head
    const h = pts[0];
    ctx.fillStyle = PAL.pink;
    glow(ctx, PAL.pink, 16);
    ctx.beginPath();
    ctx.arc(h.x, h.y, 9, 0, Math.PI * 2);
    ctx.fill();
    noGlow(ctx);
    const ex = this.dir.y !== 0 ? 4 : 0;
    const ey = this.dir.x !== 0 ? 4 : 0;
    ctx.fillStyle = PAL.ink;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(h.x + this.dir.x * 3 + ex * s, h.y + this.dir.y * 3 + ey * s, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    this.fx.draw(ctx);
    ctx.restore();
  }
}

export function SnakeDev({ storageKey = "pickui-snake-dev-best", className = "" }: SnakeDevProps) {
  const create = React.useCallback(() => new Snake(), []);
  return <ArcadeCabinet create={create} title="Snake.dev" controls="Arrows / WASD / swipe to steer" scoreLabel="bugs fixed" storageKey={storageKey} accent={PAL.violet} className={className} />;
}

export default SnakeDev;
