"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMOS } from "./demos";

type Props = {
  slug: string;
  /** Design height of the demo (px). */
  height: number;
  /** Demo fills the stage (full-bleed scenes). */
  fill?: boolean;
  /** "doc" = real size; "card" = scaled thumbnail that stays interactive. */
  mode?: "doc" | "card";
  /** Variant id passed to the demo (e.g. "regular", "neon"). */
  variant?: string;
  /** Hide the doc toolbar (when the parent renders its own). */
  bare?: boolean;
  /** Full pages: scroll inside the stage instead of clipping (doc mode). */
  scroll?: boolean;
  className?: string;
};

const DESIGN_W = 640;

/**
 * Live preview of a component demo. Mounts only when near the viewport
 * (cards also unmount when scrolled away), supports Replay, and in card mode
 * scales the real demo down so thumbnails are the actual component.
 */
export default function PreviewStage({ slug, height, fill, mode = "doc", variant, bare, scroll, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [run, setRun] = useState(0);
  const [scale, setScale] = useState(1);
  const Demo = DEMOS[slug];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
        else if (mode === "card") setVisible(false);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    if (mode !== "card") return () => io.disconnect();
    const ro = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      setScale(Math.min(1, width / DESIGN_W, h / height));
    });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, [mode, height]);


  const stage = (
    <div ref={ref} className={cn("ui-stage relative isolate w-full overflow-hidden", className)} style={mode === "doc" ? { height } : undefined}>
      {visible && Demo && (
        <div
          key={`${variant ?? "default"}-${run}`}
          className={cn(
            "absolute",
            mode === "card" ? "left-1/2 top-1/2" : "inset-0",
            fill ? "flex" : "flex items-center justify-center p-6",
            scroll && mode === "doc" && "ui-scroll block overflow-y-auto",
          )}
          style={
            mode === "card"
              ? { width: DESIGN_W, height, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }
              : undefined
          }
        >
          <div className={cn(scroll && mode === "doc" ? "w-full" : fill ? "relative flex h-full w-full [&>*]:h-full [&>*]:w-full" : "flex w-full justify-center")}>
            <Demo variant={variant} />
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "card" || bare) return stage;

  return (
    <div>
      <div className="ui-line ui-soft flex items-center justify-between border-b px-3 py-2">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] ui-faint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" aria-hidden /> Live preview · interact with it
        </span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="ui-line ui-muted inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition hover:text-[rgb(var(--ui-ink))]"
        >
          <RotateCcw className="h-3 w-3" aria-hidden /> Replay
        </button>
      </div>
      {stage}
    </div>
  );
}
