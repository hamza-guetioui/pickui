"use client";

import GhostWalker from "../library/ghost-walker";
import FakeSite from "./_site";

export default function GhostWalkerDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite>
      <GhostWalker count={4} animated={variant !== "regular"} />
    </FakeSite>
  );
}
