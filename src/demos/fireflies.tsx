"use client";

import Fireflies from "../library/fireflies";
import FakeSite from "./_site";

export default function FirefliesDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite tone="night">
      <Fireflies count={46} animated={variant !== "regular"} />
    </FakeSite>
  );
}
