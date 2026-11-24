import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent } from "@/catalog";
import { JsonLd, author } from "@/lib/jsonld";
import { REPO_URL, SITE_URL } from "@/lib/site";
import ComponentDocView from "@/views/ComponentDocView";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) return {};
  const kind = c.kind ?? "component";
  const title = `${c.name} — React + Tailwind ${kind} · PickUI`;
  return {
    title,
    description: `${c.tagline} Free, open-source (MIT), zero dependencies. Install with the shadcn CLI or copy one file.`,
    keywords: [c.name, ...(c.tags ?? []), "react", "tailwind", kind],
    alternates: { canonical: `/components/${c.slug}` },
    openGraph: { type: "article", title, description: c.tagline, url: `/components/${c.slug}` },
    twitter: { title, description: c.tagline },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) notFound();
  const url = `${SITE_URL}/components/${c.slug}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: c.name,
      description: c.tagline,
      url,
      codeRepository: REPO_URL,
      programmingLanguage: ["TypeScript", "React"],
      runtimePlatform: "React 18+, Tailwind CSS",
      license: "https://opensource.org/licenses/MIT",
      keywords: (c.tags ?? []).join(", "),
      isAccessibleForFree: true,
      author,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Components", item: `${SITE_URL}/components` },
        { "@type": "ListItem", position: 2, name: c.name, item: url },
      ],
    },
  ];
  return (
    <>
      <JsonLd data={ld} />
      <ComponentDocView c={c} />
    </>
  );
}
