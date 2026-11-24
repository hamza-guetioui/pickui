"use client";

import * as React from "react";

/**
 * GhostCursor — a little ghost haunts the area: it floats after your cursor
 * with lazy, wobbly physics, its eyes track the pointer, it fades when it
 * gets close, gets SCARED on click (shoots away and turns pale), hides
 * behind content when you stop moving, and peeks out again.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type GhostCursorProps = {
  /** Content the ghost haunts. */
  children?: React.ReactNode;
  color?: string;
  /** false = the ghost just floats in place (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-gh-bob{50%{transform:translateY(-8px)}}
@keyframes gx-gh-wave{to{background-position:-24px 0}}
.gx-gh-body{animation:gx-gh-bob 2.4s ease-in-out infinite}
.gx-gh-hem{animation:gx-gh-wave .6s linear infinite}
@media (prefers-reduced-motion:reduce){.gx-gh-body,.gx-gh-hem{animation:none}}
`;

export function GhostCursor({ children, color = "#f5f3ff", animated = true, className = "" }: GhostCursorProps) {
  const area = React.useRef<HTMLDivElement>(null);
  const ghost = React.useRef<HTMLDivElement>(null);
  const eyes = React.useRef<HTMLDivElement>(null);
  const s = React.useRef({ x: 80, y: 80, vx: 0, vy: 0, tx: 80, ty: 80, idle: 0, scared: 0 });
  const [mood, setMood] = React.useState<"calm" | "scared" | "hiding">("calm");

  React.useEffect(() => {
    const still = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = area.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    s.current.x = s.current.tx = r.width * 0.7;
    s.current.y = s.current.ty = r.height * 0.4;
    let raf = 0;
    let last = performance.now();
    let currentMood = "calm";
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = s.current;
      g.idle += dt;
      g.scared = Math.max(0, g.scared - dt);
      if (!still) {
        // follow with an offset so it trails behind, never on top of, the cursor
        const k = g.scared > 0 ? -14 : 3.2;
        g.vx += ((g.tx - 40 - g.x) * k - g.vx * 2.6) * dt;
        g.vy += ((g.ty - 50 - g.y) * k - g.vy * 2.6) * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        const W = el.clientWidth;
        const H = el.clientHeight;
        g.x = Math.max(20, Math.min(W - 20, g.x));
        g.y = Math.max(30, Math.min(H - 30, g.y));
      }
      const dist = Math.hypot(g.tx - g.x, g.ty - g.y);
      const hiding = g.idle > 3.5 && g.scared === 0;
      const mood = g.scared > 0 ? "scared" : hiding ? "hiding" : "calm";
      if (mood !== currentMood) {
        currentMood = mood;
        setMood(mood);
      }
      if (ghost.current) {
        const tilt = Math.max(-25, Math.min(25, g.vx * 0.08));
        ghost.current.style.transform = `translate(${g.x}px, ${g.y}px) translate(-50%,-50%) rotate(${tilt}deg) scale(${hiding ? 0.6 : 1})`;
        ghost.current.style.opacity = String(hiding ? 0.25 : Math.min(1, 0.35 + dist / 160));
      }
      if (eyes.current) {
        const a = Math.atan2(g.ty - g.y, g.tx - g.x);
        eyes.current.style.transform = `translate(${Math.cos(a) * 3}px, ${Math.sin(a) * 3}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return (
    <div
      ref={area}
      className={`relative h-full min-h-[320px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_120%,#1f1638,#07060c_60%)] ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        s.current.tx = e.clientX - r.left;
        s.current.ty = e.clientY - r.top;
        s.current.idle = 0;
      }}
      onPointerDown={() => {
        s.current.scared = 1.1;
        s.current.idle = 0;
      }}
    >
      <style>{css}</style>
      <div className="relative z-10 grid h-full place-items-center p-6 text-center">
        {children ?? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-violet-300/70">Room 13</p>
            <h3 className="mt-2 text-3xl font-black text-white">Something follows you.</h3>
            <p className="mt-2 text-sm text-white/50">Move around. Click to scare it. Stand still and it hides.</p>
          </div>
        )}
      </div>
      <div ref={ghost} aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 transition-opacity duration-500" style={{ willChange: "transform" }}>
        <div className="gx-gh-body relative h-[62px] w-[52px]">
          <div
            className="absolute inset-0 rounded-t-full"
            style={{
              background: mood === "scared" ? "#e0f2fe" : color,
              boxShadow: `0 0 30px ${mood === "scared" ? "#7dd3fc" : "#c4b5fd"}, inset -6px -8px 14px rgba(120,100,180,.25)`,
              WebkitMask: "radial-gradient(circle 6px at 6px 100%, transparent 98%, #000) 0 0/12px 100% repeat-x",
            }}
          />
          <div ref={eyes} className="absolute left-0 right-0 top-[20px] flex justify-center gap-[10px]">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="block rounded-full bg-[#1e1b4b]"
                style={{ width: mood === "scared" ? 9 : 7, height: mood === "scared" ? 11 : mood === "hiding" ? 2 : 9, transition: "all .2s" }}
              />
            ))}
          </div>
          <span
            className="absolute left-1/2 top-[36px] block -translate-x-1/2 rounded-full bg-[#1e1b4b]"
            style={{ width: mood === "scared" ? 8 : 6, height: mood === "scared" ? 9 : 3, transition: "all .2s" }}
          />
        </div>
      </div>
      <p className="absolute bottom-3 left-0 right-0 z-10 text-center font-mono text-[10px] text-white/30" aria-live="polite">
        {mood === "scared" ? "boo! (it’s more scared than you)" : mood === "hiding" ? "…it’s hiding" : ""}
      </p>
    </div>
  );
}

export default GhostCursor;
