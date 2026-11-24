"use client";

import Link from "next/link";
import SignalLost from "../library/signal-lost";

export default function SignalLostDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <SignalLost animated={variant !== "regular"} code="404" title="Signal lost" channel="CH 04 · NO CARRIER">
      <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-200">
        Back to home
      </Link>
      <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">
        Browse components
      </Link>
    </SignalLost>
  );
}
