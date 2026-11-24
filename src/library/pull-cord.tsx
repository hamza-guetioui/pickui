"use client";

import * as React from "react";

/**
 * PullCord — a hanging lamp with a real pull cord. Drag the brass bead down
 * (or tap it, or press Enter/Space) to switch the light: the cord stretches,
 * whips on a damped spring and snaps back; the bulb flickers on like an old
 * filament and a dusty light cone falls onto whatever you put underneath.
 * Use it as a theme switch, an "easter egg" or a hero centerpiece.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type PullCordProps = {
  /** Controlled on/off. */
  on?: boolean;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
  /** Light color (default warm tungsten). */
  lightColor?: string;
  /** Content lit by the lamp. */
  children?: React.ReactNode;
  /** Accessible label of the switch. */
  label?: string;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const REST = 92; // cord length in px
const PULL_TO_TOGGLE = 52;

const css = `
@keyframes gx-pc-on{0%{opacity:0}8%{opacity:.9}12%{opacity:.1}20%{opacity:.75}24%{opacity:.25}34%{opacity:1}40%{opacity:.6}48%,100%{opacity:1}}
@keyframes gx-pc-dust{0%{transform:translate(0,0);opacity:0}20%{opacity:.9}100%{transform:translate(var(--dx),-40px);opacity:0}}
.gx-pc[data-on="true"] .gx-pc-light{animation:gx-pc-on .9s steps(1,end) both}
.gx-pc-dust{animation:gx-pc-dust var(--t) ease-in-out var(--d) infinite}
.gx-pc[data-animated="false"] *{animation:none!important}
@media (prefers-reduced-motion:reduce){.gx-pc *{animation:none!important}}
`;

const DUST = Array.from({ length: 14 }, (_, i) => ({
  left: 30 + ((i * 37) % 40),
  top: 25 + ((i * 53) % 60),
  dx: `${((i * 29) % 30) - 15}px`,
  t: `${5 + (i % 5)}s`,
  d: `${-(i * 0.7)}s`,
}));

