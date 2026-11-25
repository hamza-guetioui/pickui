"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Blocks, Gamepad2, Github, LayoutTemplate, Loader2, Menu, Moon, Puzzle, Search, Shapes, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTHOR, REPO_URL, SITE_NAME } from "@/lib/site";
import CommandPalette, { type CommandItem } from "../library/command-palette";
import { Logo } from "./Logo";

export type ChromeEntry = { slug: string; name: string; category: string; kind: string; tagline: string };

const THEME_KEY = "pickui-theme";
/** Runs while the HTML is parsed: applies the saved theme before paint (no flash). */
const THEME_BOOT = `try{if(localStorage.getItem("${THEME_KEY}")==="light")document.currentScript.parentElement.dataset.theme="light"}catch(e){}`;

const NAV = [
  { href: "/?kind=component#browse", kind: "component", label: "Components", icon: Shapes },
  { href: "/?kind=block#browse", kind: "block", label: "Blocks", icon: Blocks },
  { href: "/?kind=template#browse", kind: "template", label: "Templates", icon: LayoutTemplate },
  { href: "/?kind=extension#browse", kind: "extension", label: "Extensions", icon: Puzzle },
  { href: "/?kind=game#browse", kind: "game", label: "Games", icon: Gamepad2 },
];
const KIND_ICON = Object.fromEntries(NAV.map((n) => [n.kind, n.icon]));
const SUGGESTIONS = ["Button", "Card", "Text", "Pricing", "3D", "Games", "Retro"];

/**
 * PickUI site chrome: sticky header with ⌘K
 * search (our CommandPalette), dark/light theme, mobile menu, and own footer.
 */
export default function UIChrome({ entries, children }: { entries: ChromeEntry[]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Show feedback as soon as an internal link to another page is clicked (capture phase: before Link's preventDefault).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname) setNavigating(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  useEffect(() => setNavigating(false), [pathname]);
  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setNavigating(false), 15000); // never stick if a navigation is cancelled
    return () => clearTimeout(t);
  }, [navigating]);

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
        group: { block: "Blocks", template: "Templates", extension: "Extensions", game: "Games" }[e.kind] ?? "Components",
        hint: e.category,
        description: e.tagline,
        keywords: [e.tagline, e.category, e.kind],
        icon: (() => {
          const Icon = KIND_ICON[e.kind] ?? Shapes;
          return <Icon className="h-3.5 w-3.5" aria-hidden />;
        })(),
      })),
      { id: "nav:theme", label: "Toggle light / dark theme", group: "Actions" },
      { id: "nav:home", label: `${SITE_NAME} home`, group: "Actions" },
      { id: "nav:github", label: "Source code on GitHub", group: "Actions" },
    ],
    [entries],
  );

  const onSelect = (it: CommandItem) => {
    if (it.id === "nav:theme") return toggleTheme();
    if (it.id === "nav:github") return void window.open(REPO_URL, "_blank", "noopener,noreferrer");
    const href = it.id === "nav:home" ? "/" : `/components/${it.id}`;
    if (href !== pathname) setNavigating(true);
    router.push(href);
  };

  const counts = (k: string) => entries.filter((e) => e.kind === k).length;
  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} data-ui-app="" data-theme={theme} className="min-h-screen" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

      {navigating && (
        <>
          <div className="ui-nav-bar fixed inset-x-0 top-0 z-[60] h-0.5" aria-hidden />
          <div role="status" className="ui-nav-pill ui-line fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border bg-[rgb(var(--ui-bg)/0.9)] px-3.5 py-1.5 text-xs font-medium shadow-lg backdrop-blur-xl ui-ink">
            <Loader2 className="ui-accent h-3.5 w-3.5 animate-spin" aria-hidden /> Preparing page…
          </div>
        </>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl transition-colors",
          scrolled ? "ui-line bg-[rgb(var(--ui-bg)/0.78)]" : "border-transparent bg-[rgb(var(--ui-bg)/0.4)]",
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex items-center" aria-label="PickUI home">
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
              aria-label="GitHub"
              title="Source on GitHub"
              className="ui-invert hidden h-9 w-9 place-items-center rounded-lg transition hover:-translate-y-px hover:shadow-[0_0_0_3px_rgb(var(--ui-accent)/0.35),0_8px_24px_-8px_rgb(var(--ui-accent)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-accent))] motion-reduce:hover:translate-y-0 sm:grid lg:hidden"
            >
              <Github className="h-[18px] w-[18px]" aria-hidden />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group ui-invert hidden h-9 items-center gap-2 rounded-lg pl-1.5 pr-3 text-sm font-semibold transition hover:-translate-y-px hover:shadow-[0_0_0_3px_rgb(var(--ui-accent)/0.35),0_8px_24px_-8px_rgb(var(--ui-accent)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-accent))] motion-reduce:hover:translate-y-0 lg:inline-flex"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[rgb(var(--ui-bg))] text-[rgb(var(--ui-ink))] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none">
                <Github className="h-3.5 w-3.5" aria-hidden />
              </span>
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transform-none" aria-hidden />
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
              <Github className="h-4 w-4" aria-hidden /> Source on GitHub
            </a>
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>

      <footer className="ui-line mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex" aria-label="PickUI home">
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
              { href: "/#browse", label: "Everything" },
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

      <CommandPalette items={items} onSelect={onSelect} open={search} onOpenChange={setSearch} placeholder="Search components, blocks, templates…" suggestions={SUGGESTIONS} recentKey="pickui-recent" />
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
