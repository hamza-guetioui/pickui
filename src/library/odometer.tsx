"use client";

import * as React from "react";

/**
 * Odometer — numbers that roll like a mechanical counter. Each digit is a
 * real 0–9 strip; changing the value spins every column the short way with
 * a staggered, slightly overshooting stop. Starts counting when scrolled in.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type OdometerProps = {
  value?: number;
  /** Text before / after the number. */
  prefix?: string;
  suffix?: string;
  /** Thousands separator (default ","). */
  separator?: string;
  label?: string;
  /** false = no roll, value appears instantly (the "regular" version). Default true. */
  animated?: boolean;
  /** Demo: bump the value every few seconds (default false). */
  demo?: boolean;
  className?: string;
};

function Digit({ d, delay, animated }: { d: number; delay: number; animated: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <span
        className="absolute left-0 top-0 flex w-full flex-col items-center"
        style={{
          transform: `translateY(${-d * 10}%)`,
          transition: animated ? `transform 1.2s cubic-bezier(.2,1.1,.3,1) ${delay}ms` : "none",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Odometer({
  value = 128_450,
  prefix = "",
  suffix = "",
  separator = ",",
  label = "Developers served",
  animated = true,
  demo = true,
  className = "",
}: OdometerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(value), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);

  React.useEffect(() => {
    if (!demo) return;
    const t = window.setInterval(() => setShown((v) => v + Math.floor(Math.random() * 900 + 37)), 3200);
    return () => window.clearInterval(t);
  }, [demo]);

  // pad with leading zeros (dimmed, like a real counter) so columns never remount
  const raw = String(Math.round(shown));
  const width = Math.max(raw.length, String(Math.round(value)).length);
  const padded = raw.padStart(width, "0");
  const firstReal = width - raw.length;
  const cells: { ch: string; lead: boolean; pos: number }[] = [];
  [...padded].forEach((ch, i) => {
    const fromRight = width - i;
    cells.push({ ch, lead: i < firstReal, pos: fromRight });
    if (fromRight > 1 && (fromRight - 1) % 3 === 0) cells.push({ ch: separator, lead: i < firstReal, pos: fromRight - 0.5 });
  });
  const roll = animated && !reduced;

  return (
    <div ref={ref} className={`inline-flex flex-col items-center ${className}`}>
      <div
        className="flex items-baseline font-black tabular-nums tracking-tight text-white [font-size:clamp(2.5rem,8vw,4.5rem)]"
        aria-label={`${prefix}${Math.round(shown).toLocaleString("en-US")}${suffix}${label ? ` ${label}` : ""}`}
        role="img"
      >
        {prefix && <span className="mr-1 text-white/50">{prefix}</span>}
        {cells.map((c) =>
          /\d/.test(c.ch) ? (
            <span key={c.pos} className={c.lead ? "opacity-20" : ""}>
              <Digit d={Number(c.ch)} delay={(width - c.pos) * 60} animated={roll} />
            </span>
          ) : (
            <span key={c.pos} className={`text-white/40 ${c.lead ? "opacity-20" : ""}`}>
              {c.ch}
            </span>
          ),
        )}
        {suffix && <span className="ml-1 text-white/50">{suffix}</span>}
      </div>
      {label && <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">{label}</p>}
    </div>
  );
}

export default Odometer;
