export const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function transition(p:number){
 return {
  treeOpacity:1-smooth((p-.05)/.55),
  treeLift:p*.7,
  identityOpacity:1-smooth(p/.25),
  linksOpacity:1-smooth((p-.25)/.35),
  reveal:smooth((p-.12)/.35),
 };
}
