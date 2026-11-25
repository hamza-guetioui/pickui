# UI context — PickUI docs site

## Theme

- Dark by default; light theme toggled in the header (saved in localStorage key from `UIChrome`, applied
  before paint by an inline boot script to avoid flash).
- CSS variables in `src/app/globals.css` (space-separated RGB, used as `rgb(var(--ui-ink)/0.5)`):
  `--ui-bg`, `--ui-surface`, `--ui-ink`, `--ui-accent` (pink `255 77 141`), `--ui-accent-2` (violet
  `139 92 246`).
- Helper classes: `ui-ink`, `ui-muted`, `ui-faint`, `ui-line`, `ui-soft`, `ui-code`, `ui-scroll`,
  `ui-stage-in`, `ui-stage-skeleton`.
- Vercel-like look: thin borders, "+" crosshairs on box corners (`ui/Frame.tsx`), monospace labels,
  dotted grid backgrounds.

## Brand

- Name written lowercase **pickui** with "ui" in pink `#ff4d8d`.
- Mark: three identical floating isometric plates. Bottom is pink, middle is pink/gray (`#b85f83`),
  top is a gray UI card with window dots, text lines and a pink button. Dashed guides join them.
- Geometry lives in `src/ui/brand.ts` (`SHAPES`, `markSvg({ spread })`), rendered by `ui/Logo.tsx`
  (`<Logo>`, `<PickMark>`), `app/og.tsx` (OG cards) and `scripts/brand.mjs` (writes `src/app/icon.svg` +
  `.github/logo.svg`). Edit brand.ts, then re-run the script.
- Favicon trick (`ui/TabTricks.tsx`): while the tab is hidden the plates breathe apart and the title
  alternates with "Pick one when you're back ✦".

## Previews

- Playground: Preview / Code / Prompt tabs, variant radio group ("Version"), Replay button. Heights come
  from `previewHeight` (templates get 640 + scroll).
- `src/demos/_site.tsx` → `FakeSite`: a fake "Northwind" sample website used as the backdrop for page
  layers (`tone` dark / night / window; `gravity` flag adds `data-gravity` targets).

## Icons and fonts

- lucide-react in the docs site only. System font stack, no web fonts downloaded at runtime (OG images
  may fall back for some glyphs; avoid symbols like ✓ in OG text).
