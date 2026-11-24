"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, glow, noGlow, rr, sky, text, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * Pong — where video games began, in neon: you vs the CPU, first to 7. Hit
 * the ball with your paddle's edges to angle it; every rally speeds it up.
 * The CPU reacts with a delay and a top speed, so it can be beaten.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type PongProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  /** Points needed to win. */
  target?: number;
  className?: string;
};

const PH = 64; // paddle height
const PW = 10;
const LX = 26;
const RX = SCREEN.w - 26 - PW;
const TOP = 34;

class PongGame implements ArcadeGame {
  score = 0;
  over = false;
  message?: string;
  private cpu = 0;
  private py = SCREEN.h / 2;
  private cy = SCREEN.h / 2;
  private keys = { up: false, down: false };
  private ball = { x: 0, y: 0, vx: 0, vy: 0 };
  private wait = 0;
  private trail: { x: number; y: number }[] = [];
  private fx = new Particles();
  private shake = new Shake();
  private flash = { side: 0, t: 0 };

  constructor(private target: number) {
    this.reset();
  }
  reset() {
    this.score = 0;
    this.cpu = 0;
    this.over = false;
    this.message = undefined;
    this.py = this.cy = (SCREEN.h + TOP) / 2;
    this.fx.clear();
    this.serve(Math.random() < 0.5 ? 1 : -1);
  }
  private serve(dir: number) {
    const a = (Math.random() - 0.5) * 0.7;
    this.ball = { x: SCREEN.w / 2, y: (SCREEN.h + TOP) / 2, vx: Math.cos(a) * 300 * dir, vy: Math.sin(a) * 300 };
    this.wait = 0.8;
    this.trail = [];
  }
  input(a: Action, pressed: boolean) {
    if (a === "up" || a === "down") this.keys[a] = pressed;
  }
  pointer(x: number, y: number) {
    void x;
    this.py = this.clamp(y);
  }
  private clamp(y: number) {
    return Math.max(TOP + PH / 2, Math.min(SCREEN.h - PH / 2, y));
  }
  step(dt: number) {
    this.fx.step(dt, 0);
    this.shake.step(dt);
    this.flash.t = Math.max(0, this.flash.t - dt * 2);
    if (this.over) return;
    this.py = this.clamp(this.py + (Number(this.keys.down) - Number(this.keys.up)) * 420 * dt);
    // CPU: chases where the ball is, only when it's coming, with a speed cap
    const b = this.ball;
    const goal = b.vx > 0 ? b.y : (SCREEN.h + TOP) / 2;
    const cap = 250 + Math.min(this.score, 6) * 18;
    this.cy = this.clamp(this.cy + Math.max(-cap * dt, Math.min(cap * dt, (goal - this.cy) * 0.12)));
    if (this.wait > 0) {
      this.wait -= dt;
      return;
    }
    const n = Math.ceil((Math.abs(b.vx) * dt) / 6);
    for (let i = 0; i < n; i++) if (this.move(dt / n)) break;
    this.trail.unshift({ x: b.x, y: b.y });
    this.trail.length = Math.min(this.trail.length, 12);
  }
  /** Returns true when a point was scored. */
  private move(dt: number) {
    const b = this.ball;
    const R = 7;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y < TOP + R || b.y > SCREEN.h - R) {
      b.vy *= -1;
      b.y = Math.max(TOP + R, Math.min(SCREEN.h - R, b.y));
    }
    const hit = (px: number, y: number, dir: number) => {
      if (Math.abs(b.y - y) > PH / 2 + R) return false;
      if (dir > 0 ? b.x - R > px + PW || b.x - R < px : b.x + R < px || b.x + R > px + PW) return false;
      const off = (b.y - y) / (PH / 2);
      const sp = Math.min(720, Math.hypot(b.vx, b.vy) * 1.06);
      const a = off * 0.9;
      b.vx = Math.cos(a) * sp * dir;
      b.vy = Math.sin(a) * sp;
      this.fx.burst(b.x, b.y, dir > 0 ? PAL.pink : PAL.cyan, 10, 140, 2.5);
      this.shake.kick(3);
      return true;
    };
    if (b.vx < 0) hit(LX, this.py, 1);
    else hit(RX, this.cy, -1);
    if (b.x < -20 || b.x > SCREEN.w + 20) {
      const player = b.x > SCREEN.w;
      if (player) this.score++;
      else this.cpu++;
      this.flash = { side: player ? 1 : -1, t: 1 };
      this.shake.kick(8);
      if (this.score >= this.target || this.cpu >= this.target) {
        this.over = true;
        this.message = this.score >= this.target ? "You win!" : "CPU wins";
      } else this.serve(player ? -1 : 1);
      return true;
    }
    return false;
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { grid: false, tint: PAL.cyan, horizon: SCREEN.h * 0.95 });
    // court
    ctx.strokeStyle = "rgba(245,243,255,0.18)";
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(SCREEN.w / 2, TOP + 6);
    ctx.lineTo(SCREEN.w / 2, SCREEN.h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(245,243,255,0.12)";
    ctx.beginPath();
    ctx.arc(SCREEN.w / 2, (SCREEN.h + TOP) / 2, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(245,243,255,0.25)";
    ctx.fillRect(0, TOP, SCREEN.w, 1);
    if (this.flash.t > 0) {
      const g = ctx.createLinearGradient(this.flash.side > 0 ? SCREEN.w : 0, 0, SCREEN.w / 2, 0);
      g.addColorStop(0, `rgba(255,77,141,${this.flash.t * 0.35})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, TOP, SCREEN.w, SCREEN.h - TOP);
    }
    // scores
    text(ctx, "YOU", SCREEN.w / 2 - 70, 17, 11, PAL.dim, "right");
    text(ctx, String(this.score), SCREEN.w / 2 - 24, 17, 20, PAL.pink, "right");
    text(ctx, String(this.cpu), SCREEN.w / 2 + 24, 17, 20, PAL.cyan, "left");
    text(ctx, "CPU", SCREEN.w / 2 + 70, 17, 11, PAL.dim, "left");
    text(ctx, `first to ${this.target}`, 14, 17, 11, PAL.dim);
    // paddles
    for (const [x, y, c] of [
      [LX, this.py, PAL.pink],
      [RX, this.cy, PAL.cyan],
    ] as const) {
      ctx.fillStyle = c;
      glow(ctx, c, 16);
      rr(ctx, x, y - PH / 2, PW, PH, 5);
      ctx.fill();
    }
    noGlow(ctx);
    // ball
    this.trail.forEach((p, i) => {
      ctx.globalAlpha = (1 - i / this.trail.length) * 0.35;
      ctx.fillStyle = this.ball.vx > 0 ? PAL.pink : PAL.cyan;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7 - i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = this.wait > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 8)) : 1;
    ctx.fillStyle = PAL.ink;
    glow(ctx, PAL.ink, 14);
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, 7, 0, Math.PI * 2);
    ctx.fill();
    noGlow(ctx);
    ctx.globalAlpha = 1;
    this.fx.draw(ctx);
    ctx.restore();
  }
}

export function Pong({ storageKey = "pickui-pong-best", target = 7, className = "" }: PongProps) {
  const create = React.useCallback(() => new PongGame(target), [target]);
  return <ArcadeCabinet create={create} title="Pong" controls="Mouse / touch / ↑ ↓ · W S" scoreLabel="points" storageKey={storageKey} accent={PAL.cyan} className={className} />;
}

export default Pong;
