# Project overview — PickUI

## What

PickUI is a free, open-source (MIT) collection of **hand-crafted React + Tailwind UI pieces** with
physics, 3D and tactile detail: the kind of UI an AI assistant can't produce from a one-line prompt.
Tagline: *"UI that AI can't one-shot."*

- Live: https://pickui.guetix.com (catalogue at `/`, docs at `/components/<slug>`)
- Repo: https://github.com/hamza-guetioui/pickui
- Author: Hamza Guetioui (https://guetix.com)

## How people use a piece

1. **shadcn CLI:** `npx shadcn@latest add https://pickui.guetix.com/r/<slug>.json` drops one file into
   `components/pickui/<slug>.tsx`.
2. **Copy:** the docs page shows and copies the exact source.
3. **AI prompt:** a ready prompt (`src/lib/prompt.ts`) that ships the real source and tells the
   assistant not to "simplify" it.
4. **Open in v0:** uses the same registry JSON.

Extensions and games are also planned as npm packages under `@pickui/*`. **They aren't published yet.**

## Catalogue (83 pieces)

| Kind | Count | Notes |
| --- | --- | --- |
| component | 42 | cards, controls, text, effects, retro, engineering… |
| block | 22 | full sections (hero, pricing, FAQ, kanban, scroll stories…) |
| template | 8 | full pages (status pages, site/dashboard/docs shells, launch pages…) |
| extension | 3 | drop-in page layers with a vanilla core + React wrapper: `ghost-walker`, `tab-tricks` (fun/useful), `fireflies` (fireflies/snow/paper/leaves) |
| game | 8 | `bug-runner`, `snake-dev`, `ship-it`, `brick-breaker`, `pong`, `bug-invaders` (share `arcade-cabinet`), `stack-tower`, `memory-flip` |

The source of truth for the list is `src/catalog/`. Keep the README counts in sync when it changes.

## Audiences

- Developers who want a striking piece without building the physics themselves.
- "Vibe coders" pasting into Cursor, Claude or v0 (hence the AI prompt).
- Hamza's portfolio: craft showcase, linked from guetix.com.

## Scope and non-goals

- No backend, accounts, analytics or paid tier.
- No runtime dependencies in library files (React only).
- No copyrighted or trademarked characters. A Screen Pet extension with real anime and comic characters
  was requested and **removed** for this reason (public MIT repo).

## Relationship to guetix.com

PickUI used to live inside guetix.com (`src/apps/pickui`). It was extracted into this repo, and
guetix.com now 308-redirects `/components`, `/components/<slug>` (except its own
`page-notes-extension` pages) and `/r/<file>` to `https://pickui.guetix.com`.
