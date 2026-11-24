"use client";

import * as React from "react";

/**
 * WaxSealLetter — an 18th-century letter sealed with red wax. Press the seal
 * to crack it (it splits in two and falls), the flap swings open in 3D, and
 * the letter slides out and unfolds. Invitations, announcements, "you're
 * hired" moments.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type WaxSealLetterProps = {
  /** Monogram on the seal. */
  initial?: string;
  to?: string;
  title?: string;
  body?: string;
  signature?: string;
  sealColor?: string;
  /** false = opens with a simple fade (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
.gx-ws *{transition-timing-function:cubic-bezier(.3,1.2,.4,1)}
@media (prefers-reduced-motion:reduce){.gx-ws *{transition:none!important;animation:none!important}}
`;

const PAPER =
  "radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,.5), transparent 60%), radial-gradient(circle at 85% 90%, rgba(130,90,40,.22), transparent 50%), #efe2c4";

export function WaxSealLetter({
  initial = "G",
  to = "To the curious reader",
  title = "You are cordially invited",
  body = "to the unveiling of a most peculiar collection of interface curiosities, on the eve of the new moon.",
  signature = "— H. Guetioui",
  sealColor = "#9b1c1c",
  animated = true,
  className = "",
}: WaxSealLetterProps) {
  const [stage, setStage] = React.useState(0); // 0 sealed · 1 cracked · 2 flap open · 3 letter out

  const open = () => {
    if (stage) return;
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStage(3);
    setStage(1);
    window.setTimeout(() => setStage(2), 450);
    window.setTimeout(() => setStage(3), 1100);
  };

  return (
    <div className={`gx-ws relative h-[340px] w-full max-w-[420px] [perspective:1200px] ${className}`}>
      <style>{css}</style>
      {/* letter */}
      <div
        className="absolute left-[6%] right-[6%] rounded-sm p-6 text-[#3b2a17] shadow-[0_10px_30px_rgba(0,0,0,.4)] transition-all duration-700"
        style={{
          background: PAPER,
          bottom: stage >= 3 ? "38%" : "8%",
          height: stage >= 3 ? 250 : 150,
          zIndex: stage >= 3 ? 30 : 5,
          opacity: stage >= 3 || animated ? 1 : 0,
        }}
        aria-hidden={stage < 3}
      >
        <p className="font-serif text-xs italic opacity-70">{to}</p>
        <h3 className="mt-2 font-serif text-xl font-bold italic">{title}</h3>
        <p className="mt-2 font-serif text-sm leading-relaxed">{body}</p>
        <p className="mt-3 text-right font-serif text-sm italic">{signature}</p>
      </div>

      {/* envelope back */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[200px] rounded-md" style={{ background: "#d9c49a", boxShadow: "0 20px 40px -10px rgba(0,0,0,.7)" }} />
      {/* envelope front pocket */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 h-[200px] rounded-md"
        style={{ background: PAPER, clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 30px rgba(110,70,25,.25)" }}
      />
      {/* flap */}
      <div
        className="absolute inset-x-0 z-20 h-[120px] origin-top transition-transform duration-700"
        style={{
          bottom: 80,
          background: "#e6d4ad",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          transform: stage >= 2 ? "rotateX(180deg)" : "rotateX(0)",
          zIndex: stage >= 2 ? 1 : 25,
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,.2))",
        }}
      />

      {/* wax seal: two halves that split */}
      {stage < 3 && (
        <button
          type="button"
          onClick={open}
          aria-label="Break the seal and open the letter"
          className="absolute left-1/2 z-40 h-16 w-16 -translate-x-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          style={{ bottom: 92 }}
        >
          {[0, 1].map((h) => (
            <span
              key={h}
              className="absolute inset-0 grid place-items-center rounded-full font-serif text-2xl font-bold transition-all duration-500"
              style={{
                background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${sealColor} 70%, #fff), ${sealColor} 45%, color-mix(in srgb, ${sealColor} 60%, #000))`,
                color: "rgba(255,220,200,.75)",
                textShadow: "0 -1px 0 rgba(0,0,0,.4)",
                boxShadow: "0 4px 8px rgba(0,0,0,.45), inset 0 0 0 4px rgba(0,0,0,.12)",
                clipPath: h ? "polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 56% 60%, 44% 35%)" : "polygon(0 0, 52% 0, 44% 35%, 56% 60%, 46% 100%, 0 100%)",
                transform: stage >= 1 ? `translate(${h ? 30 : -30}px, 120px) rotate(${h ? 40 : -50}deg)` : "none",
                opacity: stage >= 1 ? 0 : 1,
              }}
            >
              {initial}
            </span>
          ))}
        </button>
      )}
      {stage >= 3 && (
        <button
          type="button"
          onClick={() => setStage(0)}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
        >
          Seal again
        </button>
      )}
    </div>
  );
}

export default WaxSealLetter;
