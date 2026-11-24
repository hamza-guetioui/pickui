import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Reads the real component/demo source so the docs, the copy buttons, the
 * shadcn registry JSON and the AI prompt can never drift from what renders.
 * Runs at build time (all routes are statically generated).
 */
const ROOT = path.join(process.cwd(), "src");

export function readComponentSource(slug: string): string {
  return fs.readFileSync(path.join(ROOT, "library", `${slug}.tsx`), "utf8").replace(/\r\n/g, "\n");
}

/** Demo source with its import rewritten to where the user installs the file.
 *  Components without a demo file get a minimal generated example. */
export function readUsageSource(slug: string, exportName = "Component"): string {
  const file = path.join(ROOT, "demos", `${slug}.tsx`);
  if (!fs.existsSync(file)) {
    return `import { ${exportName} } from "@/components/pickui/${slug}";

export default function Example() {
  return <${exportName} />;
}
`;
  }
  return fs
    .readFileSync(file, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/from "\.\.\/library\/([\w-]+)"/g, 'from "@/components/pickui/$1"');
}
