"use client";

import * as React from "react";

/**
 * ScrollMoon — a photoreal, procedurally rendered moon (or Mars) that you fly
 * toward as you scroll: a thin crescent far away → a full, crater-sharp disc →
 * the horizon filling the screen. Content sections change with the scroll.
 * Rendered in a single WebGL2 fragment shader (no textures, no three.js):
 * 3D Worley craters with rims + central peaks, fbm maria, Lommel-Seeliger
 * lunar lighting, bump-mapped terminator shadows and LOD that adds detail
 * as you get closer.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type MoonTheme = "moon" | "blood" | "mars";

export type MoonSection = { eyebrow?: string; title: string; body?: string };

export type ScrollMoonProps = {
  sections?: MoonSection[];
  /** Art direction: realistic moon, lunar-eclipse blood moon, or Mars. */
  theme?: MoonTheme;
  /**
   * "contained" = scrolls inside its own box (give it a height).
   * "page" = uses window scroll: renders `sections.length × 100vh` with a sticky scene.
   */
  mode?: "contained" | "page";
  /** false = no time-based motion (rotation, twinkle, scroll easing). Default true. */
  animated?: boolean;
  className?: string;
};

const DEFAULT_SECTIONS: MoonSection[] = [
  { eyebrow: "01 — Distance", title: "It starts as a sliver.", body: "384,400 km away, a thin crescent in the dark." },
  { eyebrow: "02 — Approach", title: "Then the light turns.", body: "Scroll, and the terminator sweeps across the disc." },
  { eyebrow: "03 — Full", title: "Every crater, in focus.", body: "Detail is generated as you get closer — never a blurry texture." },
  { eyebrow: "04 — Arrival", title: "Touch the horizon.", body: "Your story lands here." },
];

