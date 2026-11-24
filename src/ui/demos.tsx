"use client";

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type DemoProps = { variant?: string };
type DemoModule = { default: ComponentType<DemoProps> };
type Entry = { load: () => Promise<DemoModule>; auto?: boolean };

/** Custom demo file (src/demos/<slug>.tsx). */
const demo = (load: () => Promise<unknown>): Entry => ({ load: load as Entry["load"] });
/** No custom demo: render the library component with its defaults. */
const auto = (load: () => Promise<unknown>): Entry => ({ load: load as Entry["load"], auto: true });

/** slug → demo loader (each demo is its own JS chunk). */
export const LOADERS: Record<string, Entry> = {
  "holo-card": demo(() => import("../demos/holo-card")),
  "folder-peek": demo(() => import("../demos/folder-peek")),
  "scroll-moon": demo(() => import("../demos/scroll-moon")),
  "scroll-jellyfish": demo(() => import("../demos/scroll-jellyfish")),
  "eiffel-dive": demo(() => import("../demos/eiffel-dive")),
  "haunted-room": demo(() => import("../demos/haunted-room")),
  "evidence-desk": auto(() => import("../library/evidence-desk")),
  "exploded-stack": demo(() => import("../demos/exploded-stack")),
  "pull-cord": demo(() => import("../demos/pull-cord")),
  keycaps: demo(() => import("../demos/keycaps")),
  "split-flap": demo(() => import("../demos/split-flap")),
  "neon-sign": demo(() => import("../demos/neon-sign")),
  "ticket-tear": demo(() => import("../demos/ticket-tear")),
  "scratch-card": demo(() => import("../demos/scratch-card")),
  "flashlight-reveal": demo(() => import("../demos/flashlight-reveal")),
  "receipt-printer": demo(() => import("../demos/receipt-printer")),
  "signal-lost": demo(() => import("../demos/signal-lost")),
  "magnetic-button": auto(() => import("../library/magnetic-button")),
  "spotlight-cards": auto(() => import("../library/spotlight-cards")),
  "aurora-input": auto(() => import("../library/aurora-input")),
  "gooey-toggle": auto(() => import("../library/gooey-toggle")),
  "slide-to-confirm": auto(() => import("../library/slide-to-confirm")),
  "hold-to-confirm": auto(() => import("../library/hold-to-confirm")),
  "morph-tabs": auto(() => import("../library/morph-tabs")),
  "toast-stack": auto(() => import("../library/toast-stack")),
  "odometer": auto(() => import("../library/odometer")),
  "palette-studio": auto(() => import("../library/palette-studio")),
  "before-after": auto(() => import("../library/before-after")),
  "ink-canvas": auto(() => import("../library/ink-canvas")),
  "flow-field": auto(() => import("../library/flow-field")),
  "typewriter": auto(() => import("../library/typewriter")),
  "rotary-dial": auto(() => import("../library/rotary-dial")),
  "wax-seal-letter": auto(() => import("../library/wax-seal-letter")),
  "cassette-player": auto(() => import("../library/cassette-player")),
  "polaroid": auto(() => import("../library/polaroid")),
  "morse-telegraph": auto(() => import("../library/morse-telegraph")),
  "nixie-counter": auto(() => import("../library/nixie-counter")),
  "speedometer": auto(() => import("../library/speedometer")),
  "gear-shifter": auto(() => import("../library/gear-shifter")),
  "gear-train": auto(() => import("../library/gear-train")),
  "oscilloscope": auto(() => import("../library/oscilloscope")),
  "ghost-cursor": auto(() => import("../library/ghost-cursor")),
  "add-to-cart": auto(() => import("../library/add-to-cart")),
  "pay-button": auto(() => import("../library/pay-button")),
  "drop-countdown": auto(() => import("../library/drop-countdown")),
  "swipe-deck": auto(() => import("../library/swipe-deck")),
  "pricing-block": auto(() => import("../library/pricing-block")),
  "bento-grid": auto(() => import("../library/bento-grid")),
  "testimonial-wall": auto(() => import("../library/testimonial-wall")),
  "shipping-tracker": auto(() => import("../library/shipping-tracker")),
  "expedition-map": auto(() => import("../library/expedition-map")),
  "coming-soon-page": auto(() => import("../library/coming-soon-page")),
  "product-drop-page": auto(() => import("../library/product-drop-page")),
  "museum-exhibit-page": auto(() => import("../library/museum-exhibit-page")),
  "terminal-hero": auto(() => import("../library/terminal-hero")),
  "logo-ring": auto(() => import("../library/logo-ring")),
  "scroll-story": auto(() => import("../library/scroll-story")),
  "faq-accordion": auto(() => import("../library/faq-accordion")),
  "paper-plane-newsletter": auto(() => import("../library/paper-plane-newsletter")),
  "live-stats": auto(() => import("../library/live-stats")),
  "lanyard-team": auto(() => import("../library/lanyard-team")),
  "changelog-graph": auto(() => import("../library/changelog-graph")),
  "warp-cta": auto(() => import("../library/warp-cta")),
  "wordmark-footer": auto(() => import("../library/wordmark-footer")),
  "kanban-board": auto(() => import("../library/kanban-board")),
  "integrations-hub": auto(() => import("../library/integrations-hub")),
  "dashboard-shell": auto(() => import("../library/dashboard-shell")),
  "docs-starter": auto(() => import("../library/docs-starter")),
  "agency-kinetic": auto(() => import("../library/agency-kinetic")),
  "site-shell": auto(() => import("../library/site-shell")),
  "status-pages": demo(() => import("../demos/status-pages")),
  "ghost-walker": demo(() => import("../demos/ghost-walker")),
  "screen-pet": demo(() => import("../demos/screen-pet")),
  "edge-dock": demo(() => import("../demos/edge-dock")),
  "snow-pile": demo(() => import("../demos/snow-pile")),
  "page-gravity": demo(() => import("../demos/page-gravity")),
  "page-notes": demo(() => import("../demos/page-notes")),
  "shy-button": demo(() => import("../demos/shy-button")),
  "fireflies": demo(() => import("../demos/fireflies")),
  "rain-glass": demo(() => import("../demos/rain-glass")),
  "scroll-reward": demo(() => import("../demos/scroll-reward")),
  "promo-plane": demo(() => import("../demos/promo-plane")),
  "peek-promo": demo(() => import("../demos/peek-promo")),
  "exit-whisper": demo(() => import("../demos/exit-whisper")),
  "sponsor-flip": demo(() => import("../demos/sponsor-flip")),
  "tab-tricks": auto(() => import("../library/tab-tricks")),
  "easter-eggs": auto(() => import("../library/easter-eggs")),
  "page-shatter": auto(() => import("../library/page-shatter")),
  "bug-runner": auto(() => import("../library/bug-runner")),
  "snake-dev": auto(() => import("../library/snake-dev")),
  "ship-it": auto(() => import("../library/ship-it")),
  "brick-breaker": auto(() => import("../library/brick-breaker")),
  pong: auto(() => import("../library/pong")),
  "bug-invaders": auto(() => import("../library/bug-invaders")),
  "stack-tower": auto(() => import("../library/stack-tower")),
  "memory-flip": auto(() => import("../library/memory-flip")),
  "command-palette": demo(() => import("../demos/command-palette")),
};

