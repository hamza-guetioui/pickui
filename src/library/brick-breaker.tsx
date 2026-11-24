"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, glow, lives, noGlow, rr, sky, text, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * BrickBreaker — the 1976 arcade legend in neon: move the paddle, bounce the
 * ball and shatter the wall. Hit the ball with the paddle's edges to aim;
 * armoured top rows take two hits, a ball trail shows your speed, and each
 * cleared wave comes back faster. Three lives.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type BrickBreakerProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  className?: string;
};

const COLS = 10;
const ROWS = 6;
const BW = 56;
const BH = 16;
const GAPX = 4;
const LEFT = (SCREEN.w - (COLS * BW + (COLS - 1) * GAPX)) / 2;
const TOPY = 52;
const PY = SCREEN.h - 30;
const ROW_COLORS = [PAL.pink, PAL.pink, PAL.violet, PAL.cyan, PAL.lime, PAL.amber];

type Brick = { x: number; y: number; hp: number; row: number; hit: number };

class Breakout implements ArcadeGame {
  score = 0;
  over = false;
  message?: string;
  private px = SCREEN.w / 2;
  private pw = 92;
  private keys = { left: false, right: false };
  private ball = { x: 0, y: 0, vx: 0, vy: 0, stuck: true };
  private trail: { x: number; y: number }[] = [];
  private bricks: Brick[] = [];
  private lives = 3;
  private wave = 1;
  private fx = new Particles();
  private shake = new Shake();

