"use client";

import * as React from "react";

/**
 * tab-tricks — make the browser TAB itself part of the experience. Two modes:
 *
 * - `mode: "fun"` — when the visitor leaves, the favicon comes alive (eyes
 *   looking around, a sleepy face with floating Zzz, a crying face, a waving
 *   hand) and the title cycles playful lines ("Come back! 👀"). After a long
 *   absence it escalates ("Okay, I'm napping 😴"). On return: a "Welcome
 *   back 👋" toast, a happy bouncing favicon and "Yay! 🎉", then everything
 *   is restored.
 * - `mode: "useful"` — quiet helpers that live in the tab: `badge(n)` unread
 *   counts, `progress(0..1)` rings, `done()` check marks for work finished
 *   while hidden, `unsaved()` dots (+ optional leave guard), `countdown()` in
 *   the title, `recording()` pulse, and an "away summary" toast on return.
 *
 * Framework-agnostic core (`tabTricks()`) + headless React wrapper
 * (`<TabTricks />`) + a pure `drawFavicon()` painter (64×64 canvas).
 * Zero dependencies · SSR safe · restores the original title & favicon(s)
 * exactly on clear/destroy.
 */

export type TabFace = "eyes" | "sleepy" | "crying" | "wave";

export type TabTricksMode = "fun" | "useful";

/** Everything `drawFavicon()` can paint. Layers combine where it makes sense. */
export type FaviconState = {
  /** Background / accent colour (default "#4ade80"). */
  accent?: string;
  /** Animation time in seconds (0 = static frame). */
  t?: number;
  /** Fun mode: an animated face fills the icon. */
  face?: TabFace | null;
  /** Fun mode: happy bouncing face (on return). */
  happy?: boolean;
  /** Green check mark. */
  done?: boolean;
  /** Pulsing red recording dot. */
  recording?: boolean;
  /** 0..1 progress ring around the (shrunk) base icon. */
  progress?: number | null;
  /** 0..1 remaining fraction shown as a pie (countdowns). */
  pie?: number | null;
  /** Notification count bubble (0 hides it). */
  badge?: number;
  /** Small "unsaved changes" dot. */
  unsaved?: boolean;
  /** Optional base image (e.g. the site's original favicon). */
  image?: CanvasImageSource | null;
};

export type TabSnapshot = {
  /** Current document title. */
  title: string;
  /** Current favicon URL (data URL while overridden, else the original href, or ""). */
  icon: string;
  /** Fun mode: the "away" state is active (real or simulated). */
  away: boolean;
};

export type TabTricksOptions = {
  /** "fun" (playful away state) or "useful" (badge/progress/done/…). Default "fun". */
  mode?: TabTricksMode;
  /** Fun: favicon face while away (default "eyes"). */
  face?: TabFace;
  /** Fun: titles cycled while the tab is hidden. */
  away?: string[];
  /** Fun: titles used after `escalateAfter` ms away. */
  escalate?: string[];
  /** Fun: ms away before escalating (default 30000). */
  escalateAfter?: number;
  /** Fun: title shown for 1.5 s on return (default "Yay! 🎉", "" disables). */
  yay?: string;
  /** Fun: toast shown on return (default "Welcome back 👋", "" disables). */
  welcome?: string;
  /** ms between title changes (default 1600). */
  interval?: number;
  /** Accent colour for icons and toasts (default "#4ade80"). */
  accent?: string;
  /** Useful: play one soft chime when `done()` fires while hidden (default false). */
  sound?: boolean;
  /** Useful: ask before leaving while `unsaved(true)` (default false). */
  guardUnsaved?: boolean;
  /** Useful: show the away summary toast after this many ms hidden (default 60000, 0 disables). */
  awayAfter?: number;
  /** false = static favicons (no animation). Reduced motion forces this. Default true. */
  animated?: boolean;
  /** Called whenever the tab title / favicon changes (handy to mirror it in UI). */
  onChange?: (snapshot: TabSnapshot) => void;
};

