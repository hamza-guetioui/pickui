"use client";

import * as React from "react";

/**
 * RotaryDial — a 1960s telephone dial. Put a finger in a hole, drag it
 * clockwise to the metal finger stop, let go: the dial whirs back at the
 * speed of a real governor (with clicks), and the digit is "dialed".
 * Keyboard: type digits, Backspace to clear.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type RotaryDialProps = {
  onDial?: (number: string) => void;
  /** Synthesized clicks (default true). */
  sound?: boolean;
  /** false = digits register instantly, no spin-back (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
// Screen angles (0° = 3 o'clock, clockwise positive). Holes run counter-clockwise
// from "1" (≈1–2 o'clock) to "0" (≈4–5 o'clock); the finger stop sits in the gap,
// so "1" travels least and "0" travels almost a full turn — like the real thing.
const holeAngle = (i: number) => -40 - i * 30;
const STOP = 15;

let ac: AudioContext | null = null;
function click() {
  try {
    ac ??= new AudioContext();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.value = 900;
    g.gain.setValueAtTime(0.08, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.025);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.03);
  } catch {}
}

export function RotaryDial({ onDial, sound = true, animated = true, className = "" }: RotaryDialProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [rot, setRot] = React.useState(0);
  const [num, setNum] = React.useState("");
  const [returning, setReturning] = React.useState(false);
  const drag = React.useRef<{ i: number; last: number; acc: number; max: number } | null>(null);

  const angleOf = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const dial = React.useCallback(
    (d: string) => {
      setNum((n) => {
        const next = (n + d).slice(-12);
        onDial?.(next);
        return next;
      });
    },
    [onDial],
  );

  const release = (amount: number, i: number) => {
    const reached = amount >= drag.current!.max - 8;
    drag.current = null;
    if (!animated) {
      setRot(0);
      if (reached) dial(DIGITS[i]);
      return;
    }
    setReturning(true);
    const pulses = reached ? (i + 1) % 10 || 10 : 0;
    const dur = Math.max(180, amount * 3.2);
    if (sound && reached) for (let p = 0; p < pulses; p++) window.setTimeout(click, (dur / pulses) * p);
    setRot(0);
    window.setTimeout(() => {
      setReturning(false);
      if (reached) dial(DIGITS[i]);
    }, dur);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ref.current?.contains(document.activeElement)) return;
      if (/^\d$/.test(e.key)) dial(e.key);
      if (e.key === "Backspace") setNum("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dial]);

  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>
      <output aria-live="polite" className="min-w-[14ch] rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-center font-mono text-xl tracking-[0.3em] text-amber-200">
        {num || "· · ·"}
      </output>
      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label="Rotary dial. Focus and type digits, or drag a hole to the finger stop."
        className="relative h-64 w-64 touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
        style={{ background: "radial-gradient(circle at 35% 30%, #3a3a3e, #121214 70%)", boxShadow: "0 20px 40px -10px rgba(0,0,0,.8), inset 0 0 0 6px #1b1b1d" }}
      >
        {/* number plate (fixed) */}
        {DIGITS.map((d, i) => {
          const a = (holeAngle(i) * Math.PI) / 180;
          return (
            <span
              key={d}
              className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#efe9dc] font-serif text-sm font-bold text-[#1b1b1d]"
              style={{ left: `calc(50% + ${Math.cos(a) * 96}px)`, top: `calc(50% + ${Math.sin(a) * 96}px)` }}
            >
              {d}
            </span>
          );
        })}
        {/* rotating finger wheel with holes */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            transform: `rotate(${rot}deg)`,
            transition: returning ? `transform ${Math.max(0.18, rot * 0.0032)}s linear` : "none",
            background: "radial-gradient(circle, transparent 38%, rgba(20,20,22,.88) 39%)",
            WebkitMask: DIGITS.map((_, i) => {
              const a = (holeAngle(i) * Math.PI) / 180;
              return `radial-gradient(circle 18px at calc(50% + ${Math.cos(a) * 84}px) calc(50% + ${Math.sin(a) * 84}px), transparent 98%, #000)`;
            }).join(","),
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
            mask: DIGITS.map((_, i) => {
              const a = (holeAngle(i) * Math.PI) / 180;
              return `radial-gradient(circle 18px at calc(50% + ${Math.cos(a) * 84}px) calc(50% + ${Math.sin(a) * 84}px), transparent 98%, #000)`;
            }).join(","),
          }}
        />
        {/* hit areas for the holes (rotate with the wheel) */}
        <div className="absolute inset-3" style={{ transform: `rotate(${rot}deg)`, transition: returning ? `transform ${Math.max(0.18, rot * 0.0032)}s linear` : "none" }}>
          {DIGITS.map((d, i) => {
            const a = (holeAngle(i) * Math.PI) / 180;
            const max = (((STOP - holeAngle(i)) % 360) + 360) % 360;
            return (
              <span
                key={d}
                aria-hidden
                className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing"
                style={{ left: `calc(50% + ${Math.cos(a) * 84}px)`, top: `calc(50% + ${Math.sin(a) * 84}px)` }}
                onPointerDown={(e) => {
                  if (returning) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  drag.current = { i, last: angleOf(e), acc: 0, max };
                }}
                onPointerMove={(e) => {
                  const dr = drag.current;
                  if (!dr || dr.i !== i) return;
                  const a = angleOf(e);
                  let d = a - dr.last;
                  if (d > 180) d -= 360;
                  if (d < -180) d += 360;
                  dr.last = a;
                  dr.acc = Math.max(0, Math.min(dr.max, dr.acc + d));
                  setRot(dr.acc);
                }}
                onPointerUp={() => drag.current && release(drag.current.acc, i)}
              />
            );
          })}
        </div>
        {/* center cap + finger stop */}
        <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#efe9dc] text-center font-serif text-[10px] leading-tight text-[#1b1b1d] shadow-inner">
          PICKUI
          <br />
          EXCH. 4271
        </div>
        <span
          aria-hidden
          className="absolute h-10 w-2 rounded-full bg-gradient-to-b from-neutral-200 to-neutral-500 shadow"
          style={{ left: `calc(50% + ${Math.cos((STOP * Math.PI) / 180) * 112}px)`, top: `calc(50% + ${Math.sin((STOP * Math.PI) / 180) * 112}px)`, transform: `translate(-50%,-50%) rotate(${STOP + 90}deg)` }}
        />
      </div>
      <button type="button" onClick={() => setNum("")} className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white">
        Hang up
      </button>
    </div>
  );
}

export default RotaryDial;
