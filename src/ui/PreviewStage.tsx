"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDemo, preloadDemo, resetDemo } from "./demos";

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

/*
 * Mount scheduler: when many cards enter the viewport together (fast scroll,
 * filter change) we start them one by one, a frame apart, instead of booting
 * dozens of animations in the same frame.
 */
type Job = { run: () => void; el: HTMLElement };
const queue: Job[] = [];
let pumping = false;
const onScreen = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
};
function scheduleMount(job: Job) {
  queue.push(job);
  if (pumping) return;
  pumping = true;
  const pump = () => {
    if (!queue.length) {
      pumping = false;
      return;
    }
    // what the user is looking at first, then the rest in order
    const i = Math.max(0, queue.findIndex((j) => onScreen(j.el)));
    queue.splice(i, 1)[0].run();
    window.setTimeout(() => requestAnimationFrame(pump), 16);
  };
  requestAnimationFrame(pump);
}
function cancelMount(job: Job) {
  const i = queue.indexOf(job);
  if (i >= 0) queue.splice(i, 1);
}

/** Placeholder while a demo's chunk downloads / waits for its turn. */
function Skeleton() {
  return (
    <div aria-hidden className="ui-stage-skeleton absolute inset-0 grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--ui-ink)/0.1)] border-t-[rgb(var(--ui-accent))]" />
    </div>
  );
}

/** Keeps one broken demo from taking the whole page down. */
class PreviewBoundary extends Component<{ slug: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(`[pickui] preview "${this.props.slug}" failed`, error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="absolute inset-0 grid place-items-center p-6 text-center">
        <div className="flex flex-col items-center gap-2 text-xs ui-muted">
          <TriangleAlert className="h-5 w-5 ui-faint" aria-hidden />
          Preview couldn&apos;t load.
          <button
            type="button"
            onClick={() => {
              resetDemo(this.props.slug);
              this.setState({ failed: false });
            }}
            className="relative z-20 rounded-full border ui-line px-3 py-1 hover:text-[rgb(var(--ui-ink))]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Live preview of a component demo. Mounts only when near the viewport
 * (cards also unmount when scrolled away), supports Replay, and in card mode
 * scales the real demo down so thumbnails are the actual component.
 */
export default function PreviewStage({ slug, height, fill, mode = "doc", variant, bare, scroll, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [run, setRun] = useState(0);
  const [scale, setScale] = useState<number | null>(mode === "card" ? null : 1);
  const Demo = getDemo(slug);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let mount: Job | null = null;
    const show = () => {
      if (mount) return;
      mount = { run: () => setVisible(true), el };
      scheduleMount(mount);
    };
    const hide = () => {
      if (mount) cancelMount(mount);
      mount = null;
      setVisible(false);
    };
    // download early, mount when close, unmount (cards) only when far away —
    // scrolling back a little doesn't restart every animation.
    const pre = new IntersectionObserver(([e]) => e.isIntersecting && preloadDemo(slug), { rootMargin: "1200px 0px" });
    const near = new IntersectionObserver(([e]) => e.isIntersecting && show(), { rootMargin: "200px 0px" });
    pre.observe(el);
    const far = new IntersectionObserver(([e]) => !e.isIntersecting && mode === "card" && hide(), { rootMargin: "1400px 0px" });
    near.observe(el);
    far.observe(el);
    const ro =
      mode === "card"
        ? new ResizeObserver(([entry]) => {
            const { width, height: h } = entry.contentRect;
            if (width > 0) setScale(Math.min(1, width / DESIGN_W, h / height));
          })
        : null;
    ro?.observe(el);
    return () => {
      if (mount) cancelMount(mount);
      pre.disconnect();
      near.disconnect();
      far.disconnect();
      ro?.disconnect();
    };
  }, [mode, height, slug]);

  const ready = visible && Demo && scale !== null;


  const stage = (
    <div ref={ref} className={cn("ui-stage relative isolate w-full overflow-hidden", className)} style={mode === "doc" ? { height } : undefined}>
      {!ready && <Skeleton />}
      {ready && (
        <div
          key={`${variant ?? "default"}-${run}`}
          className={cn(
            "ui-stage-in absolute",
            mode === "card" ? "left-1/2 top-1/2" : "inset-0",
            fill ? "flex" : "flex items-center justify-center p-6",
            scroll && mode === "doc" && "ui-scroll block overflow-y-auto",
          )}
          style={
            mode === "card"
              ? { width: DESIGN_W, height, transform: `translate(-50%, -50%) scale(${scale ?? 1})`, transformOrigin: "center" }
              : undefined
          }
        >
          <div className={cn(scroll && mode === "doc" ? "w-full" : fill ? "relative flex h-full w-full [&>*]:h-full [&>*]:w-full" : "flex w-full justify-center")}>
            <PreviewBoundary slug={slug}>
              <Suspense fallback={<Skeleton />}>
                <Demo variant={variant} />
              </Suspense>
            </PreviewBoundary>
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
