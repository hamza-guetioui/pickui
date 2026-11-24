import OgImage from "./opengraph-image";

// X/Twitter card uses the same image as Open Graph.
export const alt = "pickui: React + Tailwind components AI can't one-shot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OgImage();
}
