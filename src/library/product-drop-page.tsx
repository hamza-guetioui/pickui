"use client";

import * as React from "react";
import AddToCart from "./add-to-cart";
import DropCountdown from "./drop-countdown";

/**
 * ProductDropPage — a complete limited-release product page: hero with a
 * giant outlined product name, the AddToCart card, the DropCountdown with
 * stock pressure, a spec strip and a sticky mobile buy bar.
 * Template · uses ./add-to-cart and ./drop-countdown (installed together).
 */

export type ProductDropPageProps = {
  brand?: string;
  product?: string;
  /** false = calmer page: no marquee, components in regular mode. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-pd-marq{to{transform:translateX(-50%)}}
.gx-pd[data-animated="true"] .gx-pd-marq{animation:gx-pd-marq 22s linear infinite}
@media (prefers-reduced-motion:reduce){.gx-pd *{animation:none!important}}
`;

export function ProductDropPage({ brand = "STRIDE", product = "Runner 01 — Aero", animated = true, className = "" }: ProductDropPageProps) {
  return (
    <main className={`gx-pd relative w-full overflow-hidden bg-[#09090b] text-white ${className}`} data-animated={animated}>
      <style>{css}</style>
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <span className="font-black tracking-[0.3em]">{brand}</span>
        <nav className="hidden gap-6 text-sm text-white/60 sm:flex" aria-label="Shop">
          <span>New</span>
          <span>Running</span>
          <span>Lifestyle</span>
        </nav>
      </header>

      <div className="overflow-hidden border-b border-white/10 py-2" aria-hidden>
        <div className="gx-pd-marq flex w-max gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-8">
              {["Limited release", "Free returns", "Carbon-neutral shipping", "Members get early access", "One pair per customer"].map((t) => (
                <span key={t}>✦ {t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="relative px-6 pb-10 pt-10">
        <h1 className="pointer-events-none select-none text-center text-[clamp(3rem,13vw,9rem)] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.25)]">
          AERO
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-white/60">{product}. 186 grams. Built to disappear on your feet.</p>
        <div className="mx-auto mt-10 grid max-w-5xl items-start gap-8 lg:grid-cols-2">
          <div className="flex justify-center">
            <AddToCart name={product} animated={animated} />
          </div>
          <div className="flex flex-col gap-6">
            <DropCountdown title={`${product} — members drop`} animated={animated} />
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                ["186 g", "Weight"],
                ["8 mm", "Drop"],
                ["42%", "Recycled"],
              ].map(([v, k]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-[10px] uppercase tracking-widest text-white/45">{k}</dt>
                  <dd className="mt-1 text-xl font-black">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDropPage;
