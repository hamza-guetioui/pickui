"use client";

import * as React from "react";

/**
 * CommandPalette — a ⌘K / Ctrl+K launcher. Fuzzy matching with highlighted
 * letters, grouped results, full keyboard control, a spring-in modal and a
 * live result count. Bring your own items and handle `onSelect`.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  keywords?: string[];
  icon?: React.ReactNode;
};

export type CommandPaletteProps = {
  items: CommandItem[];
  onSelect: (item: CommandItem) => void;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Letter used with ⌘/Ctrl to toggle (default "k"). `null` disables the hotkey. */
  hotkey?: string | null;
  placeholder?: string;
  /** false = no spring/zoom animation. Default true. */
  animated?: boolean;
  /** Render the default trigger button (default true when uncontrolled). */
  trigger?: boolean;
};

const css = `
@keyframes gx-cp-in{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}
@keyframes gx-cp-fade{from{opacity:0}}
.gx-cp[data-animated="true"] .gx-cp-panel{animation:gx-cp-in .22s cubic-bezier(.2,1.2,.4,1)}
.gx-cp[data-animated="true"] .gx-cp-back{animation:gx-cp-fade .2s}
@media (prefers-reduced-motion:reduce){.gx-cp *{animation:none!important}}
`;

/** Subsequence fuzzy score: consecutive + word-start matches rank higher. */
function score(q: string, text: string): { s: number; hits: number[] } | null {
  if (!q) return { s: 0, hits: [] };
  const t = text.toLowerCase();
  const hits: number[] = [];
  let s = 0;
  let from = 0;
  for (const ch of q.toLowerCase()) {
    const i = t.indexOf(ch, from);
    if (i < 0) return null;
    s += i === from ? 3 : 1;
    if (i === 0 || /[\s\-_/]/.test(t[i - 1])) s += 2;
    hits.push(i);
    from = i + 1;
  }
  // reject scattered matches ("gear" shouldn't match "toGgle light / dARk")
  if (hits.length > 1 && hits[hits.length - 1] - hits[0] + 1 > q.length * 2 + 2) return null;
  return { s: s - t.length * 0.01, hits };
}

export function CommandPalette({
  items,
  onSelect,
  open,
  onOpenChange,
  hotkey = "k",
  placeholder = "Search…",
  animated = true,
  trigger,
}: CommandPaletteProps) {
  const [inner, setInner] = React.useState(false);
  const isOpen = open ?? inner;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (open === undefined) setInner(v);
      onOpenChange?.(v);
    },
    [open, onOpenChange],
  );
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const input = React.useRef<HTMLInputElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const restore = React.useRef<HTMLElement | null>(null);
  const uid = React.useId();

  React.useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey, isOpen, setOpen]);

  React.useEffect(() => {
    if (isOpen) {
      restore.current = document.activeElement as HTMLElement | null;
      setQ("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    } else restore.current?.focus?.();
  }, [isOpen]);

  const results = React.useMemo(() => {
    return items
      .map((it) => {
        const main = score(q, it.label);
        const hay = [it.group, it.hint, ...(it.keywords ?? [])].join(" ").toLowerCase();
        const extra = !main && q && hay.includes(q.toLowerCase()) ? { s: -5, hits: [] as number[] } : null;
        const m = main ?? extra;
        return m ? { it, ...m } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => (q ? b.s - a.s : 0));
  }, [items, q]);

  const groups = React.useMemo(() => {
    const m = new Map<string, typeof results>();
    results.forEach((r) => {
      const g = q ? "Results" : r.it.group ?? "Items";
      m.set(g, [...(m.get(g) ?? []), r]);
    });
    return [...m.entries()];
  }, [results, q]);
  const flat = groups.flatMap(([, r]) => r);

  React.useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (it?: CommandItem) => {
    if (!it) return;
    setOpen(false);
    onSelect(it);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(flat[active]?.it);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const showTrigger = trigger ?? open === undefined;
  let idx = -1;

  return (
    <div className="gx-cp" data-animated={animated}>
      <style>{css}</style>
      {showTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-72 max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left text-sm text-white/50 transition hover:border-white/25 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="flex-1">{placeholder}</span>
          <kbd className="rounded border border-white/15 px-1.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
          <div className="gx-cp-back absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="gx-cp-panel relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111113] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder={placeholder}
                role="combobox"
                aria-expanded="true"
                aria-controls={`${uid}-list`}
                aria-activedescendant={flat[active] ? `${uid}-${active}` : undefined}
                aria-autocomplete="list"
                className="h-14 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
              />
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/40">esc</kbd>
            </div>

            <div ref={list} id={`${uid}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto p-2 [scrollbar-width:thin]">
              {flat.length === 0 && <p className="px-3 py-10 text-center text-sm text-white/40">No results for “{q}”.</p>}
              {groups.map(([g, rs]) => (
                <div key={g} role="presentation">
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{g}</p>
                  {rs.map((r) => {
                    idx++;
                    const i = idx;
                    const on = i === active;
                    return (
                      <div
                        key={r.it.id}
                        id={`${uid}-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={on}
                        onMouseMove={() => setActive(i)}
                        onClick={() => choose(r.it)}
                        className={`relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${on ? "bg-white/[0.08]" : ""}`}
                      >
                        {on && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-emerald-400" />}
                        {r.it.icon && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/70">{r.it.icon}</span>}
                        <span className="min-w-0 flex-1 truncate">
                          {[...r.it.label].map((ch, k) =>
                            r.hits.includes(k) ? (
                              <mark key={k} className="bg-transparent font-semibold text-emerald-300">
                                {ch}
                              </mark>
                            ) : (
                              <React.Fragment key={k}>{ch}</React.Fragment>
                            ),
                          )}
                        </span>
                        {r.it.hint && <span className="shrink-0 truncate text-xs text-white/40">{r.it.hint}</span>}
                        {on && <span className="shrink-0 font-mono text-[10px] text-white/40">↵</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 font-mono text-[10px] text-white/40">
              <span aria-live="polite">{flat.length} results</span>
              <span className="flex gap-3">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>esc close</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommandPalette;
