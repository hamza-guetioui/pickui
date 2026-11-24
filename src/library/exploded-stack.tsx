"use client";

import * as React from "react";

/**
 * ExplodedStack — an isometric "exploded view" of layers (architecture, tech
 * stack, pricing tiers, design system…). Hover or focus pulls the layers
 * apart in real 3D; the active layer lifts and glows and its billboarded
 * label always faces the viewer. A legend gives keyboard/screen-reader access.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type StackLayer = {
  label: string;
  description?: string;
  /** Any CSS color. */
  color: string;
  /** Optional drawing on the layer's surface (uses currentColor = the layer color). */
  glyph?: React.ReactNode;
};

export type ExplodedStackProps = {
  /** Bottom → top. 3–6 layers look best. */
  layers: StackLayer[];
  /** Start exploded (default false — explodes on hover/focus). */
  defaultExploded?: boolean;
  /** Show the side legend (default true). */
  legend?: boolean;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
.gx-es{--gap:14px}
.gx-es:hover,.gx-es:focus-within,.gx-es[data-exploded="true"]{--gap:52px}
.gx-es-layer{transform:translateZ(calc(var(--i)*var(--gap) + var(--lift,0px))) translateY(var(--pull,0px)) rotateZ(var(--twist,0deg));transition:transform .55s cubic-bezier(.25,1.25,.45,1),box-shadow .4s,background .4s}
.gx-es-tag{opacity:0;transform:translate(var(--tx,0px),var(--ty,0px));transition:opacity .35s,transform .55s cubic-bezier(.25,1.25,.45,1),top .7s cubic-bezier(.3,1.2,.5,1)}
.gx-es:hover .gx-es-tag,.gx-es:focus-within .gx-es-tag,.gx-es[data-exploded="true"] .gx-es-tag{opacity:1}
.gx-es-center{transform:translateY(calc(var(--gap)*(var(--n) - 1)*.44));transition:transform .7s cubic-bezier(.3,1.2,.5,1)}
.gx-es-pillar{position:absolute;width:0;height:var(--gap);transform-origin:top;transform:rotateX(90deg);border-left:1px dashed var(--c);opacity:0;transition:opacity .4s,height .7s cubic-bezier(.3,1.4,.5,1)}
.gx-es:hover .gx-es-pillar,.gx-es:focus-within .gx-es-pillar,.gx-es[data-exploded="true"] .gx-es-pillar{opacity:.7}
.gx-es-packet{position:absolute;left:-2px;top:0;width:3px;height:3px;border-radius:9px;background:var(--c);box-shadow:0 0 6px var(--c);animation:gx-es-up 1.6s linear infinite;animation-delay:var(--d)}
@keyframes gx-es-up{from{top:100%}to{top:0}}
.gx-es-floor{transform:translateZ(-22px);transition:opacity .5s,transform .7s}
.gx-es:hover .gx-es-floor,.gx-es:focus-within .gx-es-floor,.gx-es[data-exploded="true"] .gx-es-floor{transform:translateZ(-22px) scale(1.18)}
.gx-es-stage{animation:gx-es-float 6s ease-in-out infinite}
@keyframes gx-es-float{50%{transform:rotateX(60deg) rotateZ(-42deg) translateZ(10px)}}
.gx-es[data-animated="false"] .gx-es-stage,.gx-es[data-animated="false"] .gx-es-packet{animation:none;opacity:0}
.gx-es[data-animated="false"] .gx-es-layer{transition-timing-function:ease}
@media (prefers-reduced-motion:reduce){.gx-es-stage,.gx-es-packet{animation:none}.gx-es-packet{opacity:0}.gx-es-layer,.gx-es-center{transition:none}}
`;

export function ExplodedStack({ layers, defaultExploded = false, legend = true, animated = true, className = "" }: ExplodedStackProps) {
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <div
      className={`gx-es flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center ${className}`}
      data-exploded={defaultExploded || active !== null}
      data-animated={animated}
      onPointerLeave={() => setActive(null)}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="relative grid h-[340px] w-[270px] shrink-0 place-items-center [perspective:1400px]"
        style={{ "--n": layers.length } as React.CSSProperties}
        onPointerMove={(e) => {
          // stable hit bands (top band = top layer), so a lifting layer never steals the hover
          const r = e.currentTarget.getBoundingClientRect();
          const f = (e.clientY - r.top - r.height * 0.14) / (r.height * 0.72);
          const i = Math.max(0, Math.min(layers.length - 1, Math.floor((1 - f) * layers.length)));
          if (i !== active) setActive(i);
        }}
      >
        <div className="gx-es-center [transform-style:preserve-3d]">
        <div
          className="gx-es-stage relative h-[150px] w-[150px] [transform-style:preserve-3d]"
          style={{ transform: "rotateX(60deg) rotateZ(-42deg)" }}
        >
          {/* blueprint floor + contact shadow */}
          <div
            className="gx-es-floor absolute -inset-10 rounded-[28px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(0,0,0,.55), transparent), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px) 0 0/16px 16px",
              maskImage: "radial-gradient(closest-side, #000 55%, transparent)",
              WebkitMaskImage: "radial-gradient(closest-side, #000 55%, transparent)",
            }}
          />
          {layers.map((l, i) => {
            const on = active === i;
            return (
              <div
                key={l.label}
                className="gx-es-layer absolute inset-0 rounded-2xl border [transform-style:preserve-3d]"
                style={
                  {
                    "--i": i,
                    "--lift": on ? "6px" : "0px",
                    "--pull": on ? "62px" : "0px",
                    "--twist": on ? "-4deg" : "0deg",
                    borderColor: `color-mix(in srgb, ${l.color} ${on ? 95 : 55}%, transparent)`,
                    background: `linear-gradient(135deg, color-mix(in srgb, ${l.color} ${on ? 55 : 28}%, transparent), color-mix(in srgb, ${l.color} ${on ? 30 : 10}%, transparent)), radial-gradient(circle at 1px 1px, color-mix(in srgb, ${l.color} 40%, transparent) 1px, transparent 0) 0 0/12px 12px`,
                    boxShadow: on
                      ? `0 0 40px color-mix(in srgb, ${l.color} 70%, transparent), inset 0 0 20px color-mix(in srgb, ${l.color} 40%, transparent)`
                      : `0 0 0 transparent`,
                  } as React.CSSProperties
                }
              >
                {/* slab thickness */}
                <div className="absolute inset-0 rounded-2xl" style={{ transform: "translateZ(-4px)", background: `color-mix(in srgb, ${l.color} 22%, #05070a)`, border: `1px solid color-mix(in srgb, ${l.color} 35%, transparent)` }} />
                <div className="absolute inset-0 rounded-2xl" style={{ transform: "translateZ(-8px)", background: `color-mix(in srgb, ${l.color} 12%, #020305)` }} />
                {/* surface detail: a custom glyph, or header bar + blocks */}
                {l.glyph ? (
                  <div className="absolute inset-3 grid place-items-center opacity-90" style={{ transform: "translateZ(2px)", color: l.color }}>
                    {l.glyph}
                  </div>
                ) : (
                <div className="absolute inset-3 grid grid-cols-3 grid-rows-[10px_1fr_1fr] gap-1.5 opacity-80" style={{ transform: "translateZ(1px)" }}>
                  <span className="col-span-3 rounded-full" style={{ background: `color-mix(in srgb, ${l.color} 45%, transparent)` }} />
                  {Array.from({ length: 6 }, (_, k) => (
                    <span key={k} className="rounded-md border" style={{ borderColor: `color-mix(in srgb, ${l.color} 40%, transparent)`, background: (k + i) % 3 === 0 ? `color-mix(in srgb, ${l.color} 30%, transparent)` : "transparent" }} />
                  ))}
                </div>
                )}
                {/* pillars + packets to the next layer */}
                {i < layers.length - 1 &&
                  [
                    [0, 0],
                    [100, 0],
                    [0, 100],
                    [100, 100],
                  ].map(([x, y], k) => (
                    <span key={k} className="gx-es-pillar" style={{ left: `${x}%`, top: `${y}%`, "--c": l.color } as React.CSSProperties}>
                      {k % 2 === 0 && <span className="gx-es-packet" style={{ "--d": `${-(i * 0.4 + k * 0.3)}s` } as React.CSSProperties} />}
                    </span>
                  ))}
              </div>
            );
          })}
        </div>
        </div>
        {/* labels: a flat overlay above the 3D scene, so no layer can cover them */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {layers.map((l, i) => (
            <span
              key={l.label}
              className="gx-es-tag absolute right-[calc(50%+92px)] flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-black/85 px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,.6)]"
              style={
                {
                  borderColor: l.color,
                  top: `calc(50% - 10px - (${i} - (var(--n) - 1) / 2) * var(--gap) * .87 + var(--gap) * (var(--n) - 1) * .44 - 46px)`,
                  "--tx": active === i ? "-8px" : "0px",
                  "--ty": active === i ? "14px" : "0px",
                } as React.CSSProperties
              }
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {legend && (
        <ol className="flex w-full max-w-[240px] flex-col-reverse gap-1.5">
          {layers.map((l, i) => (
            <li key={l.label}>
              <button
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-pressed={active === i}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left outline-none transition hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/60 aria-pressed:bg-white/[0.08]"
                style={active === i ? { borderColor: l.color } : undefined}
              >
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="font-mono text-[10px] text-white/40">L{i + 1}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
                {l.description && <span className="mt-0.5 block text-[11px] leading-snug text-white/50">{l.description}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default ExplodedStack;
