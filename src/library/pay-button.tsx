"use client";

import * as React from "react";

/**
 * PayButton — a checkout button that tells the whole story: "Pay $49" →
 * it shrinks into a spinner, a card slides through a reader, then it blooms
 * into a green check with confetti — or shakes red on failure. Wire
 * `onPay` to your real payment call (return true / false).
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type PayButtonProps = {
  amount?: string;
  /** Your payment call. Resolve true = paid, false = declined. Default: fake 1.6s success. */
  onPay?: () => Promise<boolean>;
  /** false = text-only states, no morph / confetti (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-pb-spin{to{transform:rotate(360deg)}}
@keyframes gx-pb-swipe{0%{transform:translateX(-30px)}100%{transform:translateX(30px)}}
@keyframes gx-pb-shake{20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
@keyframes gx-pb-conf{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--x),var(--y)) rotate(540deg);opacity:0}}
@keyframes gx-pb-check{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}
.gx-pb-spin{animation:gx-pb-spin .8s linear infinite}
.gx-pb-swipe{animation:gx-pb-swipe .7s ease-in-out infinite alternate}
.gx-pb-shake{animation:gx-pb-shake .45s}
.gx-pb-conf{animation:gx-pb-conf .9s cubic-bezier(.2,.7,.3,1) forwards}
.gx-pb-check{stroke-dasharray:30;animation:gx-pb-check .35s .1s ease-out both}
@media (prefers-reduced-motion:reduce){.gx-pb *{animation:none!important}}
`;

export function PayButton({ amount = "$49.00", onPay, animated = true, className = "" }: PayButtonProps) {
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [fail, setFail] = React.useState(false);

  const pay = async () => {
    if (state === "loading") return;
    setState("loading");
    const ok = onPay ? await onPay() : await new Promise<boolean>((r) => window.setTimeout(() => r(!fail), 1600));
    setState(ok ? "done" : "error");
    if (!ok) window.setTimeout(() => setState("idle"), 1400);
  };

  const narrow = animated && state === "loading";
  const bg = state === "done" ? "#22c55e" : state === "error" ? "#ef4444" : "#ffffff";

  return (
    <div className={`gx-pb flex flex-col items-center gap-4 ${className}`}>
      <style>{css}</style>
      <div className="relative">
        <button
          type="button"
          onClick={state === "done" ? () => setState("idle") : pay}
          aria-live="polite"
          aria-busy={state === "loading"}
          className={`relative h-14 overflow-hidden rounded-full font-bold outline-none transition-[width,background-color] duration-500 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${state === "error" && animated ? "gx-pb-shake" : ""}`}
          style={{ width: narrow ? 56 : 240, background: bg, color: state === "idle" ? "#000" : "#fff", transitionTimingFunction: "cubic-bezier(.3,1.3,.5,1)" }}
        >
          {state === "idle" && (
            <span className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Pay {amount}
            </span>
          )}
          {state === "loading" &&
            (animated ? (
              <span className="absolute inset-0 grid place-items-center">
                <span className="gx-pb-spin absolute h-8 w-8 rounded-full border-[3px] border-black/10 border-t-black" />
                <span className="gx-pb-swipe absolute h-3 w-5 rounded-[3px] bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                <span className="sr-only">Processing payment</span>
              </span>
            ) : (
              <span className="text-black">Processing…</span>
            ))}
          {state === "done" && (
            <span className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path className={animated ? "gx-pb-check" : ""} d="M5 12l5 5 9-10" />
              </svg>
              Paid — thank you
            </span>
          )}
          {state === "error" && <span>Card declined — try again</span>}
        </button>
        {state === "done" &&
          animated &&
          Array.from({ length: 22 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="gx-pb-conf pointer-events-none absolute left-1/2 top-1/2 h-2 w-1.5"
              style={
                {
                  background: ["#22c55e", "#facc15", "#38bdf8", "#f472b6"][i % 4],
                  "--x": `${Math.cos((i / 22) * Math.PI * 2) * (70 + (i % 5) * 18)}px`,
                  "--y": `${Math.sin((i / 22) * Math.PI * 2) * (50 + (i % 3) * 20) - 20}px`,
                } as React.CSSProperties
              }
            />
          ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-white/50">
        <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} className="accent-red-500" />
        Simulate a declined card
      </label>
    </div>
  );
}

export default PayButton;
