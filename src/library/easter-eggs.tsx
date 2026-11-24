"use client";

import * as React from "react";

/**
 * easter-eggs — a secret-code kit for your website. Register key
 * sequences (Konami code, a word, anything) and map them to effects. Ships
 * with ready-made effects: barrel roll, upside-down, disco, confetti
 * party, Matrix rain, and earthquake — each auto-reverts.
 *
 * Framework-agnostic core (`easterEggs()` + `effects`) + React wrapper.
 * Zero dependencies · effects respect prefers-reduced-motion.
 */

export type EggEffect = (target: HTMLElement) => void;
export type EasterEggsOptions = {
  /** sequence → effect, e.g. { "konami": effects.barrelRoll, "party": effects.confetti } */
  eggs?: Record<string, EggEffect>;
  /** Element the effects apply to (default document.body). */
  target?: HTMLElement;
  onEgg?: (code: string) => void;
};

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const calm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateOnce(el: HTMLElement, frames: Keyframe[], opts: KeyframeAnimationOptions) {
  if (calm()) return;
  el.animate(frames, opts);
}

/** Built-in effects. Each one cleans up after itself. */
export const effects: Record<string, EggEffect> = {
  barrelRoll: (el) => animateOnce(el, [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 1200, easing: "cubic-bezier(.6,0,.3,1)" }),
  upsideDown: (el) => animateOnce(el, [{ transform: "rotate(0)" }, { transform: "rotate(180deg)", offset: 0.15 }, { transform: "rotate(180deg)", offset: 0.85 }, { transform: "rotate(0)" }], { duration: 4000, easing: "ease-in-out" }),
  disco: (el) => animateOnce(el, [{ filter: "hue-rotate(0)" }, { filter: "hue-rotate(360deg) saturate(2)" }], { duration: 600, iterations: 6 }),
  earthquake: (el) =>
    animateOnce(
      el,
      Array.from({ length: 12 }, (_, i) => ({ transform: `translate(${(i % 2 ? 1 : -1) * (12 - i)}px, ${(i % 3) - 1}px)` })),
      { duration: 900 },
    ),
  confetti: (el) => {
    if (calm()) return;
    const box = document.createElement("div");
    Object.assign(box.style, { position: el === document.body ? "fixed" : "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: "99999" });
    el.appendChild(box);
    const colors = ["#f472b6", "#facc15", "#4ade80", "#38bdf8", "#a78bfa"];
    for (let i = 0; i < 120; i++) {
      const p = document.createElement("span");
      const x = Math.random() * 100;
      Object.assign(p.style, { position: "absolute", left: `${x}%`, top: "-12px", width: "8px", height: "12px", background: colors[i % 5], borderRadius: "2px" });
      box.appendChild(p);
      p.animate(
        [{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(${(Math.random() - 0.5) * 300}px, ${(box.clientHeight || 800) + 40}px) rotate(${Math.random() * 900}deg)` }],
        { duration: 1800 + Math.random() * 1600, delay: Math.random() * 500, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" },
      );
    }
    window.setTimeout(() => box.remove(), 4200);
  },
  matrix: (el) => {
    if (calm()) return;
    const c = document.createElement("canvas");
    Object.assign(c.style, { position: el === document.body ? "fixed" : "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "99999", opacity: "0.9" });
    el.appendChild(c);
    const W = (c.width = c.clientWidth);
    const H = (c.height = c.clientHeight);
    const g = c.getContext("2d")!;
    const cols = Math.floor(W / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = "アカサタナハマヤラワ0123456789PICKUI";
    let raf = 0;
    const loop = () => {
      g.fillStyle = "rgba(0,0,0,.08)";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#4ade80";
      g.font = "14px monospace";
      drops.forEach((y, i) => {
        g.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
        drops[i] = y * 14 > H && Math.random() > 0.97 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.setTimeout(() => {
      cancelAnimationFrame(raf);
      c.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 600 }).onfinish = () => c.remove();
    }, 4500);
  },
};

export function easterEggs(options: EasterEggsOptions = {}) {
  if (typeof window === "undefined") return { destroy() {}, trigger: (() => {}) as (code: string) => void };
  const target = options.target ?? document.body;
  const eggs = options.eggs ?? { konami: effects.barrelRoll, party: effects.confetti, matrix: effects.matrix, disco: effects.disco };
  const seqs = Object.keys(eggs).map((code) => ({ code, keys: code === "konami" ? KONAMI : [...code.toLowerCase()] }));
  const max = Math.max(...seqs.map((s) => s.keys.length));
  let buf: string[] = [];
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.isContentEditable || /input|textarea|select/i.test(t.tagName)) return;
    buf = [...buf, e.key.toLowerCase()].slice(-max);
    for (const s of seqs) {
      if (buf.slice(-s.keys.length).join(",") === s.keys.join(",")) {
        eggs[s.code](target);
        options.onEgg?.(s.code);
        buf = [];
      }
    }
  };
  window.addEventListener("keydown", onKey);
  return {
    trigger: (code: string) => eggs[code]?.(target),
    destroy: () => window.removeEventListener("keydown", onKey),
  };
}

export type EasterEggsProps = { animated?: boolean; className?: string; children?: React.ReactNode };

/** React demo surface: listens for codes and runs effects inside this box. */
export function EasterEggs({ animated = true, className = "", children }: EasterEggsProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [last, setLast] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!animated || !ref.current) return;
    const inst = easterEggs({
      target: ref.current,
      eggs: { konami: effects.barrelRoll, party: effects.confetti, matrix: effects.matrix, disco: effects.disco, shake: effects.earthquake, flip: effects.upsideDown },
      onEgg: setLast,
    });
    return () => inst.destroy();
  }, [animated]);
  const fx: [string, string][] = [
    ["konami", "↑↑↓↓←→←→ B A"],
    ["party", "type: party"],
    ["matrix", "type: matrix"],
    ["disco", "type: disco"],
    ["shake", "type: shake"],
    ["flip", "type: flip"],
  ];
  return (
    <div ref={ref} className={`relative grid h-full min-h-[380px] w-full place-items-center overflow-hidden bg-[#0b0b0d] p-6 text-center ${className}`}>
      {children ?? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">Secret codes</p>
          <h3 className="mt-2 text-3xl font-black text-white">Type a code. Anywhere.</h3>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
            {fx.map(([code, hint]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  const map: Record<string, EggEffect> = { konami: effects.barrelRoll, party: effects.confetti, matrix: effects.matrix, disco: effects.disco, shake: effects.earthquake, flip: effects.upsideDown };
                  if (ref.current) map[code](ref.current);
                  setLast(code);
                }}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${last === code ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}
              >
                <span className="block text-sm font-bold text-white">{code}</span>
                <span className="block font-mono text-[10px] text-white/45">{hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40" aria-live="polite">
            {last ? `🥚 ${last} unlocked` : "click to preview, or type the code"}
          </p>
        </div>
      )}
    </div>
  );
}

export default EasterEggs;
