"use client";

import * as React from "react";

/**
 * scroll-reward — reward attention instead of interrupting it. A slim
 * progress line fills as the visitor reads; when they reach the end (or a
 * depth you choose) a tiny ticket slides in from the corner: "You read the
 * whole thing — here's 10% off". Click to reveal + copy the code. No modal,
 * no overlay, nothing blocks the content. Once per visitor per article.
 *
 * Framework-agnostic core (`scrollReward()`) + React wrapper (`<ScrollReward />`).
 */

export type ScrollRewardOptions = {
  /** Depth 0–1 at which the reward appears (default 0.9). */
  at?: number;
  title?: string;
  code?: string;
  note?: string;
  color?: string;
  /** Show the reading progress bar (default true). */
  progressBar?: boolean;
  storageKey?: string;
  container?: HTMLElement;
  zIndex?: number;
  onReward?: () => void;
};

const STYLE_ID = "gx-scroll-reward-style";
const CSS = `
.gxr-bar{position:absolute;top:0;left:0;height:3px;transform-origin:0 50%;transition:transform .1s linear}
.gxr-t{position:absolute;right:16px;bottom:16px;display:flex;align-items:stretch;pointer-events:auto;transform:translateY(140%) rotate(-4deg);transition:transform .7s cubic-bezier(.3,1.5,.5,1);font:600 13px/1.3 system-ui,sans-serif;filter:drop-shadow(0 14px 24px rgba(0,0,0,.45))}
.gxr-t[data-show]{transform:none}
.gxr-main{padding:12px 14px;background:#fffdf5;color:#1c1917;border-radius:12px 0 0 12px;-webkit-mask:radial-gradient(circle at 100% 0,transparent 7px,#000 7.5px) top/100% 51% no-repeat,radial-gradient(circle at 100% 100%,transparent 7px,#000 7.5px) bottom/100% 51% no-repeat}
.gxr-stub{all:unset;cursor:pointer;display:grid;place-items:center;width:84px;background:var(--gxr-c);color:#111;font-weight:900;border-radius:0 12px 12px 0;border-left:2px dashed rgba(0,0,0,.25);text-align:center;font-size:12px}
.gxr-stub:focus-visible{outline:2px solid #fff;outline-offset:2px}
.gxr-x{all:unset;position:absolute;top:-8px;left:-8px;width:20px;height:20px;border-radius:50%;background:#111;color:#fff;text-align:center;font:700 11px/20px system-ui;cursor:pointer}
@media (prefers-reduced-motion:reduce){.gxr-t{transition:none}}
`;

export function scrollReward(options: ScrollRewardOptions = {}) {
  const {
    at = 0.9,
    title = "You read the whole thing 👏",
    code = "READER10",
    note = "10% off — just for finishing.",
    color = "#fde047",
    progressBar = true,
    storageKey = `gx-scroll-reward:${typeof location !== "undefined" ? location.pathname : ""}`,
    container,
    zIndex = 9988,
    onReward,
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
  Object.assign(layer.style, { position: container ? "sticky" : "fixed", inset: container ? "auto" : "0", top: "0", left: "0", width: "100%", height: container ? `${container.clientHeight}px` : "100%", marginBottom: container ? `-${container.clientHeight}px` : "0", pointerEvents: "none", zIndex: String(zIndex) });
  host.prepend(layer);

  const bar = document.createElement("div");
  bar.className = "gxr-bar";
  bar.style.width = "100%";
  bar.style.background = color;
  bar.style.transform = "scaleX(0)";
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", "Reading progress");
  if (progressBar) layer.appendChild(bar);

  const ticket = document.createElement("div");
  ticket.className = "gxr-t";
  ticket.style.setProperty("--gxr-c", color);
  ticket.setAttribute("role", "status");
  ticket.innerHTML = `<button class="gxr-x" type="button" aria-label="Dismiss">✕</button><div class="gxr-main"><b>${title}</b><div style="opacity:.65;font-size:12px;margin-top:2px">${note}</div></div><button class="gxr-stub" type="button">TAP TO<br>REVEAL</button>`;
  layer.appendChild(ticket);
  const stub = ticket.querySelector<HTMLButtonElement>(".gxr-stub")!;
  stub.addEventListener("click", async () => {
    stub.innerHTML = `${code}<br><span style="font-weight:600;font-size:10px;opacity:.7">copied ✓</span>`;
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  });
  ticket.querySelector(".gxr-x")!.addEventListener("click", () => delete ticket.dataset.show);

  let done = false;
  try {
    done = localStorage.getItem(storageKey) === "1";
  } catch {}
  const show = () => {
    ticket.dataset.show = "";
    onReward?.();
  };
  const scrollEl: HTMLElement | Window = container ?? window;
  const onScroll = () => {
    const d = container
      ? container.scrollTop / Math.max(1, container.scrollHeight - container.clientHeight)
      : window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${Math.min(1, d)})`;
    bar.setAttribute("aria-valuenow", String(Math.round(d * 100)));
    if (!done && d >= at) {
      done = true;
      try {
        localStorage.setItem(storageKey, "1");
      } catch {}
      show();
    }
  };
  scrollEl.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return {
    show,
    destroy() {
      scrollEl.removeEventListener("scroll", onScroll);
      layer.remove();
    },
  };
}

export type ScrollRewardProps = Omit<ScrollRewardOptions, "container" | "onReward"> & { animated?: boolean; className?: string; children?: React.ReactNode };

/** React wrapper: renders its own scrollable article box (or pass `children`). */
export function ScrollReward({ animated = true, className = "", children, ...opts }: ScrollRewardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!ref.current) return;
    const inst = scrollReward({ ...(JSON.parse(key) as ScrollRewardOptions), container: ref.current });
    return () => inst.destroy();
  }, [key, animated]);
  return (
    <div ref={ref} className={`relative h-full max-h-[440px] min-h-[360px] w-full overflow-y-auto bg-[#0b0b0d] ${className}`}>
      {children ?? (
        <article className="mx-auto max-w-md px-6 py-10 text-white/70">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-300">Blog · 3 min read</p>
          <h3 className="mt-2 text-2xl font-black text-white">Why small releases win</h3>
          {Array.from({ length: 7 }, (_, i) => (
            <p key={i} className="mt-4 leading-relaxed">
              Shipping in small slices keeps feedback fast and risk low. Each change is easy to review, easy to roll back and easy to understand six
              months later. Scroll to the end — there’s a little something waiting. ({i + 1}/7)
            </p>
          ))}
          <p className="mt-6 font-semibold text-white">The end. 🎉</p>
        </article>
      )}
    </div>
  );
}

export default ScrollReward;
