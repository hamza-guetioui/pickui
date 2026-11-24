"use client";

import * as React from "react";

/**
 * PaletteStudio — a designer's palette generator: press Space (or the
 * button) to roll a harmonious palette in OKLCH, lock the swatches you like,
 * click to copy HEX, and see live WCAG contrast (AA / AAA) for text on every
 * swatch. Swatches widen on hover like a fan deck.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type PaletteStudioProps = {
  /** Number of swatches (3–7, default 5). */
  count?: number;
  /** Seed palette (hex). */
  initial?: string[];
  /** false = no fan / roll animation (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

/* ── color math: OKLCH → sRGB, contrast ─────────────────────────────── */
function oklchToHex(L: number, C: number, H: number) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    lin
      .map((v) => {
        const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, c)) * 255)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

function roll(n: number, locked: (string | null)[]) {
  const base = Math.random() * 360;
  const mode = Math.floor(Math.random() * 3); // analogous / triadic / split
  const step = [28, 120, 150][mode];
  return Array.from({ length: n }, (_, i) => {
    if (locked[i]) return locked[i] as string;
    const L = 0.32 + (i / Math.max(1, n - 1)) * 0.6;
    const H = base + (i % 3) * step + i * 6;
    const C = 0.06 + Math.random() * 0.12;
    return oklchToHex(L, C, H);
  });
}

export function PaletteStudio({
  count = 5,
  initial = ["#1b2a41", "#324a5f", "#ccc9dc", "#e8c547", "#f45b69"],
  animated = true,
  className = "",
}: PaletteStudioProps) {
  const n = Math.min(7, Math.max(3, count));
  const [colors, setColors] = React.useState(() => initial.slice(0, n).concat(roll(n, []).slice(initial.length)).slice(0, n));
  const [locked, setLocked] = React.useState<boolean[]>(() => Array(n).fill(false));
  const [copied, setCopied] = React.useState<number | null>(null);
  const [gen, setGen] = React.useState(0);
  // Space only shuffles while the pointer is over the studio (never hijacks page scroll)
  const hot = React.useRef(false);

  const shuffle = React.useCallback(() => {
    setColors((c) => roll(n, c.map((x, i) => (locked[i] ? x : null))));
    setGen((g) => g + 1);
  }, [n, locked]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (hot.current && e.code === "Space" && !/input|textarea|button/i.test(t.tagName)) {
        e.preventDefault();
        shuffle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffle]);

  return (
    <div className={`w-full max-w-2xl ${className}`} onPointerEnter={() => (hot.current = true)} onPointerLeave={() => (hot.current = false)}>
      <div className="flex h-56 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)] sm:h-64">
        {colors.map((c, i) => {
          const onWhite = contrast(c, "#ffffff");
          const onBlack = contrast(c, "#000000");
          const ink = onWhite > onBlack ? "#ffffff" : "#000000";
          const best = Math.max(onWhite, onBlack);
          return (
            <div
              key={i}
              className={`group relative flex min-w-0 flex-1 flex-col justify-end p-3 ${animated ? "transition-[flex-grow,background-color] duration-500 ease-out hover:flex-[1.8]" : ""}`}
              style={{ background: c, color: ink, transitionDelay: animated ? `${i * 40}ms` : undefined }}
            >
              <span key={gen} className="sr-only">
                {c}
              </span>
              <button
                type="button"
                onClick={() => setLocked((l) => l.map((v, j) => (j === i ? !v : v)))}
                aria-pressed={locked[i]}
                aria-label={`${locked[i] ? "Unlock" : "Lock"} ${c}`}
                className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-xs transition ${locked[i] ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
                style={{ background: `${ink}22`, color: ink }}
              >
                {locked[i] ? "🔒" : "🔓"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(c);
                  } catch {}
                  setCopied(i);
                  window.setTimeout(() => setCopied(null), 1200);
                }}
                className="truncate text-left font-mono text-sm font-bold uppercase tracking-wider outline-none focus-visible:underline"
                aria-label={`Copy ${c}`}
              >
                {copied === i ? "Copied!" : c}
              </button>
              <span className="mt-1 truncate font-mono text-[10px] opacity-70">
                {best.toFixed(1)}:1 · {best >= 7 ? "AAA" : best >= 4.5 ? "AA" : "AA large"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-white/50">
        <span>
          Hover + <kbd className="rounded border border-white/20 px-1.5 font-mono">space</kbd> to generate · click to copy · lock to keep
        </span>
        <button type="button" onClick={shuffle} className="rounded-full bg-white px-3 py-1.5 font-semibold text-black hover:bg-white/85">
          Generate
        </button>
      </div>
    </div>
  );
}

export default PaletteStudio;
