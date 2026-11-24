"use client";

import type { ReactNode } from "react";

/** A tiny fake website used as the backdrop for package demos (not a library item). */
export default function FakeSite({ children, tone = "dark", gravity = false }: { children?: ReactNode; tone?: "dark" | "night" | "window"; gravity?: boolean }) {
  const g = gravity ? { "data-gravity": "" } : {};
  const bg =
    tone === "night"
      ? "bg-[radial-gradient(ellipse_at_50%_120%,#1b2a1a,#05070a_65%)]"
      : tone === "window"
        ? "bg-[linear-gradient(180deg,#1f2a3a,#0b1220_70%)]"
        : "bg-[#0b0b0d]";
  return (
    <div className={`relative h-full min-h-[420px] w-full overflow-hidden ${bg} text-white`}>
      {tone === "window" && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-40 items-end gap-2 px-4 opacity-70">
          {[60, 110, 80, 140, 70, 120, 90, 150, 65, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-[#0d1626]" style={{ height: h }}>
              <div className="m-1 grid grid-cols-3 gap-1">
                {Array.from({ length: Math.floor(h / 16) * 3 }, (_, k) => (
                  <span key={k} className={`h-1.5 ${(k * 7 + i) % 5 === 0 ? "bg-amber-200/70" : "bg-white/5"}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 pt-12 text-center">
        <span {...g} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Sample website
        </span>
        <h1 {...g} data-snow="" className="mt-4 text-4xl font-black tracking-tight">
          Northwind
        </h1>
        <h2 {...g} className="mt-2 max-w-sm text-base font-medium text-white/60">
          Tools for people who ship. Built in public, one release at a time.
        </h2>
        <div className="mt-6 flex gap-3">
          <button {...g} type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">
            Get started
          </button>
          <button {...g} type="button" className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80">
            Docs
          </button>
        </div>
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {["Fast", "Calm", "Yours"].map((t) => (
            <div key={t} {...g} data-snow="" className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold">
              {t}
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
