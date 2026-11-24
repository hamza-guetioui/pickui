"use client";

import HauntedRoom from "../library/haunted-room";

export default function HauntedRoomDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <HauntedRoom animated={variant !== "regular"} className="h-full min-h-[460px]">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">Room 237 · open if you dare</p>
    </HauntedRoom>
  );
}
