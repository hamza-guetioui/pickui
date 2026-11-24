"use client";

import NeonSign from "../library/neon-sign";

export default function NeonSignDemo({ variant = "animated" }: { variant?: string }) {
  return <NeonSign animated={variant !== "regular"} text="Open late" subtext="code & coffee" color="#ff2d95" subColor="#38e1ff" broken={[6]} />;
}
