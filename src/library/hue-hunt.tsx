"use client";

import * as React from "react";

/**
 * HueHunt — a color-matching game for designers: you see a target color
 * for 3 seconds, then it hides and you rebuild it with hue / saturation /
 * lightness sliders. Score is computed with perceptual color distance
 * (OKLab ΔE), five rounds, shareable result.
 * Game · zero dependencies.
 */

export type HueHuntProps = {
  rounds?: number;
  /** Seconds the target is shown (default 3). */
  peek?: number;
  /** false = no reveal wipe (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

type HSL = { h: number; s: number; l: number };

function hslToRgb({ h, s, l }: HSL) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function toOklab([r, g, b]: number[]) {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const css = (c: HSL) => `hsl(${c.h} ${c.s}% ${c.l}%)`;
const randomColor = (): HSL => ({ h: Math.floor(Math.random() * 360), s: 35 + Math.floor(Math.random() * 60), l: 30 + Math.floor(Math.random() * 45) });

export function HueHunt({ rounds = 5, peek = 3, animated = true, className = "" }: HueHuntProps) {
  const [round, setRound] = React.useState(1);
  const [target, setTarget] = React.useState<HSL>({ h: 200, s: 70, l: 50 });
  const [guess, setGuess] = React.useState<HSL>({ h: 180, s: 50, l: 50 });
  const [phase, setPhase] = React.useState<"intro" | "peek" | "guess" | "reveal" | "done">("intro");
  const [scores, setScores] = React.useState<number[]>([]);
  const [left, setLeft] = React.useState(peek);

  const begin = () => {
    setTarget(randomColor());
    setGuess({ h: 180, s: 50, l: 50 });
    setPhase("peek");
    setLeft(peek);
  };
  React.useEffect(() => {
    if (phase !== "peek") return;
    if (left <= 0) {
      setPhase("guess");
      return;
    }
    const t = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, left]);

  const submit = () => {
    const a = toOklab(hslToRgb(target));
    const b = toOklab(hslToRgb(guess));
    const dE = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const score = Math.max(0, Math.round(100 - dE * 280) / 10);
    setScores((s) => [...s, score]);
    setPhase("reveal");
  };
  const next = () => {
    if (round >= rounds) return setPhase("done");
    setRound((r) => r + 1);
    begin();
  };
  const total = scores.reduce((a, b) => a + b, 0);

  const Slider = ({ k, max, label, bg }: { k: keyof HSL; max: number; label: string; bg: string }) => (
    <label className="block">
      <span className="flex justify-between font-mono text-[11px] text-white/55">
        {label} <b className="text-white">{guess[k]}</b>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={guess[k]}
        disabled={phase !== "guess"}
        onChange={(e) => setGuess((g) => ({ ...g, [k]: Number(e.target.value) }))}
        className="mt-1 h-3 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black/40"
        style={{ background: bg }}
      />
    </label>
  );

  return (
    <div className={`w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d10] p-5 ${className}`}>
      <div className="flex items-center justify-between font-mono text-xs text-white/55">
        <span>
          round {Math.min(round, rounds)}/{rounds}
        </span>
        <span>
          score <b className="text-white">{total.toFixed(1)}</b>/{rounds * 10}
        </span>
      </div>
      <div className="relative mt-3 grid h-44 grid-cols-2 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative grid place-items-center" style={{ background: phase === "peek" || phase === "reveal" || phase === "done" ? css(target) : "#1a1a1e", transition: animated ? "background .4s" : undefined }}>
          <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white">
            {phase === "peek" ? `memorise… ${left}` : phase === "guess" ? "hidden 🙈" : phase === "intro" ? "target" : css(target)}
          </span>
        </div>
        <div className="grid place-items-center" style={{ background: css(guess) }}>
          <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white">your guess</span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Slider k="h" max={360} label="hue" bg="linear-gradient(90deg,red,#ff0,lime,cyan,blue,#f0f,red)" />
        <Slider k="s" max={100} label="saturation" bg={`linear-gradient(90deg,hsl(${guess.h} 0% ${guess.l}%),hsl(${guess.h} 100% ${guess.l}%))`} />
        <Slider k="l" max={100} label="lightness" bg={`linear-gradient(90deg,#000,hsl(${guess.h} ${guess.s}% 50%),#fff)`} />
      </div>
      <div className="mt-5 flex items-center justify-between" aria-live="polite">
        {phase === "intro" && (
          <button type="button" onClick={begin} className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-black">
            Start — you get {peek}s to memorise
          </button>
        )}
        {phase === "peek" && <p className="text-sm text-white/60">Look closely…</p>}
        {phase === "guess" && (
          <button type="button" onClick={submit} className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-black">
            Lock in my guess
          </button>
        )}
        {phase === "reveal" && (
          <>
            <p className="text-sm text-white">
              <b className="text-2xl font-black">{scores[scores.length - 1]?.toFixed(1)}</b>/10 {scores[scores.length - 1] > 9 ? "· designer eyes 👁" : ""}
            </p>
            <button type="button" onClick={next} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black">
              {round >= rounds ? "See result" : "Next color"}
            </button>
          </>
        )}
        {phase === "done" && (
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-white">
              Final: <b className="text-2xl font-black">{total.toFixed(1)}</b>/{rounds * 10}
            </p>
            <button
              type="button"
              onClick={() => {
                setScores([]);
                setRound(1);
                setPhase("intro");
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HueHunt;
