"use client";

import * as React from "react";

/**
 * ghost-walker — translucent ghosts that haunt your website.
 *
 * Every ghost glows softly, its hem ripples, it bobs, and its little eyes
 * follow your cursor. Two personalities:
 * - "shy" (default): they drift around, and when you chase them they get
 *   scared and flee off the edge of the page, then hide behind it — only the
 *   top of the head peeks in, watching you. Come close and they duck; leave
 *   them alone for a few seconds and they float back in. Click = *poof*.
 * - "prankster": they don't run. Chase or click them and they pull one of
 *   30 silly reactions (laugh with friends, sing, dance, magic, tease, play
 *   dead, throw stuff, selfie, juggle, fake scare).
 * With `interact` they also mess with page content (tug, blow, hide behind,
 * possess buttons, flicker text, nudge words) — always fully restored.
 *
 * Framework-agnostic core (`ghostWalker()`) + a React wrapper (`<GhostWalker />`).
 * Zero dependencies · respects prefers-reduced-motion.
 */

export type GhostBehavior = "shy" | "prankster";

export type GhostWalkerOptions = {
  /** Number of ghosts (default 3). */
  count?: number;
  /** Ghost size in px (default 56). */
  size?: number;
  /** Speed multiplier (default 1). */
  speed?: number;
  /** Distance at which the cursor counts as a threat (default 150). */
  fleeRadius?: number;
  /** "shy" flees & hides behind edges, "prankster" reacts with silly pranks (default "shy"). */
  behavior?: GhostBehavior;
  /** Let ghosts play with page content (default false). */
  interact?: boolean;
  /** Ghost opacity (default 0.6). */
  opacity?: number;
  /** Tint of the default ghost (default: a soft pastel per ghost). */
  color?: string;
  /** Custom shape: SVG markup, a single emoji, or an image URL. */
  shape?: string;
  /** Click a ghost to poof it / trigger a prank (default true). */
  clickable?: boolean;
  /** Element to haunt (default: the whole page, fixed). */
  container?: HTMLElement;
  /** z-index of the ghost layer (default 9999). */
  zIndex?: number;
};

export type GhostWalkerHandle = {
  destroy(): void;
  setBehavior(b: GhostBehavior): void;
  setInteract(on: boolean): void;
};

const STYLE_ID = "gx-ghost-walker-style";
const CSS = `
.gxg{position:absolute;left:0;top:0;will-change:transform;user-select:none;-webkit-user-select:none;transform-origin:50% 50%}
.gxg-r,.gxg-in{position:absolute;inset:0}
.gxg-in{animation:gxg-bob 2.6s ease-in-out infinite;filter:drop-shadow(0 0 6px rgba(221,214,254,.8)) drop-shadow(0 0 16px rgba(196,181,253,.45))}
.gxg-in svg,.gxg-in img{display:block;width:100%;height:100%;overflow:visible}
.gxg[data-scared] .gxg-in{animation:gxg-shiver .09s linear infinite}
.gxg-e{transform-box:fill-box;transform-origin:center;transition:transform .15s}
.gxg[data-scared] .gxg-e,.gxg[data-face=boo] .gxg-e{transform:scale(1.55)}
.gxg-x,.gxg-t,.gxg-boo,.gxg-wk,.gxg-sad{display:none}
.gxg[data-face=x] .gxg-x,.gxg[data-face=tongue] .gxg-t,.gxg[data-face=boo] .gxg-boo,.gxg[data-face=wink] .gxg-wk,.gxg[data-face=peek] .gxg-wk,.gxg[data-face=sorry] .gxg-sad{display:inline}
.gxg[data-face=x] .gxg-eyes,.gxg[data-face=wink] .gxg-er,.gxg[data-face=peek] .gxg-er,.gxg[data-face=x] .gxg-m,.gxg[data-face=boo] .gxg-m,.gxg[data-face=sorry] .gxg-m,.gxg[data-face=tongue] .gxg-m{display:none}
.gxg[data-scared] .gxg-m{transform:scale(1.4);transform-box:fill-box;transform-origin:center}
.gxg-b{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%) scale(.6);opacity:0;transition:opacity .2s,transform .2s;background:#fff;color:#1e1b4b;font:700 11px/1.2 ui-sans-serif,system-ui,sans-serif;padding:4px 8px;border-radius:10px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.3);pointer-events:none;z-index:2}
.gxg-b::after{content:"";position:absolute;left:50%;top:100%;margin-left:-4px;border:4px solid transparent;border-top-color:#fff}
.gxg-b[data-on]{opacity:1;transform:translateX(-50%) scale(1)}
.gxg[data-jug] .gxg-b{bottom:calc(100% + 46px)}
.gxg-r{transition:opacity .35s,transform .35s}
.gxg[data-poof] .gxg-r{opacity:0;transform:scale(1.4)}
@keyframes gxg-bob{50%{transform:translateY(-6px)}}
@keyframes gxg-shiver{25%{transform:translate(-1.5px,-1px)}75%{transform:translate(1.5px,1px)}}
.gxr-spin{animation:gxr-spin .7s ease-in-out 3}
@keyframes gxr-spin{to{transform:rotate(360deg)}}
.gxr-moon{animation:gxr-moon 1.2s ease-in-out 2}
@keyframes gxr-moon{0%,100%{transform:none}25%{transform:translateX(-14px) skewX(-10deg)}50%{transform:translateX(-24px)}75%{transform:translateX(-10px) skewX(10deg)}}
.gxr-wig{animation:gxr-wig .25s ease-in-out 10}
@keyframes gxr-wig{0%,100%{transform:none}25%{transform:rotate(-12deg) translateY(-3px)}75%{transform:rotate(12deg) translateY(-3px)}}
.gxr-sway{animation:gxr-sway 1s ease-in-out infinite alternate}
@keyframes gxr-sway{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}
.gxr-shake{animation:gxr-shake .18s linear 8}
@keyframes gxr-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.gxr-dead{animation:gxr-dead .5s ease-in forwards}
@keyframes gxr-dead{to{transform:translateY(22%) rotate(var(--gx-fall,90deg))}}
.gxr-boo{animation:gxr-boo 2.6s ease-in-out forwards}
@keyframes gxr-boo{12%,45%{transform:scale(1.9)}60%,100%{transform:scale(.8) translateY(10%)}}
.gxr-pop{animation:gxr-pop .4s cubic-bezier(.3,1.6,.6,1)}
@keyframes gxr-pop{from{transform:scale(0)}}
.gxr-lean{animation:gxr-lean .5s ease-in-out infinite alternate}
@keyframes gxr-lean{from{transform:rotate(-8deg)}to{transform:rotate(10deg) translateX(3px)}}
.gxr-throw{animation:gxr-throw .6s ease-out}
@keyframes gxr-throw{40%{transform:rotate(-14deg) translateX(-4px)}70%{transform:rotate(10deg) translateX(4px)}}
.gxr-sel{transform:rotate(-8deg)}
.gxp{position:absolute;left:0;top:0;pointer-events:none;translate:-50% -50%;will-change:transform,opacity}
.gxp svg{display:block}
.gxp-note{font:700 17px/1 Georgia,serif;color:#e9d5ff;text-shadow:0 0 6px #a78bfa;animation:gxp-rise 1.6s ease-out forwards}
@keyframes gxp-rise{from{opacity:0}15%{opacity:1}to{opacity:0;transform:translate(var(--dx,10px),-64px) rotate(20deg)}}
.gxp-throw{animation:gxp-throw .6s cubic-bezier(.3,.1,.6,1) forwards}
@keyframes gxp-throw{50%{transform:translate(calc(var(--dx) * .5),calc(var(--dy) * .5 - 50px)) rotate(180deg)}to{transform:translate(var(--dx),var(--dy)) rotate(360deg)}}
.gxp-splat{animation:gxp-splat 1.4s ease-out forwards}
@keyframes gxp-splat{from{transform:scale(.2)}12%{transform:scale(1.2)}20%{transform:scale(1)}75%{opacity:1}to{opacity:0;transform:translateY(10px)}}
.gxp-conf{width:6px;height:9px;border-radius:1px;animation:gxp-fly 1.1s ease-out forwards}
@keyframes gxp-fly{to{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(540deg)}}
.gxp-flash{inset:0;translate:none;background:#fff;animation:gxp-flash .55s ease-out forwards}
@keyframes gxp-flash{from{opacity:.9}to{opacity:0}}
.gxp-puff{width:0;height:0;translate:none}
.gxp-puff i{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:rgba(237,233,254,.8);filter:blur(1px);animation:gxp-fly2 .6s ease-out forwards}
@keyframes gxp-fly2{to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(2.2)}}
.gxp-wisp{border-radius:50%;background:radial-gradient(closest-side,rgba(237,233,254,.5),rgba(237,233,254,0));animation:gxp-wisp .7s ease-out forwards}
@keyframes gxp-wisp{from{opacity:.75}to{opacity:0;transform:scale(.45)}}
.gxp-up{animation:gxp-up 1.7s cubic-bezier(.3,1.5,.6,1) forwards}
@keyframes gxp-up{from{opacity:0;transform:translateY(16px) scale(.2)}20%{opacity:1;transform:translateY(-6px)}80%{opacity:1}to{opacity:0;transform:translateY(-12px)}}
.gxp-jug{width:0;height:0;translate:none}
.gxp-jug>span{position:absolute;left:-7px;top:-7px;animation:gxp-jug 1.2s linear infinite}
@keyframes gxp-jug{0%,100%{transform:translate(-15px,0)}25%{transform:translate(-4px,-36px)}50%{transform:translate(15px,0)}75%{transform:translate(4px,-14px)}}
.gxp-wind{width:18px;height:2px;border-radius:2px;background:rgba(237,233,254,.85);animation:gxp-wind .7s ease-out forwards}
@keyframes gxp-wind{from{opacity:0;transform:scaleX(.3)}30%{opacity:1}to{opacity:0;transform:translateX(var(--dx))}}
.gxp-drift{animation:gxp-drift 1.8s ease-out forwards}
@keyframes gxp-drift{from{opacity:0;transform:scale(.3) rotate(-30deg)}20%{opacity:1;transform:rotate(-8deg)}80%{opacity:1}to{opacity:0;transform:translateY(30px) rotate(8deg)}}
@media (prefers-reduced-motion:reduce){.gxg *,.gxp{animation:none!important;transition:none!important}}
`;

