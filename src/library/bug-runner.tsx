"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, bug, glow, noGlow, rr, sky, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * BugRunner — an endless runner in the spirit of the offline dino game: a
 * little neon dev sprints across a synthwave grid and jumps bugs and stacks of
 * code before they reach production. Hold to jump higher, ↓ to drop fast;
 * flying bugs show up later and the pace keeps climbing.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type BugRunnerProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  className?: string;
};

const GROUND = 286;
const PX = 96; // player x

type Obstacle = { kind: "bug" | "block" | "fly"; x: number; y: number; w: number; h: number; n: number };

class Runner implements ArcadeGame {
  score = 0;
  over = false;
  private y = 0;
  private vy = 0;
  private hold = false;
  private duck = false;
  private speed = 260;
  private run = 0;
  private gap = 0;
  private obs: Obstacle[] = [];
  private fx = new Particles();
  private shake = new Shake();
  private city = Array.from({ length: 18 }, (_, i) => ({ x: i * 44, h: 30 + ((i * 53) % 70), w: 30 + ((i * 17) % 18) }));

  constructor() {
    this.reset();
  }
  reset() {
    this.score = 0;
    this.over = false;
    this.y = 0;
    this.vy = 0;
    this.speed = 260;
    this.run = 0;
    this.gap = 1.1;
    this.obs = [];
    this.fx.clear();
  }
  private get grounded() {
    return this.y >= 0;
  }
  input(a: Action, pressed: boolean) {
    if (a === "primary" || a === "up") {
      this.hold = pressed;
      if (pressed && this.grounded) {
        this.vy = -610;
        this.fx.burst(PX, GROUND, PAL.cyan, 8, 90, 2);
      }
    }
    if (a === "down") {
      this.duck = pressed;
      if (pressed && !this.grounded) this.vy = Math.max(this.vy, 700);
    }
  }
  step(dt: number) {
    if (this.over) return;
    this.speed = Math.min(640, this.speed + dt * 9);
    this.score += (this.speed * dt) / 12;
    this.run += dt * this.speed;
    // jump physics: lighter gravity while held + rising = variable jump height
    const g = this.hold && this.vy < 0 ? 1350 : 2500;
    this.vy += g * dt;
    this.y = Math.min(0, this.y + this.vy * dt);
    if (this.y === 0) this.vy = 0;
    // spawn
    this.gap -= dt;
    if (this.gap <= 0) {
      const r = Math.random();
      const late = this.score > 250;
      if (late && r < 0.25) this.obs.push({ kind: "fly", x: SCREEN.w + 20, y: GROUND - 62 - Math.random() * 18, w: 26, h: 18, n: 1 });
      else if (r < 0.6) this.obs.push({ kind: "bug", x: SCREEN.w + 20, y: GROUND - 18, w: 24, h: 18, n: 1 + (late && Math.random() < 0.35 ? 1 : 0) });
      else {
        const n = 1 + Math.floor(Math.random() * (late ? 3 : 2));
        this.obs.push({ kind: "block", x: SCREEN.w + 20, y: GROUND - n * 20, w: 26, h: n * 20, n });
      }
      this.gap = Math.max(0.55, (0.9 + Math.random() * 0.9) * (300 / this.speed));
    }
    for (const o of this.obs) o.x -= this.speed * dt;
    this.obs = this.obs.filter((o) => o.x > -80);
    // collide (forgiving hitbox)
    const ph = this.duck && this.grounded ? 22 : 40;
    const p = { x: PX - 10, y: GROUND + this.y - ph, w: 20, h: ph - 2 };
    for (const o of this.obs) {
      const w = o.kind === "bug" ? o.w * o.n + (o.n - 1) * 6 : o.w;
      if (p.x < o.x + w - 4 && p.x + p.w > o.x + 4 && p.y < o.y + o.h - 2 && p.y + p.h > o.y + 3) {
        this.over = true;
        this.fx.burst(PX, GROUND + this.y - 20, PAL.pink, 30, 240, 3);
        this.shake.kick(12);
      }
    }
    if (this.grounded && Math.random() < dt * 30) this.fx.list.push({ x: PX - 8, y: GROUND - 2, vx: -this.speed * 0.3, vy: -30 - Math.random() * 40, life: 0.3, max: 0.3, color: PAL.violet, size: 2 });
    this.fx.step(dt, 300);
    this.shake.step(dt);
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { horizon: GROUND, speed: this.over ? 0 : this.speed * 0.6 });
    // parallax skyline
    ctx.fillStyle = "rgba(139,92,246,0.18)";
    for (const b of this.city) {
      const x = (((b.x - this.run * 0.12) % (18 * 44)) + 18 * 44) % (18 * 44) - 44;
      ctx.fillRect(x, GROUND - b.h, b.w, b.h);
      ctx.fillStyle = "rgba(34,211,238,0.35)";
      for (let wy = GROUND - b.h + 8; wy < GROUND - 6; wy += 10) if ((wy + b.x) % 3 === 0) ctx.fillRect(x + 6, wy, 3, 3);
      ctx.fillStyle = "rgba(139,92,246,0.18)";
    }
    // obstacles
    for (const o of this.obs) {
      if (o.kind === "block") {
        for (let i = 0; i < o.n; i++) {
          const y = GROUND - (i + 1) * 20;
          ctx.fillStyle = "#12102b";
          rr(ctx, o.x, y + 1, o.w, 18, 4);
          ctx.fill();
          ctx.strokeStyle = PAL.amber;
          ctx.lineWidth = 1.5;
          glow(ctx, PAL.amber, 10);
          ctx.stroke();
          noGlow(ctx);
          ctx.fillStyle = PAL.amber;
          ctx.font = `700 11px ui-monospace, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(["{ }", "</>", "( )"][i % 3], o.x + o.w / 2, y + 10);
        }
      } else if (o.kind === "fly") {
        bug(ctx, o.x + 13, o.y + 9 + Math.sin(t * 8) * 3, 20, PAL.lime, t);
        ctx.strokeStyle = "rgba(163,230,53,0.5)";
        ctx.beginPath();
        ctx.ellipse(o.x + 6, o.y + 2, 6, 3, -0.4 + Math.sin(t * 40) * 0.3, 0, Math.PI * 2);
        ctx.ellipse(o.x + 20, o.y + 2, 6, 3, 0.4 - Math.sin(t * 40) * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        for (let i = 0; i < o.n; i++) bug(ctx, o.x + 12 + i * 30, o.y + 9, 22, PAL.red, t + i);
      }
    }
    // player
    const ducking = this.duck && this.grounded;
    const py = GROUND + this.y;
    const leg = this.grounded && !this.over ? Math.sin(this.run / 14) : 0.6;
    ctx.save();
    ctx.translate(PX, py);
    ctx.strokeStyle = PAL.pink;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    glow(ctx, PAL.pink, 14);
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(-3 + leg * 7, -2);
    ctx.moveTo(3, -12);
    ctx.lineTo(3 - leg * 7, -2);
    ctx.stroke();
    ctx.fillStyle = PAL.pink;
    rr(ctx, -12, ducking ? -26 : -42, 24, ducking ? 16 : 32, 9);
    ctx.fill();
    noGlow(ctx);
    // visor
    ctx.fillStyle = "#1a0b2e";
    rr(ctx, -2, ducking ? -22 : -36, 14, 8, 4);
    ctx.fill();
    ctx.fillStyle = PAL.cyan;
    glow(ctx, PAL.cyan, 8);
    ctx.fillRect(4, ducking ? -20 : -34, 6, 3);
    noGlow(ctx);
    // tiny laptop backpack
    ctx.fillStyle = PAL.violet;
    rr(ctx, -16, ducking ? -24 : -36, 6, 14, 2);
    ctx.fill();
    ctx.restore();
    this.fx.draw(ctx);
    ctx.restore();
  }
}

export function BugRunner({ storageKey = "pickui-bug-runner-best", className = "" }: BugRunnerProps) {
  const create = React.useCallback(() => new Runner(), []);
  return <ArcadeCabinet create={create} title="Bug Runner" controls="Space / ↑ / tap to jump · hold = higher · ↓ duck" scoreLabel="points" storageKey={storageKey} accent={PAL.pink} className={className} />;
}

export default BugRunner;
