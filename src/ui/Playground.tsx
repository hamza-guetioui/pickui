"use client";

import { useId, useState, type ReactNode } from "react";
import { Code2, Eye, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Variant } from "../catalog";
import CopyButton from "./CopyButton";
import PreviewStage from "./PreviewStage";

type View = "preview" | "code" | "prompt";

/**
 * Docs playground: [Preview | Code | Prompt] views + a version switch
 * (Animated / Regular, or art directions like Classic / Neon / Da Vinci).
 * The prompt follows the selected version.
 */
export default function Playground({
  slug,
  height,
  fill,
  scroll,
  variants,
  code,
  prompt = "",
}: {
  slug: string;
  height: number;
  fill?: boolean;
  scroll?: boolean;
  variants: Variant[];
  /** Server-highlighted code block. */
  code?: ReactNode;
  prompt?: string;
}) {
  const [view, setView] = useState<View>("preview");
  const [variant, setVariant] = useState(variants[0].id);
  const [run, setRun] = useState(0);
  const base = useId();
  const v = variants.find((x) => x.id === variant) ?? variants[0];
  const fullPrompt = `${prompt}\n\nI want the "${v.label}" version: use \`${v.prop}\` (${v.hint})`;

  const select = (id: View) => setView(id);

  const views: { id: View; label: string; icon: typeof Eye }[] = [
    { id: "preview", label: "Preview", icon: Eye },
    { id: "code", label: "Code", icon: Code2 },
    { id: "prompt", label: "Prompt", icon: Sparkles },
  ].filter((x) => x.id === "preview" || (x.id === "code" ? code : prompt)) as { id: View; label: string; icon: typeof Eye }[];

  return (
    <div className="overflow-hidden rounded-xl border ui-line ui-surface">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b ui-line ui-soft p-2">
        <div role="tablist" aria-label="View" className="flex rounded-lg border ui-line ui-soft p-0.5">
          {views.map(({ id, label, icon: Icon }, i) => (
            <button
              key={id}
              id={`${base}-${id}`}
              role="tab"
              type="button"
              aria-selected={view === id}
              aria-controls={`${base}-panel`}
              tabIndex={view === id ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={(e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const next = views[(i + d + views.length) % views.length].id;
                setView(next);
                document.getElementById(`${base}-${next}`)?.focus();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
                view === id ? "ui-invert shadow" : "ui-muted hover:text-[rgb(var(--ui-ink))]",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {variants.length > 1 && (
            <div role="radiogroup" aria-label="Version" className="flex rounded-lg border ui-line ui-soft p-0.5">
              {variants.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={variant === x.id}
                  title={x.hint}
                  onClick={() => setVariant(x.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
                    variant === x.id ? "bg-[rgb(var(--ui-ink)/0.1)] font-semibold ui-ink" : "ui-muted hover:text-[rgb(var(--ui-ink))]",
                  )}
                >
                  {x.label}
                </button>
              ))}
            </div>
          )}
          {view === "preview" && (
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              aria-label="Replay demo"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border ui-line px-2.5 text-xs ui-muted transition hover:border-[rgb(var(--ui-ink)/0.25)] hover:text-[rgb(var(--ui-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]"
            >
              <RotateCcw className="h-3 w-3" aria-hidden /> <span className="max-sm:sr-only">Replay</span>
            </button>
          )}
          {view === "prompt" && <CopyButton text={fullPrompt} label="Copy prompt" copiedLabel="Copied" className="h-8" />}
        </div>
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${view}`}>
        {view === "preview" && (
          <>
            <PreviewStage key={run} slug={slug} height={height} fill={fill} variant={variant} scroll={scroll} bare />
            <p className="border-t ui-line px-4 py-2.5 text-xs ui-muted">
              <span className="font-semibold ui-ink">{v.label}</span> · {v.hint}{" "}
              <code className="ml-1 rounded ui-soft px-1.5 py-0.5 font-mono text-[11px] text-[#52a8ff]">{v.prop}</code>
            </p>
          </>
        )}
        {view === "code" && <div className="p-3 [&>div]:border-0">{code}</div>}
        {view === "prompt" && (
          <div className="p-4">
            <p className="mb-3 text-sm ui-muted">
              Paste into Cursor, Claude, Copilot or v0. It includes the exact source, the props, and your selected
              version (<span className="ui-ink">{v.label}</span>), and tells the AI not to “simplify” the parts
              that make the effect work.
            </p>
            <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap rounded-lg border ui-line ui-surface p-4 font-mono text-[12px] leading-relaxed ui-muted">
              {fullPrompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
