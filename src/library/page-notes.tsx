"use client";

import * as React from "react";

/**
 * page-notes — sticky notes for ANY website. Hit the button (or press N),
 * click anywhere to pin a note, type, drag it around, change its color,
 * delete it. Notes persist per page in localStorage and can be exported as
 * JSON — a free design-review / QA / feedback tool for staging sites.
 *
 * Framework-agnostic core (`pageNotes()`) + React wrapper (`<PageNotes />`).
 * Zero dependencies · keyboard accessible.
 */

export type Note = { id: string; x: number; y: number; text: string; color: string; at: number };

export type PageNotesOptions = {
  /** localStorage key (default "gx-notes:" + pathname). */
  storageKey?: string;
  colors?: string[];
  /** Keyboard shortcut to start placing a note (default "n"; null disables). */
  hotkey?: string | null;
  container?: HTMLElement;
  zIndex?: number;
  onChange?: (notes: Note[]) => void;
};

const STYLE_ID = "gx-page-notes-style";
const CSS = `
.gxn-layer{font:14px/1.4 ui-rounded,system-ui,sans-serif}
.gxn-layer[data-placing]{cursor:crosshair}
.gxn-note{position:absolute;width:190px;min-height:120px;padding:26px 10px 10px;border-radius:2px 2px 14px 2px;box-shadow:0 10px 24px -8px rgba(0,0,0,.55);transform:rotate(var(--r));color:#1c1917;pointer-events:auto;animation:gxn-in .35s cubic-bezier(.3,1.6,.5,1)}
.gxn-note::before{content:"";position:absolute;top:-8px;left:50%;width:56px;height:18px;transform:translateX(-50%) rotate(-3deg);background:rgba(255,255,255,.55);box-shadow:0 1px 2px rgba(0,0,0,.15)}
.gxn-bar{position:absolute;top:4px;left:8px;right:6px;display:flex;align-items:center;gap:5px;cursor:grab}
.gxn-bar:active{cursor:grabbing}
.gxn-dot{all:unset;width:12px;height:12px;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}
.gxn-dot:focus-visible,.gxn-x:focus-visible{outline:2px solid #111}
.gxn-x{all:unset;margin-left:auto;cursor:pointer;opacity:.5;font-size:14px;padding:0 2px}
.gxn-x:hover{opacity:1}
.gxn-text{all:unset;display:block;width:100%;min-height:80px;white-space:pre-wrap;word-break:break-word;font:inherit}
.gxn-text:empty::before{content:attr(data-ph);opacity:.45}
.gxn-fab{position:absolute;right:16px;bottom:16px;display:flex;gap:6px;pointer-events:auto}
.gxn-btn{all:unset;cursor:pointer;padding:9px 14px;border-radius:999px;background:#fde047;color:#1c1917;font:700 13px system-ui;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.gxn-btn[data-alt]{background:#18181b;color:#fff;border:1px solid rgba(255,255,255,.15)}
.gxn-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
.gxn-hint{position:absolute;left:50%;top:14px;transform:translateX(-50%);padding:7px 14px;border-radius:999px;background:#fde047;color:#1c1917;font:700 12px system-ui;pointer-events:none}
@keyframes gxn-in{from{opacity:0;transform:rotate(var(--r)) scale(.6) translateY(-10px)}}
@media (prefers-reduced-motion:reduce){.gxn-note{animation:none}}
`;

