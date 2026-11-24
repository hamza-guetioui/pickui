"use client";

import * as React from "react";

/**
 * TypingRacer — race a ghost car by typing. Your car moves with every
 * correct character; a rival drives at a steady WPM. Mistakes flash red
 * and cost a little speed. Live WPM, accuracy, and a finish-line photo
 * moment. Great for dev-tool sites, schools and keyboard brands.
 * Game · zero dependencies.
 */

export type TypingRacerProps = {
  /** Text to type (default: a random dev-themed sentence). */
  text?: string;
  /** Rival speed in WPM (default 45). */
  rivalWpm?: number;
  /** false = no exhaust / wheel spin (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const TEXTS = [
  "ship small changes often and your bugs stay small too",
  "good defaults are a kindness to every future developer",
  "the fastest code is the code you never had to write",
  "make it work then make it right then make it fast",
];

function Car({ color, p, label, animated }: { color: string; p: number; label: string; animated: boolean }) {
  return (
    <div className="relative h-14 border-b border-dashed border-white/10">
      <div className="absolute bottom-1 transition-[left] duration-200 ease-out" style={{ left: `calc(${p * 100}% * 0.88)` }}>
        <svg viewBox="0 0 80 32" className="h-9 w-[72px]" aria-hidden>
          <path d="M6 22 L14 12 Q18 8 26 8 L48 8 Q56 8 62 14 L72 20 Q76 22 76 26 L76 28 L4 28 L4 25 Q4 22 6 22Z" fill={color} />
          <path d="M22 12 L28 10 L46 10 L52 14 L22 14Z" fill="rgba(255,255,255,.55)" />
          {[18, 60].map((x) => (
            <g key={x} className={animated && p > 0 && p < 1 ? "origin-center animate-spin" : ""} style={{ transformBox: "fill-box" }}>
              <circle cx={x} cy={28} r="5.5" fill="#111" />
              <circle cx={x} cy={28} r="2" fill="#888" />
            </g>
          ))}
        </svg>
        <span className="absolute -top-3 left-1 font-mono text-[9px] uppercase tracking-widest text-white/50">{label}</span>
      </div>
    </div>
  );
}

export function TypingRacer({ text, rivalWpm = 45, animated = true, className = "" }: TypingRacerProps) {
  const [target, setTarget] = React.useState(text ?? TEXTS[0]);
  const [typed, setTyped] = React.useState("");
  const [errors, setErrors] = React.useState(0);
  const [start, setStart] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [shake, setShake] = React.useState(0);
  const input = React.useRef<HTMLInputElement>(null);

  const done = typed.length >= target.length;
  React.useEffect(() => {
    if (!start || done) return;
    const t = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(t);
  }, [start, done]);

  const elapsed = start ? ((done ? now : now || performance.now()) - start) / 1000 : 0;
  const wpm = elapsed > 0.5 ? Math.round(typed.length / 5 / (elapsed / 60)) : 0;
  const rivalP = start ? Math.min(1, ((rivalWpm * 5) / 60) * elapsed / target.length) : 0;
  const myP = typed.length / target.length;
  const acc = typed.length ? Math.round((typed.length / (typed.length + errors)) * 100) : 100;
  const won = done && myP >= rivalP;

  const reset = (next = false) => {
    setTarget(next ? TEXTS[(TEXTS.indexOf(target) + 1) % TEXTS.length] : target);
    setTyped("");
    setErrors(0);
    setStart(null);
    setNow(0);
    input.current?.focus();
  };

  return (
    <div className={`w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0d10] p-5 ${className}`} onClick={() => input.current?.focus()}>
      <div className="rounded-2xl bg-[#1a1a1e] px-3 pt-4">
        <Car color="#4ade80" p={myP} label="you" animated={animated} />
        <Car color="#f472b6" p={rivalP} label={`rival · ${rivalWpm} wpm`} animated={animated} />
        <div className="relative h-3">
          <div className="absolute bottom-0 right-[6%] top-[-112px] w-2 bg-[repeating-linear-gradient(0deg,#fff_0_6px,#111_6px_12px)] opacity-80" />
        </div>
      </div>

      <p key={shake} className={`mt-5 select-none font-mono text-lg leading-relaxed ${shake ? "animate-[gx-tr-shake_.2s]" : ""}`} aria-hidden>
        {[...target].map((ch, i) => (
          <span
            key={i}
            className={i < typed.length ? "text-emerald-300" : i === typed.length ? "rounded bg-white/15 text-white" : "text-white/35"}
          >
            {ch}
          </span>
        ))}
      </p>
      <style>{`@keyframes gx-tr-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
      <input
        ref={input}
        value={typed}
        disabled={done}
        onChange={(e) => {
          const v = e.target.value;
          if (!start) setStart(performance.now());
          if (v.length < typed.length) return; // no backspace cheating
          const ch = v[v.length - 1];
          if (ch === target[typed.length]) {
            setTyped(target.slice(0, typed.length + 1));
            if (typed.length + 1 === target.length) setNow(performance.now());
          } else {
            setErrors((x) => x + 1);
            setShake((s) => s + 1);
          }
        }}
        aria-label={`Type this sentence: ${target}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="sr-only"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-4 font-mono text-white/70" aria-live="polite">
          <span>
            <b className="text-white">{wpm}</b> wpm
          </span>
          <span>
            <b className="text-white">{acc}</b>% acc
          </span>
          <span>{elapsed.toFixed(1)}s</span>
        </div>
        {done ? (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${won ? "text-emerald-300" : "text-rose-300"}`}>{won ? "🏁 You win!" : "Rival wins — rematch?"}</span>
            <button type="button" onClick={() => reset(true)} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black">
              Next race
            </button>
          </div>
        ) : (
          <span className="font-mono text-xs text-white/40">{start ? "keep typing…" : "click here and start typing to race"}</span>
        )}
      </div>
    </div>
  );
}

export default TypingRacer;
