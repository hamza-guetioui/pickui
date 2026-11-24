"use client";

import * as React from "react";

/**
 * MemoryFlip — the classic pairs game with real 3D cards: they flip with
 * perspective, matched pairs lift and glow, mismatches shake, and a perfect
 * finish gets a card-cascade celebration. Moves, timer and stars.
 * Pass your own `faces` (emoji, letters, logos).
 * Game · zero dependencies · keyboard playable.
 */

export type MemoryFlipProps = {
  faces?: string[];
  /** false = instant flips (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const FACES = ["🦊", "🐙", "🌵", "🚀", "🍉", "🎧", "🪐", "🧩"];

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function MemoryFlip({ faces = FACES, animated = true, className = "" }: MemoryFlipProps) {
  const make = React.useCallback(() => shuffle([...faces, ...faces].map((f, i) => ({ id: i, f }))), [faces]);
  const [deck, setDeck] = React.useState(() => [...faces, ...faces].map((f, i) => ({ id: i, f })));
  const [open, setOpen] = React.useState<number[]>([]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [bad, setBad] = React.useState<number[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [t0, setT0] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);

  React.useEffect(() => setDeck(make()), [make]); // shuffle on the client only (no hydration mismatch)
  const won = matched.size === faces.length;
  React.useEffect(() => {
    if (!t0 || won) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [t0, won]);

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.has(deck[i].f)) return;
    if (!t0) setT0(Date.now());
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].f === deck[b].f) {
        window.setTimeout(() => {
          setMatched((s) => new Set(s).add(deck[a].f));
          setOpen([]);
        }, animated ? 450 : 0);
      } else {
        window.setTimeout(() => setBad(next), animated ? 500 : 0);
        window.setTimeout(() => {
          setBad([]);
          setOpen([]);
        }, animated ? 950 : 600);
      }
    }
  };

  const reset = () => {
    setDeck(make());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setT0(null);
    setNow(0);
  };

  const secs = t0 ? Math.round(((won ? now : now || Date.now()) - t0) / 1000) : 0;
  const stars = moves <= faces.length + 2 ? 3 : moves <= faces.length * 2 ? 2 : 1;

  return (
    <div className={`w-full max-w-[340px] ${className}`}>
      <style>{`@keyframes gx-mf-shake{25%{transform:translateX(-5px) rotate(-2deg)}75%{transform:translateX(5px) rotate(2deg)}}@keyframes gx-mf-win{0%{transform:translateY(0) rotate(0)}50%{transform:translateY(-14px) rotate(6deg)}100%{transform:translateY(0)}}`}</style>
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-white/60" aria-live="polite">
        <span>
          moves <b className="text-white">{moves}</b>
        </span>
        <span>{"★".repeat(stars) + "☆".repeat(3 - stars)}</span>
        <span>
          <b className="text-white">{secs}</b>s
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 [perspective:900px]" role="grid" aria-label="Memory cards">
        {deck.map((c, i) => {
          const up = open.includes(i) || matched.has(c.f);
          const isMatched = matched.has(c.f);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={up ? `Card ${i + 1}: ${c.f}` : `Card ${i + 1}, face down`}
              aria-pressed={up}
              className="relative aspect-[3/4] rounded-xl outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-white"
              style={{
                transform: `rotateY(${up ? 180 : 0}deg) ${isMatched && animated ? "translateZ(14px)" : ""}`,
                transition: animated ? "transform .5s cubic-bezier(.3,1.3,.5,1)" : "none",
                animation: bad.includes(i) && animated ? "gx-mf-shake .3s" : won && animated ? `gx-mf-win .6s ${i * 40}ms` : undefined,
              }}
            >
              <span className="absolute inset-0 grid place-items-center rounded-xl border border-white/10 bg-[repeating-linear-gradient(45deg,#1f1f24_0_8px,#17171b_8px_16px)] text-xl text-white/20 [backface-visibility:hidden]">
                ?
              </span>
              <span
                className="absolute inset-0 grid place-items-center rounded-xl text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{ background: isMatched ? "linear-gradient(160deg,#14532d,#0b2e1a)" : "#f5f5f4", boxShadow: isMatched ? "0 0 20px rgba(74,222,128,.45)" : undefined }}
              >
                {c.f}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{won ? `🎉 Cleared in ${moves} moves!` : "Find all the pairs"}</span>
        <button type="button" onClick={reset} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:text-white">
          Shuffle
        </button>
      </div>
    </div>
  );
}

export default MemoryFlip;