export function pageNotes(options: PageNotesOptions = {}) {
  if (typeof window === "undefined") return { destroy() {}, place() {}, export: () => "[]" };
  const { colors = ["#fde047", "#f9a8d4", "#86efac", "#7dd3fc"], hotkey = "n", container, zIndex = 9995, onChange } = options;
  const key = options.storageKey ?? `gx-notes:${location.pathname}`;
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const host = container ?? document.body;
  const fixed = !container;
  const layer = document.createElement("div");
  layer.className = "gxn-layer";
  // page mode: absolute over the document so notes scroll with content
  Object.assign(layer.style, { position: "absolute", left: "0", top: "0", width: "100%", height: fixed ? `${document.documentElement.scrollHeight}px` : "100%", pointerEvents: "none", zIndex: String(zIndex) });
  host.appendChild(layer);
  const ui = document.createElement("div");
  Object.assign(ui.style, { position: fixed ? "fixed" : "absolute", inset: "0", pointerEvents: "none", zIndex: String(zIndex + 1) });
  host.appendChild(ui);

  let notes: Note[] = [];
  try {
    notes = JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {}
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(notes));
    } catch {}
    onChange?.(notes);
  };

  const render = (n: Note, focus = false) => {
    const el = document.createElement("div");
    el.className = "gxn-note";
    el.style.left = `${n.x}px`;
    el.style.top = `${n.y}px`;
    el.style.background = n.color;
    el.style.setProperty("--r", `${((n.at % 7) - 3) * 0.8}deg`);
    el.setAttribute("role", "note");
    const bar = document.createElement("div");
    bar.className = "gxn-bar";
    colors.forEach((c) => {
      const d = document.createElement("button");
      d.className = "gxn-dot";
      d.type = "button";
      d.style.background = c;
      d.setAttribute("aria-label", `Color ${c}`);
      d.onclick = () => {
        n.color = c;
        el.style.background = c;
        save();
      };
      bar.appendChild(d);
    });
    const x = document.createElement("button");
    x.className = "gxn-x";
    x.type = "button";
    x.textContent = "✕";
    x.setAttribute("aria-label", "Delete note");
    x.onclick = () => {
      notes = notes.filter((k) => k.id !== n.id);
      el.remove();
      save();
    };
    bar.appendChild(x);
    const text = document.createElement("div");
    text.className = "gxn-text";
    text.contentEditable = "true";
    text.setAttribute("role", "textbox");
    text.setAttribute("aria-label", "Note text");
    text.dataset.ph = "Write a note…";
    text.textContent = n.text;
    text.oninput = () => {
      n.text = text.textContent ?? "";
      save();
    };
    // drag by the bar
    bar.onpointerdown = (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      bar.setPointerCapture(e.pointerId);
      const sx = e.clientX - n.x;
      const sy = e.clientY - n.y;
      bar.onpointermove = (m) => {
        n.x = m.clientX - sx;
        n.y = m.clientY - sy;
        el.style.left = `${n.x}px`;
        el.style.top = `${n.y}px`;
      };
      bar.onpointerup = () => {
        bar.onpointermove = null;
        save();
      };
    };
    el.append(bar, text);
    layer.appendChild(el);
    if (focus) requestAnimationFrame(() => text.focus());
  };
  notes.forEach((n) => render(n));

  // UI: buttons + hint
  const fab = document.createElement("div");
  fab.className = "gxn-fab";
  const addBtn = document.createElement("button");
  addBtn.className = "gxn-btn";
  addBtn.type = "button";
  addBtn.textContent = "+ Note";
  const expBtn = document.createElement("button");
  expBtn.className = "gxn-btn";
  expBtn.dataset.alt = "";
  expBtn.type = "button";
  expBtn.textContent = "⤓ Export";
  fab.append(expBtn, addBtn);
  ui.appendChild(fab);
  const hint = document.createElement("div");
  hint.className = "gxn-hint";
  hint.textContent = "Click anywhere to pin a note · Esc to cancel";
  hint.hidden = true;
  ui.appendChild(hint);

  let placing = false;
  const stopPlacing = () => {
    placing = false;
    hint.hidden = true;
    delete layer.dataset.placing;
    layer.style.pointerEvents = "none";
  };
  const place = () => {
    placing = true;
    hint.hidden = false;
    layer.dataset.placing = "";
    layer.style.pointerEvents = "auto";
  };
  layer.addEventListener("click", (e) => {
    if (!placing || e.target !== layer) return;
    const r = layer.getBoundingClientRect();
    const n: Note = { id: Math.random().toString(36).slice(2, 9), x: e.clientX - r.left - 20, y: e.clientY - r.top - 20, text: "", color: colors[notes.length % colors.length], at: Date.now() };
    notes.push(n);
    render(n, true);
    save();
    stopPlacing();
  });
  addBtn.onclick = () => (placing ? stopPlacing() : place());
  const exportJson = () => JSON.stringify({ page: location.href, notes }, null, 2);
  expBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(exportJson());
      expBtn.textContent = "✓ Copied JSON";
    } catch {
      expBtn.textContent = "Copy failed";
    }
    window.setTimeout(() => (expBtn.textContent = "⤓ Export"), 1400);
  };
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (e.key === "Escape" && placing) stopPlacing();
    if (hotkey && e.key.toLowerCase() === hotkey && !t.isContentEditable && !/input|textarea|select/i.test(t.tagName) && !e.metaKey && !e.ctrlKey) place();
  };
  window.addEventListener("keydown", onKey);

  return {
    place,
    export: exportJson,
    destroy() {
      window.removeEventListener("keydown", onKey);
      layer.remove();
      ui.remove();
    },
  };
}

export type PageNotesProps = Omit<PageNotesOptions, "container" | "onChange"> & { fullscreen?: boolean; animated?: boolean; className?: string };

/** React wrapper: notes live in the positioned parent (or the whole page with `fullscreen`). */
export function PageNotes({ fullscreen = false, animated = true, className = "", ...opts }: PageNotesProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  React.useEffect(() => {
    const inst = pageNotes({ ...(JSON.parse(key) as PageNotesOptions), container: fullscreen ? undefined : ref.current?.parentElement ?? undefined });
    return () => inst.destroy();
  }, [fullscreen, key, animated]);
  return fullscreen ? null : <span ref={ref} hidden className={className} />;
}

export default PageNotes;
