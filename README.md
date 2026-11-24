# PickUI

**Hand-crafted React + Tailwind components that AI can't one-shot** — physics, real 3D, tactile detail.
Install one with the shadcn CLI, copy a single file, or paste an AI prompt that keeps the details intact.

🌐 **Live catalogue:** https://pickui.guetix.com · 📄 MIT

- **94 pieces** — 42 components, 22 blocks, 8 templates, 17 packages and 5 mini-games.
- **Zero dependencies.** Every piece is one self-contained `.tsx` file: React + Tailwind CSS, nothing else.
- **Accessible.** Keyboard support, labels, and `prefers-reduced-motion` handled in every component.
- **Animated / Regular.** Every component has a calm version (`animated={false}`).

## Use a component

Pick one on the [catalogue](https://pickui.guetix.com/components), then either:

```bash
# 1. shadcn CLI — writes components/pickui/<slug>.tsx and installs nothing else
npx shadcn@latest add https://pickui.guetix.com/r/holo-card.json
```

2. **Copy** — copy the file from its docs page (or from [`src/library/`](src/library)) into your project.
3. **Prompt** — "Copy AI prompt" gives Cursor / Claude / v0 / Copilot the exact source plus instructions not
   to "simplify" it.

```tsx
import { HoloCard } from "@/components/pickui/holo-card";

export default function Page() {
  return <HoloCard name="Ada Lovelace" role="Engineer" />;
}
```

Requirements: React 18+ and Tailwind CSS (v3 or v4). Components are client components (`"use client"`).

## Repository layout

```
src/
  library/      the components — one self-contained file each (this is the product)
  demos/        the live demo shown on each docs page (optional per component)
  catalog/      metadata for every entry: name, category, props, a11y notes, variants…
  app/          the docs site (Next.js App Router) + the shadcn registry at /r/<slug>.json
  ui/ views/    docs-site UI (chrome, playground, catalogue grid, docs page)
  lib/          site settings, source reader, AI-prompt builder, code highlighter
scripts/
  check-registry.mjs   verifies catalogue ↔ files ↔ "React-only imports" contract
```

The docs page, the copy buttons, the registry JSON and the AI prompt are all generated from the **real
source files** at build time, so they can never drift from what renders.

## Run the docs site locally

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm run check:registry && npm run build
```

Deploying your own copy (e.g. a fork)? Set `NEXT_PUBLIC_SITE_URL` (used in install commands, the AI prompt,
canonical URLs and the sitemap) and optionally `NEXT_PUBLIC_REPO_URL`. See [`.env.example`](.env.example).
No secrets are needed.

## Packages

Entries of kind **package** have a framework-agnostic core plus a React wrapper. They are planned as npm
packages under `@pickui/*` but **are not published yet** — use the CLI or copy the file in the meantime.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Hamza Guetioui — [guetix.com](https://guetix.com)
