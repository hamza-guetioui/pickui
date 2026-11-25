"use client";

import * as React from "react";

/**
 * fireflies — an ambient layer of particles that feel real. Pick a style:
 * glowing summer-night fireflies, drifting snow, torn paper & confetti, or
 * falling autumn leaves. Everything is drawn by hand on one canvas (leaf
 * species with veins, torn paper with ruled lines, hex snow crystals, lit
 * firefly bodies) and driven by a small physics sim: gravity + air drag,
 * 3D flutter around a tilted axis (items foreshorten and flip to show their
 * darker back), the side-slip "falling leaf" swing, sweeping wind gusts and
 * cursor wind. Depth layers add parallax, near items blur, and every item
 * casts a soft shadow on the page that sharpens as it nears the ground —
 * fireflies cast a warm pool of light instead. Items land on the bottom
 * edge and settle; snow builds a soft drift that slowly melts.
 *
 * Framework-agnostic core (`fireflies()`) + React wrapper (`<Fireflies />`).
 * Zero dependencies · one canvas · one rAF loop · respects prefers-reduced-motion.
 */

export type FirefliesStyle = "fireflies" | "snow" | "paper" | "leaves";

export type FirefliesOptions = {
  /** What drifts on the page (default "fireflies"). */
  style?: FirefliesStyle;
  /** Number of items (default per style: fireflies 40, snow 140, paper 34, leaves 30). */
  count?: number;
  /** Steady wind, roughly -1…1 (default 0.3). Negative blows left. */
  wind?: number;
  /** Palette override — any CSS colours. Leaves/paper use the whole list, snow & fireflies use the first. */
  colors?: string[];
  /** Firefly glow colour as "r,g,b" or any CSS colour (default warm yellow-green). */
  color?: string;
  /** Size multiplier (default 1). */
  size?: number;
  /** Cursor wind: moving the mouse pushes nearby items (default true). */
  interactive?: boolean;
  /** Items land on the bottom edge and settle (default true). */
  ground?: boolean;
  /** false = draw a single still frame (default true). */
  animated?: boolean;
  container?: HTMLElement;
  zIndex?: number;
};

export type FirefliesHandle = {
  destroy(): void;
  setStyle(style: FirefliesStyle): void;
  /** Send a gust of wind sweeping across (strength ~0.3…2, default 1). */
  gust(strength?: number): void;
};

type RGB = [number, number, number];
type Pt = [number, number];
type Kind = "leaf" | "scrap" | "strip" | "flake" | "fly";
type FlakeKind = "dot" | "soft" | "bokeh" | "crystal";

type Item = {
  kind: Kind;
  fk: FlakeKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** depth 0 (far) … 1 (near camera) */
  d: number;
  s: number;
  /** base height above the page plane (0…1) */
  hb: number;
  rot: number;
  rotV: number;
  tilt: number;
  tilt0: number;
  ax: number;
  fp: number;
  fpV: number;
  sp: number;
  spV: number;
  swingA: number;
  T: number;
  k: number;
  half: number;
  r: number;
  a: number;
  landed: boolean;
  lt: number;
  life: number;
  alpha: number;
  front: HTMLCanvasElement | null;
  back: HTMLCanvasElement | null;
  sw: number;
  sh: number;
  ph: number;
  ft: number;
  period: number;
  base: number;
  dbl: boolean;
  hd: number;
  still: number;
};

const TAU = Math.PI * 2;
const SHOFF = 10000;
const DEFAULT_COUNT: Record<FirefliesStyle, number> = { fireflies: 40, snow: 140, paper: 34, leaves: 30 };
const LEAF = ["#b8361c", "#d4561c", "#e3871f", "#cfa128", "#8e3a1a", "#a9631b", "#dcb648", "#7b8a2e", "#c2441f"];
const PAPER = ["#f4efe2", "#efe6cf", "#e9dcc0", "#f6f1e7", "#d9c39a", "#f3e7b5", "#dfe8ef", "#f2dcdc"];
const CONFETTI = ["#e85d4a", "#f2b33d", "#4fa3d9", "#6cc28a", "#b77ad6", "#f28fb1", "#f5e6c8"];

const R = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const frac = (x: number) => x - Math.floor(x);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const shade = (c: RGB, k: number): RGB =>
  k < 0 ? [c[0] * (1 + k), c[1] * (1 + k), c[2] * (1 + k)] : [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k];

let probe: CanvasRenderingContext2D | null = null;
function toRGB(css: string): RGB {
  const m = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/.exec(css);
  if (m) return [+m[1], +m[2], +m[3]];
  if (!probe) probe = document.createElement("canvas").getContext("2d");
  if (!probe) return [255, 255, 255];
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  const v = String(probe.fillStyle);
  if (v[0] === "#") return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  const n = v.match(/[\d.]+/g);
  return n && n.length >= 3 ? [+n[0], +n[1], +n[2]] : [255, 255, 255];
}

/** Offscreen sprite canvas whose context is centred and scaled to CSS px. */
function sprite(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.ceil(w * dpr));
  cv.height = Math.max(1, Math.ceil(h * dpr));
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  ctx.setTransform(dpr, 0, 0, dpr, cv.width / 2, cv.height / 2);
  return [cv, ctx];
}

/* ───────────────────────── leaves ───────────────────────── */

const mapleR = (th: number) => {
  const peak = 1 - Math.abs(2 * frac((th + Math.PI / 5) / (TAU / 5)) - 1);
  const teeth = 1 - Math.abs(2 * frac(th * 5) - 1);
  const lower = 1 - 0.25 * smooth(1.7, 2.3, Math.abs(th));
  return (0.19 + 0.31 * Math.pow(peak, 1.7) + 0.03 * teeth * peak) * lower;
};

