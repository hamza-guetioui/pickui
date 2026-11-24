"use client";

import * as React from "react";

/**
 * FolderPeek — a 3D folder that opens on hover / tap / keyboard focus: the
 * front flap swings toward you, light spills out, and the files fan up with a
 * staggered spring. Three art directions in one file:
 *   - "classic": a glossy desktop folder
 *   - "neon":    a wireframe hologram (grid back, dashed depth shells, glowing edges)
 *   - "davinci": a Renaissance codex (parchment, ink construction lines, mirror-written
 *                notes, wax seal)
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type FolderFile = {
  name: string;
  /** Short meta line, e.g. "PDF · 2.4 MB". */
  meta?: string;
  /** Tag color on the paper (classic / neon). */
  color?: string;
};

export type FolderVariant = "classic" | "neon" | "davinci";

export type FolderPeekProps = {
  label: string;
  /** Up to 4 files are fanned out. */
  files: FolderFile[];
  variant?: FolderVariant;
  /** Main color (classic: folder, neon: glow). Ignored by "davinci". */
  color?: string;
  /** false = no idle motion (hover/open still animate). Default true. */
  animated?: boolean;
  /** Controlled open state (otherwise hover/tap/focus). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const css = `
.gx-fp{--o:0}
.gx-fp:hover,.gx-fp[data-open="true"],.gx-fp:has(:focus-visible){--o:1}
.gx-fp-file{transition:transform .65s cubic-bezier(.3,1.5,.5,1);transition-delay:calc(var(--i)*45ms)}
.gx-fp-front{transform:perspective(900px) rotateX(calc(var(--o)*-46deg));transition:transform .55s cubic-bezier(.3,1.3,.5,1)}
.gx-fp-glow{opacity:var(--o);transition:opacity .5s}
.gx-fp-shadow{transform:scaleX(calc(1 + var(--o)*.12));opacity:calc(.55 + var(--o)*.25);transition:all .5s}
.gx-fp-shell{transform:translate(calc(var(--s)*-5px - var(--o)*var(--s)*4px),calc(var(--s)*-5px - var(--o)*var(--s)*4px));transition:transform .6s cubic-bezier(.3,1.3,.5,1)}
.gx-fp[data-animated="true"] .gx-fp-bob{animation:gx-fp-bob 5s ease-in-out infinite}
.gx-fp[data-animated="true"]:hover .gx-fp-bob,.gx-fp[data-animated="true"][data-open="true"] .gx-fp-bob{animation-play-state:paused}
.gx-fp[data-animated="true"] .gx-fp-scan{animation:gx-fp-scan 2.6s linear infinite}
.gx-fp[data-animated="true"] .gx-fp-ink{stroke-dasharray:420;animation:gx-fp-ink 3.2s ease-in-out infinite alternate}
@keyframes gx-fp-bob{50%{transform:translateY(-6px)}}
@keyframes gx-fp-scan{from{transform:translateY(-100%)}to{transform:translateY(400%)}}
@keyframes gx-fp-ink{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.gx-fp *{animation:none!important;transition:none!important}}
`;

const SERIF = "[font-family:Georgia,'Times_New_Roman',serif] italic";
const PARCHMENT =
  "radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,.35), transparent 60%), radial-gradient(circle at 80% 85%, rgba(120,72,20,.25), transparent 45%), linear-gradient(180deg,#e9d8b0,#d8c08e)";

export function FolderPeek({
  label,
  files,
  variant = "classic",
  color,
  animated = true,
  open,
  onOpenChange,
  className = "",
}: FolderPeekProps) {
  const [inner, setInner] = React.useState(false);
  const isOpen = open ?? inner;
  const listId = React.useId();
  const shown = files.slice(0, 4);
  const n = shown.length;
  const mid = (n - 1) / 2;
  const c = color ?? (variant === "neon" ? "#4ade80" : "#f59e0b");

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  /* ── per-variant skins ─────────────────────────────────────────────── */
  type Skin = {
    tab: React.CSSProperties;
    back: React.CSSProperties;
    glow: string;
    front: React.CSSProperties;
    file: React.CSSProperties;
    line: string;
    label: string;
    sub: string;
    shadow: string;
  };
  const skins: Record<FolderVariant, Skin> = {
    classic: {
      tab: { background: `color-mix(in oklab, ${c} 62%, black)` },
      back: { background: `linear-gradient(180deg, color-mix(in oklab, ${c} 62%, black), color-mix(in oklab, ${c} 45%, black))` },
      glow: `radial-gradient(closest-side, color-mix(in srgb, ${c} 60%, white), transparent)`,
      front: {
        background: `linear-gradient(180deg, color-mix(in oklab, ${c} 80%, white), ${c} 55%, color-mix(in oklab, ${c} 80%, black))`,
        borderTop: "1px solid rgba(255,255,255,.3)",
      },
      file: { background: "#fbfaf7", border: "1px solid rgba(0,0,0,.05)", color: "#262626" },
      line: "#e5e5e5",
      label: "text-black/80",
      sub: "text-black/50",
      shadow: "#000",
    },
    neon: {
      tab: { background: "rgba(8,14,11,.95)", border: `1px solid ${c}`, borderBottom: 0, boxShadow: `0 -4px 14px -6px ${c}` },
      back: {
        background: `linear-gradient(color-mix(in srgb, ${c} 16%, transparent) 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, color-mix(in srgb, ${c} 16%, transparent) 1px, transparent 1px) 0 0/12px 12px, rgba(8,14,11,.94)`,
        border: `1px solid ${c}`,
        boxShadow: `0 0 22px -4px ${c}, inset 0 0 22px color-mix(in srgb, ${c} 18%, transparent)`,
      },
      glow: `radial-gradient(closest-side, color-mix(in srgb, ${c} 55%, transparent), transparent)`,
      front: {
        background: `linear-gradient(180deg, color-mix(in srgb, ${c} 14%, rgba(8,14,11,.92)), rgba(8,14,11,.92))`,
        border: `1px solid ${c}`,
        boxShadow: `0 0 26px -6px ${c}, inset 0 1px 0 color-mix(in srgb, ${c} 60%, transparent)`,
        backdropFilter: "blur(3px)",
      },
      file: {
        background: `radial-gradient(color-mix(in srgb, ${c} 35%, transparent) 1px, transparent 1.2px) 0 0/8px 8px, rgba(10,16,13,.96)`,
        border: `1px solid color-mix(in srgb, ${c} 70%, transparent)`,
        boxShadow: `0 0 12px -4px ${c}`,
        color: "#e9ece9",
      },
      line: `color-mix(in srgb, ${c} 35%, transparent)`,
      label: "text-white [text-shadow:0_0_10px_var(--gx-fp-c)]",
      sub: "text-[color:var(--gx-fp-c)]",
      shadow: c,
    },
    davinci: {
      tab: { background: "#cdb184", boxShadow: "inset 0 0 0 1px rgba(90,55,20,.35)" },
      back: { background: "linear-gradient(180deg,#c7a979,#b8966a)", boxShadow: "inset 0 0 0 1px rgba(90,55,20,.35), inset 0 0 30px rgba(90,55,20,.35)" },
      glow: "radial-gradient(closest-side, rgba(255,226,160,.55), transparent)",
      front: { background: PARCHMENT, boxShadow: "inset 0 0 0 1px rgba(90,55,20,.4), inset 0 0 40px rgba(110,70,25,.35)" },
      file: { background: PARCHMENT, boxShadow: "inset 0 0 0 1px rgba(90,55,20,.3), 0 8px 18px -8px rgba(60,35,10,.6)", color: "#4a3218" },
      line: "rgba(74,50,24,.28)",
      label: `text-[#4a3218] ${SERIF}`,
      sub: "text-[#7a5a32]",
      shadow: "#2a1a08",
    },
  };
  const skin = skins[variant];

  return (
    <div
      className={`gx-fp relative aspect-[13/10] w-full max-w-[320px] select-none ${className}`}
      data-open={isOpen}
      data-animated={animated}
      data-variant={variant}
      style={{ "--gx-fp-c": c } as React.CSSProperties}
    >
      <style>{css}</style>

      {/* floor shadow (neon: glowing grid floor) */}
      <div aria-hidden className="gx-fp-shadow absolute -bottom-3 left-[6%] right-[6%] h-6 rounded-[50%] blur-xl" style={{ background: skin.shadow }} />

      <div className="gx-fp-bob absolute inset-0">
        {/* neon: dashed depth shells behind the folder */}
        {variant === "neon" &&
          [2, 1].map((s) => (
            <div
              key={s}
              aria-hidden
              className="gx-fp-shell absolute inset-x-0 bottom-0 h-[80%] rounded-2xl rounded-tl-none border border-dashed"
              style={{ "--s": s, borderColor: `color-mix(in srgb, ${c} ${s === 1 ? 45 : 25}%, transparent)` } as React.CSSProperties}
            />
          ))}

        {/* back + tab */}
        <div aria-hidden className="absolute left-0 top-[12%] h-[10%] w-[40%] rounded-t-2xl" style={skin.tab} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[80%] overflow-hidden rounded-2xl rounded-tl-none" style={skin.back}>
          {variant === "davinci" && (
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 80" preserveAspectRatio="none">
              <path d="M0 80 L100 0 M0 0 L100 80" stroke="rgba(74,50,24,.18)" strokeWidth=".3" fill="none" />
            </svg>
          )}
        </div>

        {/* light spilling out */}
        <div aria-hidden className="gx-fp-glow absolute inset-x-[10%] bottom-[30%] h-[60%] rounded-full blur-2xl" style={{ background: skin.glow }} />

        {/* files */}
        {shown.map((f, i) => {
          const off = i - mid;
          const lift = 44 + (1 - Math.abs(off) / Math.max(mid, 1)) * 14;
          return (
            <div
              key={f.name}
              aria-hidden
              className="gx-fp-file absolute bottom-[12%] left-[12%] right-[12%] h-[66%] overflow-hidden rounded-lg p-3 shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)]"
              style={
                {
                  ...skin.file,
                  "--i": i,
                  transform: `translate(calc(var(--o) * ${off * 30}%), calc(var(--o) * -${lift}%)) rotate(calc(var(--o) * ${off * 9}deg))`,
                  zIndex: 2 + i,
                } as React.CSSProperties
              }
            >
              {variant === "davinci" ? (
                <>
                  <p className={`truncate text-[12px] font-bold ${SERIF}`}>{f.name}</p>
                  {/* mirror-written note, like Leonardo's notebooks */}
                  <p className={`mt-1 truncate text-[9px] opacity-70 ${SERIF}`} style={{ transform: "scaleX(-1)" }}>
                    {f.meta ?? "studio di forma"}
                  </p>
                  <svg className="mt-1 h-10 w-full" viewBox="0 0 120 40" fill="none" stroke="rgba(74,50,24,.65)" strokeWidth=".8">
                    <circle className="gx-fp-ink" cx={28 + i * 14} cy="20" r="14" />
                    <path className="gx-fp-ink" d={`M4 34 Q 40 ${4 + i * 6} 116 30`} />
                    <path d="M4 20 H116 M60 2 V38" strokeDasharray="2 3" stroke="rgba(74,50,24,.3)" />
                  </svg>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: f.color ?? c, boxShadow: variant === "neon" ? `0 0 6px ${f.color ?? c}` : undefined }}
                    />
                    <span className={`truncate text-[11px] font-bold ${variant === "neon" ? "font-mono" : ""}`}>{f.name}</span>
                  </div>
                  {f.meta && <p className="mt-0.5 truncate font-mono text-[9px] opacity-60">{f.meta}</p>}
                  <div className="mt-2 space-y-1.5">
                    {["100%", "80%", "60%"].map((w) => (
                      <div key={w} className="h-1 rounded" style={{ width: w, background: skin.line }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* front flap */}
        <div
          aria-hidden
          className="gx-fp-front absolute inset-x-0 bottom-0 z-20 h-[70%] origin-bottom overflow-hidden rounded-2xl shadow-[0_-6px_20px_-10px_rgba(0,0,0,.6)]"
          style={skin.front}
        >
          {variant === "classic" && <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.35),transparent_40%)]" />}
          {variant === "neon" && (
            <>
              <div
                className="gx-fp-scan absolute inset-x-0 top-0 h-1/4"
                style={{ background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${c} 22%, transparent), transparent)` }}
              />
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: c }}>
                dir://{label.toLowerCase().replace(/\s+/g, "-")}
              </span>
            </>
          )}
          {variant === "davinci" && (
            <>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 110" fill="none" stroke="rgba(74,50,24,.35)" strokeWidth=".6">
                <circle className="gx-fp-ink" cx="150" cy="40" r="30" />
                <path d="M120 40 H180 M150 10 V70" strokeDasharray="2 3" />
                <path className="gx-fp-ink" d="M10 90 C 50 60, 90 100, 140 75" />
              </svg>
              {/* wax seal */}
              <span
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-[#f3d9b0]"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #c0392b, #7b1a12 70%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,.4), inset 0 0 0 3px rgba(0,0,0,.15)",
                  fontFamily: "Georgia, serif",
                }}
              >
                L
              </span>
            </>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className={`text-lg font-black leading-tight ${skin.label}`}>{label}</p>
              <p className={`font-mono text-[10px] uppercase tracking-widest ${skin.sub}`}>
                {variant === "davinci" ? `Codex · ${files.length} folia` : `${files.length} files`}
              </p>
            </div>
            {variant !== "davinci" && (
              <span
                className="rounded-md px-2 py-1 font-mono text-[10px] font-bold"
                style={variant === "neon" ? { border: `1px solid ${c}`, color: c } : { background: "rgba(0,0,0,.15)", color: "rgba(0,0,0,.6)" }}
              >
                ⌘O
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`${label} folder, ${files.length} files`}
        className="absolute inset-0 z-30 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      />
      <ul id={listId} className="sr-only">
        {files.map((f) => (
          <li key={f.name}>
            {f.name}
            {f.meta ? `, ${f.meta}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FolderPeek;
