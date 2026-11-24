import { ImageResponse } from "next/og";
import { createElement } from "react";
import { BRAND, SHAPES, VIEWBOX } from "@/ui/brand";

export const OG_SIZE = { width: 1200, height: 630 };

/** The layer-stack mark, drawn for Satori. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX}>
      {SHAPES.map((s, i) => createElement(s.tag, { key: i, ...s.attrs }))}
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
