import {useCallback,useLayoutEffect,useRef} from 'react';
import legacy from '@/legacy.html?raw';
import {createScene} from '@/TreeScene';
import {createHeaderMerge} from '@/HeaderMerge';
import {transition} from '@/layout';
import {useScrollProgress,type ScrollFrame} from '@/useScrollProgress';
export default function App(){
 const track=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),shell=useRef<HTMLDivElement>(null),scene=useRef<ReturnType<typeof createScene>>(null);
 const live=useRef(true),identity=useRef<HTMLDivElement>(null),introLinks=useRef<HTMLElement>(null);
 const header=useRef<ReturnType<typeof createHeaderMerge>|null>(null);
 useLayoutEffect(()=>{
  live.current=true;scene.current=createScene(canvas.current!);
  if(!scene.current)document.documentElement.classList.add('reduced-motion');
  const container=shell.current!,theme=container.querySelector<HTMLButtonElement>('.theme-toggle')!;
  header.current=createHeaderMerge(container,identity.current!);
  theme.hidden=false;
  function toggleTheme(){const root=document.documentElement;root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';theme.setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');}
  theme.addEventListener('click',toggleTheme);
  const jump=(id:string,focus=false)=>{
   const target=document.getElementById(id);if(!target)return;
   const end=document.documentElement.classList.contains('reduced-motion')?0:Math.max(0,track.current!.offsetHeight-innerHeight);
   // offsetTop is untransformed, so an anchor works even during the cinematic intro.
   let top=0,el:HTMLElement|null=target;while(el&&el!==container){top+=el.offsetTop;el=el.offsetParent as HTMLElement|null;}
   window.scrollTo({top:end+top-24,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   if(focus){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  };
  const sections=['data','approach','research','contact'];
  function linkClick(e:MouseEvent){
   const a=(e.target as Element).closest<HTMLAnchorElement>('a[href]');
   if(!a||a.origin!==location.origin||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   const path=a.pathname.replace(/^\/+|\/+$/g,'');
   const id=a.hash.slice(1)||(sections.includes(path)?path:'');
   if(!id||!document.getElementById(id))return;
   e.preventDefault();history.pushState(null,'',a.hash?'#'+id:a.pathname);jump(id,true);
  }
  function hash(){
   const path=location.pathname.replace(/^\/+|\/+$/g,'');
   const id=location.hash.slice(1)||(sections.includes(path)?path:'');
   if(id)jump(id);
  }
  container.addEventListener('click',linkClick);window.addEventListener('hashchange',hash);window.addEventListener('popstate',hash);
  document.fonts.ready.then(()=>{if(live.current){hash();}});
  return()=>{live.current=false;scene.current?.destroy();scene.current=null;header.current?.destroy();header.current=null;theme.removeEventListener('click',toggleTheme);container.removeEventListener('click',linkClick);window.removeEventListener('hashchange',hash);window.removeEventListener('popstate',hash);};
 },[]);
 const render=useCallback((f:ScrollFrame)=>{
  const element=shell.current;if(!element)return;const reduced=f.reduced||!scene.current;
  const p=reduced?1:f.progress,L=transition(p);
  scene.current?.draw(f);
  const identityOpacity=reduced?0:L.identityOpacity,linksOpacity=reduced?0:L.linksOpacity;
  if(identity.current){identity.current.style.opacity=String(identityOpacity);identity.current.style.visibility=identityOpacity>0?'visible':'hidden';}
  if(introLinks.current){introLinks.current.style.opacity=String(linksOpacity);introLinks.current.style.visibility=linksOpacity>0?'visible':'hidden';introLinks.current.inert=linksOpacity<.1;}
  header.current?.render(f,p,L.reveal,reduced);

  // The original site stays at full size in normal document flow throughout.
  // Its top rises naturally from the viewport bottom as the tree fades upward.
  element.style.transform='none';element.style.clipPath='none';element.style.boxShadow='none';
  element.style.opacity='1';
  element.inert=false;element.style.pointerEvents='auto';
  canvas.current!.style.pointerEvents=L.treeOpacity>.1?'auto':'none';
  Object.assign(track.current!.dataset,{progress:p.toFixed(4),target:f.target.toFixed(4),span:String(f.span),reveal:L.reveal.toFixed(4)});
 },[]);
 useScrollProgress(track,render);
 return <>
  <a className="skip-animation" href="#research" onClick={e=>{e.preventDefault();const end=Math.max(0,track.current!.offsetHeight-innerHeight);window.scrollTo({top:end,behavior:'instant'});shell.current!.inert=false;const research=document.getElementById('research');research?.setAttribute('tabindex','-1');research?.focus({preventScroll:true});}}>Skip animation</a>
  <section ref={track} className="scroll-track relative h-[200vh]" aria-label="A tree of human knowledge fades directly into the website as you scroll">
   <div className="sticky top-0 h-screen w-full overflow-hidden scene-stage">
    <canvas ref={canvas} className="absolute inset-0 h-full w-full scene-canvas" aria-hidden="true"/>
    <nav ref={introLinks} className="scene-links" aria-label="Social and contact">
     <a href="https://x.com/ComprehensionAI" target="_blank" rel="noopener noreferrer" aria-label="Comprehension Labs on X" title="Comprehension Labs on X">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>
     </a>
     <a href="mailto:founders@comprehensionlabs.com" aria-label="Contact Comprehension Labs" title="Contact Comprehension Labs">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
     </a>
    </nav>
    <div ref={identity} className="scene-identity">
     <p className="scene-tagline">Human knowledge for more capable AI.</p>
    </div>
   </div>
  </section>
  <div className="site-bridge relative">
   <div ref={shell} className="site-shell" dangerouslySetInnerHTML={{__html:legacy}}/>
  </div>
 </>;
}