/** Half-width of oak (1) / birch (2) leaves at t (0 = stem, 1 = tip). */
const leafHW = (sp: number, t: number) => {
  const s = Math.sin(Math.PI * clamp(t, 0, 1));
  if (sp === 1) return 0.34 * Math.pow(s, 0.6) * Math.min(1, t / 0.1) * (0.48 + 0.52 * Math.abs(Math.sin(Math.PI * t * 4.5 + 0.2)));
  return 0.3 * Math.pow(s, 0.8) * (1.12 - 0.45 * t);
};

function leafPath(ctx: CanvasRenderingContext2D, sp: number) {
  ctx.beginPath();
  if (sp === 0) {
    const N = 140;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * TAU - Math.PI;
      const r = mapleR(th);
      const x = Math.sin(th) * r;
      const y = -Math.cos(th) * r + 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else {
    const N = 44;
    ctx.moveTo(0, 0.5);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      ctx.lineTo(leafHW(sp, t) * (sp === 2 && i % 2 ? 1.06 : 1), 0.5 - t);
    }
    for (let i = N; i >= 0; i--) {
      const t = i / N;
      ctx.lineTo(-leafHW(sp, t) * 0.96 * (sp === 2 && i % 2 ? 1.06 : 1), 0.5 - t);
    }
  }
  ctx.closePath();
}

function drawLeaf(ctx: CanvasRenderingContext2D, L: number, sp: number, base: RGB, alt: RGB, spots: number[][], back: boolean) {
  ctx.save();
  ctx.scale(L, L);
  ctx.lineCap = "round";
  // stem
  ctx.strokeStyle = rgba(shade(base, -0.5), 0.95);
  ctx.lineWidth = 0.028;
  ctx.beginPath();
  if (sp === 0) {
    ctx.moveTo(0, 0.1);
    ctx.quadraticCurveTo(0.01, 0.4, 0.04, 0.6);
  } else {
    ctx.moveTo(0, 0.45);
    ctx.quadraticCurveTo(0.005, 0.56, 0.03, 0.66);
  }
  ctx.stroke();
  // blade
  leafPath(ctx, sp);
  const gr = ctx.createLinearGradient(0, 0.5, 0, -0.5);
  gr.addColorStop(0, rgba(alt, 1));
  gr.addColorStop(0.6, rgba(base, 1));
  gr.addColorStop(1, rgba(shade(base, -0.18), 1));
  ctx.fillStyle = gr;
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (const [sx, sy, sr, sa] of spots) {
    ctx.fillStyle = rgba(shade(base, -0.55), sa);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  if (back) {
    ctx.fillStyle = "rgba(22,11,3,0.34)";
    ctx.fillRect(-1, -1, 2, 2);
    ctx.fillStyle = "rgba(230,215,190,0.07)";
    ctx.fillRect(-1, -1, 2, 2);
  } else {
    const hl = ctx.createRadialGradient(-0.12, -0.08, 0, -0.12, -0.08, 0.6);
    hl.addColorStop(0, "rgba(255,240,205,0.2)");
    hl.addColorStop(1, "rgba(255,240,205,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(-1, -1, 2, 2);
  }
  // inner rim (edges dry out darker)
  leafPath(ctx, sp);
  ctx.lineWidth = 0.07;
  ctx.strokeStyle = rgba(shade(base, -0.55), 0.38);
  ctx.stroke();
  // veins
  ctx.strokeStyle = back ? "rgba(255,236,205,0.5)" : "rgba(255,226,172,0.36)";
  ctx.beginPath();
  if (sp === 0) {
    for (const a of [0, 1.2566, -1.2566, 2.513, -2.513]) {
      const r = mapleR(a) * 0.9;
      const ex = Math.sin(a) * r;
      const ey = -Math.cos(a) * r + 0.1;
      ctx.moveTo(0, 0.1);
      ctx.lineTo(ex, ey);
      for (const side of [-1, 1]) {
        const mx = ex * 0.45;
        const my = 0.1 + (ey - 0.1) * 0.45;
        const ba = a + side * 0.55;
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.sin(ba) * r * 0.32, my - Math.cos(ba) * r * 0.32);
      }
    }
  } else {
    ctx.moveTo(0, 0.55);
    ctx.lineTo(0, -0.46);
    const n = sp === 1 ? 5 : 7;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const t2 = t + (sp === 1 ? 0.07 : 0.1);
      const ex = leafHW(sp, t2) * 0.85;
      ctx.moveTo(0, 0.5 - t);
      ctx.lineTo(ex, 0.5 - t2);
      ctx.moveTo(0, 0.5 - t);
      ctx.lineTo(-ex, 0.5 - t2);
    }
  }
  ctx.lineWidth = back ? 0.022 : 0.016;
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/* ───────────────────────── paper ───────────────────────── */

type Scrap = { pts: Pt[]; torn: Pt[][]; col: RGB; lines: number; margin: boolean; fold: number | null; fx: number; w: number; h: number };

function makeScrap(w: number, h: number, col: RGB): Scrap {
  const j = () => R(-w * 0.07, w * 0.07);
  const corners: Pt[] = [
    [-w / 2 + j(), -h / 2 + j()],
    [w / 2 + j(), -h / 2 + j()],
    [w / 2 + j(), h / 2 + j()],
    [-w / 2 + j(), h / 2 + j()],
  ];
  const flags = corners.map(() => Math.random() < 0.4);
  if (!flags.some(Boolean)) flags[Math.floor(Math.random() * 4)] = true;
  const pts: Pt[] = [];
  const torn: Pt[][] = [];
  for (let e = 0; e < 4; e++) {
    const a = corners[e];
    const b = corners[(e + 1) % 4];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const n = Math.max(2, Math.round(len / 2));
    const seg: Pt[] = [];
    let off = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      off = flags[e] ? clamp(off + R(-0.9, 0.9), -1.6, 1.6) : R(-0.12, 0.12);
      if (i === 0) off *= 0.3;
      const p: Pt = [a[0] + (b[0] - a[0]) * t + nx * off, a[1] + (b[1] - a[1]) * t + ny * off];
      pts.push(p);
      if (flags[e]) seg.push(p);
    }
    if (flags[e]) {
      seg.push(b);
      torn.push(seg);
    }
  }
  const r = Math.random();
  return { pts, torn, col, lines: r < 0.35 ? 1 : r < 0.6 ? 2 : 0, margin: Math.random() < 0.4, fold: Math.random() < 0.5 ? R(0, Math.PI) : null, fx: R(-w / 4, w / 4), w, h };
}

