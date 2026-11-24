"use client";

import * as React from "react";

/**
 * ReactionLights — the Formula 1 start test. Five red lights come on one by
 * one, then go out after a random delay: react as fast as you can (click,
 * tap or Space). Jump the start and you're penalised. Best time is saved,
 * your result gets a rating, and there's a share button.
 * Game · zero dependencies.
 */

export type ReactionLightsProps = {
  /** localStorage key for the best time (null disables saving). */
  storageKey?: string | null;
  /** false = no glow / pulse (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

type Phase = "idle" | "arming" | "waiting" | "go" | "result" | "jump";

const rate = (ms: number) => (ms < 200 ? "F1 driver 🏎️" : ms < 250 ? "Pro racer" : ms < 300 ? "Quick!" : ms < 400 ? "Average human" : "Sunday driver 🐢");

export function ReactionLights({ storageKey = "gx-reaction-best", animated = true, className = "" }: ReactionLightsProps) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [lit, setLit] = React.useState(0);
  const [ms, setMs] = React.useState<number | null>(null);
  const [best, setBest] = React.useState<number | null>(null);
  const timers = React.useRef<number[]>([]);
  const goAt = React.useRef(0);

  React.useEffect(() => {
    if (!storageKey) return;
    const v = Number(localStorage.getItem(storageKey));
    if (v) setBest(v);
  }, [storageKey]);

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  React.useEffect(() => clear, []);

  const start = () => {
    clear();
    setMs(null);
    setLit(0);
    setPhase("arming");
    for (let i = 1; i <= 5; i++) timers.current.push(window.setTimeout(() => setLit(i), i * 900));
    const out = 5 * 900 + 400 + Math.random() * 2600;
    timers.current.push(window.setTimeout(() => setPhase("waiting"), 5 * 900));
    timers.current.push(
      window.setTimeout(() => {
        setLit(0);
        setPhase("go");
        goAt.current = performance.now();
      }, out),
    );
  };

  const hit = () => {
    if (phase === "idle" || phase === "result" || phase === "jump") return start();
    if (phase === "arming" || phase === "waiting") {
      clear();
      setLit(0);
      setPhase("jump");
      return;
    }
    if (phase === "go") {
      const t = Math.round(performance.now() - goAt.current);
      setMs(t);
      setPhase("result");
      if (!best || t < best) {
        setBest(t);
        if (storageKey) localStorage.setItem(storageKey, String(t));
      }
    }
  };

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !(document.activeElement as HTMLElement)?.closest?.("[data-gx-rl]")) return;
      e.preventDefault();
      hit();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const share = async () => {
    const text = `My F1 reaction time: ${ms} ms — ${rate(ms ?? 999)}. Beat me →`;
    try {
      if (navigator.share) await navigator.share({ text, url: location.href });
      else await navigator.clipboard.writeText(`${text} ${location.href}`);
    } catch {}
  };

  return (
    <div data-gx-rl className={`flex w-full max-w-lg flex-col items-center gap-5 ${className}`}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          hit();
        }}
        onKeyDown={(e) => e.key === "Enter" && hit()}
        aria-label="Reaction test. Press to start, then press when the lights go out."
        className="w-full touch-none select-none rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b1b1f] to-[#0c0c0e] p-5 outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <div className="flex justify-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-xl bg-black p-2">
              {[0, 1].map((r) => (
                <span
                  key={r}
                  className="h-8 w-8 rounded-full transition-colors duration-75 sm:h-10 sm:w-10"
                  style={{
                    background: lit >= i ? "#ef4444" : "#2a0f0f",
                    boxShadow: lit >= i && animated ? "0 0 22px 4px rgba(239,68,68,.7), inset 0 -4px 8px rgba(0,0,0,.4)" : "inset 0 -4px 8px rgba(0,0,0,.6)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-5 text-center font-mono text-sm" aria-live="polite">
          {phase === "idle" && <span className="text-white/70">Tap / Space to arm the lights</span>}
          {(phase === "arming" || phase === "waiting") && <span className="text-red-300">Wait for lights out…</span>}
          {phase === "go" && <span className="text-emerald-300">GO!</span>}
          {phase === "jump" && <span className="text-amber-300">Jump start! ⚠ Tap to try again</span>}
          {phase === "result" && ms !== null && (
            <span className="text-white">
              <b className="text-3xl font-black tabular-nums">{ms}</b> ms · {rate(ms)}
            </span>
          )}
        </p>
      </button>
      <div className="flex items-center gap-4 text-xs text-white/50">
        <span>Best: {best ? <b className="text-white">{best} ms</b> : "—"}</span>
        {phase === "result" && (
          <button type="button" onClick={share} className="rounded-full border border-white/15 px-3 py-1.5 text-white/80 hover:text-white">
            Share result
          </button>
        )}
      </div>
    </div>
  );
}

export default ReactionLights;
