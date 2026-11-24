# Contributing to PickUI

Thanks for helping! Bug reports, new components and small, focused pull requests are all welcome.

## Setup

```bash
npm install
npm run dev   # http://localhost:3000
```

## Adding a component

1. **Source** — create `src/library/<slug>.tsx`.
   - Start with `"use client";`. Import **only `react`** (or a sibling library file listed in `includes`).
     No other packages, no `@/` aliases — users copy this one file.
   - Tailwind classes for layout; put custom keyframes/CSS in an inline `<style>` with a unique class prefix.
   - Support `animated` (default `true`) and `className` props, keyboard use, labels, and
     `prefers-reduced-motion`.
2. **Preview** — register the slug in `LOADERS` in `src/ui/demos.tsx`: either `auto(() => import("../library/<slug>"))`
   (renders it with default props) or `demo(() => import("../demos/<slug>"))` with a custom demo file that imports from
   `../library/<slug>`. A custom demo also becomes the "Usage" snippet (imports are rewritten to
   `@/components/pickui/<slug>`).
3. **Catalogue** — add an entry in the matching file in `src/catalog/` (slug, name, exportName, category,
   kind, tagline, description, props, a11y, tags, previewHeight).
4. **Check** — all of these must pass (CI runs them on every PR):

   ```bash
   npm run lint
   npm run typecheck
   npm run check:registry
   npm run build
   ```

## Pull requests

- One component or one fix per PR. Describe what changed and how you tested it (browser, light/dark,
  keyboard, reduced motion).
- Don't add dependencies to library files. Docs-site dependencies need a short justification.
- By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).
