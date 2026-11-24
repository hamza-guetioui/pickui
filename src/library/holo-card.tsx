"use client";

import * as React from "react";

/**
 * HoloCard — a collectible trading card for a person (or product). It tilts
 * toward your cursor with a holographic foil, a glare and layers floating at
 * different depths. Click or press Enter to flip it: the back shows a bio,
 * skill bars, a signature ability and a barcode. Three rarities change the
 * art: Rare (line foil), Epic (cosmic foil + prism frame) and Legendary
 * (gold frame, glitter foil and sparkles).
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type HoloCardStat = { label: string; value: string };
export type HoloCardSkill = { label: string; level: number };
export type HoloRarity = "rare" | "epic" | "legendary";
export type HoloEdition = "holo" | "shinigami";

export type HoloCardProps = {
  name: string;
  role: string;
  /** Image URL. Falls back to initials. */
  avatar?: string;
  handle?: string;
  /** Up to three stats on the front. */
  stats?: HoloCardStat[];
  /** Printed serial. */
  serial?: string;
  /** Accent color (any CSS color). */
  accent?: string;
  /** Max tilt in degrees. */
  maxTilt?: number;
  /** Card rarity — changes foil, frame and effects. */
  rarity?: HoloRarity;
  /** Back side: short bio. */
  bio?: string;
  /** Back side: skills, level 0–100. */
  skills?: HoloCardSkill[];
  /** Back side: signature move. */
  ability?: { name: string; text: string };
  /** "holo" (profile card) or "shinigami" (anime death-god character card). */
  edition?: HoloEdition;
  /** Shinigami edition: your own character illustration (URL). */
  art?: string;
  /** Allow flipping (click / Enter). Default true. */
  flippable?: boolean;
  /** false = the calm "regular" version: no idle/ambient motion. Default true. */
  animated?: boolean;
  className?: string;
};

const SHINIGAMI_FRAME = "conic-gradient(from 0deg,#2a0309,#c8102e,#070103,#ff4d5e,#2a0309)";

const RARITY: Record<HoloRarity, { label: string; frame: string; gems: string }> = {
  rare: { label: "Rare · Holo", frame: "conic-gradient(from 0deg,#ffffff33,#ffffff10,#ffffff33)", gems: "✦" },
  epic: { label: "Epic · Cosmic", frame: "conic-gradient(from 0deg,#8b5cf6,#22d3ee,#f472b6,#8b5cf6)", gems: "✦✦" },
  legendary: { label: "Legendary · Gold", frame: "conic-gradient(from 0deg,#7a5410,#ffe39a,#b8862f,#fff3c4,#7a5410)", gems: "✦✦✦" },
};

