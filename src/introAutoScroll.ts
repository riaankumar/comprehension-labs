// Give an untouched opening screen 30 visible seconds before advancing.
// Any manual input takes over, and this runs at most once per page load.
export function createIntroAutoScroll(){
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let timer:number|undefined,done=false,scrolling=false;
 const eligible=()=>!done&&!document.hidden&&!motion.matches&&
  !document.documentElement.classList.contains('reduced-motion')&&
  location.pathname==='/'&&!location.hash&&window.scrollY<=2;
 function clear(){window.clearTimeout(timer);timer=undefined;}
 function cancel(){
  done=true;clear();
  if(scrolling)window.scrollTo({top:window.scrollY,behavior:'instant'});
  scrolling=false;
 }
 function arm(){
  clear();
  if(!eligible())return;
  timer=window.setTimeout(()=>{
   timer=undefined;
   if(!eligible())return;
   done=true;scrolling=true;
   window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'});
  },30_000);
 }
 function scroll(){
  if(scrolling){
   if(window.scrollY>=document.documentElement.scrollHeight-innerHeight-2)scrolling=false;
  }else if(window.scrollY>2)cancel();
 }
 function visibility(){
  // Returning to an untouched tab gets a fresh delay, never a surprise jump.
  if(document.hidden&&scrolling)cancel();
  arm();
 }
 function preference(){if(motion.matches)cancel();}
 const inputEvents=['wheel','touchstart','pointerdown','keydown'] as const;
 for(const event of inputEvents)window.addEventListener(event,cancel,{passive:true});
 window.addEventListener('scroll',scroll,{passive:true});
 document.addEventListener('visibilitychange',visibility);
 motion.addEventListener('change',preference);
 arm();
 return()=>{
  cancel();
  for(const event of inputEvents)window.removeEventListener(event,cancel);
  window.removeEventListener('scroll',scroll);
  document.removeEventListener('visibilitychange',visibility);
  motion.removeEventListener('change',preference);
 };
}
