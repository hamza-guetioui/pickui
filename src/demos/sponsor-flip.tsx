"use client";

import SponsorFlip from "../library/sponsor-flip";
import FakeSite from "./_site";

export default function SponsorFlipDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite>
      <SponsorFlip every={4} corner="bottom-left" animated={variant !== "regular"} />
    </FakeSite>
  );
}
