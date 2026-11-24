"use client";

import PageGravity from "../library/page-gravity";
import FakeSite from "./_site";

export default function PageGravityDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <FakeSite gravity>
      <PageGravity animated={variant !== "regular"} />
    </FakeSite>
  );
}
