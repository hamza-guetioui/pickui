"use client";

import Fireflies, { type FirefliesStyle } from "../library/fireflies";
import FakeSite from "./_site";

const TONE: Record<FirefliesStyle, "dark" | "night" | "window"> = { fireflies: "night", snow: "window", paper: "dark", leaves: "dark" };

export default function FirefliesDemo({ variant = "fireflies" }: { variant?: string }) {
  const regular = variant === "regular";
  const style: FirefliesStyle = regular ? "leaves" : ((["fireflies", "snow", "paper", "leaves"].includes(variant) ? variant : "fireflies") as FirefliesStyle);
  return (
    <FakeSite tone={TONE[style]}>
      <Fireflies key={variant} style={style} animated={!regular} />
    </FakeSite>
  );
}
