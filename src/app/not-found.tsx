import type { Metadata } from "next";
import Link from "next/link";
import SignalLost from "@/library/signal-lost";

export const metadata: Metadata = {
  title: "Page not found · PickUI",
  robots: { index: false, follow: true },
};

/** 404 — dogfoods the Signal Lost component from the library. */
export default function NotFound() {
  return (
    <div className="py-8">
      <div className="overflow-hidden rounded-2xl border ui-line">
        <SignalLost
          code="404"
          title="Signal lost"
          message="This page stopped broadcasting. The component may have been renamed, or never existed."
          channel="PICKUI · CH 404"
          className="min-h-[70vh]"
        >
          <Link href="/components" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:opacity-85">
            Browse components
          </Link>
          <Link href="/components?kind=block" className="inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
            See blocks
          </Link>
        </SignalLost>
      </div>
    </div>
  );
}
