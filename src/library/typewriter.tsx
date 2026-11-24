"use client";

import * as React from "react";

/**
 * Typewriter — a 1920s typewriter you actually type on. Each key strike
 * slams the type bar, the carriage shifts left one character, ink density
 * varies per letter, and near the margin a bell rings (Web Audio, no files);
 * Enter throws the carriage back with a ratchet sound.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type TypewriterProps = {
  /** Text already on the page. */
  initial?: string;
  /** Characters per line (default 34). */
  cols?: number;
  /** Synthesized sounds (default true). */
  sound?: boolean;
  /** false = no carriage motion / strike (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

let ac: AudioContext | null = null;
function noise(ms: number, freq: number, gain: number) {
  try {
    ac ??= new AudioContext();
    const len = Math.floor((ac.sampleRate * ms) / 1000);
    const b = ac.createBuffer(1, len, ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    const s = ac.createBufferSource();
    s.buffer = b;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = gain;
    s.connect(f).connect(g).connect(ac.destination);
    s.start();
  } catch {}
}
function bell() {
  try {
    ac ??= new AudioContext();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = 2400;
    g.gain.setValueAtTime(0.25, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.2);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 1.2);
  } catch {}
}

export function Typewriter({
  initial = "Dear reader,\nType here. Hit Enter for a new line.",
  cols = 34,
  sound = true,
  animated = true,
  className = "",
}: TypewriterProps) {
  const [text, setText] = React.useState(initial);
  const [strike, setStrike] = React.useState(0);
  const area = React.useRef<HTMLTextAreaElement>(null);
  const lines = text.split("\n");
  const col = lines[lines.length - 1].length;
  const CH = 11.2; // px per char at 18px mono

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      setText((t) => t + "\n");
      if (sound) noise(260, 600, 0.5);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setText((t) => t.slice(0, -1));
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      if (col >= cols) {
        if (sound) bell();
        return;
      }
      setText((t) => t + e.key);
      setStrike((s) => s + 1);
      if (sound) noise(40, 1800 + Math.random() * 600, 0.6);
      if (sound && col === cols - 6) bell();
    }
  };

  return (
    <div className={`w-full max-w-xl select-none ${className}`} onClick={() => area.current?.focus()}>
      {/* paper on the carriage */}
      <div className="relative mx-auto h-64 overflow-hidden">
        <div
          className="absolute top-0 w-[420px] rounded-sm bg-[#f6f0e1] px-8 pb-6 pt-6 shadow-[0_10px_30px_rgba(0,0,0,.5)]"
          style={{
            left: animated ? `calc(50% - ${col * CH}px - 32px)` : "50%",
            transform: animated ? undefined : "translateX(-50%)",
            transition: animated ? (col === 0 ? "left .45s cubic-bezier(.3,1.3,.5,1)" : "left .06s steps(1)") : undefined,
            backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgba(80,60,30,.08) 27px 28px)",
          }}
        >
          <div className="font-mono text-[18px] leading-[28px] text-[#1d1a16]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            {lines.map((ln, i) => (
              <div key={i} className="h-[28px] whitespace-pre">
                {[...ln].map((ch, j) => (
                  <span key={j} style={{ opacity: 0.72 + (((i * 31 + j * 17) % 9) / 9) * 0.28, filter: (i + j) % 7 === 0 ? "blur(.3px)" : undefined }}>
                    {ch}
                  </span>
                ))}
                {i === lines.length - 1 && <span className="inline-block h-[20px] w-[2px] translate-y-1 animate-pulse bg-red-700/70" />}
              </div>
            ))}
          </div>
        </div>
        {/* platen + type guide */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#0b0b0c]" />
      </div>

      <div className="relative mx-auto -mt-2 h-16 w-[92%] rounded-t-3xl bg-gradient-to-b from-[#2b2b2e] to-[#141416] shadow-[inset_0_2px_0_rgba(255,255,255,.08)]">
        <div className="absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 rounded-b-md bg-[#c9a227]/80" />
        {/* type bar */}
        <div
          key={strike}
          className="absolute left-1/2 top-2 h-12 w-1 origin-bottom -translate-x-1/2 rounded bg-neutral-400 motion-reduce:hidden"
          style={{ animation: animated && strike ? "gx-tw-strike .12s ease-out" : undefined, opacity: 0 }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-[#c9a227]/80">PICKUI · No. 5</div>
      </div>
      <style>{`@keyframes gx-tw-strike{0%{opacity:1;transform:translateX(-50%) rotate(-70deg)}60%{opacity:1;transform:translateX(-50%) rotate(0)}100%{opacity:0;transform:translateX(-50%) rotate(-70deg)}}`}</style>

      <textarea
        ref={area}
        value={text}
        onChange={() => {}}
        onKeyDown={onKeyDown}
        aria-label="Typewriter page"
        className="absolute h-px w-px opacity-0"
        spellCheck={false}
      />
      <p className="mt-3 text-center font-mono text-[11px] text-white/45">
        click and type · {cols - col} spaces to the margin {col >= cols - 6 && "· ding!"}
      </p>
    </div>
  );
}

export default Typewriter;
