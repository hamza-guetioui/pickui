"use client";

import ScreenPet from "../library/screen-pet";
import FakeSite from "./_site";

export default function ScreenPetDemo({ variant = "cat" }: { variant?: string }) {
  return (
    <FakeSite>
      <ScreenPet kind={variant as "cat" | "robot" | "blob"} color={variant === "robot" ? "#94a3b8" : variant === "blob" ? "#a78bfa" : "#f59e0b"} />
    </FakeSite>
  );
}