const css = `
.gx-hc{--mx:50;--my:50;--rx:0deg;--ry:0deg;--o:0}
.gx-hc-card{transform:rotateX(var(--ry)) rotateY(var(--rx));transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.gx-hc[data-active="true"] .gx-hc-card{transition:transform .08s linear}
.gx-hc-flip{transition:transform .8s cubic-bezier(.3,1.3,.4,1)}
.gx-hc[data-flipped="true"] .gx-hc-flip{transform:rotateY(180deg)}
.gx-hc-face{backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:opacity 0s .2s}
.gx-hc[data-flipped="true"] .gx-hc-front,.gx-hc[data-flipped="false"] .gx-hc-back{opacity:0;pointer-events:none}
.gx-hc-foil{opacity:calc(var(--o)*.75);background:
 repeating-linear-gradient(115deg,#ff6b9d 0%,#ffd36b 7%,#7dffb2 14%,#6bd5ff 21%,#b36bff 28%,#ff6b9d 35%);
 background-size:300% 300%;background-position:calc(var(--mx)*1%) calc(var(--my)*1%);
 mix-blend-mode:color-dodge;filter:saturate(1.2) brightness(.75);
 -webkit-mask:repeating-linear-gradient(45deg,#000 0 2px,transparent 2px 5px),radial-gradient(circle at calc(var(--mx)*1%) calc(var(--my)*1%),#000 0%,transparent 70%);
 -webkit-mask-composite:source-in;mask-composite:intersect;transition:opacity .4s}
.gx-hc[data-rarity="epic"] .gx-hc-foil{opacity:calc(.25 + var(--o)*.7);
 -webkit-mask:radial-gradient(circle,#000 1px,transparent 1.6px) 0 0/7px 7px,radial-gradient(circle at calc(var(--mx)*1%) calc(var(--my)*1%),#000 0%,transparent 80%);
 -webkit-mask-composite:source-in;mask-composite:intersect}
.gx-hc[data-rarity="legendary"] .gx-hc-foil{opacity:calc(.3 + var(--o)*.7);
 background:repeating-linear-gradient(115deg,#fff3c4 0%,#ffcf5a 8%,#fff 12%,#c98f20 18%,#fff3c4 26%);background-size:300% 300%;
 -webkit-mask:radial-gradient(circle,#000 .8px,transparent 1.3px) 0 0/4px 4px,radial-gradient(circle,#000 .8px,transparent 1.3px) 2px 2px/4px 4px;
 -webkit-mask-composite:source-over;mask-composite:add}
.gx-hc-glare{opacity:calc(.15 + var(--o)*.55);background:radial-gradient(circle at calc(var(--mx)*1%) calc(var(--my)*1%),rgba(255,255,255,.55),rgba(255,255,255,.08) 30%,transparent 55%);mix-blend-mode:overlay;transition:opacity .4s}
.gx-hc-shine{background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 45%,transparent 55%);background-size:250% 100%;background-position:calc(var(--mx)*1%) 0;mix-blend-mode:screen}
.gx-hc-ring{animation:gx-hc-spin 6s linear infinite}
@keyframes gx-hc-spin{to{transform:rotate(1turn)}}
.gx-hc-spark{animation:gx-hc-tw var(--t) ease-in-out var(--d) infinite;opacity:0}
@keyframes gx-hc-tw{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
.gx-hc[data-animated="false"] .gx-hc-card{transform:translateY(calc(var(--o)*-6px));transition:transform .35s ease}
.gx-hc[data-animated="false"] .gx-hc-foil,.gx-hc[data-animated="false"] .gx-hc-shine,.gx-hc[data-animated="false"] .gx-hc-spark{display:none}
.gx-hc[data-animated="false"] .gx-hc-ring{animation:none}
.gx-hc[data-animated="false"] .gx-hc-glare{opacity:calc(var(--o)*.25)}
.gx-sg-foil{opacity:calc(.12 + var(--o)*.55)!important;background:repeating-linear-gradient(115deg,#ff2a3d 0%,#2a0309 6%,#ffd23a 11%,#5c0a14 17%,#ff2a3d 24%)!important;background-size:300% 300%!important}
.gx-sg-feather{animation:gx-sg-fall var(--t) linear var(--d) infinite;opacity:.85}
@keyframes gx-sg-fall{0%{transform:translate(0,-60px) rotate(-20deg)}50%{transform:translate(var(--sway),190px) rotate(30deg)}100%{transform:translate(0,480px) rotate(-10deg)}}
.gx-sg-eyes{opacity:calc(.65 + var(--o)*.35);transition:filter .3s}
[data-grin="true"] .gx-sg-eyes{filter:brightness(1.6) drop-shadow(0 0 4px #ff2a3d)}
.gx-sg-write{max-width:0}
.gx-sg-write[data-on="true"]{animation:gx-sg-write 1.1s steps(40,end) both}
@keyframes gx-sg-write{to{max-width:100%}}
.gx-sg-ink{animation:gx-sg-ink 1.2s ease-out both}
@keyframes gx-sg-ink{from{clip-path:inset(0 100% 0 0);filter:blur(1px)}to{clip-path:inset(0 0 0 0);filter:blur(0)}}
.gx-hc[data-animated="false"] .gx-sg-feather{display:none}
.gx-hc[data-animated="false"] .gx-sg-write{max-width:100%;animation:none}
@media (prefers-reduced-motion:reduce){.gx-sg-feather{display:none}.gx-sg-write{max-width:100%;animation:none!important}.gx-hc-card{transform:none!important}.gx-hc-flip{transition:none}.gx-hc-ring,.gx-hc-spark{animation:none}}
`;

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  left: 8 + ((i * 41) % 84),
  top: 6 + ((i * 67) % 88),
  size: 8 + (i % 3) * 4,
  t: `${1.8 + (i % 4) * 0.6}s`,
  d: `${-(i * 0.45)}s`,
}));

