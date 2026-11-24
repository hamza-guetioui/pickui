"use client";

import * as React from "react";

/**
 * SplitFlap — a mechanical airport/train departure board. Each cell flips
 * through the character drum one card at a time (just like the real thing)
 * until it lands on its target, with a top flap falling and a bottom flap
 * landing. Cycles through `words` or shows a controlled `value`.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SplitFlapProps = {
  /** Words to cycle through (ignored when `value` is set). */
  words?: string[];
  /** Controlled text. */
  value?: string;
  /** Number of cells (default: longest word). */
  length?: number;
  /** ms between words (default 3200). */
  interval?: number;
  /** ms per single flip (default 70). */
  flipMs?: number;
  /** Characters on the drum, in order. Unknown chars render as space. */
  charset?: string;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT_CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:/!?&#";

const css = `
@keyframes gx-sf-top{from{transform:rotateX(0)}to{transform:rotateX(-90deg)}}
@keyframes gx-sf-bot{from{transform:rotateX(90deg)}to{transform:rotateX(0)}}
.gx-sf-ft{animation:gx-sf-top calc(var(--ms)/2) ease-in forwards}
.gx-sf-fb{animation:gx-sf-bot calc(var(--ms)/2) ease-out calc(var(--ms)/2) both}
`;

function Half({ ch, half }: { ch: string; half: "top" | "bottom" }) {
  return (
    <span className={`absolute inset-x-0 h-1/2 overflow-hidden ${half === "top" ? "top-0" : "bottom-0"}`}>
      <span
        className={`absolute inset-x-0 flex h-[200%] items-center justify-center ${half === "top" ? "top-0" : "bottom-0"}`}
      >
        {ch}
      </span>
    </span>
  );
}

function Cell({ target, charset, ms, delay, reduced }: { target: string; charset: string; ms: number; delay: number; reduced: boolean }) {
  const [{ cur, prev, tick }, setFlap] = React.useState({ cur: target, prev: target, tick: 0 });
  const curRef = React.useRef(target);

  React.useEffect(() => {
    if (reduced) {
      curRef.current = target;
      setFlap((s) => ({ cur: target, prev: target, tick: s.tick }));
      return;
    }
    let idx = charset.indexOf(curRef.current);
    const goal = charset.indexOf(target);
    if (idx === goal) return;
    let timer = 0;
    const step = () => {
      idx = (idx + 1) % charset.length;
      const next = charset[idx];
      const before = curRef.current;
      curRef.current = next;
      setFlap((s) => ({ cur: next, prev: before, tick: s.tick + 1 }));
      if (idx !== goal) timer = window.setTimeout(step, ms);
    };
    timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
  }, [target, reduced, charset, ms, delay]);

  return (
    <span
      className="relative inline-block h-[1.5em] w-[1.05em] rounded-[0.12em] bg-[#141414] font-mono font-bold text-[#f5f1e6] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_2px_0_#000,0_6px_10px_-4px_rgba(0,0,0,.8)] [perspective:300px]"
      style={{ "--ms": `${ms}ms` } as React.CSSProperties}
    >
      {/* static: new top, old bottom */}
      <Half ch={cur} half="top" />
      <Half ch={prev} half="bottom" />
      {/* flaps */}
      {tick > 0 && prev !== cur && (
        <React.Fragment key={tick}>
          <span className="gx-sf-ft absolute inset-x-0 top-0 z-10 h-1/2 origin-bottom overflow-hidden rounded-t-[0.12em] bg-[#191919] [backface-visibility:hidden]">
            <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center">{prev}</span>
          </span>
          <span className="gx-sf-fb absolute inset-x-0 bottom-0 z-10 h-1/2 origin-top overflow-hidden rounded-b-[0.12em] bg-[#121212] [backface-visibility:hidden]">
            <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center">{cur}</span>
          </span>
        </React.Fragment>
      )}
      {/* hinge */}
      <span className="absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black/90" />
      <span className="absolute -left-[2px] top-1/2 z-20 h-[0.18em] w-[3px] -translate-y-1/2 rounded-sm bg-neutral-600" />
      <span className="absolute -right-[2px] top-1/2 z-20 h-[0.18em] w-[3px] -translate-y-1/2 rounded-sm bg-neutral-600" />
    </span>
  );
}

export function SplitFlap({
  words = ["HELLO", "WORLD"],
  value,
  length,
  interval = 3200,
  flipMs = 70,
  charset = DEFAULT_CHARSET,
  animated = true,
  className = "",
}: SplitFlapProps) {
  const [i, setI] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  React.useEffect(() => {
    if (value !== undefined || words.length < 2) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [value, words.length, interval]);

  const text = (value ?? words[i] ?? "").toUpperCase();
  const size = length ?? Math.max(text.length, ...words.map((w) => w.length));
  const padded = text.padEnd(size, " ").slice(0, size);
  const chars = [...padded].map((c) => (charset.includes(c) ? c : " "));

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <style>{css}</style>
      <span className="sr-only" aria-live="polite">
        {text}
      </span>
      <div
        aria-hidden
        className="inline-flex gap-[0.12em] rounded-[0.3em] border border-white/5 bg-gradient-to-b from-[#232323] to-[#0b0b0b] p-[0.3em] shadow-[0_20px_40px_-15px_rgba(0,0,0,.9)]"
      >
        {chars.map((c, idx) => (
          <Cell key={idx} target={c} charset={charset} ms={flipMs} delay={idx * 55} reduced={reduced || !animated} />
        ))}
      </div>
    </div>
  );
}

export default SplitFlap;
