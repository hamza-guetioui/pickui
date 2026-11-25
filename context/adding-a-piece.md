# Adding (or changing) a piece

## 1. Library file — `src/library/<slug>.tsx`

- `"use client";` first line. Import only `react` (or a sibling library file you list in `includes`).
- Header JSDoc: what it is, how it behaves, "zero dependencies".
- Export the component **by name and as default**. Export its props type (`<Name>Props`).
- Support `animated?: boolean` (default `true`; `false` = calm version with the same look and no ambient
  motion) unless the entry defines its own `variants`. Accept `className`.
- Respect `prefers-reduced-motion`, be keyboard-usable, and clean up listeners, rAF and timers.
- SSR-safe: no `window` access during render. Randomness (shuffles etc.) only in effects, to avoid
  hydration mismatch.
- Persisted state (best scores…) uses an overridable `storageKey` prop (`null` disables).
- Original artwork only (inline SVG / canvas / CSS).

## 2. Catalogue entry

Add to the right list: `src/catalog/components.ts` (components), `blocks-templates.ts` (blocks and
templates), `packages-games.ts` (extensions and games; uses `npm()` and `p()` helpers). Fields:

```ts
{
  slug: "my-piece", name: "My Piece", exportName: "MyPiece",
  category: "Effects",            // see CATEGORY_ORDER in index.ts
  kind: "block",                  // omit for component
  tagline: "One sentence that sells it.",
  description: "What happens, what's configurable.",
  craft: ["Why AI can't one-shot it."],   // optional
  useCases: ["…"], props: [p("name", "type", "What.", "default")],
  a11y: ["Keyboard…", "Reduced motion…"], tags: ["…"],
  previewHeight: 460, fill: true, isNew: true,
  variants: [{ id: "a", label: "A", prop: 'mode="a"', hint: "…" }], // optional; default Animated/Regular
  includes: ["arcade-cabinet"],   // sibling files shipped together (optional)
  vanilla: `…`, usage: `…`,       // extensions: show the vanilla core + React usage
}
```

Plain text only in `description` (no markdown, it isn't rendered). Don't rename slugs: they're
public install URLs.

## 3. Preview — `src/ui/demos.tsx`

- Defaults are enough: `"my-piece": auto(() => import("../library/my-piece")),`
- Custom: create `src/demos/my-piece.tsx` (`"use client"`, `export default function MyPieceDemo({ variant = "<first id>" }: { variant?: string })`)
  and register it with `demo(() => import("../demos/my-piece"))`. Page-layer pieces wrap in
  `FakeSite` from `./_site` (`tone: "dark" | "night" | "window"`).

## 4. Counts and docs

Update the README counts (`**N pieces** — …`) and `CHANGELOG.md` → `## Unreleased`.

## 5. Verify

`npm run lint && npm run typecheck && npm run check:registry && npm run build`, then open
`/components/<slug>` in a browser and click through every variant, in light and dark themes, with
reduced motion on (DevTools → Rendering → emulate). Check the browser console for errors.

## Removing a piece

Delete the library file and demo, remove the catalogue entry and the `demos.tsx` line, update the
README and CHANGELOG, and run the gate. Ask the owner first: removal breaks install URLs.
