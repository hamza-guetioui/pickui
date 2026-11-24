"use client";

import Link from "next/link";
import { useEffect } from "react";
import SignalLost from "@/library/signal-lost";

/** Route error boundary — the site chrome stays, the page shows a retry. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-8">
      <title>Something went wrong · PickUI</title>
      <meta name="robots" content="noindex" />
      <div className="overflow-hidden rounded-2xl border ui-line">
        <SignalLost
          code="500"
          title="Interference"
          message="Something broke while rendering this page. Try again; if it keeps happening, please open an issue."
          channel={error.digest ? `PICKUI · ERR ${error.digest.slice(0, 10)}` : "PICKUI · ERR"}
          intensity="chaos"
          className="min-h-[70vh]"
        >
          <button type="button" onClick={reset} className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:opacity-85">
            Try again
          </button>
          <Link href="/components" className="inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
            Back to components
          </Link>
        </SignalLost>
      </div>
    </div>
  );
}
