import { COMPONENTS, getComponent } from "@/catalog";
import { OG_SIZE, ogImage } from "../../og";

export const alt = "pickui component";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export default async function ComponentOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) return ogImage({ title: "Not found", sub: "pickui.guetix.com" });
  return ogImage({ eyebrow: `${c.kind ?? "component"} · ${c.category}`, title: c.name, sub: c.tagline });
}
