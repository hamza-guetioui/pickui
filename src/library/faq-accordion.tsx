"use client";

import * as React from "react";

/**
 * FaqAccordion — an FAQ section that feels premium: a live search that
 * highlights matches, answers that open with true auto-height animation
 * (CSS grid-rows trick, no measuring), a plus that morphs into a minus, and
 * a "Was this helpful?" micro-feedback per answer.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type Faq = { q: string; a: string };

export type FaqAccordionProps = {
  items?: Faq[];
  title?: string;
  /** Allow several open at once (default false). */
  multiple?: boolean;
  /** false = instant open/close (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const ITEMS: Faq[] = [
  { q: "Is there a free plan?", a: "Yes. The Hobby plan is free forever for personal projects, with up to three projects and community support." },
  { q: "Can I cancel anytime?", a: "Anytime, from settings, in two clicks. You keep access until the end of the billing period." },
  { q: "Where is my data stored?", a: "In the EU by default. Enterprise plans can pick a region. Everything is encrypted at rest and in transit." },
  { q: "Do you offer student discounts?", a: "Students and teachers get Pro for free with a verified school email." },
  { q: "How do I migrate from another tool?", a: "Use the importer: it brings your projects, history and team in a few minutes." },
];

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-amber-300/30 px-0.5 text-amber-100">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function FaqAccordion({ items = ITEMS, title = "Frequently asked questions", multiple = false, animated = true, className = "" }: FaqAccordionProps) {
  const [open, setOpen] = React.useState<Set<number>>(() => new Set([0]));
  const [q, setQ] = React.useState("");
  const [vote, setVote] = React.useState<Record<number, "y" | "n">>({});
  const uid = React.useId();

  const shown = items.map((it, i) => ({ ...it, i })).filter((it) => !q || (it.q + it.a).toLowerCase().includes(q.toLowerCase()));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : prev.has(i) ? [i] : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className={`mx-auto w-full max-w-2xl px-6 py-12 ${className}`} aria-labelledby={`${uid}-t`}>
      <h2 id={`${uid}-t`} className="text-center text-3xl font-black tracking-tight text-white">
        {title}
      </h2>
      <label className="relative mt-6 block">
        <span className="sr-only">Search questions</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions…"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
        />
      </label>
      <p className="sr-only" aria-live="polite">
        {shown.length} questions
      </p>
      <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
        {shown.length === 0 && <p className="p-6 text-center text-sm text-white/50">Nothing matches “{q}”. Ask us directly →</p>}
        {shown.map((it) => {
          const isOpen = open.has(it.i) || (q !== "" && shown.length <= 2);
          return (
            <div key={it.i}>
              <h3>
                <button
                  type="button"
                  id={`${uid}-b${it.i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-p${it.i}`}
                  onClick={() => toggle(it.i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-white outline-none hover:bg-white/[0.03] focus-visible:bg-white/[0.05]"
                >
                  <span>
                    <Mark text={it.q} q={q} />
                  </span>
                  <span aria-hidden className="relative h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded bg-white/70" />
                    <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rounded bg-white/70 transition-transform duration-300" style={{ transform: `translateX(-50%) rotate(${isOpen ? 90 : 0}deg) scaleY(${isOpen ? 0 : 1})` }} />
                  </span>
                </button>
              </h3>
              <div
                id={`${uid}-p${it.i}`}
                role="region"
                aria-labelledby={`${uid}-b${it.i}`}
                className="grid"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", transition: animated ? "grid-template-rows .35s cubic-bezier(.2,.9,.3,1)" : "none" }}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-sm leading-relaxed text-white/65">
                    <Mark text={it.a} q={q} />
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      {vote[it.i] ? (
                        <span>Thanks for the feedback {vote[it.i] === "y" ? "🙌" : "— we’ll improve it"}</span>
                      ) : (
                        <>
                          Helpful?
                          {(["y", "n"] as const).map((v) => (
                            <button key={v} type="button" onClick={() => setVote((p) => ({ ...p, [it.i]: v }))} className="rounded-full border border-white/10 px-2 py-0.5 hover:text-white" tabIndex={isOpen ? 0 : -1}>
                              {v === "y" ? "Yes" : "No"}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FaqAccordion;
