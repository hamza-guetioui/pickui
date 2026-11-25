"use client";

import GhostWalker from "../library/ghost-walker";
import FakeSite from "./_site";

export default function GhostWalkerDemo({ variant = "shy" }: { variant?: string }) {
  return (
    <FakeSite tone="night">
      {variant === "regular" ? (
        <GhostWalker animated={false} />
      ) : variant === "prankster" ? (
        <GhostWalker key="prankster" count={3} behavior="prankster" />
      ) : variant === "interact" ? (
        <GhostWalker key="interact" count={4} interact />
      ) : (
        <GhostWalker key="shy" count={4} />
      )}
    </FakeSite>
  );
}
