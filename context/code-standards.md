# Code standards — PickUI

Conventions actually used in this repo.

## General

- TypeScript strict, no `any`. ESLint (`next/core-web-vitals` + TS) must be warning-free.
- Path alias `@/` → `src/` is fine in the **docs site** (`src/app`, `src/ui`, `src/views`, `src/lib`,
  `src/catalog`), but **never in `src/library/`** (users copy one file).
- 2-space indent, double quotes, semicolons, trailing commas (Prettier-like style; there's no formatter
  installed, so match the surrounding code).
- Files: library and demo files are kebab-case `<slug>.tsx`; docs-site components are PascalCase.
- Line endings: LF (`.gitattributes` `text=auto eol=lf`).

## Library files

- Single file per piece. Small internal helpers live in the same file.
- Tailwind classes for layout and styling, plus inline `style` / CSS vars for dynamic values. Canvas or
  SVG for heavy animation (one `requestAnimationFrame` loop, DPR capped at 2).
- Animate transforms and opacity only. Pause when off-screen or the tab is hidden where relevant.
- Props: sensible defaults; `animated` and `className` always; colours as CSS strings.
- Extensions: vanilla core function + React wrapper; inject one `<style id="…">` once and remove it on
  the last `destroy()`; restore any page state you touched.

## Demos

- Only when defaults aren't enough (variants, page-layer pieces, sample data).
- Keep demos thin; behaviour belongs in the library file.

## Catalogue text

- Tagline: one sentence, concrete and vivid. Description: plain text with the behaviour and options.
- `a11y` lines: keyboard + reduced motion at minimum.

## Docs site

- Server components by default; `"use client"` only where needed (Playground, PreviewStage, UIChrome…).
- Theme tokens via CSS vars (`--ui-*`) and `ui-*` utility classes (see `ui-context.md`).
