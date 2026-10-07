import {clamp,smooth,transition} from '@/layout';
import {knowledgeTree,type Point3} from '@/KnowledgeTree';
import type {ScrollFrame} from '@/useScrollProgress';
type Atom={source:Point3;r:number;q:number;dx:number;dy:number;vx:number;vy:number};
const rand=(n:number)=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
export function createScene(canvas:HTMLCanvasElement){
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 let atoms:Atom[]=[],width=0,height=0,pointer:{x:number;y:number}|null=null;
 const controller=new AbortController(),tree=knowledgeTree();
 function resize(w:number,h:number){
  width=w;height=h;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);
  atoms=Array.from({length:w<600?5600:13000},(_,i)=>{
   const t=tree[Math.floor(rand(i+293)*tree.length)];
   return {source:{x:t.x+(rand(i+89)-.5)*.016,y:t.y+(rand(i+97)-.5)*.016,z:t.z+(rand(i+103)-.5)*.016},r:rand(i),q:rand(i+800),dx:0,dy:0,vx:0,vy:0};
  });
 }
 function draw(f:ScrollFrame){
  if(width!==f.width||height!==f.height)resize(f.width,f.height);
  const {progress:p,dt}=f,L=transition(p),dark=document.documentElement.dataset.theme==='dark';
  ctx!.clearRect(0,0,width,height);
  Object.assign(canvas.dataset,{progress:p.toFixed(4),particles:String(atoms.length),symbol:'human-knowledge-tree',displacement:'0',scrollDisplacement:'0'});
  if(f.reduced||L.treeOpacity===0)return;
  const lift=height*L.treeLift+clamp((500-height)/110)*28,groundY=height*.78-lift;
  const ground=ctx!.createRadialGradient(width/2,groundY,0,width/2,groundY,Math.min(width*.36,height*.3));
  ground.addColorStop(0,dark?'rgba(255,255,255,.055)':'rgba(0,0,0,.055)');ground.addColorStop(1,'rgba(0,0,0,0)');
  ctx!.save();ctx!.translate(0,groundY);ctx!.scale(1,.16);ctx!.translate(0,-groundY);ctx!.fillStyle=ground;ctx!.globalAlpha=(1-smooth(p/.55))*L.treeOpacity;ctx!.fillRect(0,-height,width,height*9);ctx!.restore();
  // Each atom follows its own scroll-driven arc. No time accumulator: reversing
  // the scroll retraces every trajectory and restores the same branching tree.
  const angle=-.26+p*1.1,cos=Math.cos(angle),sin=Math.sin(angle),step=Math.min(dt,.04)*60;
  const fieldX=Math.min(width*.44,height*.46),fieldY=Math.min(height*.30,width*.70);let max=0,scrollMax=0;
  ctx!.fillStyle=dark?'#ececec':'#303030';
  for(const a of atoms){
   const source=a.source;
   const release=smooth((p-.015-a.r*.025)/.4),phase=a.q*Math.PI*2+p*(4+a.r*5);
   const mx=release*(Math.cos(phase)*(.22+a.r*.65)+source.x*.3);
   const my=-release*(.25+a.q*.7);
   const mz=release*Math.sin(phase)*(.18+a.q*.5);
   const px=source.x+mx,py=source.y+my,pz=source.z+mz;
   const sx=px*cos+pz*sin,sz=-px*sin+pz*cos,perspective=1/(1+sz*.3);
   const x=width/2+sx*fieldX*perspective,y=height*.48+py*fieldY*perspective-lift;
   const baseX=source.x*cos+source.z*sin,baseZ=-source.x*sin+source.z*cos,basePerspective=1/(1+baseZ*.3);
   scrollMax=Math.max(scrollMax,Math.hypot(sx*fieldX*perspective-baseX*fieldX*basePerspective,py*fieldY*perspective-source.y*fieldY*basePerspective));
   let fx=-a.dx*.03,fy=-a.dy*.03;
   if(pointer){const dx=x+a.dx-pointer.x,dy=y+a.dy-pointer.y,d=Math.max(1,Math.hypot(dx,dy));if(d<105){const force=Math.pow(1-d/105,2)*2;fx+=dx/d*force;fy+=dy/d*force;}}
   a.vx=(a.vx+fx*step)*Math.pow(.85,step);a.vy=(a.vy+fy*step)*Math.pow(.85,step);a.dx+=a.vx*step;a.dy+=a.vy*step;max=Math.max(max,Math.hypot(a.dx,a.dy));
   ctx!.globalAlpha=(.26+a.r*.62)*L.treeOpacity;ctx!.beginPath();ctx!.arc(x+a.dx,y+a.dy,(.55+a.q*.75)*clamp(width/1000,.75,1),0,Math.PI*2);ctx!.fill();
  }
  ctx!.globalAlpha=1;canvas.dataset.displacement=max.toFixed(2);canvas.dataset.scrollDisplacement=scrollMax.toFixed(2);
 }
 canvas.addEventListener('pointermove',e=>{const box=canvas.getBoundingClientRect();pointer={x:e.clientX-box.left,y:e.clientY-box.top};},{signal:controller.signal});
 canvas.addEventListener('pointerleave',()=>{pointer=null;},{signal:controller.signal});
 return {draw,destroy:()=>controller.abort()};
}
