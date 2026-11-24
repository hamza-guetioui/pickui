# Changelog

## Unreleased

- The catalogue is now the home page (`/`); `/components` 308-redirects there. Docs stay at `/components/<slug>`.

- New brand: isometric layer-stack mark (the top layer is "picked"), favicon, README logo (`scripts/brand.mjs`).
- SEO: per-component Open Graph + X images, JSON-LD (WebSite, ItemList, SoftwareSourceCode, BreadcrumbList),
  richer metadata, `noindex` on error pages.
- Custom 404, error and global-error pages (built with the Signal Lost component).
- Catalogue previews: staggered mounting, early chunk download, shimmer + fade-in, per-preview error boundary
  with Retry, and no restart when scrolling back a little.

## 0.1.0 — initial open-source release

- 94 entries: 42 components, 22 blocks, 8 templates, 17 packages, 5 games.
- Docs site with live previews, Animated / Regular variants, copy-code, AI prompt and "Open in v0".
- shadcn registry at `/r/<slug>.json` (installs to `components/pickui/`).
