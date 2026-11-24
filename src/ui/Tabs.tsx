"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

/** Accessible tabs (arrow keys move between tabs), Vercel-style underline. */
export default function Tabs({ items, className, right }: { items: TabItem[]; className?: string; right?: ReactNode }) {
  const [active, setActive] = useState(items[0]?.id);
  const base = useId();
  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = items[(i + d + items.length) % items.length];
    setActive(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 border-b ui-line">
        <div role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
          {items.map((t, i) => (
            <button
              key={t.id}
              id={tabId(t.id)}
              role="tab"
              type="button"
              aria-selected={active === t.id}
              aria-controls={panelId(t.id)}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
                active === t.id ? "border-[rgb(var(--ui-ink))] ui-ink" : "border-transparent ui-muted hover:text-[rgb(var(--ui-ink))]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {right}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          id={panelId(t.id)}
          role="tabpanel"
          aria-labelledby={tabId(t.id)}
          hidden={active !== t.id}
          className="pt-4"
        >
          {active === t.id && t.content}
        </div>
      ))}
    </div>
  );
}
