import { COMPONENTS, getComponent } from "@/catalog";
import { readComponentSource } from "@/lib/source";

/**
 * shadcn registry items for PickUI:
 *   npx shadcn@latest add <SITE_URL>/r/<slug>.json
 * Also consumed by "Open in v0". Built statically from the real source files.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ file: `${c.slug}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.json$/, "");
  const c = getComponent(slug);
  if (!c) return new Response("Not found", { status: 404 });

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: c.slug,
    type: c.kind === "template" ? "registry:block" : c.kind === "block" ? "registry:block" : "registry:component",
    title: c.name,
    description: c.tagline,
    dependencies: [],
    files: [c.slug, ...(c.includes ?? [])].map((s) => ({
      path: `registry/pickui/${s}.tsx`,
      type: "registry:component",
      target: `components/pickui/${s}.tsx`,
      content: readComponentSource(s),
    })),
    categories: [c.category.toLowerCase()],
  };

  return new Response(JSON.stringify(item, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
    },
  });
}