function Surface({ accent, rarity }: { accent: string; rarity: HoloRarity }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/15 bg-[#0c0d10] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            rarity === "legendary"
              ? `radial-gradient(120% 80% at 50% 0%, rgba(255,214,120,.45), transparent 60%), radial-gradient(circle at 1px 1px, rgba(255,230,160,.12) 1px, transparent 0) 0 0/14px 14px`
              : rarity === "epic"
                ? `radial-gradient(90% 70% at 20% 10%, rgba(139,92,246,.5), transparent 60%), radial-gradient(80% 60% at 90% 90%, rgba(34,211,238,.35), transparent 60%), radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 0) 0 0/14px 14px`
                : `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, ${accent} 35%, transparent), transparent 60%), radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 0) 0 0/14px 14px`,
        }}
      />
      <div className="gx-hc-shine absolute inset-0" />
      <div className="gx-hc-foil absolute inset-0" />
      <div className="gx-hc-glare absolute inset-0" />
      <div className="absolute inset-[10px] rounded-[16px] border border-white/10" />
    </div>
  );
}

function barcode(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: 34 }, (_, i) => 1 + ((h >>> (i % 29)) & 3) + (i % 5 === 0 ? 1 : 0));
}

/* ── Shinigami edition ─────────────────────────────────────────────────────
 * An original death-god character drawn in SVG (not any existing franchise's
 * character). Pass `art` to use your own illustration instead.
 */

const FEATHERS = Array.from({ length: 9 }, (_, i) => ({
  left: 6 + ((i * 37) % 88),
  size: 12 + (i % 3) * 6,
  t: `${7 + (i % 4) * 2.2}s`,
  d: `${-(i * 1.7)}s`,
  sway: `${((i * 23) % 40) - 20}px`,
}));

const RULES = [
  "I. Every soul in this ledger owes one secret.",
  "II. Ink spilled at midnight cannot be erased.",
  "III. Pay the collector in pomegranates.",
];

