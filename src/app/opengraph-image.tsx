import { ImageResponse } from "next/og";
import { COMPONENTS } from "@/catalog";
import { BRAND, CURSOR_PATH, PICK_PATH } from "@/ui/Logo";

export const alt = "pickui — React + Tailwind components AI can't one-shot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#08080b", color: "#fff", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -260, right: -200, width: 760, height: 760, borderRadius: 999, background: `radial-gradient(circle, ${BRAND.pink}55, ${BRAND.violet}22 45%, transparent 70%)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="g" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor={BRAND.pink} />
                <stop offset="1" stopColor={BRAND.violet} />
              </linearGradient>
            </defs>
            <path d={PICK_PATH} fill="url(#g)" />
            <path d={CURSOR_PATH} fill="#fff" />
          </svg>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, letterSpacing: -5 }}>
            pick<span style={{ color: BRAND.pink }}>ui</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>{"UI that AI can't one-shot."}</div>
          <div style={{ marginTop: 26, fontSize: 28, color: "#a1a1aa" }}>
            {`${COMPONENTS.length} hand-crafted React + Tailwind components · zero dependencies · MIT`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
