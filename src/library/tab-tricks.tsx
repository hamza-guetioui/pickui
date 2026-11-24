"use client";

import * as React from "react";

/**
 * tab-tricks — make your browser TAB part of the experience. When the
 * visitor switches away, the title cycles through your messages ("Come
 * back! 👀") and the favicon becomes animated eyes looking around; when
 * they return, a "welcome back" toast says hi. Bonus: `progress(0..1)`
 * draws a progress ring in the favicon (uploads, timers, builds).
 *
 * Framework-agnostic core (`tabTricks()`) + React wrapper (`<TabTricks />`).
 * Zero dependencies · restores the original title & favicon on destroy.
 */

export type TabTricksOptions = {
  /** Titles cycled while the tab is hidden. */
  away?: string[];
  /** Toast shown when they come back (empty string disables). */
  welcome?: string;
  /** ms between title changes (default 1400). */
  interval?: number;
  /** Favicon animation while away: "eyes" | "wave" | "none". */
  favicon?: "eyes" | "wave" | "none";
  accent?: string;
};

function drawIcon(kind: "eyes" | "wave", t: number, accent: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = accent;
  g.beginPath();
  g.roundRect(0, 0, 64, 64, 16);
  g.fill();
  if (kind === "eyes") {
    const look = Math.sin(t * 2.2) * 6;
    for (const x of [20, 44]) {
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(x, 30, 10, 13, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#111";
      g.beginPath();
      g.arc(x + look, 32, 5, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    g.font = "40px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.translate(32, 36);
    g.rotate(Math.sin(t * 6) * 0.4);
    g.fillText("👋", 0, 0);
  }
  return c.toDataURL("image/png");
}

export function tabTricks(options: TabTricksOptions = {}) {
  const { away = ["Come back! 👀", "We miss you…", "Psst. Over here."], welcome = "Welcome back 👋", interval = 1400, favicon = "eyes", accent = "#4ade80" } = options;
  if (typeof document === "undefined") return { destroy() {}, progress: (() => {}) as (p: number | null) => void, simulate: (() => {}) as (ms?: number) => void };

  const originalTitle = document.title;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  const originalHref = link?.href ?? "";
  const created = !link;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  let titleT = 0;
  let iconRaf = 0;
  let toastEl: HTMLDivElement | null = null;

  const startAway = () => {
    let i = 0;
    document.title = away[0];
    titleT = window.setInterval(() => (document.title = away[++i % away.length]), interval);
    if (favicon !== "none") {
      const t0 = performance.now();
      let lastDraw = 0;
      const anim = (now: number) => {
        // background tabs throttle rAF; that's fine — redraw ~5×/s when it runs
        if (now - lastDraw > 200) {
          link!.href = drawIcon(favicon, (now - t0) / 1000, accent);
          lastDraw = now;
        }
        iconRaf = requestAnimationFrame(anim);
      };
      iconRaf = requestAnimationFrame(anim);
      link!.href = drawIcon(favicon, 0, accent);
    }
  };
  const showToast = () => {
    if (!welcome) return;
    toastEl?.remove();
    toastEl = document.createElement("div");
    toastEl.setAttribute("role", "status");
    toastEl.textContent = welcome;
    Object.assign(toastEl.style, {
      position: "fixed",
      left: "50%",
      top: "18px",
      transform: "translate(-50%,-80px)",
      padding: "10px 16px",
      borderRadius: "999px",
      background: accent,
      color: "#000",
      font: "700 14px system-ui,sans-serif",
      boxShadow: "0 12px 30px rgba(0,0,0,.35)",
      zIndex: "99999",
      transition: "transform .5s cubic-bezier(.3,1.5,.5,1)",
    });
    document.body.appendChild(toastEl);
    requestAnimationFrame(() => toastEl && (toastEl.style.transform = "translate(-50%,0)"));
    const el = toastEl;
    window.setTimeout(() => (el.style.transform = "translate(-50%,-80px)"), 2200);
    window.setTimeout(() => el.remove(), 2800);
  };
  const back = () => {
    window.clearInterval(titleT);
    cancelAnimationFrame(iconRaf);
    document.title = originalTitle;
    if (originalHref) link!.href = originalHref;
  };
  const onVis = () => {
    if (document.hidden) startAway();
    else {
      back();
      showToast();
    }
  };
  document.addEventListener("visibilitychange", onVis);

  return {
    /** Draw a progress ring (0–1) in the favicon; pass null to restore. */
    progress(p: number | null) {
      if (p === null) {
        if (originalHref) link!.href = originalHref;
        return;
      }
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      g.lineWidth = 10;
      g.strokeStyle = "rgba(127,127,127,.35)";
      g.beginPath();
      g.arc(32, 32, 24, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = accent;
      g.lineCap = "round";
      g.beginPath();
      g.arc(32, 32, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, p)));
      g.stroke();
      link!.href = c.toDataURL("image/png");
    },
    /** Preview the away → back cycle without leaving the tab. */
    simulate(ms = 4000) {
      startAway();
      window.setTimeout(() => {
        back();
        showToast();
      }, ms);
    },
    destroy() {
      document.removeEventListener("visibilitychange", onVis);
      back();
      if (created) link?.remove();
    },
  };
}

export type TabTricksProps = TabTricksOptions & { animated?: boolean; className?: string };

/** React wrapper with a live mock tab, so you can see the effect without switching tabs. */
export function TabTricks({ animated = true, className = "", ...opts }: TabTricksProps) {
  const inst = React.useRef<ReturnType<typeof tabTricks> | null>(null);
  const [sim, setSim] = React.useState(false);
  const [i, setI] = React.useState(0);
  const [p, setP] = React.useState(0);
  const away = opts.away ?? ["Come back! 👀", "We miss you…", "Psst. Over here."];
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    if (!animated) return;
    inst.current = tabTricks(JSON.parse(key) as TabTricksOptions);
    return () => inst.current?.destroy();
  }, [animated, key]);
  React.useEffect(() => {
    if (!sim) return;
    const t = window.setInterval(() => setI((v) => v + 1), opts.interval ?? 1400);
    const end = window.setTimeout(() => setSim(false), 4200);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(end);
    };
  }, [sim, opts.interval]);

  return (
    <div className={`w-full max-w-lg ${className}`}>
      <div className="rounded-t-xl border border-white/10 bg-[#1c1c1f] px-3 pt-2">
        <div className="flex items-end gap-1">
          <div className={`flex w-56 items-center gap-2 rounded-t-lg px-3 py-2 text-xs ${sim ? "bg-[#2a2a2e] text-white" : "bg-[#0c0c0e] text-white/80"}`}>
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded text-[9px]" style={{ background: opts.accent ?? "#4ade80" }}>
              {sim ? "👀" : "N"}
            </span>
            <span className="truncate" aria-live="polite">
              {sim ? away[i % away.length] : "Northwind — Pricing"}
            </span>
          </div>
          <div className="flex w-40 items-center gap-2 rounded-t-lg px-3 py-2 text-xs text-white/40">
            <span className="h-4 w-4 rounded bg-white/10" /> Other tab
          </div>
        </div>
      </div>
      <div className="rounded-b-xl border border-t-0 border-white/10 bg-[#0c0c0e] p-5 text-sm text-white/65">
        <p>Switch to another browser tab right now and look at this one. 👀</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSim(true);
              setI(0);
              inst.current?.simulate(4000);
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
          >
            Simulate leaving
          </button>
          <button
            type="button"
            onClick={() => {
              const next = p >= 1 ? 0 : Math.min(1, p + 0.25);
              setP(next);
              inst.current?.progress(next === 0 ? null : next);
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80"
          >
            Favicon progress: {Math.round(p * 100)}%
          </button>
        </div>
      </div>
    </div>
  );
}

export default TabTricks;
