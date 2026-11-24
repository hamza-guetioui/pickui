"use client";

import { useState } from "react";
import ExitWhisper from "../library/exit-whisper";
import FakeSite from "./_site";

export default function ExitWhisperDemo() {
  const [key] = useState(() => `gx-exit-demo-${Date.now()}`);
  return (
    <FakeSite>
      <ExitWhisper minTime={0} stay={8} storageKey={key} />
    </FakeSite>
  );
}