export type TabTricksHandle = {
  /** Useful: notification bubble + "(n) Title". 0 clears. */
  badge(n: number): void;
  /** Useful: progress ring + "42% · Title". null clears. */
  progress(p: number | null): void;
  /** Useful: green check + "✓ Done — message" (persists until return if hidden, ~2.5 s if visible). */
  done(message?: string): void;
  /** Useful: dot + "● Title" (and the optional leave guard). */
  unsaved(on: boolean): void;
  /** Useful: live mm:ss in the title + favicon pie. null clears. Calls `done(label)` at zero. */
  countdown(endsAt: number | null, label?: string): void;
  /** Useful: pulsing red dot favicon. */
  recording(on: boolean): void;
  /** Useful: count an update; calls made while hidden feed the away summary. */
  notify(): void;
  /** Fun: preview the away → back cycle without leaving the tab (default 6000 ms). */
  simulate(ms?: number): void;
  /** Current title / icon / away state. */
  snapshot(): TabSnapshot;
  /** Reset every helper and restore the original title & favicon. */
  clear(): void;
  /** Remove listeners, timers, toasts and restore everything. */
  destroy(): void;
};

const DEFAULT_AWAY = ["Come back! 👀", "I'm telling mom…", "It's quiet without you", "Psst. Over here."];
const DEFAULT_ESCALATE = ["Okay, I'm napping 😴", "Wake me when you're back… zzz"];
const STYLE_ID = "pickui-tab-tricks-style";
const CSS = `.pk-tt-toast{position:fixed;left:50%;top:18px;z-index:2147483000;transform:translate(-50%,-90px);padding:10px 16px;border-radius:999px;color:#050505;font:600 14px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.35);transition:transform .5s cubic-bezier(.3,1.5,.5,1);pointer-events:none;white-space:nowrap}
.pk-tt-toast.on{transform:translate(-50%,0)}
@media (prefers-reduced-motion: reduce){.pk-tt-toast{transform:translate(-50%,0);opacity:0;transition:opacity .2s}.pk-tt-toast.on{opacity:1}}`;

/* ───────────────────────── favicon painter ───────────────────────── */

type Ctx = CanvasRenderingContext2D;

