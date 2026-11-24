# AGENTS.md — PickUI

Open-source React + Tailwind component library (MIT) with a Next.js 15 docs site.

- `src/library/*.tsx` is the product: self-contained, **React-only imports**, `"use client"`.
- Catalogue metadata: `src/catalog/` (`index.ts` = types + core entries + helpers). Demos: `src/demos/` +
  `src/ui/demos.tsx`.
- Site URL/repo/author: `src/lib/site.ts` (env `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_REPO_URL`).
- Done-gate: `npm run lint`, `npm run typecheck`, `npm run check:registry`, `npm run build` all pass.
- No secrets, no backend. Never commit `.env*` files.
