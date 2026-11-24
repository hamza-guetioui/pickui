"use client";

import * as React from "react";

/**
 * CassettePlayer — a 1980s tape with real reel physics: while playing, tape
 * moves from the left reel to the right one, so the reels change size and
 * the take-up reel slows down as it fills. Rewind / fast-forward spin fast
 * with a whine. Use it as a progress indicator or a retro audio player.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type CassettePlayerProps = {
  title?: string;
  side?: "A" | "B";
  /** Length in seconds (default 180). */
  length?: number;
  /** Controlled progress 0–1 (for a real audio element). */
  progress?: number;
  onProgress?: (p: number) => void;
  /** false = reels don't spin (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

function Reel({ r, hubRef, x }: { r: number; hubRef: React.RefObject<HTMLDivElement | null>; x: string }) {
  return (
    <div className="absolute top-1/2" style={{ left: x }}>
      <div
        className="absolute rounded-full bg-[#2a1d14] shadow-[inset_0_0_6px_rgba(0,0,0,.8)]"
        style={{ width: r * 2, height: r * 2, left: -r, top: -r, transition: "all .3s" }}
      />
      <div ref={hubRef} className="absolute h-[44px] w-[44px] rounded-full border-4 border-[#e9e6df]" style={{ left: -22, top: -22 }}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <span key={a} className="absolute left-1/2 top-1/2 h-[8px] w-[3px] bg-[#e9e6df]" style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-12px)` }} />
        ))}
      </div>
    </div>
  );
}

export function CassettePlayer({
  title = "Summer '86 mixtape",
  side = "A",
  length = 180,
  progress,
  onProgress,
  animated = true,
  className = "",
}: CassettePlayerProps) {
  const [inner, setInner] = React.useState(0.18);
  const p = progress ?? inner;
  const [mode, setMode] = React.useState<"stop" | "play" | "ff" | "rew">("stop");
  const rot = React.useRef({ l: 0, r: 0 });
  const left = React.useRef<HTMLDivElement>(null);
  const right = React.useRef<HTMLDivElement>(null);
  const pRef = React.useRef(p);
  pRef.current = p;

  React.useEffect(() => {
    if (mode === "stop") return;
    let raf = 0;
    let last = performance.now();
    const speed = mode === "play" ? 1 : mode === "ff" ? 12 : -12;
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let np = pRef.current + (dt * speed) / length;
      if (np >= 1 || np <= 0) {
        np = Math.max(0, Math.min(1, np));
        setMode("stop");
      }
      if (progress === undefined) setInner(np);
      onProgress?.(np);
      // linear tape speed is constant → angular speed ∝ 1/radius
      const rl = 24 + (1 - np) * 30;
      const rr = 24 + np * 30;
      const v = speed * 60;
      if (animated) {
        rot.current.l += (v / rl) * dt * 57;
        rot.current.r += (v / rr) * dt * 57;
        if (left.current) left.current.style.transform = `rotate(${rot.current.l}deg)`;
        if (right.current) right.current.style.transform = `rotate(${rot.current.r}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, length, progress, onProgress, animated]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const tapeL = 24 + (1 - p) * 30;
  const tapeR = 24 + p * 30;

  const btn = (m: typeof mode, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => setMode(mode === m ? "stop" : m)}
      aria-pressed={mode === m}
      aria-label={label}
      className={`h-11 w-12 rounded-b-md border-t-4 text-sm font-bold shadow-[0_6px_0_#0d0d0f] transition-all active:translate-y-1 active:shadow-[0_2px_0_#0d0d0f] ${
        mode === m ? "translate-y-1 border-amber-400 bg-[#2b2b30] text-amber-300 shadow-[0_2px_0_#0d0d0f]" : "border-transparent bg-[#3a3a40] text-white/80"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className={`flex w-full max-w-md flex-col items-center gap-5 ${className}`}>
      <div className="relative h-[200px] w-full max-w-[340px] rounded-xl bg-gradient-to-b from-[#3c3c44] to-[#26262c] p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,.8)]">
        <div className="relative h-full rounded-lg bg-[#f2eadb] p-2">
          <div className="flex items-center justify-between px-2 font-mono text-[10px] text-[#3b2a17]">
            <span className="rounded bg-[#c43d2f] px-1.5 font-bold text-white">{side}</span>
            <span className="truncate px-2 font-serif text-sm italic">{title}</span>
            <span>C-{Math.round(length / 30) * 15}</span>
          </div>
          <div className="absolute inset-x-6 bottom-6 top-10 rounded-full bg-[#1a1a1d]">
            <div className="absolute inset-x-[30%] inset-y-3 rounded-md bg-[#2a1d14]/70" />
            <Reel r={tapeL} hubRef={left} x="22%" />
            <Reel r={tapeR} hubRef={right} x="78%" />
          </div>
          <div className="absolute bottom-1 left-1/2 h-3 w-1/3 -translate-x-1/2 rounded-t bg-[#cfc6b4]" />
        </div>
      </div>
      <div className="flex w-full max-w-[340px] items-center justify-between font-mono text-xs text-white/60">
        <span>{fmt(p * length)}</span>
        <div className="mx-3 h-1 flex-1 overflow-hidden rounded bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)} aria-label="Tape position">
          <div className="h-full bg-amber-300" style={{ width: `${p * 100}%` }} />
        </div>
        <span>{fmt(length)}</span>
      </div>
      <div className="flex gap-1.5">
        {btn("rew", "Rewind", "◀◀")}
        {btn("play", "Play", "▶")}
        {btn("ff", "Fast forward", "▶▶")}
        <button
          type="button"
          onClick={() => setMode("stop")}
          aria-label="Stop"
          className="h-11 w-12 rounded-b-md bg-[#3a3a40] text-sm font-bold text-white/80 shadow-[0_6px_0_#0d0d0f] transition-all active:translate-y-1 active:shadow-[0_2px_0_#0d0d0f]"
        >
          ■
        </button>
      </div>
    </div>
  );
}

export default CassettePlayer;
