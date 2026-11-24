"use client";

import * as React from "react";

/**
 * GearShifter — a 6-speed manual H-pattern. Drag the knob through the gate:
 * it's constrained to the real slots (you must pass through neutral), snaps
 * into gear with a notch, and the leather boot stretches toward the knob.
 * Keys 1–6, R and N shift directly. A fun stepper for multi-step forms.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Gear = "R" | "N" | "1" | "2" | "3" | "4" | "5" | "6";

export type GearShifterProps = {
  value?: Gear;
  defaultValue?: Gear;
  onChange?: (g: Gear) => void;
  /** false = knob jumps between gears (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

// gate: 4 columns (R, 1/2, 3/4, 5/6) × top/neutral/bottom
const COLS = [-1.5, -0.5, 0.5, 1.5];
const POS: Record<Gear, [number, number]> = {
  R: [0, -1], "1": [1, -1], "2": [1, 1], "3": [2, -1], "4": [2, 1], "5": [3, -1], "6": [3, 1], N: [1.5, 0],
};
const W = 60; // px per column
const H = 62; // px from neutral to a gear

export function GearShifter({ value, defaultValue = "N", onChange, animated = true, className = "" }: GearShifterProps) {
  const [inner, setInner] = React.useState<Gear>(defaultValue);
  const gear = value ?? inner;
  const [knob, setKnob] = React.useState<[number, number]>(() => {
    const [c, r] = POS[defaultValue];
    return [c === 1.5 ? 0 : COLS[c] * W, r * H];
  });
  const [drag, setDrag] = React.useState(false);
  const start = React.useRef({ x: 0, y: 0, kx: 0, ky: 0 });

  const set = React.useCallback(
    (g: Gear) => {
      const [c, r] = POS[g];
      setKnob([g === "N" ? 0 : COLS[c] * W, r * H]);
      if (value === undefined) setInner(g);
      onChange?.(g);
    },
    [value, onChange],
  );

  // constrain to the H: free horizontal movement only in neutral row
  const constrain = (x: number, y: number): [number, number] => {
    const col = COLS.reduce((best, c) => (Math.abs(c * W - x) < Math.abs(best * W - x) ? c : best), COLS[0]);
    if (Math.abs(y) < 10) return [Math.max(COLS[0] * W, Math.min(COLS[3] * W, x)), 0];
    const cx = col * W;
    const yy = Math.max(-H, Math.min(H, y));
    if (col === COLS[0] && yy > 0) return [cx, 0]; // reverse has no bottom slot
    return [cx, yy];
  };

  const snap = ([x, y]: [number, number]) => {
    const ci = COLS.findIndex((c) => Math.abs(c * W - x) < 1);
    if (Math.abs(y) > H * 0.6 && ci >= 0) {
      const g = (Object.keys(POS) as Gear[]).find((k) => POS[k][0] === ci && POS[k][1] === Math.sign(y));
      if (g) return set(g);
    }
    set("N");
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(document.activeElement as HTMLElement)?.closest?.("[data-gx-gear]")) return;
      const k = e.key.toUpperCase();
      if (k in POS) set(k as Gear);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [set]);

  const lean = { x: knob[0] / 6, y: knob[1] / 6 };

  return (
    <div data-gx-gear className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative grid h-[220px] w-[300px] place-items-center rounded-[36px] bg-gradient-to-b from-[#1d1d21] to-[#0d0d0f] shadow-[inset_0_2px_0_rgba(255,255,255,.06),0_20px_40px_-12px_rgba(0,0,0,.8)]">
        {/* gate */}
        <svg aria-hidden viewBox="-130 -80 260 160" className="absolute h-[160px] w-[260px]">
          <path d={`M${COLS[0] * W} 0 H${COLS[3] * W}`} stroke="#2e2e34" strokeWidth="14" strokeLinecap="round" />
          {COLS.map((c, i) => (
            <path key={c} d={`M${c * W} ${-H} V${i === 0 ? 0 : H}`} stroke="#2e2e34" strokeWidth="14" strokeLinecap="round" />
          ))}
          {(Object.keys(POS) as Gear[])
            .filter((g) => g !== "N")
            .map((g) => {
              const [c, r] = POS[g];
              return (
                <text key={g} x={COLS[c] * W} y={r * (H + 14) + 4} fill={g === gear ? "#4ade80" : "#71717a"} fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="ui-monospace,monospace">
                  {g}
                </text>
              );
            })}
        </svg>
        {/* boot */}
        <div
          aria-hidden
          className="absolute h-24 w-24 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 45%, #2a2420 0 30%, #17130f 70%)",
            transform: `translate(${lean.x}px, ${lean.y}px) scale(${1 + Math.hypot(knob[0], knob[1]) / 600})`,
            boxShadow: "inset 0 0 20px rgba(0,0,0,.9)",
            transition: drag ? "none" : "transform .3s",
          }}
        />
        {/* knob */}
        <button
          type="button"
          aria-label={`Gear shifter, current gear ${gear}. Press 1–6, R or N.`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = { x: e.clientX, y: e.clientY, kx: knob[0], ky: knob[1] };
            setDrag(true);
          }}
          onPointerMove={(e) => {
            if (!drag) return;
            setKnob(constrain(start.current.kx + e.clientX - start.current.x, start.current.ky + e.clientY - start.current.y));
          }}
          onPointerUp={() => {
            setDrag(false);
            snap(knob);
          }}
          className="absolute grid h-14 w-14 cursor-grab touch-none place-items-center rounded-full font-mono text-sm font-black text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:cursor-grabbing"
          style={{
            transform: `translate(${knob[0]}px, ${knob[1]}px)`,
            transition: drag ? "none" : animated ? "transform .28s cubic-bezier(.3,1.6,.5,1)" : "none",
            background: "radial-gradient(circle at 35% 30%, #5a5a62, #1a1a1d 70%)",
            boxShadow: "0 10px 16px rgba(0,0,0,.7), inset 0 2px 1px rgba(255,255,255,.25)",
          }}
        >
          {gear}
        </button>
      </div>
      <p className="font-mono text-xs text-white/50" aria-live="polite">
        {gear === "N" ? "Neutral" : gear === "R" ? "Reverse" : `Gear ${gear}`}
      </p>
    </div>
  );
}

export default GearShifter;
