"use client";

import * as React from "react";
import SkyDive, { type SkyDiveProps, type SkyScene, type SkySection } from "./sky-dive";

/**
 * EiffelDive — start above the clouds, fall through them and fly over Paris
 * (Haussmann blocks, the Seine, Champ de Mars) to the Eiffel Tower: tapering
 * legs, arches, three platforms and a lattice you can see through.
 * Day, Night (golden lights + the hourly sparkle) and Rain → Sun moods.
 * Uses the SkyDive engine (installed together).
 */

const PARIS: SkyScene = {
  glsl: `
#define HAS_OBJ
const vec4 CAM=vec4(12.,.72,.0,0.);const vec2 CLOUD=vec2(1.4,2.2);
const float FOG=.04,HMAX=.335,TMAX=30.,SC=.1;
float tw(float y){return .0625*exp(-y*9.5)+.0012;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float holes(float u,float v,float pu,float pv,float k){return max(abs(fract(u/pu)-.5)*pu-pu*k,abs(fract(v/pv)-.5)*pv-pv*k);}
float OBJ(vec3 q){
 float bb=box(q-vec3(0,.166,0),vec3(.067,.168,.067));
 if(bb>.004)return bb;
 vec2 a=abs(q.xz);float y=q.y,yc=clamp(y,0.,.3),W=tw(yc);
 float lt=mix(.0105,.0035,clamp(yc/.12,0.,1.));
 vec2 c=a-vec2(W-lt);
 float leg=max(abs(c.x)-lt,abs(c.y)-lt);
 leg=max(leg,-(leg+.0011));
 leg=max(leg,-holes(a.x+a.y,y,.006,.0075,.34));
 leg=max(leg,y-.125);
 float m=max(a.x,a.y)-W;
 float pyl=abs(m+.0008)-.0008;
 pyl=max(pyl,-holes(q.x+q.z,y,.0045,.006,.3));
 pyl=max(max(pyl,.11-y),y-.3);
 float d=min(max(leg,-y),pyl);
 float ant=max(length(q.xz)-.0011,abs(y-.316)-.016);
 d=min(d,ant);
 d=min(d,box(q-vec3(0,.0575,0),vec3(.0375,.0032,.0375)));
 d=min(d,box(q-vec3(0,.1155,0),vec3(.0215,.0024,.0215)));
 d=min(d,box(q-vec3(0,.2765,0),vec3(.0072,.0045,.0072)));
 for(int i=0;i<2;i++){
  vec2 f=i==0?vec2(q.z,a.x):vec2(q.x,a.y);
  float ar=abs(length(vec2(f.x/.046,y/.041))-1.)*.041-.0018;
  ar=max(ar,abs(f.y-W+lt)-lt*.7);
  ar=max(ar,max(.006-y,y-.056));
  d=min(d,ar);
 }
 return d;
}
float river(vec2 p){return abs(p.y-(.25+.05*sin(p.x*3.)))-.045;}
float park(vec2 p){
 float cdm=max(abs(p.x)-.11,abs(p.y+.5)-.46);
 float tro=max(abs(p.x)-.13,abs(p.y-.43)-.09);
 return min(min(cdm,tro),length(p)-.09);
}
float city(vec2 p){
 vec2 g=p/.07+vec2(.3,.6),id=floor(g),f=fract(g);
 float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y))*.07;
 vec2 sub=floor(f*2.);float h=.014+.012*h12(id*3.+sub);
 float ridge=min(abs(fract(f.x*2.)-.5),abs(fract(f.y*2.)-.5));
 return smoothstep(.0045,.006,e)*(h+.0025*smoothstep(.0,.25,ridge)*smoothstep(.006,.012,e));
}
float H(vec2 p){
 float r=river(p),k=park(p);
 if(r<0.)return -.006*smoothstep(0.,-.01,r);
 if(k<0.)return .0012*fbm2(p*260.)*smoothstep(0.,-.01,k)+.0045*step(.6,n2(p*180.))*step(k,-.012)*smoothstep(-.02,-.03,k);
 return city(p)*smoothstep(0.,.012,min(r,k));
}
float DET(vec2 p){return 0.;}
vec3 TGT(){return vec3(0.,.15,0.);}
vec3 albedo(vec3 p,vec3 n){
 if(OBJ(p)<.0006){
  float l=abs(fract((p.x+p.z)*260.+p.y*300.)-.5)+abs(fract((p.x+p.z)*260.-p.y*300.)-.5);
  return vec3(.36,.28,.2)*mix(.75+.35*smoothstep(.2,.6,l),.92,clamp(fwidth(p.y*300.)*2.,0.,1.));
 }
 vec2 x=p.xz;
 if(river(x)<0.)return vec3(.05,.09,.11);
 if(park(x)<0.)return mix(vec3(.16,.26,.08),vec3(.08,.15,.05),step(.6,n2(x*180.)))*(.85+.3*n2(x*900.));
 if(p.y<.003)return vec3(.3,.29,.28);
 if(n.y>.55)return vec3(.27,.3,.35)*(.8+.4*h12(floor(x/.035)));
 return mix(vec3(.78,.7,.56),vec3(.66,.6,.52),h12(floor(x/.035)+3.))*(.88+.24*n2(x*400.+p.y*300.))*(.75+.25*step(.5,fract(p.y*380.)));
}
vec3 nightLight(vec3 p,vec3 n){
 if(OBJ(p)<.0006){
  float l=abs(fract((p.x+p.z)*260.+p.y*300.)-.5)+abs(fract((p.x+p.z)*260.-p.y*300.)-.5);
  vec3 id=floor(p*700.);float h=h13(id);
  float sp=step(.985,h)*step(.5,fract(uTime*.7+h*9.))*smoothstep(.2,.6,sin(uTime*.25)*.5+.5);
  return vec3(1.,.6,.2)*(.18+.25*(1.-smoothstep(0.,.12,p.y)))*(.55+.45*smoothstep(.25,.6,l))+vec3(1.,.95,.85)*sp*6.;
 }
 if(p.y>.004&&n.y<.4){
  vec2 w=vec2((p.x+p.z)*320.,p.y*380.);vec2 id=floor(w),f=fract(w);
  float win=step(.62,h12(id))*step(.25,f.x)*step(f.x,.75)*step(.3,f.y)*step(f.y,.7);
  return vec3(1.,.72,.38)*win*.8;
 }
 if(p.y<.003&&river(p.xz)>0.&&park(p.xz)>0.)return vec3(1.,.55,.2)*.12;
 return vec3(0.);
}
`,
};

const SECTIONS: SkySection[] = [
  { eyebrow: "Above Paris", title: "Bonjour, sky.", body: "Scroll to fall through the clouds." },
  { eyebrow: "Descent", title: "The city appears.", body: "Haussmann rooftops, the Seine, the gardens." },
  { eyebrow: "Champ de Mars", title: "Iron lace, 330 m.", body: "Legs, arches, platforms — modelled in 3D." },
  { eyebrow: "La Tour Eiffel", title: "Paris is always a good idea.", body: "Your story here." },
];

export type EiffelDiveProps = Partial<Omit<SkyDiveProps, "scene">>;

export function EiffelDive({ sections = SECTIONS, ...rest }: EiffelDiveProps) {
  return <SkyDive scene={PARIS} sections={sections} label="Scroll to dive to the Eiffel Tower" {...rest} />;
}

export default EiffelDive;
