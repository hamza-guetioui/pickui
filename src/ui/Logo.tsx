import { createElement } from "react";
import { BRAND, SHAPES, VIEWBOX } from "./brand";

/**
 * PickUI logo: three identical floating plates (pink, pink/gray, gray UI card)
 * joined by dashed guides — see brand.ts — + "pickui" wordmark.
 */
export function PickMark({ className = "h-7 w-7", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={VIEWBOX}
      className={`overflow-visible ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {SHAPES.map((s, i) => createElement(s.tag, { key: i, ...s.attrs }))}
    </svg>
  );
}

/** Mark + "pickui" wordmark. */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`pu-logo inline-flex items-center gap-2 ${className}`}>
      <PickMark className={lg ? "h-9 w-9" : "h-7 w-7"} />
      <span className={`font-black lowercase leading-none tracking-[-0.06em] ui-ink ${lg ? "text-2xl" : "text-[19px]"}`}>
        pick<span style={{ color: BRAND.pink }}>ui</span>
      </span>
    </span>
  );
}
