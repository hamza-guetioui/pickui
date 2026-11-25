import { COMPONENTS, getComponent } from "@/catalog";
import { readComponentSource, readUsageSource } from "@/lib/source";
import { zip } from "@/lib/zip";

/** /download/<slug>.zip — extensions ship as a ZIP (source + README), built statically from the real files. */
export const dynamic = "force-static";
export const dynamicParams = false;

const extensions = () => COMPONENTS.filter((c) => c.kind === "extension");

export function generateStaticParams() {
  return extensions().map((c) => ({ file: `${c.slug}.zip` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const c = getComponent(file.replace(/\.zip$/, ""));
  if (!c || c.kind !== "extension") return new Response("Not found", { status: 404 });

  const usage = c.usage ?? readUsageSource(c.slug, c.exportName);
  const readme = `# ${c.name}

${c.tagline}

${c.description}

## Install

1. Make sure Tailwind CSS is set up (v3 or v4).
2. Copy the \`.tsx\` file(s) from this folder into \`components/pickui/\`.

## Usage

\`\`\`tsx
${usage.trim()}
\`\`\`

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
${c.props.map((p) => `| \`${p.name}\` | \`${p.type.replace(/\|/g, "\\|")}\` | ${p.default ?? "—"} | ${p.description} |`).join("\n")}

MIT · PickUI by Hamza Guetioui
`;

  const body = zip([
    ...[c.slug, ...(c.includes ?? [])].map((s) => ({ name: `${c.slug}/${s}.tsx`, content: readComponentSource(s) })),
    { name: `${c.slug}/README.md`, content: readme },
  ]);

  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${c.slug}.zip"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
