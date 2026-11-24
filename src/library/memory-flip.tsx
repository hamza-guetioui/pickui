"use client";

import * as React from "react";

/**
 * MemoryFlip — the pairs game, reimagined: holographic 3D cards that tilt
 * toward your finger with a foil sheen, a one-second "peek" of the whole deck
 * at the start of each level, a light beam that connects every pair you find,
 * streak multipliers, one hint per level and four levels that grow the board
 * (6 → 8 → 10 → 12 pairs). Moves, time, stars and a saved best score.
 * Pass your own `faces` (emoji, letters, logos).
 * Game · zero dependencies · keyboard playable (arrow keys move between cards).
 */

export type MemoryFlipProps = {
  /** Card faces; levels use the first 6 / 8 / 10 / 12 (pairs are made for you). */
  faces?: string[];
  /** localStorage key for the best total score (null disables). */
  storageKey?: string | null;
  /** false = instant flips, no tilt / peek animation (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const FACES = ["🦊", "🐙", "🌵", "🚀", "🍉", "🎧", "🪐", "🧩", "🦄", "🍄", "🌈", "💎"];
const LEVELS = [
  { cols: 4, pairs: 6 },
  { cols: 4, pairs: 8 },
  { cols: 5, pairs: 10 },
  { cols: 6, pairs: 12 },
];

type Card = { id: number; f: string };
type Beam = { id: number; x1: number; y1: number; x2: number; y2: number };
type Phase = "peek" | "play" | "cleared" | "done";

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const CSS = `
@keyframes pu-mf-shake{20%{transform:translateX(-6px) rotate(-2deg)}60%{transform:translateX(6px) rotate(2deg)}}
@keyframes pu-mf-pop{0%{transform:scale(1)}40%{transform:scale(1.08)}100%{transform:scale(1)}}
@keyframes pu-mf-beam{0%{stroke-dashoffset:1;opacity:1}60%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@keyframes pu-mf-hint{0%,100%{box-shadow:0 0 0 0 rgba(255,214,102,0)}50%{box-shadow:0 0 0 3px rgba(255,214,102,.9),0 0 24px rgba(255,214,102,.6)}}
@keyframes pu-mf-rise{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-120px) scale(1.1) rotate(var(--r));opacity:0}}
@keyframes pu-mf-in{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
`;

export function MemoryFlip({ faces = FACES, storageKey = "pickui-memory-best", animated = true, className = "" }: MemoryFlipProps) {
  const levels = React.useMemo(() => LEVELS.filter((l) => l.pairs <= faces.length), [faces.length]);
  const [level, setLevel] = React.useState(0);
  const cfg = levels[Math.min(level, levels.length - 1)] ?? { cols: 4, pairs: Math.max(2, faces.length) };
  const pick = React.useMemo(() => faces.slice(0, cfg.pairs), [faces, cfg.pairs]);

  const [deck, setDeck] = React.useState<Card[]>(() => [...pick, ...pick].map((f, i) => ({ id: i, f })));
  const [phase, setPhase] = React.useState<Phase>("peek");
  const [open, setOpen] = React.useState<number[]>([]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [bad, setBad] = React.useState<number[]>([]);
  const [hint, setHint] = React.useState<number[]>([]);
  const [hints, setHints] = React.useState(1);
  const [beams, setBeams] = React.useState<Beam[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [t0, setT0] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [burst, setBurst] = React.useState(0);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const [motion, setMotion] = React.useState(animated);

  React.useEffect(() => {
    setMotion(animated && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [animated]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      setBest(Number(localStorage.getItem(storageKey)) || 0);
    } catch {}
  }, [storageKey]);

  // deal a level: shuffle on the client (no hydration mismatch), then a short peek
  const deal = React.useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDeck(shuffle([...pick, ...pick].map((f, i) => ({ id: i, f }))));
    setOpen([]);
    setMatched(new Set());
    setBad([]);
    setHint([]);
    setBeams([]);
    setHints(1);
    setMoves(0);
    setStreak(0);
    setT0(null);
    setNow(0);
    setPhase("peek");
    timers.current.push(window.setTimeout(() => setPhase("play"), 1300 + pick.length * 40));
  }, [pick]);
  React.useEffect(() => deal(), [deal]);

  const playing = phase === "play";
  React.useEffect(() => {
    if (!t0 || !playing) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [t0, playing]);

  const saveBest = (total: number) => {
    setBest((b) => {
      const nb = Math.max(b, total);
      if (storageKey && nb > b) {
        try {
          localStorage.setItem(storageKey, String(nb));
        } catch {}
      }
      return nb;
    });
  };

  const center = (i: number) => {
    const grid = gridRef.current;
    const el = grid?.querySelector<HTMLElement>(`[data-i="${i}"]`);
    if (!grid || !el) return { x: 0, y: 0 };
    const g = grid.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - g.left + r.width / 2, y: r.top - g.top + r.height / 2 };
  };

  const flip = (i: number) => {
    if (!playing || open.length === 2 || open.includes(i) || matched.has(deck[i].f)) return;
    if (!t0) setT0(Date.now());
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (deck[a].f === deck[b].f) {
      const s = streak + 1;
      setStreak(s);
      const gained = 100 * s;
      const total = score + gained;
      setScore(total);
      if (motion) {
        const p = center(a);
        const q = center(b);
        const beam = { id: Date.now(), x1: p.x, y1: p.y, x2: q.x, y2: q.y };
        setBeams((bs) => [...bs, beam]);
        later(() => setBeams((bs) => bs.filter((x) => x.id !== beam.id)), 900);
      }
      later(
        () => {
          const m = new Set(matched).add(deck[a].f);
          setMatched(m);
          setOpen([]);
          if (m.size === pick.length) {
            // level bonus: faster + fewer moves = more
            const secs = t0 ? (Date.now() - t0) / 1000 : 0;
            const bonus = Math.max(0, Math.round(pick.length * 120 - secs * 8 - (moves + 1 - pick.length) * 25));
            const final = total + bonus;
            setScore(final);
            saveBest(final);
            setBurst((n) => n + 1);
            setPhase(level >= levels.length - 1 ? "done" : "cleared");
          }
        },
        motion ? 420 : 0,
      );
    } else {
      setStreak(0);
      later(() => setBad(next), motion ? 450 : 0);
      later(
        () => {
          setBad([]);
          setOpen([]);
        },
        motion ? 950 : 600,
      );
    }
  };

  const showHint = () => {
    if (!playing || hints <= 0) return;
    const left = deck.map((c, i) => ({ c, i })).filter(({ c, i }) => !matched.has(c.f) && !open.includes(i));
    const first = left[0];
    if (!first) return;
    const pair = left.filter((x) => x.c.f === first.c.f).map((x) => x.i);
    setHints(0);
    setStreak(0);
    setHint(pair);
    later(() => setHint([]), 1100);
  };

  const nextLevel = () => {
    if (phase === "done") {
      setScore(0);
      setLevel(0);
      if (level === 0) deal();
      return;
    }
    setLevel((l) => l + 1);
  };
  const restart = () => {
    setScore(0);
    if (level === 0) deal();
    else setLevel(0);
  };

  // roving focus with the arrow keys
  const onGridKey = (e: React.KeyboardEvent) => {
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cfg.cols, ArrowUp: -cfg.cols }[e.key];
    if (!d) return;
    const cur = Number((document.activeElement as HTMLElement | null)?.dataset.i ?? -1);
    if (cur < 0) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(deck.length - 1, cur + d));
    gridRef.current?.querySelector<HTMLElement>(`[data-i="${n}"]`)?.focus();
  };

  // holographic tilt (writes CSS vars directly: no re-render while moving)
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (!motion || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 18}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const secs = t0 ? Math.max(0, Math.round(((now || Date.now()) - t0) / 1000)) : 0;
  const stars = moves <= pick.length + 2 ? 3 : moves <= pick.length * 2 ? 2 : 1;
  const ease = motion ? "transform .55s cubic-bezier(.3,1.35,.5,1)" : "none";

  return (
    <div className={`relative w-full max-w-[440px] select-none ${className}`}>
      <style>{CSS}</style>

      {/* HUD */}
      <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-white/50" aria-live="polite">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/80">
          Level <b className="text-white">{level + 1}</b>/{levels.length}
        </span>
        <span>
          moves <b className="text-white">{moves}</b>
        </span>
        <span>
          <b className="text-white tabular-nums">{secs}</b>s
        </span>
        <span className="ml-auto text-right">
          <b className="block text-[15px] tabular-nums text-white">{score}</b>
          <span className="text-[10px]">best {best}</span>
        </span>
      </div>

      {/* streak meter */}
      <div className="mb-3 flex items-center gap-2" aria-hidden>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff4d8d] via-[#8b5cf6] to-[#22d3ee] transition-[width] duration-500"
            style={{ width: `${Math.min(100, (streak / pick.length) * 100)}%`, boxShadow: streak > 1 ? "0 0 12px rgba(139,92,246,.8)" : undefined }}
          />
        </div>
        <span className={`font-mono text-[11px] font-bold tabular-nums ${streak > 1 ? "text-[#ffd666]" : "text-white/30"}`} style={streak > 1 && motion ? { animation: "pu-mf-pop .4s" } : undefined} key={streak}>
          ×{Math.max(1, streak)}
        </span>
      </div>

      {/* board */}
      <div
        ref={gridRef}
        onKeyDown={onGridKey}
        role="grid"
        aria-label={`Memory cards, level ${level + 1}`}
        className="relative grid gap-2 [perspective:1000px]"
        style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))` }}
      >
        {deck.map((c, i) => {
          const isMatched = matched.has(c.f);
          const up = phase === "peek" || open.includes(i) || isMatched || phase === "cleared" || phase === "done";
          const shaking = bad.includes(i);
          return (
            <button
              key={`${level}-${c.id}`}
              data-i={i}
              type="button"
              onClick={() => flip(i)}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              aria-label={up ? `Card ${i + 1}: ${c.f}${isMatched ? ", matched" : ""}` : `Card ${i + 1}, face down`}
              aria-pressed={up}
              className="group relative aspect-[3/4] rounded-xl outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-white/80"
              style={{
                transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
                transition: "transform .2s ease-out",
                animation: motion ? `pu-mf-in .45s ${i * 25}ms both${hint.includes(i) ? ", pu-mf-hint .55s 2" : ""}` : undefined,
              }}
            >
              <span
                className="absolute inset-0 rounded-xl [transform-style:preserve-3d]"
                style={{
                  transform: `rotateY(${up ? 180 : 0}deg) translateZ(${isMatched && motion ? 10 : 0}px)`,
                  transition: ease,
                  animation: shaking && motion ? "pu-mf-shake .35s" : undefined,
                }}
              >
                {/* back: holographic foil */}
                <span
                  className="absolute inset-0 overflow-hidden rounded-xl border border-white/10 [backface-visibility:hidden]"
                  style={{
                    background:
                      "radial-gradient(circle at var(--mx,30%) var(--my,20%), rgba(255,255,255,.22), transparent 45%), conic-gradient(from 210deg at 50% 50%, #ff4d8d22, #8b5cf633, #22d3ee22, #a3e63522, #ff4d8d22), repeating-linear-gradient(45deg,#16142b 0 6px,#110f22 6px 12px)",
                  }}
                >
                  <span className="absolute inset-[18%] grid place-items-center rounded-lg border border-white/15 font-mono text-[10px] font-bold tracking-[0.3em] text-white/40 transition group-hover:text-white/70">
                    PU
                  </span>
                  {shaking && <span className="absolute inset-0 rounded-xl ring-2 ring-[#fb7185]" />}
                </span>
                {/* face */}
                <span
                  className="absolute inset-0 grid place-items-center rounded-xl text-[clamp(1.4rem,6vw,2rem)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{
                    background: isMatched ? "linear-gradient(160deg,#2a1450,#0f0a24)" : "linear-gradient(160deg,#fafaff,#e9e6f5)",
                    boxShadow: isMatched ? "0 0 0 1px rgba(139,92,246,.6), 0 0 22px rgba(139,92,246,.45)" : shaking ? "0 0 0 2px #fb7185" : "0 6px 16px -8px rgba(0,0,0,.6)",
                  }}
                >
                  {c.f}
                </span>
              </span>
            </button>
          );
        })}

        {/* light beams between found pairs */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="pu-mf-g" x1="0" x2="1">
              <stop offset="0" stopColor="#ff4d8d" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {beams.map((b) => (
            <line
              key={b.id}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              pathLength={1}
              stroke="url(#pu-mf-g)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="1"
              style={{ animation: "pu-mf-beam .9s ease-out forwards", filter: "drop-shadow(0 0 6px #8b5cf6)" }}
            />
          ))}
        </svg>

        {/* level cleared / all done */}
        {(phase === "cleared" || phase === "done") && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-[#07061a]/70 text-center backdrop-blur-sm" style={motion ? { animation: "pu-mf-in .4s both" } : undefined}>
            <div className="grid justify-items-center gap-2 px-4">
              <p className="text-2xl tracking-widest text-[#ffd666]">{"★".repeat(stars) + "☆".repeat(3 - stars)}</p>
              <p className="text-xl font-black text-white">{phase === "done" ? "All levels cleared!" : `Level ${level + 1} cleared`}</p>
              <p className="font-mono text-xs text-white/60">
                {moves} moves · {secs}s · {score} pts
              </p>
              <button type="button" autoFocus onClick={nextLevel} className="mt-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:scale-105">
                {phase === "done" ? "Play again" : "Next level →"}
              </button>
            </div>
            {motion &&
              Array.from({ length: 14 }, (_, k) => (
                <span
                  key={`${burst}-${k}`}
                  aria-hidden
                  className="pointer-events-none absolute bottom-1/3 text-2xl"
                  style={{ left: `${8 + ((k * 61) % 84)}%`, ["--r" as string]: `${(k % 2 ? 1 : -1) * (10 + k * 7)}deg`, animation: `pu-mf-rise 1.4s ${k * 60}ms ease-out both` }}
                >
                  {pick[k % pick.length]}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center gap-2">
        <span className="mr-auto text-sm font-semibold text-white">
          {phase === "peek" ? "Memorise…" : phase === "play" ? `${matched.size}/${pick.length} pairs` : "Nice."}
        </span>
        <button
          type="button"
          onClick={showHint}
          disabled={!playing || hints <= 0}
          className="rounded-full border border-[#ffd666]/40 px-3 py-1.5 text-xs text-[#ffd666] transition hover:bg-[#ffd666]/10 disabled:opacity-30"
        >
          ✦ Hint {hints}
        </button>
        <button type="button" onClick={restart} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:text-white">
          Restart
        </button>
      </div>
    </div>
  );
}

export default MemoryFlip;