function drawScrap(ctx: CanvasRenderingContext2D, sc: Scrap, back: boolean, noise: HTMLCanvasElement) {
  const { w, h } = sc;
  const path = () => {
    ctx.beginPath();
    sc.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
  };
  path();
  ctx.fillStyle = rgba(sc.col, 1);
  ctx.fill();
  ctx.save();
  ctx.clip();
  const pat = ctx.createPattern(noise, "repeat");
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(-w, -h, w * 2, h * 2);
  }
  if (!back) {
    if (sc.lines === 1) {
      ctx.strokeStyle = "rgba(80,110,170,0.34)";
      ctx.lineWidth = 0.45;
      ctx.beginPath();
      for (let y = -h / 2 + 2.4; y < h / 2; y += 3.2) {
        ctx.moveTo(-w, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      if (sc.margin) {
        ctx.strokeStyle = "rgba(205,70,70,0.38)";
        ctx.beginPath();
        ctx.moveTo(-w / 2 + w * 0.22, -h);
        ctx.lineTo(-w / 2 + w * 0.22, h);
        ctx.stroke();
      }
    } else if (sc.lines === 2) {
      ctx.strokeStyle = "rgba(30,30,40,0.36)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let y = -h / 2 + 2.2; y < h / 2 - 1; y += 2.6) {
        let x = -w / 2 + 1.5;
        while (x < w / 2 - 1.5) {
          const l = R(1, 4);
          ctx.moveTo(x, y);
          ctx.lineTo(Math.min(x + l, w / 2 - 1.5), y);
          x += l + R(0.7, 1.4);
        }
      }
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.17)";
    ctx.fillRect(-w, -h, w * 2, h * 2);
  }
  if (sc.fold !== null) {
    ctx.save();
    ctx.translate(sc.fx, 0);
    ctx.rotate(sc.fold);
    const big = w + h;
    ctx.fillStyle = back ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.09)";
    ctx.fillRect(0, -big, big, big * 2);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(0, -big);
    ctx.lineTo(0, big);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.moveTo(0.6, -big);
    ctx.lineTo(0.6, big);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // fibrous torn edges
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 0.9;
  ctx.lineJoin = "round";
  for (const seg of sc.torn) {
    ctx.beginPath();
    seg.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
  }
  path();
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 0.4;
  ctx.stroke();
}

function drawStrip(ctx: CanvasRenderingContext2D, w: number, h: number, col: RGB, back: boolean, noise: HTMLCanvasElement) {
  const gr = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, rgba(shade(col, -0.28), 1));
  gr.addColorStop(0.45, rgba(shade(col, 0.18), 1));
  gr.addColorStop(1, rgba(col, 1));
  ctx.fillStyle = gr;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  const pat = ctx.createPattern(noise, "repeat");
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(-w / 2, -h / 2, w, h);
  }
  if (back) {
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillRect(-w / 2, -h / 2, w, h);
  }
}

/* ───────────────────────── snow ───────────────────────── */

