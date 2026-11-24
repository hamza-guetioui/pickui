"use client";

import EdgeDock from "../library/edge-dock";
import FakeSite from "./_site";

export default function EdgeDockDemo({ variant = "right" }: { variant?: string }) {
  return (
    <FakeSite>
      <EdgeDock side={variant === "left" ? "left" : "right"} accent="#4ade80" />
    </FakeSite>
  );
}
