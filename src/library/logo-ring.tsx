"use client";

import * as React from "react";

/**
 * LogoRing — the "trusted by" strip, but in 3D: logos ride a tilted ring
 * that slowly turns; logos at the back dim and blur, the front ones are
 * crisp. Drag to spin it with momentum. Text wordmarks by default (bring
 * your own SVGs via `logos`).
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type RingLogo = { name: string; node?: React.ReactNode };

export type LogoRingProps = {
  logos?: RingLogo[];
  title?: string;
  /** false = flat static row (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const LOGOS: RingLogo[] = ["Northwind", "Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Soylent", "Vandelay"].map((name) => ({ name }));

export function LogoRing({ logos = LOGOS, title = "Trusted by teams that ship (sample logos)", animated = true, className = "" }: LogoRingProps) {
  const ring = React.useRef<HTMLDivElement>(null);
  const items = React.useRef<(HTMLDivElement | null)[]>([]);
  const s = React.useRef({ a: 0, v: 0.15, drag: false, x: 0 });

  React.useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const n = logos.length;
    const loop = () => {
      const st = s.current;
      if (!st.drag) {
        st.v += (0.15 - st.v) * 0.02; // settle back to idle spin
        st.a += st.v;
      }
      items.current.forEach((el, i) => {
        if (!el) return;
        const ang = ((i / n) * 360 + st.a) % 360;
        const rad = (ang * Math.PI) / 180;
        const depth = (Math.cos(rad) + 1) / 2; // 1 = front
        el.style.transform = `rotateY(${ang}deg) translateZ(var(--rz))`;
        el.style.opacity = String(0.25 + depth * 0.75);
        el.style.filter = `blur(${(1 - depth) * 2}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animated, logos.length]);

  if (!animated) {
    return (
      <section className={`w-full px-6 py-12 text-center ${className}`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">{title}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4">
          {logos.map((l) => (
            <span key={l.name} className="text-xl font-black tracking-tight text-white/60">
              {l.node ?? l.name}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full overflow-hidden px-6 py-12 text-center ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">{title}</p>
      <ul className="sr-only">
        {logos.map((l) => (
          <li key={l.name}>{l.name}</li>
        ))}
      </ul>
      <div
        aria-hidden
        className="relative mx-auto mt-4 h-40 cursor-grab touch-pan-y select-none [perspective:1100px] active:cursor-grabbing"
        style={{ "--rz": "min(30vw, 280px)" } as React.CSSProperties}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          s.current.drag = true;
          s.current.x = e.clientX;
        }}
        onPointerMove={(e) => {
          const st = s.current;
          if (!st.drag) return;
          const d = (e.clientX - st.x) * 0.3;
          st.x = e.clientX;
          st.a += d;
          st.v = d;
        }}
        onPointerUp={() => (s.current.drag = false)}
      >
        <div ref={ring} className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]" style={{ transform: "rotateX(-12deg)" }}>
          {logos.map((l, i) => (
            <div
              key={l.name}
              ref={(el) => {
                items.current[i] = el;
              }}
              className="absolute -ml-[70px] -mt-6 flex h-12 w-[140px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-black tracking-tight text-white [backface-visibility:hidden]"
            >
              {l.node ?? l.name}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-2 mx-auto h-6 w-2/3 rounded-[50%] bg-white/5 blur-xl" />
      </div>
    </section>
  );
}

export default LogoRing;
