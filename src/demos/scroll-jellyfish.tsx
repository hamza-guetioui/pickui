"use client";

import ScrollJellyfish, { type JellyTheme } from "../library/scroll-jellyfish";

const COPY: Record<JellyTheme, { word: string; caption: string }[]> = {
  pelagia: [
    { word: "DRIFT", caption: "Scroll inside the preview." },
    { word: "INSPIRE", caption: "Every tentacle is simulated." },
    { word: "DESIGN TO", caption: "Ray-traced, translucent bell." },
    { word: "FEEL ALIVE", caption: "Your story here." },
  ],
  moon: [
    { word: "DEEP", caption: "Scroll inside the preview." },
    { word: "CALM", caption: "Glass-clear, four violet rings." },
    { word: "FLOW", caption: "It swims as you scroll." },
    { word: "BREATHE", caption: "Your story here." },
  ],
  abyss: [
    { word: "ABYSS", caption: "Scroll inside the preview." },
    { word: "GLOW", caption: "Bioluminescent waves." },
    { word: "PULSE", caption: "Faster scroll, stronger strokes." },
    { word: "BEYOND", caption: "Your story here." },
  ],
};

export default function ScrollJellyfishDemo({ variant = "pelagia" }: { variant?: string }) {
  const theme = (variant in COPY ? variant : "pelagia") as JellyTheme;
  return <ScrollJellyfish theme={theme} sections={COPY[theme]} />;
}
