"use client";

import * as React from "react";
import { tabTricks, type TabFace, type TabSnapshot, type TabTricksHandle } from "../library/tab-tricks";

const ACCENT = "#4ade80";
const FACES: TabFace[] = ["eyes", "sleepy", "crying", "wave"];
const USES = [
  ["Chat apps", "unread badge"],
  ["Uploads & exports", "progress ring → ✓"],
  ["Editors", "unsaved dot + guard"],
  ["Pomodoro & auctions", "live mm:ss"],
  ["Screen recorders", "red pulse"],
  ["Dashboards", "away summary"],
];

function Btn({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
          : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function TabStrip({ snap }: { snap: TabSnapshot }) {
  return (
    <div className="flex items-end gap-1 border-b border-white/10 bg-[#1b1b1f] px-3 pt-2">
      <div className="flex w-64 min-w-0 items-center gap-2 rounded-t-lg bg-[#0d0d10] px-3 py-2 text-xs text-white/90">
        {snap.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={snap.icon} alt="" width={16} height={16} className="h-4 w-4 shrink-0 rounded-sm" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-sm bg-white/20" />
        )}
        <span className="truncate" aria-live="polite">
          {snap.title || "Untitled"}
        </span>
      </div>
      <div className="hidden w-36 items-center gap-2 rounded-t-lg px-3 py-2 text-xs text-white/35 sm:flex">
        <span className="h-4 w-4 rounded-sm bg-white/10" /> Other tab
      </div>
    </div>
  );
}

function Shell({ snap, children }: { snap: TabSnapshot; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] shadow-2xl shadow-black/40">
      <TabStrip snap={snap} />
      {children}
    </div>
  );
}

function useTab(mode: "fun" | "useful", face: TabFace) {
  const [snap, setSnap] = React.useState<TabSnapshot>({
    title: "",
    icon: "",
    away: false,
  });
  const handle = React.useRef<TabTricksHandle | null>(null);
  React.useEffect(() => {
    const inst = tabTricks({ mode, face, accent: ACCENT, onChange: setSnap });
    handle.current = inst;
    setSnap(inst.snapshot());
    return () => {
      inst.destroy();
      handle.current = null;
    };
  }, [mode, face]);
  return { snap, handle };
}

function FunPanel() {
  const [face, setFace] = React.useState<TabFace>("eyes");
  const { snap, handle } = useTab("fun", face);
  return (
    <Shell snap={snap}>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handle.current?.simulate(6000)}
            disabled={snap.away}
            className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition-opacity disabled:opacity-60"
          >
            {snap.away ? "Away… (6 s)" : "Simulate leaving"}
          </button>
          <span className="text-xs text-white/50">or switch tabs for real 👀</span>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">Away face</p>
          <div className="flex flex-wrap gap-2">
            {FACES.map((f) => (
              <Btn key={f} active={face === f} onClick={() => setFace(f)}>
                {f}
              </Btn>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-white/50">
          While you&apos;re away the real tab title cycles playful lines and the favicon comes alive. Stay away long enough and it dozes
          off. Come back for a toast, a happy bounce and “Yay! 🎉”.
        </p>
      </div>
    </Shell>
  );
}

function UsefulPanel() {
  const { snap, handle } = useTab("useful", "eyes");
  const [badge, setBadge] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [unsaved, setUnsaved] = React.useState(false);
  const [timer, setTimer] = React.useState(false);
  const [rec, setRec] = React.useState(false);
  const uploadRef = React.useRef(0);

  React.useEffect(() => () => window.clearInterval(uploadRef.current), []);

  const setB = (n: number) => {
    setBadge(n);
    handle.current?.badge(n);
  };
  const upload = () => {
    if (uploading) return;
    setUploading(true);
    let p = 0;
    handle.current?.progress(0);
    uploadRef.current = window.setInterval(() => {
      p = Math.min(1, p + 0.04 + Math.random() * 0.04);
      handle.current?.progress(p);
      if (p >= 1) {
        window.clearInterval(uploadRef.current);
        handle.current?.done("upload finished");
        setUploading(false);
      }
    }, 180);
  };

  return (
    <Shell snap={snap}>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => setB(badge + 1)}>Badge +1</Btn>
          <Btn onClick={() => setB(0)}>Clear</Btn>
          <Btn active={uploading} onClick={upload}>
            {uploading ? "Uploading…" : "Fake upload"}
          </Btn>
          <Btn
            active={unsaved}
            onClick={() => {
              setUnsaved(!unsaved);
              handle.current?.unsaved(!unsaved);
            }}
          >
            Unsaved
          </Btn>
          <Btn
            active={timer}
            onClick={() => {
              setTimer(!timer);
              handle.current?.countdown(timer ? null : Date.now() + 25 * 60_000, "Focus");
            }}
          >
            {timer ? "Stop 25:00" : "Start 25:00"}
          </Btn>
          <Btn
            active={rec}
            onClick={() => {
              setRec(!rec);
              handle.current?.recording(!rec);
            }}
          >
            Recording
          </Btn>
          <Btn
            onClick={() => {
              handle.current?.notify();
              setB(badge + 1);
            }}
          >
            notify()
          </Btn>
        </div>
        <p className="text-[11px] text-white/45">
          Watch the mock tab above <span className="text-white/70">and</span> your real one. Hidden for 1 min+? You get “You were away 12
          min · 3 updates”.
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/10 pt-3 text-[11px]">
          {USES.map(([what, how]) => (
            <li key={what} className="flex min-w-0 items-baseline gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
              <span className="truncate text-white/75">{what}</span>
              <span className="truncate text-white/35">· {how}</span>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}

export default function TabTricksDemo({ variant = "fun" }: { variant?: string }) {
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,#1a2a22,transparent_60%)] p-4">
      {variant === "useful" ? <UsefulPanel /> : <FunPanel />}
    </div>
  );
}
