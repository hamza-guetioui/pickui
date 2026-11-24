"use client";

import * as React from "react";

/**
 * AuroraInput — a text field whose border becomes a slow aurora when focused,
 * with a floating label, a live character ring that fills as you type and
 * turns red near the limit, and a gentle shake on invalid submit.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type AuroraInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  /** Character limit shown as a ring (default 40). 0 hides it. */
  limit?: number;
  hint?: string;
  error?: string;
  /** false = static gradient border (the "regular" version). Default true. */
  animated?: boolean;
};

const css = `
@property --gx-ai-a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes gx-ai-spin{to{--gx-ai-a:360deg}}
@keyframes gx-ai-shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.gx-ai-ring{background:conic-gradient(from var(--gx-ai-a),#22d3ee,#a78bfa,#f472b6,#4ade80,#22d3ee)}
.gx-ai[data-animated="true"] .gx-ai-ring{animation:gx-ai-spin 4s linear infinite}
.gx-ai[data-shake="true"]{animation:gx-ai-shake .4s}
@media (prefers-reduced-motion:reduce){.gx-ai *, .gx-ai{animation:none!important}}
`;

export function AuroraInput({
  label = "Email address",
  limit = 40,
  hint = "We’ll never share it.",
  error,
  animated = true,
  className = "",
  value,
  defaultValue,
  onChange,
  ...rest
}: AuroraInputProps) {
  const id = React.useId();
  const [inner, setInner] = React.useState(String(defaultValue ?? ""));
  const text = value !== undefined ? String(value) : inner;
  const [shake, setShake] = React.useState(false);
  const prev = React.useRef(error);

  React.useEffect(() => {
    if (error && error !== prev.current) {
      setShake(true);
      const t = window.setTimeout(() => setShake(false), 450);
      prev.current = error;
      return () => window.clearTimeout(t);
    }
    prev.current = error;
  }, [error]);

  const pct = limit ? Math.min(1, text.length / limit) : 0;
  const near = limit > 0 && text.length > limit * 0.85;
  const C = 2 * Math.PI * 9;

  return (
    <div className={`gx-ai w-full max-w-sm ${className}`} data-animated={animated} data-shake={shake}>
      <style>{css}</style>
      <div className="group relative rounded-xl p-px">
        <div
          aria-hidden
          className={`gx-ai-ring absolute inset-0 rounded-xl opacity-0 blur-[1px] transition-opacity duration-300 group-focus-within:opacity-100 ${error ? "!opacity-100 ![background:#ef4444]" : ""}`}
        />
        <div aria-hidden className="gx-ai-ring absolute inset-0 rounded-xl opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-40" />
        <div className="relative rounded-[11px] bg-[#0c0c0e] ring-1 ring-white/10 group-focus-within:ring-transparent">
          <input
            id={id}
            {...rest}
            value={text}
            onChange={(e) => {
              if (value === undefined) setInner(e.target.value);
              onChange?.(e);
            }}
            placeholder=" "
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-help`}
            className="peer h-14 w-full rounded-[11px] bg-transparent px-4 pb-1.5 pr-12 pt-5 text-sm text-white outline-none"
          />
          <label
            htmlFor={id}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/45 transition-all duration-200 peer-focus:top-3.5 peer-focus:text-[11px] peer-focus:text-white/70 peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[11px]"
          >
            {label}
          </label>
          {limit > 0 && (
            <svg aria-hidden viewBox="0 0 24 24" className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 -rotate-90">
              <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2.5" />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke={text.length > limit ? "#ef4444" : near ? "#f59e0b" : "#4ade80"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                className="transition-[stroke-dashoffset,stroke] duration-300"
              />
            </svg>
          )}
        </div>
      </div>
      <p id={`${id}-help`} className={`mt-2 px-1 text-xs ${error ? "text-red-400" : "text-white/40"}`} role={error ? "alert" : undefined}>
        {error ?? hint}
        {limit > 0 && near && !error && <span className="ml-1 text-amber-400">({limit - text.length} left)</span>}
      </p>
    </div>
  );
}

export default AuroraInput;
