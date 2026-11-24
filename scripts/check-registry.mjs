// Sanity checks for the catalogue ↔ files contract. Run: npm run check:registry
// - every catalogue slug has src/library/<slug>.tsx
// - every `includes` entry exists
// - every library/demo file belongs to a catalogue entry (or is included by one)
// - every catalogue slug has a preview registered in src/ui/demos.tsx
// - library files are self-contained: they import only "react"
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "src");
const catalogDir = path.join(root, "catalog");
const read = (f) => fs.readFileSync(f, "utf8");
const catalog = fs.readdirSync(catalogDir).map((f) => read(path.join(catalogDir, f))).join("\n");

const slugs = [...catalog.matchAll(/^\s{4}slug: "([\w-]+)"/gm)].map((m) => m[1]);
const includes = [...catalog.matchAll(/includes: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"([\w-]+)"/g)].map((x) => x[1]));
const lib = new Set(fs.readdirSync(path.join(root, "library")).map((f) => f.replace(/\.tsx?$/, "")));
const demos = fs.readdirSync(path.join(root, "demos")).filter((f) => !f.startsWith("_")).map((f) => f.replace(/\.tsx$/, ""));

const errors = [];
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupes.length) errors.push(`duplicate slugs: ${dupes.join(", ")}`);
for (const s of [...slugs, ...includes]) if (!lib.has(s)) errors.push(`missing src/library/${s}.tsx`);
const known = new Set([...slugs, ...includes]);
for (const s of lib) if (!known.has(s)) errors.push(`orphan library file: ${s}`);
for (const d of demos) if (!known.has(d)) errors.push(`orphan demo file: ${d}`);

const demosRegistry = read(path.join(root, "ui", "demos.tsx"));
const registered = new Set([...demosRegistry.matchAll(/^\s{2}"?([\w-]+)"?: /gm)].map((m) => m[1]));
for (const s of slugs) if (!registered.has(s)) errors.push(`no preview registered for "${s}" in src/ui/demos.tsx`);

for (const f of fs.readdirSync(path.join(root, "library"))) {
  const src = read(path.join(root, "library", f));
  for (const m of src.matchAll(/^import[^"']*["']([^"']+)["']/gm)) {
    const spec = m[1];
    if (spec !== "react" && !spec.startsWith("./")) errors.push(`${f}: imports "${spec}" (library files may only import react or sibling library files)`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(`✓ ${slugs.length} catalogue entries, ${lib.size} library files, ${demos.length} demos — all consistent.`);
