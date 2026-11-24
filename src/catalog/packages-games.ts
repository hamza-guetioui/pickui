import type { ComponentEntry, PropDoc } from "./index";

/**
 * PickUI — wave 4: framework-agnostic PACKAGES (vanilla core + React
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
  /* ── Packages: decoration & weird ────────────────────────────────────── */
  {
    slug: "ghost-walker",
    name: "Ghost Walker",
    exportName: "GhostWalker",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("ghost-walker"),
    tagline: "Cute ghosts wander your website and flee when the cursor gets close. Click one: poof.",
    description:
      "Steering behaviour (wander → flee) with a scared state (wide eyes, shiver). Click a ghost and it disappears, then sneaks back in from an edge a few seconds later. Use the built-in ghost, an emoji, an image URL or your own SVG.",
    craft: ["Wander + flee steering with speed caps, so they glide instead of jittering.", "One shared stylesheet is injected once; destroy() removes every trace."],
    useCases: ["Halloween", "404 pages", "Playful brands", "Product launches"],
    vanilla: `import { ghostWalker } from "@pickui/ghost-walker";

const ghosts = ghostWalker({ count: 4, fleeRadius: 160 });
// custom shape: emoji, image URL or SVG markup
// ghostWalker({ shape: "🎃" }) · ghostWalker({ shape: "/my-ghost.svg" })
// later: ghosts.destroy();`,
    usage: `import { GhostWalker } from "@/components/pickui/ghost-walker";

export default function Page() {
  return (
    <main>
      {/* whole website */}
      <GhostWalker fullscreen count={3} />
    </main>
  );
}`,
    props: [p("count", "number", "Ghosts.", "3"), p("size", "number", "Size (px).", "46"), p("speed", "number", "Speed multiplier.", "1"), p("fleeRadius", "number", "Scare distance (px).", "150"), p("shape", "string", "SVG markup, emoji or image URL."), p("color", "string", "Default ghost color."), p("clickable", "boolean", "Click to poof.", "true"), p("fullscreen", "boolean", "React: haunt the whole page.", "false")],
    a11y: DECORATION_A11Y,
    tags: ["package", "decoration", "cursor", "halloween", "character"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "screen-pet",
    name: "Screen Pet",
    exportName: "ScreenPet",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("screen-pet"),
    tagline: "A tiny character lives at the bottom of your site: walks, sits, sleeps, chases your cursor and talks.",
    description:
      "A small state machine (walk / sit / sleep / chase / jump) with speech bubbles. It trots over when your cursor comes near the floor and jumps when clicked. Pick cat, robot or blob, or bring a sprite.",
    craft: ["Characters are inline SVG with CSS-animated legs, so it stays crisp at any size and needs no assets."],
    useCases: ["Personal sites", "Kids & education", "SaaS mascots", "Easter eggs"],
    vanilla: `import { screenPet } from "@pickui/screen-pet";

const pet = screenPet({ kind: "cat", phrases: ["hi!", "nice site"] });
pet.say("welcome back!");
// custom character: screenPet({ sprite: "<svg>…</svg>" }) or an image URL`,
    usage: `import { ScreenPet } from "@/components/pickui/screen-pet";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ScreenPet fullscreen kind="robot" color="#94a3b8" />
    </>
  );
}`,
    props: [p("kind", '"cat" | "robot" | "blob"', "Character.", '"cat"'), p("sprite", "string", "Your SVG markup or image URL."), p("phrases", "string[]", "What it says when clicked."), p("color", "string", "Body color."), p("size", "number", "Height (px).", "64"), p("speed", "number", "Walk speed (px/s).", "50")],
    a11y: ["The pet is a focusable button (Enter to say hi).", "Reduced motion: it just sits."],
    tags: ["package", "mascot", "character", "cute", "pet"],
    previewHeight: 460,
    fill: true,
    isNew: true,
    variants: [
      { id: "cat", label: "Cat", prop: 'kind="cat"', hint: "Orange tabby with a waving tail." },
      { id: "robot", label: "Robot", prop: 'kind="robot"', hint: "Tiny bot with an antenna light." },
      { id: "blob", label: "Blob", prop: 'kind="blob"', hint: "A friendly jelly." },
    ],
  },
  {
    slug: "edge-dock",
    name: "Edge Dock",
    exportName: "EdgeDock",
    category: "Utilities",
    kind: "package",
    npm: npm("edge-dock"),
    tagline: "A quick-tools tab hides on the screen edge; hover and a dock slides out with tooltips flying from the side.",
    description: "Ships with useful tools (back to top, copy link, share, print, contact) or takes your own. Fully keyboard accessible (Tab, Enter, Esc).",
    useCases: ["Docs & blogs", "Long landing pages", "Dashboards"],
    vanilla: `import { edgeDock } from "@pickui/edge-dock";

edgeDock({
  side: "right",
  tools: [
    { icon: "↑", label: "Back to top", onClick: () => scrollTo({ top: 0, behavior: "smooth" }) },
    { icon: "☾", label: "Dark mode", onClick: () => document.documentElement.classList.toggle("dark") },
    { icon: "✉", label: "Contact", href: "/contact" },
  ],
});`,
    usage: `import { EdgeDock } from "@/components/pickui/edge-dock";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <EdgeDock fullscreen side="right" accent="#4ade80" />
    </>
  );
}`,
    props: [p("side", '"left" | "right"', "Edge.", '"right"'), p("top", "number", "Vertical position (%).", "50"), p("tools", "{ icon; label; href?; onClick? }[]", "Tools."), p("accent", "string", "Tab & tooltip color."), p("label", "string", "Tab text.", '"Quick tools"')],
    a11y: ["Tab button with aria-expanded; toolbar role; Esc closes and returns focus."],
    tags: ["package", "utility", "toolbar", "tooltip", "dock"],
    previewHeight: 460,
    fill: true,
    variants: [
      { id: "right", label: "Right", prop: 'side="right"', hint: "Dock on the right edge." },
      { id: "left", label: "Left", prop: 'side="left"', hint: "Dock on the left edge." },
    ],
  },
  {
    slug: "snow-pile",
    name: "Snow Pile",
    exportName: "SnowPile",
    category: "Decoration",
    kind: "package",
    npm: npm("snow-pile"),
    tagline: "Snow that actually SETTLES on your headings, buttons and images — hover to brush it off.",
    description:
      "Flakes land on the top edges of the elements you choose and build soft, bumpy piles (thinner at the edges). Hover an element and its snow falls off as powder. All of it is drawn on one canvas.",
    craft: ["Piles are per-element height columns, smoothed with their neighbours, and re-anchored to the element's position every frame."],
    useCases: ["Winter / holiday season", "Product launches", "Personal sites"],
    vanilla: `import { snowPile } from "@pickui/snow-pile";

const snow = snowPile({ selector: "h1, h2, .card, button", density: 180 });
// snow.destroy() when the season is over ☃`,
    usage: `import { SnowPile } from "@/components/pickui/snow-pile";

<SnowPile fullscreen selector="h1, h2, button, [data-snow]" />`,
    props: [p("selector", "string", "Elements snow settles on.", '"h1, h2, h3, button, img, [data-snow]"'), p("density", "number", "Flakes alive at once.", "160"), p("maxPile", "number", "Max pile height (px).", "18"), p("wind", "number", "-1 … 1.", "0.2"), p("color", "string", '"r,g,b".', '"255,255,255"')],
    a11y: DECORATION_A11Y,
    tags: ["package", "snow", "winter", "canvas", "decoration"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "page-gravity",
    name: "Page Gravity",
    exportName: "PageGravity",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("page-gravity"),
    tagline: "Turn gravity on: elements fall, bounce and stack; grab and throw them; reset flies everything home.",
    description: "Tiny AABB physics: elements stack on the floor and on each other, can be dragged and thrown with your pointer's velocity, and restore() animates them back with a stagger.",
    useCases: ["Easter eggs (pair with Easter Eggs)", "404 pages", "Portfolio stunts"],
    vanilla: `import { pageGravity } from "@pickui/page-gravity";

const g = pageGravity({ selector: "[data-gravity]" });
document.querySelector("#chaos")!.addEventListener("click", () => g.start());
// g.reset() — everything flies back into place`,
    usage: `import { PageGravity } from "@/components/pickui/page-gravity";

// Mark elements with data-gravity, then drop the toggle in the same container:
<section className="relative">
  <h1 data-gravity>Hello</h1>
  <button data-gravity>Click</button>
  <PageGravity />
</section>`,
    props: [p("selector", "string", "Elements that fall.", '"[data-gravity]"'), p("gravity", "number", "px/s².", "2200"), p("bounce", "number", "0–1.", "0.35"), p("scoped", "boolean", "React: limit to the parent element.", "true")],
    a11y: ["Elements keep their DOM order and semantics; reset() restores inline styles exactly."],
    tags: ["package", "physics", "easter egg", "fun"],
    previewHeight: 460,
    fill: true,
  },
  {
    slug: "page-notes",
    name: "Page Notes",
    exportName: "PageNotes",
    category: "Utilities",
    kind: "package",
    npm: npm("page-notes"),
    tagline: "Sticky notes for ANY website: pin, type, drag, recolor, export — a free design-review tool.",
    description:
      "Press N (or the button), click anywhere to pin a note, then type, drag or recolor it. Notes persist per page in localStorage, and Export copies JSON you can paste into an issue. Drop it on staging and your client can review it with you.",
    useCases: ["Design reviews on staging", "QA passes", "Client feedback", "Personal annotations"],
    vanilla: `import { pageNotes } from "@pickui/page-notes";

pageNotes({ hotkey: "n" });            // press N, click to pin
// pageNotes({ storageKey: "review-v2" }) — separate review rounds`,
    usage: `import { PageNotes } from "@/components/pickui/page-notes";

// only on staging:
{process.env.NEXT_PUBLIC_STAGE === "staging" && <PageNotes fullscreen />}`,
    props: [p("storageKey", "string", "localStorage key.", '"gx-notes:" + pathname'), p("colors", "string[]", "Note colors."), p("hotkey", "string | null", "Shortcut to start placing.", '"n"'), p("onChange", "(notes) => void", "Core only: sync somewhere.")],
    a11y: ["Notes are role=note with labelled textboxes; all actions are buttons; Esc cancels placing."],
    tags: ["package", "notes", "feedback", "review", "designers"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "tab-tricks",
    name: "Tab Tricks",
    exportName: "TabTricks",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("tab-tricks"),
    tagline: "When visitors switch tabs, your title cycles 'Come back 👀' and the favicon becomes eyes looking around.",
    description:
      "When they come back, a toast says welcome back. Bonus: progress(0–1) draws a progress ring in the favicon for uploads, timers or builds. The original title and icon are restored exactly. Try it now: switch tabs and look at this one.",
    useCases: ["E-commerce (cart reminders)", "Long tasks / uploads", "Personal sites"],
    vanilla: `import { tabTricks } from "@pickui/tab-tricks";

const tab = tabTricks({ away: ["Your cart misses you 🛒", "Still 20% off…"], favicon: "eyes" });
tab.progress(0.42); // favicon progress ring
tab.progress(null); // restore`,
    usage: `import { tabTricks } from "@/components/pickui/tab-tricks";
import { useEffect } from "react";

export function TabMagic() {
  useEffect(() => tabTricks({ welcome: "Welcome back 👋" }).destroy, []);
  return null;
}`,
    props: [p("away", "string[]", "Titles while hidden."), p("welcome", "string", "Toast on return ('' disables).", '"Welcome back 👋"'), p("interval", "number", "ms between titles.", "1400"), p("favicon", '"eyes" | "wave" | "none"', "Away animation.", '"eyes"'), p("accent", "string", "Icon/toast color.")],
    a11y: ["The welcome toast is a polite status; nothing changes while the tab is visible."],
    tags: ["package", "favicon", "title", "tab", "retention"],
    previewHeight: 320,
  },
  {
    slug: "shy-button",
    name: "Shy Button",
    exportName: "ShyButton",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("shy-button"),
    tagline: "Make 'Unsubscribe' run away from the mouse — dodge, teleport or shrink — until it gives up.",
    description: "After `patience` attempts it gives up with a sigh and stays. It never moves for keyboard focus, so it stays accessible and honest.",
    vanilla: `import { shy } from "@pickui/shy-button";

shy("#unsubscribe", { mode: "teleport", patience: 5, giveUpText: "fine… 😮‍💨" });`,
    usage: `import { ShyButton } from "@/components/pickui/shy-button";

<div className="relative h-40">
  <ShyButton mode="dodge" onClick={unsubscribe}>Unsubscribe</ShyButton>
</div>`,
    props: [p("mode", '"dodge" | "teleport" | "shrink"', "How it escapes.", '"dodge"'), p("distance", "number", "Trigger distance (px).", "90"), p("patience", "number", "Attempts before giving up.", "6"), p("giveUpText", "string", "Label after giving up.")],
    a11y: ["Never moves while focused or for touch; it's a real button the whole time."],
    tags: ["package", "button", "joke", "cursor"],
    previewHeight: 380,
    fill: true,
    variants: [
      { id: "dodge", label: "Dodge", prop: 'mode="dodge"', hint: "Slides away from the cursor." },
      { id: "teleport", label: "Teleport", prop: 'mode="teleport"', hint: "Blinks to a random spot." },
      { id: "shrink", label: "Shrink", prop: 'mode="shrink"', hint: "Gets smaller every attempt." },
    ],
  },
  {
    slug: "easter-eggs",
    name: "Easter Eggs",
    exportName: "EasterEggs",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("easter-eggs"),
    tagline: "A secret-code kit: Konami code or any word → barrel roll, Matrix rain, confetti, disco, earthquake.",
    description: "Register sequences and map them to built-in effects or your own functions. Typing in inputs is ignored, and every effect cleans up after itself.",
    vanilla: `import { easterEggs, effects } from "@pickui/easter-eggs";

easterEggs({
  eggs: {
    konami: effects.barrelRoll,
    matrix: effects.matrix,
    hire: () => location.assign("/contact"),
  },
});`,
    usage: `import { easterEggs, effects } from "@/components/pickui/easter-eggs";
import { useEffect } from "react";

export function Secrets() {
  useEffect(() => easterEggs({ eggs: { konami: effects.confetti } }).destroy, []);
  return null;
}`,
    props: [p("eggs", "Record<string, (el) => void>", "sequence → effect."), p("target", "HTMLElement", "Where effects apply.", "document.body"), p("onEgg", "(code) => void", "Analytics hook.")],
    a11y: ["Ignores typing in form fields; effects honour reduced motion."],
    tags: ["package", "konami", "easter egg", "secret"],
    previewHeight: 420,
    fill: true,
  },
  {
    slug: "fireflies",
    name: "Fireflies",
    exportName: "Fireflies",
    category: "Decoration",
    kind: "package",
    npm: npm("fireflies"),
    tagline: "Glowing fireflies drift, blink in near-sync and come closer to your cursor; move fast and they scatter.",
    description: "Each firefly has its own blink rhythm, and neighbours share phase buckets, so groups occasionally flash together like real ones. Drawn on one canvas with a screen blend.",
    vanilla: `import { fireflies } from "@pickui/fireflies";

fireflies({ count: 50, color: "214,255,120" });`,
    usage: `import { Fireflies } from "@/components/pickui/fireflies";

<section className="relative bg-black">
  <Fireflies count={40} />
  …
</section>`,
    props: [p("count", "number", "Fireflies.", "40"), p("color", "string", '"r,g,b".', '"214,255,120"'), p("size", "number", "Glow size multiplier.", "1")],
    a11y: DECORATION_A11Y,
    tags: ["package", "decoration", "night", "canvas", "glow"],
    previewHeight: 460,
    fill: true,
  },
  {
    slug: "rain-glass",
    name: "Rain on Glass",
    exportName: "RainGlass",
    category: "Decoration",
    kind: "package",
    npm: npm("rain-glass"),
    tagline: "Raindrops land on your screen, grow, merge and slide down leaving wet trails.",
    description: "Drops land on the screen and grow as they merge. Once heavy enough, they slide down wobbling, swallow smaller drops and leave a fading trail. Highlights and dark rims make them read as water.",
    vanilla: `import { rainGlass } from "@pickui/rain-glass";

rainGlass({ intensity: 50, maxSize: 10 });`,
    usage: `import { RainGlass } from "@/components/pickui/rain-glass";

<header className="relative">
  <RainGlass intensity={40} />
  …
</header>`,
    props: [p("intensity", "number", "Drops per second.", "40"), p("maxSize", "number", "Max drop radius.", "9")],
    a11y: DECORATION_A11Y,
    tags: ["package", "rain", "weather", "canvas", "mood"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "page-shatter",
    name: "Page Shatter",
    exportName: "PageShatter",
    category: "Weird & Fun",
    kind: "package",
    npm: npm("page-shatter"),
    tagline: "Click any element and it shatters like glass from the impact point, then reassembles. Made for screen recordings.",
    description:
      "The real element is cloned into irregular glass shards with clip-path; they burst out with spin and gravity, and restore() plays it backwards. Works on any element: cards, headings, images, a whole section.",
    craft: ["Radial slices around the impact point, split once more, give irregular shards that look like real glass."],
    useCases: ["404 pages", "'Delete' confirmations", "Instagram / TikTok demos"],
    vanilla: `import { shatter } from "@pickui/page-shatter";

card.addEventListener("click", (e) => {
  const glass = shatter(card, { at: { x: e.clientX, y: e.clientY }, pieces: 16 });
  setTimeout(() => glass.restore(), 2000);
});`,
    usage: `import { PageShatter } from "@/components/pickui/page-shatter";

<PageShatter pieces={16}>
  <YourCard />
</PageShatter>`,
    props: [p("pieces", "number", "Radial slices.", "14"), p("force", "number", "Explosion strength.", "1"), p("at", "{ x; y }", "Impact point (client coords).")],
    a11y: ["Keyboard: Enter/Space shatters from the center; reduced motion fades instead."],
    tags: ["package", "glass", "shatter", "viral", "wow"],
    previewHeight: 420,
    fill: true,
    isNew: true,
  },

  /* ── Packages: business & promo ──────────────────────────────────────── */
  {
    slug: "promo-plane",
    name: "Promo Plane",
    exportName: "PromoPlane",
    category: "Business & Promo",
    kind: "package",
    npm: npm("promo-plane"),
    tagline: "A little plane tows your promo banner across the top of the page. Hover pauses it, click opens it, ✕ dismisses it for good.",
    description:
      "An ad that people smile at instead of block. Capped per day, never covers content for long, never blocks clicks. Use it for your own promos, sponsors and affiliate offers. Do NOT put ad-network iframes (AdSense etc.) inside moving elements: that breaks their policies.",
    craft: ["Web Animations API: hover simply pauses the flight; ✕ finishes it and remembers your choice."],
    useCases: ["Seasonal sales", "Launch announcements", "Sponsor shout-outs"],
    vanilla: `import { promoPlane } from "@pickui/promo-plane";

promoPlane({
  text: "🚀 Launch week — 40% off Pro",
  href: "/pricing",
  delay: 6,        // first flight after 6s
  dailyCap: 2,     // max 2 flights per visitor per day
});`,
    usage: `import { PromoPlane } from "@/components/pickui/promo-plane";

<PromoPlane fullscreen text="🚀 Launch week — 40% off Pro" href="/pricing" dailyCap={2} />`,
    props: [p("text / href", "string", "Banner copy and link."), p("color", "string", "Banner color.", '"#fde047"'), p("duration", "number", "Seconds to cross.", "14"), p("delay", "number", "First flight after (s).", "4"), p("every", "number", "Repeat every (s), 0 = once.", "0"), p("dailyCap", "number", "Flights per visitor per day.", "3")],
    a11y: ["The banner is a real link with a label; pauses on hover/focus; dismiss button; reduced motion parks it in the corner."],
    tags: ["package", "ads", "promo", "marketing", "business"],
    previewHeight: 460,
    fill: true,
    isNew: true,
  },
  {
    slug: "peek-promo",
    name: "Peek Promo",
    exportName: "PeekPromo",
    category: "Business & Promo",
    kind: "package",
    npm: npm("peek-promo"),
    tagline: "A friendly character peeks from the edge holding a sign — only after the visitor is engaged.",
    description:
      "It appears after a scroll depth or time on page, waves, and slides back on its own if ignored. Clicking the sign unfolds a compact offer card in place: no modal, no overlay. ✕ snoozes it for days.",
    useCases: ["First-order discounts", "Newsletter offers", "Free-trial nudges"],
    vanilla: `import { peekPromo } from "@pickui/peek-promo";

peekPromo({
  sign: "psst! 🎁",
  title: "A gift for reading",
  body: "15% off your first order.",
  cta: "Claim 15% off",
  href: "/shop?code=HELLO15",
  afterScroll: 0.4,
});`,
    usage: `import { PeekPromo } from "@/components/pickui/peek-promo";

<PeekPromo fullscreen side="right" afterScroll={0.4} href="/shop?code=HELLO15" />`,
    props: [p("sign / title / body / cta / href", "string", "Content."), p("side", '"left" | "right"', "Edge.", '"right"'), p("afterScroll", "number", "Depth 0–1.", "0.35"), p("afterSeconds", "number", "…or seconds on page.", "12"), p("stay", "number", "Auto-hide after (s).", "9"), p("snoozeDays", "number", "Hidden after ✕ (days).", "7")],
    a11y: ["Sign is a button with aria-expanded; the offer is a labelled dialog region; nothing traps focus."],
    tags: ["package", "promo", "character", "conversion", "business"],
    previewHeight: 460,
    fill: true,
    isNew: true,
    variants: [
      { id: "right", label: "Right", prop: 'side="right"', hint: "Peeks from the right edge." },
      { id: "left", label: "Left", prop: 'side="left"', hint: "Peeks from the left edge." },
    ],
  },
  {
    slug: "scroll-reward",
    name: "Scroll Reward",
    exportName: "ScrollReward",
    category: "Business & Promo",
    kind: "package",
    npm: npm("scroll-reward"),
    tagline: "Reward attention instead of interrupting it: finish the article and a coupon ticket slides in.",
    description: "A slim reading-progress line, then a ticket in the corner when the visitor reaches the depth you choose; tap to reveal and copy the code. Once per reader per article. No modal, nothing blocked.",
    useCases: ["Blogs that sell", "Content marketing", "Docs with paid tiers"],
    vanilla: `import { scrollReward } from "@pickui/scroll-reward";

scrollReward({ at: 0.9, code: "READER10", note: "10% off — just for finishing." });`,
    usage: `import { scrollReward } from "@/components/pickui/scroll-reward";
import { useEffect } from "react";

export function ArticleReward() {
  useEffect(() => scrollReward({ code: "READER10" }).destroy, []);
  return null;
}`,
    props: [p("at", "number", "Depth 0–1.", "0.9"), p("title / note / code", "string", "Ticket content."), p("progressBar", "boolean", "Show reading progress.", "true"), p("color", "string", "Accent.")],
    a11y: ["Progress bar has role=progressbar; the ticket is a status; code copy is a button."],
    tags: ["package", "coupon", "content", "conversion", "business"],
    previewHeight: 440,
    fill: true,
  },
  {
    slug: "exit-whisper",
    name: "Exit Whisper",
    exportName: "ExitWhisper",
    category: "Business & Promo",
    kind: "package",
    npm: npm("exit-whisper"),
    tagline: "Exit intent without the rage: a small note drops on a string from the top edge — no modal.",
    description: "Triggered when the cursor races to the tab bar (or a fast scroll-up on mobile). One line and one button; it reels itself back up if ignored. Max once per session.",
    useCases: ["Abandoned carts", "Free-shipping nudges", "Newsletter last call"],
    vanilla: `import { exitWhisper } from "@pickui/exit-whisper";

exitWhisper({ text: "Your cart is saved — free shipping today.", cta: "Use FREESHIP", href: "/cart" });`,
    usage: `import { ExitWhisper } from "@/components/pickui/exit-whisper";

<ExitWhisper fullscreen text="Your cart is saved — free shipping today." href="/cart" />`,
    props: [p("text / cta / href", "string", "Content."), p("stay", "number", "Auto-hide after (s).", "6"), p("minTime", "number", "Min seconds on page.", "8"), p("color", "string", "Button color.")],
    a11y: ["Status role, dismiss button, no focus trap, no overlay."],
    tags: ["package", "exit intent", "cart", "conversion", "business"],
    previewHeight: 440,
    fill: true,
  },
  {
    slug: "sponsor-flip",
    name: "Sponsor Flip",
    exportName: "SponsorFlip",
    category: "Business & Promo",
    kind: "package",
    npm: npm("sponsor-flip"),
    tagline: "A clearly labelled sponsor card in a corner that flips in 3D between sponsors, and collapses to a dot.",
    description:
      "Hover pauses it, one click collapses it to a dot for the session, and the dot reopens it. An onEvent callback reports impressions and clicks so you can bill sponsors. Links use rel=\"sponsored\".",
    useCases: ["Newsletters & blogs with sponsors", "Open-source sites", "Community pages"],
    vanilla: `import { sponsorFlip } from "@pickui/sponsor-flip";

sponsorFlip({
  sponsors: [{ name: "Acme", line: "Deploy in 30s", href: "https://acme.example", color: "#4ade80" }],
  onEvent: (type, s) => fetch("/api/sponsor-stats", { method: "POST", body: JSON.stringify({ type, s: s.name }) }),
});`,
    usage: `import { SponsorFlip } from "@/components/pickui/sponsor-flip";

<SponsorFlip fullscreen corner="bottom-left" every={6} />`,
    props: [p("sponsors", "{ name; line; href; color; logo? }[]", "Rotation."), p("every", "number", "Seconds per sponsor.", "6"), p("corner", '"bottom-left" | …', "Position.", '"bottom-left"'), p("onEvent", '("impression" | "click", s) => void', "Reporting hook.")],
    a11y: ["Always labelled 'Sponsored'; pauses on hover/focus; minimise/restore buttons."],
    tags: ["package", "sponsors", "ads", "business"],
    previewHeight: 440,
    fill: true,
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
