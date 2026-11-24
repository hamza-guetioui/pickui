"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Layers, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import PreviewStage from "./PreviewStage";

export type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  tags: string[];
  previewHeight: number;
  fill?: boolean;
  isNew?: boolean;
  kind: string;
  /** Number of switchable versions (0 = only the default). */
  versions?: number;
};

const KINDS = [
  { id: "all", label: "Everything" },
  { id: "component", label: "Components" },
  { id: "block", label: "Blocks" },
  { id: "template", label: "Templates" },
  { id: "package", label: "Packages" },
  { id: "game", label: "Games" },
];

/** Reads ?kind= from the URL (header links) — must sit inside <Suspense>. */
export function CatalogFromUrl(props: { items: CatalogItem[]; categories: string[] }) {
  const kind = useSearchParams()?.get("kind") ?? "all";
  return <Catalog key={kind} {...props} initialKind={kind} />;
}

/** Filterable grid of live component previews. Press "/" to search. */
export default function Catalog({
  items,
  categories,
  initialKind = "all",
}: {
  items: CatalogItem[];
  categories: string[];
  initialKind?: string;
}) {
  const [kind, setKind] = useState(KINDS.some((k) => k.id === initialKind) ? initialKind : "all");
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea/i.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (c) =>
        (kind === "all" || c.kind === kind) &&
        (cat === "All" || c.category === cat) &&
        (!needle || [c.name, c.tagline, c.category, ...c.tags].join(" ").toLowerCase().includes(needle)),
    );
  }, [items, cat, q, kind]);

  const inKind = useMemo(() => items.filter((c) => kind === "all" || c.kind === kind), [items, kind]);
  const counts = useMemo(() => {
    const m: Record<string, number> = { All: inKind.length };
    inKind.forEach((c) => (m[c.category] = (m[c.category] ?? 0) + 1));
    return m;
  }, [inKind]);
  const kindCount = (k: string) => (k === "all" ? items.length : items.filter((c) => c.kind === k).length);

  return (
    <div>
      {/* one clear toolbar: search · type · category, then a result line with reset */}
      <div className="sticky top-16 z-20 -mx-1 rounded-2xl border ui-line bg-[rgb(var(--ui-bg)/0.88)] p-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex flex-1 items-center">
            <span className="sr-only">Search components</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 ui-faint" aria-hidden />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: 3d, toggle, scroll, card…"
              className="h-10 w-full rounded-xl border ui-line ui-soft pl-9 pr-10 text-sm ui-ink placeholder:text-[rgb(var(--ui-ink)/0.4)] focus:border-[rgb(var(--ui-ink)/0.35)] focus:outline-none"
            />
            {q ? (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 rounded p-1 ui-faint hover:text-[rgb(var(--ui-ink))]">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 rounded border ui-line-strong px-1.5 font-mono text-[10px] ui-faint">/</kbd>
            )}
          </label>
          <div role="radiogroup" aria-label="Type" className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border ui-line ui-soft p-1">
            {KINDS.filter((k) => kindCount(k.id) > 0).map((k) => (
              <button
                key={k.id}
                type="button"
                role="radio"
                aria-checked={kind === k.id}
                onClick={() => {
                  setKind(k.id);
                  setCat("All");
                  const url = new URL(window.location.href);
                  if (k.id === "all") url.searchParams.delete("kind");
                  else url.searchParams.set("kind", k.id);
                  window.history.replaceState(null, "", url);
                }}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
                  kind === k.id ? "ui-invert" : "ui-muted hover:text-[rgb(var(--ui-ink))]",
                )}
              >
                {k.id === "all" ? "All" : k.label}
                <span className="ml-1 font-mono text-[10px] opacity-60">{kindCount(k.id)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
          {["All", ...categories.filter((c) => counts[c])].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
                cat === c ? "ui-invert border-transparent" : "ui-line ui-muted hover:border-[rgb(var(--ui-ink)/0.25)] hover:text-[rgb(var(--ui-ink))]",
              )}
            >
              {c}
              <span className={cn("ml-1 tabular-nums", cat === c ? "opacity-60" : "ui-faint")}>{counts[c] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-9 items-center justify-between px-1 pt-3 text-xs ui-muted">
        <span>
          Showing <strong className="ui-ink">{list.length}</strong> of {items.length}
          {cat !== "All" && <> in {cat}</>}
          {q && <> for “{q}”</>}
        </span>
        {(q || cat !== "All" || kind !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("All");
              setKind("all");
              const url = new URL(window.location.href);
              url.searchParams.delete("kind");
              window.history.replaceState(null, "", url);
            }}
            className="inline-flex items-center gap-1 rounded-full border ui-line px-2.5 py-1 hover:text-[rgb(var(--ui-ink))]"
          >
            <X className="h-3 w-3" aria-hidden /> Reset filters
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {list.length} components
      </p>

      {list.length === 0 ? (
        <p className="py-24 text-center text-sm ui-faint">Nothing matches these filters. Try “Reset filters”.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <li key={c.slug}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border ui-line ui-surface transition-colors hover:border-[rgb(var(--ui-ink)/0.25)]">
                <div className="relative">
                  <PreviewStage slug={c.slug} height={c.previewHeight} fill={c.fill} mode="card" className="h-[270px] border-b ui-line" />
                  <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" aria-hidden /> Live
                  </span>
                  {(c.versions ?? 0) > 1 && (
                    <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-200 backdrop-blur">
                      <Layers className="h-3 w-3" aria-hidden /> {c.versions} versions
                    </span>
                  )}
                  {c.isNew && (
                    <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full ui-invert px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                      New
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] ui-faint">{c.category}</p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight ui-ink">
                      <Link href={`/components/${c.slug}`} className="outline-none after:absolute after:inset-x-0 after:bottom-0 after:top-[270px] focus-visible:underline">
                        {c.name}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed ui-muted">{c.tagline}</p>
                  </div>
                  <ArrowUpRight
                    className="mt-5 h-4 w-4 shrink-0 ui-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--ui-ink))]"
                    aria-hidden
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