const TINTS = ["#f5f3ff", "#eef2ff", "#fdf4ff", "#ecfeff", "#f0fdf4"];
const LOOKS = [1, 0.82, 1.14, 0.92, 1.05];
const EYES: [number, number][] = [
  [3.2, 4.6],
  [3.6, 3.6],
  [2.6, 5.2],
  [3.8, 2.7],
];

const f1 = (n: number) => Math.round(n * 10) / 10;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const clamp = (v: number, a: number, b: number) => (b < a ? (a + b) / 2 : Math.max(a, Math.min(b, v)));

/** Body outline with a rippling hem (t = time in seconds). */
function hem(t: number) {
  const s = (k: number) => Math.sin(t * 3.2 + k * 1.15);
  const sw = Math.sin(t * 1.7) * 1.6;
  let d = `M5 30C5 14 16 3 30 3C44 3 55 14 55 30L${f1(55 + sw)} ${f1(60 + s(0) * 2)}`;
  const n = 5;
  const w = 50 / n;
  for (let k = 0; k < n; k++) {
    const x0 = 55 + sw - k * w;
    const x1 = x0 - w;
    d += `Q${f1((x0 + x1) / 2 + s(k))} ${f1(67 + s(k + 0.5) * 3.5)} ${f1(x1)} ${f1(60 + s(k + 1) * 2.2)}`;
  }
  return d + "Z";
}

let uidN = 0;
/** The default ghost artwork (original). `plain` drops the alternate faces (no CSS needed). */
function ghostSvg(tint: string, eye: number, plain = false) {
  const uid = `gxg${++uidN}`;
  const [rx, ry] = EYES[eye % EYES.length];
  const e = (cx: number, cls: string) =>
    `<g class="gxg-e ${cls}"><ellipse cx="${cx}" cy="30" rx="${rx}" ry="${ry}" fill="#1e1b4b"/><circle cx="${cx + 1}" cy="${f1(30 - ry * 0.45)}" r="1.1" fill="#fff" opacity=".9"/></g>`;
  const faces = plain
    ? ""
    : `<path class="gxg-wk" d="M34 30q4-3.5 8 0" stroke="#1e1b4b" stroke-width="2" fill="none" stroke-linecap="round"/>
<g class="gxg-x" stroke="#1e1b4b" stroke-width="2.2" stroke-linecap="round"><path d="M18 26l8 8M26 26l-8 8M34 26l8 8M42 26l-8 8"/></g>
<g class="gxg-t"><path d="M25 40q5 3.5 10 0" stroke="#1e1b4b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 41.6h4v3.2a2 2 0 0 1-4 0z" fill="#f472b6"/></g>
<ellipse class="gxg-boo" cx="30" cy="45" rx="6" ry="7.5" fill="#1e1b4b"/>
<path class="gxg-sad" d="M24 44q3-2.4 6 0t6 0" stroke="#1e1b4b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 60 72" aria-hidden="true"><defs><radialGradient id="${uid}" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="${tint}"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".5"/></radialGradient></defs>
<path class="gxg-body" d="${hem(eye)}" fill="url(#${uid})"/>
<ellipse cx="21" cy="14" rx="7" ry="4" fill="#fff" opacity=".55" transform="rotate(-25 21 14)"/>
<ellipse cx="15" cy="38" rx="3.5" ry="2" fill="#f9a8d4" opacity=".45"/><ellipse cx="45" cy="38" rx="3.5" ry="2" fill="#f9a8d4" opacity=".45"/>
<g class="gxg-eyes">${e(22, "gxg-el")}${e(38, "gxg-er")}</g>
<ellipse class="gxg-m" cx="30" cy="41" rx="2.4" ry="1.9" fill="#1e1b4b" opacity=".8"/>${faces}</svg>`;
}