export function PullCord({
  on,
  defaultOn = false,
  onChange,
  lightColor = "#ffd18a",
  children,
  label = "Light",
  animated = true,
  className = "",
}: PullCordProps) {
  const [inner, setInner] = React.useState(defaultOn);
  const uid = "gxpc" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const isOn = on ?? inner;
  const pathRef = React.useRef<SVGPathElement>(null);
  const beadRef = React.useRef<HTMLButtonElement>(null);
  const sim = React.useRef({ x: 0, y: 0, vx: 0, vy: 0, drag: false, raf: 0, sx: 0, sy: 0, moved: 0, reduced: false });

  const toggle = React.useCallback(() => {
    const next = !isOn;
    if (on === undefined) setInner(next);
    onChange?.(next);
  }, [isOn, on, onChange]);

  const draw = React.useCallback(() => {
    const s = sim.current;
    const hx = s.x;
    const hy = REST + s.y;
    // slight bow opposite to the motion → the cord whips
    const cx = hx / 2 - s.vx * 0.02;
    const cy = hy / 2;
    pathRef.current?.setAttribute("d", `M0 0 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`);
    if (beadRef.current) {
      const angle = Math.atan2(hx, hy) * (-180 / Math.PI);
      beadRef.current.style.transform = `translate(${hx - 11}px, ${hy - 4}px) rotate(${angle.toFixed(1)}deg)`;
    }
  }, []);

  const run = React.useCallback(() => {
    const s = sim.current;
    cancelAnimationFrame(s.raf);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (!s.drag) {
        const k = 170;
        const c = 9;
        s.vx += (-k * s.x - c * s.vx) * dt;
        s.vy += (-k * s.y - c * s.vy) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      draw();
      const resting = !s.drag && Math.abs(s.x) + Math.abs(s.y) < 0.3 && Math.abs(s.vx) + Math.abs(s.vy) < 2;
      if (resting) {
        s.x = s.y = s.vx = s.vy = 0;
        draw();
        s.raf = 0;
      } else s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  }, [draw]);

  React.useEffect(() => {
    sim.current.reduced = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    draw();
    const s = sim.current;
    return () => cancelAnimationFrame(s.raf);
  }, [draw, animated]);

  const tug = () => {
    const s = sim.current;
    if (!s.reduced) {
      s.vy = 520;
      s.vx = (Math.random() - 0.5) * 160;
      run();
    }
    window.setTimeout(toggle, s.reduced ? 0 : 110);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.drag = true;
    s.sx = e.clientX - s.x;
    s.sy = e.clientY - s.y;
    s.moved = 0;
    run();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    if (!s.drag) return;
    const nx = Math.max(-90, Math.min(90, e.clientX - s.sx));
    const ny = Math.max(-12, Math.min(120, e.clientY - s.sy));
    s.vx = (nx - s.x) * 60;
    s.vy = (ny - s.y) * 60;
    s.moved += Math.abs(nx - s.x) + Math.abs(ny - s.y);
    s.x = nx;
    s.y = ny;
  };
  const onPointerUp = () => {
    const s = sim.current;
    if (!s.drag) return;
    s.drag = false;
    if (s.moved < 4) tug();
    else if (s.y > PULL_TO_TOGGLE) toggle();
    run();
  };

  return (
    <div
      className={`gx-pc relative isolate h-[420px] w-full overflow-hidden bg-[#0b0b0d] ${className}`}
      data-on={isOn}
      data-animated={animated}
      style={{ "--lc": lightColor } as React.CSSProperties}
    >
      <style>{css}</style>

      {/* light: cone + pool + dust */}
      <div aria-hidden className={`gx-pc-light pointer-events-none absolute inset-0 transition-opacity duration-300 ${isOn ? "" : "opacity-0"}`}>
        <div
          className="absolute left-1/2 top-[64px] h-[calc(100%-64px)] w-[150%] -translate-x-1/2 blur-[6px]"
          style={{
            clipPath: "polygon(46.5% 0, 53.5% 0, 82% 100%, 18% 100%)",
            background: `linear-gradient(to bottom, color-mix(in srgb, ${lightColor} 55%, transparent), color-mix(in srgb, ${lightColor} 10%, transparent) 75%, transparent)`,
          }}
        />
        <div
          className="absolute bottom-[-20%] left-1/2 h-[55%] w-[80%] -translate-x-1/2 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${lightColor} 30%, transparent), transparent)` }}
        />
        {DUST.map((p, i) => (
          <span
            key={i}
            className="gx-pc-dust absolute h-[2px] w-[2px] rounded-full bg-white/80"
            style={{ left: `${p.left}%`, top: `${p.top}%`, "--dx": p.dx, "--t": p.t, "--d": p.d } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ceiling rose + braided cable + enamel shade + Edison bulb */}
      <div
        aria-hidden
        className={`gx-pc-light pointer-events-none absolute left-1/2 top-[52px] h-24 w-24 -translate-x-1/2 rounded-full transition-opacity duration-300 ${isOn ? "" : "opacity-0"}`}
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${lightColor} 75%, transparent), color-mix(in srgb, ${lightColor} 18%, transparent) 55%, transparent)` }}
      />
      <svg aria-hidden viewBox="0 0 140 96" width="140" height="96" className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible">
        <defs>
          <linearGradient id={`${uid}brass`} x1="0" x2="1">
            <stop offset="0" stopColor="#6b4a1c" />
            <stop offset=".35" stopColor="#f3d58e" />
            <stop offset=".6" stopColor="#b8862f" />
            <stop offset="1" stopColor="#5a3d15" />
          </linearGradient>
          <linearGradient id={`${uid}enamel`} x1="0" x2="1">
            <stop offset="0" stopColor="#0e1312" />
            <stop offset=".28" stopColor="#4b5c55" />
            <stop offset=".4" stopColor="#22302b" />
            <stop offset=".78" stopColor="#121917" />
            <stop offset="1" stopColor="#2b3632" />
          </linearGradient>
          <radialGradient id={`${uid}inner`} cx=".5" cy=".2" r=".8">
            <stop offset="0" stopColor="#fff7df" />
            <stop offset=".45" stopColor={lightColor} />
            <stop offset="1" stopColor="#6b4a1c" />
          </radialGradient>
          <radialGradient id={`${uid}glass`} cx=".45" cy=".4" r=".6">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset=".4" stopColor={lightColor} stopOpacity=".95" />
            <stop offset="1" stopColor={lightColor} stopOpacity=".35" />
          </radialGradient>
          <filter id={`${uid}glow`} x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {/* ceiling rose */}
        <rect x="52" y="-2" width="36" height="7" rx="3" fill={`url(#${uid}brass)`} />
        <rect x="58" y="4" width="24" height="2" rx="1" fill="#2a1d0a" opacity=".6" />
        {/* braided fabric cable */}
        <line x1="70" y1="5" x2="70" y2="25" stroke="#1a1410" strokeWidth="3.2" />
        <line x1="70" y1="5" x2="70" y2="25" stroke="#8a6a3a" strokeWidth="3.2" strokeDasharray="1.3 1.3" opacity=".55" />
        {/* socket */}
        <rect x="63" y="24" width="14" height="10" rx="2" fill={`url(#${uid}brass)`} />
        <path d="M63 27.5h14M63 30.5h14" stroke="#3d2a0e" strokeWidth=".7" opacity=".7" />
        {/* shade */}
        <path d="M60 33 C58 45 22 46 6 62 L134 62 C118 46 82 45 80 33 Z" fill={`url(#${uid}enamel)`} />
        <path d="M63 35 C60 45 36 48 22 58" stroke="#fff" strokeOpacity=".22" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M60 33 C58 45 22 46 6 62" stroke="#9fb3ab" strokeOpacity=".18" strokeWidth=".8" fill="none" />
        {/* inside of the shade */}
        <ellipse cx="70" cy="62" rx="63" ry="5.5" fill={`url(#${uid}inner)`} />
        <ellipse cx="70" cy="62" rx="63" ry="5.5" fill="#120c04" className="transition-opacity duration-300" style={{ opacity: isOn ? 0 : 0.72 }} />
        {/* Edison bulb */}
        <rect x="65" y="57" width="10" height="6" rx="1" fill={`url(#${uid}brass)`} />
        <path d="M70 62 c-9 0 -12 7 -12 12 c0 7 5 12 12 12 c7 0 12 -5 12 -12 c0 -5 -3 -12 -12 -12z" fill={isOn ? `url(#${uid}glass)` : "rgba(255,255,255,.05)"} stroke="rgba(255,255,255,.22)" strokeWidth=".6" />
        <path d="M67 64 L66 74 M73 64 L74 74" stroke={isOn ? "#ffe9b0" : "#5d5446"} strokeWidth=".5" />
        <g className={`gx-pc-light transition-opacity duration-300 ${isOn ? "" : "opacity-0"}`}>
          <path d="M66 74 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3" stroke={lightColor} strokeWidth="3" fill="none" filter={`url(#${uid}glow)`} />
          <path d="M66 74 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3" stroke="#fffbe8" strokeWidth=".9" fill="none" />
        </g>
        {!isOn && <path d="M66 74 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3" stroke="#6b5a3a" strokeWidth=".7" fill="none" />}
        <path d="M62.5 70 c0 -3 1.5 -5 3.5 -6" stroke="#fff" strokeOpacity=".5" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* brass rim */}
        <path d="M6 62 C20 68 120 68 134 62" stroke={`url(#${uid}brass)`} strokeWidth="2.2" fill="none" />
      </svg>

      {/* cord + bead (anchored under the shade's right edge) */}
      <div className="absolute left-[calc(50%+38px)] top-[64px] z-20 h-0 w-0">
        <svg aria-hidden className="absolute left-0 top-0 overflow-visible" width="1" height="1">
          <path ref={pathRef} d={`M0 0 L0 ${REST}`} fill="none" stroke="#bdbdbd" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <button
          ref={beadRef}
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`${label}: pull to switch ${isOn ? "off" : "on"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              tug();
            }
          }}
          className="absolute left-0 top-0 h-7 w-[22px] cursor-grab touch-none rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            transform: `translate(-11px, ${REST - 4}px)`,
            background: "radial-gradient(circle at 35% 30%, #fff3c4, #d4a24c 45%, #7a5520 100%)",
            boxShadow: "0 4px 10px rgba(0,0,0,.6)",
          }}
        />
      </div>

      {/* lit content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-8 pt-40">
        <div className={`transition-[filter,opacity] duration-500 ${isOn ? "opacity-100" : "opacity-25 [filter:brightness(.4)_grayscale(.6)]"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PullCord;
