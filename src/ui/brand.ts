/**
 * PickUI brand geometry (pure TS, no React) — shared by the Logo component,
 * the OG image and scripts/brand.mjs (favicon + README logo).
 *
 * Mark: three identical flat plates floating apart (the home hero's exploded
 * stack). Easy to draw: the same thin diamond three times, 11 units apart, with
 * dashed guides between their side corners.
 *   bottom = pink · middle = pink mixed with gray · top = gray UI card
 */
export const BRAND = { pink: "#ff4d8d", mix: "#b85f83", gray: "#a1a1aa", violet: "#8b5cf6", ink: "#0b0b10" } as const;

export const VIEWBOX = "6 5 52 52";

const HW = 23; // half width
const HH = 10; // half height (flatter than 2:1 so it reads as a layer, not a box)
const T = 3; // plate thickness

/** Top face of a plate centred at (32, cy). */
const face = (cy: number) => `M32 ${cy - HH}L${32 + HW} ${cy}L32 ${cy + HH}L${32 - HW} ${cy}Z`;
/** Front edge (thickness) of a plate. */
const edge = (cy: number) =>
  `M${32 - HW} ${cy}L32 ${cy + HH}L${32 + HW} ${cy}V${cy + T}L32 ${cy + HH + T}L${32 - HW} ${cy + T}Z`;

type Shape = { tag: "path" | "ellipse"; attrs: Record<string, string | number> };

const plate = (cy: number, top: string, side: string): Shape[] => [
  { tag: "path", attrs: { d: edge(cy), fill: side, stroke: side, strokeWidth: 1, strokeLinejoin: "round" } },
  { tag: "path", attrs: { d: face(cy), fill: top, stroke: top, strokeWidth: 1, strokeLinejoin: "round" } },
];
const dash = { fill: "none", stroke: BRAND.gray, strokeWidth: 1.2, strokeDasharray: "1.6 2", strokeLinecap: "round" };

/** Everything in the mark, in paint order (bottom plate first). */
export const SHAPES: Shape[] = [
  ...plate(41, BRAND.pink, "#c9356c"),
  { tag: "path", attrs: { d: "M9 33V39M55 33V39", ...dash } },
  ...plate(30, BRAND.mix, "#8e4865"),
  // stitched seam along the middle plate's front
  { tag: "path", attrs: { d: "M13 29.2L32 37.5L51 29.2", fill: "none", stroke: "#fff", strokeOpacity: 0.45, strokeWidth: 1, strokeDasharray: "1.8 2.2" } },
  { tag: "path", attrs: { d: "M9 22V28M55 22V28", ...dash } },
  ...plate(19, BRAND.gray, "#71717a"),
  // the top plate is a tiny UI card: window dots, two text lines, a pink button
  { tag: "ellipse", attrs: { cx: 19.4, cy: 18.5, rx: 1.3, ry: 0.85, fill: BRAND.pink } },
  { tag: "ellipse", attrs: { cx: 21.2, cy: 17.7, rx: 1.3, ry: 0.85, fill: BRAND.mix } },
  { tag: "ellipse", attrs: { cx: 23.1, cy: 16.9, rx: 1.3, ry: 0.85, fill: "#fff" } },
  { tag: "path", attrs: { d: "M21.7 21.5L32 17M26.3 22.5L33.2 19.5", fill: "none", stroke: "#fff", strokeOpacity: 0.8, strokeWidth: 1.5, strokeLinecap: "round" } },
  { tag: "path", attrs: { d: "M37.1 18.8L41.2 17", fill: "none", stroke: BRAND.pink, strokeWidth: 2.4, strokeLinecap: "round" } },
];

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

/** Standalone SVG string (favicon / README). */
export function markSvg() {
  const body = SHAPES.map(
    (s) => `<${s.tag} ${Object.entries(s.attrs).map(([k, v]) => `${kebab(k)}="${v}"`).join(" ")}/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">${body}</svg>`;
}
