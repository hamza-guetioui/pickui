import { SITE_URL } from "../lib/site";
import { MORE } from "./components";
import { WAVE3 } from "./blocks-templates";
import { WAVE4 } from "./packages-games";

/**
 * PickUI — component catalogue (metadata only; no React, safe anywhere).
 *
 * Each entry maps to one self-contained file in `./library/<slug>.tsx`
 * (zero dependencies: React + Tailwind) and one demo in `./demos/<slug>.tsx`.
 * The docs page, the shadcn registry JSON (`/r/<slug>.json`) and the AI
 * prompt are all generated from this list + the real source files.
 */

export type ComponentCategory =
  | "Essentials"
  | "Cards"
  | "3D"
  | "Controls"
  | "Text"
  | "Effects"
  | "Commerce"
  | "Designers & Art"
  | "History & Retro"
  | "Engineering & Cars"
  | "Weird & Fun"
  | "Decoration"
  | "Utilities"
  | "Business & Promo"
  | "Games"
  | "Pages";

export type ComponentKind = "component" | "block" | "template" | "extension" | "game";

export const CATEGORY_ORDER: ComponentCategory[] = [
  "Essentials",
  "Cards",
  "3D",
  "Controls",
  "Text",
  "Effects",
  "Commerce",
  "Designers & Art",
  "History & Retro",
  "Engineering & Cars",
  "Weird & Fun",
  "Decoration",
  "Utilities",
  "Business & Promo",
  "Games",
  "Pages",
];

export const KIND_LABEL: Record<ComponentKind, string> = { component: "Components", block: "Blocks", template: "Templates", extension: "Extensions", game: "Games" };
export const KIND_ORDER: ComponentKind[] = ["component", "block", "template", "extension", "game"];

export type PropDoc = { name: string; type: string; default?: string; description: string };

/** A switchable version of a component on its docs page. */
export type Variant = {
  id: string;
  label: string;
  /** The prop that selects it, shown in docs + added to the AI prompt. */
  prop: string;
  hint: string;
};

export const MOTION_VARIANTS: Variant[] = [
  { id: "animated", label: "Animated", prop: "animated (default)", hint: "Full motion: idle animation, physics and effects." },
  { id: "regular", label: "Regular", prop: "animated={false}", hint: "Calm version: same look and interaction, no idle or ambient motion." },
];

export type ComponentEntry = {
  slug: string;
  name: string;
  /** Exported component name. */
  exportName: string;
  category: ComponentCategory;
  /** Component (default), block (a full section) or template (a full page). */
  kind?: ComponentKind;
  /** Future npm package name (extensions & games). */
  npm?: string;
  /** Framework-agnostic usage example (extensions). */
  vanilla?: string;
  /** Hand-written usage example (overrides the demo file). */
  usage?: string;
  /** Other library files this one imports (installed together). */
  includes?: string[];
  tagline: string;
  description: string;
  /** Why it's hard to get from a one-line AI prompt. */
  craft?: string[];
  useCases?: string[];
  props: PropDoc[];
  a11y?: string[];
  tags: string[];
  /** Preview box height on the docs page. */
  previewHeight: number;
  /** Fill the preview (full-bleed scenes) instead of centering. */
  fill?: boolean;
  isNew?: boolean;
  /** Switchable versions. Default: Animated / Regular. */
  variants?: Variant[];
};

