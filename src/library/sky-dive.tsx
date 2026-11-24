"use client";

import * as React from "react";

/**
 * SkyDive — the engine behind Eiffel Dive.
 * You start above a sea of volumetric clouds; scrolling makes you fall through
 * them, level out and fly toward a landmark that grows until it fills the view.
 * One WebGL2 fragment shader: ray-marched heightfield terrain with soft shadows
 * and cloud shadows, volumetric clouds lit by the sun (or moon), aerial haze,
 * stars, rain, lightning and a rainbow when the storm clears.
 * Resolution adapts to the GPU so it stays smooth.
 * Zero dependencies · React + Tailwind · respects prefers-reduced-motion.
 */

export type SkyMood = "day" | "night" | "rain";
export type SkySection = { eyebrow?: string; title: string; body?: string };

export type SkyScene = {
  /**
   * GLSL defining: CAM (vec4 startDist, endDist, endHeight, azimuth), CLOUD (vec2 lo, hi),
   * FOG, HMAX, TMAX, SC (scene scale), and the functions
   * `float H(vec2)`, `float DET(vec2)` (normal-only detail), `vec3 TGT()`; optionally `#define HAS_OBJ` + `float OBJ(vec3)` (an SDF landmark), `vec3 albedo(vec3 p, vec3 n)`, `vec3 nightLight(vec3 p, vec3 n)`.
   */
  glsl: string;
};

export type SkyDiveProps = {
  scene: SkyScene;
  sections: SkySection[];
  mood?: SkyMood;
  mode?: "contained" | "page";
  animated?: boolean;
  label?: string;
  className?: string;
};

const VERT = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const HEAD = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uTime,uProg;uniform int uMood;
out vec4 o;
float h12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float h13(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z);}
const mat2 m2=mat2(.8,.6,-.6,.8);
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n2(p);p=m2*p*2.03;a*=.5;}return s;}
float ridged(vec2 p){float a=.5,s=0.,w=1.;for(int i=0;i<5;i++){float n=1.-abs(n2(p)*2.-1.);n*=n;s+=a*n*w;w=clamp(n*1.6,0.,1.);p=m2*p*2.07;a*=.5;}return s;}
float smax(float a,float b,float k){float h=clamp(.5+.5*(a-b)/k,0.,1.);return mix(b,a,h)+k*h*(1.-h);}
`;

const MAIN = `
int Z;float S,SUN,FLASH,COV;vec3 L,LC,AMB;
float HN(vec2 p){return H(p)+DET(p);}
float OBJD(vec3 p){
#ifdef HAS_OBJ
 return OBJ(p);
#else
 return 1e9;
#endif
}
float cloudD(vec3 p){
 float hg=(p.y-CLOUD.x)/(CLOUD.y-CLOUD.x);
 if(hg<0.||hg>1.)return 0.;
 vec3 q=p*.32+vec3(uTime*.012,0.,uTime*.006);
 float b=.5*n3(q)+.25*n3(q*2.02)+.125*n3(q*4.1)+.0625*n3(q*8.3);
 float prof=smoothstep(0.,.18,hg)*(1.-smoothstep(.45,1.,hg));
 float d=b*prof-(1.-COV)*.62;
 return clamp(d*3.2,0.,1.);
}
vec3 skyCol(vec3 rd){
 float up=max(rd.y,0.);
 vec3 day=mix(vec3(.5,.66,.86),vec3(.06,.2,.55),pow(up,.5));
 vec3 storm=mix(vec3(.42,.45,.5),vec3(.25,.28,.33),up);
 vec3 c=uMood==1?mix(vec3(.025,.04,.08),vec3(.004,.008,.022),pow(up,.4)):mix(day,storm,S);
 float sd=max(dot(rd,L),0.);
 c+=LC*(.06*pow(sd,6.)+.25*pow(sd,64.))*(uMood==1?.6:1.)*(1.-S*.8);
 c+=LC*smoothstep(.9994,.9997,sd)*(uMood==1?6.:30.)*(1.-S);
 if(uMood==1){vec3 q=rd*260.;vec3 id=floor(q);float h=h13(id);
  c+=vec3(.8,.85,1.)*step(.996,h)*(1.-smoothstep(.0,.35,length(fract(q)-.5)))*(.5+.5*sin(uTime*2.+h*60.))*smoothstep(0.,.15,rd.y);}
 c+=FLASH*vec3(.6,.65,.8);
 return c;
}
bool march(vec3 ro,vec3 rd,out float t,out bool ob){
 t=0.;ob=false;
 if(ro.y>HMAX){if(rd.y>=0.)return false;t=(ro.y-HMAX)/-rd.y;}
 for(int i=0;i<240+Z;i++){
  vec3 p=ro+rd*t;float h=p.y-H(p.xz),od=OBJD(p);
  if(od<.0004*t+.00001*SC){ob=true;return true;}
  if(abs(h)<.0012*t+.00002*SC)return true;
  if(t>TMAX||(p.y>HMAX&&rd.y>0.))return false;
  t+=min(h*.5,od*.7);
 }
 return t<TMAX;
}
vec3 nrm(vec3 p,float t,bool ob,out float ao){
 ao=1.;
 if(ob){vec2 k=vec2(1,-1)*max(.0002*t,.00002*SC);
  return normalize(k.xyy*OBJD(p+k.xyy)+k.yyx*OBJD(p+k.yyx)+k.yxy*OBJD(p+k.yxy)+k.xxx*OBJD(p+k.xxx));}
 float e=max(.0012*t,.0004*SC),rr=max(.004*t,.02*SC);
 vec4 hn=vec4(0);float av=0.;
 for(int i=0;i<8+Z;i++){
  float a=float(i&3)*1.5707963;vec2 o=vec2(cos(a),sin(a))*(i<4?e:rr);
  float h=HN(p.xz+o);
  if(i<4)hn[i]=h;else av+=h*.25;
 }
 ao=clamp(.62+(p.y-av)/(rr*.9),.2,1.);
 return normalize(vec3(hn.z-hn.x,2.*e,hn.w-hn.y));}
