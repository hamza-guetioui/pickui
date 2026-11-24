"use client";

import React, { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import CopyButton from "./CopyButton";

/** Code frame with filename, copy and expand/collapse for long files. */
export default function CodeBlock({
  code,
  filename,
  children,
  collapsedHeight = 360,
  className,
}: {
  code: string;
  filename?: string;
  children: ReactNode;
  collapsedHeight?: number;
  className?: string;
}) {
  const lines = code.split("\n").length;
  const long = lines > 22;
  const [open, setOpen] = useState(!long);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]", className)} style={{ "--ui-ink": "255 255 255" } as React.CSSProperties}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2">
        <span className="truncate font-mono text-xs text-neutral-400">{filename ?? "tsx"}</span>
        <CopyButton text={code} iconOnly label="Copy code" />
      </div>
      <div className="relative">
        <pre
          className="ui-code ui-scroll overflow-auto p-4 font-mono text-[12.5px] leading-[1.7] text-neutral-200"
          style={open ? { maxHeight: 640 } : { maxHeight: collapsedHeight, overflow: "hidden" }}
        >
          <code>{children}</code>
        </pre>
        {long && (
          <div
            className={cn(
              "flex justify-center",
              open
                ? "border-t border-white/10 py-2"
                : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pb-4 pt-16",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="rounded-md border border-white/15 bg-black px-3 py-1.5 text-xs text-neutral-200 hover:text-white"
            >
              {open ? "Collapse" : `Expand · ${lines} lines`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