function renderShape(shape: string) {
  if (shape.trim().startsWith("<")) return shape;
  if (/^(https?:|\/|data:)/.test(shape)) return `<img src="${shape}" alt="" draggable="false" style="object-fit:contain">`;
  return `<span style="display:grid;place-items:center;width:100%;height:100%;font-size:80%">${shape}</span>`;
}

/* tiny original props */
const sv = (body: string, s = 16) => `<svg viewBox="0 0 20 20" width="${s}" height="${s}">${body}</svg>`;
const P = {
  star: sv('<path d="M10 1l2.6 5.8 6.3.6-4.8 4.2 1.4 6.2L10 14.6 4.5 17.8l1.4-6.2L1.1 7.4l6.3-.6z" fill="#fde047"/>', 14),
  eye: sv('<circle cx="10" cy="10" r="8" fill="#fff" stroke="#fca5a5"/><circle cx="11" cy="9" r="3.6" fill="#3b82f6"/><circle cx="11" cy="9" r="1.7" fill="#111"/>', 14),
  pumpkin: sv('<ellipse cx="6.5" cy="12" rx="4.5" ry="6" fill="#ea580c"/><ellipse cx="13.5" cy="12" rx="4.5" ry="6" fill="#ea580c"/><ellipse cx="10" cy="12" rx="4.5" ry="6.5" fill="#f97316"/><path d="M10 6V2.5l2-1" stroke="#16a34a" stroke-width="2" fill="none"/>', 14),
  paper: sv('<circle cx="10" cy="10" r="7.5" fill="#e5e7eb"/><path d="M5 8l4 2 3-4M8 14l3-3 4 2" stroke="#9ca3af" fill="none"/>'),
  pie: sv('<path d="M2 10h16l-2 6H4z" fill="#b45309"/><path d="M2 10q8-7 16 0z" fill="#fde68a"/><circle cx="10" cy="5" r="1.6" fill="#ef4444"/>', 18),
  splat: sv('<path d="M10 2q2 4 5 1-1 4 4 5-4 2-1 6-4-1-5 4-2-4-6-2 2-3-4-6 4-1 2-5 4 1 5-3z" fill="#fef3c7" stroke="#fcd34d"/><circle cx="9" cy="10" r="1.6" fill="#ef4444"/>', 34),
  bunny: sv('<ellipse cx="7" cy="5" rx="1.8" ry="4.5" fill="#fff"/><ellipse cx="13" cy="5" rx="1.8" ry="4.5" fill="#fff"/><ellipse cx="7" cy="5" rx=".8" ry="3" fill="#f9a8d4"/><ellipse cx="13" cy="5" rx=".8" ry="3" fill="#f9a8d4"/><circle cx="10" cy="13" r="5.5" fill="#fff"/><circle cx="8" cy="12" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="10" cy="14" r=".7" fill="#f472b6"/>', 22),
  flower: sv('<path d="M10 11v9" stroke="#16a34a" stroke-width="1.6"/><g fill="#f9a8d4"><circle cx="10" cy="4" r="3"/><circle cx="14.5" cy="7.5" r="3"/><circle cx="12.8" cy="12.5" r="3"/><circle cx="7.2" cy="12.5" r="3"/><circle cx="5.5" cy="7.5" r="3"/></g><circle cx="10" cy="8.6" r="2.4" fill="#fde047"/>', 22),
  camera: sv('<rect x="1" y="6" width="18" height="12" rx="2" fill="#334155"/><rect x="6" y="3.5" width="6" height="3" rx="1" fill="#334155"/><circle cx="10" cy="12" r="4" fill="#94a3b8" stroke="#0f172a" stroke-width="1.5"/><circle cx="15.8" cy="8.6" r="1" fill="#fde047"/>', 20),
  photo: sv('<rect x="2" y="1" width="16" height="18" rx="1" fill="#fff"/><rect x="4" y="3" width="12" height="11" fill="#1e1b4b"/><path d="M7 14V8q3-4 6 0v6l-1.5-1-1.5 1-1.5-1z" fill="#ede9fe"/>', 26),
};
const NOTES = ["♪", "♫", "♬"];
const SONGS = [
  ["♪ la-la-la, you can't catch me ♪", "♪ I'm made of air~ ♪"],
  ["♪ boo-hoo-hoo, I'm haunting you ♪", "♪ all night long~ ♪"],
  ["♪ whooo's that cursor? ♪", "♪ it's chasing meee ♪"],
];

type Edge = 0 | 1 | 2 | 3; // top, right, bottom, left
const EDGE_ROT = [180, -90, 0, 90];
const EN: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
type Mode = "wander" | "flee" | "hidden" | "return" | "gone" | "goto" | "act" | "react";
type Act = "tug" | "blow" | "hide" | "possess" | "flicker" | "word";
type G = {
  el: HTMLDivElement;
  r: HTMLDivElement;
  inner: HTMLDivElement;
  bub: HTMLDivElement;
  body: SVGPathElement | null;
  eyes: SVGGElement | null;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  rot: number;
  mode: Mode;
  t: number;
  edge: Edge;
  along: number;
  peek: number;
  safe: number;
  wait: number;
  calm: number;
  cd: number;
  slow: number;
  alpha: number;
  alphaT: number;
  phase: number;
  wt: number;
  wisp: number;
  rid: number;
  last: number;
  act: Act | null;
  target: HTMLElement | null;
  anims: Animation[];
  undo: (() => void) | null;
  after: (() => void) | null;
};

let styleRefs = 0;

