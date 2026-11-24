"use client";

import * as React from "react";

/**
 * ScrollJellyfish — a translucent 3D jellyfish that swims through your content
 * as you scroll. The bell is ray-traced (front + inner surface, fresnel gel,
 * 16 lappets, ribs and stinging warts); tentacles and frilly oral arms are a
 * verlet-physics simulation, so they trail, stretch and sway naturally.
 * Scrolling makes it pulse faster and swim; it drifts calmly when you stop.
 * One WebGL2 shader, no textures, no three.js.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type JellyTheme = "pelagia" | "moon" | "abyss";

export type JellySection = { word: string; caption?: string };

export type ScrollJellyfishProps = {
  sections?: JellySection[];
  /** Pelagia (pink, light), Moon jelly (ocean blue) or Abyss (bioluminescent). */
  theme?: JellyTheme;
  /** "contained" = scrolls inside its own box. "page" = window scroll, sticky scene. */
  mode?: "contained" | "page";
  /** false = no idle swimming / pulsing. Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT_SECTIONS: JellySection[] = [
  { word: "DRIFT", caption: "Scroll — it swims with you." },
  { word: "INSPIRE", caption: "Every tentacle is simulated." },
  { word: "DESIGN TO", caption: "Ray-traced, translucent bell." },
  { word: "FEEL ALIVE", caption: "Your story here." },
];

const NS = 12; // 8 marginal tentacles + 4 oral arms
const NP = 24; // points per strand

const VERT = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes,uPos;uniform float uTime,uPulse,uS,uAng,uPitch;uniform vec4 uBox;uniform int uTheme,uFront;
uniform vec4 uP[${(NS * NP) / 2}];
out vec4 o;
#define N ${NP}
float px;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 P(int i){vec4 v=uP[i>>1];return (i&1)==0?v.xy:v.zw;}
vec4 over(vec4 d,vec4 s){return s+d*(1.-s.a);}
vec4 strand(vec2 p,int s,float w0,float w1,float frill,vec3 c0,vec3 c1){
 float best=1e9,bs=0.,bd=0.,bw=1.;
 for(int k=0;k<N-1;k++){
  vec2 a=P(s*N+k),b=P(s*N+k+1),pa=p-a,ba=b-a;
  float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-10),0.,1.);
  float d=length(pa-ba*h);
  float sp=(float(k)+h)/float(N-1);
  float w=mix(w0,w1,sqrt(sp));
  if(frill>0.)w*=1.+frill*sin(sp*70.-uTime*1.3+float(s))*(.55+.45*sin(sp*17.+float(s)*2.));
  w=max(w,px*.55);
  float sd=d-w;
  if(sd<best){best=sd;bs=sp;bd=d;bw=w;}
 }
 float cov=1.-smoothstep(-px*.7,px*.7,best);
 if(cov<=0.)return vec4(0);
 float core=1.-clamp(bd/bw,0.,1.);
 vec3 c=mix(c0,c1,bs)*(.75+.35*core);
 float a=cov*(.3+.6*core)*mix(.95,.3,bs*bs);
 return vec4(c*a,a);
}
vec3 toBell(vec3 v){float c=cos(uPitch),s=sin(uPitch);return vec3(v.x,c*v.y-s*v.z,s*v.y+c*v.z);}
float cutAt(float th){return -.06*uS-.04*uS*sqrt(abs(sin(th*8.)))*(1.+.6*uPulse);}
vec4 shade(vec3 P,vec3 Nn,vec3 V,float cut,float a,float b,bool inner){
 float th=atan(P.z,P.x);
 float v=clamp((P.y-cut)/(b-cut),0.,1.);
 float fr=pow(1.-abs(dot(Nn,V)),2.);
 float rib=pow(abs(cos(th*8.)),8.);
 vec2 g=vec2(th*2.546,v*9.),id=floor(g),f=fract(g)-.5;
 float spot=(1.-smoothstep(.08,.22,length(f-(vec2(h21(id),h21(id+7.))-.5)*.45)))*step(.4,h21(id+3.))*(1.-v*.6);
 float rim=1.-smoothstep(.02,.15,v);
 vec3 L=normalize(vec3(-.35,.85,-.4));
 float spec=pow(max(dot(Nn,normalize(L+V)),0.),90.);
 vec3 c;float al;
 if(uTheme==0){
  c=mix(vec3(.98,.6,.9),vec3(.58,.1,.45),clamp(.45*rib+.75*spot+.8*rim,0.,1.));
  c=mix(c,vec3(1.,.86,.97),fr*.35);
  al=.2+.45*fr+.4*spot+.45*rim+.12*rib;
 }else if(uTheme==1){
  vec2 q=P.xz/a;float ring=0.;
  for(int k=0;k<4;k++){float an=float(k)*1.5708+.785;vec2 cc=.36*vec2(cos(an),sin(an));
   ring=max(ring,1.-smoothstep(.03,.06,abs(length(q-cc)-.15)));}
  ring*=smoothstep(.3,.55,v);
  c=mix(vec3(.85,.93,1.),vec3(.78,.5,.98),ring);
  al=.07+.38*fr+.5*ring+.25*rim+.05*rib;
 }else{
  float wave=.5+.5*sin(uTime*2.6-v*11.+th*2.);
  c=vec3(.06,.03,.16)+(rib*.9*wave+rim*1.3)*mix(vec3(.25,.95,1.),vec3(.7,.35,1.),v);
  al=.14+.4*fr+.45*rim+.25*rib*wave;
 }
 if(inner){al*=.3+.25*(1.-rim);c*=.72;}else{c+=spec*.35;al+=spec*.25;}
 al=clamp(al,0.,.95);
 return vec4(c*al,al);
}
void main(){
 px=1./uRes.y;
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 if(uv.x<uBox.x||uv.y<uBox.y||uv.x>uBox.z||uv.y>uBox.w){o=vec4(0);return;}
 float k=uS/.17;
 vec3 t0,t1,a0,a1;float tw,aw,fr;
 if(uTheme==0){t0=vec3(.88,.45,.78);t1=vec3(.97,.78,.94);a0=vec3(.96,.55,.86);a1=vec3(.72,.22,.6);tw=.0028;aw=.013;fr=.6;}
 else if(uTheme==1){t0=vec3(.9,.95,1.);t1=vec3(.8,.9,1.);a0=vec3(.86,.9,1.);a1=vec3(.75,.6,.98);tw=.0014;aw=.009;fr=.45;}
 else{t0=vec3(.35,.95,1.);t1=vec3(.65,.3,1.);a0=vec3(.6,.4,1.);a1=vec3(.25,.9,1.);tw=.0024;aw=.011;fr=.5;}
 vec4 acc=vec4(0);
 for(int s=0;s<8;s++)if(((uFront>>s)&1)==0)acc=over(acc,strand(uv,s,tw*k,tw*.3*k,0.,t0,t1));
 float a=uS*(1.-.17*uPulse),b=uS*(.82+.2*uPulse);
 vec2 d=uv-uPos;float ca=cos(uAng),sa=sin(uAng);
 vec2 l=vec2(ca*d.x+sa*d.y,-sa*d.x+ca*d.y);
 vec3 ro=toBell(vec3(l,-2.)),rd=toBell(vec3(0,0,1)),sc=vec3(a,b,a);
 vec3 o2=ro/sc,d2=rd/sc;
 float A=dot(d2,d2),B=dot(o2,d2),C=dot(o2,o2)-1.,disc=B*B-A*C;
 vec4 fs=vec4(0),bs=vec4(0);
 if(disc>0.){
  float sq=sqrt(disc),chord=2.*sq/A;
  float edge=clamp(chord*chord/(8.*min(a,b)*px*1.5),0.,1.);
  vec3 V=-rd;
  vec3 P1=ro+rd*((-B-sq)/A),P2=ro+rd*((-B+sq)/A);
  float c1=cutAt(atan(P1.z,P1.x)),c2=cutAt(atan(P2.z,P2.x));
  vec3 N1=normalize(P1/(sc*sc)),N2=normalize(P2/(sc*sc));
  fs=shade(P1,N1,V,c1,a,b,false)*clamp((P1.y-c1)/(px*1.5),0.,1.)*edge;
  bs=shade(P2,-N2,V,c2,a,b,true)*clamp((P2.y-c2)/(px*1.5),0.,1.)*edge;
 }
 acc=over(acc,bs);
 for(int s=8;s<12;s++)acc=over(acc,strand(uv,s,aw*k,aw*.35*k,fr,a0,a1));
 for(int s=0;s<8;s++)if(((uFront>>s)&1)==1)acc=over(acc,strand(uv,s,tw*k,tw*.3*k,0.,t0,t1));
 acc=over(acc,fs);
 if(uTheme==2){float gl=exp(-max(length(l/vec2(a,b))-.9,0.)*5.)*.22*(.7+.3*sin(uTime*2.6));acc.rgb+=vec3(.3,.7,1.)*gl;acc.a=max(acc.a,gl*.3);}
 acc.rgb+=(h21(gl_FragCoord.xy+uTime)-.5)/255.*acc.a;
 o=acc;
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

const THEME: Record<JellyTheme, { id: number; len: [number, number]; bg: string; ink: string; sub: string }> = {
  pelagia: { id: 0, len: [4.4, 3.1], bg: "radial-gradient(ellipse at 50% 40%,#f4f3f6,#dcdbe1)", ink: "text-neutral-950", sub: "text-neutral-600" },
  moon: { id: 1, len: [1.3, 1.5], bg: "radial-gradient(ellipse at 50% 0%,#1b7aa6,#06304d 55%,#020f1c)", ink: "text-white/90", sub: "text-sky-100/70" },
  abyss: { id: 2, len: [3.8, 2.3], bg: "radial-gradient(ellipse at 50% 30%,#0b0a22,#020208 70%)", ink: "text-white/85", sub: "text-violet-200/60" },
};


/* ── Backdrops: each theme gets a setting that gives the scene meaning ── */

