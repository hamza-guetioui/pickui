"use client";

import SnowPile from "../library/snow-pile";
import FakeSite from "./_site";

export default function SnowPileDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite tone="window">
      <SnowPile selector="h1, button, [data-snow]" density={180} animated={variant !== "regular"} />
    </FakeSite>
  );
}
