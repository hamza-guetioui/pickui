"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Blocks, Gamepad2, LayoutTemplate, Menu, Moon, Package, Search, Shapes, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTHOR, REPO_URL, SITE_NAME } from "@/lib/site";
import CommandPalette, { type CommandItem } from "../library/command-palette";
import { Logo } from "./Logo";

export type ChromeEntry = { slug: string; name: string; category: string; kind: string; tagline: string };

const THEME_KEY = "pickui-theme";
/** Runs while the HTML is parsed: applies the saved theme before paint (no flash). */
const THEME_BOOT = `try{if(localStorage.getItem("${THEME_KEY}")==="light")document.currentScript.parentElement.dataset.theme="light"}catch(e){}`;

const NAV = [
  { href: "/components?kind=component#browse", kind: "component", label: "Components", icon: Shapes },
  { href: "/components?kind=block#browse", kind: "block", label: "Blocks", icon: Blocks },
  { href: "/components?kind=template#browse", kind: "template", label: "Templates", icon: LayoutTemplate },
  { href: "/components?kind=package#browse", kind: "package", label: "Packages", icon: Package },
  { href: "/components?kind=game#browse", kind: "game", label: "Games", icon: Gamepad2 },
];

/**
 * PickUI site chrome: sticky header with ⌘K
 * search (our CommandPalette), dark/light theme, mobile menu, and own footer.
 */
export default function UIChrome({ entries, children }: { entries: ChromeEntry[]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/components";
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {}
    if (saved === "light" || rootRef.current?.dataset.theme === "light") setTheme("light");
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (rootRef.current) rootRef.current.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  const items = useMemo<CommandItem[]>(
    () => [
      ...entries.map((e) => ({
        id: e.slug,
        label: e.name,
        group: { block: "Blocks", template: "Templates", package: "Packages", game: "Games" }[e.kind] ?? "Components",
        hint: e.category,
        keywords: [e.tagline, e.category],
      })),
      { id: "nav:theme", label: "Toggle light / dark theme", group: "Actions" },
      { id: "nav:home", label: `${SITE_NAME} home`, group: "Actions" },
      { id: "nav:github", label: "Source code on GitHub", group: "Actions" },
    ],
    [entries],
  );

  const onSelect = (it: CommandItem) => {
    if (it.id === "nav:theme") return toggleTheme();
    if (it.id === "nav:home") return router.push("/components");
    if (it.id === "nav:github") return void window.open(REPO_URL, "_blank", "noopener,noreferrer");
    router.push(`/components/${it.id}`);
  };

  const counts = (k: string) => entries.filter((e) => e.kind === k).length;
  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} data-ui-app="" data-theme={theme} className="min-h-screen" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl transition-colors",
          scrolled ? "ui-line bg-[rgb(var(--ui-bg)/0.78)]" : "border-transparent bg-[rgb(var(--ui-bg)/0.4)]",
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/components" className="group flex items-center transition-transform hover:-rotate-3" aria-label="PickUI home">
            <Logo />
          </Link>

          <nav aria-label="Library" className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.kind} href={n.href} className="ui-muted ui-hover rounded-md px-3 py-1.5 text-sm transition hover:text-[rgb(var(--ui-ink))]">
                {n.label}
                <span className="ui-faint ml-1.5 font-mono text-[10px]">{counts(n.kind)}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="ui-line ui-soft ui-muted hidden h-9 w-56 items-center gap-2 rounded-lg border px-3 text-sm transition hover:text-[rgb(var(--ui-ink))] sm:flex"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="flex-1 text-left">Search {entries.length} items…</span>
              <kbd className="ui-line rounded border px-1.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="ui-line ui-muted grid h-9 w-9 place-items-center rounded-lg border sm:hidden"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className="ui-line ui-muted ui-hover relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border transition hover:text-[rgb(var(--ui-ink))]"
            >
              <Sun className={cn("absolute h-4 w-4 transition-all duration-300", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} aria-hidden />
              <Moon className={cn("absolute h-4 w-4 transition-all duration-300", theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0")} aria-hidden />
            </button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-invert hidden h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition hover:opacity-85 lg:inline-flex"
            >
              GitHub <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="ui-mobile-menu"
              aria-label="Menu"
              className="ui-line ui-muted grid h-9 w-9 place-items-center rounded-lg border md:hidden"
            >
              {menu ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        {menu && (
          <nav id="ui-mobile-menu" aria-label="Library" className="ui-line border-t px-4 py-3 md:hidden">
            {NAV.map(({ kind, href, label, icon: Icon }) => (
              <Link key={kind} href={href} className="ui-ink ui-hover flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                <Icon className="ui-faint h-4 w-4" aria-hidden /> {label}
                <span className="ui-faint ml-auto font-mono text-xs">{counts(kind)}</span>
              </Link>
            ))}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="ui-muted ui-hover mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
              <ArrowUpRight className="h-4 w-4" aria-hidden /> Source on GitHub
            </a>
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>

      <footer className="ui-line mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/components" className="inline-flex" aria-label="PickUI home">
              <Logo size="lg" />
            </Link>
            <p className="ui-muted mt-4 max-w-xs text-sm leading-relaxed">
              Hand-crafted React + Tailwind components, blocks and templates. Zero dependencies. Install, copy, or prompt.
            </p>
            <p className="ui-faint mt-4 font-mono text-[11px]">⌘K anywhere to search</p>
          </div>
          <FooterCol
            title="Library"
            links={[
              ...NAV.map((n) => ({ href: n.href, label: `${n.label} (${counts(n.kind)})` })),
              { href: "/components#browse", label: "Everything" },
            ]}
          />
          <FooterCol
            title="Popular"
            links={["holo-card", "folder-peek", "pull-cord", "command-palette"]
              .map((s) => entries.find((e) => e.slug === s))
              .filter((e): e is ChromeEntry => Boolean(e))
              .map((e) => ({ href: `/components/${e.slug}`, label: e.name }))}
          />
          <FooterCol
            title="Project"
            links={[
              { href: REPO_URL, label: "GitHub" },
              { href: `${REPO_URL}/blob/main/CONTRIBUTING.md`, label: "Contributing" },
              { href: `${REPO_URL}/blob/main/LICENSE`, label: "MIT License" },
              { href: AUTHOR.url, label: `Made by ${AUTHOR.name}` },
            ]}
          />
        </div>
        <div className="ui-line border-t">
          <div className="ui-faint mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span suppressHydrationWarning>© {year} {AUTHOR.name} · {SITE_NAME} · MIT</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--ui-accent))]" aria-hidden /> All components render live on this site
            </span>
          </div>
        </div>
      </footer>

      <CommandPalette items={items} onSelect={onSelect} open={search} onOpenChange={setSearch} placeholder="Search components, blocks, templates…" />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="ui-faint font-mono text-[10px] uppercase tracking-[0.2em]">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            {/^https?:/.test(l.href) ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="ui-muted text-sm transition hover:text-[rgb(var(--ui-ink))]">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="ui-muted text-sm transition hover:text-[rgb(var(--ui-ink))]">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