const DEPTH: Record<JellyTheme, [number, number] | null> = { pelagia: null, moon: [4, 62], abyss: [1000, 4000] };

const bgCss = `
.gx-jf-ray{animation:gx-jf-sway var(--t) ease-in-out var(--d) infinite alternate;transform-origin:top}
@keyframes gx-jf-sway{from{transform:skewX(-14deg) translateX(-10px)}to{transform:skewX(-6deg) translateX(14px)}}
.gx-jf-caustic{animation:gx-jf-caustic 9s linear infinite}
@keyframes gx-jf-caustic{to{background-position:180px 120px,-140px 90px}}
.gx-jf-bubble{animation:gx-jf-rise var(--t) linear var(--d) infinite}
@keyframes gx-jf-rise{from{transform:translate(0,0)}50%{transform:translate(var(--w),-55cqh)}to{transform:translate(0,-115cqh)}}
.gx-jf-snow{animation:gx-jf-snow var(--t) linear var(--d) infinite}
@keyframes gx-jf-snow{from{transform:translate(0,-10cqh)}to{transform:translate(var(--w),110cqh)}}
.gx-jf-spark{animation:gx-jf-spark var(--t) ease-in-out var(--d) infinite}
@keyframes gx-jf-spark{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
.gx-jf-ping{animation:gx-jf-ping 4.5s cubic-bezier(.2,.6,.3,1) infinite}
@keyframes gx-jf-ping{from{transform:translate(-50%,-50%) scale(.05);opacity:.7}to{transform:translate(-50%,-50%) scale(1);opacity:0}}
.gx-jf-rec{animation:gx-jf-rec 1.2s steps(2,end) infinite}
@keyframes gx-jf-rec{50%{opacity:0}}
.gx-jf-still *{animation:none!important}
@media (prefers-reduced-motion:reduce){.gx-jf-bg *{animation:none!important}}
`;

