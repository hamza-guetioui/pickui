# Architecture — PickUI

Static Next.js 15 App Router site. Every page is statically generated at build time; nothing runs on
a server at request time.

## Routes (`src/app/`)

| Route | File | What |
| --- | --- | --- |
| `/` | `page.tsx` → `views/ComponentsIndexView.tsx` | hero + filterable live catalogue (`?kind=component\|block\|template\|extension\|game`, `#browse`) |
| `/components` | `next.config.ts` redirect | 308 → `/` (old URL) |
| `/components/[slug]` | `components/[slug]/page.tsx` → `views/ComponentDocView.tsx` | docs page: playground with variant switcher, install, usage, props, a11y, AI prompt, JSON-LD |
| `/components/[slug]/opengraph-image` | OG card per piece (`app/og.tsx` shared drawing) |
| `/r/[file]` | `r/[file]/route.ts` | shadcn registry item `<slug>.json` (includes sibling files from `includes`) |
| `/sitemap.xml`, `/robots.txt` | `sitemap.ts`, `robots.ts` |
| 404 / errors | `not-found.tsx`, `error.tsx`, `global-error.tsx` | use the library's own `SignalLost` |

`layout.tsx` wraps everything in `ui/UIChrome.tsx` (header, footer, ⌘K search, dark/light theme
saved in localStorage and applied before paint) and mounts `ui/TabTricks.tsx`. That's the site's own
favicon trick (the logo plates breathe while the tab is hidden). It steps aside when
`<html data-tab-tricks>` is set by the Tab Tricks library demo.

## Catalogue → docs pipeline

1. `src/catalog/index.ts` defines `ComponentEntry` (slug, name, exportName, category, kind, tagline,
   description, craft, useCases, props, a11y, tags, previewHeight, fill, isNew, variants, includes,
   npm, vanilla, usage) and merges `CORE + MORE + WAVE3 + WAVE4` into `COMPONENTS`.
2. `src/lib/source.ts` reads `src/library/<slug>.tsx` (and the demo) at build time, so the code tab,
   copy, registry JSON and prompt always match what renders.
3. `variantsFor(entry)` returns `entry.variants` or the default `MOTION_VARIANTS`
   (`animated` / `regular`). The Playground passes the selected id to the preview as `variant`.
4. `src/ui/demos.tsx` maps slug → loader: `auto(() => import("../library/x"))` renders the default
   export with `animated={variant !== "regular"}`, and `demo(() => import("../demos/x"))` renders a
   custom demo `({ variant })`. Loaders support `preloadDemo` / `getDemo` / `resetDemo`.
5. `src/ui/PreviewStage.tsx` mounts previews lazily: an IntersectionObserver prefetches chunks 1200px
   ahead and mounts 200px ahead, a scheduler staggers mounts (~16ms) on fast scrolls, and an error
   boundary per preview offers Retry.

## Extensions pattern

Each extension exports a **framework-agnostic vanilla core** (`ghostWalker(opts)`, `tabTricks(opts)`,
`fireflies(opts)`) that injects its own DOM/CSS and returns a handle with `destroy()` plus helpers, and
a **React wrapper** (named + default export). The wrapper's `fullscreen` prop chooses the whole page
(fixed) or the positioned parent box. Cores are SSR-safe, pause on `document.hidden`, respect reduced
motion and restore everything on destroy.

## Games pattern

Six games share `src/library/arcade-cabinet.tsx`: a 640×360 DPR-sharp canvas loop, input routing,
attract/game-over screens, pause on blur or scroll-off, best score in localStorage, and the neon palette.
Their entries list `includes: ["arcade-cabinet"]` so the registry ships both files. `stack-tower`
and `memory-flip` are standalone.

## SEO

Per-page metadata and canonicals, OG/Twitter images (file-based routes), JSON-LD (`WebSite`,
`ItemList`, `SoftwareSourceCode`, `BreadcrumbList`) from `src/lib/jsonld.tsx`, and a sitemap of `/` plus
every `/components/<slug>`. Site URL comes from `NEXT_PUBLIC_SITE_URL` (`src/lib/site.ts`), with
default `https://pickui.guetix.com`.

## Gate: `scripts/check-registry.mjs`

Fails if a library or demo file is orphaned, a slug has no preview registered in `src/ui/demos.tsx`,
or a library file imports anything but `react` or `./sibling`.
