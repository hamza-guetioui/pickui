# Progress tracker — PickUI

Update at the start and end of every working session: what changed, what's open.

## Current state (2026-11-25)

- Branches: `main` (production) and `dev` (integration), both on GitHub. Local work on `dev`.
- Catalogue: **83 pieces**: 42 components, 22 blocks, 8 templates, 3 extensions, 8 games.
- Gate is green on `dev`: lint, typecheck, check:registry, build (341 static pages).

## History (most recent first)

- **Search + header polish.** ⌘K palette: fixed height, suggestion chips, recent picks (`pickui-recent`),
  typo-tolerant closest matches, close/clear buttons, keycap footer. Header: high-contrast GitHub button with
  icon; route-change top bar + bottom-right “Preparing page…” pill (`UIChrome`).

- **Extension pages download-only**. `kind: "extension"` docs pages show Download ZIP +
  preview (+ props/a11y); code, prompt, CLI/manual install and usage sections are hidden. ZIPs are built
  statically by `src/app/download/[file]/route.ts` with a dependency-free writer in `src/lib/zip.ts`.
  `Playground` hides Code/Prompt tabs when those props aren't passed.

- **Packages → Extensions** (`9b8aa12`, on `dev`, not yet in `main`). Kind `package` renamed to
  `extension`. Kept and rebuilt: Ghost Walker (shy / interact / prankster with 10×3 reactions /
  still), Tab Tricks (fun / useful helpers: badge, progress, done, unsaved, countdown, recording, away
  summary), Fireflies & Seasons (fireflies / snow / paper / leaves with 3D flutter, shadows, ground).
  Removed 13 packages and the Screen Pet (real characters requested → can't ship copyrighted art in an
  MIT repo).
- Added the `dev` branch; CONTRIBUTING says PRs target `dev`; CI runs on `main` + `dev`.
- Games: replaced the originals with 6 neon arcade games on a shared `arcade-cabinet`; kept and
  reimagined Stack Tower (climb to orbit) and Memory Flip (holographic pairs, levels).
- Catalogue moved from `/components` to `/` (old URL 308s home).
- Brand: floating-plates logo, favicon breathing tab trick, OG images.
- SEO + custom 404/error pages, lazy preview scheduler with error recovery.
- Initial extraction from guetix.com (`src/apps/pickui`) into this standalone MIT repo.

## Open questions / next steps

- [ ] Release: PR `dev` → `main` for the Extensions change (needs owner approval).
- [ ] Confirm `pickui.guetix.com` is live on Vercel (guetix.com already redirects there).
- [ ] Branch protection on GitHub for `main` (PR required) and `dev` (no force-push/deletion), like
      guetix. Not set yet.
- [ ] Publish `@pickui/*` npm packages for extensions and games? (docs say "not published yet").
- [ ] Browser-check long runs: Stack Tower altitude zones and pull-back; Ghost Walker prankster
      reactions (all 30) and interact mode on real pages.
- [ ] Tab Tricks: optional `onReady` handle; consider a docs note about other scripts that also change
      the favicon.
- [ ] Possibly a "bring your own character" pet extension (user-supplied images, nothing bundled).
