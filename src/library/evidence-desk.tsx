"use client";

import * as React from "react";

/**
 * EvidenceDesk — a detective's desk in the dark. Scroll: the desk lamp clicks
 * on, then the camera glides from clue to clue (case file, Polaroids, a map
 * with red string, a fingerprint under a magnifying glass, a ransom note)
 * while a typed exhibit card tells the story. Moonlight through the blinds
 * when the lamp is off.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Clue = { exhibit?: string; title: string; body?: string };

export type EvidenceDeskProps = {
  /** One per station: overview, file, photos, map, fingerprint, note. */
  clues?: Clue[];
  /** Case title on the folder. */
  caseName?: string;
  mode?: "contained" | "page";
  /** false = no easing or flicker. Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT_CLUES: Clue[] = [
  { exhibit: "Case 1947", title: "Somebody left the lights off.", body: "Scroll to switch on the lamp." },
  { exhibit: "Exhibit A", title: "The file.", body: "Three names. One of them is lying." },
  { exhibit: "Exhibit B", title: "The photographs.", body: "Same coat, three different nights." },
  { exhibit: "Exhibit C", title: "The map.", body: "Every string leads back to the harbour." },
  { exhibit: "Exhibit D", title: "The print.", body: "A left thumb, pressed in a hurry." },
  { exhibit: "Exhibit E", title: "The note.", body: "Cut from yesterday's paper. Case closed?" },
];

const W = 1600;
const H = 1000;
// camera stations: x, y (scene px), zoom
const STATIONS: [number, number, number][] = [
  [800, 500, 0.62],
  [390, 320, 1.25],
  [880, 260, 1.35],
  [1240, 560, 1.15],
  [520, 720, 1.6],
  [1040, 820, 1.4],
];

const css = `
@keyframes gx-ed-flick{0%{opacity:0}10%{opacity:.8}14%{opacity:.1}26%{opacity:1}30%{opacity:.5}40%,100%{opacity:1}}
.gx-ed[data-lamp="true"] .gx-ed-warm{animation:gx-ed-flick .8s steps(1,end) both}
.gx-ed[data-still="true"] .gx-ed-warm{animation:none}
.gx-ed-file .gx-ed-paper{transition:transform .5s cubic-bezier(.3,1.3,.5,1)}
.gx-ed-file:hover .gx-ed-paper{transform:translate(18px,-30px) rotate(-1deg)}
@keyframes gx-ed-thump{0%{transform:rotate(-14deg) scale(1.8);opacity:0}60%{transform:rotate(-14deg) scale(.94);opacity:.95}100%{transform:rotate(-14deg) scale(1);opacity:.8}}
.gx-ed-stamp{animation:gx-ed-thump .35s cubic-bezier(.5,0,.7,1) both}
.gx-ed-pol{transition:transform .5s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d}
.gx-ed-pol:hover{transform:translateY(-14px) rotate(0deg) scale(1.06)!important;z-index:5}
.gx-ed-pol-in{transition:transform .7s cubic-bezier(.3,1.2,.4,1);transform-style:preserve-3d}
.gx-ed-pol[data-flip="true"] .gx-ed-pol-in{transform:rotateY(180deg)}
.gx-ed-bf{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.gx-ed-str{stroke-dasharray:700;stroke-dashoffset:0}
.gx-ed-str[data-draw="true"]{animation:gx-ed-drawstr 1.6s cubic-bezier(.6,0,.3,1) both}
@keyframes gx-ed-drawstr{from{stroke-dashoffset:700}}
.gx-ed-pin{transition:transform .25s;transform-box:fill-box;transform-origin:center}
.gx-ed-pin:hover{transform:scale(1.5)}
@keyframes gx-ed-paste{from{opacity:0;transform:translateY(-30px) rotate(var(--r2)) scale(1.5)}to{opacity:1;transform:rotate(var(--r)) scale(1)}}
.gx-ed-letter{transform:rotate(var(--r));transition:transform .2s}
.gx-ed-letter[data-paste="true"]{animation:gx-ed-paste .35s cubic-bezier(.3,1.4,.5,1) both;animation-delay:var(--dl)}
.gx-ed-letter:hover{transform:rotate(calc(var(--r) * -1.6)) translateY(-4px)}
@keyframes gx-ed-card{from{opacity:0;transform:translateY(10px) rotate(-1deg)}}
.gx-ed-card{animation:gx-ed-card .5s cubic-bezier(.2,.8,.2,1) both}
.gx-ed[data-still="true"] .gx-ed-card,.gx-ed[data-still="true"] .gx-ed-letter,.gx-ed[data-still="true"] .gx-ed-str,.gx-ed[data-still="true"] .gx-ed-stamp{animation:none}
`;

const WOOD =
  "repeating-linear-gradient(92deg, rgba(0,0,0,.18) 0 2px, transparent 2px 9px, rgba(255,255,255,.03) 9px 10px, transparent 10px 23px), repeating-linear-gradient(88deg, rgba(0,0,0,.12) 0 1px, transparent 1px 41px), linear-gradient(180deg,#4a2d1a,#3a2213 50%,#2e1a0e)";

function Polaroid({ x, y, r, caption, tint, circled, note }: { x: number; y: number; r: number; caption: string; tint: string; circled?: boolean; note: string }) {
  const [flip, setFlip] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={`Photo: ${caption}. ${flip ? note : "Click to read the back."}`}
      data-flip={flip}
      onClick={() => setFlip((v) => !v)}
      className="gx-ed-pol absolute w-[150px] cursor-pointer text-left outline-none [perspective:800px]"
      style={{ left: x, top: y, transform: `rotate(${r}deg)` }}
    >
    <div className="gx-ed-pol-in relative">
    <div className="gx-ed-bf relative bg-[#f3efe6] p-[10px] pb-9 shadow-[0_10px_24px_rgba(0,0,0,.55)]">
      <div className="relative h-[130px] overflow-hidden" style={{ background: `linear-gradient(160deg, ${tint}, #1b1d22 80%)` }}>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
        <svg viewBox="0 0 100 100" className="absolute bottom-0 left-1/2 h-[95px] -translate-x-1/2 opacity-90">
          <path d="M50 18c7 0 11 5 11 11s-4 11-11 11-11-5-11-11 4-11 11-11zM30 50c4-6 12-8 20-8s16 2 20 8l6 50H24z" fill="#0b0b0d" />
          <path d="M36 22c4-8 24-8 28 0l2 6H34z" fill="#0b0b0d" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_50%)]" />
      </div>
      <p className="absolute bottom-2 left-3 font-[cursive] text-[13px] text-[#1d2a5a]">{caption}</p>
      {circled && (
        <svg viewBox="0 0 160 160" className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]">
          <path d="M80 8C30 6 6 40 10 84c4 46 44 70 86 66 42-4 62-40 56-80C146 30 112 6 66 12" fill="none" stroke="#c0161b" strokeWidth="4" strokeLinecap="round" opacity=".85" />
        </svg>
      )}
    </div>
    <div className="gx-ed-bf absolute inset-0 grid place-items-center bg-[#ece6d8] p-4 shadow-[0_10px_24px_rgba(0,0,0,.55)] [transform:rotateY(180deg)]">
      <p className="rotate-[-4deg] text-center font-[cursive] text-[15px] leading-snug text-[#1d2a5a]">{note}</p>
    </div>
    </div>
    </button>
  );
}

function Fingerprint({ size, className = "" }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className}>
      <g fill="none" stroke="#2b2622" strokeLinecap="round" opacity=".75">
        {Array.from({ length: 11 }, (_, i) => {
          const rx = 6 + i * 4;
          const ry = 8 + i * 4.8;
          const gap = (i * 37) % 60;
          return <ellipse key={i} cx="50" cy="62" rx={rx} ry={ry} strokeWidth="2.2" strokeDasharray={`${40 + i * 18} ${4 + (gap % 9)}`} transform={`rotate(${(i % 3) * 4 - 4} 50 62)`} />;
        })}
        <path d="M38 64c2-10 22-10 24 0" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

export function EvidenceDesk({ clues = DEFAULT_CLUES, caseName = "CASE № 1947", mode = "contained", animated = true, className = "" }: EvidenceDeskProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [lamp, setLamp] = React.useState(false);
  const [lens, setLens] = React.useState({ x: 130, y: 104 });
  const [stamp, setStamp] = React.useState(0);
  const [zoom, setZoom] = React.useState(2.2);
  const kRef = React.useRef(1);
  const dragRef = React.useRef<{ id: number; x: number; y: number } | null>(null);
  const [still, setStill] = React.useState(!animated);
  const page = mode === "page";
  const n = clues.length;

  React.useEffect(() => {
    const isStill = !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(isStill);
    const root = rootRef.current;
    const scroller = scrollRef.current;
    const view = viewRef.current;
    const scene = sceneRef.current;
    if (!root || !view || !scene) return;
    const progress = () => {
      if (page) {
        const r = root.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      }
      if (!scroller) return 0;
      const span = scroller.scrollHeight - scroller.clientHeight;
      return span > 0 ? scroller.scrollTop / span : 0;
    };
    const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const stationAt = (pos: number) => {
      const max = Math.min(n, STATIONS.length) - 1;
      const c = Math.max(0, Math.min(max, pos));
      const i = Math.min(max - 1, Math.floor(c));
      if (max <= 0) return STATIONS[0];
      const f = ease(Math.min(1, Math.max(0, (c - i - 0.2) / 0.6)));
      const a = STATIONS[i], b = STATIONS[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    };
    const c0 = stationAt(progress() * (n - 1));
    const cam = { x: c0[0], y: c0[1], z: c0[2], vx: 0, vy: 0, vz: 0 };
    let raf = 0, last = performance.now(), lastActive = -1, lastLamp = false;
    const frame = () => {
      raf = 0;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const goal = progress() * (n - 1);
      const [tx, ty, tz] = stationAt(goal);
      if (isStill) {
        cam.x = tx; cam.y = ty; cam.z = tz;
      } else {
        // spring: stiffness K, critical damping → a soft glide that settles, no overshoot
        const K = 9, D = 2 * Math.sqrt(K);
        for (let t = 0; t < dt; t += 1 / 120) {
          const h = Math.min(1 / 120, dt - t);
          cam.vx += (K * (tx - cam.x) - D * cam.vx) * h;
          cam.vy += (K * (ty - cam.y) - D * cam.vy) * h;
          cam.vz += (K * (tz - cam.z) - D * cam.vz) * h;
          cam.x += cam.vx * h; cam.y += cam.vy * h; cam.z += cam.vz * h;
        }
      }
      const vw = view.clientWidth, vh = view.clientHeight;
      const k = cam.z * Math.min(vw / 900, vh / 560);
      kRef.current = k;
      // a gentle bank in the direction of travel
      const bank = Math.max(-1.5, Math.min(1.5, cam.vx * 0.004));
      scene.style.transform = `translate(${vw / 2 - cam.x * k}px, ${vh / 2 - cam.y * k}px) scale(${k}) rotate(${bank}deg)`;
      const a = Math.round(goal);
      if (a !== lastActive) setActive((lastActive = a));
      const l = goal > 0.35;
      if (l !== lastLamp) setLamp((lastLamp = l));
      if (Math.abs(tx - cam.x) + Math.abs(ty - cam.y) > 0.3 || Math.abs(cam.vx) + Math.abs(cam.vy) > 0.3 || Math.abs(tz - cam.z) > 1e-3) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const src: EventTarget = page ? window : (scroller ?? window);
    src.addEventListener("scroll", kick, { passive: true });
    const ro = new ResizeObserver(kick);
    ro.observe(view);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      src.removeEventListener("scroll", kick);
    };
  }, [animated, page, n]);

  const clue = clues[Math.min(active, n - 1)];

  const desk = (
    <div ref={sceneRef} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: W, height: H, background: WOOD }}>
      {/* coffee rings */}
      <div className="absolute left-[1180px] top-[90px] h-[150px] w-[150px] rounded-full border-[6px] border-[#2a170b]/50 blur-[1px]" />
      <div className="absolute left-[1240px] top-[130px] h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle,#1a0d05_55%,#e9e4da_57%,#e9e4da_66%,#b8b2a6_70%,transparent_72%)] shadow-[0_8px_20px_rgba(0,0,0,.6)]" />

      {/* A: case file */}
      <div className="gx-ed-file absolute left-[160px] top-[150px] h-[330px] w-[460px] -rotate-[4deg]">
        <div className="absolute -top-6 left-6 h-10 w-36 rounded-t-md bg-[#c9a66b]" />
        <div className="absolute inset-0 rounded-sm bg-gradient-to-br from-[#d9b97c] to-[#b8955a] shadow-[0_14px_30px_rgba(0,0,0,.6)]" />
        <div className="gx-ed-paper absolute left-8 top-8 h-[270px] w-[390px] rotate-[2deg] bg-[#f1ece0] p-6 shadow-md">
          <p className="font-mono text-[13px] font-bold tracking-widest text-[#222]">{caseName}</p>
          <div className="mt-4 space-y-2">
            {[90, 75, 82, 60, 88, 70, 50].map((w, i) => (
              <div key={i} className="h-[5px] rounded bg-[#3a3a3a]/60" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-5 flex gap-3 font-mono text-[11px] text-[#333]">
            <span className="line-through decoration-[#c0161b] decoration-2">V. MORANE</span>
            <span>E. KASPAR</span>
            <span className="rounded-full border-2 border-[#c0161b] px-1">L. DUVAL</span>
          </div>
          <button
            type="button"
            key={stamp}
            onClick={() => setStamp((v) => v + 1)}
            aria-label="Stamp the file"
            className={`absolute bottom-6 right-6 -rotate-[14deg] cursor-pointer border-[3px] border-[#b3141a] px-3 py-1 font-mono text-lg font-black tracking-[0.2em] text-[#b3141a] opacity-80 mix-blend-multiply outline-none ${stamp ? "gx-ed-stamp" : ""}`}
          >
            CONFIDENTIAL
          </button>
        </div>
        <div className="absolute left-[300px] top-2 h-12 w-4 rounded-full border-[3px] border-[#9aa0a6]" />
      </div>

      {/* B: polaroids */}
      <Polaroid x={720} y={130} r={-8} caption="Fri, 11:40pm" tint="#5a6b7a" note="Left the bar alone. Umbrella, no rain." />
      <Polaroid x={860} y={160} r={5} caption="Pier 9?" tint="#6b5a48" circled note="Same man. Same coat. He KNEW we were watching." />
      <Polaroid x={1000} y={120} r={-3} caption="Same coat" tint="#4a5a4f" note="Ask the harbour master about the 3am boat." />

      {/* C: map + pins */}
      <div className="absolute left-[1000px] top-[400px] h-[330px] w-[480px] rotate-[3deg] bg-[#e7dfc8] shadow-[0_14px_30px_rgba(0,0,0,.55)]">
        <svg viewBox="0 0 480 330" className="h-full w-full">
          <rect width="480" height="330" fill="#e7dfc8" />
          <path d="M0 250 C120 230 160 300 300 280 S440 240 480 260 V330 H0Z" fill="#a9c1c9" />
          <g stroke="#b9ab8a" strokeWidth="6" fill="none">
            <path d="M0 60 H480 M0 150 H480 M80 0 V330 M210 0 V330 M350 0 V330" />
          </g>
          <g stroke="#cfc3a6" strokeWidth="2" fill="none">
            <path d="M0 105 H480 M0 200 H480 M145 0 V330 M280 0 V330 M420 0 V330" />
          </g>
          <text x="300" y="312" fontFamily="serif" fontSize="14" fill="#4a6670" fontStyle="italic">harbour</text>
        </svg>
      </div>
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={W} height={H}>
        <g key={active === 3 ? "draw" : "idle"} stroke="#b5121b" strokeWidth="2.5" fill="none" opacity=".9">
          {["M935 260 Q1050 420 1130 470", "M795 240 Q1000 520 1290 650", "M1075 230 Q1200 400 1300 520", "M560 300 Q860 520 1130 470"].map((d, i) => (
            <path key={i} d={d} className="gx-ed-str" data-draw={active === 3} style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </g>
        {[[1130, 470], [1290, 650], [1300, 520], [935, 258], [795, 238], [1075, 228], [560, 300]].map(([x, y], i) => (
          <g key={i} className="gx-ed-pin pointer-events-auto cursor-pointer">
            <circle cx={x} cy={y + 3} r="9" fill="#000" opacity=".35" />
            <circle cx={x} cy={y} r="8" fill="#d0141c" />
            <circle cx={x - 2.5} cy={y - 2.5} r="2.5" fill="#ff9a9a" />
          </g>
        ))}
      </svg>

      {/* D: fingerprint card — drag the magnifier, double-click to zoom */}
      <div className="absolute left-[400px] top-[600px] h-[220px] w-[260px] -rotate-[6deg] bg-[#efe9dc] shadow-[0_10px_24px_rgba(0,0,0,.5)]">
        <p className="absolute left-3 top-2 font-mono text-[10px] tracking-widest text-[#555]">PRINT CARD · L. THUMB</p>
        <p className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-[#8a8070]">drag the lens · double-click to zoom</p>
        <Fingerprint size={90} className="absolute left-[85px] top-[50px]" />
        <div
          role="button"
          tabIndex={0}
          aria-label={`Magnifying glass (${zoom}× zoom): drag or use arrow keys to move, Enter to zoom`}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (!d || d.id !== e.pointerId) return;
            // screen delta → scene px (undo the camera scale and the card's -6° turn)
            const k = kRef.current || 1;
            const dx = (e.clientX - d.x) / k, dy = (e.clientY - d.y) / k;
            const c = Math.cos(0.1047), sn = Math.sin(0.1047);
            d.x = e.clientX;
            d.y = e.clientY;
            setLens((l) => ({ x: Math.max(0, Math.min(260, l.x + dx * c + dy * sn)), y: Math.max(0, Math.min(220, l.y - dx * sn + dy * c)) }));
          }}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
          onDoubleClick={() => setZoom((z) => (z > 3 ? 2.2 : 3.5))}
          onKeyDown={(e) => {
            const step = 12;
            if (e.key === "Enter") setZoom((z) => (z > 3 ? 2.2 : 3.5));
            else if (e.key.startsWith("Arrow")) {
              e.preventDefault();
              setLens((l) => ({
                x: Math.max(0, Math.min(260, l.x + (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0))),
                y: Math.max(0, Math.min(220, l.y + (e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0))),
              }));
            }
          }}
          className="absolute h-[190px] w-[190px] cursor-grab touch-none rounded-full outline-none active:cursor-grabbing focus-visible:ring-4 focus-visible:ring-[#d0141c]/60"
          style={{ left: lens.x - 95, top: lens.y - 95 }}
        >
          <div className="pointer-events-none absolute left-[150px] top-[150px] h-[130px] w-[30px] origin-top -rotate-[40deg] rounded-full bg-gradient-to-r from-[#2a1a10] via-[#6a4428] to-[#2a1a10] shadow-[0_10px_20px_rgba(0,0,0,.6)]" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full border-[10px] border-[#b08a3e] bg-[#efe9dc] shadow-[0_18px_30px_rgba(0,0,0,.6),inset_0_0_20px_rgba(0,0,0,.25)]">
            <div
              className="absolute h-[220px] w-[260px] origin-top-left transition-transform duration-300"
              style={{ left: 85 - lens.x * zoom, top: 85 - lens.y * zoom, transform: `scale(${zoom})` }}
            >
              <p className="absolute left-3 top-2 font-mono text-[10px] tracking-widest text-[#555]">PRINT CARD · L. THUMB</p>
              <Fingerprint size={90} className="absolute left-[85px] top-[50px]" />
            </div>
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.55),transparent_35%),radial-gradient(circle,transparent_60%,rgba(0,0,0,.18))]" />
          </div>
        </div>
      </div>

      {/* E: ransom note */}
      <div className="absolute left-[860px] top-[740px] h-[180px] w-[360px] rotate-[4deg] bg-[#f4f1ea] p-5 shadow-[0_12px_26px_rgba(0,0,0,.55)]">
        <div className="flex flex-wrap gap-1">
          {"YOU'RE NEXT".split("").map((ch, i) =>
            ch === " " ? (
              <span key={i} className="w-4" />
            ) : (
              <span
                key={`${i}-${active === 5}`}
                className="gx-ed-letter inline-block cursor-default px-1 shadow-sm"
                data-paste={active === 5}
                style={{
                  "--r": `${((i * 13) % 14) - 7}deg`,
                  "--r2": `${((i * 29) % 40) - 20}deg`,
                  "--dl": `${i * 0.09}s`,
                  background: ["#fff", "#111", "#e8d9b0", "#fff", "#c33", "#fff"][i % 6],
                  color: ["#111", "#fff", "#222", "#a11", "#fff", "#111"][i % 6],
                  fontFamily: ["Georgia,serif", "Impact,sans-serif", "Courier New,monospace", "Times New Roman,serif"][i % 4],
                  fontSize: 30 + ((i * 7) % 16),
                  fontWeight: i % 2 ? 900 : 400,
                } as React.CSSProperties}
              >
                {ch}
              </span>
            ),
          )}
        </div>
        <p className="mt-4 font-mono text-[11px] text-[#444]">— delivered 6:02 am, no stamp</p>
      </div>

      {/* pen + matches */}
      <div className="absolute left-[700px] top-[560px] h-[10px] w-[220px] rotate-[24deg] rounded-full bg-gradient-to-b from-[#3a3a3a] via-[#111] to-[#000] shadow-[0_6px_10px_rgba(0,0,0,.6)]" />
      <div className="absolute left-[1380px] top-[300px] h-[70px] w-[110px] -rotate-[12deg] rounded-sm bg-[#8e1c17] shadow-[0_8px_16px_rgba(0,0,0,.6)]">
        <p className="mt-6 text-center font-serif text-[11px] font-bold tracking-widest text-[#f0d8a0]">HOTEL NOIR</p>
      </div>
    </div>
  );

  const view = (
    <div ref={viewRef} className="absolute inset-0 overflow-hidden bg-[#0a0705]">
      {desk}
      {/* moonlight through blinds (lamp off) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: lamp ? 0 : 1,
          background:
            "repeating-linear-gradient(-28deg, rgba(120,150,200,.16) 0 26px, transparent 26px 52px), radial-gradient(ellipse at 70% 30%, rgba(0,0,0,.35), rgba(0,0,0,.92) 70%)",
          mixBlendMode: "normal",
        }}
      />
      {/* warm lamp pool (lamp on) */}
      <div
        aria-hidden
        className="gx-ed-warm pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: lamp ? 1 : 0,
          background: "radial-gradient(ellipse 55% 60% at 50% 48%, rgba(255,200,120,.12), rgba(10,6,3,.25) 45%, rgba(4,2,1,.88) 85%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,.85)]" />
      {/* exhibit card */}
      <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-10 sm:right-auto sm:max-w-sm">
        <div key={active} className="gx-ed-card rotate-[-1deg] bg-[#f3eee2] p-4 shadow-[0_14px_30px_rgba(0,0,0,.6)]">
          {clue?.exhibit && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#b3141a]">{clue.exhibit}</p>}
          <h3 className="mt-1 font-mono text-xl font-bold leading-tight text-[#1a1a1a]">{clue?.title}</h3>
          {clue?.body && <p className="mt-1 font-mono text-[12px] leading-relaxed text-[#444]">{clue.body}</p>}
        </div>
      </div>
      <nav aria-label="Clues" className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1">
        {clues.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to ${c.exhibit ?? ""} ${c.title}`}
            aria-current={active === i ? "step" : undefined}
            onClick={() => {
              const sc = scrollRef.current;
              if (page) {
                const r = rootRef.current?.getBoundingClientRect();
                if (r) window.scrollTo({ top: window.scrollY + r.top + i * window.innerHeight, behavior: "smooth" });
              } else if (sc) sc.scrollTo({ top: i * sc.clientHeight, behavior: "smooth" });
            }}
            className="grid h-5 w-5 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className={`h-2 w-2 rounded-full transition-all ${active === i ? "scale-125 bg-[#d0141c]" : "bg-white/30 hover:bg-white/60"}`} />
          </button>
        ))}
      </nav>
    </div>
  );

  const steps = clues.map((c, i) => (
    <section key={i} className={page ? "h-screen" : "h-[100cqh] snap-start snap-always"}>
      <span className="sr-only">
        {c.exhibit} {c.title} {c.body}
      </span>
    </section>
  ));

  if (page) {
    return (
      <div ref={rootRef} data-lamp={lamp} data-still={still} className={`gx-ed relative ${className}`} style={{ height: `${n * 100}vh` }}>
        <style>{css}</style>
        <div className="sticky top-0 h-screen w-full">{view}</div>
        <div className="pointer-events-none relative" style={{ marginTop: "-100vh" }}>
          {steps}
        </div>
      </div>
    );
  }
  return (
    <div ref={rootRef} data-lamp={lamp} data-still={still} className={`gx-ed relative h-full min-h-[360px] w-full overflow-hidden ${className}`}>
      <style>{css}</style>
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scroll to investigate the desk"
        className="absolute inset-0 snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth [container-type:size] [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
      >
        <div className="sticky top-0 h-full w-full">{view}</div>
        <div className="pointer-events-none relative" style={{ marginTop: "-100cqh" }}>
          {steps}
        </div>
      </div>
    </div>
  );
}

export default EvidenceDesk;
