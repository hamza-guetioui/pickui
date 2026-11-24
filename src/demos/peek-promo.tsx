"use client";

import { useState } from "react";
import PeekPromo from "../library/peek-promo";
import FakeSite from "./_site";

export default function PeekPromoDemo({ variant = "right" }: { variant?: string }) {
  const [key] = useState(() => `gx-peek-demo-${Date.now()}`);
  return (
    <FakeSite>
      <PeekPromo side={variant === "left" ? "left" : "right"} afterSeconds={1.5} stay={30} storageKey={key} key={variant} />
    </FakeSite>
  );
}
