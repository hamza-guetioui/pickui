"use client";

import * as React from "react";
import ExpeditionMap from "./expedition-map";
import WaxSealLetter from "./wax-seal-letter";

/**
 * MuseumExhibitPage — a digital exhibition room for museums, archives and
 * history projects: a gilded title plate, an exhibit label, the interactive
 * ExpeditionMap as the centerpiece, a sealed letter "from the archive", and
 * catalogue cards with accession numbers.
 * Template · uses ./expedition-map and ./wax-seal-letter (installed together).
 */

export type MuseumExhibitPageProps = {
  museum?: string;
  exhibit?: string;
  /** false = calm page, components in regular mode. Default true. */
  animated?: boolean;
  className?: string;
};

const ARTIFACTS = [
  { no: "1721.04.a", name: "Ship’s chronometer", mat: "Brass, glass", era: "c. 1720" },
  { no: "1721.09.c", name: "Captain’s logbook", mat: "Vellum, iron-gall ink", era: "1721–22" },
  { no: "1722.01.b", name: "Pocket astrolabe", mat: "Bronze", era: "c. 1700" },
];

export function MuseumExhibitPage({ museum = "Saltmere Maritime Museum", exhibit = "The Voyage of the Aurora", animated = true, className = "" }: MuseumExhibitPageProps) {
  return (
    <main className={`w-full bg-[#14110d] text-[#efe2c4] ${className}`}>
      <header className="border-b border-[#efe2c4]/10 px-6 py-4 text-center font-serif text-xs uppercase tracking-[0.4em] text-[#efe2c4]/60">{museum}</header>
      <section className="px-6 py-12 text-center">
        <div className="mx-auto inline-block rounded-sm border border-[#c9a227]/50 px-8 py-6 shadow-[inset_0_0_0_6px_#14110d,inset_0_0_0_7px_rgba(201,162,39,.35)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a227]">Gallery III · Permanent collection</p>
          <h1 className="mt-3 font-serif text-4xl italic sm:text-5xl">{exhibit}</h1>
          <p className="mt-2 font-serif text-sm text-[#efe2c4]/60">1721 — 1722 · Five legs across the Quiet Sea</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6">
        <ExpeditionMap animated={animated} />
      </section>

      <section className="mx-auto mt-14 grid max-w-4xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#c9a227]">From the archive</p>
          <h2 className="mt-2 font-serif text-3xl italic">A letter never opened</h2>
          <p className="mt-3 font-serif leading-relaxed text-[#efe2c4]/70">
            Found sealed in the captain’s sea chest. Break the seal to read it — conservators have digitised the contents so the original can stay
            closed.
          </p>
        </div>
        <div className="flex justify-center pb-10">
          <WaxSealLetter
            initial="A"
            to="To my dearest Elinor"
            title="We have seen land"
            body="After forty days of silence the lookout cried out in the night. I write this by lantern; tomorrow we row ashore."
            signature="— Capt. J. Marlowe"
            animated={animated}
          />
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-4xl px-6 pb-16">
        <h2 className="font-serif text-2xl italic">Objects in this room</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {ARTIFACTS.map((a) => (
            <li key={a.no} className="rounded-sm border border-[#efe2c4]/15 bg-[#1b1712] p-4">
              <p className="font-mono text-[10px] text-[#c9a227]">Acc. no. {a.no}</p>
              <p className="mt-2 font-serif text-lg italic">{a.name}</p>
              <p className="mt-1 text-xs text-[#efe2c4]/55">
                {a.mat} · {a.era}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center font-serif text-xs italic text-[#efe2c4]/40">Fictional exhibit — placeholder content for this template.</p>
      </section>
    </main>
  );
}

export default MuseumExhibitPage;
