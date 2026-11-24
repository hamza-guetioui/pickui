"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, glow, noGlow, rr, sky, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * ShipIt — a one-button flyer: tap to boost your release rocket through the
 * gaps in burning firewalls. Every wall cleared is a successful deploy; gaps
 * tighten and walls start to drift as your streak grows.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type ShipItProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  className?: string;
};

const RX = 150; // rocket x
const WALL_W = 46;

type Wall = { x: number; gapY: number; gap: number; drift: number; phase: number; passed: boolean };

class Flyer implements ArcadeGame {
  score = 0;
  over = false;
  private y = 0;
  private vy = 0;
  private walls: Wall[] = [];
  private speed = 170;
  private fx = new Particles();
  private shake = new Shake();
  private time = 0;

  constructor() {
    this.reset();
  }
  reset() {
    this.score = 0;
    this.over = false;
    this.y = SCREEN.h / 2;
    this.vy = 0;
    this.speed = 170;
    this.time = 0;
    this.walls = [];
    this.fx.clear();
    for (let i = 0; i < 3; i++) this.walls.push(this.wall(SCREEN.w + 80 + i * 230));
  }
  private wall(x: number): Wall {
    const gap = Math.max(108, 150 - this.score * 2.5);
    return { x, gap, gapY: 60 + gap / 2 + Math.random() * (SCREEN.h - 120 - gap), drift: this.score > 8 ? 18 + Math.random() * 22 : 0, phase: Math.random() * 6, passed: false };
  }
  private boost() {
    this.vy = -310;
    this.fx.burst(RX - 18, this.y + 4, PAL.amber, 10, 120, 3);
  }
  input(a: Action, pressed: boolean) {
    if (pressed && (a === "primary" || a === "up")) this.boost();
  }
  private gapAt(w: Wall) {
    return w.gapY + Math.sin(this.time * 1.6 + w.phase) * w.drift;
  }
  step(dt: number) {
    this.fx.step(dt, 120);
    this.shake.step(dt);
    if (this.over) return;
    this.time += dt;
    this.speed = Math.min(260, 170 + this.score * 3);
    this.vy = Math.min(520, this.vy + 980 * dt);
    this.y += this.vy * dt;
    if (Math.random() < dt * 40) this.fx.list.push({ x: RX - 20, y: this.y + (Math.random() - 0.5) * 4, vx: -120 - Math.random() * 60, vy: (Math.random() - 0.5) * 40, life: 0.35, max: 0.35, color: Math.random() < 0.5 ? PAL.pink : PAL.amber, size: 3 });
    for (const w of this.walls) {
      w.x -= this.speed * dt;
      if (!w.passed && w.x + WALL_W < RX - 12) {
        w.passed = true;
        this.score += 1;
        this.fx.burst(RX, this.y, PAL.lime, 10, 110, 2);
      }
    }
    if (this.walls[0].x < -WALL_W - 10) {
      this.walls.shift();
      this.walls.push(this.wall(this.walls[this.walls.length - 1].x + 230));
    }
    // collisions: circle-ish hitbox vs wall rects, floor & ceiling
    const r = 11;
    let hit = this.y < r || this.y > SCREEN.h - r;
    for (const w of this.walls) {
      if (RX + r > w.x && RX - r < w.x + WALL_W) {
        const g = this.gapAt(w);
        if (this.y - r < g - w.gap / 2 || this.y + r > g + w.gap / 2) hit = true;
      }
    }
    if (hit) {
      this.over = true;
      this.shake.kick(14);
      this.fx.burst(RX, this.y, PAL.amber, 40, 260, 3.5);
      this.fx.burst(RX, this.y, PAL.pink, 20, 180, 3);
    }
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { tint: PAL.cyan, horizon: SCREEN.h * 0.78, speed: this.over ? 0 : this.speed * 0.5 });
    // firewalls
    for (const w of this.walls) {
      const g = this.gapAt(w);
      for (const [y0, y1] of [
        [0, g - w.gap / 2],
        [g + w.gap / 2, SCREEN.h],
      ]) {
        const grad = ctx.createLinearGradient(w.x, 0, w.x + WALL_W, 0);
        grad.addColorStop(0, "#3b0a1e");
        grad.addColorStop(0.5, "#5c1030");
        grad.addColorStop(1, "#3b0a1e");
        ctx.fillStyle = grad;
        ctx.fillRect(w.x, y0, WALL_W, y1 - y0);
        // bricks
        ctx.strokeStyle = "rgba(251,113,133,0.35)";
        ctx.lineWidth = 1;
        for (let y = y0 - ((y0 % 14) + 14) % 14; y < y1; y += 14) {
          ctx.beginPath();
          ctx.moveTo(w.x, y);
          ctx.lineTo(w.x + WALL_W, y);
          const off = (Math.floor(y / 14) % 2) * 11;
          for (let x = w.x + off; x < w.x + WALL_W; x += 22) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, Math.min(y + 14, y1));
          }
          ctx.stroke();
        }
        // burning edge
        const edge = y0 === 0 ? y1 : y0;
        ctx.fillStyle = PAL.red;
        glow(ctx, PAL.red, 16);
        rr(ctx, w.x - 4, edge - 4, WALL_W + 8, 8, 4);
        ctx.fill();
        noGlow(ctx);
        for (let i = 0; i < 5; i++) {
          const fx = w.x + 4 + i * 10;
          const fh = 6 + Math.abs(Math.sin(t * 9 + i * 1.7 + w.phase)) * 9;
          ctx.fillStyle = i % 2 ? PAL.amber : PAL.pink;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          const dir = y0 === 0 ? 1 : -1;
          ctx.moveTo(fx - 4, edge + dir * 3);
          ctx.quadraticCurveTo(fx, edge + dir * (3 + fh), fx + 4, edge + dir * 3);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }
    this.fx.draw(ctx);
    // rocket
    if (!this.over) {
      ctx.save();
      ctx.translate(RX, this.y);
      ctx.rotate(Math.max(-0.5, Math.min(0.9, this.vy / 600)));
      glow(ctx, PAL.cyan, 14);
      ctx.fillStyle = PAL.ink;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.quadraticCurveTo(8, -10, -14, -8);
      ctx.lineTo(-14, 8);
      ctx.quadraticCurveTo(8, 10, 20, 0);
      ctx.fill();
      noGlow(ctx);
      ctx.fillStyle = PAL.pink;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-18, -15);
      ctx.lineTo(-14, -6);
      ctx.moveTo(-8, 8);
      ctx.lineTo(-18, 15);
      ctx.lineTo(-14, 6);
      ctx.fill();
      ctx.fillStyle = PAL.cyan;
      glow(ctx, PAL.cyan, 8);
      ctx.beginPath();
      ctx.arc(5, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      noGlow(ctx);
      ctx.restore();
    }
    ctx.restore();
  }
}

export function ShipIt({ storageKey = "pickui-ship-it-best", className = "" }: ShipItProps) {
  const create = React.useCallback(() => new Flyer(), []);
  return <ArcadeCabinet create={create} title="Ship It!" controls="Space / ↑ / tap to boost" scoreLabel="deploys" storageKey={storageKey} accent={PAL.cyan} className={className} />;
}

export default ShipIt;
