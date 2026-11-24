"use client";

import * as React from "react";

/**
 * shy-button — make any element run away from the mouse. Perfect for
 * "Unsubscribe", "No thanks" or "Decline cookies" jokes. Three moods:
 * `dodge` (slides away), `teleport` (vanishes and reappears) and `shrink`
 * (gets smaller each time). After `patience` attempts it gives up and stays
 * put with a sigh — and it NEVER moves for keyboard users (focus = calm).
 *
 * Framework-agnostic core (`shy()`) + React wrapper (`<ShyButton />`).
 * Zero dependencies · respects prefers-reduced-motion.
 */

export type ShyMode = "dodge" | "teleport" | "shrink";

export type ShyOptions = {
  mode?: ShyMode;
  /** Distance (px) that triggers it (default 90). */
  distance?: number;
  /** Attempts before it gives up (default 6). */
  patience?: number;
  /** Label swapped in when it gives up. */
  giveUpText?: string;
  /** Boundary it stays inside (default: offsetParent or viewport). */
  bounds?: HTMLElement;
  onGiveUp?: () => void;
};

export function shy(target: HTMLElement | string, options: ShyOptions = {}) {
  const { mode = "dodge", distance = 90, patience = 6, giveUpText = "ok fine 😮‍💨", onGiveUp } = options;
  if (typeof window === "undefined") return { destroy() {} };
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return { destroy() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const boundsEl = options.bounds ?? (el.offsetParent as HTMLElement | null) ?? document.body;
  let tries = 0;
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let gaveUp = false;
  let cool = 0;
  const original = { transform: el.style.transform, transition: el.style.transition, text: el.textContent };
  el.style.transition = reduced ? "none" : mode === "teleport" ? "opacity .15s" : "transform .35s cubic-bezier(.3,1.6,.5,1)";

  const apply = () => (el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`);
  const flee = (mx: number, my: number) => {
    const r = el.getBoundingClientRect();
    const b = boundsEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    tries++;
    if (tries > patience) {
      gaveUp = true;
      tx = ty = 0;
      scale = 1;
      apply();
      el.textContent = giveUpText;
      onGiveUp?.();
      return;
    }
    if (mode === "shrink") {
      scale = Math.max(0.35, scale * 0.8);
      apply();
      return;
    }
    let nx: number;
    let ny: number;
    if (mode === "teleport") {
      nx = b.left + r.width / 2 + Math.random() * (b.width - r.width);
      ny = b.top + r.height / 2 + Math.random() * (b.height - r.height);
      el.style.opacity = "0";
      window.setTimeout(() => (el.style.opacity = "1"), 160);
    } else {
      const dx = cx - mx || 1;
      const dy = cy - my || 1;
      const d = Math.hypot(dx, dy);
      nx = cx + (dx / d) * (distance + 40);
      ny = cy + (dy / d) * (distance + 40);
      // bounce off the bounds back toward the middle
      if (nx < b.left + r.width / 2 || nx > b.right - r.width / 2) nx = b.left + b.width / 2 + (Math.random() - 0.5) * b.width * 0.5;
      if (ny < b.top + r.height / 2 || ny > b.bottom - r.height / 2) ny = b.top + b.height / 2 + (Math.random() - 0.5) * b.height * 0.5;
    }
    tx += nx - cx;
    ty += ny - cy;
    apply();
  };

  const onMove = (e: PointerEvent) => {
    if (gaveUp || e.pointerType !== "mouse" || document.activeElement === el) return;
    const now = performance.now();
    if (now < cool) return;
    const r = el.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (d < distance) {
      cool = now + 250;
      flee(e.clientX, e.clientY);
    }
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return {
    reset() {
      tries = 0;
      gaveUp = false;
      tx = ty = 0;
      scale = 1;
      apply();
      el.textContent = original.text;
    },
    destroy() {
      window.removeEventListener("pointermove", onMove);
      el.style.transform = original.transform;
      el.style.transition = original.transition;
    },
  };
}

export type ShyButtonProps = Omit<ShyOptions, "bounds"> & React.ButtonHTMLAttributes<HTMLButtonElement> & { animated?: boolean };

/** React wrapper: a button that runs away inside its positioned parent. */
export function ShyButton({ mode = "dodge", distance, patience, giveUpText, onGiveUp, animated = true, children = "Unsubscribe", className = "", ...rest }: ShyButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!animated || !ref.current) return;
    const inst = shy(ref.current, { mode, distance, patience, giveUpText, onGiveUp, bounds: ref.current.parentElement ?? undefined });
    return () => inst.destroy();
  }, [animated, mode, distance, patience, giveUpText, onGiveUp]);
  return (
    <button ref={ref} type="button" {...rest} className={`rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-white/80 ${className}`}>
      {children}
    </button>
  );
}

export default ShyButton;