float shadow(vec3 ro){float r=1.,t=.01*SC;
 for(int i=0;i<28+Z;i++){vec3 p=ro+L*t;float h=min(p.y-H(p.xz),OBJD(p));r=min(r,10.*h/t);if(r<.01||p.y>HMAX)break;t+=clamp(h,.01*SC,SC);}
 return clamp(r,0.,1.);}
vec4 clouds(vec3 ro,vec3 rd,float tmax,float jit){
 float ta=(CLOUD.x-ro.y)/rd.y,tb=(CLOUD.y-ro.y)/rd.y;
 float t0=min(ta,tb),t1=max(ta,tb);
 if(ro.y>CLOUD.x&&ro.y<CLOUD.y){t0=0.;t1=abs(rd.y)<1e-4?60.:max(ta,tb);}
 t0=max(t0,0.);t1=min(min(t1,tmax),t0+70.);
 if(t1<=t0)return vec4(0,0,0,1);
 float dt=(t1-t0)/56.,t=t0+dt*jit,T=1.;vec3 c=vec3(0);
 float mu=dot(rd,L);float ph=mix(.08,1.,.5+.5*mu)+.6*pow(max(mu,0.),12.);
 vec3 dark=uMood==1?vec3(.03,.04,.07):mix(vec3(.55,.62,.75),vec3(.22,.24,.28),S);
 for(int i=0;i<56+Z;i++){
  if(t>t1||T<.02)break;
  vec3 p=ro+rd*t;float d=cloudD(p);
  if(d>.002){
   float ls=cloudD(p+L*.35)+cloudD(p+L*.9)*.6;
   float hg=(p.y-CLOUD.x)/(CLOUD.y-CLOUD.x);
   float pw=1.-exp(-d*6.);
   vec3 lit=LC*exp(-ls*(2.4+S*2.))*ph*pw*1.6+(AMB*1.5+dark*.6)*(.45+.55*hg)+FLASH*.9;
   if(uMood==1)lit*=.4;
   float a=1.-exp(-d*dt*9.);
   c+=T*a*lit;T*=1.-a;
  }
  t+=dt;
 }
 return vec4(c,T);
}
float rain(vec2 uv){float r=0.;
 for(int l=0;l<3;l++){float fl=float(l),sc=55.+fl*35.;
  vec2 q=vec2(uv.x+uv.y*.18,uv.y)*sc;
  float c=floor(q.x),h=h12(vec2(c,fl*7.));
  float fy=fract(q.y*.06+uTime*(1.6+h)*(1.+fl*.4)+h*13.);
  float x=fract(q.x)-.5;
  r+=step(.45,h)*(1.-smoothstep(0.,.06,abs(x)))*smoothstep(0.,.05,fy)*(1.-smoothstep(.05,.45,fy))*(.4+.3*fl);}
 return r;}
