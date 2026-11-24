"use client";

import * as React from "react";

/**
 * TicketTear — an event ticket whose stub you physically tear off: grab the
 * stub and pull it down, it hinges on the perforation, and past the tear
 * point it rips away and falls while an ink stamp slams onto the ticket.
 * Perfect for check-in flows, coupons, onboarding "you're in" moments.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type TicketTearProps = {
  event: string;
  /** Small line above the title. */
  kicker?: string;
  venue?: string;
  date?: string;
  seat?: string;
  /** Printed on the stub + used to draw the barcode. */
  code?: string;
  /** Stamp text after tearing. */
  stamp?: string;
  accent?: string;
  /** Fired once the stub is torn. */
  onTear?: () => void;
  /** Show a reset link after tearing (default true). */
  resettable?: boolean;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const TEAR_ANGLE = 20;

const css = `
@keyframes gx-tt-stamp{0%{transform:scale(2.4) rotate(-4deg);opacity:0}60%{transform:scale(.92) rotate(-14deg);opacity:1}100%{transform:scale(1) rotate(-12deg);opacity:1}}
@keyframes gx-tt-shake{0%,100%{transform:none}25%{transform:translate(-2px,1px)}50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,0)}}
.gx-tt-stamp{animation:gx-tt-stamp .45s cubic-bezier(.2,1.4,.4,1) both}
.gx-tt-torn .gx-tt-main{animation:gx-tt-shake .25s .3s}
.gx-tt[data-animated="false"] *{animation:none!important}
@media (prefers-reduced-motion:reduce){.gx-tt *{animation:none!important;transition:none!important}}
`;

function bars(code: string) {
  let h = 0;
  for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: 34 }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return { w: 1 + (h % 3), gap: 1 + ((h >> 3) % 2), key: i };
  });
}

export function TicketTear({
  event,
  kicker = "Admit one",
  venue = "Main Stage",
  date = "Sat · 21:00",
  seat = "GA",
  code = "GX-0427",
  stamp = "Admitted",
  accent = "#f97316",
  onTear,
  resettable = true,
  animated = true,
  className = "",
}: TicketTearProps) {
  const [angle, setAngle] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [torn, setTorn] = React.useState(false);
  const start = React.useRef(0);

  const tear = () => {
    setDragging(false);
    setTorn(true);
    onTear?.();
  };

  const notch = (side: "left" | "right") =>
    `radial-gradient(circle at ${side === "right" ? "100%" : "0"} 0, transparent 13px, #000 13.5px) top/100% 51% no-repeat, radial-gradient(circle at ${side === "right" ? "100%" : "0"} 100%, transparent 13px, #000 13.5px) bottom/100% 51% no-repeat`;
  const zig =
    "linear-gradient(#000,#000) left/calc(100% - 6px) 100% no-repeat, conic-gradient(from -135deg at right, transparent 90deg, #000 0) right/6px 12px repeat-y";

  return (
    <div className={`gx-tt ${torn ? "gx-tt-torn" : ""} relative w-full max-w-[480px] select-none ${className}`} data-animated={animated}>
      <style>{css}</style>
      <div className="flex h-[176px] drop-shadow-[0_18px_30px_rgba(0,0,0,.55)]">
        {/* main */}
        <div
          className="gx-tt-main relative flex-1 overflow-hidden rounded-l-2xl bg-[#f6f1e7] p-5 text-neutral-900"
          style={{ WebkitMask: torn ? zig : notch("right"), mask: torn ? zig : notch("right") }}
        >
          <div className="absolute inset-y-0 left-0 w-2" style={{ background: accent }} />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
            {kicker}
          </p>
          <h3 className="mt-1 text-2xl font-black leading-none tracking-tight">{event}</h3>
          <dl className="mt-5 grid grid-cols-3 gap-3 text-[11px]">
            {[
              ["Venue", venue],
              ["Date", date],
              ["Seat", seat],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{k}</dt>
                <dd className="mt-0.5 font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          {torn && (
            <div
              className="gx-tt-stamp pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 rounded-md border-[3px] px-3 py-1 font-mono text-lg font-black uppercase tracking-[0.2em] opacity-80 mix-blend-multiply"
              style={{ color: accent, borderColor: accent }}
              role="status"
            >
              {stamp}
            </div>
          )}
        </div>

        {/* perforation */}
        <div aria-hidden className="relative w-0">
          <div className="absolute inset-y-4 -left-px border-l-2 border-dashed border-neutral-400/70" />
        </div>

        {/* stub */}
        <button
          type="button"
          aria-label={torn ? "Ticket stub torn off" : "Tear off the ticket stub"}
          disabled={torn}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = e.clientY;
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            setAngle(Math.max(-3, Math.min(32, (e.clientY - start.current) * 0.32)));
          }}
          onPointerUp={() => {
            if (!dragging) return;
            if (angle > TEAR_ANGLE) tear();
            else {
              setDragging(false);
              setAngle(0);
            }
          }}
          onPointerCancel={() => {
            setDragging(false);
            setAngle(0);
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !torn) {
              e.preventDefault();
              tear();
            }
          }}
          className="relative w-[118px] origin-top-left cursor-grab touch-none rounded-r-2xl bg-[#f6f1e7] p-3 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black active:cursor-grabbing"
          style={{
            WebkitMask: notch("left"),
            mask: notch("left"),
            transform: torn
              ? animated
                ? "translate(60px, 340px) rotate(70deg)"
                : "translate(24px, 0)"
              : `rotate(${angle}deg)`,
            opacity: torn ? 0 : 1,
            transition: dragging ? "none" : torn ? "transform .9s cubic-bezier(.5,0,.75,0), opacity .9s ease-in" : "transform .5s cubic-bezier(.3,1.6,.5,1)",
          }}
        >
          <span className="flex h-full flex-col items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">Pull ↓</span>
            <span aria-hidden className="flex h-[70px] items-stretch">
              {bars(code).map((b) => (
                <span key={b.key} className="bg-neutral-900" style={{ width: b.w, marginRight: b.gap }} />
              ))}
            </span>
            <span className="font-mono text-[11px] font-black tracking-wider">{code}</span>
          </span>
        </button>
      </div>

      {torn && resettable && (
        <button
          type="button"
          onClick={() => {
            setTorn(false);
            setAngle(0);
          }}
          className="mt-4 font-mono text-[11px] uppercase tracking-widest text-white/50 underline-offset-4 hover:text-white hover:underline"
        >
          Print a new ticket
        </button>
      )}
    </div>
  );
}

export default TicketTear;
