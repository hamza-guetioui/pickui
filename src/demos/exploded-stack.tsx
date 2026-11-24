"use client";

import ExplodedStack from "../library/exploded-stack";

export default function ExplodedStackDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <ExplodedStack animated={variant !== "regular"}
      layers={[
        { label: "Database", description: "Postgres · Drizzle", color: "#22d3ee" },
        { label: "API", description: "Server actions · zod", color: "#a78bfa" },
        { label: "UI", description: "React · Tailwind", color: "#4ade80" },
        { label: "Edge", description: "CDN · cache · images", color: "#fb923c" },
      ]}
    />
  );
}