  constructor() {
    this.reset();
  }
  reset() {
    this.score = 0;
    this.over = false;
    this.message = undefined;
    this.lives = 3;
    this.wave = 1;
    this.px = SCREEN.w / 2;
    this.fx.clear();
    this.build();
    this.serve();
  }
  private build() {
    this.bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) this.bricks.push({ x: LEFT + c * (BW + GAPX), y: TOPY + r * (BH + 6), hp: r < 2 ? 2 : 1, row: r, hit: 0 });
  }
  private serve() {
    this.ball = { x: this.px, y: PY - 10, vx: 0, vy: 0, stuck: true };
    this.trail = [];
  }
  private launch() {
    if (!this.ball.stuck) return;
    const sp = 300 + this.wave * 30;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    this.ball = { ...this.ball, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, stuck: false };
  }
  input(a: Action, pressed: boolean) {
    if (a === "left" || a === "right") this.keys[a] = pressed;
    if (pressed && (a === "primary" || a === "up")) this.launch();
  }
  pointer(x: number) {
    this.px = Math.max(this.pw / 2, Math.min(SCREEN.w - this.pw / 2, x));
  }
  step(dt: number) {
    this.fx.step(dt);
    this.shake.step(dt);
    for (const b of this.bricks) b.hit = Math.max(0, b.hit - dt * 4);
    if (this.over) return;
    const move = (Number(this.keys.right) - Number(this.keys.left)) * 520 * dt;
    if (move) this.pointer(this.px + move);
    const b = this.ball;
    if (b.stuck) {
      b.x = this.px;
      b.y = PY - 10;
      return;
    }
    // sub-steps so a fast ball can't tunnel through bricks
    const n = Math.ceil((Math.hypot(b.vx, b.vy) * dt) / 6);
    for (let i = 0; i < n; i++) this.move(dt / n);
    this.trail.unshift({ x: b.x, y: b.y });
    this.trail.length = Math.min(this.trail.length, 10);
  }
  private move(dt: number) {
    const b = this.ball;
    const R = 6;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < R || b.x > SCREEN.w - R) {
      b.vx *= -1;
      b.x = Math.max(R, Math.min(SCREEN.w - R, b.x));
    }
    if (b.y < R + 30) {
      b.vy = Math.abs(b.vy);
    }
    // paddle
    if (b.vy > 0 && b.y + R >= PY - 6 && b.y + R <= PY + 6 && Math.abs(b.x - this.px) <= this.pw / 2 + R) {
      const off = (b.x - this.px) / (this.pw / 2); // -1..1
      const sp = Math.min(640, Math.hypot(b.vx, b.vy) * 1.02);
      const a = -Math.PI / 2 + off * 1.05;
      b.vx = Math.cos(a) * sp;
      b.vy = Math.sin(a) * sp;
      this.fx.burst(b.x, PY - 6, PAL.cyan, 6, 80, 2);
    }
    if (b.y > SCREEN.h + 10) {
      this.lives--;
      this.shake.kick(10);
      if (this.lives <= 0) {
        this.over = true;
        this.message = "Out of balls";
      } else this.serve();
      return;
    }
    for (const k of this.bricks) {
      if (k.hp <= 0) continue;
      if (b.x + R > k.x && b.x - R < k.x + BW && b.y + R > k.y && b.y - R < k.y + BH) {
        // reflect on the shallower overlap axis
        const ox = Math.min(b.x + R - k.x, k.x + BW - (b.x - R));
        const oy = Math.min(b.y + R - k.y, k.y + BH - (b.y - R));
        if (ox < oy) b.vx *= -1;
        else b.vy *= -1;
        k.hp--;
        k.hit = 1;
        const color = ROW_COLORS[k.row];
        if (k.hp <= 0) {
          this.score += (ROWS - k.row) * 10;
          this.fx.burst(k.x + BW / 2, k.y + BH / 2, color, 16, 170, 3);
          this.shake.kick(3);
        } else this.fx.burst(b.x, b.y, PAL.ink, 5, 80, 2);
        if (this.bricks.every((q) => q.hp <= 0)) {
          this.wave++;
          this.build();
          this.serve();
        }
        break;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { tint: PAL.violet, horizon: SCREEN.h * 0.82, speed: 20 });
    lives(ctx, this.lives);
    text(ctx, `wave ${this.wave}`, SCREEN.w - 14, 20, 12, PAL.dim, "right");
    for (const k of this.bricks) {
      if (k.hp <= 0) continue;
      const color = ROW_COLORS[k.row];
      ctx.fillStyle = color;
      ctx.globalAlpha = k.hp > 1 ? 1 : 0.8;
      glow(ctx, color, 10 + k.hit * 14);
      rr(ctx, k.x, k.y, BW, BH, 4);
      ctx.fill();
      noGlow(ctx);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(k.x + 4, k.y + 3, BW - 8, 2);
      if (k.hp > 1) {
        ctx.strokeStyle = "rgba(5,4,26,0.6)";
        ctx.lineWidth = 2;
        rr(ctx, k.x + 3, k.y + 3, BW - 6, BH - 6, 3);
        ctx.stroke();
      }
      if (k.hit > 0) {
        ctx.fillStyle = `rgba(255,255,255,${k.hit * 0.6})`;
        rr(ctx, k.x, k.y, BW, BH, 4);
        ctx.fill();
      }
    }
    // trail + ball
    this.trail.forEach((p, i) => {
      ctx.globalAlpha = (1 - i / this.trail.length) * 0.4;
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 - i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.ink;
    glow(ctx, PAL.cyan, 16);
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, 6, 0, Math.PI * 2);
    ctx.fill();
    // paddle
    const g = ctx.createLinearGradient(this.px - this.pw / 2, 0, this.px + this.pw / 2, 0);
    g.addColorStop(0, PAL.pink);
    g.addColorStop(1, PAL.violet);
    ctx.fillStyle = g;
    glow(ctx, PAL.pink, 16);
    rr(ctx, this.px - this.pw / 2, PY - 5, this.pw, 10, 5);
    ctx.fill();
    noGlow(ctx);
    this.fx.draw(ctx);
    ctx.restore();
  }
}

export function BrickBreaker({ storageKey = "pickui-brick-breaker-best", className = "" }: BrickBreakerProps) {
  const create = React.useCallback(() => new Breakout(), []);
  return <ArcadeCabinet create={create} title="Brick Breaker" controls="Mouse / touch / ← → · Space or tap to launch" scoreLabel="points" storageKey={storageKey} accent={PAL.violet} className={className} />;
}

export default BrickBreaker;
