"use client";

import * as React from "react";

/**
 * Polaroid — an instant photo that develops in front of you: it ejects from
 * the bottom, starts as murky brown-green, then colors and contrast bloom
 * over a few seconds. SHAKE it (drag back and forth) and it develops faster
 * — yes, like everybody did. Caption in handwriting.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type PolaroidProps = {
  /** Image URL. Default: a CSS sunset scene. */
  src?: string;
  alt?: string;
  caption?: string;
  /** Seconds to fully develop when left alone (default 9). */
  develop?: number;
  /** false = already developed, no eject (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

export function Polaroid({
  src,
  alt = "Instant photo",
  caption = "Essaouira, summer ’98",
  develop = 9,
  animated = true,
  className = "",
}: PolaroidProps) {
  const [p, setP] = React.useState(animated ? 0 : 1);
  const [ejected, setEjected] = React.useState(!animated);
  const [tilt, setTilt] = React.useState(0);
  const boost = React.useRef(0);
  const last = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      setEjected(true);
      return;
    }
    const t0 = window.setTimeout(() => setEjected(true), 300);
    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      boost.current *= 0.94;
      setP((v) => Math.min(1, v + (dt / develop) * (1 + boost.current)));
      raf = requestAnimationFrame(loop);
    };
    const t1 = window.setTimeout(() => (raf = requestAnimationFrame(loop)), 900);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      cancelAnimationFrame(raf);
    };
  }, [animated, develop]);

  const e = p * p * (3 - 2 * p); // smoothstep

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative h-[330px] w-[260px] overflow-hidden">
        <figure
          className="absolute left-0 right-0 cursor-grab touch-none select-none rounded-[3px] bg-[#f7f5f0] p-3 pb-14 shadow-[0_20px_40px_-12px_rgba(0,0,0,.8)] active:cursor-grabbing"
          style={{
            top: ejected ? 0 : "100%",
            transform: `rotate(${tilt}deg)`,
            transition: "top 1.1s cubic-bezier(.2,.8,.2,1), transform .2s",
          }}
          onPointerDown={(ev) => {
            ev.currentTarget.setPointerCapture(ev.pointerId);
            last.current = ev.clientX;
          }}
          onPointerMove={(ev) => {
            if (last.current === null) return;
            const d = ev.clientX - last.current;
            last.current = ev.clientX;
            boost.current = Math.min(14, boost.current + Math.abs(d) * 0.06);
            setTilt(Math.max(-12, Math.min(12, d * 0.8)));
          }}
          onPointerUp={() => {
            last.current = null;
            setTilt(0);
          }}
        >
          <div className="relative aspect-square w-full overflow-hidden bg-[#1c1a14]">
            <div
              className="absolute inset-0"
              style={{
                filter: `sepia(${(1 - e) * 0.9}) saturate(${0.2 + e * 1.1}) contrast(${0.55 + e * 0.5}) brightness(${0.35 + e * 0.7}) blur(${(1 - e) * 2}px)`,
              }}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
              ) : (
                <div
                  role="img"
                  aria-label={alt}
                  className="h-full w-full"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 62%, #ffd27a 0 9%, #ff9a5a 10%, transparent 34%), linear-gradient(180deg,#2b1b4f 0%,#c4467a 40%,#ff9a5a 58%,#1d3b5c 60%,#0f2438 100%)",
                  }}
                >
                  <div className="absolute bottom-[22%] left-0 right-0 h-[2px] bg-[#ffd27a]/50 blur-[1px]" />
                  <div className="absolute bottom-[8%] left-[10%] h-[30%] w-[8%] bg-[#0b1420] [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
                </div>
              )}
            </div>
            {/* chemical haze */}
            <div className="pointer-events-none absolute inset-0 bg-[#2a2a1f] mix-blend-multiply" style={{ opacity: (1 - e) * 0.85 }} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_50%)]" />
          </div>
          <figcaption className="absolute bottom-3 left-0 right-0 text-center text-lg text-[#2b2b2b] [font-family:'Segoe_Print','Bradley_Hand','Comic_Sans_MS',cursive]" style={{ opacity: 0.3 + e * 0.7 }}>
            {caption}
          </figcaption>
        </figure>
        <div className="absolute inset-x-[-10%] bottom-0 h-3 rounded-t bg-[#1a1a1c] shadow-[0_-4px_10px_rgba(0,0,0,.6)]" />
      </div>
      <p className="mt-2 font-mono text-[11px] text-white/45" aria-live="polite">
        {p >= 1 ? "developed ✓" : `developing… ${Math.round(p * 100)}% · drag to shake it`}
      </p>
      {p >= 1 && animated && (
        <button
          type="button"
          onClick={() => {
            setEjected(false);
            setP(0);
            window.setTimeout(() => setEjected(true), 400);
          }}
          className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
        >
          Take another
        </button>
      )}
    </div>
  );
}

export default Polaroid;
