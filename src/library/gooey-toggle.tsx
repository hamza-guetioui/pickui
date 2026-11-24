"use client";

import * as React from "react";

/**
 * GooeyToggle — a switch whose knob is liquid: it stretches, splits a droplet
 * and merges on the other side thanks to an SVG "goo" filter (blur + alpha
 * threshold). Feels like mercury.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type GooeyToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  /** Color when on. */
  color?: string;
  /** false = plain sliding knob, no goo (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
.gx-gt-knob{transition:transform .55s cubic-bezier(.6,-0.4,.3,1.4)}
.gx-gt-drop{transition:transform .55s cubic-bezier(.2,.9,.3,1.2) .06s}
.gx-gt-drop2{transition:transform .55s cubic-bezier(.4,0,.2,1) .12s}
@media (prefers-reduced-motion:reduce){.gx-gt-knob,.gx-gt-drop,.gx-gt-drop2{transition:none}}
`;

export function GooeyToggle({
  checked,
  defaultChecked = false,
  onChange,
  label = "Liquid mode",
  color = "#4ade80",
  animated = true,
  className = "",
}: GooeyToggleProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;
  const fid = React.useId().replace(/:/g, "");
  const x = on ? 36 : 0;

  return (
    <label className={`inline-flex cursor-pointer select-none items-center gap-3 ${className}`}>
      <style>{css}</style>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id={`goo-${fid}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
      </svg>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => {
          if (checked === undefined) setInner(!on);
          onChange?.(!on);
        }}
        className="relative h-9 w-[76px] rounded-full outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={{ background: on ? `color-mix(in srgb, ${color} 22%, #111)` : "#1a1a1d", boxShadow: "inset 0 2px 6px rgba(0,0,0,.6)" }}
      >
        <span className="absolute inset-0" style={animated ? { filter: `url(#goo-${fid})` } : undefined}>
          <span
            className="gx-gt-knob absolute left-1 top-1 h-7 w-7 rounded-full"
            style={{ transform: `translateX(${x}px)`, background: on ? color : "#e5e5e5" }}
          />
          {animated && (
            <>
              <span
                className="gx-gt-drop absolute left-[10px] top-[10px] h-4 w-4 rounded-full"
                style={{ transform: `translateX(${x}px)`, background: on ? color : "#e5e5e5" }}
              />
              <span
                className="gx-gt-drop2 absolute left-[12px] top-[12px] h-3 w-3 rounded-full"
                style={{ transform: `translateX(${x}px)`, background: on ? color : "#e5e5e5" }}
              />
            </>
          )}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1 h-7 w-7 rounded-full bg-gradient-to-br from-white/60 to-transparent opacity-60 transition-transform duration-500"
          style={{ transform: `translateX(${x}px) scale(.55) translate(-30%,-30%)` }}
        />
      </button>
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

export default GooeyToggle;
