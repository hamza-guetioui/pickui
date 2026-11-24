"use client";

import * as React from "react";
import { ArcadeCabinet, PAL, Particles, SCREEN, Shake, bug, glow, lives, noGlow, sky, text, type Action, type ArcadeGame } from "./arcade-cabinet";

/**
 * BugInvaders — a love letter to Space Invaders: a swarm of bugs marches
 * down the screen. Slide your ship, fire, dodge their shots and clear wave
 * after wave before they land. The swarm speeds up as it thins out, and a
 * glowing "zero-day" bug sometimes flies across the top for bonus points.
 * Game · zero dependencies (needs ./arcade-cabinet).
 */

export type BugInvadersProps = {
  /** localStorage key for the best score (null disables). */
  storageKey?: string | null;
  className?: string;
};

const COLS = 9;
const ROWS = 4;
const SX = 50; // swarm spacing
const SY = 36;
const PY = SCREEN.h - 34;
const ROW_COLORS = [PAL.pink, PAL.violet, PAL.cyan, PAL.lime];

type Enemy = { c: number; r: number; alive: boolean };
type Shot = { x: number; y: number; vy: number };

class Invaders implements ArcadeGame {
  score = 0;
  over = false;
  message?: string;
  private px = SCREEN.w / 2;
  private keys = { left: false, right: false, fire: false };
  private swarm: Enemy[] = [];
  private ox = 0;
  private oy = 0;
  private dir = 1;
  private shots: Shot[] = [];
  private enemyShots: Shot[] = [];
  private cool = 0;
  private lives = 3;
  private wave = 1;
  private hurt = 0;
  private ufo: { x: number; dir: number } | null = null;
  private fx = new Particles();
  private shake = new Shake();
  private time = 0;

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
    this.spawn();
  }
  private spawn() {
    this.swarm = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) this.swarm.push({ c, r, alive: true });
    this.ox = (SCREEN.w - (COLS - 1) * SX) / 2;
    this.oy = 64 + Math.min(this.wave - 1, 4) * 10;
    this.dir = 1;
    this.shots = [];
    this.enemyShots = [];
    this.ufo = null;
  }
  private pos(e: Enemy) {
    return { x: this.ox + e.c * SX, y: this.oy + e.r * SY };
  }
  input(a: Action, pressed: boolean) {
    if (a === "left" || a === "right") this.keys[a] = pressed;
    if (a === "primary" || a === "up") {
      this.keys.fire = pressed;
      if (pressed) this.fire();
    }
  }
  pointer(x: number) {
    this.px = Math.max(20, Math.min(SCREEN.w - 20, x));
  }
  private fire() {
    if (this.cool > 0 || this.shots.length >= 3) return;
    this.shots.push({ x: this.px, y: PY - 14, vy: -520 });
    this.cool = 0.28;
  }
  step(dt: number) {
    this.fx.step(dt, 60);
    this.shake.step(dt);
    if (this.over) return;
    this.time += dt;
    this.cool -= dt;
    this.hurt = Math.max(0, this.hurt - dt);
    if (this.keys.fire) this.fire();
    const move = (Number(this.keys.right) - Number(this.keys.left)) * 360 * dt;
    if (move) this.pointer(this.px + move);
    // swarm march
    const alive = this.swarm.filter((e) => e.alive);
    const speed = (30 + (COLS * ROWS - alive.length) * 4.2) * (1 + (this.wave - 1) * 0.15);
    this.ox += this.dir * speed * dt;
    const xs = alive.map((e) => this.pos(e).x);
    if (Math.max(...xs) > SCREEN.w - 24 || Math.min(...xs) < 24) {
      this.dir *= -1;
      this.ox += this.dir * speed * dt * 2;
      this.oy += 14;
    }
    // enemy fire (from the lowest bug in a random column)
    if (Math.random() < dt * (0.9 + this.wave * 0.25)) {
      const col = alive[Math.floor(Math.random() * alive.length)]?.c;
      const low = alive.filter((e) => e.c === col).sort((a, b) => b.r - a.r)[0];
      if (low) {
        const p = this.pos(low);
        this.enemyShots.push({ x: p.x, y: p.y + 10, vy: 190 + this.wave * 15 });
      }
    }
    // zero-day UFO
    if (!this.ufo && Math.random() < dt * 0.08) this.ufo = Math.random() < 0.5 ? { x: -30, dir: 1 } : { x: SCREEN.w + 30, dir: -1 };
    if (this.ufo) {
      this.ufo.x += this.ufo.dir * 130 * dt;
      if (this.ufo.x < -40 || this.ufo.x > SCREEN.w + 40) this.ufo = null;
    }
    // shots
    for (const s of this.shots) s.y += s.vy * dt;
    for (const s of this.enemyShots) s.y += s.vy * dt;
    this.shots = this.shots.filter((s) => {
      if (s.y < 30) return false;
      if (this.ufo && Math.abs(s.x - this.ufo.x) < 20 && Math.abs(s.y - 46) < 10) {
        this.score += 150;
        this.fx.burst(this.ufo.x, 46, PAL.amber, 30, 220, 3);
        this.shake.kick(6);
        this.ufo = null;
        return false;
      }
      for (const e of alive) {
        if (!e.alive) continue;
        const p = this.pos(e);
        if (Math.abs(s.x - p.x) < 13 && Math.abs(s.y - p.y) < 12) {
          e.alive = false;
          this.score += (ROWS - e.r) * 10;
          this.fx.burst(p.x, p.y, ROW_COLORS[e.r], 14, 160, 2.5);
          this.shake.kick(2);
          return false;
        }
      }
      return true;
    });
    this.enemyShots = this.enemyShots.filter((s) => {
      if (s.y > SCREEN.h) return false;
      if (this.hurt <= 0 && Math.abs(s.x - this.px) < 16 && Math.abs(s.y - PY) < 12) {
        this.loseLife();
        return false;
      }
      return true;
    });
    const remaining = this.swarm.filter((e) => e.alive);
    if (!remaining.length) {
      this.wave++;
      this.spawn();
    } else if (Math.max(...remaining.map((e) => this.pos(e).y)) > PY - 22) {
      this.over = true;
      this.message = "The bugs landed";
      this.shake.kick(14);
    }
  }
  private loseLife() {
    this.lives--;
    this.hurt = 1.5;
    this.shake.kick(12);
    this.fx.burst(this.px, PY, PAL.pink, 30, 220, 3);
    this.enemyShots = [];
    if (this.lives <= 0) {
      this.over = true;
      this.message = "Ship down";
    }
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.shake.apply(ctx);
    sky(ctx, t, { tint: PAL.violet, horizon: SCREEN.h - 16, speed: 15 });
    lives(ctx, this.lives);
    text(ctx, `wave ${this.wave}`, SCREEN.w - 14, 20, 12, PAL.dim, "right");
    // swarm
    for (const e of this.swarm) {
      if (!e.alive) continue;
      const p = this.pos(e);
      bug(ctx, p.x, p.y + Math.sin(t * 4 + e.c) * 1.5, 22, ROW_COLORS[e.r], t + e.c * 0.3);
    }
    if (this.ufo) {
      ctx.save();
      ctx.translate(this.ufo.x, 46);
      ctx.fillStyle = PAL.amber;
      glow(ctx, PAL.amber, 18);
      ctx.beginPath();
      ctx.ellipse(0, 2, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -3, 9, 7, 0, Math.PI, 0);
      ctx.fill();
      noGlow(ctx);
      ctx.fillStyle = "#05041a";
      for (const x of [-11, 0, 11]) if (Math.floor(t * 6 + x) % 2 === 0) ctx.fillRect(x - 1.5, 1, 3, 3);
      ctx.restore();
    }
    // shots
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = PAL.cyan;
    glow(ctx, PAL.cyan, 12);
    for (const s of this.shots) {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + 12);
      ctx.stroke();
    }
    ctx.strokeStyle = PAL.red;
    glow(ctx, PAL.red, 10);
    for (const s of this.enemyShots) {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) ctx.lineTo(s.x + (i % 2 ? 3 : -3), s.y + i * 4);
      ctx.stroke();
    }
    noGlow(ctx);
    // ship
    if (!(this.hurt > 0 && Math.floor(t * 12) % 2)) {
      ctx.save();
      ctx.translate(this.px, PY);
      ctx.fillStyle = PAL.pink;
      glow(ctx, PAL.pink, 16);
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(16, 10);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-16, 10);
      ctx.closePath();
      ctx.fill();
      noGlow(ctx);
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.arc(0, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    this.fx.draw(ctx);
    ctx.restore();
  }
}

export function BugInvaders({ storageKey = "pickui-bug-invaders-best", className = "" }: BugInvadersProps) {
  const create = React.useCallback(() => new Invaders(), []);
  return <ArcadeCabinet create={create} title="Bug Invaders" controls="Mouse / touch / ← → · Space or tap to fire (hold = auto)" scoreLabel="points" storageKey={storageKey} accent={PAL.lime} className={className} />;
}

export default BugInvaders;