const CORE: ComponentEntry[] = [
  {
    slug: "holo-card",
    name: "Holo Card",
    exportName: "HoloCard",
    category: "Cards",
    tagline: "A collectible trading card with real 3D tilt, holo foil, rarities, a flip side — and an anime Shinigami edition.",
    description:
      "The card tilts toward your cursor, a rainbow foil shifts with the viewing angle (masked to fine diagonal lines like real holo stock), a glare follows the light, and the avatar and name float above the surface at different depths.",
    craft: [
      "Foil = rainbow gradient × line mask × radial mask composited with `mask-composite`.",
      "Pointer math writes CSS variables directly, so there are no React re-renders while you move the cursor.",
      "Depth uses `preserve-3d` + per-layer `translateZ`; it springs back with a different easing than it tracks.",
    ],
    useCases: ["Portfolio hero", "Team page", "Gamified profile", "Conference badge"],
    props: [
      { name: "name", type: "string", description: "Display name." },
      { name: "role", type: "string", description: "Role / title under the name." },
      { name: "avatar", type: "string", description: "Image URL. Falls back to initials." },
      { name: "handle", type: "string", description: "Small handle at the bottom." },
      { name: "stats", type: "{ label: string; value: string }[]", default: "[]", description: "Up to three stats." },
      { name: "serial", type: "string", default: '"No. 001"', description: "Serial printed on the card." },
      { name: "accent", type: "string", default: '"#4ade80"', description: "Accent color (any CSS color)." },
      { name: "maxTilt", type: "number", default: "14", description: "Max tilt in degrees." },
      { name: "rarity", type: '"rare" | "epic" | "legendary"', default: '"rare"', description: "Foil, frame and effects." },
      { name: "edition", type: '"holo" | "shinigami"', default: '"holo"', description: "Profile card, or the anime death-god character card." },
      { name: "art", type: "string", description: "Shinigami edition: your own (licensed) character art URL." },
      { name: "bio / skills / ability", type: "string / {label, level}[] / {name, text}", description: "Back side content (click or Enter flips the card)." },
    ],
    a11y: ["Focusable card with a full accessible label; focus applies a gentle tilt.", "Reduced motion disables the tilt."],
    tags: ["3d", "tilt", "holographic", "profile", "trading card", "anime", "flip"],
    variants: [
      { id: "rare", label: "Rare", prop: 'rarity="rare"', hint: "Line-foil holo profile card." },
      { id: "epic", label: "Epic", prop: 'rarity="epic"', hint: "Cosmic dot foil and a spinning prism frame." },
      { id: "legendary", label: "Legendary", prop: 'rarity="legendary"', hint: "Gold frame, glitter foil and twinkling sparkles." },
      { id: "shinigami", label: "Shinigami", prop: 'edition="shinigami"', hint: "Original anime death-god card: eyes follow you, feed it pomegranates, flip to sign the ledger." },
    ],
    previewHeight: 500,
    isNew: true,
  },
  {
    slug: "scroll-moon",
    name: "Scroll Moon",
    exportName: "ScrollMoon",
    category: "3D",
    kind: "block",
    tagline: "A photoreal moon you fly toward as you scroll: crescent → full, crater-sharp disc → the horizon. Content changes with it.",
    description:
      "One WebGL2 fragment shader, no textures and no three.js. The moon is generated procedurally on the GPU, so it stays sharp at any size and gains detail as you get closer. Scroll position drives distance, phase and rotation, eased every frame for buttery motion; text sections fade in step by step. Ships as Moon, Blood Moon (lunar eclipse) and Mars.",
    craft: [
      "Craters are 3D Worley cells sliced by the sphere: a bowl, a raised rim and a central peak, at four scales.",
      "Lommel-Seeliger lighting (the reason the real full moon looks flat and bright) blended with bump-mapped Lambert, so craters cast long shadows at the terminator.",
      "Level of detail: the smallest crater octaves fade in only when they are bigger than a pixel, so there's no shimmer far away.",
      "Filmic tone-map + dithering to avoid banding in the dark sky; renders only while visible and idles when the scroll settles (Regular mode).",
    ],
    useCases: ["Space / science landing page", "Product launch storytelling", "Eclipse or event countdown", "Portfolio hero"],
    props: [
      { name: "sections", type: "{ eyebrow?: string; title: string; body?: string }[]", description: "Story steps, one per screen." },
      { name: "theme", type: '"moon" | "blood" | "mars"', default: '"moon"', description: "Art direction." },
      { name: "mode", type: '"contained" | "page"', default: '"contained"', description: "Scroll inside its own box, or use window scroll with a sticky scene (sections × 100vh)." },
      { name: "animated", type: "boolean", default: "true", description: "false = no rotation, twinkle or scroll easing." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    a11y: ["The canvas is decorative (`aria-hidden`); all content is real text.", "The scroll area is focusable for keyboard scrolling; the active step has `aria-current`.", "Reduced motion: no easing, rotation or twinkle. No WebGL2: a CSS fallback is shown."],
    tags: ["3d", "webgl", "shader", "scroll", "moon", "space", "storytelling"],
    variants: [
      { id: "moon", label: "Moon", prop: 'theme="moon"', hint: "Realistic grey moon: crescent to full, then the horizon." },
      { id: "blood", label: "Blood Moon", prop: 'theme="blood"', hint: "Total lunar eclipse: copper-red light with a brighter limb." },
      { id: "mars", label: "Mars", prop: 'theme="mars"', hint: "Rust terrain, polar ice caps and a thin dusty atmosphere." },
    ],
    previewHeight: 520,
    fill: true,
    isNew: true,
  },
  {
    slug: "scroll-jellyfish",
    name: "Scroll Jellyfish",
    exportName: "ScrollJellyfish",
    category: "3D",
    kind: "block",
    tagline: "A translucent 3D jellyfish that swims through your headline as you scroll, with physics-simulated tentacles.",
    description:
      "The bell is ray-traced in a WebGL2 shader: front and inner surface, fresnel gel, 16 lappets, ribs and spots. Tentacles and frilly oral arms are a verlet simulation, so they trail behind, stretch and sway like they're in water. Scrolling makes it pulse faster and swim along an S-curve over big words; when you stop, it drifts. Ships as Pelagia (pink), Moon Jelly (ocean) and Abyss (bioluminescent).",
    craft: [
      "Ray / ellipsoid intersection gives both the outer and inner bell surface, composited back-to-front with tentacles in between, so you see through the gel.",
      "Tentacles behind the bell are drawn before it and the ones in front after it, decided per frame from their 3D anchor depth.",
      "Verlet integration at a fixed 120 Hz with distance constraints: the swim pulse moves the anchors and the strands react.",
      "Swim speed comes from scroll velocity, eased in real time, so fast flicks produce strong strokes and long trails.",
    ],
    useCases: ["Creative agency hero", "Ocean / science storytelling", "Product launch", "Portfolio intro"],
    props: [
      { name: "sections", type: "{ word: string; caption?: string }[]", description: "One big word per screen, with an optional caption." },
      { name: "theme", type: '"pelagia" | "moon" | "abyss"', default: '"pelagia"', description: "Art direction." },
      { name: "mode", type: '"contained" | "page"', default: '"contained"', description: "Scroll inside its own box, or use window scroll with a sticky scene." },
      { name: "animated", type: "boolean", default: "true", description: "false = no idle swimming or pulsing." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    a11y: ["The canvas is decorative (`aria-hidden`, no pointer events); every word is real text.", "The scroll area is focusable for keyboard scrolling.", "Reduced motion: no idle pulse or sway; it only moves when you scroll."],
    tags: ["3d", "webgl", "shader", "scroll", "jellyfish", "physics", "ocean", "storytelling"],
    variants: [
      { id: "pelagia", label: "Pelagia", prop: 'theme="pelagia"', hint: "Pink mauve stinger on a light studio background, like the reference." },
      { id: "moon", label: "Moon Jelly", prop: 'theme="moon"', hint: "Glass-clear bell with four violet rings in deep ocean blue." },
      { id: "abyss", label: "Abyss", prop: 'theme="abyss"', hint: "Bioluminescent: light waves run down the ribs in the dark." },
    ],
    previewHeight: 560,
    fill: true,
    isNew: true,
  },
  {
    slug: "eiffel-dive",
    name: "Eiffel Dive",
    exportName: "EiffelDive",
    category: "3D",
    kind: "block",
    includes: ["sky-dive"],
    tagline: "Fall from the sky through the clouds and fly over Paris to a fully 3D Eiffel Tower as you scroll.",
    description:
      "The tower is a real 3D signed-distance model (tapering legs, arches, three platforms, see-through lattice) standing over procedural Paris: Haussmann blocks with zinc roofs, the Seine, Champ de Mars and Trocadéro. Copy changes at every step of the descent.",
    craft: [
      "One WebGL2 shader: ray-marched heightfield terrain with soft shadows, plus a 56-step volumetric cloud layer lit by the sun with powder and silver-lining phase.",
      "Clouds cast moving shadows on the ground; distance haze matches the sky color, so scale reads correctly.",
      "The camera path is choreographed: horizon → nose-dive with roll → pull-up → approach, with distance on an exponential curve so it never feels slow or jumpy.",
      "Adaptive resolution watches frame time and scales the render, so it stays smooth on laptops and phones.",
    ],
    useCases: ["Travel / tourism landing page", "Culture & history storytelling", "Brand film-style hero", "Event page"],
    props: [
      { name: "mood", type: '"day" | "night" | "rain"', default: '"day"', description: "Day, Night, or Rain → Sun (the storm clears as you scroll)." },
      { name: "sections", type: "{ eyebrow?: string; title: string; body?: string }[]", description: "Story steps, one per screen." },
      { name: "mode", type: '"contained" | "page"', default: '"contained"', description: "Scroll inside its own box, or use window scroll with a sticky scene." },
      { name: "animated", type: "boolean", default: "true", description: "false = no drifting clouds, rain or easing." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    a11y: ["The canvas is decorative (`aria-hidden`); all copy is real text.", "The scroll area is focusable for keyboard scrolling; the active step has `aria-current`.", "Reduced motion: no easing, cloud drift, rain or lightning. No WebGL2: a gradient fallback."],
    tags: ["3d", "webgl", "scroll", "clouds", "city", "paris", "eiffel tower", "storytelling"],
    variants: [
      { id: "day", label: "Day", prop: 'mood="day"', hint: "Bright sun, blue sky, crisp shadows and cloud shadows on the ground." },
      { id: "night", label: "Night", prop: 'mood="night"', hint: "Golden tower lights with the famous sparkle, and lit windows across Paris." },
      { id: "rain", label: "Rain → Sun", prop: 'mood="rain"', hint: "Storm clouds, rain and lightning; the sun breaks through as you scroll, with a rainbow." },
    ],
    previewHeight: 560,
    fill: true,
    isNew: true,
  },
  {
    slug: "folder-peek",
    name: "Folder Peek",
    exportName: "FolderPeek",
    category: "3D",
    tagline: "A 3D folder that swings open and fans its files out — in Classic, Neon and Da Vinci editions.",
    description:
      "On hover, tap or keyboard focus, the front flap rotates toward you in perspective, a warm light spills out of the folder, and the papers rise and fan with a staggered overshoot.",
    craft: [
      "A single `--o` (0 → 1) custom property drives every transform with `calc()`, so one state flip animates all of the layers.",
      "Hover, `data-open` and `:has(:focus-visible)` all set `--o`, so mouse, touch and keyboard share the same motion.",
      "The papers' stagger uses `transition-delay: calc(var(--i) * 45ms)`, with no JavaScript timers.",
    ],
    useCases: ["Project / case-study cards", "Downloads section", "Docs categories", "Empty states"],
    props: [
      { name: "label", type: "string", description: "Folder title on the flap." },
      { name: "files", type: "{ name: string; meta?: string; color?: string }[]", description: "Up to 4 are fanned out." },
      { name: "variant", type: '"classic" | "neon" | "davinci"', default: '"classic"', description: "Art direction." },
      { name: "color", type: "string", default: '"#f59e0b" / "#4ade80"', description: "Folder color (classic) or glow (neon)." },
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when toggled." },
    ],
    a11y: ["Toggle button with `aria-expanded` + `aria-controls`.", "File list available to screen readers.", "Reduced motion: no transitions."],
    tags: ["3d", "hover", "folder", "files", "neon", "da vinci"],
    variants: [
      { id: "classic", label: "Classic", prop: 'variant="classic"', hint: "Glossy desktop folder in your brand color." },
      { id: "neon", label: "Neon", prop: 'variant="neon"', hint: "Wireframe hologram: grid back, dashed depth shells, glowing edges, scan line." },
      { id: "davinci", label: "Da Vinci", prop: 'variant="davinci"', hint: "Renaissance codex: parchment, ink sketches that redraw, mirror-written notes, wax seal." },
    ],
    previewHeight: 420,
    isNew: true,
  },
  {
    slug: "exploded-stack",
    name: "Exploded Stack",
    exportName: "ExplodedStack",
    category: "3D",
    tagline: "An isometric exploded view of layers that pulls apart in real 3D.",
    description:
      "Show architecture, a tech stack, pricing tiers or a design system as stacked glass plates. Hover explodes the stack; the active layer lifts and glows, and labels counter-rotate so they always face the viewer.",
    craft: [
      "The labels are billboards: they apply the inverse of the stage rotation (`rotateZ(42deg) rotateX(-60deg)`).",
      "Spacing animates through a single `--gap` variable inside `translateZ(calc(i × gap))`.",
      "A synced side legend gives keyboard and screen-reader access to a purely visual 3D scene.",
    ],
    useCases: ["Architecture diagrams", "Tech-stack section", "Pricing tiers", "Onboarding explainer"],
    props: [
      { name: "layers", type: "{ label: string; description?: string; color: string }[]", description: "Bottom → top, 3–6 look best." },
      { name: "defaultExploded", type: "boolean", default: "false", description: "Start exploded." },
      { name: "legend", type: "boolean", default: "true", description: "Show the side legend." },
    ],
    a11y: ["The 3D scene is decorative; the legend buttons drive it (`aria-pressed`).", "Reduced motion: no float or spring."],
    tags: ["3d", "isometric", "diagram", "layers"],
    previewHeight: 420,
  },
  {
    slug: "haunted-room",
    name: "Haunted Room",
    exportName: "HauntedRoom",
    category: "Effects",
    tagline: "Pull the chain in a pitch-black room: a bare bulb swings on and a message scrawls itself across the wall, then bleeds.",
    description:
      "The light pool follows the swinging bulb across stained plaster. Writing is drawn stroke by stroke with a rough displacement filter, then fills and drips; tally scratches appear beside it. While on, the bulb flickers by itself and after every blackout the wall says something new.",
    craft: [
      "Pendulum + chain spring run in one rAF loop that writes CSS variables, so swinging never re-renders React.",
      "Hand-written look = SVG text stroke-dash drawing + feTurbulence/feDisplacementMap roughness, then fill and drips on a delay.",
      "Darkness is a radial mask centred on the bulb's live position; flicker drives one opacity value.",
    ],
    useCases: ["Halloween campaign", "Horror game / film landing page", "404 page", "Easter egg"],
    props: [
      { name: "messages", type: "string[]", default: '["GET OUT", …]', description: "Wall messages, one per blackout." },
      { name: "children", type: "ReactNode", description: "Content lit under the writing." },
      { name: "ink", type: "string", default: '"#7a0606"', description: "Writing color." },
      { name: "defaultOn", type: "boolean", default: "false", description: "Start lit." },
      { name: "onChange", type: "(on: boolean) => void", description: "Called when switched." },
      { name: "animated", type: "boolean", default: "true", description: "false = no swing, flicker or blackouts." },
    ],
    a11y: ["The chain handle is a `role=\"switch\"` button (drag, click, Enter or Space).", "The current wall message is announced in a polite live region.", "Reduced motion: no swing or flicker; writing appears without drawing."],
    tags: ["horror", "halloween", "light", "pull cord", "svg", "handwriting"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "evidence-desk",
    name: "Evidence Desk",
    exportName: "EvidenceDesk",
    category: "Effects",
    kind: "block",
    tagline: "A detective's desk in the dark: scroll to click on the lamp and glide from clue to clue: file, photos, red-string map, fingerprint, note.",
    description:
      "Moonlight falls through venetian blinds until the lamp flickers on. The camera then eases from exhibit to exhibit, dwelling on each, while a typed card tells your story. Swap the clues for features, case studies or a product launch.",
    craft: [
      "The whole desk is one 1600×1000 scene; the camera is a single transform eased toward scroll-driven stations, so it's smooth at 60 fps.",
      "Stations dwell: the camera only travels in the middle 60% of each step, so every clue holds still while you read.",
      "Everything is drawn in CSS/SVG (Polaroids, map, magnifier with an enlarged print inside the lens, cut-out letters). No images.",
    ],
    useCases: ["Case-study storytelling", "Mystery / true-crime site", "Product launch teaser", "Escape-room or game promo"],
    props: [
      { name: "clues", type: "{ exhibit?: string; title: string; body?: string }[]", description: "One per station (overview, file, photos, map, print, note)." },
      { name: "caseName", type: "string", default: '"CASE № 1947"', description: "Title on the case file." },
      { name: "mode", type: '"contained" | "page"', default: '"contained"', description: "Scroll inside its own box, or use window scroll with a sticky scene." },
      { name: "animated", type: "boolean", default: "true", description: "false = no easing or flicker." },
    ],
    a11y: ["The desk art is decorative; every clue is real text (screen readers read each step).", "The scroll area is focusable for keyboard scrolling.", "Reduced motion: the camera jumps without easing."],
    tags: ["detective", "noir", "scroll", "storytelling", "desk lamp", "mystery"],
    previewHeight: 520,
    fill: true,
    isNew: true,
  },
  {
    slug: "pull-cord",
    name: "Pull Cord Lamp",
    exportName: "PullCord",
    category: "Controls",
    tagline: "A hanging lamp you switch with a physics pull cord — the filament flickers on.",
    description:
      "Drag the brass bead down past the click point and let go: the cord stretches, whips on a damped spring and snaps back. The bulb stutters on like an old filament and a dusty light cone falls on your content. Works as a theme switch.",
    craft: [
      "A hand-rolled spring (k = 170, c = 9) integrates in `requestAnimationFrame`, then sleeps when at rest.",
      "The cord is a quadratic Bézier whose control point leans against the bead's velocity, which makes it whip.",
      "The flicker uses `steps(1,end)` keyframes for a hard, electrical on/off feel; a smooth fade wouldn't read as a filament.",
    ],
    useCases: ["Dark / light theme switch", "Hero easter egg", "Empty-state delight", "Landing-page centerpiece"],
    props: [
      { name: "on", type: "boolean", description: "Controlled state." },
      { name: "defaultOn", type: "boolean", default: "false", description: "Initial state." },
      { name: "onChange", type: "(on: boolean) => void", description: "Called after a successful pull." },
      { name: "lightColor", type: "string", default: '"#ffd18a"', description: "Light tint." },
      { name: "label", type: "string", default: '"Light"', description: "Accessible switch name." },
      { name: "children", type: "ReactNode", description: "Content lit by the lamp." },
    ],
    a11y: ["The bead is a `role=\"switch\"` with `aria-checked`; Enter/Space give it a tug.", "Reduced motion: instant toggle, no physics or flicker."],
    tags: ["physics", "toggle", "theme", "spring"],
    previewHeight: 440,
    fill: true,
    isNew: true,
  },
  {
    slug: "keycaps",
    name: "Keycaps",
    exportName: "Keycaps",
    category: "Controls",
    tagline: "Sculpted mechanical keycaps that mirror your real keyboard — with a synthesized thock.",
    description:
      "Chunky keycaps with real travel and a shrinking side wall. They listen to the physical keyboard: press K and the K cap goes down. Optional sound is synthesized live with Web Audio (no audio files).",
    craft: [
      "The 'thock' is filtered white noise with an exponential decay through a band-pass, so there are no assets to ship.",
      "Pointer capture + key-repeat filtering + blur reset prevent stuck keys.",
      "Keys can be sized in real keyboard units, like a 2.5u spacebar.",
    ],
    useCases: ["Shortcut hints (⌘K)", "Onboarding", "Game-like CTAs", "Developer-tool landing pages"],
    props: [
      { name: "keys", type: "Keycap[]", description: "`{ label, match?, width?, variant?, ariaLabel? }`" },
      { name: "listen", type: "boolean", default: "true", description: "Mirror the physical keyboard." },
      { name: "sound", type: "boolean", default: "false", description: "Synthesized switch sound." },
      { name: "accent", type: "string", default: '"#4ade80"', description: "Accent cap color." },
      { name: "onPress", type: "(index: number) => void", description: "Fired on press." },
    ],
    a11y: ["Real buttons with `aria-pressed`; Enter/Space press them.", "Icon legends take an `ariaLabel`."],
    tags: ["keyboard", "button", "sound", "skeuomorphic"],
    previewHeight: 320,
  },
  {
    slug: "split-flap",
    name: "Split-Flap Board",
    exportName: "SplitFlap",
    category: "Text",
    tagline: "A mechanical departure board that flips through every character to reach the next word.",
    description:
      "Each cell rotates through its character drum one card at a time, exactly like a Solari board: a top flap falls, a bottom flap lands, and the cells are staggered left to right.",
    craft: [
      "Four layers per cell (static top/bottom + falling/landing flaps); the halves are clipped with a 200%-tall inner box.",
      "Flaps re-mount per tick via `key`, so the CSS animation restarts without JavaScript animation code.",
      "Characters are walked in drum order, so getting from A to Z takes 25 flips.",
    ],
    useCases: ["Hero headline rotator", "Status / countdown", "Event schedules", "Stats that change"],
    props: [
      { name: "words", type: "string[]", default: '["HELLO","WORLD"]', description: "Words to cycle through." },
      { name: "value", type: "string", description: "Controlled text (disables cycling)." },
      { name: "length", type: "number", description: "Cell count (default: longest word)." },
      { name: "interval", type: "number", default: "3200", description: "ms between words." },
      { name: "flipMs", type: "number", default: "70", description: "ms per single flip." },
      { name: "charset", type: "string", description: "The drum's characters, in order." },
    ],
    a11y: ["A polite live region announces each word; the cells are `aria-hidden`.", "Reduced motion: jumps straight to the word."],
    tags: ["text", "mechanical", "retro", "rotator"],
    previewHeight: 300,
  },
  {
    slug: "neon-sign",
    name: "Neon Sign",
    exportName: "NeonSign",
    category: "Text",
    tagline: "Glass-tube neon lettering that warms up letter by letter — with a broken, buzzing tube.",
    description:
      "Every letter stutters on with its own timing, the brick wall picks up the glow, and the tubes you mark as broken keep buzzing forever. Tubes are stroked glyphs with stacked drop-shadows, so they read as bent glass.",
    craft: [
      "Unlit glass and lit gas are two stacked glyph layers, so an \"off\" flicker shows the dead tube instead of empty space.",
      "Per-letter delays come from `(i × 7) mod 5`: they look random but render the same on server and client.",
      "The brick wall is built from four CSS gradients, with no image assets.",
    ],
    useCases: ["Hero / landing title", "404 / maintenance pages", "Event & nightlife sites", "Section dividers"],
    props: [
      { name: "text", type: "string", description: "Main line." },
      { name: "subtext", type: "string", description: "Second, smaller line." },
      { name: "color", type: "string", default: '"#ff2d95"', description: "Main tube color." },
      { name: "subColor", type: "string", default: '"#38e1ff"', description: "Second line color." },
      { name: "broken", type: "number[]", default: "[]", description: "Letter indexes that keep flickering." },
      { name: "wall", type: "boolean", default: "true", description: "Brick wall background." },
    ],
    a11y: ["Exposed as one image with the full text as its label.", "Reduced motion: lit immediately, no flicker."],
    tags: ["text", "glow", "neon", "flicker"],
    previewHeight: 320,
    fill: true,
  },
  {
    slug: "ticket-tear",
    name: "Ticket Tear",
    exportName: "TicketTear",
    category: "Cards",
    tagline: "An event ticket whose stub you physically tear off — then an ink stamp slams down.",
    description:
      "Grab the stub and pull it down: it hinges on the perforation, and past the tear point it rips away and falls. The ticket shakes, its edge turns jagged and an ink stamp lands with a bounce.",
    craft: [
      "Notches are radial-gradient masks; after the tear the mask swaps to a conic-gradient zig-zag edge.",
      "The stub hinges from its top-left, so pulling down rotates it along the perforation.",
      "The stamp uses `mix-blend-mode: multiply`, so it reads as ink on paper rather than a sticker.",
    ],
    useCases: ["Check-in / RSVP confirmation", "Coupons", "Onboarding 'you're in'", "Gamified rewards"],
    props: [
      { name: "event", type: "string", description: "Title." },
      { name: "kicker", type: "string", default: '"Admit one"', description: "Line above the title." },
      { name: "venue / date / seat", type: "string", description: "Detail fields." },
      { name: "code", type: "string", default: '"GX-0427"', description: "Stub code; also seeds the barcode." },
      { name: "stamp", type: "string", default: '"Admitted"', description: "Stamp text." },
      { name: "accent", type: "string", default: '"#f97316"', description: "Accent color." },
      { name: "onTear", type: "() => void", description: "Fired once torn." },
      { name: "resettable", type: "boolean", default: "true", description: "Show the reset link." },
    ],
    a11y: ["The stub is a button: Enter/Space tears it.", "The stamp is announced with `role=\"status\"`.", "Reduced motion: no fall or shake."],
    tags: ["drag", "ticket", "gesture", "reward"],
    previewHeight: 360,
  },
  {
    slug: "scratch-card",
    name: "Scratch Card",
    exportName: "ScratchCard",
    category: "Cards",
    tagline: "Scratch a metallic foil off with your finger — past the threshold it dissolves in sparks.",
    description:
      "A brushed-metal foil with glitter and an embossed hint is painted on a canvas. Scratching erases it with a smooth stroke; once enough is cleared, the rest fades away and sparks burst out.",
    craft: [
      "Strokes use `destination-out` lines between pointer samples, so fast swipes leave no gaps.",
      "Coverage is sampled every 16th pixel and only every 8th move to keep it cheap.",
      "The canvas is DPR-aware and repaints on resize via ResizeObserver.",
    ],
    useCases: ["Promo codes", "Giveaways", "Spoiler reveals", "Gamified onboarding"],
    props: [
      { name: "children", type: "ReactNode", description: "Revealed content." },
      { name: "hint", type: "string", default: '"Scratch here"', description: "Embossed text." },
      { name: "threshold", type: "number", default: "0.5", description: "Share to clear before auto-reveal." },
      { name: "brush", type: "number", default: "22", description: "Brush radius (px)." },
      { name: "onReveal", type: "() => void", description: "Fired on reveal." },
    ],
    a11y: ["A visible \"Reveal\" button for keyboard and screen readers.", "The hidden content is `aria-hidden` until revealed."],
    tags: ["canvas", "gesture", "reward", "touch"],
    previewHeight: 360,
  },
  {
    slug: "flashlight-reveal",
    name: "Flashlight Reveal",
    exportName: "FlashlightReveal",
    category: "Effects",
    tagline: "Lights out. Your cursor is a flashlight with a dying battery that reveals a hidden layer.",
    description:
      "A dark surface hides a second layer. The cursor (or finger) becomes a flashlight with a soft hot-spot and a dying-battery flicker, and the beam reveals what's underneath.",
    craft: [
      "The beam is a CSS mask on the hidden layer, positioned with variables, so there is no canvas and no re-render per frame.",
      "A separate `mix-blend-mode: screen` glow layer adds the hot-spot without washing out the reveal.",
      "Battery flicker = `steps(1,end)` keyframes.",
    ],
    useCases: ["Easter eggs", "Promo codes", "Before/after reveals", "Storytelling sections"],
    props: [
      { name: "hidden", type: "ReactNode", description: "What the beam reveals." },
      { name: "children", type: "ReactNode", description: "The dark surface." },
      { name: "radius", type: "number", default: "130", description: "Beam radius (px)." },
      { name: "beamColor", type: "string", description: "Beam tint." },
    ],
    a11y: ["A \"Lights on\" toggle reveals everything for keyboard and screen-reader users.", "Reduced motion: no flicker."],
    tags: ["mask", "cursor", "reveal", "dark"],
    previewHeight: 380,
    fill: true,
  },
  {
    slug: "receipt-printer",
    name: "Receipt Printer",
    exportName: "ReceiptPrinter",
    category: "Effects",
    tagline: "A thermal printer that feeds a real-looking receipt out of its slot, line by line.",
    description:
      "The receipt prints in stepper-motor jerks with a blinking LED and a buzzing body, then shows dotted leaders, totals, a barcode generated from your order code and a torn zig-zag edge.",
    craft: [
      "Feed speed has random stalls between lines, the way a real stepper motor sounds.",
      "Dotted leaders are a flex spacer with a dotted bottom border, so the prices stay aligned at any width.",
      "The barcode is derived from an FNV hash of the code, so it is stable and unique.",
    ],
    useCases: ["Checkout success", "Invoices", "Build / deploy summaries", "Year-in-review"],
    props: [
      { name: "items", type: "{ name: string; qty?: number; price: number }[]", description: "Line items." },
      { name: "title / meta / footer", type: "string", description: "Header and footer text." },
      { name: "currency", type: "string", default: '"$"', description: "Currency prefix." },
      { name: "taxRate", type: "number", default: "0.1", description: "0.2 = 20 %." },
      { name: "code", type: "string", default: '"GX0427"', description: "Barcode seed." },
      { name: "autoPrint", type: "boolean", default: "true", description: "Print on mount." },
      { name: "onPrinted", type: "() => void", description: "Fired when done." },
    ],
    a11y: ["The full receipt is in the DOM; print status is announced via `role=\"status\"`.", "Reduced motion: printed instantly."],
    tags: ["checkout", "paper", "mechanical", "summary"],
    previewHeight: 500,
  },
  {
    slug: "signal-lost",
    name: "Signal Lost",
    exportName: "SignalLost",
    category: "Pages",
    tagline: "A CRT 'no carrier' error screen — RGB glitch slices, film grain, scan roll and a REC counter.",
    description:
      "A complete 404 / 500 / offline screen. The code tears into red and cyan slices, a scan bar rolls, the grain crawls and a VHS HUD ticks. Hover to push the glitch harder.",
    craft: [
      "Glitch slices are `clip-path: inset()` keyframes on duplicate layers, run with `steps(1)` for hard cuts.",
      "Film grain is an inline SVG `feTurbulence` data-URI, so there are no image requests.",
      "Hover changes one variable (`--sp`) and every glitch speeds up together.",
    ],
    useCases: ["404 page", "500 / maintenance", "Offline state", "Retro / gaming brands"],
    props: [
      { name: "code", type: "string", default: '"404"', description: "Big glitching text." },
      { name: "title", type: "string", default: '"Signal lost"', description: "Heading." },
      { name: "message", type: "string", description: "Body copy." },
      { name: "channel", type: "string", description: "HUD line top-left." },
      { name: "intensity", type: '"calm" | "normal" | "chaos"', default: '"normal"', description: "Base glitch speed." },
      { name: "children", type: "ReactNode", description: "Actions under the message." },
    ],
    a11y: ["Labelled section with a real heading; the glitch copies are `aria-hidden`.", "Reduced motion: a static RGB split."],
    tags: ["404", "glitch", "crt", "error"],
    previewHeight: 440,
    fill: true,
  },
];

export const COMPONENTS: ComponentEntry[] = [...CORE, ...MORE, ...WAVE3, ...WAVE4];

const ANIMATED_PROP: PropDoc = {
  name: "animated",
  type: "boolean",
  default: "true",
  description: "false = the calm “Regular” version (no idle or ambient motion).",
};

// Every component supports the Animated / Regular switch.
COMPONENTS.forEach((c) => {
  if (!c.props.some((p) => p.name === "animated")) c.props.push(ANIMATED_PROP);
});

export const variantsFor = (c: ComponentEntry) => c.variants ?? MOTION_VARIANTS;

export const getComponent = (slug: string) => COMPONENTS.find((c) => c.slug === slug);

export { SITE_URL as SITE_ORIGIN };
export const registryUrl = (slug: string) => `${SITE_URL}/r/${slug}.json`;
export const installCommand = (slug: string) => `npx shadcn@latest add ${registryUrl(slug)}`;
export const installPath = (slug: string) => `components/pickui/${slug}.tsx`;