const dots = (n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => {
    const k = (i + 1) * 9301 + seed * 49297;
    return {
      x: (k * 7) % 100,
      y: (k * 13) % 100,
      s: 1 + ((k >> 3) % 4),
      t: `${8 + ((k >> 2) % 9)}s`,
      d: `${-((k >> 1) % 17)}s`,
      w: `${((k >> 4) % 60) - 30}px`,
    };
  });
const BUBBLES = dots(14, 1);
const SNOW = dots(46, 2);
const SPARKS = dots(12, 3);

function Gauge({ theme, depthRef, light }: { theme: JellyTheme; depthRef: React.RefObject<HTMLSpanElement | null>; light: boolean }) {
  const range = DEPTH[theme];
  if (!range) return null;
  return (
    <div className={`absolute right-4 top-1/2 flex h-[62%] -translate-y-1/2 items-stretch gap-2 font-mono text-[10px] ${light ? "text-sky-100/70" : "text-cyan-200/70"}`}>
      <div className="flex flex-col items-end justify-between py-1">
        <span ref={depthRef} className="text-[11px] font-bold tabular-nums tracking-wider text-white">
          −{range[0]} m
        </span>
        <span className="opacity-60">−{range[1]} m</span>
      </div>
      <div className="relative w-3 border-l border-current/40" style={{ background: "repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 10px)", opacity: 0.6 }}>
        <span className="absolute -left-1 h-[2px] w-4 bg-white shadow-[0_0_8px_#fff]" style={{ top: "calc(var(--p, 0) * 100%)" }} />
      </div>
    </div>
  );
}

