"use client";

import * as React from "react";

/**
 * DropCountdown — urgency for product drops and flash sales: flip-card
 * digits for days/hours/minutes/seconds (each card folds when it changes),
 * a stock bar that drains as people buy, and a live "N people viewing"
 * pulse. Ends with a "Live now" state.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type DropCountdownProps = {
  /** Target date (default: ~1d 4h from now). */
  target?: Date | string | number;
  title?: string;
  /** Units in stock at launch (default 250). */
  stock?: number;
  /** false = digits change without the flip (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-dc-flip{0%{transform:rotateX(0)}100%{transform:rotateX(-180deg)}}
.gx-dc[data-animated="true"] .gx-dc-flap{animation:gx-dc-flip .6s cubic-bezier(.4,0,.2,1) forwards}
@media (prefers-reduced-motion:reduce){.gx-dc-flap{display:none}}
`;

function Card({ v, label }: { v: string; label: string }) {
  const prev = React.useRef(v);
  const [old, setOld] = React.useState(v);
  React.useEffect(() => {
    if (prev.current !== v) {
      setOld(prev.current);
      prev.current = v;
    }
  }, [v]);
  const face = "absolute inset-x-0 flex h-1/2 justify-center overflow-hidden bg-[#1b1b1f] font-mono text-4xl font-black text-white sm:text-5xl";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-16 rounded-xl [perspective:400px] sm:h-24 sm:w-20">
        <div className={`${face} top-0 items-end rounded-t-xl`}>
          <span className="translate-y-1/2">{v}</span>
        </div>
        <div className={`${face} bottom-0 items-start rounded-b-xl bg-[#17171a]`}>
          <span className="-translate-y-1/2">{old === v ? v : old}</span>
        </div>
        {old !== v && (
          <div key={v} className="gx-dc-flap absolute inset-x-0 top-0 z-10 h-1/2 origin-bottom [transform-style:preserve-3d]">
            <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-t-xl bg-[#1b1b1f] font-mono text-4xl font-black text-white [backface-visibility:hidden] sm:text-5xl">
              <span className="translate-y-1/2">{old}</span>
            </div>
            <div className="absolute inset-0 flex items-start justify-center overflow-hidden rounded-b-xl bg-[#17171a] font-mono text-4xl font-black text-white [backface-visibility:hidden] [transform:rotateX(180deg)] sm:text-5xl">
              <span className="-translate-y-1/2">{v}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black" />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">{label}</span>
    </div>
  );
}

export function DropCountdown({ target, title = "Runner 01 · Aero — Global drop", stock = 250, animated = true, className = "" }: DropCountdownProps) {
  const [end] = React.useState(() => (target ? new Date(target).getTime() : Date.now() + (28 * 3600 + 17 * 60 + 9) * 1000));
  const [now, setNow] = React.useState<number | null>(null);
  const [left, setLeft] = React.useState(stock);
  const [viewers, setViewers] = React.useState(1240);

  React.useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => {
      setNow(Date.now());
      setViewers((v) => Math.max(800, v + Math.round((Math.random() - 0.45) * 40)));
      setLeft((l) => (Math.random() < 0.35 ? Math.max(3, l - Math.ceil(Math.random() * 3)) : l));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const ms = Math.max(0, end - (now ?? end - 1));
  const parts = [Math.floor(ms / 86400000), Math.floor(ms / 3600000) % 24, Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map((n) =>
    String(n).padStart(2, "0"),
  );
  const live = now !== null && ms === 0;

  return (
    <div className={`gx-dc w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#141416] to-[#0b0b0d] p-6 text-center ${className}`} data-animated={animated}>
      <style>{css}</style>
      <div className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-red-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        {live ? "Live now" : "Drops in"}
      </div>
      <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
      <div className="mt-5 flex justify-center gap-2 sm:gap-3" role="timer" aria-label={`${parts[0]} days ${parts[1]} hours ${parts[2]} minutes ${parts[3]} seconds`}>
        {["Days", "Hours", "Min", "Sec"].map((l, i) => (
          <Card key={l} v={parts[i]} label={l} />
        ))}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs text-white/60">
          <span>
            <b className="text-white">{left}</b> of {stock} pairs left
          </span>
          <span>{viewers.toLocaleString("en-US")} viewing</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Stock left" aria-valuemin={0} aria-valuemax={stock} aria-valuenow={left}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${(left / stock) * 100}%`, background: left / stock < 0.25 ? "#ef4444" : "linear-gradient(90deg,#f59e0b,#ef4444)" }}
          />
        </div>
      </div>
      <button type="button" className="mt-6 h-11 w-full rounded-xl bg-white text-sm font-bold text-black hover:bg-white/85">
        {live ? "Buy now" : "Notify me"}
      </button>
    </div>
  );
}

export default DropCountdown;
