"use client";

import * as React from "react";

/**
 * promo-plane — the beach-banner plane, for your website. Every now and
 * then a little plane flies across the top of the page towing a waving
 * banner with your promo. Hover pauses it (so it can be read), click opens
 * your link, ✕ sends it away for good. Frequency-capped, never covers
 * content for long, never blocks clicks.
 *
 * Use it for YOUR promos, sponsors and affiliate offers. Don't put ad-network
 * iframes (e.g. AdSense units) inside moving elements — that breaks most
 * ad-network policies.
 *
 * Framework-agnostic core (`promoPlane()`) + React wrapper (`<PromoPlane />`).
 */

export type PromoPlaneOptions = {
  text?: string;
  href?: string;
  /** Banner color. */
  color?: string;
  /** Seconds to cross the screen (default 14). */
  duration?: number;
  /** First flight after N seconds (default 4). */
  delay?: number;
  /** Repeat every N seconds (0 = once per page view, default 0). */
  every?: number;
  /** Max flights per visitor per day (default 3; 0 = unlimited). */
  dailyCap?: number;
  /** localStorage key for capping and dismissal. */
  storageKey?: string;
  container?: HTMLElement;
  zIndex?: number;
  onClick?: () => void;
};

const STYLE_ID = "gx-promo-plane-style";
const CSS = `
.gxpp{position:absolute;top:12px;left:0;display:flex;align-items:center;gap:0;pointer-events:auto;cursor:pointer;will-change:transform;font:800 13px/1 system-ui,sans-serif}
.gxpp-banner{position:relative;padding:9px 16px 9px 14px;color:#111;white-space:nowrap;clip-path:polygon(0 0,100% 0,96% 50%,100% 100%,0 100%);animation:gxpp-wave 1.1s ease-in-out infinite;transform-origin:100% 50%;box-shadow:0 6px 14px rgba(0,0,0,.25)}
.gxpp-rope{width:46px;height:1px;background:rgba(255,255,255,.7)}
.gxpp-x{all:unset;position:absolute;top:-8px;left:-8px;width:18px;height:18px;border-radius:50%;background:#111;color:#fff;font:700 10px/18px system-ui;text-align:center;cursor:pointer;opacity:0;transition:opacity .2s}
.gxpp:hover .gxpp-x,.gxpp:focus-within .gxpp-x{opacity:1}
.gxpp-plane{animation:gxpp-bob 1.6s ease-in-out infinite}
.gxpp-prop{transform-origin:center;animation:gxpp-spin .12s linear infinite}
@keyframes gxpp-wave{0%,100%{transform:skewY(0deg) scaleY(1)}50%{transform:skewY(2.5deg) scaleY(.94)}}
@keyframes gxpp-bob{50%{transform:translateY(-4px) rotate(-2deg)}}
@keyframes gxpp-spin{to{transform:scaleY(.2)}}
@media (prefers-reduced-motion:reduce){.gxpp *{animation:none!important}}
`;

const today = () => new Date().toISOString().slice(0, 10);

export function promoPlane(options: PromoPlaneOptions = {}) {
  const {
    text = "☀ Summer sale — 30% off everything →",
    href = "#",
    color = "#fde047",
    duration = 14,
    delay = 4,
    every = 0,
    dailyCap = 3,
    storageKey = "gx-promo-plane",
    container,
    zIndex = 9990,
    onClick,
  } = options;
  if (typeof window === "undefined") return { destroy() {}, fly() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}") as { day?: string; n?: number; off?: boolean };
    } catch {
      return {};
    }
  };
  const write = (v: object) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(v));
    } catch {}
  };
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: container ? "absolute" : "fixed", left: "0", right: "0", top: "0", height: "70px", pointerEvents: "none", overflow: "hidden", zIndex: String(zIndex) });
  host.appendChild(layer);

  let anim: Animation | null = null;
  const timers: number[] = [];

  const fly = (force = false) => {
    const st = read();
    if (!force) {
      if (st.off) return;
      const n = st.day === today() ? st.n ?? 0 : 0;
      if (dailyCap && n >= dailyCap) return;
      write({ ...st, day: today(), n: n + 1 });
    }
    if (anim) return;
    const plane = document.createElement("a");
    plane.className = "gxpp";
    plane.href = href;
    plane.setAttribute("aria-label", `Promotion: ${text}`);
    plane.innerHTML = `<span class="gxpp-banner" style="background:${color}">${text}<button type="button" class="gxpp-x" aria-label="Dismiss promotion">✕</button></span><span class="gxpp-rope"></span>
<svg class="gxpp-plane" width="62" height="34" viewBox="0 0 62 34" aria-hidden="true"><path d="M4 18 L44 14 Q54 13 58 17 Q54 21 44 21 L4 20Z" fill="#f8fafc"/><path d="M26 15 L18 3 L24 3 L36 15Z M26 20 L20 31 L26 31 L36 20Z" fill="#ef4444"/><path d="M6 18 L2 9 L8 9 L12 17Z" fill="#ef4444"/><circle cx="50" cy="16" r="2.4" fill="#7dd3fc"/><rect class="gxpp-prop" x="58" y="8" width="2.5" height="18" rx="1" fill="#334155"/></svg>`;
    layer.appendChild(plane);
    const W = container ? host.clientWidth : window.innerWidth;
    const w = plane.offsetWidth;
    plane.querySelector(".gxpp-x")!.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      write({ ...read(), off: true });
      anim?.finish();
    });
    plane.addEventListener("click", () => onClick?.());
    if (reduced) {
      plane.style.transform = `translateX(${Math.max(8, W - w - 16)}px)`;
      timers.push(window.setTimeout(() => plane.remove(), 8000));
      return;
    }
    anim = plane.animate([{ transform: `translateX(${-w - 20}px)` }, { transform: `translateX(${W + 20}px)` }], { duration: duration * 1000, easing: "linear" });
    plane.addEventListener("pointerenter", () => anim?.pause());
    plane.addEventListener("pointerleave", () => anim?.play());
    plane.addEventListener("focusin", () => anim?.pause());
    plane.addEventListener("focusout", () => anim?.play());
    anim.onfinish = () => {
      plane.remove();
      anim = null;
    };
  };

  timers.push(window.setTimeout(() => fly(), delay * 1000));
  if (every > 0) timers.push(window.setInterval(() => fly(), every * 1000));

  return {
    /** Fly now (ignores caps when `force` is true). */
    fly,
    destroy() {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      anim?.cancel();
      layer.remove();
    },
  };
}

export type PromoPlaneProps = Omit<PromoPlaneOptions, "container" | "onClick"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function PromoPlane({ fullscreen = false, animated = true, className = "", ...opts }: PromoPlaneProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inst = React.useRef<ReturnType<typeof promoPlane> | null>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    inst.current = promoPlane({ ...(JSON.parse(key) as PromoPlaneOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.current?.destroy();
  }, [fullscreen, key, animated]);
  return fullscreen ? null : (
    <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`}>
      <button
        type="button"
        onClick={() => inst.current?.fly(true)}
        className="pointer-events-auto absolute bottom-3 right-3 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white"
      >
        ✈ fly again
      </button>
    </div>
  );
}

export default PromoPlane;