function Backdrop({ theme, depthRef, zoneRef }: { theme: JellyTheme; depthRef: React.RefObject<HTMLSpanElement | null>; zoneRef: React.RefObject<HTMLSpanElement | null> }) {
  if (theme === "pelagia") {
    return (
      <div aria-hidden className="gx-jf-bg pointer-events-none absolute inset-0 overflow-hidden text-neutral-500">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 50% at 50% calc(30% + var(--p, 0) * 40%), rgba(236,72,153,.16), transparent 70%)" }} />
        {["left-4 top-4", "right-4 top-4", "left-4 bottom-4", "right-4 bottom-4"].map((c) => (
          <svg key={c} viewBox="0 0 20 20" className={`absolute h-5 w-5 ${c}`}>
            <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth=".8" />
            <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth=".8" />
          </svg>
        ))}
        <p className="absolute left-12 top-5 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">Field notes · Nº 07</p>
        <p className="absolute right-12 top-4 text-right font-serif text-sm italic text-neutral-800">
          Pelagia noctiluca
          <span className="block font-mono text-[9px] not-italic uppercase tracking-[0.25em] text-neutral-500">the mauve stinger</span>
        </p>
        <p className="absolute bottom-5 right-12 font-mono text-[10px] tracking-widest text-neutral-600">36.1°N · 5.3°W · −12 m</p>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center font-mono text-[9px] text-neutral-600">
          <span className="h-1.5 w-16 border-x border-b border-neutral-600" />5 cm
        </div>
        <p className="absolute left-3 top-1/2 origin-left -translate-y-1/2 -rotate-90 font-mono text-[9px] uppercase tracking-[0.45em] text-neutral-500">Specimen — do not touch</p>
      </div>
    );
  }
  if (theme === "moon") {
    return (
      <div aria-hidden className="gx-jf-bg pointer-events-none absolute inset-0 overflow-hidden">
        {[12, 30, 48, 64, 82].map((x, i) => (
          <div
            key={x}
            className="gx-jf-ray absolute -top-10 h-[120%] mix-blend-screen blur-[6px]"
            style={{ left: `${x}%`, width: `${40 + (i % 3) * 30}px`, background: "linear-gradient(180deg, rgba(190,235,255,.35), rgba(190,235,255,0) 75%)", "--t": `${6 + i}s`, "--d": `${-i * 1.3}s` } as React.CSSProperties}
          />
        ))}
        <div
          className="gx-jf-caustic absolute inset-x-0 top-0 h-1/2 opacity-30 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 30px 12px at 50% 50%, rgba(255,255,255,.55), transparent 70%), radial-gradient(ellipse 22px 9px at 50% 50%, rgba(200,240,255,.5), transparent 70%)",
            backgroundSize: "90px 60px, 70px 46px",
            maskImage: "linear-gradient(#000, transparent)",
            WebkitMaskImage: "linear-gradient(#000, transparent)",
          }}
        />
        {SNOW.slice(0, 24).map((d, i) => (
          <span key={i} className="gx-jf-snow absolute rounded-full bg-sky-100/40" style={{ left: `${d.x}%`, width: d.s * 0.8, height: d.s * 0.8, "--t": d.t, "--d": d.d, "--w": d.w } as React.CSSProperties} />
        ))}
        {BUBBLES.map((d, i) => (
          <span
            key={i}
            className="gx-jf-bubble absolute bottom-[-20px] rounded-full border border-white/50 bg-white/10"
            style={{ left: `${d.x}%`, width: 3 + d.s * 2, height: 3 + d.s * 2, "--t": d.t, "--d": d.d, "--w": d.w } as React.CSSProperties}
          />
        ))}
        <div className="absolute inset-0 bg-[#010a14]" style={{ opacity: "calc(var(--p, 0) * .55)" }} />
        <p className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em] text-sky-100/70">
          <span ref={zoneRef}>Sunlight zone</span> · Aurelia aurita
        </p>
        <Gauge theme={theme} depthRef={depthRef} light />
      </div>
    );
  }
  return (
    <div aria-hidden className="gx-jf-bg pointer-events-none absolute inset-0 overflow-hidden">
      {SNOW.map((d, i) => (
        <span key={i} className="gx-jf-snow absolute rounded-full bg-slate-200/30" style={{ left: `${d.x}%`, width: d.s * 0.7, height: d.s * 0.7, "--t": `${14 + (i % 9)}s`, "--d": d.d, "--w": d.w } as React.CSSProperties} />
      ))}
      {SPARKS.map((d, i) => (
        <span
          key={i}
          className="gx-jf-spark absolute rounded-full"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: 3 + d.s, height: 3 + d.s, background: i % 2 ? "#5eead4" : "#a78bfa", boxShadow: `0 0 ${8 + d.s * 3}px ${i % 2 ? "#5eead4" : "#a78bfa"}`, "--t": `${2 + (i % 4)}s`, "--d": d.d } as React.CSSProperties}
        />
      ))}
      <span className="gx-jf-ping absolute left-1/2 top-1/2 aspect-square w-[140%] rounded-full border border-cyan-300/40" />
      <span className="gx-jf-ping absolute left-1/2 top-1/2 aspect-square w-[140%] rounded-full border border-cyan-300/30 [animation-delay:-2.2s]" />
      <div className="absolute inset-0 opacity-[.06]" style={{ background: "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 3px)" }} />
      {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "left-4 bottom-4 border-b border-l", "right-4 bottom-4 border-b border-r"].map((c) => (
        <span key={c} className={`absolute h-6 w-6 border-cyan-200/60 ${c}`} />
      ))}
      <p className="absolute left-12 top-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/80">
        <span className="gx-jf-rec h-2 w-2 rounded-full bg-red-500" /> ROV-2 · cam 01
      </p>
      <p className="absolute bottom-5 left-12 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/70">
        <span ref={zoneRef}>Midnight zone</span> · 2°C · 0 lux
      </p>
      <Gauge theme={theme} depthRef={depthRef} light={false} />
    </div>
  );
}

