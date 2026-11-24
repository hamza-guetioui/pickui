"use client";

import * as React from "react";

/**
 * ScrollStory — scrollytelling for product features: a sticky phone mockup
 * on one side, steps on the other. As each step scrolls into the middle of
 * the screen, the phone's screen cross-fades to the matching UI and the
 * progress rail fills. Works inside any scroll container.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type StoryStep = { title: string; body: string; screen: React.ReactNode; color: string };

export type ScrollStoryProps = {
  steps?: StoryStep[];
  title?: string;
  /** false = no cross-fade / slide (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const Bar = ({ w, c = "rgba(255,255,255,.15)" }: { w: string; c?: string }) => <div className="h-2 rounded-full" style={{ width: w, background: c }} />;

const STEPS: StoryStep[] = [
  {
    title: "Capture anything",
    body: "Snap a receipt, forward an email or paste a link. Northwind files it for you.",
    color: "#22d3ee",
    screen: (
      <div className="space-y-3 p-4">
        <div className="grid h-28 place-items-center rounded-xl border-2 border-dashed border-cyan-400/50 text-3xl">📸</div>
        <Bar w="70%" />
        <Bar w="45%" />
      </div>
    ),
  },
  {
    title: "It sorts itself",
    body: "Smart folders appear on their own: trips, taxes, subscriptions.",
    color: "#a78bfa",
    screen: (
      <div className="grid grid-cols-2 gap-2 p-4">
        {["✈️ Trips", "🧾 Taxes", "🔁 Subs", "🏠 Home"].map((t) => (
          <div key={t} className="rounded-xl bg-violet-400/15 p-3 text-xs font-semibold text-violet-200">
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Ask, don’t search",
    body: "“How much did I spend on coffee in March?” — answered in a second.",
    color: "#4ade80",
    screen: (
      <div className="space-y-2 p-4 text-[11px]">
        <div className="ml-auto w-3/4 rounded-xl rounded-br-sm bg-emerald-400 px-3 py-2 text-black">Coffee in March?</div>
        <div className="w-3/4 rounded-xl rounded-bl-sm bg-white/10 px-3 py-2 text-white">€46.20 across 14 visits ☕</div>
      </div>
    ),
  },
  {
    title: "Share in one tap",
    body: "Send a folder to your accountant with a link that expires.",
    color: "#fb923c",
    screen: (
      <div className="grid h-full place-items-center p-4">
        <div className="rounded-2xl bg-orange-400 px-5 py-3 text-sm font-bold text-black">Link copied ✓</div>
      </div>
    ),
  },
];

export function ScrollStory({ steps = STEPS, title = "How Northwind works", animated = true, className = "" }: ScrollStoryProps) {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLLIElement | null)[]>([]);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [steps.length]);

  const s = steps[active];

  return (
    <section className={`w-full px-6 py-14 ${className}`} aria-label={title}>
      <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-white">{title}</h2>
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_280px]">
        <ol className="relative order-2 md:order-1">
          <div aria-hidden className="absolute bottom-0 left-[11px] top-0 w-0.5 bg-white/10">
            <div className="w-full transition-[height] duration-500" style={{ height: `${((active + 1) / steps.length) * 100}%`, background: s.color }} />
          </div>
          {steps.map((st, i) => (
            <li
              key={st.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-i={i}
              aria-current={i === active ? "step" : undefined}
              className="relative flex min-h-[46vh] items-center gap-5 pl-10 md:min-h-[300px]"
            >
              <span
                className="absolute left-0 grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] font-bold transition-colors duration-300"
                style={{ borderColor: i <= active ? st.color : "rgba(255,255,255,.2)", background: i === active ? st.color : "#0a0a0b", color: i === active ? "#000" : "#fff" }}
              >
                {i + 1}
              </span>
              <div className={`transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-35"}`}>
                <h3 className="text-xl font-bold text-white">{st.title}</h3>
                <p className="mt-2 max-w-sm text-white/60">{st.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="order-1 md:order-2">
          <div className="sticky top-8 mx-auto h-[500px] w-[250px] rounded-[42px] border-[10px] border-[#1d1d20] bg-[#0b0b0d] shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)]">
            <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div className="relative h-full overflow-hidden rounded-[32px]">
              <div className="h-24 p-4 pt-10 transition-colors duration-500" style={{ background: `linear-gradient(180deg, ${s.color}40, transparent)` }}>
                <p className="text-xs font-bold text-white">{s.title}</p>
              </div>
              {steps.map((st, i) => (
                <div
                  key={st.title}
                  aria-hidden={i !== active}
                  className="absolute inset-x-0 bottom-0 top-24"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: animated ? `translateY(${i === active ? 0 : i < active ? -20 : 20}px)` : undefined,
                    transition: animated ? "opacity .5s, transform .5s cubic-bezier(.2,.9,.3,1)" : "none",
                  }}
                >
                  {st.screen}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollStory;
