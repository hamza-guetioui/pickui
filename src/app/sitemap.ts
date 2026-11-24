import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/catalog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...COMPONENTS.map((c) => ({ url: `${SITE_URL}/components/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
