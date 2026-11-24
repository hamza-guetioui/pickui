"use client";

import * as React from "react";

/**
 * PaperPlaneNewsletter — a newsletter signup where sending is literal: on
 * submit the card folds in half, folds its wings, becomes a paper plane and
 * flies off on a looping path, leaving a dashed trail. Then a thank-you.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type PaperPlaneNewsletterProps = {
  title?: string;
  sub?: string;
  /** Your subscribe call. Default: fake success. */
  onSubscribe?: (email: string) => Promise<void> | void;
  /** false = simple fade to success (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-pp-fold{0%{transform:none;border-radius:16px}35%{transform:scaleY(.5);border-radius:6px}70%{transform:scale(.18,.5) rotate(-10deg);border-radius:4px}100%{transform:scale(0);opacity:0}}
@keyframes gx-pp-fly{0%{offset-distance:0%;opacity:0;transform:scale(.4)}10%{opacity:1;transform:scale(1)}100%{offset-distance:100%;opacity:0;transform:scale(.6)}}
@keyframes gx-pp-trail{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
@keyframes gx-pp-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.gx-pp-fold{animation:gx-pp-fold .7s cubic-bezier(.6,0,.4,1) forwards}
.gx-pp-plane{offset-path:path("M 0 0 C 80 -60, 160 40, 220 -40 S 330 -170, 260 -170 S 200 -60, 520 -260");offset-rotate:auto;animation:gx-pp-fly 1.6s cubic-bezier(.4,0,.2,1) .55s forwards;opacity:0}
.gx-pp-trail{stroke-dasharray:6 8;animation:gx-pp-trail 1.6s linear .55s both}
.gx-pp-in{animation:gx-pp-in .5s ease 1.9s both}
@media (prefers-reduced-motion:reduce){.gx-pp-fold,.gx-pp-plane,.gx-pp-trail{animation:none;display:none}.gx-pp-in{animation:none}}
`;

export function PaperPlaneNewsletter({
  title = "Letters from the workshop",
  sub = "One email a month. New components, behind-the-scenes, no spam.",
  onSubscribe,
  animated = true,
  className = "",
}: PaperPlaneNewsletterProps) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "error" | "sent">("idle");
  const id = React.useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    await onSubscribe?.(email);
    setState("sent");
  };

  return (
    <section className={`relative grid min-h-[380px] w-full place-items-center overflow-hidden px-6 py-12 ${className}`}>
      <style>{css}</style>
      {state === "sent" && animated && (
        <svg aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-[22%] -translate-y-[30%] overflow-visible" viewBox="0 -300 700 400">
          <path className="gx-pp-trail" d="M 0 0 C 80 -60, 160 40, 220 -40 S 330 -170, 260 -170 S 200 -60, 520 -260" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        </svg>
      )}
      {state === "sent" && animated && (
        <span aria-hidden className="gx-pp-plane pointer-events-none absolute left-[calc(50%-14px)] top-[calc(50%+40px)]">
          <svg viewBox="0 0 32 32" className="h-8 w-8">
            <path d="M2 16 L30 4 L22 28 L15 19 Z" fill="#fff" />
            <path d="M15 19 L30 4 L12 17 Z" fill="#d4d4d8" />
          </svg>
        </span>
      )}

      {state !== "sent" ? (
        <form onSubmit={submit} noValidate className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#16161a] to-[#0e0e10] p-6 text-center shadow-[0_30px_60px_-24px_rgba(0,0,0,.9)]">
          <span className="text-3xl" aria-hidden>
            ✉️
          </span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{sub}</p>
          <div className="mt-5 flex gap-2">
            <label htmlFor={id} className="sr-only">
              Email address
            </label>
            <input
              id={id}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setState("idle");
              }}
              placeholder="you@studio.com"
              aria-invalid={state === "error"}
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
            />
            <button type="submit" className="rounded-xl bg-white px-4 text-sm font-bold text-black hover:bg-white/85">
              Send it ✈
            </button>
          </div>
          {state === "error" && (
            <p className="mt-2 text-xs text-red-300" role="alert">
              That email doesn’t look right.
            </p>
          )}
        </form>
      ) : (
        <>
          {animated && <div aria-hidden className="gx-pp-fold absolute h-[230px] w-full max-w-md rounded-2xl border border-white/10 bg-[#16161a]" />}
          <div className={animated ? "gx-pp-in text-center" : "text-center"} role="status">
            <p className="text-3xl">🕊️</p>
            <h2 className="mt-2 text-2xl font-black text-white">It’s on its way.</h2>
            <p className="mt-1 text-sm text-white/55">Check {email} to confirm your subscription.</p>
            <button type="button" onClick={() => setState("idle")} className="mt-4 font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white">
              Send another
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default PaperPlaneNewsletter;
