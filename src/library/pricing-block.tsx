"use client";

import * as React from "react";

/**
 * PricingBlock — a full pricing section: monthly / yearly switch where the
 * prices ROLL to the new value (digit by digit), a "save 20%" badge that
 * pops in, a highlighted plan with an animated gradient border, feature
 * lists with included / not-included rows, and FAQ-style footnote.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  blurb: string;
  features: { label: string; included: boolean }[];
  cta: string;
  featured?: boolean;
};

export type PricingBlockProps = {
  plans?: Plan[];
  currency?: string;
  title?: string;
  subtitle?: string;
  /** false = no rolling / spinning border (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const PLANS: Plan[] = [
  {
    name: "Hobby",
    monthly: 0,
    yearly: 0,
    blurb: "For side projects and experiments.",
    cta: "Start free",
    features: [
      { label: "3 projects", included: true },
      { label: "Community support", included: true },
      { label: "Custom domain", included: false },
      { label: "Analytics", included: false },
    ],
  },
  {
    name: "Pro",
    monthly: 24,
    yearly: 19,
    blurb: "For professionals shipping every week.",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      { label: "Unlimited projects", included: true },
      { label: "Priority support", included: true },
      { label: "Custom domain", included: true },
      { label: "Analytics", included: true },
    ],
  },
  {
    name: "Team",
    monthly: 79,
    yearly: 64,
    blurb: "For teams that need control.",
    cta: "Contact sales",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "SSO & audit logs", included: true },
      { label: "Roles & permissions", included: true },
      { label: "99.99% SLA", included: true },
    ],
  },
];

const css = `
@property --gx-pr-a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes gx-pr-spin{to{--gx-pr-a:360deg}}
@keyframes gx-pr-pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
.gx-pr-border{background:conic-gradient(from var(--gx-pr-a),#4ade80,#22d3ee,#a78bfa,#4ade80)}
.gx-pr[data-animated="true"] .gx-pr-border{animation:gx-pr-spin 5s linear infinite}
.gx-pr-pop{animation:gx-pr-pop .4s cubic-bezier(.3,1.5,.5,1)}
@media (prefers-reduced-motion:reduce){.gx-pr *{animation:none!important}}
`;

function Roll({ n, animated }: { n: number; animated: boolean }) {
  const s = String(n);
  return (
    <span className="inline-flex overflow-hidden" aria-hidden>
      {[...s].map((ch, i) => (
        <span key={s.length - i} className="relative inline-block h-[1em] w-[.62em] overflow-hidden leading-none">
          <span className="absolute left-0 top-0 flex flex-col" style={{ transform: `translateY(${-Number(ch) * 10}%)`, transition: animated ? `transform .7s cubic-bezier(.2,1.2,.3,1) ${i * 70}ms` : "none" }}>
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1em] leading-none">
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

export function PricingBlock({
  plans = PLANS,
  currency = "$",
  title = "Simple pricing. No surprises.",
  subtitle = "Start free, upgrade when you ship.",
  animated = true,
  className = "",
}: PricingBlockProps) {
  const [yearly, setYearly] = React.useState(true);

  return (
    <section className={`gx-pr w-full px-4 py-10 ${className}`} data-animated={animated} aria-labelledby="gx-pr-title">
      <style>{css}</style>
      <div className="text-center">
        <h2 id="gx-pr-title" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/55">{subtitle}</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] p-1" role="radiogroup" aria-label="Billing period">
          {[false, true].map((y) => (
            <button
              key={String(y)}
              type="button"
              role="radio"
              aria-checked={yearly === y}
              onClick={() => setYearly(y)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${yearly === y ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              {y ? "Yearly" : "Monthly"}
              {y && yearly && (
                <span key="b" className="gx-pr-pop absolute -right-3 -top-3 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          const card = (
            <div className={`flex h-full flex-col rounded-[22px] p-6 ${p.featured ? "bg-[#0e0f10]" : "border border-white/10 bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{p.name}</h3>
                {p.featured && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Popular</span>}
              </div>
              <p className="mt-1 text-sm text-white/50">{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1 text-white">
                <span className="text-2xl text-white/50">{currency}</span>
                <span className="text-5xl font-black tracking-tight">
                  <Roll n={price} animated={animated} />
                </span>
                <span className="sr-only">
                  {currency}
                  {price}
                </span>
                <span className="text-sm text-white/45">/ mo</span>
              </p>
              <p className="h-4 text-xs text-white/40">{yearly && price > 0 ? `billed ${currency}${price * 12} yearly` : ""}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f.label} className={`flex items-center gap-2 ${f.included ? "text-white/85" : "text-white/30 line-through"}`}>
                    <span aria-hidden className={f.included ? "text-emerald-400" : "text-white/25"}>
                      {f.included ? "✓" : "—"}
                    </span>
                    {f.label}
                    {!f.included && <span className="sr-only">(not included)</span>}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-6 h-11 rounded-xl text-sm font-bold transition ${p.featured ? "bg-white text-black hover:bg-white/85" : "border border-white/15 text-white hover:bg-white/[0.06]"}`}
              >
                {p.cta}
              </button>
            </div>
          );
          return p.featured ? (
            <div key={p.name} className="gx-pr-border rounded-3xl p-px shadow-[0_0_60px_-20px_rgba(74,222,128,.5)] md:-my-3">
              {card}
            </div>
          ) : (
            <div key={p.name}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}

export default PricingBlock;
