# AGENTS.md — PickUI

> **Index only.** Small and always loaded. Detail lives in `context/`.
> The existing code is the source of truth: describe what is there, don't redesign or refactor
> during normal work.

## Product

**PickUI** (https://pickui.guetix.com · https://github.com/hamza-guetioui/pickui) is an open-source
(MIT) library of hand-crafted React + Tailwind UI by **Hamza Guetioui**: components, blocks, templates,
extensions and mini-games. Each piece is **one self-contained file**, installed with the shadcn CLI,
copied, or pasted into an AI assistant as a ready-made prompt. The Next.js app in this repo is the docs
site and live catalogue. It was split out of guetix.com (which now 308-redirects `/components` and
`/r/*` here). There's no backend, database or secrets.

## Tech stack (exact)

- **Next.js** 15.5.29 (App Router, static generation; `next dev --turbopack`) · **React** 19 · **TypeScript** 5 strict
- **Tailwind CSS** 3.4 · **lucide-react** (docs site only) · `clsx`
- No other runtime deps. **Library files may import only `react`** (enforced).
- npm (`package-lock.json`) · Node **22** (`.nvmrc`; engines `>=20`) · ESLint 9 (`eslint-config-next`)
- Hosting: Vercel (production = `main`), domain `pickui.guetix.com`

## Top-level structure

```
src/library/   THE PRODUCT — one file per piece (<slug>.tsx), "use client", React-only imports
src/catalog/   metadata for every piece: index.ts (types, CORE entries, helpers) + components.ts (MORE),
               blocks-templates.ts (WAVE3), packages-games.ts (WAVE4: extensions + games)
src/demos/     custom preview for a slug (optional; _site.tsx = FakeSite backdrop)
src/ui/        docs-site UI: demos.tsx (slug → preview registry), Playground, PreviewStage, Catalog,
               UIChrome (header/footer/⌘K/theme), Logo + brand.ts, TabTricks (site favicon trick), Code*
src/views/     ComponentsIndexView (home catalogue) · ComponentDocView (docs page)
src/app/       routes: / (catalogue) · /components/[slug] · /r/[file] (shadcn registry JSON) · OG images,
               sitemap, robots, 404/error
src/lib/       site.ts (URLs/author/env) · source.ts (reads real source) · prompt.ts (AI prompt) ·
               highlight.ts · jsonld.tsx
scripts/       check-registry.mjs (consistency gate) · brand.mjs (writes favicon + .github/logo.svg)
context/       AI/maintainer docs (see map below)
```

## Non-negotiable rules

1. **Library files are self-contained:** first line `"use client";`, import only `react` or a sibling
   library file listed in the entry's `includes` (e.g. games → `arcade-cabinet`). No `@/` aliases, no
   packages. `npm run check:registry` enforces it.
2. **Every library file has a catalogue entry, and every entry has a preview** in `src/ui/demos.tsx`
   (`auto(...)` = render the component with defaults, `demo(...)` = custom `src/demos/<slug>.tsx`).
3. **Docs never drift from the code:** the code tab, copy button, shadcn JSON and AI prompt are all read
   from the real file at build time (`src/lib/source.ts`). Don't hand-copy source into docs.
4. **Accessibility and motion:** respect `prefers-reduced-motion`. Every piece supports
   `animated={false}` (or documented variants) and is keyboard-usable where it's interactive.
5. **No secrets, no tracking, no external fonts or images.** Never commit `.env*`. Original artwork only:
   no copyrighted or trademarked characters (the repo is MIT and public).
6. **Shell:** Windows host; the default sandbox shell is PowerShell, so use the Bash tool (git-bash)
   for POSIX commands.

## Commands

| Task | Command |
| --- | --- |
| Dev | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Registry gate | `npm run check:registry` |
| Build | `npm run build` (needs no env vars) |
| Brand assets | `node --experimental-strip-types scripts/brand.mjs` (after editing `src/ui/brand.ts`) |

There's no unit-test runner. Verify visually in a browser: the docs pages render every variant.

## Git workflow

- **`main`** = production (Vercel deploys it), default branch. **`dev`** = integration branch. All work
  branches from `dev`, and PRs target `dev`. Releases are a PR `dev` → `main`.
- Small commits and a clean `git status`. CI (`.github/workflows/ci.yml`) runs lint, typecheck,
  registry and build on PRs and on pushes to `main`/`dev`.
- **Don't push, open PRs, merge or deploy without the owner's explicit approval.** No force-push,
  `reset --hard` or branch deletion without approval.
- Update `CHANGELOG.md` (`## Unreleased`) for user-visible changes, and keep the README counts true.

## Documentation map

| File | Answers |
| --- | --- |
| `context/project-overview.md` | what & why, audiences, catalogue contents, scope |
| `context/architecture.md` | routing, catalogue → docs pipeline, previews, registry, SEO |
| `context/adding-a-piece.md` | step-by-step: new component / block / template / extension / game |
| `context/code-standards.md` | conventions for library files, demos, catalogue entries |
| `context/ui-context.md` | docs-site theme tokens, brand/logo, FakeSite, layout |
| `context/progress-tracker.md` | current state, recent changes, open questions, next steps |

## Ask before

Adding dependencies, changing `package.json`/configs, changing the done-gate or CI, renaming
slugs (breaks install URLs), or removing catalogue pieces. Protected paths are guarded by
`.pi/extensions/protected-paths.ts`.

## Done-gate

1. `npm run lint` → no warnings or errors.
2. `npm run typecheck` and `npm run check:registry` pass.
3. `npm run build` succeeds.
4. Changed pieces checked in a browser (all variants, light/dark, reduced motion).
5. `context/progress-tracker.md` (and `CHANGELOG.md` if user-visible) updated.
