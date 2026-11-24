"use client";

import * as React from "react";

/**
 * exit-whisper — exit intent without the rage. Instead of a full-screen
 * modal, when the cursor races toward the browser's tab bar (or the visitor
 * scrolls up fast on mobile), a small paper note drops down from the top
 * edge on a string: one line, one button. Ignore it and it reels itself back
 * up after a few seconds. Max once per session.
 *
 * Framework-agnostic core (`exitWhisper()`) + React wrapper (`<ExitWhisper />`).
 */

export type ExitWhisperOptions = {
  text?: string;
  cta?: string;
  href?: string;
  /** Seconds before it reels itself back up (default 6). */
  stay?: number;
  /** Min seconds on page before it may appear (default 8). */
  minTime?: number;
  color?: string;
  storageKey?: string;
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-exit-whisper-style";
const CSS = `
.gxw{position:absolute;top:0;left:50%;display:flex;flex-direction:column;align-items:center;pointer-events:auto;transform:translate(-50%,-110%);transition:transform .8s cubic-bezier(.3,1.5,.5,1);font:600 14px/1.35 system-ui,sans-serif}
.gxw[data-show]{transform:translate(-50%,0)}
.gxw-string{width:1px;height:46px;background:rgba(255,255,255,.55)}
.gxw-note{position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;background:#fffdf5;color:#1c1917;border-radius:4px;box-shadow:0 16px 30px -8px rgba(0,0,0,.6);transform-origin:50% -46px;animation:gxw-swing 2.4s ease-in-out infinite}
.gxw-note::before{content:"";position:absolute;top:-5px;left:50%;width:10px;height:10px;border-radius:50%;transform:translateX(-50%);background:#ef4444;box-shadow:0 1px 2px rgba(0,0,0,.4)}
.gxw-note a{padding:7px 12px;border-radius:999px;background:var(--gxw-c);color:#111;text-decoration:none;font-weight:800;white-space:nowrap}
.gxw-x{all:unset;cursor:pointer;opacity:.45;padding:2px 4px}
.gxw-x:hover{opacity:1}
@keyframes gxw-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@media (prefers-reduced-motion:reduce){.gxw,.gxw *{animation:none!important;transition:none!important}}
`;

export function exitWhisper(options: ExitWhisperOptions = {}) {
  const {
    text = "Leaving already? Your cart is saved — and here’s free shipping.",
    cta = "Use FREESHIP",
    href = "#",
    stay = 6,
    minTime = 8,
    color = "#86efac",
    storageKey = "gx-exit-whisper",
    container,
    zIndex = 9987,
  } = options;
  if (typeof window === "undefined") return { destroy() {}, show() {} };
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: container ? "absolute" : "fixed", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: String(zIndex) });
  host.appendChild(layer);
  const el = document.createElement("div");
  el.className = "gxw";
  el.style.setProperty("--gxw-c", color);
  el.setAttribute("role", "status");
  el.innerHTML = `<span class="gxw-string"></span><div class="gxw-note"><span>${text}</span><a href="${href}">${cta}</a><button class="gxw-x" type="button" aria-label="Dismiss">✕</button></div>`;
  layer.appendChild(el);

  const t0 = Date.now();
  let used = false;
  try {
    used = sessionStorage.getItem(storageKey) === "1";
  } catch {}
  let hideT = 0;
  const hide = () => delete el.dataset.show;
  const show = (force = false) => {
    if ((!force && used) || (!force && Date.now() - t0 < minTime * 1000)) return;
    used = true;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    el.dataset.show = "";
    window.clearTimeout(hideT);
    hideT = window.setTimeout(hide, stay * 1000);
  };
  el.addEventListener("pointerenter", () => window.clearTimeout(hideT));
  el.addEventListener("pointerleave", () => (hideT = window.setTimeout(hide, 2500)));
  el.querySelector(".gxw-x")!.addEventListener("click", hide);

  // desktop: fast upward movement into the top 10px of the area
  let lastY = 9999;
  let lastT = 0;
  const onMove = (e: PointerEvent) => {
    const top = container ? container.getBoundingClientRect().top : 0;
    const y = e.clientY - top;
    const now = performance.now();
    const v = (lastY - y) / Math.max(1, now - lastT);
    if (y < 14 && v > 0.6) show();
    lastY = y;
    lastT = now;
  };
  const onLeave = (e: MouseEvent) => !container && e.clientY <= 0 && show();
  // mobile: fast scroll up
  let lastScroll = window.scrollY;
  const onScroll = () => {
    const d = lastScroll - window.scrollY;
    if (d > 120 && window.scrollY > 400) show();
    lastScroll = window.scrollY;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("mouseout", onLeave);
  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    show: () => show(true),
    destroy() {
      window.clearTimeout(hideT);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
      layer.remove();
    },
  };
}

export type ExitWhisperProps = Omit<ExitWhisperOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function ExitWhisper({ fullscreen = false, animated = true, className = "", ...opts }: ExitWhisperProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inst = React.useRef<ReturnType<typeof exitWhisper> | null>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    inst.current = exitWhisper({ ...(JSON.parse(key) as ExitWhisperOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.current?.destroy();
  }, [fullscreen, key, animated]);
  return fullscreen ? null : (
    <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`}>
      <p className="absolute inset-x-0 bottom-3 text-center font-mono text-[11px] text-white/40">move your cursor quickly up to the top edge ↑</p>
      <button
        type="button"
        onClick={() => inst.current?.show()}
        className="pointer-events-auto absolute bottom-3 right-3 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white"
      >
        preview
      </button>
    </div>
  );
}

export default ExitWhisper;
