"use client";

import * as React from "react";

/**
 * ToastStack — notifications that stack like a deck (each one smaller and
 * further back), fan out on hover so you can read them all, and can be
 * flicked away sideways. Timers pause while you hover.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type Toast = { id: number; title: string; body?: string; tone?: "success" | "error" | "info" };

export type ToastStackProps = {
  /** Show the built-in demo buttons (default true). */
  demoControls?: boolean;
  /** Auto-dismiss after ms (default 6000; 0 = never). */
  duration?: number;
  /** false = no fan / swipe physics (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const TONE = { success: "#4ade80", error: "#f87171", info: "#60a5fa" } as const;
const SAMPLES: Omit<Toast, "id">[] = [
  { title: "Deployed to production", body: "acme.dev is live · 42s", tone: "success" },
  { title: "Payment failed", body: "Card ending 4242 was declined.", tone: "error" },
  { title: "New comment", body: "Sara: “love the folder animation”", tone: "info" },
  { title: "Backup complete", body: "1.2 GB · encrypted", tone: "success" },
];

export function ToastStack({ demoControls = true, duration = 6000, animated = true, className = "" }: ToastStackProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [hover, setHover] = React.useState(false);
  const n = React.useRef(0);
  const drag = React.useRef<{ id: number; x0: number; dx: number } | null>(null);
  const [dx, setDx] = React.useState<Record<number, number>>({});

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = ++n.current;
    setToasts((p) => [...p, { ...t, id }].slice(-5));
  }, []);
  const remove = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));

  React.useEffect(() => {
    push(SAMPLES[0]);
    const t = window.setTimeout(() => push(SAMPLES[2]), 500);
    return () => window.clearTimeout(t);
  }, [push]);

  React.useEffect(() => {
    if (!duration || hover || !toasts.length) return;
    const t = window.setTimeout(() => remove(toasts[0].id), duration);
    return () => window.clearTimeout(t);
  }, [toasts, hover, duration]);

  const list = [...toasts].reverse(); // newest first
  const fan = hover || !animated;

  return (
    <div className={`relative flex h-full min-h-[300px] w-full flex-col items-center justify-end p-6 ${className}`}>
      {demoControls && (
        <div className="mb-auto flex flex-wrap justify-center gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => push(s)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
            >
              + {s.tone}
            </button>
          ))}
        </div>
      )}
      <ol
        aria-live="polite"
        aria-label="Notifications"
        className="relative w-full max-w-sm"
        style={{ height: fan ? list.length * 76 : 92, transition: "height .4s cubic-bezier(.2,.9,.3,1)" }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {list.map((t, i) => {
          const off = dx[t.id] ?? 0;
          const y = fan ? -i * 76 : -i * 12;
          const s = fan ? 1 : 1 - i * 0.05;
          return (
            <li
              key={t.id}
              className="absolute bottom-0 left-0 right-0 touch-pan-y"
              style={{
                transform: `translate(${off}px, ${y}px) scale(${s})`,
                opacity: i > 2 && !fan ? 0 : 1 - Math.min(1, Math.abs(off) / 220),
                zIndex: 50 - i,
                transition: drag.current?.id === t.id ? "none" : "transform .45s cubic-bezier(.2,.9,.3,1.1), opacity .3s",
                transformOrigin: "bottom center",
              }}
              onPointerDown={(e) => {
                if (!animated) return;
                drag.current = { id: t.id, x0: e.clientX, dx: 0 };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (drag.current?.id !== t.id) return;
                const d = e.clientX - drag.current.x0;
                drag.current.dx = d;
                setDx((p) => ({ ...p, [t.id]: d }));
              }}
              onPointerUp={() => {
                const d = drag.current;
                drag.current = null;
                if (d && Math.abs(d.dx) > 110) remove(t.id);
                else setDx((p) => ({ ...p, [t.id]: 0 }));
              }}
            >
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#141416]/95 p-3.5 shadow-[0_12px_30px_-10px_rgba(0,0,0,.8)] backdrop-blur">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE[t.tone ?? "info"], boxShadow: `0 0 8px ${TONE[t.tone ?? "info"]}` }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{t.title}</p>
                  {t.body && <p className="truncate text-xs text-white/55">{t.body}</p>}
                </div>
                <button type="button" onClick={() => remove(t.id)} aria-label="Dismiss" className="text-white/35 hover:text-white">
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {list.length > 1 && !fan && <p className="mt-3 font-mono text-[10px] text-white/30">hover to expand · swipe to dismiss</p>}
    </div>
  );
}

export default ToastStack;
