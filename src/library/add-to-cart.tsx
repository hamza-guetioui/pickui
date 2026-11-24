"use client";

import * as React from "react";

/**
 * AddToCart — a product card where buying feels physical: pick a colorway
 * (the product re-tints with a wipe), pick a size, hit Add and a thumbnail
 * flies in an arc into the cart, the cart bounces and its badge rolls up.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Colorway = { name: string; color: string };

export type AddToCartProps = {
  name?: string;
  price?: number;
  currency?: string;
  colorways?: Colorway[];
  sizes?: string[];
  onAdd?: (item: { color: string; size: string }) => void;
  /** false = no flying thumbnail (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-atc-x{to{transform:translateX(var(--dx))}}
@keyframes gx-atc-y{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-120px) scale(.7)}100%{transform:translateY(var(--dy)) scale(.2)}}
@keyframes gx-atc-bump{0%,100%{transform:scale(1)}30%{transform:scale(1.25) rotate(-8deg)}60%{transform:scale(.92) rotate(4deg)}}
.gx-atc-fx{animation:gx-atc-x .8s cubic-bezier(.4,0,.6,1) forwards}
.gx-atc-fy{animation:gx-atc-y .8s cubic-bezier(.3,0,.7,1) forwards}
.gx-atc-bump{animation:gx-atc-bump .5s ease}
@media (prefers-reduced-motion:reduce){.gx-atc-fx,.gx-atc-fy,.gx-atc-bump{animation:none!important;display:none}}
`;

function Shoe({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full drop-shadow-[0_18px_14px_rgba(0,0,0,.45)]" aria-hidden>
      <path d="M12 78 C 20 52, 52 40, 74 38 L 96 22 C 104 16, 116 18, 120 26 L 132 46 C 150 50, 178 58, 188 72 C 194 82, 188 90, 176 90 L 22 90 C 12 90, 8 84, 12 78Z" fill={color} />
      <path d="M12 82 L 190 82 L 186 96 L 18 96Z" fill="#f4f4f5" />
      <path d="M74 38 L 96 22 C 104 16 116 18 120 26 L 132 46" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="3" />
      <path d="M60 60 C 90 50, 120 54, 150 64" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="5" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={92 + i * 9} y1={34 + i * 3} x2={104 + i * 9} y2={30 + i * 3} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function AddToCart({
  name = "Runner 01 — Aero",
  price = 129,
  currency = "$",
  colorways = [
    { name: "Volt", color: "#c6f432" },
    { name: "Ember", color: "#fb5b3f" },
    { name: "Glacier", color: "#7dd3fc" },
    { name: "Onyx", color: "#3f3f46" },
  ],
  sizes = ["40", "41", "42", "43", "44"],
  onAdd,
  animated = true,
  className = "",
}: AddToCartProps) {
  const [ci, setCi] = React.useState(0);
  const [size, setSize] = React.useState<string | null>(null);
  const [count, setCount] = React.useState(0);
  const [flights, setFlights] = React.useState<{ id: number; dx: number; dy: number; color: string }[]>([]);
  const [bump, setBump] = React.useState(0);
  const [needSize, setNeedSize] = React.useState(false);
  const img = React.useRef<HTMLDivElement>(null);
  const cart = React.useRef<HTMLButtonElement>(null);

  const add = () => {
    if (!size) {
      setNeedSize(true);
      window.setTimeout(() => setNeedSize(false), 600);
      return;
    }
    const a = img.current!.getBoundingClientRect();
    const b = cart.current!.getBoundingClientRect();
    const id = Date.now();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    if (animated) setFlights((f) => [...f, { id, dx, dy, color: colorways[ci].color }]);
    window.setTimeout(
      () => {
        setFlights((f) => f.filter((x) => x.id !== id));
        setCount((c) => c + 1);
        setBump((v) => v + 1);
      },
      animated ? 780 : 0,
    );
    onAdd?.({ color: colorways[ci].name, size });
  };

  return (
    <div className={`relative w-full max-w-[340px] ${className}`}>
      <style>{css}</style>
      <button
        ref={cart}
        type="button"
        aria-label={`Cart, ${count} items`}
        className="absolute -top-2 right-0 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#141416] text-white"
      >
        <span key={bump} className={bump ? "gx-atc-bump" : ""}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 7h14l-1.5 11h-11z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
        </span>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-black" aria-hidden>
            {count}
          </span>
        )}
      </button>

      <article className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#111113]">
        <div className="relative h-52 overflow-hidden" style={{ background: `radial-gradient(circle at 50% 70%, color-mix(in srgb, ${colorways[ci].color} 35%, #111113), #0c0c0e 70%)`, transition: "background .5s" }}>
          <span className="absolute left-4 top-4 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/80">New drop</span>
          <div ref={img} className="absolute inset-x-6 bottom-6 top-10 transition-transform duration-500 hover:-rotate-6 hover:scale-105">
            <Shoe color={colorways[ci].color} />
          </div>
          {flights.map((f) => (
            <div key={f.id} className="gx-atc-fx pointer-events-none absolute inset-x-6 bottom-6 top-10 z-30" style={{ "--dx": `${f.dx}px` } as React.CSSProperties}>
              <div className="gx-atc-fy h-full w-full" style={{ "--dy": `${f.dy}px` } as React.CSSProperties}>
                <Shoe color={f.color} />
              </div>
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{name}</h3>
              <p className="text-xs text-white/50">{colorways[ci].name}</p>
            </div>
            <p className="font-mono text-lg font-bold text-white">
              {currency}
              {price}
            </p>
          </div>
          <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Color">
            {colorways.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={i === ci}
                aria-label={c.name}
                onClick={() => setCi(i)}
                className={`h-7 w-7 rounded-full outline-none ring-offset-2 ring-offset-[#111113] transition focus-visible:ring-2 focus-visible:ring-white ${i === ci ? "ring-2 ring-white" : ""}`}
                style={{ background: c.color }}
              />
            ))}
          </div>
          <div className={`mt-4 grid grid-cols-5 gap-1.5 ${needSize ? "animate-[gx-atc-bump_.4s]" : ""}`} role="radiogroup" aria-label="Size">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={`rounded-lg border py-2 text-xs font-semibold transition ${size === s ? "border-white bg-white text-black" : needSize ? "border-red-400/70 text-white/80" : "border-white/10 text-white/70 hover:border-white/30"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={add}
            className="mt-4 h-11 w-full rounded-xl bg-white text-sm font-bold text-black transition hover:bg-white/85 active:scale-[.98]"
          >
            {size ? `Add size ${size} to cart` : "Select a size"}
          </button>
          <p className="sr-only" aria-live="polite">
            {count ? `${count} items in cart` : ""}
          </p>
        </div>
      </article>
    </div>
  );
}

export default AddToCart;
