import type { Metadata } from "next";
import ComponentsIndexView from "@/views/ComponentsIndexView";

export const metadata: Metadata = {
  title: "PickUI — components AI can't one-shot",
  description:
    "Free, hand-crafted React + Tailwind components with physics, 3D and tactile detail. Install with the shadcn CLI, copy one file, or paste an AI prompt.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "PickUI — components AI can't one-shot",
    description: "Hand-crafted React + Tailwind components. Install, copy, or prompt.",
    url: "/components",
  },
};

export default function ComponentsPage() {
  return <ComponentsIndexView />;
}
