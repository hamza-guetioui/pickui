"use client";

import { useState } from "react";
import ScrollReward from "../library/scroll-reward";

export default function ScrollRewardDemo() {
  // fresh key per visit so the demo always shows the reward (in production it's once per reader)
  const [key] = useState(() => `gx-scroll-reward-demo-${Date.now()}`);
  return <ScrollReward storageKey={key} at={0.85} code="READER10" />;
}