vec3 drops(vec2 uv){vec2 g=uv*6.,id=floor(g),f=fract(g)-.5;float h=h12(id);
 vec2 d=f-(vec2(h12(id+3.),h12(id+5.))-.5)*.5;float rad=.07+.13*h;
 float m=(1.-smoothstep(rad*.75,rad,length(d)))*step(.5,h);return vec3(-d*m*.16,m);}
void main(){
 vec2 uv0=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 float p=uProg;Z=min(uMood,0);
 float r2=dot(uv0,uv0);vec2 uv=uv0*(1.+.13*r2);
 S=uMood==2?1.-smoothstep(.55,.92,p):0.;
 SUN=uMood==2?smoothstep(.5,.95,p):1.;
 FLASH=uMood==2?S*step(.93,h12(vec2(floor(uTime*3.),7.)))*exp(-fract(uTime*3.)*7.)*.8*smoothstep(.15,.45,p):0.;
 COV=uMood==2?mix(.68,.36,1.-S):.42-.1*smoothstep(.55,1.,p);
 float az=CAM.w;
 float sa=az+(uMood==2?2.6:1.1);
 L=normalize(vec3(sin(sa),uMood==1?.42:.3,cos(sa)));
 LC=uMood==1?vec3(.35,.45,.7)*.55:vec3(1.,.9,.78)*3.*mix(.12,1.,SUN);
 AMB=uMood==1?vec3(.02,.035,.07):mix(vec3(.3,.42,.62)*.55,vec3(.36,.38,.42)*.45,S);
 AMB+=FLASH*.6;
 // camera: above clouds → dive → level out → approach the landmark
 vec3 T0=TGT();
 float e=smoothstep(.04,1.,p);
 float caz=az+.4*(1.-e);
 vec2 dh=vec2(sin(caz),cos(caz));
 float dist=CAM.x*pow(CAM.y/CAM.x,e);
 float y0=CLOUD.y+(CLOUD.y-CLOUD.x)*1.6,ym=CLOUD.x-(CLOUD.y-CLOUD.x)*.6,y1=T0.y+CAM.z;
 float y=p<.5?mix(y0,ym,smoothstep(.14,.5,p)):mix(ym,y1,smoothstep(.5,1.,p));
 vec3 ro=vec3(T0.x+dh.x*dist,0.,T0.z+dh.y*dist);
 ro.y=max(y,H(ro.xz)+.06*dist);
 vec3 tt=T0-ro;
 float yaw=atan(tt.x,tt.z),pT=atan(tt.y,length(tt.xz))+.06;
 float pitch=p<.38?mix(-.04,-1.2,smoothstep(.1,.38,p)):mix(-1.2,pT,smoothstep(.38,.82,p));
 float fall=smoothstep(.12,.3,p)*(1.-smoothstep(.45,.62,p));
 float roll=0.;
 float wet=(uMood==2?S*smoothstep(.3,.45,p):0.)+.6*smoothstep(.4,.5,p)*(1.-smoothstep(.55,.7,p));
 vec3 dr=drops(uv0)*min(wet,1.);uv+=dr.xy;
 vec3 fw=vec3(cos(pitch)*sin(yaw),sin(pitch),cos(pitch)*cos(yaw));
 vec3 rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);
 vec2 ruv=mat2(cos(roll),sin(roll),-sin(roll),cos(roll))*uv;
 vec3 rd=normalize(ruv.x*rt+ruv.y*up+mix(1.5,1.05,fall)*fw);
 float t;bool ob;bool hit=march(ro,rd,t,ob);
 vec3 col;
 vec3 sky=skyCol(rd);
 if(hit){
  float ao;vec3 P=ro+rd*t,N=nrm(P,t,ob,ao);
  vec3 al=albedo(P,N)*mix(1.,.62,S);
  float sh=shadow(P+N*.002*SC);
  float tc=((CLOUD.x+CLOUD.y)*.5-P.y)/max(L.y,.05);
  float cs=exp(-cloudD(P+L*tc)*2.5*COV*2.);
  float dif=max(dot(N,L),0.)*sh*cs;
  float bnc=max(dot(N,normalize(vec3(-L.x,0.,-L.z))),0.)*.12;
  col=al*(LC*dif*mix(1.,ao,.4)+AMB*(.55+.45*N.y)*1.4*ao+LC*bnc*.1*ao);
  if(uMood!=2||S<.5)col+=al*LC*pow(max(dot(reflect(rd,N),L),0.),24.)*.05*(1.-S);
  if(uMood==1)col+=nightLight(P,N);
  float fd=1.-exp(-t*FOG*(1.+S*1.4));
  vec3 fc=mix(skyCol(normalize(vec3(rd.x,.03,rd.z))),LC*.25,uMood==1?0.:.12*pow(max(dot(rd,L),0.),4.));
  col=mix(col,fc,fd);
 }else col=sky;
 if(uMood==2){
  vec3 an=-L;float a=acos(clamp(dot(rd,an),-1.,1.));float b=(a-.69)/.05;
  vec3 rb=clamp(vec3(1.-abs(b-.15)*1.6,1.-abs(b-.5)*1.6,1.-abs(b-.85)*1.6),0.,1.);
  col+=rb*smoothstep(.72,.95,p)*.22*step(0.,b)*step(b,1.)*(hit?.7:1.);
 }
 vec4 cl=clouds(ro,rd,hit?t:1e4,h12(gl_FragCoord.xy));
 col=col*cl.w+cl.rgb;
 if(uMood==2){float rn=rain(ruv)*S*smoothstep(.3,.46,p)*(1.-smoothstep(.85,1.,p));col+=vec3(.75,.8,.9)*rn*.18;}
 col+=dr.z*.04*AMB;
 float inC=smoothstep(.24,.36,p)*(1.-smoothstep(.42,.52,p));
 col*=mix(.95,.8,inC)*(1.-.32*r2);
 col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
 float lu=dot(col,vec3(.299,.587,.114));
 col=mix(vec3(lu),col,.86);
 col+=(vec3(-.01,.012,.022)*(1.-lu)+vec3(.025,.012,-.012)*lu)*.8;
 col=pow(clamp(col,0.,1.),vec3(1./2.2));
 col+=(h12(gl_FragCoord.xy*1.37)-.5)*.012;
 o=vec4(col,1.);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

