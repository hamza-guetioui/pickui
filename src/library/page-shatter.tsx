"use client";

import * as React from "react";

/**
 * page-shatter — click an element and it shatters like glass: the real
 * element is cloned into triangular shards (clip-path), which burst out from
 * the impact point with spin and gravity, then — on `restore()` — fly back
 * and reassemble. Made for 404 pages, "delete" animations and screen
 * recordings people can't stop watching.
 *
 * Framework-agnostic core (`shatter()`) + React wrapper (`<PageShatter />`).
 * Zero dependencies · respects prefers-reduced-motion (fades instead).
 */

export type ShatterOptions = {
  /** Number of radial slices (default 14). */
  pieces?: number;
  /** Explosion strength (default 1). */
  force?: number;
  /** Impact point in client coords (default: element center). */
  at?: { x: number; y: number };
};

export function shatter(el: HTMLElement, options: ShatterOptions = {}) {
  const { pieces = 14, force = 1 } = options;
  if (typeof window === "undefined") return { restore() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = el.getBoundingClientRect();
  const parent = (el.offsetParent as HTMLElement) ?? document.body;
  const pr = parent.getBoundingClientRect();
  const ix = (options.at?.x ?? r.left + r.width / 2) - r.left;
  const iy = (options.at?.y ?? r.top + r.height / 2) - r.top;
  const shards: HTMLElement[] = [];
  const anims: Animation[] = [];
  const prevVis = el.style.visibility;

  if (reduced) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
    return { restore: () => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" }) };
  }

  // radial slices from the impact point, each split once more → irregular glass
  const R = Math.hypot(r.width, r.height);
  const angles = Array.from({ length: pieces }, (_, i) => (i / pieces) * Math.PI * 2 + (Math.sin(i * 12.9898) * 0.5 * Math.PI) / pieces).sort((a, b) => a - b);
  const pct = (x: number, y: number) => `${((x / r.width) * 100).toFixed(2)}% ${((y / r.height) * 100).toFixed(2)}%`;
  angles.forEach((a0, i) => {
    const a1 = angles[(i + 1) % pieces] + (i === pieces - 1 ? Math.PI * 2 : 0);
    const mid = 0.35 + ((i * 7) % 5) / 12;
    for (const [inner, outer] of [
      [0, mid],
      [mid, 1.2],
    ]) {
      const p = [
        [ix + Math.cos(a0) * R * inner, iy + Math.sin(a0) * R * inner],
        [ix + Math.cos(a0) * R * outer, iy + Math.sin(a0) * R * outer],
        [ix + Math.cos(a1) * R * outer, iy + Math.sin(a1) * R * outer],
        [ix + Math.cos(a1) * R * inner, iy + Math.sin(a1) * R * inner],
      ];
      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      Object.assign(clone.style, {
        position: "absolute",
        left: `${r.left - pr.left + parent.scrollLeft}px`,
        top: `${r.top - pr.top + parent.scrollTop}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        margin: "0",
        boxSizing: "border-box",
        clipPath: `polygon(${p.map(([x, y]) => pct(x, y)).join(",")})`,
        pointerEvents: "none",
        zIndex: "1000",
        visibility: "visible",
      });
      parent.appendChild(clone);
      shards.push(clone);
      const am = (a0 + a1) / 2;
      const dist = (60 + Math.random() * 160) * force * (outer > 1 ? 1.4 : 1);
      const dx = Math.cos(am) * dist;
      const dy = Math.sin(am) * dist;
      const rot = (Math.random() - 0.5) * 120;
      const fall = 300 + Math.random() * 400;
      anims.push(
        clone.animate(
          [
            { transform: "translate(0,0) rotate(0)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.35 },
            { transform: `translate(${dx * 1.4}px, ${dy + fall}px) rotate(${rot}deg)`, opacity: 0 },
          ],
          { duration: 1400 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
        ),
      );
    }
  });
  el.style.visibility = "hidden";

  return {
    /** Fly every shard back and reassemble. */
    restore() {
      anims.forEach((a) => {
        a.playbackRate = -1.6;
        a.play();
      });
      window.setTimeout(() => {
        shards.forEach((s) => s.remove());
        el.style.visibility = prevVis;
      }, 1300);
    },
  };
}

export type PageShatterProps = ShatterOptions & { children?: React.ReactNode; animated?: boolean; className?: string };

/** React wrapper: click the child to shatter it; click again to restore. */
export function PageShatter({ children, animated = true, className = "", ...opts }: PageShatterProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const handle = React.useRef<ReturnType<typeof shatter> | null>(null);
  const [broken, setBroken] = React.useState(false);
  return (
    <div className={`relative grid h-full min-h-[380px] w-full place-items-center overflow-hidden bg-[#0b0b0d] p-6 ${className}`}>
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={broken ? "Shattered. Activate to restore." : "Activate to shatter"}
        onPointerDown={(e) => {
          if (!ref.current || broken || !animated) return;
          handle.current = shatter(ref.current, { ...opts, at: { x: e.clientX, y: e.clientY } });
          setBroken(true);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && ref.current && !broken && animated) {
            e.preventDefault();
            handle.current = shatter(ref.current, opts);
            setBroken(true);
          }
        }}
        className="cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {children ?? (
          <div className="w-[320px] rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-600 to-cyan-500 p-6 text-white shadow-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/80">Tap me</p>
            <p className="mt-2 text-3xl font-black leading-tight">This card is made of glass.</p>
            <p className="mt-2 text-sm text-white/80">Click anywhere on it — the impact point matters.</p>
          </div>
        )}
      </div>
      {broken && (
        <button
          type="button"
          onClick={() => {
            handle.current?.restore();
            window.setTimeout(() => setBroken(false), 1300);
          }}
          className="absolute bottom-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
        >
          ↺ Reassemble
        </button>
      )}
    </div>
  );
}

export default PageShatter;
