"use client";

import Link from "next/link";
import { useEffect } from "react";
import SignalLost from "@/library/signal-lost";
import "./globals.css";

/** Last-resort boundary (the root layout itself failed): renders its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050505] font-sans antialiased">
        <title>Something went wrong · PickUI</title>
        <SignalLost code="500" title="Off air" message="PickUI hit an unexpected error. Reload to try again." channel="PICKUI · OFF AIR" className="min-h-screen">
          <button type="button" onClick={reset} className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black">
            Reload
          </button>
          <Link href="/components" className="inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white">
            Home
          </Link>
        </SignalLost>
      </body>
    </html>
  );
}