/** Start the haunting. Returns a handle with destroy(), setBehavior(), setInteract(). */
export function ghostWalker(options: GhostWalkerOptions = {}): GhostWalkerHandle {
  const {
    count = 3,
    size = 56,
    speed = 1,
    fleeRadius = 150,
    opacity = 0.6,
    color,
    shape,
    clickable = true,
    container,
    zIndex = 9999,
  } = options;
  let behavior: GhostBehavior = options.behavior ?? "shy";
  let interactOn = options.interact ?? false;
  const noop: GhostWalkerHandle = { destroy() {}, setBehavior() {}, setInteract() {} };
  if (typeof window === "undefined" || typeof document === "undefined") return noop;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  styleRefs++;

  const host = container ?? document.body;
  const fixed = !container;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: fixed ? "fixed" : "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: String(zIndex) });
  host.appendChild(layer);

  let alive = true;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (alive) fn();
    }, ms);
    timers.add(id);
  };
  const gl = (g: G, fn: () => void, ms: number) => {
    const id = g.rid;
    later(() => {
      if (g.rid === id) fn();
    }, ms);
  };

  let W = 0;
  let H = 0;
  let L = 0;
  let T = 0;
  const measure = () => {
    const r = layer.getBoundingClientRect();
    W = r.width;
    H = r.height;
    L = r.left;
    T = r.top;
  };
  measure();

  /* pointer */
  const mouse = { x: -1e5, y: -1e5, on: false };
  let pmx = 0;
  let pmy = 0;
  let mvx = 0;
  let mvy = 0;
  let mx = -1e5;
  let my = -1e5;
  let mIn = false;
  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.on = true;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) mouse.on = false;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  document.addEventListener("pointerout", onOut, { passive: true });

  /* helpers */
  const prop = (cls: string, x: number, y: number, html = "", ms = 1500, vars: Record<string, string> = {}, parent: HTMLElement = layer) => {
    const p = document.createElement("div");
    p.className = "gxp " + cls;
    p.innerHTML = html;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    for (const k in vars) p.style.setProperty(k, vars[k]);
    parent.appendChild(p);
    later(() => p.remove(), ms);
    return p;
  };
  const puff = (x: number, y: number) => {
    const p = prop("gxp-puff", x, y, "", 700);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      p.insertAdjacentHTML("beforeend", `<i style="--dx:${f1(Math.cos(a) * 26)}px;--dy:${f1(Math.sin(a) * 26)}px"></i>`);
    }
  };
  const say = (g: G, text: string) => {
    g.bub.textContent = text;
    if (text) g.bub.dataset.on = "";
    else delete g.bub.dataset.on;
  };
  const face = (g: G, f: string) => {
    if (f) g.el.dataset.face = f;
    else delete g.el.dataset.face;
  };
  const look = (eyes: SVGGElement | null, x: number, y: number, rot: number) => {
    if (!eyes) return;
    let ex = Math.sin(performance.now() / 900) * 1.5;
    let ey = 0;
    if (mIn) {
      const lx = mx - x;
      const ly = my - y;
      const a = (-rot * Math.PI) / 180;
      const ux = lx * Math.cos(a) - ly * Math.sin(a);
      const uy = lx * Math.sin(a) + ly * Math.cos(a);
      const len = Math.hypot(ux, uy) || 1;
      const k = Math.min(2.8, len / 30) / len;
      ex = ux * k;
      ey = uy * k;
    }
    eyes.setAttribute("transform", `translate(${f1(ex)} ${f1(ey)})`);
  };
  const tintOf = (i: number) => color ?? TINTS[i % TINTS.length];
  const friend = (x: number, y: number, text: string, ms: number, rot = 0) => {
    const fw = size * 0.72;
    const fh = fw * 1.2;
    const fx = clamp(x, fw / 2, W - fw / 2);
    const fy = clamp(y, fh / 2 + 24, H - fh / 2);
    const el = document.createElement("div");
    el.className = "gxg";
    el.style.cssText = `width:${fw}px;height:${fh}px;transform:translate(${f1(fx - fw / 2)}px,${f1(fy - fh / 2)}px) rotate(${rot}deg)`;
    el.innerHTML = `<div class="gxg-b"${text ? " data-on" : ""}></div><div class="gxg-r gxr-pop"><div class="gxg-in" style="opacity:${opacity}">${
      shape ? renderShape(shape) : ghostSvg(tintOf(Math.floor(Math.random() * 5)), Math.floor(Math.random() * 4))
    }</div></div>`;
    (el.firstChild as HTMLElement).textContent = text;
    layer.appendChild(el);
    look(el.querySelector<SVGGElement>(".gxg-eyes"), fx, fy, rot);
    later(() => {
      el.dataset.poof = "";
      later(() => el.remove(), 400);
    }, ms);
  };

  /* ghosts */
  const ghosts: G[] = Array.from({ length: Math.max(0, count) }, (_, i) => {
    const w = size * LOOKS[i % LOOKS.length];
    const h = w * 1.2;
    const el = document.createElement("div");
    el.className = "gxg";
    el.style.width = `${f1(w)}px`;
    el.style.height = `${f1(h)}px`;
    el.style.pointerEvents = clickable ? "auto" : "none";
    el.style.cursor = clickable ? "pointer" : "default";
    el.innerHTML = `<div class="gxg-b"></div><div class="gxg-r"><div class="gxg-in" style="opacity:${opacity};animation-delay:-${f1(i * 0.7)}s">${
      shape ? renderShape(shape) : ghostSvg(tintOf(i), i)
    }</div></div>`;
    layer.appendChild(el);
    const g: G = {
      el,
      bub: el.children[0] as HTMLDivElement,
      r: el.children[1] as HTMLDivElement,
      inner: el.children[1].firstChild as HTMLDivElement,
      body: el.querySelector<SVGPathElement>(".gxg-body"),
      eyes: el.querySelector<SVGGElement>(".gxg-eyes"),
      w,
      h,
      x: rnd(w, Math.max(w, W - w)),
      y: rnd(h, Math.max(h, H - h)),
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      rot: 0,
      mode: "wander",
      t: 0,
      edge: 2,
      along: 0,
      peek: -8,
      safe: 0,
      wait: 4,
      calm: 0,
      cd: rnd(2, 6),
      slow: 0,
      alpha: 1,
      alphaT: 1,
      phase: i * 1.7,
      wt: i,
      wisp: 0,
      rid: 0,
      last: -1,
      act: null,
      target: null,
      anims: [],
      undo: null,
      after: null,
    };
    g.tx = g.x;
    g.ty = g.y;
    if (clickable) el.addEventListener("click", () => onClick(g));
    return g;
  });

  const newTarget = (g: G) => {
    g.tx = rnd(g.w, Math.max(g.w, W - g.w));
    g.ty = rnd(g.h * 0.8, Math.max(g.h, H - g.h * 0.8));
  };
  const edgePoint = (g: G, sway = 0): [number, number] => {
    const along = clamp(g.along + sway, g.w, (g.edge % 2 ? H : W) - g.w);
    return [g.edge === 1 ? W : g.edge === 3 ? 0 : along, g.edge === 0 ? 0 : g.edge === 2 ? H : along];
  };
  const hide = (g: G, e: Edge, along: number) => {
    g.mode = "hidden";
    g.edge = e;
    g.along = along;
    g.peek = -8;
    g.safe = 0;
    g.wait = rnd(3, 6);
    g.rot = EDGE_ROT[e];
    g.vx = g.vy = 0;
  };

  /* ---------- page interaction ---------- */
  const busy = new Set<Element>();
  const sel = "h1,h2,h3,p,button,a,img";
  const collect = (root: Element) => {
    let list = Array.from(root.querySelectorAll<HTMLElement>("[data-ghost]"));
    if (!list.length) {
      list = Array.from(root.querySelectorAll<HTMLElement>(sel));
      const boxes = Array.from(root.querySelectorAll<HTMLElement>("div,section,article,li"))
        .slice(0, 300)
        .filter((el) => {
          const cs = getComputedStyle(el);
          return parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none";
        });
      list = list.concat(boxes);
    }
    return list.filter((el) => {
      if (layer.contains(el) || busy.has(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && r.width < W * 0.8 && r.height < H * 0.6 && r.left >= L - 4 && r.right <= L + W + 4 && r.top >= T && r.bottom <= T + H;
    });
  };
  const candidates = () => {
    let list = collect(host);
    if (!list.length && container?.parentElement) list = collect(container.parentElement);
    return list;
  };
  const relRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - L, y: r.top - T, w: r.width, h: r.height };
  };
  const addAnim = (g: G, el: Element, kf: Keyframe[], o: KeyframeAnimationOptions, add = true) => {
    let a: Animation;
    try {
      a = el.animate(kf, add ? { ...o, composite: "add" } : o);
    } catch {
      a = el.animate(kf, o);
    }
    g.anims.push(a);
    return a;
  };
  const wrapWord = (g: G, el: HTMLElement): boolean => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (/\S{3,}/.test(n.nodeValue ?? "")) nodes.push(n as Text);
    if (!nodes.length) return false;
    const t = pick(nodes);
    const s = t.nodeValue ?? "";
    const words = Array.from(s.matchAll(/\S{3,}/g));
    if (!words.length || !t.parentNode) return false;
    const m = pick(words);
    const i = m.index ?? 0;
    const a = document.createTextNode(s.slice(0, i));
    const span = document.createElement("span");
    span.textContent = m[0];
    span.style.display = "inline-block";
    const b = document.createTextNode(s.slice(i + m[0].length));
    t.replaceWith(a, span, b);
    g.undo = () => {
      if (a.parentNode) {
        a.replaceWith(t);
        span.remove();
        b.remove();
      }
    };
    addAnim(g, span, [{ transform: "none" }, { transform: "translate(3px,-7px) rotate(-8deg)" }, { transform: "translate(-2px,-3px) rotate(5deg)" }, { transform: "none" }], { duration: 1500, easing: "ease-in-out" }, false);
    return true;
  };
  const abortAct = (g: G) => {
    if (!g.act) return;
    g.rid++;
    g.anims.forEach((a) => a.cancel());
    g.anims = [];
    g.undo?.();
    g.undo = null;
    if (g.target) busy.delete(g.target);
    g.target = null;
    g.act = null;
    g.alphaT = 1;
    g.r.className = "gxg-r";
    face(g, "");
    g.cd = rnd(5, 11);
    if (g.mode === "goto" || g.mode === "act") g.mode = "wander";
  };
  const startAct = (g: G) => {
    const list = candidates();
    if (!list.length) {
      g.cd = 8;
      return;
    }
    const el = pick(list);
    const tag = el.tagName;
    const acts: Act[] = tag === "BUTTON" || tag === "A" ? ["possess", "possess", "tug", "blow"] : /^(P|H[1-3])$/.test(tag) ? ["flicker", "word", "word", "blow", "tug"] : ["hide", "hide", "tug", "blow"];
    const act = pick(acts);
    const r = relRect(el);
    busy.add(el);
    g.target = el;
    g.act = act;
    g.rid++;
    if (act === "hide" || act === "possess") {
      g.tx = r.x + r.w / 2;
      g.ty = r.y + r.h / 2;
    } else {
      const right = r.x + r.w + g.w * 0.4 < W - g.w * 0.3;
      g.tx = right ? r.x + r.w + g.w * 0.3 : r.x - g.w * 0.3;
      g.ty = clamp(r.y + r.h / 2 - g.h * 0.1, g.h / 2, H - g.h / 2);
    }
    g.tx = clamp(g.tx, g.w / 2, W - g.w / 2);
    g.ty = clamp(g.ty, g.h / 2, H - g.h / 2);
    g.mode = "goto";
    g.t = 0;
  };
  const doAct = (g: G) => {
    const el = g.target;
    if (!el || !g.act) return abortAct(g);
    g.mode = "act";
    const ease = { easing: "ease-in-out" };
    let dur = 2000;
    switch (g.act) {
      case "tug":
        g.r.className = "gxg-r gxr-lean";
        addAnim(g, el, [{ transform: "rotate(0deg)" }, { transform: "rotate(-3deg) translate(-4px,1px)" }, { transform: "rotate(2.5deg) translate(3px,0)" }, { transform: "rotate(-1.5deg)" }, { transform: "rotate(0deg)" }], { duration: 1800, ...ease });
        break;
      case "blow": {
        face(g, "boo");
        const r = relRect(el);
        const dir = r.x + r.w / 2 > g.x ? 1 : -1;
        for (let i = 0; i < 5; i++) gl(g, () => prop("gxp-wind", g.x + dir * g.w * 0.4, g.y + rnd(-8, 12), "", 800, { "--dx": `${dir * 40}px` }), i * 180);
        gl(g, () => addAnim(g, el, [{ transform: "skewX(0deg)" }, { transform: "skewX(-5deg) translateX(2px)" }, { transform: "skewX(4deg)" }, { transform: "skewX(-2deg)" }, { transform: "skewX(0deg)" }], { duration: 1300, ...ease }), 300);
        break;
      }
      case "possess":
        g.alphaT = 0;
        gl(g, () => addAnim(g, el, [{ filter: "drop-shadow(0 0 0 rgba(167,139,250,0))", transform: "translate(0,0)" }, { filter: "drop-shadow(0 0 10px rgba(167,139,250,.95))", transform: "translate(-1px,1px)" }, { filter: "drop-shadow(0 0 14px rgba(196,181,253,1))", transform: "translate(1px,-1px)" }, { filter: "drop-shadow(0 0 0 rgba(167,139,250,0))", transform: "translate(0,0)" }], { duration: 300, iterations: 6 }), 350);
        gl(g, () => {
          g.alphaT = 1;
          g.ty -= g.h * 0.6;
        }, 2200);
        dur = 2700;
        break;
      case "flicker":
        face(g, "wink");
        addAnim(g, el, [{ opacity: 1 }, { opacity: 0.15 }, { opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }, { opacity: 0.1 }, { opacity: 1 }], { duration: 1400 }, false);
        dur = 1700;
        break;
      case "word":
        face(g, "tongue");
        if (!wrapWord(g, el)) addAnim(g, el, [{ transform: "translateX(0)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 600, ...ease });
        dur = 1700;
        break;
      case "hide": {
        g.alphaT = 0.15;
        const r = relRect(el);
        gl(g, () => {
          const left = Math.random() < 0.5;
          g.tx = clamp(left ? r.x + g.w * 0.1 : r.x + r.w - g.w * 0.1, g.w / 2, W - g.w / 2);
          g.alphaT = 1;
        }, 1400);
        dur = 2700;
        break;
      }
    }
    gl(g, () => abortAct(g), dur);
  };

  /* ---------- prankster reactions: 10 kinds × 3 versions ---------- */
  type Reaction = (g: G, v: number, cx: number, cy: number) => number;
  const notes = (g: G, n: number, every: number) => {
    for (let i = 0; i < n; i++) gl(g, () => prop("gxp-note", g.x + rnd(-g.w / 3, g.w / 3), g.y - g.h * 0.35, pick(NOTES), 1700, { "--dx": `${f1(rnd(-24, 24))}px` }), i * every);
  };
  const REACTIONS: Reaction[] = [
    // 1 call friends to laugh at you
    (g, v, cx) => {
      const txt = ["HAHA", "hehe", "lol"][v];
      say(g, ["guys, look at this one!", "hey, come see!", "pfft, watch this"][v]);
      for (let i = 0; i <= v; i++) {
        const side = i % 2 ? 1 : -1;
        gl(g, () => friend(g.x + side * g.w * (1 + Math.floor(i / 2) * 0.9), g.y + rnd(-20, 16), txt, 2100 - i * 200, cx > g.x ? 12 : -12), 400 + i * 260);
      }
      gl(g, () => say(g, `${txt}!`), 1000);
      return 3000;
    },
    // 2 sing
    (g, v) => {
      g.r.className = "gxg-r gxr-sway";
      say(g, SONGS[v][0]);
      gl(g, () => say(g, SONGS[v][1]), 1500);
      notes(g, 10, 280);
      return 3100;
    },
    // 3 dance
    (g, v) => {
      g.r.className = `gxg-r ${["gxr-spin", "gxr-moon", "gxr-wig"][v]}`;
      say(g, ["wheee!", "moonwalk~", "wiggle wiggle"][v]);
      notes(g, 4, 500);
      return 2600;
    },
    // 4 magic trick
    (g, v, cx, cy) => {
      if (v === 0) {
        puff(g.x, g.y);
        g.el.dataset.poof = "";
        gl(g, () => {
          const dx = cx - g.x;
          const dy = cy - g.y;
          const d = Math.hypot(dx, dy) || 1;
          g.x = clamp(cx + (dx / d) * 80, g.w / 2, W - g.w / 2);
          g.y = clamp(cy + (dy / d) * 80, g.h / 2 + 24, H - g.h / 2);
          g.tx = g.x;
          g.ty = g.y;
          puff(g.x, g.y);
          delete g.el.dataset.poof;
          say(g, "behind you!");
        }, 500);
        return 2300;
      }
      if (v === 1) {
        say(g, "which one is real?");
        friend(g.x - g.w * 1.1, g.y, "", 1900);
        friend(g.x + g.w * 1.1, g.y, "", 1900);
        return 2300;
      }
      say(g, "ta-da!");
      g.r.className = "gxg-r gxr-pop";
      prop("gxp-up", g.w / 2, -10, Math.random() < 0.5 ? P.bunny : P.flower, 1800, {}, g.el);
      return 2000;
    },
    // 5 tease
    (g, v) => {
      face(g, ["tongue", "wink", "sorry"][v]);
      if (v !== 1) g.r.className = `gxg-r ${v ? "gxr-shake" : "gxr-wig"}`;
      say(g, ["bleh!", "nice try ;)", "nope nope nope"][v]);
      return 1900;
    },
    // 6 play dead
    (g, v, cx, cy) => {
      g.r.style.setProperty("--gx-fall", ["90deg", "-90deg", "180deg"][v]);
      g.r.className = "gxg-r gxr-dead";
      face(g, "x");
      say(g, ["ugh… you got me", "x_x", "*dramatic death*"][v]);
      gl(g, () => {
        face(g, "peek");
        say(g, ["…is it gone?", "jk!", "…psst"][v]);
      }, 1600);
      g.after = () => {
        g.r.style.removeProperty("--gx-fall");
        const dx = g.x - cx;
        const dy = g.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        g.tx = clamp(g.x + (dx / d) * 260, g.w, W - g.w);
        g.ty = clamp(g.y + (dy / d) * 260, g.h, H - g.h);
      };
      return 2400;
    },
    // 7 throw something
    (g, v, cx, cy) => {
      g.r.className = "gxg-r gxr-throw";
      say(g, ["catch!", "surprise!", "pie for you!"][v]);
      const sx = g.x;
      const sy = g.y - g.h * 0.2;
      prop("gxp-throw", sx, sy, [P.paper, P.star, P.pie][v], 620, { "--dx": `${f1(cx - sx)}px`, "--dy": `${f1(cy - sy)}px` });
      gl(g, () => {
        if (v === 0) prop("gxp-splat", cx, cy, P.paper, 1400);
        else if (v === 2) prop("gxp-splat", cx, cy, P.splat, 1500);
        else
          for (let i = 0; i < 18; i++) {
            const a = rnd(0, Math.PI * 2);
            const r = rnd(20, 60);
            prop("gxp-conf", cx, cy, "", 1150, { "--dx": `${f1(Math.cos(a) * r)}px`, "--dy": `${f1(Math.sin(a) * r + 20)}px`, background: pick(["#f472b6", "#a78bfa", "#fde047", "#34d399", "#60a5fa"]) });
          }
      }, 600);
      return 2000;
    },
    // 8 selfie
    (g, v, cx, cy) => {
      g.r.className = "gxg-r gxr-sel";
      if (v === 1) face(g, "boo");
      if (v === 2) face(g, "wink");
      prop("gxp-up", g.w * 0.92, g.h * 0.05, P.camera, 2000, {}, g.el);
      say(g, ["say cheese!", "say BOO!", "#haunted #selfie"][v]);
      gl(g, () => {
        const fl = prop("gxp-flash", 0, 0, "", 600);
        fl.style.cssText += ";left:0;top:0;width:100%;height:100%";
        if (v === 2) prop("gxp-drift", clamp(cx, 20, W - 20), clamp(cy, 20, H - 40), P.photo, 1800);
      }, 900);
      return 2100;
    },
    // 9 juggle
    (g, v) => {
      g.el.dataset.jug = "";
      const item = [P.star, P.eye, P.pumpkin][v];
      prop("gxp-jug", g.w / 2, 0, [0, 1, 2].map((i) => `<span style="animation-delay:-${i * 0.4}s">${item}</span>`).join(""), 2800, {}, g.el);
      say(g, ["look, stars!", "eyeballs! fresh!", "pumpkin time"][v]);
      g.after = () => delete g.el.dataset.jug;
      return 2800;
    },
    // 10 fake scare
    (g, v) => {
      g.r.className = "gxg-r gxr-boo";
      face(g, "boo");
      say(g, ["BOO!", "RAAAWR!", "BOOGA BOOGA!"][v]);
      gl(g, () => {
        face(g, "sorry");
        say(g, ["...sorry", "too much?", "was that scary?"][v]);
      }, 1300);
      return 2700;
    },
  ];
  let lastReact = -1;
  const endReact = (g: G) => {
    if (g.mode !== "react") return;
    g.rid++;
    g.mode = "wander";
    g.r.className = "gxg-r";
    face(g, "");
    say(g, "");
    delete g.el.dataset.poof;
    g.el.querySelectorAll(".gxp").forEach((p) => p.remove());
    g.cd = rnd(3, 5);
    const a = g.after;
    g.after = null;
    a?.();
  };
  const react = (g: G) => {
    if (g.mode === "react") return;
    abortAct(g);
    let k = 0;
    do k = Math.floor(Math.random() * REACTIONS.length);
    while (k === lastReact || k === g.last);
    lastReact = g.last = k;
    g.rid++;
    g.mode = "react";
    g.vx = g.vy = 0;
    const cx = mIn ? mx : g.x + rnd(-120, 120);
    const cy = mIn ? my : g.y + rnd(-80, 80);
    const dur = REACTIONS[k](g, Math.floor(Math.random() * 3), cx, cy);
    gl(g, () => endReact(g), dur);
  };

  const onClick = (g: G) => {
    if (behavior === "prankster" && !reduced) {
      if (g.mode !== "react" && g.mode !== "gone") react(g);
      return;
    }
    if (g.mode === "gone") return;
    abortAct(g);
    endReact(g);
    puff(g.x, g.y);
    g.el.dataset.poof = "";
    g.el.style.pointerEvents = "none";
    delete g.el.dataset.scared;
    g.mode = "gone";
    g.t = reduced ? 4 : rnd(4, 8);
    if (reduced)
      later(() => {
        delete g.el.dataset.poof;
        g.el.style.pointerEvents = "auto";
        g.mode = "wander";
      }, 4000);
  };

  /* ---------- simulation ---------- */
  const seek = (g: G, max: number, dt: number, k = 1) => {
    const dx = g.tx - g.x;
    const dy = g.ty - g.y;
    const d = Math.hypot(dx, dy) || 1;
    const s = Math.min(max, d * 1.2);
    const f = Math.min(1, dt * 1.5 * k);
    g.vx += ((dx / d) * s - g.vx) * f;
    g.vy += ((dy / d) * s - g.vy) * f;
  };

  const step = (g: G, dt: number, time: number) => {
    const dx = g.x - mx;
    const dy = g.y - my;
    const d = Math.hypot(dx, dy) || 1;
    const toward = (mvx * dx + mvy * dy) / d;
    const msp = Math.hypot(mvx, mvy);
    const near = mIn && d < fleeRadius;
    const chased = near && (toward > 110 || (d < fleeRadius * 0.4 && msp > 25));
    g.cd -= dt;
    g.slow -= dt;
    let scared = false;
    let free = true; // integrate velocity
    let targetRot = Math.max(-14, Math.min(14, g.vx * 0.05));

    switch (g.mode) {
      case "wander":
      case "goto":
      case "act": {
        if (chased) {
          if (behavior === "shy") {
            abortAct(g);
            g.mode = "flee";
            g.calm = 0;
            break;
          }
          if (g.cd <= 0) {
            react(g);
            break;
          }
        }
        if (g.mode === "wander") {
          if (Math.hypot(g.tx - g.x, g.ty - g.y) < 24 || Math.random() < dt * 0.15) newTarget(g);
          if (interactOn && g.cd <= 0 && Math.random() < dt * 0.2) startAct(g);
        } else if (g.mode === "goto") {
          g.t += dt;
          if (Math.hypot(g.tx - g.x, g.ty - g.y) < 10 || g.t > 5) doAct(g);
        }
        seek(g, (g.mode === "goto" ? 90 : g.mode === "act" ? 60 : g.slow > 0 ? 28 : 45) * speed, dt, g.mode === "act" ? 3 : 1);
        break;
      }
      case "flee": {
        scared = true;
        const ax = dx / d;
        const ay = dy / d;
        const dists = [g.y, W - g.x, H - g.y, g.x];
        let best = 0;
        let bs = Infinity;
        for (let e = 0; e < 4; e++) {
          const s = Math.max(1, dists[e]) * (1.6 - (ax * EN[e][0] + ay * EN[e][1]));
          if (s < bs) {
            bs = s;
            best = e;
          }
        }
        const fx = ax * 0.7 + EN[best][0];
        const fy = ay * 0.7 + EN[best][1];
        const fl = Math.hypot(fx, fy) || 1;
        const sp = 300 * speed;
        g.vx += ((fx / fl) * sp - g.vx) * Math.min(1, dt * 3);
        g.vy += ((fy / fl) * sp - g.vy) * Math.min(1, dt * 3);
        g.calm = near ? 0 : g.calm + dt;
        const m = g.h * 0.55;
        if (g.x < -m) hide(g, 3, g.y);
        else if (g.x > W + m) hide(g, 1, g.y);
        else if (g.y < -m) hide(g, 0, g.x);
        else if (g.y > H + m) hide(g, 2, g.x);
        else if (g.calm > 1.2) {
          g.mode = "wander";
          newTarget(g);
        }
        break;
      }
      case "hidden":
      case "return": {
        free = false;
        const [ex, ey] = edgePoint(g);
        const de = Math.hypot(mx - ex, my - ey);
        const danger = mIn && de < fleeRadius * 0.9;
        if (danger) {
          g.safe = 0;
          scared = true;
        } else if (!mIn || de > fleeRadius * 1.3 || msp < 15) g.safe += dt;
        if (behavior === "prankster") g.safe += dt * 3;
        if (g.mode === "hidden" && g.safe > g.wait) g.mode = "return";
        const peekT = danger || g.mode === "return" ? -8 : g.h * 0.5;
        g.peek += (peekT - g.peek) * Math.min(1, dt * (peekT < g.peek ? 9 : 1.1));
        const [n0, n1] = EN[g.edge];
        if (g.mode === "return" && g.peek < -5) {
          g.x = ex + n0 * (g.h / 2 + 6);
          g.y = ey + n1 * (g.h / 2 + 6);
          g.rot = 0;
          targetRot = 0;
          const depth = rnd(0.22, 0.4);
          g.tx = clamp(ex - n0 * W * depth + (n0 ? 0 : rnd(-60, 60)), g.w, W - g.w);
          g.ty = clamp(ey - n1 * H * depth + (n1 ? 0 : rnd(-40, 40)), g.h, H - g.h);
          g.vx = g.vy = 0;
          g.mode = "wander";
          g.slow = 5;
          g.cd = Math.max(g.cd, 3);
        } else {
          const [sx, sy] = edgePoint(g, Math.sin(time * 0.8 + g.phase) * 5);
          g.x = sx + n0 * (g.h / 2 - g.peek);
          g.y = sy + n1 * (g.h / 2 - g.peek);
          targetRot = EDGE_ROT[g.edge] + Math.sin(time * 1.3 + g.phase) * 4;
          g.rot = targetRot;
        }
        break;
      }
      case "gone":
        free = false;
        g.t -= dt;
        if (g.t <= 0) {
          delete g.el.dataset.poof;
          g.el.style.pointerEvents = clickable ? "auto" : "none";
          const e = Math.floor(Math.random() * 4) as Edge;
          hide(g, e, rnd(g.w, (e % 2 ? H : W) - g.w));
          g.wait = rnd(2, 4);
        }
        break;
      case "react":
        g.vx *= 0.9;
        g.vy *= 0.9;
        targetRot = 0;
        break;
    }

    if (free) {
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += (targetRot - g.rot) * Math.min(1, dt * 5);
      const sp = Math.hypot(g.vx, g.vy);
      if (sp > 140 && time - g.wisp > 0.05 && layer.childElementCount < ghosts.length + 40) {
        g.wisp = time;
        const s = `${f1(g.w * 0.75)}px`;
        prop("gxp-wisp", g.x - g.vx * 0.03, g.y - g.vy * 0.03, "", 750, { width: s, height: s });
      }
    }
    if (scared) g.el.dataset.scared = "";
    else delete g.el.dataset.scared;
    g.alpha += (g.alphaT - g.alpha) * Math.min(1, dt * 4);
    g.inner.style.opacity = String(f1(opacity * g.alpha * 100) / 100);
    g.el.style.transform = `translate(${f1(g.x - g.w / 2)}px,${f1(g.y - g.h / 2)}px) rotate(${f1(g.rot)}deg)`;
    if (g.mode !== "gone") {
      g.wt += dt * (g.mode === "flee" ? 2.2 : 1);
      g.body?.setAttribute("d", hem(g.wt + g.phase));
      look(g.eyes, g.x, g.y, g.rot);
    }
  };

  // one ghost starts hidden, peeking from the bottom
  if (ghosts.length > 2 && behavior === "shy" && !reduced) {
    const g = ghosts[ghosts.length - 1];
    hide(g, 2, W * 0.78);
  }

  let raf = 0;
  let last = performance.now();
  let time = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden || dt <= 0) return;
    time += dt;
    measure();
    const wasIn = mIn;
    mIn = mouse.on && mouse.x >= L && mouse.x <= L + W && mouse.y >= T && mouse.y <= T + H;
    if (mIn && wasIn) {
      mvx = mvx * 0.75 + ((mouse.x - pmx) / dt) * 0.25;
      mvy = mvy * 0.75 + ((mouse.y - pmy) / dt) * 0.25;
    } else mvx = mvy = 0;
    pmx = mouse.x;
    pmy = mouse.y;
    mx = mouse.x - L;
    my = mouse.y - T;
    for (const g of ghosts) step(g, dt, time);
  };
  if (reduced) {
    for (const g of ghosts) g.el.style.transform = `translate(${f1(g.x - g.w / 2)}px,${f1(g.y - g.h / 2)}px)`;
  } else raf = requestAnimationFrame(loop);

  return {
    destroy() {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      for (const g of ghosts) abortAct(g);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerout", onOut);
      layer.remove();
      if (--styleRefs <= 0) {
        styleRefs = 0;
        document.getElementById(STYLE_ID)?.remove();
      }
    },
    setBehavior(b: GhostBehavior) {
      behavior = b;
      for (const g of ghosts) {
        endReact(g);
        if (g.mode === "flee") {
          g.mode = "wander";
          newTarget(g);
        }
      }
    },
    setInteract(on: boolean) {
      interactOn = on;
      if (!on) for (const g of ghosts) abortAct(g);
    },
  };
}

