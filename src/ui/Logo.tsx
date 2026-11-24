import { useId } from "react";

/**
 * PickUI brand.
 * Mark: a guitar pick (the "pick") with a pointer cut through it (the "UI"),
 * on the brand gradient pink → violet. Wordmark: lowercase "pickui", "ui" in gradient.
 */
export const BRAND = { pink: "#ff4d8d", violet: "#8b5cf6", ink: "#0b0b10" } as const;

/** Guitar-pick outline (viewBox 0 0 64 64). */
export const PICK_PATH =
  "M32 3.5c15.6 0 27.5 6.4 27.5 19 0 15.3-14.7 30.6-24.6 37.4a5.1 5.1 0 0 1-5.8 0C19.2 53.1 4.5 37.8 4.5 22.5 4.5 9.9 16.4 3.5 32 3.5Z";
/** Pointer cursor, tip at the pick's sweet spot. */
export const CURSOR_PATH = "M25 15.5v27.2l7.1-6.6 4.6 10.4 5-2.2-4.6-10.2 9.6-.4L25 15.5Z";

export function PickMark({ className = "h-7 w-7", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}g`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND.pink} />
          <stop offset="1" stopColor={BRAND.violet} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="32" y1="4" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={PICK_PATH} fill={`url(#${id}g)`} />
      {/* sheen, like a real celluloid pick */}
      <path d="M32 7c-12 0-22.6 4.6-23.9 13.6C14 15 22 12.6 32 12.6S50 15 55.9 20.6C54.6 11.6 44 7 32 7Z" fill={`url(#${id}s)`} />
      <path d={CURSOR_PATH} fill="#fff" stroke={BRAND.ink} strokeOpacity=".35" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Mark + "pickui" wordmark. */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <PickMark className={lg ? "h-9 w-9" : "h-7 w-7"} />
      <span className={`font-black lowercase leading-none tracking-[-0.06em] ui-ink ${lg ? "text-2xl" : "text-[19px]"}`}>
        pick
        <span className="bg-gradient-to-r from-[#ff4d8d] to-[#8b5cf6] bg-clip-text text-transparent">ui</span>
      </span>
    </span>
  );
}
