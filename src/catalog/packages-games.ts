import type { ComponentEntry, PropDoc } from "./index";

/**
 * PickUI — wave 4: framework-agnostic EXTENSIONS (vanilla core + React
 * wrapper, future npm packages under @pickui/*) and GAMES.
 */

const p = (name: string, type: string, description: string, def?: string): PropDoc => ({ name, type, description, default: def });
const npm = (slug: string) => `@pickui/${slug}`;

const GAME_A11Y = [
  "Keyboard input only while the cabinet is focused (click or Tab to it), so the page never scrolls by surprise; Esc / P pauses.",
  "Pauses automatically when the tab is hidden, the cabinet scrolls off-screen or loses focus; reduced motion turns off screen shake and thins particles.",
];

const DECORATION_A11Y = ["Decorative layers are aria-hidden and never block clicks.", "prefers-reduced-motion: frozen or disabled."];

export const WAVE4: ComponentEntry[] = [
  /* ── Extensions: drop-in layers for any page ─────────────────────────── */
  {
    slug: "ghost-walker",
    name: "Ghost Walker",
    exportName: "GhostWalker",
    category: "Weird & Fun",
    kind: "extension",
    npm: npm("ghost-walker"),
    tagline: "Translucent ghosts haunt your page. Chase them and they flee off-screen, then peek at you from behind the edge until they feel safe.",
    description:
      "Shy ghosts drift with rippling hems and eyes that follow your cursor. Chase one and it escapes through the nearest edge, hides there with only its head peeking in, ducks when you come close and floats back once you leave it alone. Turn on interact and they mess with the page — tug a heading, blow on a card, possess a button, nudge a word — always restoring it. Prankster ghosts don't run: chase one and it does one of 10 weird things (3 versions each) — calls friends to laugh at you, sings, dances, does magic, plays dead, throws a pie, takes a selfie, juggles or fakes a BOO.",
    craft: ["Edge-hiding: off-screen ghosts are clipped to a peek that tracks the cursor and retreats when approached.", "Page interaction never writes permanent styles; everything is undone on finish, chase or destroy()."],
    useCases: ["Halloween", "404 pages", "Playful brands", "Product launches"],
    variants: [
      { id: "shy", label: "Shy", prop: 'behavior="shy"', hint: "Flee when chased, hide behind the edges, come back when safe." },
      { id: "interact", label: "Interact", prop: "interact", hint: "Shy ghosts that tug, blow on and possess page content." },
      { id: "prankster", label: "Prankster", prop: 'behavior="prankster"', hint: "Don't run away — 10 random reactions × 3 versions." },
      { id: "regular", label: "Still", prop: "animated={false}", hint: "One still ghost peeking from the edge." },
    ],
    vanilla: `import { ghostWalker } from "@pickui/ghost-walker";

const ghosts = ghostWalker({ count: 3, behavior: "shy", interact: true });
ghosts.setBehavior("prankster");
// later
ghosts.destroy();`,
    usage: `import { GhostWalker } from "@/components/pickui/ghost-walker";

// whole page
<GhostWalker fullscreen count={3} behavior="prankster" />

// or inside a positioned box
<section className="relative overflow-hidden">
  <GhostWalker count={4} interact />
</section>`,
    props: [
      p("behavior", '"shy" | "prankster"', "Flee & hide, or stay and prank.", '"shy"'),
      p("interact", "boolean", "Ghosts play with page content ([data-ghost] first).", "false"),
      p("count", "number", "Ghosts.", "3"),
      p("size", "number", "Ghost size in px.", "56"),
      p("opacity", "number", "See-through-ness.", "0.6"),
      p("fleeRadius", "number", "How close the cursor gets before they react.", "150"),
      p("speed", "number", "Speed multiplier.", "1"),
      p("shape", "string", "Custom SVG markup, emoji or image URL."),
      p("clickable", "boolean", "Click to poof.", "true"),
      p("fullscreen", "boolean", "Haunt the whole page.", "false"),
    ],
    a11y: ["Ghosts are decorative (aria-hidden) and only they take clicks.", "Reduced motion: still ghosts, no page interaction."],
    tags: ["extension", "ghost", "halloween", "character", "playful"],
    previewHeight: 520,
    fill: true,
    isNew: true,
  },



  {
    slug: "tab-tricks",
    name: "Tab Tricks",
    exportName: "TabTricks",
    category: "Utilities",
    kind: "extension",
    npm: npm("tab-tricks"),
    tagline: "Your browser tab, put to work. Fun: a favicon that misses you. Useful: unread badges, progress rings, done alerts and timers right in the tab.",
    description:
      "Two versions. Fun — leave the tab and the favicon becomes eyes looking around (or sleepy, crying, waving) while the title cycles jokes; come back to a happy bounce and “Yay! 🎉”. Useful — silent helpers people use without noticing: badge(n) for unread counts, progress(0–1) for uploads/exports, done() turns the icon into a green check when a job finishes while they're away, unsaved() dot, countdown() in the title, recording() red dot, and an “away 12 min · 3 updates” summary. The original title and favicon are always restored exactly.",
    useCases: ["Chat & inbox apps (unread badge)", "Uploads, exports, AI generations (progress → ✓ done)", "Editors (unsaved dot)", "Pomodoro, auctions, session expiry (countdown)", "Screen recorders (red dot)", "Playful personal sites (fun mode)"],
    variants: [
      { id: "fun", label: "Fun", prop: 'mode="fun"', hint: "Animated favicon faces + funny away titles, welcome back on return." },
      { id: "useful", label: "Useful", prop: 'mode="useful"', hint: "Badge, progress, done, unsaved, countdown and recording helpers." },
    ],
    vanilla: `import { tabTricks } from "@pickui/tab-tricks";

// fun
tabTricks({ mode: "fun", face: "eyes" });

// useful
const tab = tabTricks({ mode: "useful" });
tab.badge(3);              // (3) Inbox
tab.progress(0.42);        // ring + "42% · Export"
tab.done("Export ready");  // ✓ when they're away
tab.countdown(Date.now() + 25 * 60e3, "Focus");`,
    usage: `import { TabTricks, type TabTricksHandle } from "@/components/pickui/tab-tricks";
import { useRef } from "react";

export function Uploads() {
  const tab = useRef<TabTricksHandle | null>(null);
  // …call tab.current?.progress(p) while uploading, tab.current?.done("Uploaded") at the end
  return <TabTricks mode="useful" onReady={(h) => (tab.current = h)} />;
}`,
    props: [
      p("mode", '"fun" | "useful"', "Which version.", '"fun"'),
      p("face", '"eyes" | "sleepy" | "crying" | "wave"', "Fun: favicon animation while away.", '"eyes"'),
      p("away", "string[]", "Fun: titles cycled while hidden."),
      p("welcome", "string", "Toast on return ('' disables).", '"Welcome back 👋"'),
      p("awayAfter", "number", "Useful: ms away before the summary toast (0 disables).", "60000"),
      p("sound", "boolean", "Useful: soft chime on done().", "false"),
      p("guardUnsaved", "boolean", "Useful: beforeunload warning while unsaved(true).", "false"),
      p("accent", "string", "Icon / toast colour.", '"#4ade80"'),
      p("onReady", "(handle) => void", "React: get badge / progress / done / unsaved / countdown / recording / notify."),
    ],
    a11y: ["Nothing moves on the page; toasts are polite status messages.", "Reduced motion: still favicon icons instead of animations."],
    tags: ["extension", "favicon", "title", "tab", "notifications", "progress"],
    previewHeight: 460,
    isNew: true,
  },

  {
    slug: "fireflies",
    name: "Fireflies & Seasons",
    exportName: "Fireflies",
    category: "Decoration",
    kind: "extension",
    npm: npm("fireflies"),
    tagline: "Fireflies, snow, paper or autumn leaves drifting over your page — drawn like the real thing, with real-world physics and soft shadows.",
    description:
      "One canvas, four styles. Leaves (maple, oak, birch with veins) and paper scraps flutter in 3D — they foreshorten and flip to their darker back side — side-slip like real falling leaves and settle on the ground. Snow has bokeh flakes up close and crisp crystals far away, and drifts pile up and melt. Every item casts a soft shadow on the page that sharpens as it gets closer; fireflies cast a warm glow instead and blink in near-sync. Gusts sweep across, and your cursor is wind.",
    craft: ["Shadows offset & blur with each item's height above the page plane.", "Depth layers: near items are bigger, blurrier and faster (parallax)."],
    useCases: ["Seasonal landing pages", "Holiday campaigns", "Night / nature themes", "Event & wedding sites"],
    variants: [
      { id: "fireflies", label: "Fireflies", prop: 'style="fireflies"', hint: "Glowing fireflies blinking in near-sync." },
      { id: "snow", label: "Snow", prop: 'style="snow"', hint: "Bokeh flakes, crystals and a melting drift." },
      { id: "paper", label: "Paper", prop: 'style="paper"', hint: "Torn paper scraps and confetti strips." },
      { id: "leaves", label: "Leaves", prop: 'style="leaves"', hint: "Maple, oak and birch leaves with veins." },
      { id: "regular", label: "Still", prop: "animated={false}", hint: "One frozen frame with shadows, no motion." },
    ],
    vanilla: `import { fireflies } from "@pickui/fireflies";

const layer = fireflies({ style: "leaves", wind: 0.4 });
layer.gust(1.5);
layer.setStyle("snow");`,
    usage: `import { Fireflies } from "@/components/pickui/fireflies";

<section className="relative">
  <Fireflies style="snow" />
  …
</section>`,
    props: [
      p("style", '"fireflies" | "snow" | "paper" | "leaves"', "What drifts.", '"fireflies"'),
      p("count", "number", "Items (default depends on style)."),
      p("wind", "number", "Steady wind, -1…1.", "0.3"),
      p("colors", "string[]", "Palette override."),
      p("interactive", "boolean", "Cursor pushes items.", "true"),
      p("ground", "boolean", "Items land and settle.", "true"),
      p("fullscreen", "boolean", "Whole page instead of the parent box.", "false"),
    ],
    a11y: DECORATION_A11Y,
    tags: ["extension", "decoration", "snow", "leaves", "canvas", "physics"],
    previewHeight: 480,
    fill: true,
    isNew: true,
  },

  /* ── Games (shared shell: arcade-cabinet) ─────────────────────────────── */
  {
    slug: "bug-runner",
    name: "Bug Runner",
    exportName: "BugRunner",
    category: "Games",
    kind: "game",
    npm: npm("bug-runner"),
    tagline: "Jump over bugs before they reach production — an endless neon runner. Hold to jump higher, ↓ to duck.",
    description: "A tiny neon dev sprints across a synthwave grid past a parallax skyline, jumping bugs and stacks of code while the pace keeps climbing; flying bugs show up later. Inspired by the offline Chrome dino (2014).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-bug-runner-best"'), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["One button: Space, ↑ or a tap.", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "runner", "chrome-dino", "one-button"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "snake-dev",
    name: "Snake.dev",
    exportName: "SnakeDev",
    category: "Games",
    kind: "game",
    npm: npm("snake-dev"),
    tagline: "The Nokia classic for developers: eat bugs, grow the codebase, don't bite your tail.",
    description: "Steer a glowing gradient snake that glides smoothly between grid steps. Every fixed bug speeds it up; golden bugs are worth 3 and vanish after a few seconds. Inspired by Snake on the Nokia 6110 (1997).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-snake-dev-best"'), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["Arrows / WASD, or swipe on touch screens; turns are buffered so quick inputs aren't lost.", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "snake", "nokia", "puzzle"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "ship-it",
    name: "Ship It!",
    exportName: "ShipIt",
    category: "Games",
    kind: "game",
    npm: npm("ship-it"),
    tagline: "A one-button flyer: boost your release rocket through the gaps in burning firewalls.",
    description: "Every wall cleared is a successful deploy. Gaps tighten and walls start drifting as your streak grows; exhaust, sparks and a crash explosion sell the speed. Inspired by Flappy Bird (2013).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-ship-it-best"'), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["One button: Space, ↑ or a tap.", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "flappy", "one-button", "rocket"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "brick-breaker",
    name: "Brick Breaker",
    exportName: "BrickBreaker",
    category: "Games",
    kind: "game",
    npm: npm("brick-breaker"),
    tagline: "The 1976 arcade legend in neon: aim with the paddle's edges, shatter the wall, survive faster waves.",
    description: "Armoured top rows take two hits, the ball leaves a speed trail and sub-stepped physics means it never tunnels through bricks. Three lives; each cleared wave comes back faster. Inspired by Breakout — Atari (1976).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-brick-breaker-best"'), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["Mouse / touch follows the pointer; ← → also move the paddle; Space or a tap launches.", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "breakout", "paddle"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "pong",
    name: "Pong",
    exportName: "Pong",
    category: "Games",
    kind: "game",
    npm: npm("pong"),
    tagline: "Where video games began: you vs the CPU, first to 7, in glowing neon.",
    description: "Hit the ball with your paddle's edges to angle it; every rally speeds it up. The CPU reacts with a delay and a speed cap, so it can be beaten. Inspired by Pong — Atari (1972).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-pong-best"'), p("target", "number", "Points needed to win.", "7"), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["Mouse / touch, or ↑ ↓ / W S.", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "pong", "paddle", "sports"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "bug-invaders",
    name: "Bug Invaders",
    exportName: "BugInvaders",
    category: "Games",
    kind: "game",
    npm: npm("bug-invaders"),
    tagline: "The bugs are invading: slide, fire and defend the codebase wave after wave.",
    description: "A swarm of neon bugs marches down and speeds up as it thins out; dodge their zig-zag shots and snipe the golden zero-day UFO for bonus points. Three lives. Inspired by Space Invaders — Taito (1978).",
    useCases: ["404 & maintenance pages", "Developer portfolios", "Waiting screens (builds, queues, uploads)", "Event stands"],
    includes: ["arcade-cabinet"],
    props: [p("storageKey", "string | null", "Where the best score is saved (null = don't save).", '"pickui-bug-invaders-best"'), p("className", "string", "Extra classes on the cabinet.")],
    a11y: ["Mouse / touch or ← →; Space or a tap fires (hold for auto-fire).", ...GAME_A11Y],
    tags: ["game", "arcade", "canvas", "retro", "space-invaders", "shooter"],
    previewHeight: 460,
    isNew: true,
  },
  {
    slug: "stack-tower",
    name: "Stack Tower",
    exportName: "StackTower",
    category: "Games",
    kind: "game",
    npm: npm("stack-tower"),
    tagline: "The stacking game as a climb to orbit: glass slabs, a ghost guide, perfect-drop combos with rising chimes, and a sky that travels from dusk city to space.",
    description: "Tap to drop; the overhang is sliced off and tumbles away. Perfect drops chain rings, sparks and a pentatonic chime that climbs with the combo, and a 3-streak grows the slab back. Every 10 floors is an altitude milestone (City → Clouds → Stratosphere → Orbit). When the tower falls, the camera pulls back to show everything you built. High score saved; optional sound and haptics.",
    useCases: ["404 & maintenance pages", "Waiting screens", "Gamified landing pages", "Event stands"],
    props: [p("storageKey", "string | null", "High-score key.", '"pickui-stack-best"'), p("sound", "boolean", "Start with sound on (toggle in the corner).", "false"), p("animated", "boolean", "false = no debris, camera ease or particles.", "true")],
    a11y: ["The game area is focusable: Space / Enter drop the slab; the floor count is a live region.", "Reduced motion: no camera easing, debris or particles. Sound is off by default."],
    tags: ["game", "canvas", "isometric", "hyper-casual", "stack"],
    previewHeight: 520,
    fill: true,
    isNew: true,
  },
  {
    slug: "memory-flip",
    name: "Memory Flip",
    exportName: "MemoryFlip",
    category: "Games",
    kind: "game",
    npm: npm("memory-flip"),
    tagline: "The pairs game, reimagined: holographic tilting cards, a peek at the start, light beams between pairs, streak multipliers and four growing levels.",
    description: "Each level opens with a one-second peek at the whole deck. Cards tilt toward the cursor with a foil sheen, found pairs are joined by a beam of light, consecutive matches multiply your points, and one hint per level highlights a pair. Boards grow 6 → 8 → 10 → 12 pairs; best score saved. Pass your own faces (emoji, letters or logos); it shuffles on the client, so no hydration mismatch.",
    useCases: ["Brand & product memory games", "Kids & education", "Event stands", "Waiting screens"],
    props: [p("faces", "string[]", "Card faces; levels use the first 6 / 8 / 10 / 12."), p("storageKey", "string | null", "Best-score key.", '"pickui-memory-best"'), p("animated", "boolean", "false = instant flips, no tilt, beams or confetti.", "true")],
    a11y: ["Every card is a labelled button; arrow keys move between cards; moves, time and score are announced.", "Reduced motion: instant flips, no tilt, beams or confetti."],
    tags: ["game", "memory", "cards", "3d", "holographic"],
    previewHeight: 600,
    isNew: true,
  },
];