export type GhostWalkerProps = Omit<GhostWalkerOptions, "container"> & {
  /** Haunt the whole page (fixed) instead of the parent box. */
  fullscreen?: boolean;
  /** false = calm version: a single static ghost peeking from the bottom-right edge. Default true. */
  animated?: boolean;
  className?: string;
};

/** React wrapper: haunts its positioned parent (or the whole page with `fullscreen`). */
export function GhostWalker({ fullscreen = false, animated = true, className = "", ...opts }: GhostWalkerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const inst = ghostWalker({ ...(JSON.parse(key) as GhostWalkerOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);

  if (!animated) {
    const s = opts.size ?? 56;
    const html = opts.shape ? renderShape(opts.shape) : ghostSvg(opts.color ?? TINTS[0], 0, true);
    return (
      <div className={`pointer-events-none ${fullscreen ? "fixed" : "absolute"} inset-0 overflow-hidden ${className}`} style={{ zIndex: fullscreen ? opts.zIndex ?? 9999 : undefined }} aria-hidden>
        <div
          style={{
            position: "absolute",
            right: "12%",
            bottom: 0,
            width: s,
            height: s * 1.2,
            opacity: opts.opacity ?? 0.6,
            transform: "translateY(48%) rotate(-6deg)",
            filter: "drop-shadow(0 0 6px rgba(221,214,254,.8)) drop-shadow(0 0 16px rgba(196,181,253,.45))",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

export default GhostWalker;
