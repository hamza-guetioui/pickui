"use client";

import * as React from "react";

/**
 * peek-promo — a friendly character peeks out from the edge of the screen
 * holding a little sign. It only appears after the visitor is clearly
 * engaged (scrolled X% or stayed N seconds), waves, and slides back on its
 * own if ignored. Click the sign → a compact offer card unfolds right there
 * (no modal, no overlay). Frequency-capped; ✕ hides it for days.
 *
 * Use it for your own offers, sponsors and affiliate links — not for
 * ad-network iframes.
 *
 * Framework-agnostic core (`peekPromo()`) + React wrapper (`<PeekPromo />`).
 */

export type PeekPromoOptions = {
  sign?: string;
  title?: string;
  body?: string;
  cta?: string;
  href?: string;
  side?: "left" | "right";
  /** Show after this scroll depth 0–1 (default 0.35) … */
  afterScroll?: number;
  /** … or after N seconds on page (default 12). */
  afterSeconds?: number;
  /** Seconds before it hides itself if ignored (default 9). */
  stay?: number;
  /** Days to stay hidden after ✕ (default 7). */
  snoozeDays?: number;
  color?: string;
  storageKey?: string;
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-peek-promo-style";
const CSS = `
.gxk{position:absolute;bottom:22%;display:flex;align-items:flex-end;pointer-events:auto;transition:transform .7s cubic-bezier(.3,1.4,.5,1);font:600 13px/1.35 system-ui,sans-serif}
.gxk[data-side=right]{right:0;transform:translateX(110%)}
.gxk[data-side=left]{left:0;transform:translateX(-110%);flex-direction:row-reverse}
.gxk[data-show]{transform:translateX(0)}
.gxk-sign{all:unset;cursor:pointer;margin-bottom:46px;padding:8px 12px;border-radius:10px;background:var(--gxk-c);color:#111;font-weight:800;box-shadow:0 8px 18px rgba(0,0,0,.3);transform:rotate(-6deg);animation:gxk-wiggle 2.6s ease-in-out infinite}
.gxk[data-side=left] .gxk-sign{transform:rotate(6deg)}
.gxk-sign:focus-visible{outline:2px solid #fff;outline-offset:3px}
.gxk-char{width:84px;height:110px}
.gxk-arm{transform-origin:20px 62px;animation:gxk-wave 1.2s ease-in-out infinite}
.gxk-card{position:absolute;bottom:100%;width:240px;padding:14px;border-radius:16px;background:#111113;color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 40px -10px rgba(0,0,0,.7);transform-origin:bottom;transform:scale(.6) translateY(10px);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.3,1.5,.5,1)}
.gxk[data-side=right] .gxk-card{right:12px}
.gxk[data-side=left] .gxk-card{left:12px}
.gxk[data-open] .gxk-card{transform:none;opacity:1;pointer-events:auto}
.gxk-card a{display:block;margin-top:10px;padding:9px;border-radius:10px;background:var(--gxk-c);color:#111;text-align:center;text-decoration:none;font-weight:800}
.gxk-x{all:unset;position:absolute;top:8px;right:10px;cursor:pointer;opacity:.5}
.gxk-x:hover{opacity:1}
@keyframes gxk-wiggle{50%{transform:rotate(-2deg) translateY(-3px)}}
@keyframes gxk-wave{50%{transform:rotate(-28deg)}}
@media (prefers-reduced-motion:reduce){.gxk,.gxk *{animation:none!important;transition:none!important}}
`;

export function peekPromo(options: PeekPromoOptions = {}) {
  const {
    sign = "psst! 🎁",
    title = "A little gift for reading",
    body = "Take 15% off your first order. Code is applied at checkout.",
    cta = "Claim 15% off",
    href = "#",
    side = "right",
    afterScroll = 0.35,
    afterSeconds = 12,
    stay = 9,
    snoozeDays = 7,
    color = "#86efac",
    storageKey = "gx-peek-promo",
    container,
    zIndex = 9989,
  } = options;
  if (typeof window === "undefined") return { destroy() {}, show() {} };
  try {
    const until = Number(localStorage.getItem(storageKey));
    if (until && until > Date.now()) return { destroy() {}, show() {} };
  } catch {}
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
  el.className = "gxk";
  el.dataset.side = side;
  el.style.setProperty("--gxk-c", color);
  el.innerHTML = `
<div class="gxk-card" role="dialog" aria-label="${title}"><button class="gxk-x" type="button" aria-label="Hide for ${snoozeDays} days">✕</button><b style="font-size:15px">${title}</b><p style="margin:6px 0 0;opacity:.7">${body}</p><a href="${href}">${cta}</a></div>
<button class="gxk-sign" type="button" aria-expanded="false">${sign}</button>
<svg class="gxk-char" viewBox="0 0 84 110" aria-hidden="true" style="${side === "left" ? "transform:scaleX(-1)" : ""}">
  <path class="gxk-arm" d="M22 62 Q8 50 12 36" stroke="#fbbf24" stroke-width="9" stroke-linecap="round" fill="none"/>
  <ellipse cx="56" cy="78" rx="34" ry="40" fill="#fbbf24"/>
  <ellipse cx="44" cy="62" rx="5" ry="7" fill="#1f2937"/><circle cx="45.5" cy="59.5" r="1.8" fill="#fff"/>
  <ellipse cx="62" cy="62" rx="5" ry="7" fill="#1f2937"/><circle cx="63.5" cy="59.5" r="1.8" fill="#fff"/>
  <path d="M46 80 Q53 87 60 80" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="38" cy="74" rx="5" ry="3" fill="#fb7185" opacity=".6"/><ellipse cx="70" cy="74" rx="5" ry="3" fill="#fb7185" opacity=".6"/>
</svg>`;
  layer.appendChild(el);
  const signBtn = el.querySelector<HTMLButtonElement>(".gxk-sign")!;

  let shown = false;
  let hideT = 0;
  const hide = () => {
    delete el.dataset.show;
    delete el.dataset.open;
    signBtn.setAttribute("aria-expanded", "false");
  };
  const show = () => {
    if (shown) return;
    shown = true;
    el.dataset.show = "";
    hideT = window.setTimeout(() => el.dataset.open === undefined && hide(), stay * 1000);
  };
  signBtn.addEventListener("click", () => {
    window.clearTimeout(hideT);
    const open = el.dataset.open === undefined;
    if (open) el.dataset.open = "";
    else delete el.dataset.open;
    signBtn.setAttribute("aria-expanded", String(open));
  });
  el.querySelector(".gxk-x")!.addEventListener("click", () => {
    try {
      localStorage.setItem(storageKey, String(Date.now() + snoozeDays * 864e5));
    } catch {}
    hide();
  });

  const scrollEl: HTMLElement | Window = container ?? window;
  const onScroll = () => {
    const depth = container
      ? container.scrollTop / Math.max(1, container.scrollHeight - container.clientHeight)
      : window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (depth >= afterScroll) show();
  };
  scrollEl.addEventListener("scroll", onScroll, { passive: true });
  const t = window.setTimeout(show, afterSeconds * 1000);

  return {
    show,
    destroy() {
      window.clearTimeout(t);
      window.clearTimeout(hideT);
      scrollEl.removeEventListener("scroll", onScroll);
      layer.remove();
    },
  };
}

export type PeekPromoProps = Omit<PeekPromoOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

export function PeekPromo({ fullscreen = false, animated = true, className = "", ...opts }: PeekPromoProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inst = React.useRef<ReturnType<typeof peekPromo> | null>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    inst.current = peekPromo({ ...(JSON.parse(key) as PeekPromoOptions), container: fullscreen ? undefined : ref.current ?? undefined });
    return () => inst.current?.destroy();
  }, [fullscreen, key, animated]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} />;
}

export default PeekPromo;
