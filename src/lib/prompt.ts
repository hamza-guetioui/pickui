import type { ComponentEntry } from "../catalog";
import { installPath, variantsFor } from "../catalog";
import { SITE_NAME, SITE_URL } from "./site";

/**
 * A prompt a vibe-coder can paste into Cursor / Claude / v0 / Copilot.
 * It ships the exact source and tells the assistant NOT to "simplify" it —
 * the usual way AI breaks crafted UI.
 */
export function buildPrompt(
  c: ComponentEntry,
  source: string,
  usage: string,
  extras: { path: string; code: string }[] = [],
): string {
  const extraFiles = extras
    .map((f) => `
It imports \`${f.path}\` — create it too, EXACTLY as follows:
\`\`\`tsx
${f.code.trim()}
\`\`\`
`)
    .join("");
  const props = c.props.map((p) => `- \`${p.name}\` (${p.type}${p.default ? `, default ${p.default}` : ""}): ${p.description}`).join("\n");
  const versions = variantsFor(c)
    .map((v) => `- ${v.label}: \`${v.prop}\` — ${v.hint}`)
    .join("\n");
  return `Add the "${c.name}" component from ${SITE_NAME} (${SITE_URL}/components/${c.slug}) to my project.

What it is: ${c.tagline}

Requirements:
- Stack: React 18+ (Next.js App Router is fine) and Tailwind CSS. It has NO other dependencies — do not add any.
- Create the file \`${installPath(c.slug)}\` with EXACTLY the source below. Do not rewrite, "clean up", simplify or convert it: the CSS variables, masks, keyframes and timings are deliberate and the effect breaks if they change.
- It is a client component ("use client" is already at the top).
- Then render it where I ask, following the usage example. Only change texts, colors and props to match my brand.
- Keep the accessibility behaviour (labels, keyboard support, prefers-reduced-motion).

Props:
${props}

Versions (pick with props):
${versions}

Usage example:
\`\`\`tsx
${usage.trim()}
\`\`\`

Source of \`${installPath(c.slug)}\`:
\`\`\`tsx
${source.trim()}
\`\`\`

${extraFiles}
Where should I put it? Ask me which page/section if it is not obvious.`;
}
