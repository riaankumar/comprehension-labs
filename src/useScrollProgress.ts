import {useLayoutEffect, type RefObject} from 'react';
export type ScrollFrame = {progress:number; target:number; scroll:number; span:number; width:number; height:number; dt:number; reduced:boolean};
export function useScrollProgress(track:RefObject<HTMLElement>, render:(frame:ScrollFrame)=>void) {
 useLayoutEffect(()=>{
  const element=track.current;if(!element)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let width=innerWidth,height=innerHeight,span=0,current=0,raf=0,last=0,dirty=true;
  function measure(){width=document.documentElement.clientWidth;height=innerHeight;span=Math.max(0,element!.offsetHeight-height);dirty=true;request();}
  function tick(now:number){
   raf=0;const dt=Math.min(.1,(now-last)/1000||1/60);last=now;
   const reduced=media.matches,scroll=window.scrollY;
   const target=reduced?1:Math.max(0,Math.min(1,scroll/Math.max(1,span)));
   if(reduced||scroll>=span||scroll===0)current=target;
   else {current+=(target-current)*(1-Math.exp(-dt*8));if(Math.abs(current-target)<.0003)current=target;}
   render({progress:current,target,scroll,span:reduced?0:span,width,height,dt,reduced});
   dirty=false;
   if(!document.hidden&&(scroll<=span+height||dirty))raf=requestAnimationFrame(tick);
  }
  function request(){if(!raf)raf=requestAnimationFrame(tick);}
  function motion(){document.documentElement.classList.toggle('reduced-motion',media.matches);measure();}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;request();}}
  const observer=new ResizeObserver(measure);observer.observe(element);
  window.addEventListener('resize',measure);window.addEventListener('orientationchange',measure);window.addEventListener('scroll',request,{passive:true});document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);
  motion();tick(performance.now());
  return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('resize',measure);window.removeEventListener('orientationchange',measure);window.removeEventListener('scroll',request);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);};
 },[track,render]);
}
