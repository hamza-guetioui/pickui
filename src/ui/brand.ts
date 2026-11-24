/**
 * PickUI brand geometry (pure TS, no React) — shared by the Logo component,
 * the OG image and scripts/brand.mjs (favicon + README logo).
 * Mark: an isometric stack of UI layers (the exploded stack from the home hero)
 * with the top layer lifted out: you "pick" one piece of UI.
 */
export const BRAND = { pink: "#ff4d8d", violet: "#8b5cf6", ink: "#0b0b10" } as const;

const W = 23; // half width of a plate (viewBox 0 0 64 64)
const H = 11.5; // half height (2:1 isometric)
const D = 4; // plate thickness

/** Geometry of one isometric plate centred at (32, cy). */
export function plate(cy: number) {
  const l = 32 - W, r = 32 + W;
  return {
    top: `M32 ${cy - H}L${r} ${cy}L32 ${cy + H}L${l} ${cy}Z`,
    left: `M${l} ${cy}L32 ${cy + H}L32 ${cy + H + D}L${l} ${cy + D}Z`,
    right: `M32 ${cy + H}L${r} ${cy}L${r} ${cy + D}L32 ${cy + H + D}Z`,
    /** inset "keycap" outline on the top face */
    inset: `M32 ${cy - H + 4.6}L${r - 9.2} ${cy}L32 ${cy + H - 4.6}L${l + 9.2} ${cy}Z`,
  };
}

/** Plates, bottom → top. The top one is lifted. */
export const PLATES = { bottom: plate(45), middle: plate(37), top: plate(19.5) } as const;
/** Standalone SVG string (favicon / README / OG). */
export function markSvg({ base = "#3f3f46", mid = "#71717a" } = {}) {
  const { bottom: b, middle: m, top: t } = PLATES;
  const face = (p: ReturnType<typeof plate>, c: string) =>
    `<g stroke="${c}" stroke-width="2" stroke-linejoin="round"><path d="${p.left}" fill="${c}" opacity=".75"/><path d="${p.right}" fill="${c}" opacity=".55"/><path d="${p.top}" fill="${c}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 6 56 56"><defs><linearGradient id="g" x1="9" y1="8" x2="55" y2="31" gradientUnits="userSpaceOnUse"><stop stop-color="${BRAND.pink}"/><stop offset="1" stop-color="${BRAND.violet}"/></linearGradient></defs>${face(b, base)}${face(m, mid)}<path d="M32 31.5V37.5M9 19.5V36M55 19.5V36" stroke="${mid}" stroke-width="1.4" stroke-dasharray="1.6 2.2" stroke-linecap="round"/><g stroke-linejoin="round" stroke-width="2"><path d="${t.left}" fill="#c0266a" stroke="#c0266a"/><path d="${t.right}" fill="#6d3fd6" stroke="#6d3fd6"/><path d="${t.top}" fill="url(#g)" stroke="url(#g)"/></g><path d="${t.inset}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
}
