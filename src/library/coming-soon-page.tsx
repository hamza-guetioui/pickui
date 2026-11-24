"use client";

import * as React from "react";
import SplitFlap from "./split-flap";

/**
 * ComingSoonPage — a full launch / waitlist page: aurora backdrop, a
 * split-flap headline that cycles your promise, a waitlist form with
 * success state, a live "people waiting" counter and social proof avatars.
 * Template · uses ./split-flap (installed together).
 */

export type ComingSoonPageProps = {
  brand?: string;
  words?: string[];
  tagline?: string;
  launch?: string;
  /** Your submit handler. Default: fake success. */
  onJoin?: (email: string) => Promise<void> | void;
  /** false = static backdrop (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-cs-a{50%{transform:translate(8%,6%) scale(1.15)}}
@keyframes gx-cs-b{50%{transform:translate(-10%,-4%) scale(1.1)}}
.gx-cs[data-animated="true"] .gx-cs-a{animation:gx-cs-a 14s ease-in-out infinite}
.gx-cs[data-animated="true"] .gx-cs-b{animation:gx-cs-b 18s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.gx-cs *{animation:none!important}}
`;

export function ComingSoonPage({
  brand = "Northwind",
  words = ["FASTER", "CALMER", "SMARTER", "YOURS"],
  tagline = "Your inbox, rebuilt from scratch. Join the waitlist for early access.",
  launch = "Launching spring 2026",
  onJoin,
  animated = true,
  className = "",
}: ComingSoonPageProps) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "busy" | "done" | "error">("idle");
  const [count, setCount] = React.useState(2481);

  React.useEffect(() => {
    if (!animated) return;
    const t = window.setInterval(() => setCount((c) => c + (Math.random() < 0.4 ? 1 : 0)), 1800);
    return () => window.clearInterval(t);
  }, [animated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    setState("busy");
    await (onJoin ? onJoin(email) : new Promise((r) => window.setTimeout(r, 900)));
    setCount((c) => c + 1);
    setState("done");
  };

  return (
    <main className={`gx-cs relative isolate flex h-full min-h-[560px] w-full flex-col overflow-hidden bg-[#050507] text-white ${className}`} data-animated={animated}>
      <style>{css}</style>
      <div aria-hidden className="gx-cs-a absolute -left-1/4 -top-1/3 -z-10 h-[90%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,.45),transparent)] blur-3xl" />
      <div aria-hidden className="gx-cs-b absolute -bottom-1/3 -right-1/4 -z-10 h-[90%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,.35),transparent)] blur-3xl" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" />

      <header className="flex items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-xs font-black text-black">{brand[0]}</span>
          {brand}
        </span>
        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70">{launch}</span>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-14 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-white/50">Email, but</p>
        <SplitFlap className="mt-4 text-2xl sm:text-4xl" words={words} interval={2800} animated={animated} />
        <p className="mt-6 max-w-md text-white/65">{tagline}</p>

        {state === "done" ? (
          <p className="mt-8 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-sm text-emerald-200" role="status">
            ✓ You’re #{count.toLocaleString("en-US")} on the list. Check your inbox.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex w-full max-w-md gap-2 rounded-full border border-white/15 bg-white/[0.05] p-1.5 backdrop-blur" noValidate>
            <label htmlFor="gx-cs-email" className="sr-only">
              Email address
            </label>
            <input
              id="gx-cs-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setState("idle");
              }}
              placeholder="you@company.com"
              aria-invalid={state === "error"}
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/35"
            />
            <button type="submit" disabled={state === "busy"} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-white/85 disabled:opacity-60">
              {state === "busy" ? "Joining…" : "Join waitlist"}
            </button>
          </form>
        )}
        {state === "error" && (
          <p className="mt-2 text-xs text-red-300" role="alert">
            Please enter a valid email.
          </p>
        )}

        <div className="mt-8 flex items-center gap-3 text-sm text-white/55">
          <span className="flex -space-x-2">
            {["#f472b6", "#a78bfa", "#22d3ee", "#facc15"].map((c) => (
              <span key={c} className="h-7 w-7 rounded-full border-2 border-[#050507]" style={{ background: c }} />
            ))}
          </span>
          <span aria-live="polite">
            <b className="text-white">{count.toLocaleString("en-US")}</b> people waiting
          </span>
        </div>
      </section>
    </main>
  );
}

export default ComingSoonPage;
