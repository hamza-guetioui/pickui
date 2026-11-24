import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Bot, ClipboardCopy, Terminal } from "lucide-react";
import ExplodedStack from "../library/exploded-stack";
import { CATEGORY_ORDER, COMPONENTS, installCommand } from "../catalog";
import Catalog, { CatalogFromUrl } from "../ui/Catalog";
import CopyButton from "../ui/CopyButton";
import { Crosshairs } from "../ui/Frame";
import { PickMark } from "../ui/Logo";
import { REPO_URL } from "../lib/site";

/** /components — PickUI landing + live catalogue. */
export default function ComponentsIndexView() {
  const items = COMPONENTS.map(({ slug, name, category, tagline, tags, previewHeight, fill, isNew, kind, variants }) => ({
    versions: variants?.length ?? 0,
    kind: kind ?? "component",
    slug,
    name,
    category,
    tagline,
    tags,
    previewHeight,
    fill,
    isNew,
  }));
  const categories = CATEGORY_ORDER.filter((c) => COMPONENTS.some((x) => x.category === c));
  const sample = installCommand("holo-card");

  return (
    <div className="pt-6 sm:pt-10">
      {/* hero */}
      <div className="relative">
      <Crosshairs />
      <section className="relative overflow-hidden border ui-line ui-surface">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_75%)]"
        />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-[conic-gradient(from_180deg,#ff4d8d,#8b5cf6,#38bdf8,#ff4d8d)] opacity-[0.2] blur-3xl"
        />

        <div className="relative grid items-center gap-8 px-5 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_.85fr]">
          <div>
          <Link
            href="#browse"
            className="inline-flex items-center gap-2 rounded-full border ui-line ui-soft py-1 pl-1 pr-3 text-xs ui-muted transition hover:border-[rgb(var(--ui-ink)/0.25)]"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#8b5cf6] px-2 py-0.5 font-semibold text-white">
              <PickMark className="h-3.5 w-3.5" /> pickui
            </span>
            {COMPONENTS.length} components, blocks &amp; templates · zero dependencies
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>

          <h1 className="mt-5 max-w-3xl text-[clamp(2.1rem,5vw,3.6rem)] font-black leading-[0.95] tracking-[-0.045em] ui-ink">
            UI that AI
            <br />
            <span className="bg-gradient-to-r from-[rgb(var(--ui-ink))] via-[rgb(var(--ui-ink)/0.7)] to-[rgb(var(--ui-ink)/0.35)] bg-clip-text text-transparent">
              can&apos;t one-shot.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed ui-muted sm:text-base">
            Hand-built components with physics, real 3D and tactile detail, the parts that are hard to describe and
            harder to prompt. Install one with a single command, copy one file, or give your AI a prompt that keeps
            the details intact.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#browse"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full ui-invert px-6 text-sm font-semibold transition hover:opacity-85"
            >
              Browse components <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="flex h-11 min-w-0 items-center gap-2 rounded-full border ui-line ui-surface pl-4 pr-1.5 font-mono text-xs ui-muted">
              <span className="ui-faint" aria-hidden>
                $
              </span>
              <span className="truncate">{sample}</span>
              <CopyButton text={sample} iconOnly label="Copy install command" className="rounded-full border-0" />
            </div>
          </div>

          </div>

          {/* visual: the layers between an AI first draft and a crafted component — live, hover to pull one out */}
          <div className="relative hidden lg:block">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] ui-faint">What goes into one component</p>
            <ExplodedStack
              defaultExploded
              legend={false}
              layers={[
                {
                  label: "AI first draft",
                  description: "Looks right, feels flat",
                  color: "#525252",
                  glyph: (
                    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="14" y="16" width="72" height="14" strokeDasharray="4 3" />
                      <rect x="14" y="38" width="32" height="46" strokeDasharray="4 3" />
                      <rect x="54" y="38" width="32" height="20" strokeDasharray="4 3" />
                      <rect x="54" y="64" width="32" height="20" strokeDasharray="4 3" />
                      <path d="M14 8 H86 M14 5 V11 M86 5 V11 M6 16 V84 M3 16 H9 M3 84 H9" strokeWidth="1.2" />
                      <path d="M30 56 L40 66 M40 56 L30 66" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  label: "Physics",
                  description: "Springs, drag, inertia",
                  color: "#a3a3a3",
                  glyph: (
                    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeLinecap="round">
                      <path d="M10 50 H92 M10 14 V86" strokeWidth="1.4" />
                      <path d="M10 32 H92 M10 68 H92 M32 14 V86 M54 14 V86 M76 14 V86" strokeWidth=".6" strokeDasharray="1.5 3" />
                      <path
                        d="M10 50 C14 14 20 14 24 50 S32 78 36 50 S44 30 48 50 S56 64 60 50 S68 42 72 50 S80 56 84 50 L92 50"
                        strokeWidth="2.6"
                      />
                      <circle cx="24" cy="22" r="2.4" fill="currentColor" stroke="none" />
                      <path d="M86 18 h6 M86 24 h4" strokeWidth="1.4" />
                    </svg>
                  ),
                },
                {
                  label: "3D & light",
                  description: "Depth, foil, shadows",
                  color: "#d4d4d4",
                  glyph: (
                    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M50 20 L78 36 L78 68 L50 84 L22 68 L22 36Z" />
                      <path d="M22 36 L50 52 L78 36 M50 52 V84" />
                      <path d="M50 20 L50 52 M22 68 L50 52 M78 68 L50 52" strokeDasharray="2 3" strokeWidth="1.2" />
                      <path d="M50 52 L92 76 M50 52 L8 76 M50 52 V6" strokeWidth=".9" strokeDasharray="1 3" />
                      {[[50, 20], [78, 36], [78, 68], [50, 84], [22, 68], [22, 36], [50, 52]].map(([x, y]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" stroke="none" />
                      ))}
                    </svg>
                  ),
                },
                {
                  label: "Tactile detail",
                  description: "The part you feel",
                  color: "#ffffff",
                  glyph: (
                    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="32" y="32" width="36" height="36" rx="3" />
                      <rect x="40" y="40" width="20" height="20" fill="currentColor" fillOpacity=".25" />
                      {[38, 46, 54, 62].map((v) => (
                        <path key={v} d={`M${v} 32 V26 M${v} 68 V74 M32 ${v} H26 M68 ${v} H74`} strokeWidth="1.6" />
                      ))}
                      <path d="M38 26 V16 H18 M62 74 V86 H84 M26 46 H12 V30 M74 54 H88 V70" strokeWidth="1.3" />
                      {[[18, 16], [84, 86], [12, 30], [88, 70]].map(([x, y]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
                      ))}
                      <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
                      <circle cx="50" cy="50" r="13" strokeWidth="1" strokeOpacity=".7" />
                    </svg>
                  ),
                },
              ]}
            />
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] ui-faint">hover a layer to pull it out</p>
          </div>
        </div>
      </section>
      </div>

      {/* three ways */}
      <section aria-label="Three ways to use a component" className="grid border-x border-b ui-line sm:grid-cols-3">
        {[
          {
            icon: Terminal,
            t: "Install",
            d: "One shadcn command drops the file into components/pickui. No packages to add.",
          },
          {
            icon: ClipboardCopy,
            t: "Copy",
            d: "Every component is one self-contained .tsx file. Paste it and it works.",
          },
          {
            icon: Bot,
            t: "Prompt",
            d: "A prompt for Cursor, Claude or v0 with the exact source, so the AI can't ‘simplify’ the details away.",
          },
        ].map(({ icon: Icon, t, d }, i) => (
          <div key={t} className={`p-6 sm:p-8 ${i ? "border-t ui-line sm:border-l sm:border-t-0" : ""}`}>
            <Icon className="h-5 w-5 ui-muted" aria-hidden />
            <h2 className="mt-4 text-sm font-semibold ui-ink">{t}</h2>
            <p className="mt-1.5 text-sm leading-relaxed ui-muted">{d}</p>
          </div>
        ))}
      </section>

      {/* catalogue */}
      <section id="browse" className="scroll-mt-20 pt-16">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] ui-accent">The collection</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight ui-ink sm:text-4xl">Touch everything.</h2>
          </div>
          <p className="max-w-sm text-sm ui-muted">
            Every preview is the real component, live. Hover, drag, pull, scratch and tear them here before you take one.
          </p>
        </div>
        <Suspense fallback={<Catalog items={items} categories={categories} />}>
          <CatalogFromUrl items={items} categories={categories} />
        </Suspense>
      </section>

      {/* contribute */}
      <section className="relative mt-24 border ui-line px-6 py-14 text-center sm:px-12">
        <Crosshairs />
        <h2 className="text-2xl font-black tracking-tight ui-ink sm:text-4xl">Open source. Built in public.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm ui-muted">
          PickUI is MIT-licensed. Found a bug, want a new component, or have an idea for a signature interaction?
          Open an issue or a pull request.
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full ui-invert px-6 text-sm font-semibold transition hover:opacity-85"
        >
          Contribute on GitHub <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </section>
    </div>
  );
}