function ShinigamiArt({ bites, grin }: { bites: number; grin: boolean }) {
  // eyes follow the cursor through the card's --mx/--my
  const look = { transform: "translate(calc((var(--mx) - 50) * .045px), calc((var(--my) - 50) * .035px))" } as React.CSSProperties;
  return (
    <svg viewBox="0 0 250 350" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="gx-sg-sky" cx=".5" cy=".28" r=".85">
          <stop offset="0" stopColor="#5c0a14" />
          <stop offset=".45" stopColor="#2a0309" />
          <stop offset="1" stopColor="#070103" />
        </radialGradient>
        <radialGradient id="gx-sg-moon" cx=".42" cy=".38" r=".6">
          <stop offset="0" stopColor="#fff4e6" />
          <stop offset=".7" stopColor="#e8c9b5" />
          <stop offset="1" stopColor="#b98a7a" />
        </radialGradient>
        <linearGradient id="gx-sg-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d0dc" />
          <stop offset="1" stopColor="#7f8798" />
        </linearGradient>
        <filter id="gx-sg-glow" x="-2" y="-2" width="5" height="5">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <mask id="gx-sg-bite">
          <rect x="140" y="230" width="60" height="60" fill="#fff" />
          {bites > 0 && <circle cx="186" cy="247" r="9" fill="#000" />}
          {bites > 1 && <circle cx="190" cy="262" r="8" fill="#000" />}
          {bites > 2 && <circle cx="180" cy="276" r="9" fill="#000" />}
        </mask>
      </defs>
      <rect width="250" height="350" fill="url(#gx-sg-sky)" />
      {/* blood moon + haze */}
      <circle cx="125" cy="105" r="78" fill="url(#gx-sg-moon)" opacity=".92" />
      <circle cx="98" cy="88" r="9" fill="#b88a78" opacity=".35" />
      <circle cx="150" cy="120" r="13" fill="#b88a78" opacity=".3" />
      <circle cx="125" cy="105" r="78" fill="#a3122a" opacity=".38" style={{ mixBlendMode: "multiply" }} />
      <path d="M0 150 C60 135 90 160 140 148 S220 130 250 150 V170 H0Z" fill="#1a0206" opacity=".7" />
      {/* bony wings */}
      <g fill="#07060a" stroke="#c8102e" strokeOpacity=".55" strokeWidth=".8">
        <path d="M110 170 L40 95 L52 128 L18 118 L42 150 L8 160 L46 178 L20 205 L66 196 L96 214Z" />
        <path d="M140 170 L210 95 L198 128 L232 118 L208 150 L242 160 L204 178 L230 205 L184 196 L154 214Z" />
      </g>
      <g stroke="#3a0b12" strokeWidth="1.2" opacity=".8">
        <path d="M110 170 L40 95 M100 190 L18 118 M98 202 L8 160" />
        <path d="M140 170 L210 95 M150 190 L232 118 M152 202 L242 160" />
      </g>
      {/* body: black leather coat, belts, chain */}
      <path d="M78 350 C76 270 92 222 125 214 C158 222 174 270 172 350Z" fill="#0b0a0e" />
      <path d="M96 236 L154 300 M154 236 L96 300" stroke="#2a2730" strokeWidth="6" />
      <path d="M96 236 L154 300 M154 236 L96 300" stroke="#55505e" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="125" cy="268" r="7" fill="#c9c3b6" />
      <path d="M121 266h2v4h-2zM127 266h2v4h-2z" fill="#0b0a0e" />
      <path d="M86 320 Q125 300 164 322" stroke="#8d8676" strokeWidth="2" fill="none" strokeDasharray="3 3" />
      {/* tattered hood + curved horns */}
      <path d="M92 150 C80 120 92 100 104 96 C96 112 100 124 106 132 M158 150 C170 120 158 100 146 96 C154 112 150 124 144 132" fill="none" stroke="#d9cbb3" strokeWidth="7" strokeLinecap="round" />
      <path d="M92 150 C80 120 92 100 104 96 M158 150 C170 120 158 100 146 96" fill="none" stroke="#6b5d4a" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="M125 112 C92 112 80 150 84 196 L92 186 L96 200 L104 190 L110 206 L125 196 L140 206 L146 190 L154 200 L158 186 L166 196 C170 150 158 112 125 112Z" fill="#0a090d" stroke="#c8102e" strokeOpacity=".4" strokeWidth=".8" />
      {/* cracked porcelain mask */}
      <path d="M104 146 C104 128 146 128 146 146 L144 180 C138 196 112 196 106 180Z" fill="#e9e4dc" />
      <path d="M104 146 C104 128 146 128 146 146 L144 180 C138 196 112 196 106 180Z" fill="url(#gx-sg-skin)" opacity=".35" />
      <path d="M131 131 L127 142 L133 150 L128 160" stroke="#3a3530" strokeWidth=".9" fill="none" />
      <path d="M112 152 l-6 -4 M138 152 l6 -4" stroke="#5c0a14" strokeWidth="1.4" />
      {/* sockets + glowing eyes */}
      <ellipse cx="114" cy="160" rx="8" ry="5.5" fill="#1a1520" />
      <ellipse cx="136" cy="160" rx="8" ry="5.5" fill="#1a1520" />
      <g className="gx-sg-eyes">
        <circle cx="114" cy="160" r="6" fill="#ff2a3d" filter="url(#gx-sg-glow)" />
        <circle cx="136" cy="160" r="6" fill="#ff2a3d" filter="url(#gx-sg-glow)" />
        <circle cx="114" cy="160" r="4.4" fill="#ffd23a" />
        <circle cx="136" cy="160" r="4.4" fill="#ffd23a" />
        <g style={look}>
          <circle cx="114" cy="160" r="1.5" fill="#000" />
          <circle cx="136" cy="160" r="1.5" fill="#000" />
        </g>
      </g>
      {/* stitched grin */}
      <path d={grin ? "M110 178 Q125 192 140 178" : "M112 180 Q125 186 138 180"} stroke="#2a0309" strokeWidth="2" fill="none" className="transition-all duration-300" />
      {[114, 119, 125, 131, 136].map((x, i) => (
        <path key={i} d={`M${x} ${grin ? 177 + (i === 2 ? 4 : i % 4 ? 2.5 : 0.5) : 180} v6`} stroke="#5c0a14" strokeWidth="1.2" />
      ))}
      {/* long fingers holding a pomegranate */}
      <path d="M150 300 C160 288 170 284 178 288 M152 306 C166 300 178 300 186 304" stroke="#9aa1b0" strokeWidth="5" strokeLinecap="round" fill="none" />
      <g mask="url(#gx-sg-bite)">
        <circle cx="172" cy="262" r="20" fill="#7a0a1c" />
        <circle cx="172" cy="262" r="20" fill="none" stroke="#3a0410" strokeWidth="2" />
        <path d="M164 240 l3 6 l5 -7 l5 7 l3 -6 l-2 8 h-12z" fill="#5a0716" />
        <circle cx="172" cy="262" r="20" fill="url(#gx-sg-moon)" opacity=".12" />
        <ellipse cx="164" cy="253" rx="5" ry="3" fill="#fff" opacity=".55" />
      </g>
      {bites > 0 && (
        <g fill="#ff3355">
          {[[182, 250], [186, 256], [181, 258], [188, 266], [183, 271], [178, 277], [184, 279]].slice(0, bites * 3).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" />
          ))}
        </g>
      )}
      {/* red mist */}
      <rect width="250" height="350" fill="url(#gx-sg-sky)" opacity=".18" />
    </svg>
  );
}

