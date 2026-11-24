"use client";

import * as React from "react";

/**
 * Keycaps — sculpted mechanical keycaps that press with real travel, a
 * shrinking side wall and an optional synthesized "thock". They mirror the
 * user's physical keyboard: press K on your keyboard and the K cap goes down.
 * Use for shortcut hints, onboarding, or as chunky buttons.
 * Zero dependencies · React + Tailwind · Web Audio sound is opt-in.
 */

export type Keycap = {
  /** Legend printed on the cap. */
  label: React.ReactNode;
  /** `KeyboardEvent.key` values that press this cap (case-insensitive), e.g. ["k"] or ["Meta","Control"]. */
  match?: string[];
  /** Width in key units (1 = square). */
  width?: number;
  variant?: "light" | "dark" | "accent";
  /** Accessible name if the label is an icon. */
  ariaLabel?: string;
};

export type KeycapsProps = {
  keys: Keycap[];
  /** Mirror the physical keyboard (default true). */
  listen?: boolean;
  /** Play a synthesized switch sound (default false). */
  sound?: boolean;
  accent?: string;
  /** Called with the cap index when it is pressed (click or keyboard). */
  onPress?: (index: number) => void;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const PALETTE = {
  light: { top: "#f4f2ee", side: "#c9c5bd", text: "#2b2b2b" },
  dark: { top: "#2e2f33", side: "#16171a", text: "#e8e8e8" },
  accent: { top: "var(--gx-kc-accent)", side: "color-mix(in oklab, var(--gx-kc-accent) 60%, black)", text: "#111" },
} as const;

let audio: AudioContext | null = null;
function thock() {
  try {
    audio ??= new AudioContext();
    const ctx = audio;
    const len = Math.floor(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 900 + Math.random() * 300;
    f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.value = 0.55;
    src.connect(f).connect(g).connect(ctx.destination);
    src.start();
  } catch {
    /* audio unavailable — stay silent */
  }
}

export function Keycaps({ keys, listen = true, sound = false, accent = "#4ade80", onPress, animated = true, className = "" }: KeycapsProps) {
  const [down, setDown] = React.useState<Set<number>>(() => new Set());

  const press = React.useCallback(
    (i: number, isDown: boolean) => {
      setDown((prev) => {
        if (prev.has(i) === isDown) return prev;
        const next = new Set(prev);
        if (isDown) next.add(i);
        else next.delete(i);
        return next;
      });
      if (isDown) {
        if (sound) thock();
        onPress?.(i);
      }
    },
    [sound, onPress],
  );

  React.useEffect(() => {
    if (!listen) return;
    const find = (e: KeyboardEvent) =>
      keys.flatMap((k, i) => (k.match?.some((m) => m.toLowerCase() === e.key.toLowerCase()) ? [i] : []));
    const kd = (e: KeyboardEvent) => {
      if (e.repeat) return;
      find(e).forEach((i) => press(i, true));
    };
    const ku = (e: KeyboardEvent) => find(e).forEach((i) => press(i, false));
    const blur = () => setDown(new Set());
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
    };
  }, [keys, listen, press]);

  return (
    <div
      className={`inline-flex flex-wrap items-end gap-2 rounded-2xl bg-gradient-to-b from-[#1b1c1f] to-[#0e0f11] p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,.8),0_1px_0_rgba(255,255,255,.06)] ${className}`}
      style={{ "--gx-kc-accent": accent } as React.CSSProperties}
    >
      {keys.map((k, i) => {
        const p = PALETTE[k.variant ?? "light"];
        const isDown = down.has(i);
        const w = (k.width ?? 1) * 56 + ((k.width ?? 1) - 1) * 8;
        return (
          <button
            key={i}
            type="button"
            aria-label={k.ariaLabel}
            aria-pressed={isDown}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              press(i, true);
            }}
            onPointerUp={() => press(i, false)}
            onPointerCancel={() => press(i, false)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !e.repeat) press(i, true);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.key === " ") press(i, false);
            }}
            className="group relative h-[60px] shrink-0 touch-none rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f11]"
            style={{ width: w }}
          >
            {/* side wall (skirt) */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-[10px] transition-[box-shadow] duration-75"
              style={{
                background: p.side,
                boxShadow: isDown ? "0 1px 1px rgba(0,0,0,.6)" : "0 6px 10px -2px rgba(0,0,0,.7)",
              }}
            />
            {/* sculpted top */}
            <span
              className="absolute inset-x-[4px] top-[2px] flex h-[48px] items-start justify-start rounded-[8px] px-2 py-1.5 text-left text-[13px] font-semibold transition-transform duration-75 ease-out"
              style={{
                background: `linear-gradient(180deg, color-mix(in oklab, ${p.top} 92%, white), ${p.top})`,
                color: p.text,
                transform: isDown ? `translateY(${animated ? 6 : 3}px)` : "translateY(0)",
                transition: animated ? undefined : "none",
                boxShadow: "inset 0 -3px 6px rgba(0,0,0,.12), inset 0 2px 1px rgba(255,255,255,.35)",
              }}
            >
              {k.label}
              {k.variant === "accent" && (
                <span
                  className="absolute bottom-1.5 right-2 h-1 w-1 rounded-full transition-all"
                  style={{ background: isDown ? "#fff" : "rgba(0,0,0,.35)", boxShadow: isDown ? "0 0 6px #fff" : "none" }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Keycaps;