export function ScrollJellyfish({
  sections = DEFAULT_SECTIONS,
  theme = "pelagia",
  mode = "contained",
  animated = true,
  className = "",
}: ScrollJellyfishProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const depthRef = React.useRef<HTMLSpanElement>(null);
  const zoneRef = React.useRef<HTMLSpanElement>(null);
  const page = mode === "page";
  const T = THEME[theme] ?? THEME.pelagia;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!canvas || !root) return;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k: string) => gl.getUniformLocation(prog, k);
    const u = {
      res: U("uRes"), pos: U("uPos"), time: U("uTime"), pulse: U("uPulse"), s: U("uS"), ang: U("uAng"),
      pitch: U("uPitch"), box: U("uBox"), theme: U("uTheme"), front: U("uFront"), pts: U("uP"),
    };
    const cfg = THEME[theme] ?? THEME.pelagia;
    gl.uniform1i(u.theme, cfg.id);
    gl.uniform1f(u.pitch, -0.32);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = !animated || reduce;
    const progress = () => {
      if (page) {
        const r = root.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      }
      if (!scroller) return 0;
      const span = scroller.scrollHeight - scroller.clientHeight;
      return span > 0 ? scroller.scrollTop / span : 0;
    };

    let W = 1, H = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = Math.max(1, Math.round(canvas.clientWidth * dpr));
      H = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
        gl.viewport(0, 0, W, H);
      }
      gl.uniform2f(u.res, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ── swim state ────────────────────────────────────────────────────────
    let p = progress();
    let phase = 0, lag = 0, ang = 0, t = 0, acc = 0;
    let lastP = p;
    const path = (q: number) => {
      const asp = Math.min(W / H, 1.6);
      return [0.26 * asp * Math.sin(q * 5.2 - 0.5), 0.05 * Math.sin(q * 8) + 0.03];
    };
    let [bx, by] = path(p);
    let pbx = bx;
    const pts = new Float32Array(NS * NP * 2);
    const prev = new Float32Array(NS * NP * 2);
    const anchors = new Float32Array(NS * 2);
    let frontMask = 0, S = 0.17, pulse = 0, cx = bx, cy = by;

    const computeAnchors = () => {
      const a = S * (1 - 0.17 * pulse), b = S * (0.82 + 0.2 * pulse);
      const cp = Math.cos(-0.32), sp = Math.sin(-0.32), ca = Math.cos(ang), sa = Math.sin(ang);
      frontMask = 0;
      for (let s = 0; s < NS; s++) {
        const arm = s >= 8;
        const th = arm ? (s - 8) * (Math.PI / 2) + Math.PI / 4 : s * (Math.PI / 4) + Math.PI / 8;
        const r = arm ? 0.16 * a : 0.95 * a;
        const yb = arm ? -0.02 * S + 0.12 * b : -0.07 * S - 0.04 * S * (1 + 0.6 * pulse);
        const xb = r * Math.cos(th), zb = r * Math.sin(th);
        const vy = cp * yb + sp * zb, vz = -sp * yb + cp * zb; // bell → view (transpose of rotX)
        if (!arm && vz < 0) frontMask |= 1 << s;
        anchors[s * 2] = cx + ca * xb - sa * vy;
        anchors[s * 2 + 1] = cy + sa * xb + ca * vy;
      }
    };
    const init = () => {
      computeAnchors();
      for (let s = 0; s < NS; s++) {
        const seg = (cfg.len[s >= 8 ? 1 : 0] * S) / (NP - 1);
        for (let k = 0; k < NP; k++) {
          const i = (s * NP + k) * 2;
          pts[i] = prev[i] = anchors[s * 2];
          pts[i + 1] = prev[i + 1] = anchors[s * 2 + 1] - k * seg;
        }
      }
    };
    init();

    const step = (h: number, flow: number) => {
      computeAnchors();
      const axX = -Math.sin(ang), axY = Math.cos(ang);
      for (let s = 0; s < NS; s++) {
        const arm = s >= 8;
        const seg = (cfg.len[arm ? 1 : 0] * S) / (NP - 1);
        const b0 = s * NP * 2;
        pts[b0] = prev[b0] = anchors[s * 2];
        pts[b0 + 1] = prev[b0 + 1] = anchors[s * 2 + 1];
        for (let k = 1; k < NP; k++) {
          const i = b0 + k * 2;
          const vx = (pts[i] - prev[i]) * 0.965, vy = (pts[i + 1] - prev[i + 1]) * 0.965;
          prev[i] = pts[i];
          prev[i + 1] = pts[i + 1];
          const wave = still ? 0 : 0.6 * Math.sin(t * 1.6 + k * 0.33 + s * 1.7) * (k / NP);
          const g = 0.55 + flow;
          pts[i] += vx + (-axX * g + axY * wave) * h * h;
          pts[i + 1] += vy + (-axY * g - axX * wave - flow * 0.5) * h * h;
        }
        for (let it = 0; it < 6; it++) {
          for (let k = 1; k < NP; k++) {
            const i = b0 + k * 2, j = i - 2;
            const dx = pts[i] - pts[j], dy = pts[i + 1] - pts[j + 1];
            const d = Math.hypot(dx, dy) || 1e-6;
            const diff = (d - seg) / d;
            if (k === 1) {
              pts[i] -= dx * diff;
              pts[i + 1] -= dy * diff;
            } else {
              pts[j] += dx * diff * 0.5;
              pts[j + 1] += dy * diff * 0.5;
              pts[i] -= dx * diff * 0.5;
              pts[i + 1] -= dy * diff * 0.5;
            }
          }
        }
      }
    };

    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    let awakeUntil = 0;
    const frame = () => {
      raf = 0;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const goal = progress();
      p += (goal - p) * (1 - Math.exp(-dt * 4));
      const speed = Math.min(Math.abs(p - lastP) / Math.max(dt, 1e-3), 1.5);
      lastP = p;

      if (!still) phase += dt * (0.5 + speed * 1.6);
      const f = phase % 1;
      pulse = still ? 0.25 : f < 0.3 ? smooth(f / 0.3) : 1 - smooth((f - 0.3) / 0.7);
      lag += (pulse - lag) * Math.min(1, dt * 2.5);
      [bx, by] = path(p);
      const vx = (bx - pbx) / Math.max(dt, 1e-3);
      pbx = bx;
      const angT = Math.max(-0.6, Math.min(0.6, -vx * 0.8)) + (still ? 0 : 0.07 * Math.sin(t * 0.5));
      ang += (angT - ang) * Math.min(1, dt * 2.5);
      S = 0.17 * (0.92 + 0.16 * p);
      const idle = still ? 0 : 0.012 * Math.sin(t * 0.7);
      cx = bx - Math.sin(ang) * 0.035 * lag + idle;
      cy = by + Math.cos(ang) * 0.035 * lag + idle * 0.6;

      acc += dt;
      const flow = speed * 1.2;
      while (acc > 1 / 120) {
        step(1 / 120, flow);
        acc -= 1 / 120;
      }

      let x0 = cx - S * 1.3, x1 = cx + S * 1.3, y0 = cy - S * 1.3, y1 = cy + S * 1.3;
      for (let i = 0; i < pts.length; i += 2) {
        x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]);
        y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]);
      }
      root.style.setProperty("--p", p.toFixed(4));
      const range = DEPTH[theme];
      if (range && depthRef.current) depthRef.current.textContent = `−${Math.round(range[0] + (range[1] - range[0]) * p).toLocaleString("en-US")} m`;
      if (zoneRef.current) {
        const z = theme === "moon" ? (p < 0.5 ? "Sunlight zone" : "Twilight zone") : p < 0.5 ? "Midnight zone" : "Abyssal zone";
        if (zoneRef.current.textContent !== z) zoneRef.current.textContent = z;
      }
      gl.uniform4f(u.box, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04);
      gl.uniform4fv(u.pts, pts);
      gl.uniform2f(u.pos, cx, cy);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.pulse, pulse);
      gl.uniform1f(u.s, S);
      gl.uniform1f(u.ang, ang);
      gl.uniform1i(u.front, frontMask);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && (!still || now < awakeUntil)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      awakeUntil = performance.now() + 2500;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const scrollSrc: EventTarget = page ? window : (scroller ?? window);
    scrollSrc.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scrollSrc.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [theme, animated, page]);

  const content = sections.map((s, i) => (
    <section key={i} className={`relative flex min-h-full items-center justify-center px-4 ${page ? "h-screen" : ""}`}>
      <h3
        className={`whitespace-nowrap text-center text-[15cqw] font-black uppercase leading-none tracking-[-0.04em] ${T.ink}`}
        style={
          theme === "abyss"
            ? { textShadow: "0 0 30px rgba(94,234,212,.35), 0 0 2px rgba(255,255,255,.6)", color: "transparent", WebkitTextStroke: "1.5px rgba(204,251,241,.85)" }
            : theme === "moon"
              ? { backgroundImage: "linear-gradient(180deg,#fff,rgba(186,230,253,.55))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
              : undefined
        }
      >
        {s.word}
      </h3>
      {s.caption && (
        <p className={`absolute bottom-12 left-1/2 max-w-[18rem] -translate-x-1/2 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] ${T.sub}`}>{s.caption}</p>
      )}
    </section>
  ));
  const canvas = <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;

  if (page) {
    return (
      <div ref={rootRef} className={`relative [container-type:inline-size] ${className}`} style={{ height: `${sections.length * 100}vh`, background: T.bg }}>
        <style>{bgCss}</style>
        <div className={`pointer-events-none sticky top-0 z-10 h-screen w-full overflow-hidden [container-type:size] ${animated ? "" : "gx-jf-still"}`}>
          <Backdrop theme={theme} depthRef={depthRef} zoneRef={zoneRef} />
          {canvas}
        </div>
        <div className="relative" style={{ marginTop: "-100vh" }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative h-full min-h-[320px] w-full overflow-hidden [container-type:inline-size] ${className}`} style={{ background: T.bg }}>
      <style>{bgCss}</style>
      <div className={`absolute inset-0 [container-type:size] ${animated ? "" : "gx-jf-still"}`}>
        <Backdrop theme={theme} depthRef={depthRef} zoneRef={zoneRef} />
      </div>
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scroll to swim with the jellyfish"
        className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {content}
      </div>
      {canvas}
    </div>
  );
}

function smooth(x: number) {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

export default ScrollJellyfish;