function ShinigamiFaces({
  name,
  role,
  serial,
  stats,
  art,
  flipped,
}: {
  name: string;
  role: string;
  serial: string;
  stats: HoloCardStat[];
  art?: string;
  flipped: boolean;
}) {
  const [bites, setBites] = React.useState(0);
  const [grin, setGrin] = React.useState(false);
  const [signed, setSigned] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const bite = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setGrin(true);
    window.setTimeout(() => setGrin(false), 900);
    setBites((b) => (b >= 3 ? 0 : b + 1));
  };
  return (
    <>
      {/* ── FRONT ── */}
      <div className="gx-hc-face gx-hc-front absolute inset-0 overflow-hidden rounded-[22px] border border-[#c8102e]/40 bg-black [transform-style:preserve-3d]" data-grin={grin}>
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          <ShinigamiArt bites={bites} grin={grin} />
        )}
        {FEATHERS.map((f, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 20 40"
            className="gx-sg-feather pointer-events-none absolute top-0"
            style={{ left: `${f.left}%`, width: f.size, height: f.size * 2, "--t": f.t, "--d": f.d, "--sway": f.sway } as React.CSSProperties}
          >
            <path d="M10 0 C18 10 18 26 10 40 C2 26 2 10 10 0Z" fill="#050407" stroke="#c8102e" strokeOpacity=".35" strokeWidth=".6" />
            <path d="M10 2 V38" stroke="#2a2a30" strokeWidth=".8" />
          </svg>
        ))}
        <div className="gx-hc-foil gx-sg-foil absolute inset-0" />
        <div className="gx-hc-glare absolute inset-0" />
        {!art && (
          <button
            type="button"
            aria-label={bites >= 3 ? "Grow a new pomegranate" : `Feed the shinigami a pomegranate (bite ${bites + 1} of 3)`}
            onClick={bite}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute left-[60%] top-[68%] h-[13%] w-[19%] cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ffd23a]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_8px_#070103,inset_0_0_0_9px_rgba(200,16,46,.6),inset_0_0_40px_rgba(0,0,0,.8)]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-[#ffd9d9]/70 [transform:translateZ(24px)]">
          <span>死神 · Shinigami</span>
          <span>{serial}</span>
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border border-[#c8102e]/50 bg-black/75 px-3 py-2 backdrop-blur [transform:translateZ(40px)]">
          <h3 className="font-serif text-lg font-black uppercase leading-none tracking-[0.18em] text-[#f3e7cf]">{name}</h3>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#ff4d5e]">{role}</p>
          {stats.length > 0 && (
            <dl className="mt-2 flex justify-between border-t border-white/10 pt-1.5 text-center">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="text-[8px] uppercase tracking-widest text-white/45">{s.label}</dt>
                  <dd className="font-mono text-xs font-bold text-white">{/fruit|pomegranate/i.test(s.label) ? Number(s.value) + bites : s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* ── BACK: the ledger ── */}
      <div className="gx-hc-face gx-hc-back absolute inset-0 overflow-hidden rounded-[22px] border border-[#c8102e]/40 bg-[#0d0b0a] p-3 [transform:rotateY(180deg)]">
        <div
          className="relative h-full rounded-[14px] p-4 text-[#1b1512] shadow-[inset_0_0_30px_rgba(60,30,10,.45)]"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0 21px, rgba(60,40,120,.18) 21px 22px), linear-gradient(90deg, transparent 22px, rgba(200,16,46,.35) 22px 23px, transparent 23px), radial-gradient(ellipse at 30% 20%, #efe3c8, #d8c39c 70%, #b89a6a)",
          }}
        >
          <p className="pl-5 font-serif text-[15px] font-black uppercase tracking-[0.3em] text-[#1b1512]">Ledger of souls</p>
          <ol className="mt-3 space-y-1.5 pl-5 font-serif text-[11px] italic leading-[22px]">
            {RULES.map((r, i) => (
              <li key={i} className="gx-sg-write overflow-hidden whitespace-nowrap" style={{ animationDelay: `${0.4 + i * 0.9}s` }} data-on={flipped}>
                {r}
              </li>
            ))}
          </ol>
          <form
            className="absolute inset-x-4 bottom-4 pl-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSigned(draft.trim().slice(0, 22));
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {signed ? (
              <p key={signed} className="gx-sg-ink font-serif text-2xl italic text-[#120a08]">
                {signed}
              </p>
            ) : (
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#5a4632]">Sign the ledger</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={22}
                  placeholder="your name…"
                  className="mt-1 w-full border-b border-[#5a4632]/60 bg-transparent font-serif text-lg italic text-[#120a08] outline-none placeholder:text-[#5a4632]/50"
                />
              </label>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export function HoloCard({
  name,
  role,
  avatar,
  handle,
  stats = [],
  serial = "No. 001",
  accent = "#4ade80",
  maxTilt = 14,
  rarity = "rare",
  bio,
  skills = [],
  ability,
  flippable = true,
  edition = "holo",
  art,
  animated = true,
  className = "",
}: HoloCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const [flipped, setFlipped] = React.useState(false);
  const reduced = React.useRef(false);
  const R = RARITY[rarity] ?? RARITY.rare;
  const gold = rarity === "legendary" ? "#f5c451" : accent;

  React.useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const setVars = (px: number, py: number, o: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", String(px * 100));
    el.style.setProperty("--my", String(py * 100));
    el.style.setProperty("--rx", `${(px - 0.5) * 2 * maxTilt}deg`);
    el.style.setProperty("--ry", `${(0.5 - py) * 2 * maxTilt}deg`);
    el.style.setProperty("--o", String(o));
  };

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setActive(true);
    setVars(px, py, 1);
  };
  const reset = () => {
    setActive(false);
    setVars(0.5, 0.5, 0);
  };

  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bars = React.useMemo(() => barcode(name + serial), [name, serial]);

  return (
    <div
      ref={ref}
      className={`gx-hc relative w-full max-w-[290px] [perspective:900px] ${className}`}
      data-active={active}
      data-animated={animated}
      data-rarity={rarity}
      data-edition={edition}
      data-flipped={flipped}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <style>{css}</style>
      <article
        tabIndex={0}
        role={flippable ? "button" : undefined}
        aria-pressed={flippable ? flipped : undefined}
        aria-label={`${name}, ${role}${handle ? `, ${handle}` : ""}. ${edition === "shinigami" ? "Shinigami" : R.label} card.${flippable ? " Press to flip." : ""}`}
        onClick={() => flippable && setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (flippable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        onFocus={() => !reduced.current && setVars(0.68, 0.3, 0.7)}
        onBlur={reset}
        className={`gx-hc-card relative aspect-[5/7] w-full touch-none rounded-[22px] outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-black ${flippable ? "cursor-pointer" : ""}`}
      >
        {/* rarity frame */}
        <div aria-hidden className="absolute -inset-[3px] overflow-hidden rounded-[25px]">
          <div className="gx-hc-ring absolute -inset-1/2" style={{ background: edition === "shinigami" ? SHINIGAMI_FRAME : R.frame }} />
        </div>

        <div className="gx-hc-flip absolute inset-0 [transform-style:preserve-3d]">
          {edition === "shinigami" ? (
            <ShinigamiFaces name={name} role={role} serial={serial} stats={stats} art={art} flipped={flipped} />
          ) : (
          <>
          {/* ── FRONT ── */}
          <div className="gx-hc-face gx-hc-front absolute inset-0 [transform-style:preserve-3d]">
            <Surface accent={accent} rarity={rarity} />
            {rarity === "legendary" &&
              SPARKS.map((s, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="gx-hc-spark pointer-events-none absolute text-[#fff3c4] [text-shadow:0_0_8px_#ffd36b]"
                  style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, "--t": s.t, "--d": s.d } as React.CSSProperties}
                >
                  ✦
                </span>
              ))}

            <div className="relative flex h-full flex-col p-5 [transform-style:preserve-3d]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 [transform:translateZ(20px)]">
                <span>{R.label}</span>
                <span>{serial}</span>
              </div>

              <div className="mx-auto mt-6 [transform:translateZ(60px)]">
                <div className="relative h-28 w-28 rounded-full p-[3px]" style={{ background: `conic-gradient(from 210deg, ${gold}, #fff, ${gold}, #222, ${gold})` }}>
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" draggable={false} />
                  ) : (
                    <div className="grid h-full w-full place-items-center rounded-full bg-neutral-900 text-3xl font-black text-white">{initials}</div>
                  )}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 -right-1 grid h-8 min-w-8 place-items-center rounded-full border-2 border-[#0c0d10] px-1 text-[10px] font-black text-black"
                    style={{ background: gold }}
                  >
                    {R.gems}
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center [transform:translateZ(40px)]">
                <h3 className="text-xl font-black tracking-tight text-white">{name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: gold }}>
                  {role}
                </p>
              </div>

              {stats.length > 0 && (
                <dl className="mt-auto grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/40 p-2 text-center backdrop-blur [transform:translateZ(30px)]">
                  {stats.slice(0, 3).map((s) => (
                    <div key={s.label} className="flex flex-col-reverse">
                      <dt className="text-[9px] uppercase tracking-widest text-white/50">{s.label}</dt>
                      <dd className="text-sm font-black text-white">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <p className="mt-3 flex items-center justify-between font-mono text-[10px] text-white/45 [transform:translateZ(16px)]">
                <span>{handle}</span>
                {flippable && <span className="text-white/35">tap to flip ↻</span>}
              </p>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="gx-hc-face gx-hc-back absolute inset-0 [transform-style:preserve-3d] [transform:rotateY(180deg)]">
            <Surface accent={accent} rarity={rarity} />
            <div className="relative flex h-full flex-col p-5 [transform-style:preserve-3d]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 [transform:translateZ(20px)]">
                <span>Profile</span>
                <span style={{ color: gold }}>{R.gems}</span>
              </div>
              <h3 className="mt-3 text-lg font-black leading-tight text-white [transform:translateZ(30px)]">{name}</h3>
              {bio && <p className="mt-2 text-[12px] leading-relaxed text-white/65 [transform:translateZ(24px)]">{bio}</p>}

              {skills.length > 0 && (
                <ul className="mt-4 space-y-2 [transform:translateZ(34px)]">
                  {skills.slice(0, 4).map((s) => (
                    <li key={s.label}>
                      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-white/60">
                        <span>{s.label}</span>
                        <span className="font-mono text-white/80">{s.level}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-[width] delay-300 duration-700"
                          style={{ width: flipped ? `${Math.max(0, Math.min(100, s.level))}%` : "0%", background: `linear-gradient(90deg, ${gold}, #fff)` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {ability && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-2.5 [transform:translateZ(28px)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: gold }}>
                    ⚡ {ability.name}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-white/65">{ability.text}</p>
                </div>
              )}

              <div className="mt-auto flex items-end justify-between [transform:translateZ(16px)]">
                <div aria-hidden className="flex h-7 items-stretch gap-[1.5px] opacity-80">
                  {bars.map((w, i) => (
                    <span key={i} className="bg-white" style={{ width: w * 0.8, opacity: i % 3 ? 0.9 : 0.5 }} />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-white/40">{serial}</span>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </article>
    </div>
  );
}

export default HoloCard;
