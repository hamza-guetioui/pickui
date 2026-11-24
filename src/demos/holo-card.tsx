"use client";

import HoloCard, { type HoloRarity } from "../library/holo-card";

export default function HoloCardDemo({ variant = "rare" }: { variant?: string }) {
  if (variant === "shinigami") {
    return (
      <HoloCard
        edition="shinigami"
        name="Kurozu"
        role="God of Death · Bored"
        serial="No. 013"
        stats={[
          { label: "Fruit", value: "12" },
          { label: "Souls", value: "666" },
          { label: "Mercy", value: "0" },
        ]}
      />
    );
  }
  return (
    <HoloCard
      rarity={(["rare", "epic", "legendary"].includes(variant) ? variant : "rare") as HoloRarity}
      name="Ada Lovelace"
      role="Full-stack developer"
      handle="@ada"
      serial="No. 001"
      accent="#4ade80"
      stats={[
        { label: "Projects", value: "40+" },
        { label: "Stack", value: "27" },
        { label: "Coffee", value: "∞" },
      ]}
      bio="Builds fast, tactile web apps — from database to the last pixel."
      skills={[
        { label: "React / Next.js", level: 95 },
        { label: "TypeScript", level: 92 },
        { label: "Databases", level: 84 },
        { label: "Motion & UI", level: 88 },
      ]}
      ability={{ name: "Ship it", text: "Turns a Figma frame into production in one afternoon." }}
    />
  );
}
