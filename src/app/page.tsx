import type { Metadata } from "next";
import { COMPONENTS } from "@/catalog";
import { JsonLd, siteJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import ComponentsIndexView from "@/views/ComponentsIndexView";

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PickUI components",
  numberOfItems: COMPONENTS.length,
  itemListElement: COMPONENTS.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/components/${c.slug}`,
    name: c.name,
  })),
};

export const metadata: Metadata = {
  title: "PickUI — components AI can't one-shot",
  description:
    "Free, hand-crafted React + Tailwind components with physics, 3D and tactile detail. Install with the shadcn CLI, copy one file, or paste an AI prompt.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PickUI — components AI can't one-shot",
    description: "Hand-crafted React + Tailwind components. Install, copy, or prompt.",
    url: "/",
  },
  twitter: { title: "PickUI — components AI can't one-shot", description: "Hand-crafted React + Tailwind components. Install, copy, or prompt." },
};

export default function ComponentsPage() {
  return (
    <>
      <JsonLd data={siteJsonLd} />
      <JsonLd data={itemList} />
      <ComponentsIndexView />
    </>
  );
}
