"use client";

import ScrollMoon, { type MoonTheme } from "../library/scroll-moon";

const COPY: Record<MoonTheme, { eyebrow: string; title: string; body: string }[]> = {
  moon: [
    { eyebrow: "01 — Distance", title: "It starts as a sliver.", body: "Scroll inside the preview to travel." },
    { eyebrow: "02 — Approach", title: "Then the light turns.", body: "The terminator sweeps across the disc." },
    { eyebrow: "03 — Full", title: "Every crater, in focus.", body: "Detail is generated as you get closer." },
    { eyebrow: "04 — Arrival", title: "Touch the horizon.", body: "Your story lands here." },
  ],
  blood: [
    { eyebrow: "Eclipse · 00:00", title: "Earth steps in front.", body: "Scroll inside the preview." },
    { eyebrow: "Totality", title: "The moon turns red.", body: "Every sunrise on Earth, refracted onto it." },
    { eyebrow: "Closer", title: "Copper craters.", body: "Same terrain, eclipse lighting." },
    { eyebrow: "Launch", title: "Rare. Like your drop.", body: "Perfect for limited releases." },
  ],
  mars: [
    { eyebrow: "Sol 1", title: "A red dot.", body: "Scroll inside the preview." },
    { eyebrow: "Sol 120", title: "Ice caps appear.", body: "Thin, dusty atmosphere on the limb." },
    { eyebrow: "Orbit", title: "Rust and basalt.", body: "Procedural terrain, no textures." },
    { eyebrow: "Landing", title: "Welcome to Mars.", body: "Build the next chapter here." },
  ],
};

export default function ScrollMoonDemo({ variant = "moon" }: { variant?: string }) {
  const theme = (variant in COPY ? variant : "moon") as MoonTheme;
  return <ScrollMoon theme={theme} sections={COPY[theme]} />;
}
