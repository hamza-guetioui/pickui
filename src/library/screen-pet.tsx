"use client";

import * as React from "react";

/**
 * screen-pet — a tiny animated character that lives along the bottom of
 * your website. It walks, stops to sit, falls asleep (zzz), trots over when
 * your cursor comes near the floor, jumps when clicked and says things in
 * a speech bubble. Pick `cat`, `robot` or `blob`, or bring your own sprite.
 *
 * Framework-agnostic core (`screenPet()`) + React wrapper (`<ScreenPet />`).
 * Zero dependencies · respects prefers-reduced-motion.
 */

export type PetKind = "cat" | "robot" | "blob";

export type ScreenPetOptions = {
  kind?: PetKind;
  /** Your own character: SVG markup or image URL (replaces `kind`). */
  sprite?: string;
  /** Things it says when clicked. */
  phrases?: string[];
  color?: string;
  /** Height in px (default 64). */
  size?: number;
  /** Walk speed px/s (default 50). */
  speed?: number;
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-screen-pet-style";
const CSS = `
.gxp{position:absolute;left:0;bottom:0;will-change:transform;cursor:pointer;user-select:none;-webkit-user-select:none}
.gxp-body{transform-origin:50% 100%;transition:transform .2s}
.gxp[data-state=walk] .gxp-legA{animation:gxp-leg .4s ease-in-out infinite}
.gxp[data-state=walk] .gxp-legB{animation:gxp-leg .4s ease-in-out infinite reverse}
.gxp[data-state=walk] .gxp-body{animation:gxp-bob .4s ease-in-out infinite}
.gxp[data-state=sit] .gxp-body{transform:scaleY(.9)}
.gxp[data-state=sleep] .gxp-body{transform:scaleY(.82)}
.gxp[data-state=sleep] .gxp-eye{transform:scaleY(.12)}
.gxp[data-state=jump] .gxp-body{animation:gxp-jump .55s cubic-bezier(.3,1.6,.5,1)}
.gxp-tail{transform-origin:12% 90%;animation:gxp-tail 1.2s ease-in-out infinite}
.gxp-eye{transform-box:fill-box;transform-origin:center;transition:transform .2s}
.gxp-bubble{position:absolute;bottom:100%;left:50%;transform:translate(-50%,-6px) scale(0);transform-origin:50% 100%;white-space:nowrap;padding:4px 9px;border-radius:12px;background:#fff;color:#111;font:600 12px/1.3 system-ui,sans-serif;box-shadow:0 6px 16px rgba(0,0,0,.25);transition:transform .25s cubic-bezier(.3,1.6,.5,1)}
.gxp-bubble[data-show]{transform:translate(-50%,-6px) scale(1)}
.gxp-z{position:absolute;right:-6px;top:-10px;font:700 12px system-ui;color:#a5b4fc;opacity:0}
.gxp[data-state=sleep] .gxp-z{animation:gxp-z 2s ease-in-out infinite}
@keyframes gxp-leg{50%{transform:rotate(22deg)}}
@keyframes gxp-bob{50%{transform:translateY(-3px)}}
@keyframes gxp-jump{40%{transform:translateY(-38px) scaleY(1.08)}}
@keyframes gxp-tail{50%{transform:rotate(14deg)}}
@keyframes gxp-z{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(10px,-22px)}}
@media (prefers-reduced-motion:reduce){.gxp *{animation:none!important}}
`;

function art(kind: PetKind, c: string) {
  if (kind === "robot")
    return `<svg viewBox="0 0 64 64" width="100%" height="100%"><g class="gxp-body">
<rect x="14" y="10" width="36" height="28" rx="8" fill="${c}"/><rect x="19" y="16" width="26" height="14" rx="5" fill="#0f172a"/>
<rect class="gxp-eye" x="23" y="20" width="6" height="6" rx="2" fill="#5eead4"/><rect class="gxp-eye" x="35" y="20" width="6" height="6" rx="2" fill="#5eead4"/>
<line x1="32" y1="10" x2="32" y2="3" stroke="${c}" stroke-width="2"/><circle cx="32" cy="3" r="2.5" fill="#f43f5e"/>
<rect x="18" y="38" width="28" height="12" rx="4" fill="${c}" opacity=".85"/></g>
<rect class="gxp-legA" x="21" y="50" width="6" height="12" rx="3" fill="#475569" style="transform-origin:24px 50px"/>
<rect class="gxp-legB" x="37" y="50" width="6" height="12" rx="3" fill="#475569" style="transform-origin:40px 50px"/></svg>`;
  if (kind === "blob")
    return `<svg viewBox="0 0 64 64" width="100%" height="100%"><g class="gxp-body">
<path d="M8 58c0-26 10-44 24-44s24 18 24 44z" fill="${c}"/><ellipse cx="22" cy="46" rx="6" ry="3" fill="#000" opacity=".08"/>
<ellipse class="gxp-eye" cx="25" cy="36" rx="3.2" ry="4.2" fill="#111"/><ellipse class="gxp-eye" cx="39" cy="36" rx="3.2" ry="4.2" fill="#111"/>
<path d="M28 44q4 3 8 0" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/></g>
<ellipse class="gxp-legA" cx="22" cy="60" rx="6" ry="3" fill="${c}" style="transform-origin:22px 58px"/><ellipse class="gxp-legB" cx="42" cy="60" rx="6" ry="3" fill="${c}" style="transform-origin:42px 58px"/></svg>`;
  return `<svg viewBox="0 0 72 64" width="100%" height="100%"><path class="gxp-tail" d="M58 40c10-2 12-14 6-20" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
<g class="gxp-body"><ellipse cx="40" cy="42" rx="20" ry="13" fill="${c}"/>
<circle cx="20" cy="30" r="13" fill="${c}"/><path d="M10 22l2-12 8 8zM30 22l-2-12-8 8z" fill="${c}"/><path d="M12 20l1.5-7 5 5zM28 20l-1.5-7-5 5z" fill="#f9a8d4"/>
<ellipse class="gxp-eye" cx="15" cy="30" rx="2.4" ry="3.2" fill="#111"/><ellipse class="gxp-eye" cx="25" cy="30" rx="2.4" ry="3.2" fill="#111"/>
<path d="M18 35l2 1.5 2-1.5" stroke="#111" stroke-width="1.4" fill="none"/><path d="M6 33h7M6 36l7-1M34 33h-7M34 36l-7-1" stroke="#111" stroke-width=".8" opacity=".5"/></g>
<rect class="gxp-legA" x="26" y="50" width="6" height="12" rx="3" fill="${c}" style="transform-origin:29px 50px"/><rect class="gxp-legB" x="48" y="50" width="6" height="12" rx="3" fill="${c}" style="transform-origin:51px 50px"/></svg>`;
}

const PHRASES = ["hi! 👋", "pet me?", "nice website", "*yawn*", "🐟?", "ship it!", "I live here now"];

export function screenPet(options: ScreenPetOptions = {}) {
  const { kind = "cat", sprite, phrases = PHRASES, color = "#f59e0b", size = 64, speed = 50, container, zIndex = 9998 } = options;
  if (typeof window === "undefined") return { destroy() {}, say: (() => {}) as (text: string) => void };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const fixed = !container;
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: fixed ? "fixed" : "absolute", left: "0", right: "0", bottom: "0", height: `${size * 2}px`, pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(layer);

  const pet = document.createElement("div");
  pet.className = "gxp";
  pet.setAttribute("role", "button");
  pet.setAttribute("aria-label", "A little pet. Click to say hi.");
  pet.tabIndex = 0;
  Object.assign(pet.style, { width: `${size * (kind === "cat" ? 1.12 : 1)}px`, height: `${size}px`, pointerEvents: "auto" });
  const custom = sprite && (sprite.trim().startsWith("<") ? sprite : `<img src="${sprite}" alt="" width="100%" height="100%" draggable="false" class="gxp-body">`);
  pet.innerHTML = `${custom ?? art(kind, color)}<span class="gxp-bubble"></span><span class="gxp-z">z</span>`;
  layer.appendChild(pet);
  const bubble = pet.querySelector<HTMLSpanElement>(".gxp-bubble")!;

  const width = () => (fixed ? window.innerWidth : host.clientWidth);
  const s = { x: width() * 0.3, dir: 1, state: "walk" as "walk" | "sit" | "sleep" | "jump" | "chase", timer: 3, mouseX: -1, mouseNear: false };
  let bubbleT = 0;
  const say = (t: string) => {
    bubble.textContent = t;
    bubble.dataset.show = "";
    window.clearTimeout(bubbleT);
    bubbleT = window.setTimeout(() => delete bubble.dataset.show, 1800);
  };
  const setState = (st: typeof s.state) => {
    s.state = st;
    pet.dataset.state = st === "chase" ? "walk" : st;
  };
  setState(reduced ? "sit" : "walk");

  const onMove = (e: PointerEvent) => {
    const r = fixed ? { left: 0, bottom: window.innerHeight } : host.getBoundingClientRect();
    s.mouseX = e.clientX - r.left;
    s.mouseNear = r.bottom - e.clientY < size * 2.4;
  };
  const poke = () => {
    if (s.state === "sleep") say("…5 more minutes");
    else say(phrases[Math.floor(Math.random() * phrases.length)]);
    setState("jump");
    s.timer = 0.6;
  };
  pet.addEventListener("click", poke);
  pet.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      poke();
    }
  });
  window.addEventListener("pointermove", onMove, { passive: true });

  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const W = width();
    s.timer -= dt;
    if (s.mouseNear && s.state !== "jump" && s.mouseX > 0) {
      if (Math.abs(s.mouseX - s.x) > size * 0.8) {
        if (s.state !== "chase") setState("chase");
        s.dir = Math.sign(s.mouseX - s.x);
        s.x += s.dir * speed * 2.2 * dt;
      } else if (s.state === "chase") {
        setState("sit");
        say("❤");
        s.timer = 2;
      }
    } else if (s.timer <= 0) {
      const r = Math.random();
      if (s.state === "jump" || s.state === "chase") setState("walk");
      else if (s.state === "walk") setState(r < 0.6 ? "sit" : "walk");
      else if (s.state === "sit") setState(r < 0.35 ? "sleep" : "walk");
      else setState("walk");
      if (s.state === "walk" && Math.random() < 0.4) s.dir *= -1;
      s.timer = s.state === "sleep" ? 6 : 2 + Math.random() * 4;
    }
    if (s.state === "walk") s.x += s.dir * speed * dt;
    if (s.x < size * 0.6) s.dir = 1;
    if (s.x > W - size * 0.6) s.dir = -1;
    s.x = Math.max(size * 0.5, Math.min(W - size * 0.5, s.x));
    pet.style.transform = `translateX(${s.x - size / 2}px) scaleX(${s.dir < 0 ? 1 : -1})`;
    bubble.style.transform = bubble.dataset.show !== undefined ? `translate(-50%,-6px) scale(1) scaleX(${s.dir < 0 ? 1 : -1})` : "";
    raf = requestAnimationFrame(loop);
  };
  if (reduced) pet.style.transform = `translateX(${s.x}px)`;
  else raf = requestAnimationFrame(loop);

  return {
    say,
    destroy() {
      cancelAnimationFrame(raf);
      window.clearTimeout(bubbleT);
      window.removeEventListener("pointermove", onMove);
      layer.remove();
    },
  };
}

export type ScreenPetProps = Omit<ScreenPetOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

/** React wrapper: the pet lives at the bottom of its positioned parent (or the page with `fullscreen`). */
export function ScreenPet({ fullscreen = false, animated = true, className = "", ...opts }: ScreenPetProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    const inst = screenPet({ ...(JSON.parse(key) as ScreenPetOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} />;
}

export default ScreenPet;
