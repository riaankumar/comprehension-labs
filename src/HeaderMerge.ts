import {clamp,mix,smooth} from '@/layout';
import type {ScrollFrame} from '@/useScrollProgress';

// Animate the original brand itself. Its natural layout slot stays in the
// header, so there is no duplicate title or swap when it reaches the page.
export function createHeaderMerge(shell:HTMLElement,identity:HTMLElement){
 const brand=shell.querySelector<HTMLElement>('.brand')!;
 const main=shell.querySelector<HTMLElement>('main')!;
 const controls=Array.from(shell.querySelectorAll<HTMLElement>('header nav, .theme-toggle'));
 let dirty=true,width=0,height=0;
 let metrics={x:0,y:0,w:0,h:0,scale:1,startX:0,startY:0};
 const observer=new ResizeObserver(()=>{dirty=true;});
 observer.observe(shell);observer.observe(identity);
 const fontsChanged=()=>{dirty=true;};
 document.fonts.addEventListener('loadingdone',fontsChanged);
 return {
  render(f:ScrollFrame,p:number,reveal:number,reduced:boolean){
   if(dirty||width!==f.width||height!==f.height){
    const style=getComputedStyle(brand),size=Number.parseFloat(style.fontSize);
    const w=Number.parseFloat(style.width),h=Number.parseFloat(style.height);
    // Layout offsets do not move with the viewport or the current transform.
    // Measuring screen coordinates here breaks a resize/reload below the intro.
    let x=shell.getBoundingClientRect().left,y=0,node:HTMLElement|null=brand;
    while(node&&node!==shell){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent as HTMLElement|null;}
    const introSize=Math.max(size,f.height<=500?24:clamp(f.width*.04,28,44));
    const scale=introSize/size;
    metrics={x,y,w,h,scale,startX:(f.width-w*scale)/2,startY:identity.offsetTop-12-h*scale};
    width=f.width;height=f.height;dirty=false;
   }
   const m=metrics,t=reduced?1:smooth(p/.6),scale=mix(m.scale,1,t);
   const dx=(m.startX-m.x)*(1-t),dy=(m.startY-f.span-m.y)*(1-t);
   brand.style.transform=t===1?'none':`translate(${dx}px,${dy}px) scale(${scale})`;
   // Keep the supporting line attached to the moving name until it fades.
   const center=m.x+dx+m.w*scale/2;
   const bottom=f.span+m.y-f.scroll+dy+m.h*scale;
   identity.style.transform=reduced?'none':`translate(${center-f.width/2}px,${bottom-(m.startY+m.h*m.scale)}px)`;
   main.style.opacity=String(reduced?1:reveal);main.inert=!reduced&&reveal<.5;
   for(const el of controls){
    el.style.opacity=String(reduced?1:reveal);
    el.inert=!reduced&&reveal<.5;
   }
  },
  destroy(){observer.disconnect();document.fonts.removeEventListener('loadingdone',fontsChanged);},
 };
}
