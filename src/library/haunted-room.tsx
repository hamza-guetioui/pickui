"use client";

import * as React from "react";

/**
 * HauntedRoom — a pitch-black room with a bare bulb on a bead chain. Pull the
 * chain: the bulb swings, the light pool follows it across a stained wall,
 * and a message scrawls itself onto the plaster, stroke by stroke, then bleeds.
 * While it's on, the bulb flickers on its own; after every blackout the wall
 * says something new.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type HauntedRoomProps = {
  /** Messages written on the wall, one per blackout. */
  messages?: string[];
  /** Content lit under the writing (CTA, caption…). */
  children?: React.ReactNode;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
  /** Ink color of the writing. */
  ink?: string;
  /** false = no swing, flicker or blackouts. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-hr-draw{to{stroke-dashoffset:0}}
@keyframes gx-hr-fill{to{fill-opacity:.92}}
@keyframes gx-hr-drip{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
.gx-hr-text{stroke-dasharray:1600;stroke-dashoffset:1600;fill-opacity:0;animation:gx-hr-draw 2.4s cubic-bezier(.6,.05,.4,1) .15s forwards,gx-hr-fill 1.4s ease 2.2s forwards}
.gx-hr-scratch{stroke-dasharray:120;stroke-dashoffset:120;animation:gx-hr-draw .5s ease-out forwards}
.gx-hr-splat{opacity:0;animation:gx-hr-splat .12s ease-out forwards}
@keyframes gx-hr-splat{to{opacity:.9}}
.gx-hr-drip{transform-origin:top;transform:scaleY(0);animation:gx-hr-drip var(--t) cubic-bezier(.3,0,.2,1) var(--d) forwards}
.gx-hr[data-still="true"] .gx-hr-text,.gx-hr[data-still="true"] .gx-hr-scratch,.gx-hr[data-still="true"] .gx-hr-drip,.gx-hr[data-still="true"] .gx-hr-splat{animation:none;opacity:.9;stroke-dashoffset:0;fill-opacity:.92;transform:none}
`;

const DAMASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='96'%3E%3Cg fill='none' stroke='%23d8c8a0' stroke-width='1.4' opacity='.55'%3E%3Cpath d='M32 8c10 10 10 22 0 32c-10-10-10-22 0-32zM32 40c6 8 18 8 22 0M32 40c-6 8-18 8-22 0M32 56c10 10 10 22 0 32c-10-10-10-22 0-32z'/%3E%3Ccircle cx='0' cy='48' r='4'/%3E%3Ccircle cx='64' cy='48' r='4'/%3E%3C/g%3E%3C/svg%3E\")";

const WALL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .38 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CORD = 120;

type RoomObject = { id: string; x: number; w: number; h: number; vb: string; rock?: boolean; shape: React.ReactNode; art: React.ReactNode };

const CHAIR =
  "M18 6h8v74h-8zM62 6h8v74h-8zM20 14h48v6H20zM20 34h48v4H20zM28 20h3v14h-3zM40 20h3v14h-3zM52 20h3v14h-3zM12 78h70v8H12zM16 86h6v32h-6zM70 86h6v32h-6zM2 118Q47 134 94 116l1 4Q47 140 0 122z";
const BEAR =
  "M30 22a14 14 0 1 1 28 0a14 14 0 1 1-28 0zM24 12a7 7 0 1 1 12 0a7 7 0 1 1-12 0zM52 12a7 7 0 1 1 12 0a7 7 0 1 1-12 0zM22 52c0-14 10-20 22-20s22 6 22 20v20H22zM10 50a8 8 0 0 1 14-4l4 16-12 4zM78 50a8 8 0 0 0-14-4l-4 16 12 4zM16 72a10 10 0 1 1 20 0v8H16zM52 72a10 10 0 1 1 20 0v8H52z";
const SUITCASE = "M8 20h84v62H8zM36 8h28v4H40v8h-4zM60 8h4v12h-4z";

const OBJECTS: RoomObject[] = [
  {
    id: "chair",
    x: 27,
    w: 110,
    h: 150,
    vb: "0 0 96 140",
    rock: true,
    shape: <path d={CHAIR} />,
    art: (
      <g>
        <path d={CHAIR} fill="#2b1a0f" />
        <path d="M19 6h2v74h-2zM63 6h2v74h-2zM14 79h66v2H14z" fill="#6a4a2c" opacity=".6" />
      </g>
    ),
  },
  {
    id: "bear",
    x: 70,
    w: 70,
    h: 64,
    vb: "0 0 88 80",
    shape: <path d={BEAR} transform="rotate(-10 44 60)" />,
    art: (
      <g transform="rotate(-10 44 60)">
        <path d={BEAR} fill="#5a3f26" />
        <circle cx="39" cy="20" r="2.4" fill="#0c0806" />
        <circle cx="38.3" cy="19.3" r=".7" fill="#fff" opacity=".7" />
        <path d="M49 18l4 4m0-4l-4 4" stroke="#0c0806" strokeWidth="1.2" />
        <path d="M40 28q4 3 8 0" stroke="#0c0806" strokeWidth="1" fill="none" />
        <path d="M44 40v22" stroke="#2c1d10" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M30 50c6 2 10 0 12-4" stroke="#c9b6a0" strokeWidth="1.2" fill="none" opacity=".6" />
      </g>
    ),
  },
  {
    id: "suitcase",
    x: 86,
    w: 92,
    h: 74,
    vb: "0 0 100 84",
    shape: <path d={SUITCASE} transform="rotate(4 50 82)" />,
    art: (
      <g transform="rotate(4 50 82)">
        <path d={SUITCASE} fill="#3b2516" />
        <rect x="8" y="20" width="84" height="62" fill="none" stroke="#1d120a" strokeWidth="2" />
        <rect x="20" y="20" width="5" height="62" fill="#6b4a2a" opacity=".7" />
        <rect x="75" y="20" width="5" height="62" fill="#6b4a2a" opacity=".7" />
        <rect x="46" y="22" width="8" height="6" fill="#a88a4a" />
        <path d="M30 50h20v12H30z" fill="#d8c8a0" opacity=".55" />
      </g>
    ),
  },
];


export function HauntedRoom({
  messages = ["GET OUT", "IT'S BEHIND YOU", "DON'T TURN IT OFF"],
  children,
  defaultOn = false,
  onChange,
  ink = "#7a0606",
  animated = true,
  className = "",
}: HauntedRoomProps) {
  const [on, setOn] = React.useState(defaultOn);
  const [msg, setMsg] = React.useState(0);
  const [level, setLevel] = React.useState(defaultOn ? 1 : 0);
  const [still, setStill] = React.useState(!animated);
  const uid = "gxhr" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const chainRef = React.useRef<SVGLineElement>(null);
  const handleRef = React.useRef<HTMLButtonElement>(null);
  const s = React.useRef({ th: 0, w: 0, r: 0, rv: 0, y: 0, vy: 0, drag: false, sy: 0, moved: 0, raf: 0 });
  const onRef = React.useRef(on);
  onRef.current = on;

  React.useEffect(() => {
    setStill(!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [animated]);

  // physics: bulb pendulum + chain spring; writes CSS vars, no re-render
  React.useEffect(() => {
    const st = s.current;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      st.w += (-9 * Math.sin(st.th) - 0.35 * st.w) * dt;
      st.th += st.w * dt;
      st.rv += (-11 * st.r - 0.5 * st.rv + 0.5 * st.w) * dt;
      st.r += st.rv * dt;
      if (!st.drag) {
        st.vy += (-160 * st.y - 9 * st.vy) * dt;
        st.y += st.vy * dt;
      }
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--th", `${(st.th * 180) / Math.PI}deg`);
        el.style.setProperty("--lx", `${50 + Math.sin(st.th) * 26}%`);
        el.style.setProperty("--bx", (50 + Math.sin(st.th) * 26).toFixed(2));
        el.style.setProperty("--rock", `${((st.r * 180) / Math.PI).toFixed(2)}deg`);
      }
      chainRef.current?.setAttribute("y2", String(CORD + st.y));
      if (handleRef.current) handleRef.current.style.transform = `translate(-50%, ${CORD + st.y - 6}px)`;
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(st.raf);
  }, []);

  const set = React.useCallback(
    (next: boolean) => {
      setOn(next);
      onChange?.(next);
      if (!next) {
        setLevel(0);
        return;
      }
      if (!still) s.current.w += 0.9;
      setMsg((m) => (m + 1) % messages.length);
      if (still) {
        setLevel(1);
        return;
      }
      // tungsten stutter on
      const seq = [0.85, 0.05, 0.6, 0.1, 1, 0.4, 1];
      seq.forEach((v, i) => window.setTimeout(() => onRef.current && setLevel(v), i * 70));
    },
    [onChange, still, messages.length],
  );

  // ambient flicker + blackouts that change the message
  React.useEffect(() => {
    if (!on || still) return;
    let alive = true;
    let tid = 0;
    const loop = () => {
      tid = window.setTimeout(() => {
        if (!alive) return;
        const blackout = Math.random() < 0.35;
        if (blackout) {
          setLevel(0);
          window.setTimeout(() => {
            if (!alive) return;
            setMsg((m) => (m + 1) % messages.length);
            s.current.w += (Math.random() - 0.5) * 0.6;
            setLevel(0.5);
            window.setTimeout(() => alive && setLevel(1), 90);
          }, 900 + Math.random() * 700);
        } else {
          setLevel(0.35);
          window.setTimeout(() => alive && setLevel(1), 60 + Math.random() * 90);
        }
        loop();
      }, 2200 + Math.random() * 4200);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(tid);
    };
  }, [on, still, messages.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = s.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.drag = true;
    st.sy = e.clientY - st.y;
    st.moved = 0;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = s.current;
    if (!st.drag) return;
    const ny = Math.max(-10, Math.min(70, e.clientY - st.sy));
    st.moved += Math.abs(ny - st.y);
    st.vy = (ny - st.y) * 60;
    st.y = ny;
  };
  const onPointerUp = () => {
    const st = s.current;
    if (!st.drag) return;
    st.drag = false;
    if (st.moved < 4) {
      st.vy = 420;
      set(!on);
    } else if (st.y > 34) set(!on);
  };

  const text = messages[msg] ?? "";
  const size = Math.min(150, 1300 / Math.max(4, text.length));
  const drips = React.useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: 120 + ((i * 97 + msg * 61) % 560),
        h: 18 + ((i * 41 + msg * 13) % 70),
        t: `${2.5 + (i % 4) * 0.8}s`,
        d: `${2.6 + (i % 5) * 0.35}s`,
      })),
    [msg],
  );
  const splatter = React.useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const k = i * 7919 + msg * 104729;
        const near = i < 14;
        return {
          x: 60 + ((k * 13) % 680),
          y: near ? 70 + ((k * 7) % 150) : 40 + ((k * 3) % 220),
          r: near ? 1.2 + ((k >> 3) % 30) / 10 : 0.8 + ((k >> 2) % 12) / 10,
          e: 1 + ((k >> 4) % 25) / 10,
          a: (k * 37) % 180,
        };
      }),
    [msg],
  );
  const lit = on ? level : 0;

  return (
    <div
      ref={rootRef}
      data-still={still}
      className={`gx-hr relative isolate h-[460px] w-full touch-none select-none overflow-hidden bg-[#0e0c0a] ${className}`}
      style={{ "--lx": "50%", "--bx": "50", "--th": "0deg", "--rock": "0deg" } as React.CSSProperties}
    >
      <style>{css}</style>

      {/* wall: faded damask paper over stained plaster */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[76%]"
        style={{
          backgroundImage: `radial-gradient(ellipse at 18% 85%, rgba(40,25,10,.6), transparent 45%), radial-gradient(ellipse at 88% 25%, rgba(30,20,8,.55), transparent 40%), linear-gradient(180deg,#5f5747,#4a4235 60%,#332c23), ${DAMASK}, ${WALL}`,
          backgroundBlendMode: "multiply, multiply, normal, soft-light, overlay",
          backgroundSize: "auto, auto, auto, 64px 96px, 240px 240px",
        }}
      />
      <svg aria-hidden className="absolute inset-x-0 top-0 h-[76%] w-full" viewBox="0 0 800 350" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}streak`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1e10" stopOpacity=".7" />
            <stop offset="1" stopColor="#2a1e10" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}mould`}>
            <stop offset="0" stopColor="#1b1a0e" stopOpacity=".9" />
            <stop offset="1" stopColor="#1b1a0e" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[120, 138, 520, 545, 690].map((x, i) => (
          <rect key={i} x={x} y="0" width={6 + (i % 3) * 5} height={90 + ((i * 47) % 120)} fill={`url(#${uid}streak)`} />
        ))}
        <ellipse cx="0" cy="0" rx="140" ry="70" fill={`url(#${uid}mould)`} />
        <ellipse cx="800" cy="350" rx="160" ry="80" fill={`url(#${uid}mould)`} />
        <ellipse cx="760" cy="10" rx="90" ry="40" fill={`url(#${uid}mould)`} />
        {/* ghost of a picture that used to hang here + its nail */}
        <rect x="585" y="70" width="110" height="140" fill="#6b604e" opacity=".35" />
        <rect x="585" y="70" width="110" height="140" fill="none" stroke="#2c241a" strokeOpacity=".35" strokeWidth="2" />
        <circle cx="640" cy="62" r="2.5" fill="#1a1510" />
        {/* crooked frame */}
        <g transform="rotate(-9 150 120)">
          <path d="M150 52 L112 78 M150 52 L188 78" stroke="#1a1510" strokeWidth="1.2" />
          <rect x="100" y="78" width="100" height="78" fill="#2a1d12" />
          <rect x="108" y="86" width="84" height="62" fill="#4b4436" />
          <path d="M120 140 Q150 100 180 140" fill="#2e2a22" />
          <circle cx="150" cy="104" r="9" fill="#2e2a22" />
          <path d="M112 90 L190 146" stroke="#0e0b08" strokeOpacity=".5" strokeWidth=".8" />
        </g>
        {/* cracks */}
        <g fill="none" stroke="#1c1610" strokeLinecap="round" strokeOpacity=".7">
          <path d="M420 0 L414 30 L426 52 L418 80 L430 104 L424 122" strokeWidth="1.6" />
          <path d="M426 52 L450 66 L462 64" strokeWidth="1" />
          <path d="M800 160 L770 172 L760 196 L736 204 L728 230" strokeWidth="1.4" />
          <path d="M760 196 L748 186" strokeWidth=".9" />
          <path d="M40 260 L70 248 L92 256 L110 240" strokeWidth="1.1" />
        </g>
        {/* peeling paper showing bare plaster */}
        <path d="M300 0 L346 0 L340 60 L322 92 L310 70 Z" fill="#8d8270" opacity=".55" />
        <path d="M322 92 L340 60 L352 74 Q336 96 322 92 Z" fill="#3a3226" opacity=".9" />
        <path d="M30 300 L96 296 L84 330 L40 336 Z" fill="#8d8270" opacity=".45" />
        {/* old light switch */}
        <rect x="520" y="96" width="22" height="34" rx="2" fill="#b9ad92" opacity=".55" />
        <rect x="528" y="106" width="6" height="12" rx="1" fill="#3a3226" opacity=".7" />
        {/* chair rail */}
        <rect x="0" y="248" width="800" height="5" fill="#2a2016" opacity=".8" />
        <rect x="0" y="248" width="800" height="1.5" fill="#fff" opacity=".06" />
      </svg>
      {/* floorboards */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[24%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0) 40%), repeating-linear-gradient(90deg, #2b1d12 0 70px, #24180e 70px 72px, #31221a 72px 150px, #1e140b 150px 152px), #23170e",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 bottom-[24%] h-3 bg-gradient-to-b from-[#2a2119] to-[#120d09] shadow-[0_-1px_0_rgba(255,255,255,.05)]" />


      {/* the writing */}
      <svg aria-hidden viewBox="0 0 800 300" className="absolute inset-x-0 top-[24%] mx-auto w-[92%] max-w-3xl overflow-visible">
        <defs>
          {/* paint on plaster: wobbly strokes, dry-brush gaps, soaked-in edges */}
          <filter id={`${uid}rough`} x="-5%" y="-10%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed={msg + 3} result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" result="wobble" />
            <feTurbulence type="fractalNoise" baseFrequency=".55 .12" numOctaves="3" seed={msg + 11} result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.45" result="dry" />
            <feComposite in="wobble" in2="dry" operator="in" result="paint0" />
            <feGaussianBlur in="paint0" stdDeviation=".4" result="paint" />
            {/* dried, darker rim around every stroke */}
            <feMorphology in="paint" operator="erode" radius="1.4" result="core" />
            <feComposite in="paint" in2="core" operator="out" result="rim" />
            <feFlood floodColor="#240101" floodOpacity=".9" />
            <feComposite in2="rim" operator="in" result="rimC" />
            {/* wet gloss lit by the bulb */}
            <feGaussianBlur in="paint" stdDeviation="1.8" result="bump" />
            <feSpecularLighting in="bump" surfaceScale="4" specularConstant=".55" specularExponent="26" lightingColor="#ffd6c4" result="spec">
              <fePointLight x="400" y="-160" z="240" />
            </feSpecularLighting>
            <feComposite in="spec" in2="core" operator="in" result="gloss" />
            <feMerge>
              <feMergeNode in="paint" />
              <feMergeNode in="rimC" />
              <feMergeNode in="gloss" />
            </feMerge>
          </filter>
        </defs>
        {on && (
          <g key={msg} filter={`url(#${uid}rough)`} opacity=".94">
            <text
              className="gx-hr-text"
              x="400"
              y="170"
              textAnchor="middle"
              fontFamily="'Brush Script MT','Segoe Print','Comic Sans MS',cursive"
              fontStyle="italic"
              fontWeight="900"
              fontSize={size}
              textLength={Math.min(720, text.length * 62)}
              lengthAdjust="spacingAndGlyphs"
              letterSpacing="2"
              fill={ink}
              stroke={ink}
              strokeWidth="3"
              strokeLinejoin="round"
            >
              {text}
            </text>
            {drips.map((d, i) => (
              <path
                key={i}
                className="gx-hr-drip"
                d={`M${d.x - (i % 3 ? 1.6 : 2.6)} 176 C${d.x - 1} ${176 + d.h * 0.5} ${d.x - 0.8} ${176 + d.h * 0.8} ${d.x - 1.1} ${176 + d.h} a${i % 3 ? 2.2 : 3.2} ${i % 3 ? 2.6 : 3.6} 0 1 0 2.2 0 C${d.x + 0.8} ${176 + d.h * 0.8} ${d.x + 1} ${176 + d.h * 0.5} ${d.x + (i % 3 ? 1.6 : 2.6)} 176 Z`}
                fill={ink}
                opacity=".9"
                style={{ "--t": d.t, "--d": d.d } as React.CSSProperties}
              />
            ))}
            {splatter.map((d, i) => (
              <ellipse key={`s${i}`} className="gx-hr-splat" cx={d.x} cy={d.y} rx={d.r * d.e} ry={d.r} transform={`rotate(${d.a} ${d.x} ${d.y})`} fill={ink} style={{ animationDelay: `${2.3 + (i % 5) * 0.08}s` }} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                className="gx-hr-scratch"
                x1={60 + i * 11}
                y1={250}
                x2={66 + i * 11}
                y2={290}
                stroke="#1c1612"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ animationDelay: `${3 + i * 0.25}s` }}
              />
            ))}
            <line className="gx-hr-scratch" x1="52" y1="262" x2="122" y2="278" stroke="#1c1612" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "4.4s" }} />
          </g>
        )}
      </svg>

      {/* long shadows thrown up the wall, over the writing */}
      {OBJECTS.map((o) => (
        <svg
          key={`sh-${o.id}`}
          aria-hidden
          viewBox={o.vb}
          className="pointer-events-none absolute bottom-[16%] origin-bottom overflow-visible blur-[3px]"
          style={{
            left: `${o.x}%`,
            width: o.w,
            height: o.h,
            marginLeft: -o.w / 2,
            opacity: 0.72,
            transform: `translateX(calc((${o.x} - var(--bx)) * 2px)) skewX(calc((var(--bx) - ${o.x}) * 1.1deg)) scale(1.5, 2.1)`,
          }}
        >
          <g fill="#050302" style={o.rock ? { transformOrigin: "50% 100%", transformBox: "fill-box", transform: "rotate(var(--rock))" } : undefined}>
            {o.shape}
          </g>
        </svg>
      ))}
      {/* the objects themselves */}
      {OBJECTS.map((o) => (
        <svg key={o.id} aria-hidden viewBox={o.vb} className="absolute bottom-[16%] overflow-visible" style={{ left: `${o.x}%`, width: o.w, height: o.h, marginLeft: -o.w / 2 }}>
          <g style={o.rock ? { transformOrigin: "50% 100%", transformBox: "fill-box", transform: "rotate(var(--rock))" } : undefined}>{o.art}</g>
        </svg>
      ))}

      {/* lit content */}
      {children && <div className="absolute inset-x-0 bottom-14 z-10 flex justify-center px-6 text-center">{children}</div>}

      {/* darkness: a light pool that follows the swinging bulb */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-75"
        style={{
          background: `radial-gradient(ellipse 75% 100% at var(--lx) 20%, rgba(0,0,0,0) 0%, rgba(5,3,2,.2) 40%, rgba(3,2,1,.82) 75%, #020101 100%)`,
          opacity: lit,
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[#020101] transition-opacity duration-75" style={{ opacity: 1 - lit }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light transition-opacity duration-75"
        style={{ background: "radial-gradient(ellipse 50% 60% at var(--lx) 14%, rgba(255,190,110,.55), transparent 70%)", opacity: lit }}
      />

      {/* bulb on its wire */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-30 h-[92px] w-0 origin-top" style={{ transform: "rotate(var(--th))" }}>
        <div className="absolute left-[-0.5px] top-0 h-[70px] w-px bg-[#1a1714]" />
        <div className="absolute left-[-5px] top-[66px] h-[9px] w-[10px] rounded-[2px] bg-gradient-to-r from-[#3b3b3b] via-[#8a8a8a] to-[#2b2b2b]" />
        <div
          onPointerDown={(e) => {
            if (still) return;
            const r = e.currentTarget.getBoundingClientRect();
            s.current.w += (e.clientX < r.left + r.width / 2 ? 1 : -1) * 1.4;
          }}
          title="Push the bulb"
          className="pointer-events-auto absolute left-[-10px] top-[74px] h-[24px] w-[20px] cursor-pointer rounded-[50%_50%_50%_50%/40%_40%_60%_60%] outline outline-[16px] outline-transparent transition-[background,box-shadow] duration-75"
          style={{
            background: lit > 0.05 ? "radial-gradient(circle at 50% 45%, #fff, #ffd9a0 40%, rgba(255,170,80,.6))" : "rgba(255,255,255,.07)",
            boxShadow: lit > 0.05 ? `0 0 ${18 * lit}px ${6 * lit}px rgba(255,190,110,.75), 0 0 ${80 * lit}px ${24 * lit}px rgba(255,150,60,.25)` : "inset 0 0 0 1px rgba(255,255,255,.12)",
          }}
        />
      </div>

      {/* bead chain switch */}
      <div className="absolute left-[calc(50%+46px)] top-0 z-30 h-0 w-0">
        <svg aria-hidden className="absolute left-0 top-0 overflow-visible" width="1" height="1">
          <line ref={chainRef} x1="0" y1="0" x2="0" y2={CORD} stroke="#8d8676" strokeWidth="2.2" strokeDasharray="0.1 4" strokeLinecap="round" />
        </svg>
        <button
          ref={handleRef}
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`Light: pull the chain to switch ${on ? "off" : "on"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              s.current.vy = 420;
              set(!on);
            }
          }}
          className="absolute left-0 top-0 h-5 w-3 cursor-grab rounded-full bg-gradient-to-b from-[#c9c2b0] to-[#5e584b] shadow-[0_3px_6px_rgba(0,0,0,.7)] outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
          style={{ transform: `translate(-50%, ${CORD - 6}px)` }}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {on ? `The light is on. Written on the wall: ${text}` : "The room is dark."}
      </p>
      {!on && (
        <p className="pointer-events-none absolute bottom-5 left-1/2 z-30 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">
          pull the chain
        </p>
      )}
    </div>
  );
}

export default HauntedRoom;
