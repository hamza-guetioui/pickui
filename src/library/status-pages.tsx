"use client";

import * as React from "react";

/**
 * StatusPages — a starter kit for every "something went wrong" page, each
 * with its own interactive scene, sharing one header and footer so you can
 * see the full page layout:
 *   404 — a torn "404" you can drag back together (it still doesn't exist)
 *   500 — a server rack melting down; flip the safety cover, hit RESET
 *   503 — maintenance: a crane lowers "BACK SOON" letter by letter
 *   offline — drag the cable plug into the socket to reconnect
 *   403 — a vault door with a combination dial and a laser grid
 * Template · zero dependencies · respects prefers-reduced-motion.
 */

export type StatusKind = "404" | "500" | "503" | "offline" | "403";

export type StatusPagesProps = {
  status?: StatusKind;
  brand?: string;
  homeHref?: string;
  /** false = scenes without idle motion (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-sp-float{50%{transform:translateY(-8px) rotate(var(--r))}}
@keyframes gx-sp-blink{50%{opacity:.15}}
@keyframes gx-sp-smoke{0%{transform:translate(0,0) scale(.6);opacity:0}20%{opacity:.5}100%{transform:translate(var(--dx),-160px) scale(2.2);opacity:0}}
@keyframes gx-sp-drop{0%{transform:translateY(-220px)}70%{transform:translateY(6px)}100%{transform:translateY(0)}}
@keyframes gx-sp-swing{50%{transform:rotate(4deg)}}
@keyframes gx-sp-laser{0%,100%{transform:translateY(0)}50%{transform:translateY(120px)}}
@keyframes gx-sp-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes gx-sp-spark{to{transform:translate(var(--dx),var(--dy));opacity:0}}
.gx-sp[data-animated="true"] .gx-sp-float{animation:gx-sp-float 5s ease-in-out infinite}
.gx-sp[data-animated="true"] .gx-sp-blink{animation:gx-sp-blink .9s steps(1) infinite}
.gx-sp[data-animated="true"] .gx-sp-smoke{animation:gx-sp-smoke 3.2s ease-out infinite}
.gx-sp[data-animated="true"] .gx-sp-swing{animation:gx-sp-swing 3s ease-in-out infinite;transform-origin:top center}
.gx-sp[data-animated="true"] .gx-sp-laser{animation:gx-sp-laser 3s ease-in-out infinite}
.gx-sp-drop{animation:gx-sp-drop .9s cubic-bezier(.3,1.3,.5,1) both}
.gx-sp-shake{animation:gx-sp-shake .4s}
.gx-sp-spark{animation:gx-sp-spark .6s ease-out forwards}
@media (prefers-reduced-motion:reduce){.gx-sp *{animation:none!important}}
`;

/* ── shared layout ───────────────────────────────────────────────────── */
function Shell({ brand, children, code }: { brand: string; children: React.ReactNode; code: string }) {
  return (
    <div className="flex h-full min-h-[600px] w-full flex-col bg-[#08080a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <a href="#" className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-xs font-black text-black">{brand[0]}</span>
          {brand}
        </a>
        <nav aria-label="Main" className="hidden gap-6 text-sm text-white/55 sm:flex">
          <a href="#" className="hover:text-white">Product</a>
          <a href="#" className="hover:text-white">Pricing</a>
          <a href="#" className="hover:text-white">Docs</a>
        </nav>
        <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-white/50">HTTP {code}</span>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-3 text-xs text-white/40">
        <span>© {brand}</span>
        <span className="flex gap-4">
          <a href="#" className="hover:text-white">Status</a>
          <a href="#" className="hover:text-white">Support</a>
        </span>
      </footer>
    </div>
  );
}

function Actions({ home, retry, onRetry }: { home: string; retry?: string; onRetry?: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <a href={home} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-white/85">
        Back to home
      </a>
      {retry && (
        <button type="button" onClick={onRetry ?? (() => window.location.reload())} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">
          {retry}
        </button>
      )}
    </div>
  );
}

/* ── 404: torn paper ─────────────────────────────────────────────────── */
function NotFound({ home }: { home: string }) {
  const [x, setX] = React.useState(70);
  const [fixed, setFixed] = React.useState(false);
  const start = React.useRef<{ px: number; x: number } | null>(null);
  const half = (side: 0 | 1) => (
    <div
      className="gx-sp-float relative grid h-44 w-36 place-items-center overflow-hidden bg-[#f4efe3] font-black text-[#111] shadow-[0_20px_30px_-10px_rgba(0,0,0,.7)] sm:h-56 sm:w-48"
      style={{
        clipPath: side ? "polygon(10% 0,100% 0,100% 100%,6% 100%,14% 86%,4% 70%,12% 52%,3% 36%,11% 18%)" : "polygon(0 0,90% 0,82% 18%,93% 36%,84% 52%,92% 70%,82% 86%,90% 100%,0 100%)",
        backgroundImage: "repeating-linear-gradient(transparent 0 23px, rgba(80,120,200,.18) 23px 24px)",
        "--r": side ? "3deg" : "-3deg",
      } as React.CSSProperties}
    >
      <span className="text-[5.5rem] leading-none sm:text-[7rem]" style={{ transform: `translateX(${side ? "-48%" : "48%"})` }}>
        404
      </span>
    </div>
  );
  return (
    <>
      <div
        className="flex touch-none select-none items-center"
        role="img"
        aria-label="A torn page that says 404. Drag the right half back."
        onPointerMove={(e) => {
          if (!start.current || fixed) return;
          const nx = Math.max(0, Math.min(140, start.current.x + (e.clientX - start.current.px)));
          setX(nx);
          if (nx < 6) setFixed(true);
        }}
        onPointerUp={() => (start.current = null)}
      >
        {half(0)}
        <div
          className="cursor-grab active:cursor-grabbing"
          style={{ transform: `translateX(${fixed ? -14 : x - 14}px) rotate(${fixed ? 0 : x / 12}deg)`, transition: start.current ? "none" : "transform .4s cubic-bezier(.3,1.4,.5,1)" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = { px: e.clientX, x };
          }}
        >
          {half(1)}
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-black tracking-tight">{fixed ? "Taped it back. Still lost." : "This page got torn out."}</h1>
      <p className="mt-2 max-w-sm text-white/55">{fixed ? "Nice repair — but the page you wanted doesn’t exist." : "Drag the right half back if you like. Or head home."}</p>
      <Actions home={home} />
    </>
  );
}

/* ── 500: meltdown + reset ───────────────────────────────────────────── */
function ServerError({ home }: { home: string }) {
  const [cover, setCover] = React.useState(false);
  const [boot, setBoot] = React.useState<"down" | "booting" | "up">("down");
  const press = () => {
    if (!cover || boot !== "down") return;
    setBoot("booting");
    window.setTimeout(() => setBoot("up"), 2000);
  };
  return (
    <>
      <div className="relative">
        {boot === "down" &&
          [0, 1, 2, 3].map((i) => (
            <span key={i} aria-hidden className="gx-sp-smoke absolute left-1/2 top-0 h-10 w-10 rounded-full bg-neutral-500/40 blur-md" style={{ "--dx": `${(i - 1.5) * 26}px`, animationDelay: `${i * 0.8}s` } as React.CSSProperties} />
          ))}
        <div className="w-56 rounded-lg border border-white/10 bg-gradient-to-b from-[#26262b] to-[#151518] p-2 shadow-[0_24px_40px_-14px_rgba(0,0,0,.9)]" aria-hidden>
          {Array.from({ length: 5 }, (_, r) => (
            <div key={r} className="mb-1.5 flex h-7 items-center gap-1.5 rounded bg-black/50 px-2 last:mb-0">
              {Array.from({ length: 8 }, (_, k) => {
                const on = boot === "up" || (boot === "booting" && (r * 8 + k) % 3 === 0);
                return (
                  <span
                    key={k}
                    className={`h-1.5 w-1.5 rounded-full ${boot === "down" && (r + k) % 3 === 0 ? "gx-sp-blink" : ""}`}
                    style={{ background: on ? "#4ade80" : boot === "down" ? "#ef4444" : "#3f3f46", boxShadow: on ? "0 0 6px #4ade80" : boot === "down" ? "0 0 6px #ef4444" : undefined, transitionDelay: `${(r * 8 + k) * 30}ms` }}
                  />
                );
              })}
              <span className="ml-auto h-1 w-10 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-black tracking-tight">{boot === "up" ? "We’re back up." : "Our server had a meltdown."}</h1>
      <p className="mt-2 max-w-sm text-white/55">
        {boot === "up" ? "Thanks for your patience. Try that again." : "It’s not you, it’s us. Flip the safety cover and hit reset — or just retry."}
      </p>
      {boot !== "up" && (
        <div className="mt-6 flex items-center gap-4 [perspective:400px]">
          <div className="relative h-16 w-16">
            <button
              type="button"
              onClick={press}
              disabled={!cover || boot !== "down"}
              aria-label="Reset button"
              className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff6b6b,#b91c1c)] font-mono text-[9px] font-black text-white shadow-[0_6px_0_#7f1d1d] transition active:translate-y-1 active:shadow-[0_2px_0_#7f1d1d] disabled:opacity-80"
            >
              {boot === "booting" ? "…" : "RESET"}
            </button>
            <button
              type="button"
              onClick={() => setCover((c) => !c)}
              aria-pressed={cover}
              aria-label={cover ? "Close the safety cover" : "Open the safety cover"}
              className="absolute -inset-1 origin-top rounded-xl border border-yellow-300/60 bg-yellow-300/20 backdrop-blur-[1px] transition-transform duration-500"
              style={{ transform: cover ? "rotateX(110deg)" : "none", backgroundImage: "repeating-linear-gradient(45deg, rgba(250,204,21,.35) 0 6px, rgba(0,0,0,.4) 6px 12px)" }}
            />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{cover ? "armed" : "safety on"}</span>
        </div>
      )}
      <Actions home={home} retry="Try again" />
    </>
  );
}

/* ── 503: crane maintenance ──────────────────────────────────────────── */
function Maintenance({ home, animated }: { home: string; animated: boolean }) {
  const word = "BACK SOON";
  return (
    <>
      <div className="relative h-56 w-full max-w-md" aria-hidden>
        <div className="absolute left-2 top-0 h-full w-3 bg-[repeating-linear-gradient(0deg,#facc15_0_10px,#111_10px_20px)]" />
        <div className="absolute left-2 top-0 h-3 w-[90%] bg-[repeating-linear-gradient(90deg,#facc15_0_10px,#111_10px_20px)]" />
        <div className="gx-sp-swing absolute right-[18%] top-3 flex flex-col items-center">
          <span className="h-16 w-px bg-white/50" />
          <span className="h-3 w-5 rounded-b border-2 border-t-0 border-white/60" />
        </div>
        <div className="absolute bottom-6 left-8 right-4 flex justify-center gap-1">
          {[...word].map((ch, i) => (
            <span
              key={i}
              className={`grid h-12 w-9 place-items-center rounded-md text-2xl font-black ${ch === " " ? "" : "bg-[#facc15] text-black shadow-[0_6px_0_#a16207]"} ${animated ? "gx-sp-drop" : ""}`}
              style={{ animationDelay: `${0.3 + i * 0.25}s` }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#facc15_0_14px,#111_14px_28px)] opacity-80" />
      </div>
      <h1 className="mt-6 text-3xl font-black tracking-tight" aria-label="Back soon">
        Scheduled maintenance
      </h1>
      <p className="mt-2 max-w-sm text-white/55">We’re upgrading the engines. Expected back within the hour.</p>
      <Actions home={home} retry="Check status" />
    </>
  );
}

/* ── offline: plug it in ─────────────────────────────────────────────── */
function Offline({ home }: { home: string }) {
  const [pos, setPos] = React.useState({ x: -90, y: 60 });
  const [online, setOnline] = React.useState(false);
  const [sparks, setSparks] = React.useState(0);
  const drag = React.useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  React.useEffect(() => {
    const on = () => setOnline(true);
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);
  const plugged = online;
  return (
    <>
      <div className="relative h-48 w-80" aria-hidden>
        {/* socket */}
        <div className="absolute right-6 top-6 grid h-24 w-24 place-items-center rounded-2xl border border-white/15 bg-[#1a1a1d] shadow-inner">
          <div className="flex gap-3">
            <span className="h-6 w-2 rounded-sm bg-black" />
            <span className="h-6 w-2 rounded-sm bg-black" />
          </div>
          <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${plugged ? "bg-emerald-400 shadow-[0_0_8px_#4ade80]" : "gx-sp-blink bg-red-500"}`} />
        </div>
        {/* cable */}
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          <path d={`M -40 190 C 60 200, ${130 + pos.x} ${130 + pos.y}, ${150 + pos.x} ${54 + pos.y + 12}`} stroke="#3f3f46" strokeWidth="8" fill="none" strokeLinecap="round" />
        </svg>
        {/* plug */}
        <div
          className="absolute h-16 w-12 cursor-grab touch-none rounded-lg bg-gradient-to-b from-neutral-200 to-neutral-400 active:cursor-grabbing"
          style={{ left: 150 + pos.x - 24, top: 30 + pos.y, transition: drag.current ? "none" : "all .4s cubic-bezier(.3,1.4,.5,1)" }}
          onPointerDown={(e) => {
            if (plugged) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            setPos({ x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py });
          }}
          onPointerUp={() => {
            drag.current = null;
            // socket center ≈ x:+80, y:-6 relative to rest point
            if (Math.hypot(pos.x - 80, pos.y + 6) < 40) {
              setPos({ x: 80, y: -6 });
              setOnline(true);
              setSparks((s) => s + 1);
            } else setPos({ x: -90, y: 60 });
          }}
        >
          <span className="absolute -top-4 left-2.5 h-5 w-1.5 rounded-sm bg-neutral-300" />
          <span className="absolute -top-4 right-2.5 h-5 w-1.5 rounded-sm bg-neutral-300" />
        </div>
        {sparks > 0 &&
          Array.from({ length: 10 }, (_, i) => (
            <span key={`${sparks}-${i}`} className="gx-sp-spark absolute right-[66px] top-[52px] h-1.5 w-1.5 rounded-full bg-yellow-300" style={{ "--dx": `${Math.cos(i) * 50}px`, "--dy": `${Math.sin(i) * 50}px` } as React.CSSProperties} />
          ))}
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight" aria-live="polite">
        {plugged ? "Back online ⚡" : "You’re offline."}
      </h1>
      <p className="mt-2 max-w-sm text-white/55">{plugged ? "Connection restored. Pick up where you left off." : "Check your connection — or plug the cable back in."}</p>
      <Actions home={home} retry={plugged ? undefined : "Retry"} />
    </>
  );
}

/* ── 403: vault ──────────────────────────────────────────────────────── */
function Forbidden({ home }: { home: string }) {
  const [turns, setTurns] = React.useState(0);
  const [denied, setDenied] = React.useState(0);
  return (
    <>
      <div className="relative grid h-56 w-56 place-items-center" aria-hidden>
        <div className="absolute inset-0 rounded-full border-[10px] border-[#3a3a40] bg-[radial-gradient(circle_at_35%_30%,#4a4a52,#1b1b1e_70%)] shadow-[0_20px_40px_-10px_rgba(0,0,0,.9)]" />
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="absolute h-4 w-4 rounded-full bg-[#55555c] shadow-inner" style={{ transform: `rotate(${i * 45}deg) translateY(-92px)` }} />
        ))}
        <div className="relative grid h-28 w-28 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#d4d4d8,#71717a_70%)] transition-transform duration-700" style={{ transform: `rotate(${turns * 137}deg)` }}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="absolute h-2 w-0.5 bg-black/60" style={{ transform: `rotate(${i * 30}deg) translateY(-48px)` }} />
          ))}
          <span className="h-10 w-10 rounded-full bg-[#3f3f46] shadow-inner" />
        </div>
        <div className="pointer-events-none absolute -inset-6 overflow-hidden rounded-full">
          {[0, 1, 2].map((i) => (
            <span key={i} className="gx-sp-laser absolute left-0 right-0 h-px bg-red-500 shadow-[0_0_8px_#ef4444]" style={{ top: 20 + i * 18, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
      </div>
      <h1 key={denied} className={`mt-8 text-3xl font-black tracking-tight ${denied ? "gx-sp-shake text-red-400" : ""}`}>
        {denied ? "ACCESS DENIED" : "This vault is locked."}
      </h1>
      <p className="mt-2 max-w-sm text-white/55">You don’t have permission to view this page. Spinning the dial won’t help. (Try it.)</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setTurns((t) => t + 1);
            setDenied((d) => d + 1);
          }}
          className="rounded-full border border-red-400/40 px-5 py-2.5 text-sm text-red-300 hover:bg-red-400/10"
        >
          Spin the dial
        </button>
        <a href={home} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-white/85">
          Back to home
        </a>
        <a href="#" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">
          Request access
        </a>
      </div>
    </>
  );
}

export function StatusPages({ status = "404", brand = "Northwind", homeHref = "/", animated = true, className = "" }: StatusPagesProps) {
  return (
    <div className={`gx-sp h-full w-full ${className}`} data-animated={animated}>
      <style>{css}</style>
      <Shell brand={brand} code={status === "offline" ? "—" : status}>
        {status === "404" && <NotFound home={homeHref} />}
        {status === "500" && <ServerError home={homeHref} />}
        {status === "503" && <Maintenance home={homeHref} animated={animated} />}
        {status === "offline" && <Offline home={homeHref} />}
        {status === "403" && <Forbidden home={homeHref} />}
      </Shell>
    </div>
  );
}

export default StatusPages;
