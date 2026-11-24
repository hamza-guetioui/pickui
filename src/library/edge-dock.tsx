"use client";

import * as React from "react";

/**
 * edge-dock — a quick-tools tab that hides on the edge of your website.
 * Hover (or focus) the little tab and a dock slides out; each tool's label
 * pops out as a tooltip from the edge. Ships with useful defaults (back to
 * top, copy link, share, print, contact) and takes your own tools.
 *
 * Framework-agnostic core (`edgeDock()`) + React wrapper (`<EdgeDock />`).
 * Zero dependencies · keyboard accessible · respects prefers-reduced-motion.
 */

export type DockTool = { icon: string; label: string; href?: string; onClick?: () => void };

export type EdgeDockOptions = {
  side?: "left" | "right";
  /** Vertical position in % (default 50). */
  top?: number;
  tools?: DockTool[];
  accent?: string;
  /** Tab label (default "Quick tools"). */
  label?: string;
  container?: HTMLElement;
  zIndex?: number;
};

const STYLE_ID = "gx-edge-dock-style";
const CSS = `
.gxd{position:absolute;display:flex;align-items:center;transform:translateY(-50%);font:500 13px/1.2 system-ui,-apple-system,sans-serif}
.gxd[data-side=right]{right:0;flex-direction:row-reverse}
.gxd[data-side=left]{left:0}
.gxd-tab{all:unset;cursor:pointer;writing-mode:vertical-rl;padding:14px 7px;background:var(--gxd-a);color:#000;font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.gxd[data-side=right] .gxd-tab{border-radius:10px 0 0 10px}
.gxd[data-side=left] .gxd-tab{border-radius:0 10px 10px 0;transform:rotate(180deg)}
.gxd-tab:focus-visible{outline:2px solid #fff;outline-offset:2px}
.gxd-panel{position:absolute;top:50%;display:flex;flex-direction:column;gap:6px;padding:8px;background:rgba(17,17,19,.92);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 40px -10px rgba(0,0,0,.7);transition:transform .45s cubic-bezier(.3,1.4,.5,1),opacity .25s,visibility .25s}
.gxd-panel{opacity:0;visibility:hidden;pointer-events:none}
.gxd[data-side=right] .gxd-panel{right:100%;border-radius:16px 0 0 16px;transform:translate(24px,-50%)}
.gxd[data-side=left] .gxd-panel{left:100%;border-radius:0 16px 16px 0;transform:translate(-24px,-50%)}
.gxd[data-open] .gxd-panel{opacity:1;visibility:visible;pointer-events:auto;transform:translate(0,-50%)}
.gxd-tool{all:unset;position:relative;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;color:#fff;font-size:17px;cursor:pointer;transition:background .2s,transform .2s;transform:translateX(0)}
.gxd-tool:hover,.gxd-tool:focus-visible{background:rgba(255,255,255,.1)}
.gxd-tool:focus-visible{outline:2px solid var(--gxd-a)}
.gxd[data-open] .gxd-tool{animation:gxd-in .45s cubic-bezier(.3,1.5,.5,1) both}
.gxd-tip{position:absolute;top:50%;white-space:nowrap;padding:6px 10px;border-radius:9px;background:var(--gxd-a);color:#000;font-weight:700;font-size:12px;pointer-events:none;opacity:0;transition:transform .3s cubic-bezier(.3,1.5,.5,1),opacity .2s}
.gxd[data-side=right] .gxd-tip{right:calc(100% + 12px);transform:translate(12px,-50%) scale(.8)}
.gxd[data-side=left] .gxd-tip{left:calc(100% + 12px);transform:translate(-12px,-50%) scale(.8)}
.gxd-tool:hover .gxd-tip,.gxd-tool:focus-visible .gxd-tip{opacity:1;transform:translate(0,-50%) scale(1)}
.gxd-toast{position:absolute;bottom:16px;left:50%;transform:translate(-50%,20px);opacity:0;padding:8px 14px;border-radius:999px;background:#fff;color:#000;font:600 13px system-ui;transition:all .3s;pointer-events:none}
.gxd-toast[data-show]{transform:translate(-50%,0);opacity:1}
@keyframes gxd-in{from{opacity:0;transform:translateX(var(--gxd-from))}}
@media (prefers-reduced-motion:reduce){.gxd *{transition:none!important;animation:none!important}}
`;

