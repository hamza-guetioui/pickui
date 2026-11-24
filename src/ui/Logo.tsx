import { useId } from "react";

import { BRAND, PLATES } from "./brand";

/**
 * PickUI logo: isometric layer stack with the top layer lifted (see brand.ts)
 * + lowercase "pickui" wordmark with "ui" in the brand gradient.
 */
export function PickMark({ className = "h-7 w-7", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const { bottom: b, middle: m, top: t } = PLATES;
  return (
    <svg
      viewBox="4 6 56 56"
      className={`pu-mark overflow-visible ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="9" y1="8" x2="55" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND.pink} />
          <stop offset="1" stopColor={BRAND.violet} />
        </linearGradient>
      </defs>
      {/* lower layers follow the text colour so they work on light and dark */}
      {[b, m].map((p, i) => (
        <g key={i} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity={i ? 0.55 : 0.28}>
          <path d={p.left} fill="currentColor" fillOpacity=".7" />
          <path d={p.right} fill="currentColor" fillOpacity=".45" />
          <path d={p.top} fill="currentColor" />
        </g>
      ))}
      <path
        d="M32 31.5V37.5M9 19.5V36M55 19.5V36"
        stroke="currentColor"
        strokeOpacity=".4"
        strokeWidth="1.4"
        strokeDasharray="1.6 2.2"
        strokeLinecap="round"
      />
      <g className="pu-mark-top" strokeLinejoin="round" strokeWidth="2">
        <path d={t.left} fill="#c0266a" stroke="#c0266a" />
        <path d={t.right} fill="#6d3fd6" stroke="#6d3fd6" />
        <path d={t.top} fill={`url(#${id}g)`} stroke={`url(#${id}g)`} />
        <path d={t.inset} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/** Mark + "pickui" wordmark. The top layer lifts a little more on hover. */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`pu-logo inline-flex items-center gap-2 ${className}`}>
      <PickMark className={`ui-ink ${lg ? "h-9 w-9" : "h-7 w-7"}`} />
      <span className={`font-black lowercase leading-none tracking-[-0.06em] ui-ink ${lg ? "text-2xl" : "text-[19px]"}`}>
        pick
        <span className="bg-gradient-to-r from-[#ff4d8d] to-[#8b5cf6] bg-clip-text text-transparent">ui</span>
      </span>
    </span>
  );
}