const VERT = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uTime,uProg,uRot;uniform int uTheme;
out vec4 o;
float h31(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
vec3 h33(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
// one octave of craters: bowl + raised rim + central peak, sliced by the sphere
float crater(vec3 p,float keep){
 vec3 i=floor(p),f=fract(p);float h=0.;
 for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
  vec3 g=vec3(x,y,z),r=h33(i+g);
  float R=.16+.34*r.x*r.x;
  float d=length(g+.2+.6*r-f)/R;
  float bowl=-(1.-smoothstep(.45,1.,d));
  float rim=exp(-pow((d-1.)*3.2,2.))*.45;
  float peak=exp(-d*d*60.)*.5*step(.3,R);
  h+=(bowl+rim+peak)*R*step(1.-keep,r.y);
 }
 return h;}
float lod;
float height(vec3 n){
 float h=crater(n*2.2,.7)*.9+crater(n*5.+11.,.6)*.45;
 h+=crater(n*12.+23.,.55)*.2*(1.-smoothstep(.35,1.,12.*lod));
 h+=crater(n*30.+5.,.5)*.08*(1.-smoothstep(.35,1.,30.*lod));
 h+=(fbm(n*20.)-.5)*.05;
 return h;}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
float stars(vec2 u,float sc){vec2 g=floor(u*sc),f=fract(u*sc);vec3 r=h33(vec3(g,7.));
 float b=step(.93,r.z);float d=length(f-.15-.7*r.xy);
 return b*(1.-smoothstep(0.,.06,d))*(.6+.4*sin(uTime*(1.+3.*r.x)+r.y*6.28))*r.z;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 float px=1./uRes.y;
 float e=smoothstep(0.,1.,uProg);
 float R=.055*pow(28.,e);
 vec2 C=mix(vec2(.18,.08),vec2(0.),smoothstep(0.,.45,uProg));
 C.y-=R*smoothstep(.7,1.,uProg)*.85;
 // background: deep space + stars, slight parallax with scroll
 vec3 bg=mix(vec3(.0006,.0008,.002),vec3(.002,.0025,.006),uv.y+.5);
 vec2 su=uv+vec2(0.,uProg*.15);
 bg+=vec3(.7,.72,.8)*(stars(su,90.)+.6*stars(su+3.1,170.));
 vec3 L;vec3 tint;vec3 glowC;
 float a=mix(2.2,.35,smoothstep(.05,.6,uProg));
 a=mix(a,1.2,smoothstep(.7,1.,uProg));
 if(uTheme==1){a=mix(.6,.15,uProg);}
 L=normalize(vec3(sin(a),.15,cos(a)));
 vec2 q=uv-C;float r=length(q);
 vec3 col=bg;
 // halo / atmosphere glow outside the limb
 float gw=exp(-max(r-R,0.)/(R*(uTheme==2?.06:.18)));
 if(uTheme==0)col+=vec3(.55,.6,.7)*gw*.10*(1.-smoothstep(.3,1.,a));
 if(uTheme==1)col+=vec3(.7,.12,.04)*gw*.22;
 if(uTheme==2)col+=vec3(.9,.45,.25)*gw*.25*(.3+.7*smoothstep(-.2,.6,dot(normalize(vec3(q,0.)+1e-4),L)));
 if(r<R+px*2.){
  vec3 nS=vec3(q/R,sqrt(max(1.-dot(q,q)/(R*R),0.)));
  mat3 M=rotX(.35)*rotY(uRot);
  vec3 nT=M*nS,Lo=M*L,Vo=M*vec3(0,0,1);
  lod=px/R*1.5;
  float ep=max(.0015,lod);
  vec3 t1=normalize(cross(nT,vec3(0,1,.0001))),t2=cross(nT,t1);
  float h0=height(nT),h1=height(normalize(nT+ep*t1)),h2=height(normalize(nT+ep*t2));
  float bump=uTheme==2?.05:.09;
  vec3 nP=normalize(nT-bump*((h1-h0)*t1+(h2-h0)*t2)/ep);
  // albedo: highlands vs maria + fine speckle + bright fresh crater rims
  float mar=smoothstep(.5,.62,fbm(nT*1.4+vec3(3.,1.,7.)));
  float sp=fbm(nT*40.);
  vec3 alb;
  if(uTheme==2){
   alb=mix(vec3(.72,.36,.19),vec3(.33,.17,.1),mar*.85)*(.85+.3*sp);
   alb=mix(alb,vec3(.95,.93,.9),smoothstep(.86,.9,abs(nT.y)+.03*sp));
  }else{
   alb=vec3(1.,.975,.94)*mix(.58,.27,mar)*(.82+.36*sp);
   alb+=.12*smoothstep(.02,.07,h0)*(1.-mar);
  }
  float mu0=max(dot(nP,Lo),0.),mu=max(dot(nT,Vo),.02);
  float ls=2.*mu0/(mu0+mu);
  float diff=mix(mu0,ls,uTheme==2?.15:.75)*smoothstep(-.03,.12,dot(nT,Lo));
  vec3 m;
  if(uTheme==1){
   float umb=smoothstep(-1.,1.,dot(nS,normalize(vec3(.7,.3,.5))));
   m=alb*(diff*.9+.08)*mix(vec3(.30,.04,.015),vec3(.95,.32,.12),umb);
  }else{
   m=alb*diff*.8+alb*.006;
   if(uTheme==2){float atm=pow(1.-nS.z,3.);m+=vec3(.9,.5,.3)*atm*.35*smoothstep(-.1,.5,dot(nS,L));}
  }
  col=mix(col,m,(1.-smoothstep(R-px*1.5,R+px*1.5,r)));
 }
 col=1.-exp(-col*1.6);
 col=pow(col,vec3(1./2.2));
 col+=(h31(vec3(gl_FragCoord.xy,uTime))-.5)/255.;
 o=vec4(col,1.);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

const THEMES: Record<MoonTheme, number> = { moon: 0, blood: 1, mars: 2 };

export function ScrollMoon({
  sections = DEFAULT_SECTIONS,
  theme = "moon",
  mode = "contained",
  animated = true,
  className = "",
}: ScrollMoonProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [active, setActive] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  const page = mode === "page";
  const n = sections.length;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!canvas || !root) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      setFailed(true);
      return;
    }
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (k: string) => gl.getUniformLocation(prog, k);
    const uRes = u("uRes"), uTime = u("uTime"), uProg = u("uProg"), uRot = u("uRot"), uTheme = u("uTheme");
    gl.uniform1i(uTheme, THEMES[theme] ?? 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = !animated || reduce;
    const target = () => {
      if (page) {
        const r = root.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      }
      if (!scroller) return 0;
      const span = scroller.scrollHeight - scroller.clientHeight;
      return span > 0 ? scroller.scrollTop / span : 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);

    let p = target();
    let raf = 0;
    let lastActive = -1;
    let last = performance.now();
    const t0 = performance.now();
    const frame = () => {
      raf = 0;
      const goal = target();
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      p = still ? goal : p + (goal - p) * (1 - Math.exp(-dt * 5));
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(uTime, still ? 0 : t);
      gl.uniform1f(uProg, p);
      gl.uniform1f(uRot, 0.4 + p * 1.4 + (still ? 0 : t * 0.015));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const a = Math.min(n - 1, Math.round(goal * (n - 1)));
      if (a !== lastActive) setActive((lastActive = a));
      if (visible && (!still || Math.abs(goal - p) > 1e-4)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => kick();
    const scrollSrc: EventTarget = page ? window : (scroller ?? window);
    scrollSrc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scrollSrc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [theme, animated, page, n]);

  const accent = theme === "moon" ? "text-slate-300" : theme === "blood" ? "text-red-400" : "text-orange-300";

  const content = sections.map((s, i) => (
    <section
      key={i}
      className={`flex min-h-full items-center px-6 sm:px-12 ${page ? "h-screen" : ""} ${i % 2 ? "justify-end text-right" : "justify-start"}`}
    >
      <div
        className="max-w-sm transition-all duration-700 ease-out motion-reduce:transition-none"
        style={{ opacity: active === i ? 1 : 0.12, transform: `translateY(${active === i ? 0 : active > i ? -16 : 16}px)` }}
        aria-current={active === i ? "step" : undefined}
      >
        {s.eyebrow && <p className={`mb-3 font-mono text-[11px] uppercase tracking-[0.25em] ${accent}`}>{s.eyebrow}</p>}
        <h3 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-5xl">{s.title}</h3>
        {s.body && <p className="mt-4 text-sm leading-relaxed text-white/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-base">{s.body}</p>}
      </div>
    </section>
  ));

  const rail = (
    <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2" aria-hidden>
      {sections.map((_, i) => (
        <span key={i} className={`h-6 w-[2px] rounded-full transition-colors duration-500 ${active === i ? "bg-white" : "bg-white/20"}`} />
      ))}
    </div>
  );

  const canvas = (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full ${failed ? "hidden" : ""}`}
    />
  );
  const fallback = failed && (
    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,#d6d3cc_0,#8f8b84_18%,#0b0d14_19%,#02030a_70%)]" />
  );

  if (page) {
    return (
      <div ref={rootRef} className={`relative bg-black ${className}`} style={{ height: `${n * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {canvas}
          {fallback}
          {rail}
        </div>
        <div className="relative" style={{ marginTop: "-100vh" }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative h-full min-h-[320px] w-full overflow-hidden bg-black ${className}`}>
      {canvas}
      {fallback}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scroll to travel to the moon"
        className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {content}
      </div>
      {rail}
    </div>
  );
}

export default ScrollMoon;
