import {clamp,mix,smooth} from '@/layout';
import type {ScrollFrame} from '@/useScrollProgress';

// Animate the original brand itself. Its natural layout slot stays in the
// header, so there is no duplicate title or swap when it reaches the page.
export function createHeaderMerge(shell:HTMLElement,identity:HTMLElement){
 const brand=shell.querySelector<HTMLElement>('.brand')!;
 const main=shell.querySelector<HTMLElement>('main')!;
 const controls=Array.from(shell.querySelectorAll<HTMLElement>('header nav, .theme-toggle, .header-tagline'));
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
   // Use the rendered title as the anchor. On mobile Safari, CSS viewport
   // units and innerHeight can differ while the browser toolbar is visible.
   // Reconstructing this position from the scroll span separates the two.
   if(reduced)identity.style.transform='none';
   else {
    const title=brand.getBoundingClientRect();
    const stage=identity.parentElement!.getBoundingClientRect();
    const naturalTop=stage.top+identity.offsetTop;
    const naturalCenter=stage.left+stage.width/2;
    identity.style.transform=`translate(${title.left+title.width/2-naturalCenter}px,${title.bottom+12-naturalTop}px)`;
   }
   main.style.opacity=String(reduced?1:reveal);main.inert=!reduced&&reveal<.5;
   for(const el of controls){
    // Reveal the page subtitle after its intro copy has disappeared.
    const opacity=reduced?1:el.matches('.header-tagline')?smooth((p-.25)/.22):reveal;
    el.style.opacity=String(opacity);
    el.inert=!reduced&&opacity<.5;
   }
  },
  destroy(){observer.disconnect();document.fonts.removeEventListener('loadingdone',fontsChanged);},
 };
}
