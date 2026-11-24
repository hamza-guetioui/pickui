"use client";

import * as React from "react";

/**
 * MorseTelegraph — a brass telegraph key. Tap it (mouse, touch or Space):
 * short = dit, long = dah. A sounder beeps, a paper tape records the marks,
 * and a decoder turns them into letters live. Or type a message and let the
 * machine transmit it.
 * Zero dependencies · React + Tailwind · Web Audio for the tone.
 */

export type MorseTelegraphProps = {
  /** ms threshold between dit and dah (default 180). */
  dah?: number;
  /** Tone frequency (default 640 Hz). */
  tone?: number;
  sound?: boolean;
  /** false = no key travel / tape scroll (the "regular" version). Default true. */
  animated?: boolean;
  className?: string;
};

const CODE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--",
  N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
};
const DECODE = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));

let ac: AudioContext | null = null;
let osc: OscillatorNode | null = null;
function toneOn(f: number) {
  try {
    ac ??= new AudioContext();
    osc = ac.createOscillator();
    const g = ac.createGain();
    g.gain.value = 0.12;
    osc.frequency.value = f;
    osc.connect(g).connect(ac.destination);
    osc.start();
  } catch {}
}
function toneOff() {
  try {
    osc?.stop();
  } catch {}
  osc = null;
}

export function MorseTelegraph({ dah = 180, tone = 640, sound = true, animated = true, className = "" }: MorseTelegraphProps) {
  const [down, setDown] = React.useState(false);
  const [tape, setTape] = React.useState<string>("");
  const [cur, setCur] = React.useState("");
  const [text, setText] = React.useState("");
  const [msg, setMsg] = React.useState("SOS");
  const t0 = React.useRef(0);
  const gap = React.useRef(0);
  const sending = React.useRef(false);

  const curRef = React.useRef("");
  const commit = React.useCallback(() => {
    const c = curRef.current;
    if (c) setText((t) => (t + (DECODE[c] ?? "?")).slice(-28));
    curRef.current = "";
    setCur("");
  }, []);

  const press = () => {
    if (down) return;
    window.clearTimeout(gap.current);
    setDown(true);
    t0.current = performance.now();
    if (sound) toneOn(tone);
  };
  const release = () => {
    if (!down) return;
    setDown(false);
    toneOff();
    const sym = performance.now() - t0.current < dah ? "." : "-";
    curRef.current += sym;
    setCur(curRef.current);
    setTape((t) => (t + sym).slice(-60));
    gap.current = window.setTimeout(() => {
      commit();
      gap.current = window.setTimeout(() => {
        setText((t) => (t.endsWith(" ") || !t ? t : t + " "));
        setTape((t) => t + " ");
      }, dah * 4);
    }, dah * 3);
  };

  const transmit = async () => {
    if (sending.current) return;
    sending.current = true;
    const unit = dah * 0.5;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    for (const ch of msg.toUpperCase()) {
      if (ch === " ") {
        setTape((t) => t + " ");
        setText((t) => t + " ");
        await wait(unit * 7);
        continue;
      }
      const code = CODE[ch];
      if (!code) continue;
      for (const s of code) {
        setDown(true);
        if (sound) toneOn(tone);
        await wait(s === "." ? unit : unit * 3);
        toneOff();
        setDown(false);
        setTape((t) => (t + s).slice(-60));
        await wait(unit);
      }
      setText((t) => (t + ch).slice(-28));
      setTape((t) => t + " ");
      await wait(unit * 3);
    }
    sending.current = false;
  };

  return (
    <div className={`flex w-full max-w-md flex-col items-center gap-4 ${className}`}>
      {/* paper tape */}
      <div className="relative h-12 w-full overflow-hidden rounded bg-[#efe6cf] shadow-inner" aria-hidden>
        <div className="absolute inset-y-0 right-3 flex items-center gap-[3px] whitespace-nowrap" style={{ transition: animated ? "transform .2s" : undefined }}>
          {[...tape].map((s, i) => (
            <span key={i} className={s === "." ? "h-2 w-2 rounded-full bg-[#2b2118]" : s === "-" ? "h-2 w-6 rounded-full bg-[#2b2118]" : "w-3"} />
          ))}
        </div>
      </div>
      <output aria-live="polite" className="min-h-[2.2rem] w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-lg tracking-[0.25em] text-amber-200">
        {text}
        <span className="text-amber-200/40">{cur}</span>
      </output>

      {/* the key */}
      <button
        type="button"
        aria-label="Telegraph key: tap short for dit, hold for dah"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          press();
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (e.key === " " && !e.repeat) {
            e.preventDefault();
            press();
          }
        }}
        onKeyUp={(e) => e.key === " " && release()}
        className="relative h-28 w-72 touch-none select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
      >
        <span className="absolute inset-x-0 bottom-0 h-8 rounded-xl bg-gradient-to-b from-[#5a3a22] to-[#2c1b0f] shadow-[0_12px_20px_-6px_rgba(0,0,0,.8)]" />
        <span
          className="absolute bottom-8 left-8 right-14 h-3 origin-left rounded-full bg-gradient-to-b from-[#f0c76a] to-[#9c7426] shadow"
          style={{ transform: `rotate(${down ? 3.5 : 0}deg)`, transition: animated ? "transform .05s" : undefined }}
        />
        <span
          className="absolute bottom-[34px] right-8 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_40%_30%,#3a3a3a,#0d0d0d)] shadow-[0_6px_10px_rgba(0,0,0,.7)]"
          style={{ transform: `translateY(${down ? 8 : 0}px)`, transition: animated ? "transform .05s" : undefined }}
        />
        <span className="absolute bottom-[30px] left-6 h-6 w-6 rounded-full bg-gradient-to-b from-[#f0c76a] to-[#9c7426]" />
        <span className={`absolute bottom-2 right-3 h-2 w-2 rounded-full ${down ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-red-950"}`} />
      </button>

      <div className="flex w-full gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value.replace(/[^a-z0-9 ]/gi, "").slice(0, 24))}
          aria-label="Message to transmit"
          className="h-9 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 font-mono text-sm uppercase text-white outline-none focus:border-white/30"
        />
        <button type="button" onClick={transmit} className="rounded-lg bg-amber-300 px-3 text-sm font-semibold text-black hover:bg-amber-200">
          Transmit
        </button>
        <button type="button" onClick={() => {
            setText("");
            setTape("");
            curRef.current = "";
            setCur("");
          }} className="rounded-lg border border-white/10 px-3 text-sm text-white/70 hover:text-white">
          Clear
        </button>
      </div>
    </div>
  );
}

export default MorseTelegraph;