function rr(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function tile(g: Ctx, color: string, x = 0, y = 0, s = 64) {
  g.fillStyle = color;
  rr(g, x, y, s, s, s / 4);
  g.fill();
}

function drawEyes(g: Ctx, t: number) {
  const phase = t % 3.4;
  const blink = t > 0 && phase < 0.16 ? 0.12 : 1;
  const lx = Math.sin(t * 1.7) * 5;
  const ly = Math.cos(t * 1.13) * 3.5;
  for (const x of [21, 43]) {
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(x, 30, 11, 13 * blink, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = "rgba(0,0,0,.55)";
    g.stroke();
    if (blink === 1) {
      g.fillStyle = "#111";
      g.beginPath();
      g.arc(x + lx, 31 + ly, 5.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(x + lx + 1.8, 29 + ly, 1.6, 0, Math.PI * 2);
      g.fill();
    }
  }
}

function drawSleepy(g: Ctx, t: number) {
  g.strokeStyle = "#111";
  g.lineWidth = 4;
  g.lineCap = "round";
  for (const x of [20, 40]) {
    g.beginPath();
    g.arc(x, 32, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  }
  g.beginPath();
  g.ellipse(30, 47, 3.5, 4 + Math.sin(t * 2) * 1, 0, 0, Math.PI * 2);
  g.fillStyle = "#111";
  g.fill();
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.45 + k / 3) % 1;
    g.globalAlpha = t === 0 ? 1 - k * 0.3 : 1 - p;
    const pp = t === 0 ? k / 3 : p;
    g.font = `900 ${Math.round(9 + pp * 9)}px system-ui,sans-serif`;
    g.lineWidth = 3;
    g.strokeStyle = "#111";
    g.strokeText("z", 46 + pp * 10, 24 - pp * 18);
    g.fillStyle = "#fff";
    g.fillText("z", 46 + pp * 10, 24 - pp * 18);
  }
  g.globalAlpha = 1;
}

function drawCrying(g: Ctx, t: number) {
  g.strokeStyle = "#111";
  g.lineCap = "round";
  g.lineWidth = 3.5;
  // worried brows
  g.beginPath();
  g.moveTo(13, 19);
  g.lineTo(26, 15);
  g.moveTo(51, 19);
  g.lineTo(38, 15);
  g.stroke();
  for (const x of [20, 44]) {
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(x, 29, 8, 9, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(x, 32, 4.5, 0, Math.PI * 2);
    g.fill();
  }
  // frown
  g.lineWidth = 4;
  g.beginPath();
  g.arc(32, 56, 10, 1.2 * Math.PI, 1.8 * Math.PI);
  g.stroke();
  // tears
  for (const x of [17, 47]) {
    for (let k = 0; k < 2; k++) {
      const p = t === 0 ? 0.3 + k * 0.4 : (t * 0.9 + k * 0.5 + (x === 47 ? 0.25 : 0)) % 1;
      const y = 38 + p * 24;
      g.globalAlpha = 1 - p * 0.7;
      g.fillStyle = "#7dd3fc";
      g.beginPath();
      g.moveTo(x, y - 6);
      g.quadraticCurveTo(x + 4.5, y, x, y + 4);
      g.quadraticCurveTo(x - 4.5, y, x, y - 6);
      g.fill();
    }
  }
  g.globalAlpha = 1;
}

function drawWave(g: Ctx, t: number) {
  g.save();
  g.translate(32, 56);
  g.rotate(Math.sin(t * 6) * 0.45);
  g.fillStyle = "#fff7ed";
  g.strokeStyle = "rgba(0,0,0,.6)";
  g.lineWidth = 2.5;
  // palm
  rr(g, -12, -30, 24, 24, 8);
  g.fill();
  g.stroke();
  // fingers
  for (let i = 0; i < 4; i++) {
    const fx = -11 + i * 6;
    const fh = i === 0 || i === 3 ? 15 : 18;
    rr(g, fx, -30 - fh + 6, 5.5, fh, 2.75);
    g.fill();
    g.stroke();
  }
  // thumb
  g.save();
  g.translate(-12, -14);
  g.rotate(-0.9);
  rr(g, -3, -14, 6, 15, 3);
  g.fill();
  g.stroke();
  g.restore();
  // cover palm/finger seams
  g.fillStyle = "#fff7ed";
  rr(g, -10.5, -27, 21, 19, 6);
  g.fill();
  g.restore();
}

function drawHappy(g: Ctx, t: number, accent: string) {
  const b = Math.abs(Math.sin(t * Math.PI * 2.4));
  const y = 10 - b * 9;
  const sq = 1 - (1 - b) * 0.08;
  g.save();
  g.translate(32, y + 54);
  g.scale(1 / sq, sq);
  g.translate(-32, -(y + 54));
  tile(g, accent, 5, y, 54);
  g.strokeStyle = "#111";
  g.lineWidth = 4;
  g.lineCap = "round";
  for (const x of [22, 42]) {
    g.beginPath();
    g.arc(x, y + 22, 6, 1.1 * Math.PI, 1.9 * Math.PI);
    g.stroke();
  }
  g.fillStyle = "#111";
  g.beginPath();
  g.arc(32, y + 31, 12, 0.1 * Math.PI, 0.9 * Math.PI);
  g.closePath();
  g.fill();
  g.fillStyle = "#f87171";
  g.beginPath();
  g.arc(32, y + 39, 5, Math.PI, 0);
  g.fill();
  g.restore();
}

function drawBase(g: Ctx, image: CanvasImageSource | null | undefined, accent: string, x: number, y: number, s: number) {
  if (image) {
    g.drawImage(image, x, y, s, s);
    return;
  }
  tile(g, accent, x, y, s);
  g.fillStyle = "rgba(0,0,0,.28)";
  g.beginPath();
  g.arc(x + s / 2, y + s / 2, s * 0.2, 0, Math.PI * 2);
  g.fill();
}

function paint(g: Ctx, s: FaviconState) {
  const accent = s.accent ?? "#4ade80";
  const t = s.t ?? 0;
  if (s.done) {
    tile(g, "#22c55e");
    g.strokeStyle = "#fff";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(16, 34);
    g.lineTo(28, 46);
    g.lineTo(49, 21);
    g.stroke();
    return;
  }
  if (s.face) {
    tile(g, accent);
    if (s.face === "eyes") drawEyes(g, t);
    else if (s.face === "sleepy") drawSleepy(g, t);
    else if (s.face === "crying") drawCrying(g, t);
    else drawWave(g, t);
    return;
  }
  if (s.happy) {
    drawHappy(g, t, accent);
    return;
  }
  const hasRing = s.progress != null;
  const hasPie = !hasRing && s.pie != null;
  if (s.recording) {
    tile(g, "#111");
    const pulse = t === 0 ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4);
    g.fillStyle = `rgba(239,68,68,${0.35 * (1 - pulse)})`;
    g.beginPath();
    g.arc(32, 32, 17 + pulse * 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ef4444";
    g.beginPath();
    g.arc(32, 32, 15 + pulse * 2, 0, Math.PI * 2);
    g.fill();
  } else if (hasRing) {
    const p = Math.max(0, Math.min(1, s.progress ?? 0));
    drawBase(g, s.image, accent, 17, 17, 30);
    g.lineWidth = 8;
    g.strokeStyle = "rgba(127,127,127,.45)";
    g.beginPath();
    g.arc(32, 32, 27, 0, Math.PI * 2);
    g.stroke();
    if (p > 0) {
      g.strokeStyle = accent;
      g.lineCap = "round";
      g.beginPath();
      g.arc(32, 32, 27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
      g.stroke();
    }
  } else if (hasPie) {
    const p = Math.max(0, Math.min(1, s.pie ?? 0));
    g.fillStyle = "#18181b";
    g.beginPath();
    g.arc(32, 32, 31, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = accent;
    g.beginPath();
    g.moveTo(32, 32);
    g.arc(32, 32, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
    g.closePath();
    g.fill();
  } else {
    drawBase(g, s.image, accent, 0, 0, 64);
  }
  if (s.unsaved) {
    g.fillStyle = "#fbbf24";
    g.strokeStyle = "#111";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(52, 52, 10, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  const n = Math.max(0, Math.floor(s.badge ?? 0));
  if (n > 0) {
    const label = n > 99 ? "99+" : String(n);
    const w = label.length === 1 ? 34 : label.length === 2 ? 42 : 52;
    const h = 34;
    g.fillStyle = "#ef4444";
    g.strokeStyle = "#fff";
    g.lineWidth = 3;
    rr(g, 64 - w - 1, 1, w, h, h / 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#fff";
    g.font = `800 ${label.length > 2 ? 20 : 25}px system-ui,sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, 64 - w / 2 - 1, 1 + h / 2 + 1);
  }
}

let sharedCanvas: HTMLCanvasElement | null = null;

/**
 * Pure painter: draws a 64×64 favicon for `state` and returns a PNG data URL
 * ("" on the server). Pass your own canvas to also keep the pixels.
 */
export function drawFavicon(state: FaviconState = {}, canvas?: HTMLCanvasElement): string {
  if (typeof document === "undefined") return "";
  const c = canvas ?? (sharedCanvas ??= document.createElement("canvas"));
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  if (!g) return "";
  g.clearRect(0, 0, 64, 64);
  g.save();
  paint(g, state);
  g.restore();
  try {
    return c.toDataURL("image/png");
  } catch {
    // tainted by a cross-origin base image → redraw without it
    return state.image ? drawFavicon({ ...state, image: null }, c) : "";
  }
}

/* ───────────────────────── core ───────────────────────── */

let liveInstances = 0;

function fmtClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function fmtDuration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

const noopHandle = (): TabTricksHandle => ({
  badge() {},
  progress() {},
  done() {},
  unsaved() {},
  countdown() {},
  recording() {},
  notify() {},
  simulate() {},
  snapshot: () => ({ title: "", icon: "", away: false }),
  clear() {},
  destroy() {},
});

/** Framework-agnostic core. Returns helpers (useful-mode helpers no-op in fun mode). */
export function tabTricks(options: TabTricksOptions = {}): TabTricksHandle {
  if (typeof window === "undefined" || typeof document === "undefined") return noopHandle();
  const {
    mode = "fun",
    face = "eyes",
    away: awayLines = DEFAULT_AWAY,
    escalate = DEFAULT_ESCALATE,
    escalateAfter = 30000,
    yay = "Yay! 🎉",
    welcome = "Welcome back 👋",
    interval = 1600,
    accent = "#4ade80",
    sound = false,
    guardUnsaved = false,
    awayAfter = 60000,
    animated = true,
    onChange,
  } = options;
  const useful = mode === "useful";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const still = !animated || reduced;
  const t0 = performance.now();
  let destroyed = false;

  liveInstances++;
  // lets other tab-title scripts on the page step aside while tab-tricks owns the tab
  document.documentElement.setAttribute("data-tab-tricks", "");
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* title bookkeeping */
  let baseTitle = document.title;
  let writtenTitle: string | null = null;
  const applyTitle = (next: string | null) => {
    if (next === null) {
      if (writtenTitle !== null && document.title === writtenTitle) document.title = baseTitle;
      writtenTitle = null;
      return;
    }
    if (document.title !== next) document.title = next;
    writtenTitle = next;
  };

  /* favicon bookkeeping (works with several <link rel=icon>) */
  let saved: { el: HTMLLinkElement; href: string | null; created: boolean }[] | null = null;
  let writtenIcon: string | null = null;
  const restoreIcons = () => {
    if (saved) {
      for (const s of saved) {
        if (s.created) s.el.remove();
        else if (s.href === null) s.el.removeAttribute("href");
        else s.el.setAttribute("href", s.href);
      }
    }
    saved = null;
    writtenIcon = null;
  };
  const applyIcon = (url: string | null) => {
    if (saved && !saved.every((s) => s.el.isConnected)) {
      // head was re-rendered (route change) — forget stale nodes
      saved = null;
      writtenIcon = null;
    }
    if (url === null || url === "") {
      restoreIcons();
      return;
    }
    if (!saved) {
      const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']"));
      saved = links.map((el) => ({ el, href: el.getAttribute("href"), created: false }));
      if (!saved.length) {
        const el = document.createElement("link");
        el.rel = "icon";
        document.head.appendChild(el);
        saved.push({ el, href: null, created: true });
      }
    }
    for (const s of saved) if (s.el.getAttribute("href") !== url) s.el.setAttribute("href", url);
    writtenIcon = url;
  };
  const currentIcon = () => writtenIcon ?? document.querySelector<HTMLLinkElement>("link[rel~='icon']")?.href ?? "";

  /* original favicon as the base layer in useful mode */
  let baseImg: HTMLImageElement | null = null;
  if (useful) {
    const href = document.querySelector<HTMLLinkElement>("link[rel~='icon']")?.href;
    if (href) {
      const img = new Image();
      img.onload = () => {
        if (destroyed) return;
        baseImg = img;
        render();
      };
      img.src = href;
    }
  }

  /* toasts */
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const toasts = new Set<HTMLDivElement>();
  const toast = (text: string) => {
    if (!text || !document.body) return;
    toasts.forEach((el) => el.remove());
    toasts.clear();
    const el = document.createElement("div");
    el.className = "pk-tt-toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.style.background = accent;
    el.textContent = text;
    document.body.appendChild(el);
    toasts.add(el);
    later(() => el.classList.add("on"), 30);
    later(() => el.classList.remove("on"), 2600);
    later(() => {
      el.remove();
      toasts.delete(el);
    }, 3200);
  };

  const chime = () => {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.35);
      gain.gain.setValueAtTime(0.0001, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ac.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.65);
      later(() => void ac.close().catch(() => {}), 1000);
    } catch {
      /* audio unavailable — stay silent */
    }
  };

  /* state */
  let isAway = false;
  let awayStart = 0;
  let happyUntil = 0;
  let simTimer = 0;
  let badgeN = 0;
  let prog: number | null = null;
  let doneMsg: string | null = null;
  let doneTimer = 0;
  let unsavedOn = false;
  let cdEnd: number | null = null;
  let cdTotal = 1;
  let cdLabel = "";
  let rec = false;
  let updates = 0;
  let hiddenAt = document.hidden ? Date.now() : 0;

  let ticker = 0;
  let lastEmit = "";

  const snapshot = (): TabSnapshot => ({ title: document.title, icon: currentIcon(), away: isAway });

  function emit() {
    if (!onChange) return;
    const s = snapshot();
    const k = `${s.away}|${s.title}|${s.icon}`;
    if (k === lastEmit) return;
    lastEmit = k;
    onChange(s);
  }

  function updateTicker() {
    const need = !destroyed && (isAway || performance.now() < happyUntil || cdEnd !== null || (rec && !still));
    if (need && !ticker) ticker = window.setInterval(render, 250);
    else if (!need && ticker) {
      window.clearInterval(ticker);
      ticker = 0;
    }
  }

  function render() {
    if (destroyed) return;
    const now = performance.now();
    const t = still ? 0 : (now - t0) / 1000;
    if (writtenTitle === null || document.title !== writtenTitle) baseTitle = document.title;
    let title: string | null = null;
    let icon: string | null = null;

    if (!useful) {
      if (isAway) {
        const el = now - awayStart;
        const esc = el > escalateAfter && escalate.length > 0;
        const lines = esc ? escalate : awayLines;
        title = lines.length ? lines[Math.floor(el / Math.max(200, interval)) % lines.length] : null;
        icon = drawFavicon({ face: esc ? "sleepy" : face, t, accent });
      } else if (now < happyUntil) {
        title = yay || null;
        icon = drawFavicon({ happy: true, t: still ? 0 : (now - (happyUntil - 1500)) / 1000, accent });
      }
    } else {
      if (cdEnd !== null && cdEnd - Date.now() <= 0) {
        const label = cdLabel;
        cdEnd = null;
        markDone(label || "Time's up");
        return;
      }
      if (doneMsg !== null) {
        title = `✓ Done${doneMsg ? ` — ${doneMsg}` : ""}`;
        icon = drawFavicon({ done: true, accent });
      } else {
        const left = cdEnd !== null ? Math.max(0, cdEnd - Date.now()) : null;
        let prefix = "";
        if (unsavedOn) prefix += "● ";
        if (badgeN > 0) prefix += `(${badgeN > 99 ? "99+" : badgeN}) `;
        if (prog !== null) prefix += `${Math.round(prog * 100)}% · `;
        if (left !== null) prefix += `${fmtClock(left)}${cdLabel ? ` ${cdLabel}` : ""} · `;
        if (prefix) title = prefix + baseTitle;
        if (badgeN > 0 || prog !== null || unsavedOn || left !== null || rec) {
          icon = drawFavicon({
            image: baseImg,
            accent,
            t,
            badge: badgeN,
            progress: prog,
            pie: left !== null ? left / cdTotal : null,
            unsaved: unsavedOn,
            recording: rec,
          });
        }
      }
    }
    applyTitle(title);
    applyIcon(icon);
    emit();
    updateTicker();
  }

  function enterAway() {
    isAway = true;
    awayStart = performance.now();
    happyUntil = 0;
    render();
  }
  function leaveAway() {
    if (!isAway) return;
    isAway = false;
    window.clearTimeout(simTimer);
    simTimer = 0;
    toast(welcome);
    happyUntil = performance.now() + 1500;
    render();
  }

  function markDone(message: string) {
    prog = null;
    window.clearTimeout(doneTimer);
    doneMsg = message;
    if (document.hidden) {
      if (sound) chime();
    } else {
      doneTimer = later(() => {
        doneMsg = null;
        render();
      }, 2500);
    }
    render();
  }

  const onVis = () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      updates = 0;
      if (!useful) {
        window.clearTimeout(simTimer);
        simTimer = 0;
        if (!isAway) enterAway();
      }
    } else {
      if (!useful) leaveAway();
      else {
        if (doneMsg !== null) {
          window.clearTimeout(doneTimer);
          doneMsg = null;
        }
        const gone = hiddenAt ? Date.now() - hiddenAt : 0;
        if (awayAfter > 0 && gone > awayAfter) {
          toast(`You were away ${fmtDuration(gone)}${updates ? ` · ${updates} update${updates === 1 ? "" : "s"}` : ""}`);
        }
      }
      hiddenAt = 0;
      render();
      // re-apply after other visibility handlers that may have touched the tab
      later(render, 80);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!guardUnsaved || !unsavedOn) return;
    e.preventDefault();
    e.returnValue = "";
  };
  if (useful) window.addEventListener("beforeunload", onBeforeUnload);

  if (!useful && document.hidden) enterAway();

  const resetUseful = () => {
    badgeN = 0;
    prog = null;
    doneMsg = null;
    window.clearTimeout(doneTimer);
    unsavedOn = false;
    cdEnd = null;
    rec = false;
    updates = 0;
  };

  return {
    badge(n) {
      if (!useful || destroyed) return;
      badgeN = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
      render();
    },
    progress(p) {
      if (!useful || destroyed) return;
      prog = p === null || !Number.isFinite(p) ? null : Math.max(0, Math.min(1, p));
      if (prog !== null && doneMsg !== null) {
        window.clearTimeout(doneTimer);
        doneMsg = null;
      }
      render();
    },
    done(message = "") {
      if (!useful || destroyed) return;
      markDone(message);
    },
    unsaved(on) {
      if (!useful || destroyed) return;
      unsavedOn = on;
      render();
    },
    countdown(endsAt, label = "") {
      if (!useful || destroyed) return;
      if (endsAt === null || !Number.isFinite(endsAt)) cdEnd = null;
      else {
        cdEnd = endsAt;
        cdTotal = Math.max(1, endsAt - Date.now());
        cdLabel = label;
      }
      render();
    },
    recording(on) {
      if (!useful || destroyed) return;
      rec = on;
      render();
    },
    notify() {
      if (!useful || destroyed) return;
      if (document.hidden) updates++;
    },
    simulate(ms = 6000) {
      if (useful || destroyed) return;
      window.clearTimeout(simTimer);
      if (!isAway) enterAway();
      simTimer = window.setTimeout(() => {
        simTimer = 0;
        if (!document.hidden) leaveAway();
      }, ms);
    },
    snapshot,
    clear() {
      if (destroyed) return;
      resetUseful();
      isAway = false;
      happyUntil = 0;
      window.clearTimeout(simTimer);
      simTimer = 0;
      render();
    },
    destroy() {
      if (destroyed) return;
      resetUseful();
      isAway = false;
      happyUntil = 0;
      window.clearTimeout(simTimer);
      applyTitle(null);
      restoreIcons();
      emit();
      destroyed = true;
      updateTicker();
      window.clearInterval(ticker);
      ticker = 0;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      toasts.forEach((el) => el.remove());
      toasts.clear();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (baseImg) baseImg.onload = null;
      liveInstances--;
      if (liveInstances <= 0) {
        liveInstances = 0;
        document.getElementById(STYLE_ID)?.remove();
        document.documentElement.removeAttribute("data-tab-tricks");
      }
    },
  };
}

/* ───────────────────────── React ───────────────────────── */

export type TabTricksProps = Omit<TabTricksOptions, "onChange"> & {
  /** Mirror title/favicon changes into your UI. */
  onChange?: (snapshot: TabSnapshot) => void;
  /** Receives the live handle (badge/progress/done/…) once mounted, and null on unmount. */
  onReady?: (handle: TabTricksHandle | null) => void;
};

/** Headless React wrapper: runs the core in an effect and renders nothing. */
export function TabTricks({ onChange, onReady, ...opts }: TabTricksProps) {
  const changeRef = React.useRef(onChange);
  const readyRef = React.useRef(onReady);
  React.useEffect(() => {
    changeRef.current = onChange;
    readyRef.current = onReady;
  });
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const inst = tabTricks({ ...(JSON.parse(key) as TabTricksOptions), onChange: (s) => changeRef.current?.(s) });
    readyRef.current?.(inst);
    return () => {
      inst.destroy();
      readyRef.current?.(null);
    };
  }, [key]);
  return null;
}

export default TabTricks;
