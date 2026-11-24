"use client";

import * as React from "react";

/**
 * ReceiptPrinter — a thermal printer that feeds a real-looking receipt out of
 * its slot line by line: stepper-motor jerks, a blinking status LED, a body
 * that buzzes while printing, dotted leaders, a barcode generated from your
 * order code and a torn zig-zag edge. Great for checkout success, invoices,
 * "your build summary", or year-in-review moments.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type ReceiptItem = { name: string; qty?: number; price: number };

export type ReceiptPrinterProps = {
  title?: string;
  /** Line under the title, e.g. order number. */
  meta?: string;
  items: ReceiptItem[];
  currency?: string;
  /** 0.2 = 20 %. */
  taxRate?: number;
  footer?: string;
  /** Used for the barcode. */
  code?: string;
  /** Start printing when mounted (default true). */
  autoPrint?: boolean;
  onPrinted?: () => void;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const css = `
@keyframes gx-rp-buzz{0%,100%{transform:translateX(0)}50%{transform:translateX(.6px)}}
@keyframes gx-rp-led{50%{opacity:.2}}
.gx-rp[data-printing="true"] .gx-rp-body{animation:gx-rp-buzz .08s linear infinite}
.gx-rp[data-printing="true"] .gx-rp-led{animation:gx-rp-led .3s steps(1) infinite}
`;

function Barcode({ code }: { code: string }) {
  let h = 2166136261;
  for (const c of code) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const bars = Array.from({ length: 46 }, () => {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    return 1 + (h % 3);
  });
  return (
    <div className="flex h-10 items-stretch justify-center" aria-hidden>
      {bars.map((w, i) => (
        <span key={i} style={{ width: w, marginRight: i % 3 ? 1 : 2 }} className={i % 2 ? "bg-transparent" : "bg-neutral-900"} />
      ))}
    </div>
  );
}

export function ReceiptPrinter({
  title = "PICKUI DINER",
  meta = "ORDER #0427 · TABLE 7",
  items,
  currency = "$",
  taxRate = 0.1,
  footer = "Thank you — come back hungry.",
  code = "GX0427",
  autoPrint = true,
  onPrinted,
  animated = true,
  className = "",
}: ReceiptPrinterProps) {
  const paperRef = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(0);
  const [printing, setPrinting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const timer = React.useRef(0);

  const fmt = (n: number) => `${currency}${n.toFixed(2)}`;
  const subtotal = items.reduce((s, it) => s + it.price * (it.qty ?? 1), 0);
  const tax = subtotal * taxRate;

  const print = React.useCallback(() => {
    const full = paperRef.current?.scrollHeight ?? 0;
    window.clearTimeout(timer.current);
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(full);
      setDone(true);
      onPrinted?.();
      return;
    }
    setDone(false);
    setPrinting(true);
    setShown(0);
    let h = 0;
    const step = () => {
      h = Math.min(full, h + 7 + Math.random() * 6);
      setShown(h);
      if (h < full) {
        // stepper motor: mostly steady, sometimes a short stall between lines
        timer.current = window.setTimeout(step, Math.random() < 0.12 ? 160 : 38);
      } else {
        setPrinting(false);
        setDone(true);
        onPrinted?.();
      }
    };
    timer.current = window.setTimeout(step, 350);
  }, [onPrinted, animated]);

  React.useEffect(() => {
    if (autoPrint) print();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- print once on mount
  }, []);

  return (
    <div className={`gx-rp flex h-[460px] w-full flex-col items-center justify-end ${className}`} data-printing={printing}>
      <style>{css}</style>
      <p className="sr-only" role="status">
        {printing ? "Printing receipt…" : done ? "Receipt printed" : ""}
      </p>

      {/* paper, rising out of the slot */}
      <div className="relative w-[248px] overflow-hidden" style={{ height: shown }}>
        <div
          ref={paperRef}
          className="absolute inset-x-0 top-0 bg-[#f7f5ef] px-5 pb-6 pt-5 font-mono text-[11px] leading-[1.55] text-neutral-800"
          style={{
            WebkitMask: "conic-gradient(from 135deg at top, transparent 90deg, #000 0) top/12px 7px repeat-x, linear-gradient(#000,#000) 0 7px/100% 100% no-repeat",
            mask: "conic-gradient(from 135deg at top, transparent 90deg, #000 0) top/12px 7px repeat-x, linear-gradient(#000,#000) 0 7px/100% 100% no-repeat",
            backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.05), transparent 12%, transparent 88%, rgba(0,0,0,.05))",
          }}
        >
          <p className="text-center text-[15px] font-black tracking-[0.2em]">{title}</p>
          <p className="text-center text-[10px] text-neutral-500">{meta}</p>
          <p className="my-2 overflow-hidden whitespace-nowrap text-neutral-400">{"- ".repeat(40)}</p>
          <ul>
            {items.map((it) => (
              <li key={it.name} className="flex items-baseline gap-1">
                <span className="shrink-0">
                  {(it.qty ?? 1) > 1 ? `${it.qty}× ` : ""}
                  {it.name}
                </span>
                <span aria-hidden className="min-w-2 flex-1 translate-y-[-3px] border-b border-dotted border-neutral-400" />
                <span className="shrink-0 tabular-nums">{fmt(it.price * (it.qty ?? 1))}</span>
              </li>
            ))}
          </ul>
          <p className="my-2 overflow-hidden whitespace-nowrap text-neutral-400">{"- ".repeat(40)}</p>
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-neutral-500">
              <span>Tax {Math.round(taxRate * 100)}%</span>
              <span className="tabular-nums">{fmt(tax)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-[14px] font-black">
            <span>TOTAL</span>
            <span className="tabular-nums">{fmt(subtotal + tax)}</span>
          </div>
          <div className="mt-4">
            <Barcode code={code} />
            <p className="mt-1 text-center text-[10px] tracking-[0.4em]">{code}</p>
          </div>
          <p className="mt-3 text-center text-[10px] text-neutral-500">{footer}</p>
        </div>
      </div>

      {/* printer */}
      <div className="gx-rp-body relative z-10 w-[300px]">
        <div className="mx-auto h-[6px] w-[262px] rounded-t-sm bg-black shadow-[inset_0_2px_3px_rgba(0,0,0,.9)]" />
        <div className="relative h-[78px] rounded-b-[22px] rounded-t-[14px] border-t border-white/10 bg-gradient-to-b from-[#3a3b40] via-[#232428] to-[#16171a] shadow-[0_24px_40px_-14px_rgba(0,0,0,.9)]">
          <div className="absolute left-5 top-4 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">GX-58 Thermal</div>
          <span
            className="gx-rp-led absolute right-5 top-4 h-2 w-2 rounded-full"
            style={{ background: printing ? "#4ade80" : done ? "#4ade80" : "#f59e0b", boxShadow: `0 0 8px ${printing || done ? "#4ade80" : "#f59e0b"}` }}
          />
          <button
            type="button"
            onClick={print}
            disabled={printing}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/75 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50"
          >
            {printing ? "Printing…" : done ? "Reprint" : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPrinter;