function drawCrystal(ctx: CanvasRenderingContext2D, r: number, col: RGB, back: boolean) {
  ctx.strokeStyle = rgba(col, back ? 0.7 : 0.95);
  ctx.lineWidth = Math.max(0.55, r * 0.085);
  ctx.lineCap = "round";
  ctx.shadowColor = rgba(col, 0.7);
  ctx.shadowBlur = r * 0.5;
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const P = (u: number, v: number): Pt => [c * u - s * v, s * u + c * v];
    const tip = P(r, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(tip[0], tip[1]);
    for (const [at, len] of [
      [0.35, 0.3],
      [0.6, 0.22],
      [0.82, 0.12],
    ]) {
      for (const side of [-1, 1]) {
        const p0 = P(r * at, 0);
        const p1 = P(r * at + r * len * 0.5, side * r * len * 0.866);
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
      }
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = rgba(col, 0.9);
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + Math.PI / 6;
    const px = Math.cos(a) * r * 0.16;
    const py = Math.sin(a) * r * 0.16;
    if (k) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function radialSprite(col: RGB, stops: [number, number][]): HTMLCanvasElement {
  const [cv, ctx] = sprite(64, 64, 1);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
  for (const [o, a] of stops) gr.addColorStop(o, rgba(col, a));
  ctx.fillStyle = gr;
  ctx.fillRect(-32, -32, 64, 64);
  return cv;
}

/* ───────────────────────── core ───────────────────────── */

export function fireflies(options: FirefliesOptions = {}): FirefliesHandle {
  const noop: FirefliesHandle = { destroy() {}, setStyle() {}, gust() {} };
  if (typeof window === "undefined" || typeof document === "undefined") return noop;
  const { count, wind = 0.3, colors, color, size = 1, interactive = true, ground = true, container, zIndex = 9994 } = options;
  let style: FirefliesStyle = options.style ?? "fireflies";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const animated = options.animated !== false && !reduced;
  const host = container ?? document.body;
  const fixed = !container;

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: fixed ? "fixed" : "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: String(zIndex) });
  const g = cv.getContext("2d");
  if (!g) return noop;
  host.appendChild(cv);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0;
  let H = 0;

  // shared sprites
  const snowCol = toRGB(colors?.[0] ?? "#ffffff");
  const flyCol = toRGB(colors?.[0] ?? color ?? "214,255,120");
  const flyCss = (a: number) => rgba(flyCol, a);
  const softCv = radialSprite(snowCol, [
    [0, 1],
    [0.3, 0.65],
    [0.65, 0.15],
    [1, 0],
  ]);
  const bokehCv = radialSprite(snowCol, [
    [0, 0.5],
    [0.7, 0.45],
    [0.86, 0.62],
    [0.94, 0.25],
    [1, 0],
  ]);
  const shadowCv = radialSprite([0, 0, 0], [
    [0, 0.7],
    [0.5, 0.3],
    [1, 0],
  ]);
  const [noise, nctx] = sprite(48, 48, 1);
  for (let i = 0; i < 700; i++) {
    nctx.fillStyle = Math.random() < 0.7 ? `rgba(60,45,25,${R(0.03, 0.12)})` : `rgba(255,255,255,${R(0.05, 0.15)})`;
    nctx.fillRect(R(-24, 24), R(-24, 24), R(0.6, 1.6), R(0.6, 1.2));
  }
  nctx.strokeStyle = "rgba(90,70,40,0.07)";
  nctx.lineWidth = 0.5;
  for (let i = 0; i < 14; i++) {
    const x = R(-24, 24);
    const y = R(-24, 24);
    const a = R(0, TAU);
    nctx.beginPath();
    nctx.moveTo(x, y);
    nctx.lineTo(x + Math.cos(a) * R(3, 8), y + Math.sin(a) * R(3, 8));
    nctx.stroke();
  }

  let items: Item[] = [];
  let drift = new Float32Array(0);
  const COL = 6;
  let time = 0;
  let windNow = wind * 70;
  let gustS: { x: number; dir: number; str: number; w: number; speed: number } | null = null;
  let nextGust = R(5, 10);
  let wave: { x: number; prev: number; dir: number } | null = null;
  let nextWave = R(6, 12);
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0, active: false };
  const par = { x: 0, y: 0 };

  const make = (kind: Kind, d: number): Item => {
    const s = (0.5 + 0.85 * d) * size;
    const tilt = R(0.25, 0.6);
    const it: Item = {
      kind, fk: "dot", x: 0, y: 0, vx: 0, vy: 0, d, s, hb: 0.2 + 0.8 * d,
      rot: R(0, TAU), rotV: R(-0.4, 0.4), tilt, tilt0: tilt, ax: R(0, TAU), fp: R(0, TAU),
      fpV: R(0.3, 1.4) * (Math.random() < 0.5 ? -1 : 1), sp: R(0, TAU), spV: R(0.9, 1.8), swingA: R(14, 34) * s,
      T: 40, k: 2, half: 10, r: 0, a: 1, landed: false, lt: 0, life: 6, alpha: 1,
      front: null, back: null, sw: 0, sh: 0, ph: R(0, TAU), ft: 0, period: 3, base: 3, dbl: false, hd: R(0, TAU), still: 0,
    };
    const speed = 0.55 + 0.6 * d;
    if (kind === "leaf") {
      const pal = (colors?.length ? colors : LEAF).map(toRGB);
      const L = R(24, 38) * s;
      const sp = Math.floor(Math.random() * 3);
      const base = pick(pal);
      const alt = Math.random() < 0.6 ? pick(pal) : shade(base, 0.22);
      const spots = Array.from({ length: Math.floor(R(1, 6)) }, () => [R(-0.25, 0.25), R(-0.35, 0.35), R(0.015, 0.06), R(0.12, 0.3)]);
      it.sw = it.sh = L * 1.4;
      const [f, fc] = sprite(it.sw, it.sh, dpr);
      drawLeaf(fc, L, sp, base, alt, spots, false);
      const [b, bc] = sprite(it.sw, it.sh, dpr);
      drawLeaf(bc, L, sp, base, alt, spots, true);
      it.front = f;
      it.back = b;
      it.half = L * 0.5;
      it.T = R(38, 60) * speed;
      it.k = 1.8;
      if (Math.random() < 0.25) it.fpV *= 3.2;
    } else if (kind === "scrap") {
      const pal = (colors?.length ? colors : PAPER).map(toRGB);
      const w = R(14, 28) * s;
      const h = R(10, 22) * s;
      const sc = makeScrap(w, h, pick(pal));
      it.sw = it.sh = Math.hypot(w, h) + 6;
      const [f, fc] = sprite(it.sw, it.sh, dpr);
      drawScrap(fc, sc, false, noise);
      const [b, bc] = sprite(it.sw, it.sh, dpr);
      drawScrap(bc, sc, true, noise);
      it.front = f;
      it.back = b;
      it.half = Math.max(w, h) * 0.5;
      it.T = R(30, 50) * speed;
      it.fpV = R(1, 3.5) * (Math.random() < 0.5 ? -1 : 1);
      it.spV = R(1.2, 2.2);
      it.swingA = R(10, 24) * s;
      it.k = 2.2;
    } else if (kind === "strip") {
      const pal = (colors?.length ? colors : CONFETTI).map(toRGB);
      const w = R(2.6, 4) * s;
      const h = R(9, 15) * s;
      const col = pick(pal);
      it.sw = it.sh = h + 4;
      const [f, fc] = sprite(it.sw, it.sh, dpr);
      drawStrip(fc, w, h, col, false, noise);
      const [b, bc] = sprite(it.sw, it.sh, dpr);
      drawStrip(bc, w, h, col, true, noise);
      it.front = f;
      it.back = b;
      it.half = h * 0.5;
      it.T = R(45, 70) * speed;
      it.fpV = R(5, 11) * (Math.random() < 0.5 ? -1 : 1);
      it.rotV = R(-3, 3);
      it.swingA = R(4, 10) * s;
      it.tilt = it.tilt0 = R(0.1, 0.3);
      it.k = 1.6;
    } else if (kind === "flake") {
      it.k = 3;
      it.spV = R(0.6, 1.4);
      it.swingA = R(5, 18) * (0.4 + d);
      it.tilt = it.tilt0 = 0;
      if (d > 0.86) {
        it.fk = "bokeh";
        it.r = R(6, 14) * size * d;
        it.a = R(0.16, 0.3);
        it.T = R(70, 110);
      } else if (d > 0.55 && Math.random() < 0.2) {
        it.fk = "crystal";
        it.r = R(4.5, 8.5) * size;
        it.a = 0.95;
        it.T = R(35, 55);
        it.fpV = R(0.4, 1.2) * (Math.random() < 0.5 ? -1 : 1);
        it.sw = it.sh = it.r * 2.8;
        const [f, fc] = sprite(it.sw, it.sh, dpr);
        drawCrystal(fc, it.r, snowCol, false);
        const [b, bc] = sprite(it.sw, it.sh, dpr);
        drawCrystal(bc, it.r, snowCol, true);
        it.front = f;
        it.back = b;
      } else if (d > 0.4) {
        it.fk = "soft";
        it.r = R(1.6, 3.2) * size * (0.7 + 0.5 * d);
        it.a = R(0.6, 0.9);
        it.T = R(28, 50) * speed;
      } else {
        it.fk = "dot";
        it.r = R(0.6, 1.4) * size;
        it.a = R(0.45, 0.8);
        it.T = R(14, 26);
      }
      it.half = it.r;
    } else {
      it.base = it.period = R(2.2, 5.5);
      it.ft = R(0, it.base);
      it.dbl = Math.random() < 0.3;
      it.T = R(16, 34) * (0.5 + 0.7 * d);
      it.still = Math.random() < 0.6 ? R(0.45, 1) : R(0, 0.12);
      it.s = (0.7 + 0.9 * d) * size;
    }
    return it;
  };

  const spawn = (it: Item, initial: boolean) => {
    it.landed = false;
    it.lt = 0;
    it.alpha = 1;
    it.tilt = it.tilt0;
    it.x = R(-20, W + 20);
    if (it.kind === "fly") {
      it.y = R(0.08, 0.92) * H;
      it.vx = Math.cos(it.hd) * it.T;
      it.vy = 0;
      return;
    }
    it.y = initial ? R(-0.15 * H, H * 0.95) : R(-H * 0.25, 0) - it.half - 6;
    if (!initial && windNow > 20) it.x -= R(0, Math.min(W * 0.4, windNow * 3));
    if (!initial && windNow < -20) it.x += R(0, Math.min(W * 0.4, -windNow * 3));
    it.vx = windNow;
    it.vy = it.T;
  };

  const rebuild = () => {
    const n = clamp(Math.round(count ?? DEFAULT_COUNT[style]), 0, 400);
    items = [];
    for (let i = 0; i < n; i++) {
      const d = style === "snow" ? Math.pow(Math.random(), 1.25) : Math.random();
      const kind: Kind = style === "fireflies" ? "fly" : style === "snow" ? "flake" : style === "leaves" ? "leaf" : Math.random() < 0.55 ? "scrap" : "strip";
      items.push(make(kind, d));
    }
    items.sort((a, b) => a.d - b.d);
    for (const it of items) spawn(it, true);
    drift = new Float32Array(Math.ceil(W / COL) + 2);
    gustS = null;
    wave = null;
  };

  const driftAt = (x: number) => {
    const i = clamp(Math.round(x / COL), 0, drift.length - 1);
    return drift[i] ?? 0;
  };
  const gustAt = (x: number) => (gustS ? gustS.dir * gustS.str * Math.exp(-(((x - gustS.x) / gustS.w) ** 2)) : 0);

  const gust = (strength = 1) => {
    const dir = wind >= 0 ? 1 : -1;
    gustS = { x: dir > 0 ? -300 : W + 300, dir, str: 220 * strength, w: Math.max(160, W * 0.25), speed: 420 + 200 * strength };
  };

  const step = (dt: number) => {
    time += dt;
    const wb = wind * 70;
    windNow = wb * (0.75 + 0.25 * Math.sin(time * 0.17)) + wb * 0.2 * Math.sin(time * 0.53 + 1);
    if (animated) {
      nextGust -= dt;
      if (nextGust <= 0) {
        gust(R(0.5, 1.1) * (0.4 + Math.abs(wind)) * (style === "fireflies" ? 0.4 : 1));
        nextGust = R(8, 16);
      }
    }
    if (gustS) {
      gustS.x += gustS.dir * gustS.speed * dt;
      if (gustS.x < -400 || gustS.x > W + 400) gustS = null;
    }
    // cursor
    const decay = Math.exp(-8 * dt);
    mouse.vx *= decay;
    mouse.vy *= decay;
    const mspeed = Math.hypot(mouse.vx, mouse.vy);
    const useMouse = interactive && mouse.active;
    const tx = useMouse ? clamp((mouse.x / Math.max(1, W)) * 2 - 1, -1, 1) : 0;
    const ty = useMouse ? clamp((mouse.y / Math.max(1, H)) * 2 - 1, -1, 1) : 0;
    par.x += (tx - par.x) * Math.min(1, 3 * dt);
    par.y += (ty - par.y) * Math.min(1, 3 * dt);

    if (style === "fireflies") {
      if (animated) {
        nextWave -= dt;
        if (nextWave <= 0 && !wave) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          wave = { x: dir > 0 ? -40 : W + 40, prev: dir > 0 ? -40 : W + 40, dir };
          nextWave = R(9, 16);
        }
      }
      if (wave) {
        wave.prev = wave.x;
        wave.x += wave.dir * 260 * dt;
        if (wave.x < -60 || wave.x > W + 60) wave = null;
      }
      for (const f of items) {
        f.hd += (Math.sin(time * 0.7 + f.ph) * 1.2 + (Math.random() - 0.5) * 1.6) * dt;
        const gA = gustAt(f.x);
        let tvx = Math.cos(f.hd) * f.T + windNow * 0.25 + gA * 0.5;
        let tvy = Math.sin(f.hd) * f.T * 0.7 - 2;
        if (f.y < H * 0.08) tvy += 25;
        if (f.y > H * 0.9) tvy -= 25;
        if (useMouse) {
          const dx = mouse.x - f.x;
          const dy = mouse.y - f.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 240) {
            const k = 1 - dist / 240;
            if (mspeed > 900) {
              f.vx -= (dx / dist) * mspeed * 0.9 * k * dt;
              f.vy -= (dy / dist) * mspeed * 0.9 * k * dt;
            } else if (dist > 26) {
              tvx += (dx / dist) * 55 * k;
              tvy += (dy / dist) * 55 * k;
            }
          }
        }
        f.vx += (tvx - f.vx) * Math.min(1, 1.5 * dt);
        f.vy += (tvy - f.vy) * Math.min(1, 1.5 * dt);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.x < -40) f.x += W + 80;
        if (f.x > W + 40) f.x -= W + 80;
        f.y = clamp(f.y, -20, H + 20);
        f.ft += dt;
        if (f.ft > f.period) {
          f.ft = 0;
          f.period = f.base * R(0.85, 1.2);
        }
        if (wave && (f.x - wave.prev) * (f.x - wave.x) <= 0 && f.ft > 0.9) f.ft = 0;
      }
      return;
    }

    let landedN = 0;
    for (const it of items) if (it.landed) landedN++;
    const cap = Math.max(4, items.length * 0.4);
    const melt = Math.exp(-0.012 * dt);

    for (const it of items) {
      const gA = gustAt(it.x);
      const local = windNow * (0.5 + 0.7 * it.d) + gA;
      let push = 0;
      if (useMouse && mspeed > 30) {
        const dx = it.x - mouse.x;
        const dy = it.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const RR = 130 * (0.6 + 0.6 * it.d);
        if (dist < RR) {
          const f = (1 - dist / RR) ** 2;
          it.vx += (mouse.vx * 1.2 + (dx / dist) * mspeed * 0.6) * f * dt;
          it.vy += (mouse.vy * 1.2 + (dy / dist) * mspeed * 0.6) * f * dt;
          it.fp += mspeed * f * 0.0008;
          push = mspeed * f;
        }
      }
      if (it.landed) {
        it.lt += dt;
        it.vx *= Math.exp(-(it.kind === "leaf" ? 2.2 : 4) * dt);
        it.x += it.vx * dt;
        const target = Math.round(it.fp / Math.PI) * Math.PI;
        it.fp += (target - it.fp) * Math.min(1, 5 * dt);
        it.rotV *= Math.exp(-4 * dt);
        it.rot += it.rotV * dt;
        if (Math.abs(gA) > 110 || push > 380) {
          it.landed = false;
          it.vy = -R(40, 110);
          it.vx += gA * 0.5;
          it.tilt = it.tilt0;
          it.rotV = R(-1.5, 1.5);
          continue;
        }
        if (it.lt > it.life) {
          it.alpha -= dt * 0.6;
          if (it.alpha <= 0) spawn(it, false);
        }
        continue;
      }
      it.sp += it.spV * dt;
      const swing = Math.cos(it.sp);
      let tVy: number;
      if (it.kind === "flake") tVy = it.T * (0.85 + 0.3 * swing * swing);
      else {
        const flat = 0.35 + 0.65 * Math.abs(Math.cos(it.fp));
        tVy = (it.T * (0.45 + 0.9 * swing * swing)) / flat;
      }
      tVy -= Math.abs(gA) * 0.12;
      const tVx = local + it.swingA * it.spV * swing;
      it.vx += (tVx - it.vx) * Math.min(1, it.k * dt);
      it.vy += (tVy - it.vy) * Math.min(1, 2.2 * dt);
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.fp += (it.fpV + Math.abs(gA) * 0.01 * Math.sign(it.fpV || 1)) * dt;
      it.rot += it.rotV * dt;
      if (it.x < -60) it.x += W + 120;
      else if (it.x > W + 60) it.x -= W + 120;

      if (it.kind === "flake") {
        if (ground && it.fk !== "bokeh" && it.y >= H - driftAt(it.x) - it.r * 0.3) {
          const i = Math.round(it.x / COL);
          const amt = 0.6 + it.r * 0.35;
          for (let k = -2; k <= 2; k++) {
            const j = i + k;
            if (j >= 0 && j < drift.length) drift[j] = Math.min(18, drift[j] + amt * (k === 0 ? 0.4 : Math.abs(k) === 1 ? 0.22 : 0.08));
          }
          spawn(it, false);
        } else if (it.y - it.r > H + 10) spawn(it, false);
      } else if (ground && it.y + it.half * 0.55 >= H - 1) {
        it.landed = true;
        it.y = H - 1 - it.half * 0.55;
        it.vy = 0;
        it.vx *= 0.4;
        it.lt = 0;
        it.rot += Math.sin(it.sp) * it.tilt;
        it.tilt = 0;
        it.life = landedN > cap ? R(1, 2) : R(5, 10);
        landedN++;
      } else if (!ground && it.y - it.half > H + 10) spawn(it, false);
    }

    if (style === "snow" && drift.length) {
      const n = drift.length;
      const next = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const l = drift[Math.max(0, i - 1)];
        const r = drift[Math.min(n - 1, i + 1)];
        next[i] = Math.max(0, (drift[i] + (l + r - 2 * drift[i]) * Math.min(0.5, 1.5 * dt)) * melt - 0.01 * dt);
      }
      drift = next;
    }
  };

  const heightOf = (it: Item) => (it.landed ? 0 : it.hb * (ground ? clamp((H - it.y) / (H * 0.5), 0.04, 1) : 1));

  const placeSprite = (it: Item, x: number, y: number) => {
    const c0 = Math.cos(it.fp);
    const c = (c0 < 0 ? -1 : 1) * Math.max(0.07, Math.abs(c0));
    g.translate(x, y);
    g.rotate(it.rot + Math.sin(it.sp) * it.tilt);
    g.rotate(it.ax);
    g.scale(1, c);
    g.rotate(-it.ax);
    const img = c0 < 0 ? it.back : it.front;
    if (img) g.drawImage(img, -it.sw / 2, -it.sh / 2, it.sw, it.sh);
  };

  const render = () => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";

    if (style === "fireflies") {
      const glows = items.map((f) => {
        if (!animated) return f.still;
        const dur = f.dbl ? 0.9 : 0.5;
        if (f.ft >= dur) return 0;
        return f.dbl ? Math.sin(Math.PI * frac(f.ft / 0.45)) ** 2 : Math.sin((Math.PI * f.ft) / dur) ** 2;
      });
      g.globalCompositeOperation = "lighter";
      // warm light pools cast on the page below/behind each firefly
      items.forEach((f, i) => {
        const dim = 0.45 + 0.55 * f.d;
        const gl = glows[i] * dim;
        if (gl < 0.02) return;
        const h = 0.3 + 0.7 * f.d;
        const px = f.x + par.x * (f.d - 0.35) * 18 * 0.4 + h * 22;
        const py = f.y + par.y * (f.d - 0.35) * 10 * 0.4 + h * 30;
        const rad = (34 + 60 * h) * size;
        const gr = g.createRadialGradient(px, py, 0, px, py, rad);
        gr.addColorStop(0, flyCss(0.13 * gl));
        gr.addColorStop(1, flyCss(0));
        g.fillStyle = gr;
        g.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      });
      items.forEach((f, i) => {
        const dim = 0.45 + 0.55 * f.d;
        const gl = glows[i];
        const x = f.x + par.x * (f.d - 0.35) * 18;
        const y = f.y + par.y * (f.d - 0.35) * 10;
        // bloom
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.globalCompositeOperation = "lighter";
        const Rb = f.s * (7 + 16 * gl) * (1 + Math.max(0, f.d - 0.8) * 3);
        const gr = g.createRadialGradient(x, y, 0, x, y, Rb);
        gr.addColorStop(0, flyCss(Math.min(1, 0.06 + 0.9 * gl) * dim));
        gr.addColorStop(0.18, flyCss((0.03 + 0.35 * gl) * dim));
        gr.addColorStop(1, flyCss(0));
        g.fillStyle = gr;
        g.fillRect(x - Rb, y - Rb, Rb * 2, Rb * 2);
        // body (visible when lit)
        const ang = Math.atan2(f.vy, f.vx);
        g.translate(x, y);
        g.rotate(ang);
        g.scale(f.s, f.s);
        g.globalCompositeOperation = "source-over";
        const flick = animated ? 0.35 + 0.65 * Math.abs(Math.sin(time * 62 + f.ph)) : 0.8;
        g.fillStyle = `rgba(205,215,235,${(0.08 + 0.3 * gl) * dim})`;
        for (const side of [-1, 1]) {
          g.beginPath();
          g.ellipse(-0.2, side * 1.05 * flick, 1.7, 0.7 * flick + 0.1, side * 0.45, 0, TAU);
          g.fill();
        }
        g.fillStyle = `rgba(30,24,12,${(0.15 + 0.7 * gl) * dim})`;
        g.beginPath();
        g.ellipse(-1.3, 0, 1.7, 0.95, 0, 0, TAU);
        g.fill();
        g.fillStyle = `rgba(26,20,12,${(0.18 + 0.75 * gl) * dim})`;
        g.beginPath();
        g.ellipse(1.4, 0, 1.1, 0.85, 0, 0, TAU);
        g.fill();
        g.fillStyle = `rgba(205,95,60,${0.45 * gl * dim})`;
        g.beginPath();
        g.ellipse(1.1, 0, 0.55, 0.7, 0, 0, TAU);
        g.fill();
        g.globalCompositeOperation = "lighter";
        g.fillStyle = flyCss((0.12 + 0.88 * gl) * dim);
        g.beginPath();
        g.ellipse(-1.6, 0, 1.2, 0.75, 0, 0, TAU);
        g.fill();
        g.fillStyle = `rgba(255,255,230,${0.8 * gl * dim})`;
        g.beginPath();
        g.ellipse(-1.7, 0, 0.7, 0.45, 0, 0, TAU);
        g.fill();
      });
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalCompositeOperation = "source-over";
      return;
    }

    // 1 · shadows on the page plane
    for (const it of items) {
      if (it.kind === "flake" && (it.fk === "bokeh" || (it.fk === "dot" && it.d < 0.3))) continue;
      const h = heightOf(it);
      const ox = 1.5 + h * 26 + par.x * (it.d - 0.35) * 18 * 0.4;
      const oy = 2 + h * 34 + par.y * (it.d - 0.35) * 10 * 0.4;
      const a = (0.5 - h * 0.28) * it.alpha;
      if (it.front) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.globalAlpha = 1;
        g.shadowColor = `rgba(0,0,0,${a})`;
        g.shadowBlur = (0.6 + h * 13) * dpr;
        g.shadowOffsetX = SHOFF * dpr;
        g.shadowOffsetY = 0;
        placeSprite(it, it.x + ox - SHOFF, it.y + oy);
      } else {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.shadowColor = "transparent";
        g.shadowBlur = 0;
        g.shadowOffsetX = 0;
        const sz = it.r * 2 + h * 8;
        g.globalAlpha = 0.32 * (1 - h * 0.5);
        g.drawImage(shadowCv, it.x + ox - sz, it.y + oy - sz, sz * 2, sz * 2);
      }
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.shadowColor = "transparent";
    g.shadowBlur = 0;
    g.shadowOffsetX = 0;
    g.globalAlpha = 1;

    // 2 · snow drift
    if (style === "snow" && drift.length) {
      let max = 0;
      for (let i = 0; i < drift.length; i++) max = Math.max(max, drift[i]);
      if (max > 0.3) {
        g.beginPath();
        g.moveTo(-COL, H + 2);
        g.lineTo(-COL, H - drift[0]);
        for (let i = 0; i < drift.length - 1; i++) {
          const x0 = i * COL;
          const x1 = (i + 1) * COL;
          g.quadraticCurveTo(x0, H - drift[i], (x0 + x1) / 2, H - (drift[i] + drift[i + 1]) / 2);
        }
        g.lineTo(W + COL, H - drift[drift.length - 1]);
        g.lineTo(W + COL, H + 2);
        g.closePath();
        const gr = g.createLinearGradient(0, H - max, 0, H);
        gr.addColorStop(0, rgba(snowCol, 0.95));
        gr.addColorStop(1, rgba(shade(snowCol, -0.16), 0.9));
        g.shadowColor = "rgba(0,0,0,0.35)";
        g.shadowBlur = 6 * dpr;
        g.shadowOffsetY = -1 * dpr;
        g.fillStyle = gr;
        g.fill();
        g.shadowColor = "transparent";
        g.shadowBlur = 0;
        g.shadowOffsetY = 0;
        g.strokeStyle = "rgba(255,255,255,0.55)";
        g.lineWidth = 1;
        g.stroke();
      }
    }

    // 3 · items, far → near
    for (const it of items) {
      const x = it.x + par.x * (it.d - 0.35) * 18;
      const y = it.y + par.y * (it.d - 0.35) * 10;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (it.kind === "flake" && it.fk !== "crystal") {
        if (it.fk === "dot") {
          g.globalAlpha = it.a;
          g.fillStyle = rgba(snowCol, 1);
          g.beginPath();
          g.arc(x, y, it.r, 0, TAU);
          g.fill();
        } else if (it.fk === "soft") {
          g.globalAlpha = it.a;
          g.drawImage(softCv, x - it.r * 2, y - it.r * 2, it.r * 4, it.r * 4);
        } else {
          g.globalAlpha = it.a;
          g.drawImage(bokehCv, x - it.r, y - it.r, it.r * 2, it.r * 2);
        }
        continue;
      }
      g.globalAlpha = it.alpha * (it.kind === "leaf" ? 0.94 : 1) * (0.62 + 0.38 * it.d);
      const blur = it.d > 0.84 ? (it.d - 0.84) * 12 : 0;
      if (blur > 0.2) g.filter = `blur(${blur.toFixed(2)}px)`;
      placeSprite(it, x, y);
      if (blur > 0.2) g.filter = "none";
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalAlpha = 1;
  };

  const warm = () => {
    if (style !== "fireflies") for (let i = 0; i < 240; i++) step(1 / 60);
    render();
  };

  const resize = () => {
    const nw = fixed ? window.innerWidth : host.clientWidth;
    const nh = fixed ? window.innerHeight : host.clientHeight;
    const wasEmpty = W < 2 || H < 2;
    W = nw;
    H = nh;
    cv.width = Math.max(1, Math.round(W * dpr));
    cv.height = Math.max(1, Math.round(H * dpr));
    const nd = new Float32Array(Math.ceil(W / COL) + 2);
    nd.set(drift.subarray(0, Math.min(drift.length, nd.length)));
    drift = nd;
    if (!animated) {
      for (const it of items) spawn(it, true);
      drift = new Float32Array(nd.length);
      warm();
    } else if (wasEmpty) for (const it of items) spawn(it, true);
  };

  rebuild();
  resize();

  // pointer (cursor wind)
  const onMove = (e: PointerEvent) => {
    const r = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
    const nx = e.clientX - r.left;
    const ny = e.clientY - r.top;
    const now = performance.now();
    const dtm = Math.max(8, now - mouse.t);
    if (mouse.active && dtm < 200) {
      mouse.vx = mouse.vx * 0.5 + ((nx - mouse.x) / dtm) * 1000 * 0.5;
      mouse.vy = mouse.vy * 0.5 + ((ny - mouse.y) / dtm) * 1000 * 0.5;
    }
    mouse.t = now;
    mouse.x = nx;
    mouse.y = ny;
    mouse.active = nx >= -40 && ny >= -40 && nx <= W + 40 && ny <= H + 40;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) mouse.active = false;
  };

  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt);
    render();
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || !animated || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVis = () => (document.hidden ? stop() : start());

  let ro: ResizeObserver | null = null;
  if (!fixed && typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(resize);
    ro.observe(host);
  } else window.addEventListener("resize", resize);
  if (animated) {
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onOut, { passive: true });
    }
    document.addEventListener("visibilitychange", onVis);
    start();
  }

  return {
    destroy() {
      stop();
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      document.removeEventListener("visibilitychange", onVis);
      cv.remove();
      items = [];
    },
    setStyle(s: FirefliesStyle) {
      if (s === style) return;
      style = s;
      rebuild();
      if (!animated) warm();
    },
    gust(strength = 1) {
      gust(strength);
    },
  };
}

export type FirefliesProps = Omit<FirefliesOptions, "container" | "animated"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function Fireflies({ fullscreen = false, animated = true, className = "", ...opts }: FirefliesProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const container = fullscreen ? undefined : (ref.current ?? undefined);
    if (!fullscreen && !container) return;
    const inst = fireflies({ ...(JSON.parse(key) as FirefliesOptions), animated, container });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

export default Fireflies;