const cache = new Map<string, Promise<DemoModule>>();

/** Start downloading a demo's chunk (idempotent). Returns the module promise. */
export function preloadDemo(slug: string): Promise<DemoModule> | undefined {
  const e = LOADERS[slug];
  if (!e) return undefined;
  let p = cache.get(slug);
  if (!p) {
    p = e.load().then((m) =>
      e.auto
        ? {
            default: function AutoDemo({ variant }: DemoProps) {
              const M = m.default as ComponentType<{ animated?: boolean }>;
              return <M animated={variant !== "regular"} />;
            },
          }
        : m,
    );
    // a failed download can be retried later
    p.catch(() => cache.delete(slug));
    cache.set(slug, p);
  }
  return p;
}

const lazies = new Map<string, LazyExoticComponent<ComponentType<DemoProps>>>();

/** React.lazy component for a slug (stable per slug), or undefined if unknown. */
export function getDemo(slug: string) {
  if (!LOADERS[slug]) return undefined;
  let L = lazies.get(slug);
  if (!L) {
    L = lazy(() => preloadDemo(slug)!);
    lazies.set(slug, L);
  }
  return L;
}

/** Forget a failed lazy so "Retry" can download it again. */
export function resetDemo(slug: string) {
  lazies.delete(slug);
  cache.delete(slug);
}
