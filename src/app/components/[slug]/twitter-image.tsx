import { COMPONENTS } from "@/catalog";
import OgImage from "./opengraph-image";

export const alt = "pickui component";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export default function Image(props: { params: Promise<{ slug: string }> }) {
  return OgImage(props);
}
