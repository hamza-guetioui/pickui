import { COMPONENTS } from "@/catalog";
import { OG_SIZE, ogImage } from "./og";

export const alt = "pickui: React + Tailwind components AI can't one-shot";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return ogImage({
    title: "UI that AI can't one-shot.",
    sub: `${COMPONENTS.length} hand-crafted React + Tailwind components · zero dependencies · MIT`,
  });
}