export function edgeDock(options: EdgeDockOptions = {}) {
  const { side = "right", top = 50, accent = "#4ade80", label = "Quick tools", container, zIndex = 9997 } = options;
  if (typeof window === "undefined") return { destroy() {}, open() {}, close() {} };
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const fixed = !container;
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: fixed ? "fixed" : "absolute", inset: "0", pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(layer);

  const toast = document.createElement("div");
  toast.className = "gxd-toast";
  toast.setAttribute("role", "status");
  layer.appendChild(toast);
  const say = (t: string) => {
    toast.textContent = t;
    toast.dataset.show = "";
    window.setTimeout(() => delete toast.dataset.show, 1400);
  };

  const scroller = (): HTMLElement | Window => {
    let el: HTMLElement | null = container ?? null;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el;
      el = el.parentElement;
    }
    return window;
  };
  const tools: DockTool[] = options.tools ?? [
    { icon: "↑", label: "Back to top", onClick: () => scroller().scrollTo({ top: 0, behavior: "smooth" }) },
    {
      icon: "🔗",
      label: "Copy link",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(location.href);
        } catch {}
        say("Link copied ✓");
      },
    },
    {
      icon: "↗",
      label: "Share",
      onClick: async () => {
        if (navigator.share) await navigator.share({ title: document.title, url: location.href }).catch(() => {});
        else say("Sharing not supported here");
      },
    },
    { icon: "⎙", label: "Print page", onClick: () => window.print() },
    { icon: "✉", label: "Contact us", href: "#contact" },
  ];

  const dock = document.createElement("div");
  dock.className = "gxd";
  dock.dataset.side = side;
  dock.style.top = `${top}%`;
  dock.style.pointerEvents = "auto";
  dock.style.setProperty("--gxd-a", accent);
  dock.style.setProperty("--gxd-from", side === "right" ? "30px" : "-30px");

  const tab = document.createElement("button");
  tab.className = "gxd-tab";
  tab.type = "button";
  tab.textContent = label;
  tab.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div");
  panel.className = "gxd-panel";
  panel.setAttribute("role", "toolbar");
  panel.setAttribute("aria-label", label);
  tools.forEach((t, i) => {
    const el = document.createElement(t.href ? "a" : "button") as HTMLAnchorElement & HTMLButtonElement;
    el.className = "gxd-tool";
    if (t.href) el.href = t.href;
    else el.type = "button";
    el.setAttribute("aria-label", t.label);
    el.style.animationDelay = `${i * 45}ms`;
    el.innerHTML = `<span aria-hidden="true">${t.icon}</span><span class="gxd-tip">${t.label}</span>`;
    if (t.onClick) el.addEventListener("click", t.onClick);
    el.tabIndex = -1;
    panel.appendChild(el);
  });
  dock.append(tab, panel);
  layer.appendChild(dock);

  let closeT = 0;
  const open = () => {
    window.clearTimeout(closeT);
    dock.dataset.open = "";
    tab.setAttribute("aria-expanded", "true");
    panel.querySelectorAll<HTMLElement>(".gxd-tool").forEach((b) => (b.tabIndex = 0));
  };
  const close = () => {
    delete dock.dataset.open;
    tab.setAttribute("aria-expanded", "false");
    panel.querySelectorAll<HTMLElement>(".gxd-tool").forEach((b) => (b.tabIndex = -1));
  };
  dock.addEventListener("pointerenter", open);
  dock.addEventListener("pointerleave", () => (closeT = window.setTimeout(close, 350)));
  tab.addEventListener("click", () => (dock.dataset.open !== undefined ? close() : open()));
  dock.addEventListener("focusout", (e) => !dock.contains(e.relatedTarget as Node) && close());
  dock.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      tab.focus();
    }
  });

  return {
    open,
    close,
    destroy() {
      layer.remove();
    },
  };
}

export type EdgeDockProps = Omit<EdgeDockOptions, "container"> & { fullscreen?: boolean; animated?: boolean; className?: string };

/** React wrapper. Tools with functions are read once on mount. */
export function EdgeDock({ fullscreen = false, animated = true, className = "", tools, ...opts }: EdgeDockProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const toolsRef = React.useRef(tools);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const inst = edgeDock({ ...(JSON.parse(key) as EdgeDockOptions), tools: toolsRef.current, container: fullscreen ? undefined : ref.current ?? undefined });
    if (!animated) inst.open();
    return () => inst.destroy();
  }, [animated, fullscreen, key]);
  return fullscreen ? null : <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} />;
}

export default EdgeDock;
