"use client";

import * as React from "react";

/**
 * TerminalHero — a hero section that boots itself: a terminal types the
 * install command, prints progress, and when it "succeeds" the headline
 * letters drop into place one by one and the CTAs fade up. Replay on click.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type TerminalHeroProps = {
  command?: string;
  output?: string[];
  headline?: string;
  sub?: string;
  /** false = everything shown immediately (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-th-drop{0%{opacity:0;transform:translateY(-60px) rotate(var(--r))}70%{opacity:1;transform:translateY(6px) rotate(0)}100%{opacity:1;transform:none}}
@keyframes gx-th-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes gx-th-caret{50%{opacity:0}}
.gx-th-l{opacity:0;display:inline-block;animation:gx-th-drop .7s cubic-bezier(.3,1.4,.5,1) forwards}
.gx-th-up{opacity:0;animation:gx-th-up .6s ease forwards}
.gx-th-caret{animation:gx-th-caret 1s steps(1) infinite}
@media (prefers-reduced-motion:reduce){.gx-th-l,.gx-th-up{animation:none;opacity:1}}
`;

export function TerminalHero({
  command = "npx create-northwind@latest my-app",
  output = ["✓ Resolved 214 packages", "✓ Generated app in 1.8s", "✓ Deployed → my-app.northwind.dev"],
  headline = "Ship before lunch.",
  sub = "Northwind turns an idea into a deployed product in one command. You bring the taste.",
  animated = true,
  className = "",
}: TerminalHeroProps) {
  const [typed, setTyped] = React.useState(animated ? 0 : command.length);
  const [lines, setLines] = React.useState(animated ? 0 : output.length);
  const [run, setRun] = React.useState(0);
  const done = lines >= output.length;
  const outCount = output.length;

  React.useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(command.length);
      setLines(outCount);
      return;
    }
    setTyped(0);
    setLines(0);
    let i = 0;
    const timers: number[] = [];
    const type = () => {
      i++;
      setTyped(i);
      if (i < command.length) timers.push(window.setTimeout(type, 38 + Math.random() * 50));
      else for (let k = 0; k < outCount; k++) timers.push(window.setTimeout(() => setLines(k + 1), 500 + k * 450));
    };
    timers.push(window.setTimeout(type, 600));
    return () => timers.forEach(window.clearTimeout);
  }, [animated, command, outCount, run]);

  return (
    <section className={`relative isolate flex min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-[#060607] px-6 py-16 text-center text-white ${className}`}>
      <style>{css}</style>
      <div aria-hidden className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        aria-label="Replay the terminal animation"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-black/70 text-left shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur"
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-2 font-mono text-[10px] text-white/40">~/projects — zsh</span>
        </div>
        <div className="space-y-1 p-4 font-mono text-[13px]">
          <p>
            <span className="text-emerald-400">❯</span> {command.slice(0, typed)}
            {!done && <span className="gx-th-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-white/80" />}
          </p>
          {output.slice(0, lines).map((l) => (
            <p key={l} className="gx-th-up text-white/60">
              {l}
            </p>
          ))}
        </div>
      </button>

      <h1 key={`${run}-${done}`} className="mt-10 text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-none tracking-tighter" aria-label={headline}>
        {done
          ? [...headline].map((ch, i) => (
              <span key={i} aria-hidden className={animated ? "gx-th-l" : ""} style={{ animationDelay: `${i * 45}ms`, "--r": `${((i * 37) % 30) - 15}deg` } as React.CSSProperties}>
                {ch === " " ? "\u00a0" : ch}
              </span>
            ))
          : "\u00a0"}
      </h1>
      <p className={`mt-4 max-w-md text-white/60 ${done && animated ? "gx-th-up" : ""} ${done ? "" : "invisible"}`} style={{ animationDelay: `${headline.length * 45 + 200}ms` }}>
        {sub}
      </p>
      <div className={`mt-8 flex gap-3 ${done && animated ? "gx-th-up" : ""} ${done ? "" : "invisible"}`} style={{ animationDelay: `${headline.length * 45 + 400}ms` }}>
        <a href="#" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-white/85">
          Start building
        </a>
        <a href="#" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">
          Read the docs
        </a>
      </div>
    </section>
  );
}

export default TerminalHero;
