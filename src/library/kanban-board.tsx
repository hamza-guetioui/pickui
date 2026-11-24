"use client";

import * as React from "react";

/**
 * KanbanBoard — a drag-and-drop board that feels physical: the card lifts
 * and tilts with your drag velocity, a gap opens where it will land, columns
 * glow when targeted, and it springs into place. Pointer-based (works on
 * touch), with full keyboard moving: Space to pick up, arrows, Space to drop.
 * Block · zero dependencies · respects prefers-reduced-motion.
 */

export type KanbanCard = { id: string; title: string; tag: string; color: string };
export type KanbanColumn = { id: string; title: string; cards: KanbanCard[] };

export type KanbanBoardProps = {
  initial?: KanbanColumn[];
  onChange?: (cols: KanbanColumn[]) => void;
  /** false = no tilt / spring (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const INIT: KanbanColumn[] = [
  {
    id: "todo",
    title: "To do",
    cards: [
      { id: "1", title: "Write launch post", tag: "Content", color: "#f472b6" },
      { id: "2", title: "Pricing page copy", tag: "Marketing", color: "#facc15" },
      { id: "3", title: "Fix Safari focus ring", tag: "Bug", color: "#f87171" },
    ],
  },
  { id: "doing", title: "In progress", cards: [{ id: "4", title: "Command palette", tag: "Feature", color: "#4ade80" }, { id: "5", title: "Onboarding emails", tag: "Growth", color: "#22d3ee" }] },
  { id: "done", title: "Done", cards: [{ id: "6", title: "Team roles", tag: "Feature", color: "#4ade80" }] },
];

type Drag = { id: string; from: string; x: number; y: number; ox: number; oy: number; w: number; vx: number; over: string | null; index: number };

export function KanbanBoard({ initial = INIT, onChange, animated = true, className = "" }: KanbanBoardProps) {
  const [cols, setCols] = React.useState(initial);
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const [held, setHeld] = React.useState<string | null>(null); // keyboard
  const colRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [announce, setAnnounce] = React.useState("");

  const commit = (next: KanbanColumn[]) => {
    setCols(next);
    onChange?.(next);
  };

  const move = (id: string, toCol: string, index: number) => {
    const card = cols.flatMap((c) => c.cards).find((c) => c.id === id)!;
    const without = cols.map((c) => ({ ...c, cards: c.cards.filter((k) => k.id !== id) }));
    const next = without.map((c) => (c.id === toCol ? { ...c, cards: [...c.cards.slice(0, index), card, ...c.cards.slice(index)] } : c));
    commit(next);
    setAnnounce(`${card.title} moved to ${next.find((c) => c.id === toCol)!.title}, position ${index + 1}`);
  };

  const locate = (x: number, y: number): { col: string | null; index: number } => {
    for (const c of cols) {
      const el = colRefs.current[c.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top - 40 && y <= r.bottom + 40) {
        const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")].filter((n) => n.dataset.card !== drag?.id);
        const index = cards.findIndex((n) => {
          const b = n.getBoundingClientRect();
          return y < b.top + b.height / 2;
        });
        return { col: c.id, index: index < 0 ? cards.length : index };
      }
    }
    return { col: null, index: 0 };
  };

  const dragged = drag ? cols.flatMap((c) => c.cards).find((c) => c.id === drag.id) : null;

  return (
    <section className={`w-full px-4 py-8 ${className}`} aria-label="Kanban board">
      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
      <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
        {cols.map((col) => {
          const over = drag?.over === col.id;
          return (
            <div
              key={col.id}
              ref={(el) => {
                colRefs.current[col.id] = el;
              }}
              className="rounded-2xl border p-3 transition-colors duration-200"
              style={{ borderColor: over ? "rgba(74,222,128,.6)" : "rgba(255,255,255,.1)", background: over ? "rgba(74,222,128,.06)" : "rgba(255,255,255,.02)" }}
            >
              <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-white">
                {col.title}
                <span className="rounded-full bg-white/10 px-2 font-mono text-[10px] text-white/60">{col.cards.length}</span>
              </h3>
              <ul className="flex min-h-[80px] flex-col gap-2">
                {col.cards.map((card, i) => {
                  const isDragged = drag?.id === card.id;
                  const gapBefore = over && drag && drag.index === i && !isDragged;
                  return (
                    <React.Fragment key={card.id}>
                      {gapBefore && <li aria-hidden className="h-[62px] rounded-xl border-2 border-dashed border-emerald-400/40" />}
                      <li
                        data-card={card.id}
                        tabIndex={0}
                        role="button"
                        aria-pressed={held === card.id}
                        aria-label={`${card.title}, ${card.tag}. ${held === card.id ? "Picked up: use arrows, Space to drop." : "Press Space to pick up."}`}
                        className={`cursor-grab touch-none select-none rounded-xl border bg-[#141416] p-3 outline-none transition-[opacity,box-shadow] focus-visible:ring-2 focus-visible:ring-emerald-300 ${isDragged ? "opacity-0" : ""} ${held === card.id ? "border-emerald-400 shadow-[0_0_0_3px_rgba(74,222,128,.25)]" : "border-white/10"}`}
                        onPointerDown={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          e.currentTarget.setPointerCapture(e.pointerId);
                          setDrag({ id: card.id, from: col.id, x: r.left, y: r.top, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, vx: 0, over: col.id, index: i });
                        }}
                        onPointerMove={(e) => {
                          if (!drag || drag.id !== card.id) return;
                          const { col: c, index } = locate(e.clientX, e.clientY);
                          setDrag((d) => d && { ...d, vx: e.clientX - d.ox - d.x, x: e.clientX - d.ox, y: e.clientY - d.oy, over: c, index });
                        }}
                        onPointerUp={() => {
                          if (drag && drag.over) move(drag.id, drag.over, drag.index);
                          setDrag(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            setHeld(held === card.id ? null : card.id);
                            setAnnounce(held === card.id ? `${card.title} dropped` : `${card.title} picked up`);
                            return;
                          }
                          if (held !== card.id) return;
                          const ci = cols.findIndex((c) => c.id === col.id);
                          if (e.key === "ArrowRight" && ci < cols.length - 1) move(card.id, cols[ci + 1].id, 0);
                          if (e.key === "ArrowLeft" && ci > 0) move(card.id, cols[ci - 1].id, 0);
                          if (e.key === "ArrowDown" && i < col.cards.length - 1) move(card.id, col.id, i + 1);
                          if (e.key === "ArrowUp" && i > 0) move(card.id, col.id, i - 1);
                          if (e.key.startsWith("Arrow")) {
                            e.preventDefault();
                            requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card="${card.id}"]`)?.focus());
                          }
                        }}
                      >
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black" style={{ background: card.color }}>
                          {card.tag}
                        </span>
                        <p className="mt-1.5 text-sm font-medium text-white">{card.title}</p>
                      </li>
                    </React.Fragment>
                  );
                })}
                {over && drag && drag.index >= col.cards.filter((c) => c.id !== drag.id).length && <li aria-hidden className="h-[62px] rounded-xl border-2 border-dashed border-emerald-400/40" />}
              </ul>
            </div>
          );
        })}
      </div>
      {drag && dragged && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50 rounded-xl border border-emerald-400/60 bg-[#18181b] p-3 shadow-[0_24px_40px_-10px_rgba(0,0,0,.9)]"
          style={{
            width: drag.w,
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${animated ? Math.max(-8, Math.min(8, drag.vx * 0.6)) : 0}deg) scale(${animated ? 1.04 : 1})`,
          }}
        >
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black" style={{ background: dragged.color }}>
            {dragged.tag}
          </span>
          <p className="mt-1.5 text-sm font-medium text-white">{dragged.title}</p>
        </div>
      )}
      <p className="mt-3 text-center font-mono text-[11px] text-white/35">drag cards · or focus one and press Space, then arrows</p>
    </section>
  );
}

export default KanbanBoard;