const MOODS: Record<SkyMood, number> = { day: 0, night: 1, rain: 2 };

export function SkyDive({ scene, sections, mood = "day", mode = "contained", animated = true, label = "Scroll to dive", className = "" }: SkyDiveProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [active, setActive] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  const page = mode === "page";
  const n = sections.length;
  const glsl = scene.glsl;

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
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, HEAD + glsl + MAIN));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch (err) {
      console.warn("SkyDive shader:", err);
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
    const uRes = gl.getUniformLocation(prog, "uRes"), uTime = gl.getUniformLocation(prog, "uTime"), uProg = gl.getUniformLocation(prog, "uProg");
    gl.uniform1i(gl.getUniformLocation(prog, "uMood"), MOODS[mood] ?? 0);

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

    // Adaptive resolution: render scale follows frame time so the dive stays smooth.
    let scale = 0.7;
    const resize = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      const w = Math.max(1, Math.round(canvas.clientWidth * k));
      const h = Math.max(1, Math.round(canvas.clientHeight * k));
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
    let raf = 0, last = performance.now(), avg = 16, frames = 0, lastActive = -1;
    const t0 = performance.now();
    const frame = () => {
      raf = 0;
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      avg = avg * 0.9 + dt * 1000 * 0.1;
      last = now;
      if (++frames % 30 === 0) {
        const next = avg > 24 ? Math.max(0.4, scale * 0.85) : avg < 15 ? Math.min(1, scale * 1.1) : scale;
        if (Math.abs(next - scale) > 0.02) {
          scale = next;
          resize();
        }
      }
      const goal = target();
      p = still ? goal : p + (goal - p) * (1 - Math.exp(-dt * 3.5));
      gl.uniform1f(uTime, still ? 0 : (now - t0) / 1000);
      gl.uniform1f(uProg, p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const a = Math.min(n - 1, Math.round(goal * (n - 1)));
      if (a !== lastActive) setActive((lastActive = a));
      if (visible && (!still || Math.abs(goal - p) > 1e-4)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const src: EventTarget = page ? window : (scroller ?? window);
    src.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      src.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [glsl, mood, animated, page, n]);

  const content = sections.map((s, i) => (
    <section
      key={i}
      className={`flex min-h-full items-center px-6 sm:px-12 ${page ? "h-screen" : ""} ${i === 0 ? "justify-center text-center" : i % 2 ? "justify-start" : "justify-end text-right"}`}
    >
      <div
        className="max-w-md transition-all duration-700 ease-out motion-reduce:transition-none"
        style={{ opacity: active === i ? 1 : 0.1, transform: `translateY(${active === i ? 0 : active > i ? -20 : 20}px)`, filter: active === i ? "none" : "blur(4px)" }}
        aria-current={active === i ? "step" : undefined}
      >
        {s.eyebrow && <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white/80 drop-shadow">{s.eyebrow}</p>}
        <h3 className={`font-semibold leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] ${i === 0 ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl"}`}>{s.title}</h3>
        {s.body && <p className="mt-4 text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)] sm:text-base">{s.body}</p>}
      </div>
    </section>
  ));

  const scene3d = (
    <>
      <canvas ref={canvasRef} aria-hidden className={`absolute inset-0 h-full w-full ${failed ? "hidden" : ""}`} />
      {failed && <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-sky-700 via-sky-300 to-stone-300" />}
      <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2" aria-hidden>
        {sections.map((_, i) => (
          <span key={i} className={`h-6 w-[2px] rounded-full transition-colors duration-500 ${active === i ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
    </>
  );

  if (page) {
    return (
      <div ref={rootRef} className={`relative bg-sky-900 ${className}`} style={{ height: `${n * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">{scene3d}</div>
        <div className="relative" style={{ marginTop: "-100vh" }}>
          {content}
        </div>
      </div>
    );
  }
  return (
    <div ref={rootRef} className={`relative h-full min-h-[320px] w-full overflow-hidden bg-sky-900 ${className}`}>
      {scene3d}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label={label}
        className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {content}
      </div>
    </div>
  );
}

export default SkyDive;
