"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className,
  iconOnly,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={iconOnly ? (done ? copiedLabel : label) : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border ui-line ui-soft px-2.5 py-1.5 text-xs font-medium ui-ink transition hover:border-[rgb(var(--ui-ink)/0.25)] hover:bg-[rgb(var(--ui-ink)/0.08)] hover:text-[rgb(var(--ui-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ui-ink)/0.5)]",
        className,
      )}
    >
      {done ? <Check className="h-3.5 w-3.5 ui-accent" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {!iconOnly && <span>{done ? copiedLabel : label}</span>}
      <span className="sr-only" aria-live="polite">
        {done ? copiedLabel : ""}
      </span>
    </button>
  );
}
