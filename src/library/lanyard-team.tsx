"use client";

import * as React from "react";

/**
 * LanyardTeam — a team section where every member is a conference badge
 * hanging from a lanyard. Badges sway on a real pendulum (spring +
 * damping), get nudged when your cursor brushes past, and can be grabbed
 * and swung. Hole punch, barcode, role stripe — the details.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type Member = { name: string; role: string; color: string; handle?: string };

export type LanyardTeamProps = {
  members?: Member[];
  title?: string;
  /** false = badges hang still (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const MEMBERS: Member[] = [
  { name: "Alex Example", role: "Founder", color: "#4ade80", handle: "@alex" },
  { name: "Sam Demo", role: "Design", color: "#f472b6", handle: "@sam" },
  { name: "Riley Sample", role: "Engineering", color: "#22d3ee", handle: "@riley" },
  { name: "Jordan Test", role: "Product", color: "#facc15", handle: "@jordan" },
];

export function LanyardTeam({ members = MEMBERS, title = "The crew (sample people)", animated = true, className = "" }: LanyardTeamProps) {
  const els = React.useRef<(HTMLDivElement | null)[]>([]);
  const st = React.useRef(members.map((_, i) => ({ a: (i % 2 ? 1 : -1) * 6, v: 0, drag: false, lastX: 0 })));

  React.useEffect(() => {
    st.current = members.map((_, i) => st.current[i] ?? { a: 0, v: 0, drag: false, lastX: 0 });
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.current.forEach((el) => el && (el.style.transform = "rotate(0deg)"));
      return;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      st.current.forEach((s, i) => {
        if (!s.drag) {
          s.v += (-22 * s.a - 1.4 * s.v) * dt;
          s.a += s.v * dt;
        }
        const el = els.current[i];
        if (el) el.style.transform = `rotate(${s.a.toFixed(2)}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animated, members]);

  return (
    <section className={`w-full overflow-hidden px-6 pb-12 pt-6 ${className}`} aria-label={title}>
      <h2 className="text-center text-3xl font-black tracking-tight text-white">{title}</h2>
      <ul className="mx-auto mt-2 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-2">
        {members.map((m, i) => (
          <li key={m.name} className="relative h-[330px] w-[170px]">
            {/* hook bar */}
            <span aria-hidden className="absolute left-1/2 top-0 h-2 w-10 -translate-x-1/2 rounded-b bg-neutral-600" />
            <div
              ref={(el) => {
                els.current[i] = el;
              }}
              className="absolute left-1/2 top-1 h-full w-[170px] -translate-x-1/2 origin-top cursor-grab touch-none select-none active:cursor-grabbing"
              style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 6}deg)` }}
              onPointerEnter={(e) => {
                const s = st.current[i];
                if (s) s.v += (e.movementX || (i % 2 ? 1 : -1) * 4) * 4;
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                const s = st.current[i];
                s.drag = true;
                s.lastX = e.clientX;
              }}
              onPointerMove={(e) => {
                const s = st.current[i];
                if (!s?.drag) return;
                const d = e.clientX - s.lastX;
                s.lastX = e.clientX;
                s.a = Math.max(-50, Math.min(50, s.a - d * 0.35));
                s.v = -d * 12;
              }}
              onPointerUp={() => (st.current[i].drag = false)}
            >
              {/* strap */}
              <span aria-hidden className="absolute left-1/2 top-0 h-[120px] w-4 -translate-x-1/2" style={{ background: `repeating-linear-gradient(180deg, ${m.color} 0 10px, color-mix(in srgb, ${m.color} 70%, black) 10px 20px)` }} />
              <span aria-hidden className="absolute left-1/2 top-[112px] h-5 w-6 -translate-x-1/2 rounded-sm bg-gradient-to-b from-neutral-300 to-neutral-500" />
              {/* badge */}
              <article className="absolute left-0 top-[128px] w-full overflow-hidden rounded-xl bg-[#f7f7f5] text-center text-neutral-900 shadow-[0_20px_30px_-12px_rgba(0,0,0,.8)]">
                <span aria-hidden className="mx-auto mt-2 block h-2 w-10 rounded-full bg-neutral-300" />
                <div className="mx-auto mt-3 grid h-16 w-16 place-items-center rounded-full text-xl font-black text-black" style={{ background: m.color }}>
                  {m.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <h3 className="mt-2 px-2 text-sm font-black leading-tight">{m.name}</h3>
                <p className="text-[11px] text-neutral-500">{m.handle}</p>
                <p className="mt-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-black" style={{ background: m.color }}>
                  {m.role}
                </p>
                <div aria-hidden className="flex h-6 items-stretch justify-center gap-[2px] bg-white py-1">
                  {Array.from({ length: 22 }, (_, k) => (
                    <span key={k} className="bg-neutral-900" style={{ width: ((k * 7 + i * 3) % 3) + 1 }} />
                  ))}
                </div>
              </article>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center font-mono text-[11px] text-white/35">brush past or grab a badge</p>
    </section>
  );
}

export default LanyardTeam;
