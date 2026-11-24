import { ImageResponse } from "next/og";
import { BRAND, PLATES } from "@/ui/brand";

export const OG_SIZE = { width: 1200, height: 630 };

/** The isometric layer-stack mark, drawn for Satori (no CSS classes). */
function Mark({ size }: { size: number }) {
  const { bottom: b, middle: m, top: t } = PLATES;
  return (
    <svg width={size} height={size} viewBox="4 6 56 56">
      <defs>
        <linearGradient id="g" x1="9" y1="8" x2="55" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND.pink} />
          <stop offset="1" stopColor={BRAND.violet} />
        </linearGradient>
      </defs>
      {[
        [b, "#3f3f46"],
        [m, "#71717a"],
      ].map(([p, c], i) => (
        <g key={i} stroke={c as string} strokeWidth="2" strokeLinejoin="round">
          <path d={(p as typeof b).left} fill={c as string} />
          <path d={(p as typeof b).right} fill={c as string} />
          <path d={(p as typeof b).top} fill={c as string} />
        </g>
      ))}
      <path d={t.left} fill="#c0266a" stroke="#c0266a" strokeWidth="2" strokeLinejoin="round" />
      <path d={t.right} fill="#6d3fd6" stroke="#6d3fd6" strokeWidth="2" strokeLinejoin="round" />
      <path d={t.top} fill="url(#g)" stroke="url(#g)" strokeWidth="2" strokeLinejoin="round" />
      <path d={t.inset} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Shared Open Graph card: brand row, big title, sub line, optional eyebrow. */
export function ogImage({ eyebrow, title, sub: raw }: { eyebrow?: string; title: string; sub: string }) {
  // the built-in OG font has no glyphs for these
  const sub = raw.replace(/⌘/g, "Cmd ").replace(/✕/g, "×");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#08080b",
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -200,
            width: 760,
            height: 760,
            borderRadius: 999,
            background: `radial-gradient(circle, ${BRAND.pink}55, ${BRAND.violet}22 45%, transparent 70%)`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark size={84} />
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, letterSpacing: -4 }}>
            pick<span style={{ color: BRAND.pink }}>ui</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <div style={{ display: "flex", fontSize: 26, color: BRAND.pink, letterSpacing: 6, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: title.length > 22 ? 72 : 92, fontWeight: 900, letterSpacing: -4, lineHeight: 1.02, marginTop: 10 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#a1a1aa", maxWidth: 1000 }}>{sub}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
