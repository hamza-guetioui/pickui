"use client";

import * as React from "react";

/**
 * SwipeDeck — a stack of cards you decide on by flinging them: drag right
 * to LIKE, left to NOPE (stamps fade in as you lean), release past the
 * threshold or with enough velocity and the card flies off with spin. The
 * next card scales up from the stack. Buttons and ←/→ keys too.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type DeckCard = { id: string; title: string; subtitle?: string; gradient?: string; emoji?: string };

export type SwipeDeckProps = {
  cards?: DeckCard[];
  onSwipe?: (card: DeckCard, dir: "left" | "right") => void;
  /** false = cards slide out without physics (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT: DeckCard[] = [
  { id: "1", title: "Kyoto", subtitle: "Temples, tea & quiet", emoji: "⛩️", gradient: "linear-gradient(160deg,#f472b6,#7c3aed)" },
  { id: "2", title: "Marrakech", subtitle: "Souks & sunsets", emoji: "🕌", gradient: "linear-gradient(160deg,#fb923c,#b91c1c)" },
  { id: "3", title: "Reykjavík", subtitle: "Auroras & hot springs", emoji: "🌌", gradient: "linear-gradient(160deg,#22d3ee,#1e3a8a)" },
  { id: "4", title: "Lisbon", subtitle: "Trams & tiles", emoji: "🚋", gradient: "linear-gradient(160deg,#facc15,#0f766e)" },
  { id: "5", title: "Patagonia", subtitle: "Wind & granite", emoji: "🏔️", gradient: "linear-gradient(160deg,#a3e635,#14532d)" },
];

export function SwipeDeck({ cards = DEFAULT, onSwipe, animated = true, className = "" }: SwipeDeckProps) {
  const [index, setIndex] = React.useState(0);
  const [drag, setDrag] = React.useState({ x: 0, y: 0, active: false });
  const [fly, setFly] = React.useState<{ dir: 1 | -1 } | null>(null);
  const start = React.useRef({ x: 0, y: 0, t: 0 });
  const [log, setLog] = React.useState<string[]>([]);

  const top = cards[index];
  const decide = React.useCallback(
    (dir: 1 | -1) => {
      if (!top || fly) return;
      setFly({ dir });
      onSwipe?.(top, dir > 0 ? "right" : "left");
      setLog((l) => [`${dir > 0 ? "♥" : "✕"} ${top.title}`, ...l].slice(0, 3));
      window.setTimeout(
        () => {
          setFly(null);
          setDrag({ x: 0, y: 0, active: false });
          setIndex((i) => i + 1);
        },
        animated ? 380 : 120,
      );
    },
    [top, fly, onSwipe, animated],
  );

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!(document.activeElement as HTMLElement)?.closest?.("[data-gx-deck]")) return;
      if (e.key === "ArrowRight") decide(1);
      if (e.key === "ArrowLeft") decide(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [decide]);

  const lean = Math.max(-1, Math.min(1, drag.x / 120));

  return (
    <div data-gx-deck className={`flex w-full max-w-sm flex-col items-center gap-5 ${className}`}>
      <div className="relative h-[340px] w-[260px]">
        {!top && (
          <div className="grid h-full place-items-center rounded-3xl border border-dashed border-white/15 text-center text-sm text-white/50">
            <div>
              <p>That’s everyone.</p>
              <button type="button" onClick={() => setIndex(0)} className="mt-3 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black">
                Start over
              </button>
            </div>
          </div>
        )}
        {cards
          .slice(index, index + 3)
          .reverse()
          .map((c, ri, arr) => {
            const depth = arr.length - 1 - ri; // 0 = top
            const isTop = depth === 0;
            let transform = `translateY(${depth * 12}px) scale(${1 - depth * 0.05 + (isTop ? 0 : Math.abs(lean) * 0.03)})`;
            if (isTop) {
              if (fly) transform = animated ? `translate(${fly.dir * 520}px, ${drag.y - 40}px) rotate(${fly.dir * 40}deg)` : `translateX(${fly.dir * 300}px)`;
              else transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.08}deg)`;
            }
            return (
              <article
                key={c.id}
                aria-hidden={!isTop}
                className="absolute inset-0 touch-none select-none overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_40px_-14px_rgba(0,0,0,.9)]"
                style={{
                  background: c.gradient ?? "#18181b",
                  transform,
                  opacity: fly && isTop && !animated ? 0 : 1,
                  transition: isTop && drag.active ? "none" : "transform .38s cubic-bezier(.2,.9,.3,1.1), opacity .2s",
                  cursor: isTop ? "grab" : undefined,
                  zIndex: 10 - depth,
                }}
                onPointerDown={(e) => {
                  if (!isTop || fly) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
                  setDrag({ x: 0, y: 0, active: true });
                }}
                onPointerMove={(e) => isTop && drag.active && setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.4, active: true })}
                onPointerUp={(e) => {
                  if (!isTop || !drag.active) return;
                  const v = (e.clientX - start.current.x) / Math.max(1, performance.now() - start.current.t);
                  if (Math.abs(drag.x) > 110 || Math.abs(v) > 0.7) decide(drag.x > 0 ? 1 : -1);
                  else setDrag({ x: 0, y: 0, active: false });
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-lg">{c.emoji}</span>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-black text-white">{c.title}</h3>
                  {c.subtitle && <p className="text-sm text-white/80">{c.subtitle}</p>}
                </div>
                {isTop && (
                  <>
                    <span className="absolute left-5 top-6 -rotate-12 rounded-md border-4 border-emerald-400 px-2 font-black uppercase tracking-widest text-emerald-400" style={{ opacity: Math.max(0, lean) }}>
                      Like
                    </span>
                    <span className="absolute right-5 top-6 rotate-12 rounded-md border-4 border-rose-500 px-2 font-black uppercase tracking-widest text-rose-500" style={{ opacity: Math.max(0, -lean) }}>
                      Nope
                    </span>
                  </>
                )}
              </article>
            );
          })}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => decide(-1)} aria-label="Nope" disabled={!top} className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-[#141416] text-xl text-rose-400 transition hover:scale-110 disabled:opacity-40">
          ✕
        </button>
        <button type="button" onClick={() => decide(1)} aria-label="Like" disabled={!top} className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-[#141416] text-xl text-emerald-400 transition hover:scale-110 disabled:opacity-40">
          ♥
        </button>
      </div>
      <p className="h-4 font-mono text-[11px] text-white/45" aria-live="polite">
        {log[0] ?? "drag, tap the buttons, or use ← →"}
      </p>
    </div>
  );
}

export default SwipeDeck;
