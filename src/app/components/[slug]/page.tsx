import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent } from "@/catalog";
import ComponentDocView from "@/views/ComponentDocView";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) return {};
  const title = `${c.name} — React + Tailwind component · PickUI`;
  return {
    title,
    description: c.tagline,
    alternates: { canonical: `/components/${c.slug}` },
    openGraph: { title, description: c.tagline, url: `/components/${c.slug}` },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) notFound();
  return <ComponentDocView c={c} />;
}
