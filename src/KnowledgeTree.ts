// A deterministic branching structure: human knowledge grounded in human learning.
// The same branching sculpture is restored as the user scrolls back to the top.
export type Point3 = {x:number;y:number;z:number};
const noise=(n:number)=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
export function knowledgeTree(){
 const points:Point3[]=[];
 const branch=(a:Point3,b:Point3,radius:number,depth:number,seed:number)=>{
  const length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z),count=Math.ceil(length*1100);
  for(let i=0;i<count;i++){
   const t=noise(seed+i*4),angle=noise(seed+i*4+1)*Math.PI*2,r=radius*(1-t*.72)*Math.sqrt(noise(seed+i*4+2));
   points.push({x:a.x+(b.x-a.x)*(t*.7+t*t*.3)+Math.sin(t*Math.PI)*(noise(seed+13)-.5)*.13+Math.cos(angle)*r,y:a.y+(b.y-a.y)*t+Math.sin(t*Math.PI)*.055,z:a.z+(b.z-a.z)*t+Math.sin(angle)*r});
  }
  if(depth<0)return;
  if(depth===0){
   for(let i=0;i<210;i++){
    const u=noise(seed+i*5+10)*Math.PI*2,v=noise(seed+i*5+11)*2-1,r=Math.cbrt(noise(seed+i*5+12));
    points.push({x:b.x+Math.cos(u)*Math.sqrt(1-v*v)*r*.20,y:b.y+v*r*.18,z:b.z+Math.sin(u)*Math.sqrt(1-v*v)*r*.18});
   }
   return;
  }
  for(let j=0;j<3;j++){
   const angle=(j/3+noise(seed+7)*.5)*Math.PI*2,spread=depth===3?.58:depth===2?.31:.15;
   const next={x:b.x+Math.cos(angle)*spread,y:b.y-(.13+noise(seed+j+44)*.14),z:b.z+Math.sin(angle)*spread*.55};
   branch(b,next,radius*.48,depth-1,seed*1.71+j*317);
  }
 };
 branch({x:0,y:.93,z:0},{x:-.035,y:.24,z:0},.085,3,42);
 // Exposed roots make the silhouette read as a tree rather than a spherical cloud.
 for(let j=0;j<9;j++){
  const a=j/9*Math.PI*2;
  branch({x:0,y:.89,z:0},{x:Math.cos(a)*.27,y:.98,z:Math.sin(a)*.16},.03,-1,600+j*17);
 }
 return points;
}
