"use client";

import * as React from "react";

/**
 * sponsor-flip — a respectful sponsor slot. A small card sits in a corner
 * (clearly labelled "Sponsored") and flips in 3D between your sponsors every
 * few seconds; hover pauses it. One click collapses it to a tiny dot for the
 * rest of the session — the dot can reopen it. Tracks impressions & clicks
 * via a callback so you can report to sponsors.
 *
 * For direct-sold sponsors / affiliate offers — not for ad-network iframes.
 *
 * Framework-agnostic core (`sponsorFlip()`) + React wrapper (`<SponsorFlip />`).
 */

export type Sponsor = { name: string; line: string; href: string; color: string; logo?: string };

export type SponsorFlipOptions = {
  sponsors?: Sponsor[];
  /** Seconds per sponsor (default 6). */
  every?: number;
  corner?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  /** (event, sponsor) — "impression" | "click". */
  onEvent?: (event: "impression" | "click", s: Sponsor) => void;
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-sponsor-flip-style";
const CSS = `
.gxs{position:absolute;width:250px;height:96px;perspective:800px;pointer-events:auto;font:600 13px/1.3 system-ui,sans-serif;transition:transform .45s cubic-bezier(.3,1.4,.5,1),opacity .3s}
.gxs[data-min]{transform:scale(0);opacity:0;pointer-events:none}
.gxs-card{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.4,0,.2,1)}
.gxs-face{position:absolute;inset:0;display:flex;gap:10px;align-items:center;padding:12px;border-radius:14px;background:#141416;color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 30px -10px rgba(0,0,0,.7);backface-visibility:hidden;text-decoration:none}
.gxs-face[data-back]{transform:rotateY(180deg)}
.gxs-logo{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:12px;color:#111;font-weight:900;font-size:18px}
.gxs-tag{position:absolute;top:-9px;left:12px;padding:2px 7px;border-radius:999px;background:#2a2a2e;color:rgba(255,255,255,.7);font:700 9px system-ui;letter-spacing:.12em;text-transform:uppercase}
.gxs-min{all:unset;position:absolute;top:-9px;right:8px;width:18px;height:18px;border-radius:50%;background:#2a2a2e;color:#fff;text-align:center;font:700 11px/18px system-ui;cursor:pointer}
.gxs-dot{all:unset;position:absolute;width:14px;height:14px;border-radius:50%;cursor:pointer;pointer-events:auto;transform:scale(0);transition:transform .3s cubic-bezier(.3,1.6,.5,1);box-shadow:0 0 0 4px rgba(255,255,255,.1)}
.gxs-dot[data-show]{transform:scale(1)}
@media (prefers-reduced-motion:reduce){.gxs,.gxs *{transition:none!important}}
`;

const SPONSORS: Sponsor[] = [
  { name: "Acme Hosting", line: "Deploy in 30s. First month free.", href: "#", color: "#4ade80" },
  { name: "Pixel Fonts", line: "Type that ships. 40% off this week.", href: "#", color: "#f472b6" },
  { name: "Northwind CI", line: "Faster builds or your money back.", href: "#", color: "#38bdf8" },
];

export function sponsorFlip(options: SponsorFlipOptions = {}) {
  const { sponsors = SPONSORS, every = 6, corner = "bottom-left", onEvent, container, zIndex = 9986 } = options;
  if (typeof window === "undefined" || !sponsors.length) return { destroy() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: container ? "absolute" : "fixed", inset: "0", pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(layer);
  const [v, h] = corner.split("-");
  const pos = (el: HTMLElement, off: number) => {
    el.style[v as "top" | "bottom"] = `${off}px`;
    el.style[h as "left" | "right"] = `${off}px`;
  };

  const box = document.createElement("div");
  box.className = "gxs";
  pos(box, 18);
  const card = document.createElement("div");
  card.className = "gxs-card";
  const face = (s: Sponsor, back: boolean) => {
    const a = document.createElement("a");
    a.className = "gxs-face";
    if (back) a.dataset.back = "";
    a.href = s.href;
    a.target = "_blank";
    a.rel = "sponsored noopener";
    a.innerHTML = `<span class="gxs-logo" style="background:${s.color}">${s.logo ?? s.name[0]}</span><span><b>${s.name}</b><br><span style="opacity:.6;font-weight:500">${s.line}</span></span>`;
    a.addEventListener("click", () => onEvent?.("click", s));
    return a;
  };
  let i = 0;
  let showing = 0; // which face looks at the user: 0 = front, 1 = back
  const faces = [face(sponsors[0], false), face(sponsors[1 % sponsors.length], true)];
  card.append(faces[0], faces[1]);
  const tag = document.createElement("span");
  tag.className = "gxs-tag";
  tag.textContent = "Sponsored";
  const min = document.createElement("button");
  min.className = "gxs-min";
  min.type = "button";
  min.textContent = "–";
  min.setAttribute("aria-label", "Minimize sponsor");
  box.append(card, tag, min);
  const dot = document.createElement("button");
  dot.className = "gxs-dot";
  dot.type = "button";
  dot.style.background = sponsors[0].color;
  dot.setAttribute("aria-label", "Show sponsor");
  pos(dot, 22);
  layer.append(box, dot);
  onEvent?.("impression", sponsors[0]);

  let paused = false;
  box.addEventListener("pointerenter", () => (paused = true));
  box.addEventListener("pointerleave", () => (paused = false));
  box.addEventListener("focusin", () => (paused = true));
  box.addEventListener("focusout", () => (paused = false));
  min.addEventListener("click", () => {
    box.dataset.min = "";
    dot.dataset.show = "";
  });
  dot.addEventListener("click", () => {
    delete box.dataset.min;
    delete dot.dataset.show;
  });

  const timer = window.setInterval(() => {
    if (paused || box.dataset.min !== undefined || document.hidden || sponsors.length < 2) return;
    i = (i + 1) % sponsors.length;
    if (reduced) {
      const rep = face(sponsors[i], false);
      card.replaceChild(rep, faces[0]);
      faces[0] = rep;
    } else {
      const hidden = 1 - showing;
      const rep = face(sponsors[i], hidden === 1);
      card.replaceChild(rep, faces[hidden]);
      faces[hidden] = rep;
      showing = hidden;
      card.style.transform = `rotateY(${showing ? 180 : 0}deg)`;
    }
    dot.style.background = sponsors[i].color;
    onEvent?.("impression", sponsors[i]);
  }, every * 1000);

  return {
    destroy() {
      window.clearInterval(timer);
      layer.remove();
    },
  };
}

export type SponsorFlipProps = Omit<SponsorFlipOptions, "container" | "onEvent"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function SponsorFlip({ fullscreen = false, animated = true, className = "", ...opts }: SponsorFlipProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const inst = sponsorFlip({ ...(JSON.parse(key) as SponsorFlipOptions), every: animated ? (JSON.parse(key) as SponsorFlipOptions).every ?? 4 : 9999, container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [fullscreen, key, animated]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} />;
}

export default SponsorFlip;
