"use client";

import RainGlass from "../library/rain-glass";
import FakeSite from "./_site";

export default function RainGlassDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite tone="window">
      <RainGlass intensity={45} animated={variant !== "regular"} />
    </FakeSite>
  );
}
