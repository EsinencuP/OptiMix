import {animate as motionAnimate,type AnimationPlaybackControls} from 'motion';
export function mountHeroShuffle(){
 const found=document.querySelector<HTMLElement>('[data-hero-shuffle]');
 if(!found)return()=>{};
 const root=found;
 const sheets=[...root.querySelectorAll<HTMLElement>('[data-hero-sheet]')].sort((a,b)=>Number(a.dataset.sheetOrder)-Number(b.dataset.sheetOrder));
 const controls=[...root.querySelectorAll<HTMLButtonElement>('[data-hero-choose]')];
 const pause=root.querySelector<HTMLButtonElement>('[data-hero-pause]')!;
 const reduce=window.matchMedia('(prefers-reduced-motion:reduce)');
 const hover=window.matchMedia('(hover:hover) and (pointer:fine)');
 const controller=new AbortController(),options={signal:controller.signal};
 let active=0,timer=0,manualPause=false,inside=false,focused=false,visible=true;
 let windowFocused=document.hasFocus();
 let animations:AnimationPlaybackControls[]=[];
 // Depth transforms preserve the original 74% × 55% rear sheet rectangles.
 const style=getComputedStyle(root);
 const positions=Array.from({length:4},(_,depth)=>style.getPropertyValue(`--hero-depth-${depth}`).trim());
 const stop=()=>{window.clearTimeout(timer);};
 const canRun=()=>!reduce.matches&&!manualPause&&!inside&&!focused&&visible&&windowFocused&&!document.hidden;
 function schedule(){stop();if(canRun())timer=window.setTimeout(()=>select((active+1)%sheets.length,true),3600);}
 function select(next:number,animate:boolean){
  stop(); animations.forEach(animation=>animation.cancel());animations=[];
  const old=active;active=next;
  sheets.forEach((sheet,index)=>{
   const depth=(index-active+sheets.length)%sheets.length;
   const oldDepth=(index-old+sheets.length)%sheets.length;
   sheet.style.zIndex=String(4-depth);
   sheet.dataset.depth=String(depth);
   sheet.setAttribute('aria-hidden',String(depth!==0));
   sheet.style.transform=positions[depth];
   sheet.style.opacity=depth===0?'1':'.9';
   if(animate&&!reduce.matches){
    // The outgoing sheet lifts clear before settling behind; only compositor properties animate.
    const frames=oldDepth===0&&depth===3?[{transform:positions[oldDepth],opacity:1},{transform:'translate(-3%,-17%) rotate(3deg) scale(1.01)',opacity:1,offset:.42},{transform:positions[depth],opacity:.9}]:[{transform:positions[oldDepth],opacity:oldDepth===0?1:.9},{transform:positions[depth],opacity:depth===0?1:.9}];
    animations.push(motionAnimate(sheet,{transform:frames.map(frame=>frame.transform),opacity:frames.map(frame=>frame.opacity)},{duration:.9,ease:[.22,.65,.25,1],times:frames.length===3?[0,.42,1]:[0,1]}));
   }
  });
  controls.forEach((control,index)=>control.setAttribute('aria-pressed',String(index===active)));
  root.dataset.activeSheet=sheets[active].dataset.heroSheet;
  if(animate){timer=window.setTimeout(schedule,900);}else schedule();
 }
 function sync(){
  stop();const stopped=manualPause||reduce.matches;
  pause.setAttribute('aria-label',(stopped?pause.dataset.playLabel:pause.dataset.pauseLabel)!);
  pause.setAttribute('aria-pressed',String(stopped));pause.querySelector('span')!.textContent=stopped?'▶':'Ⅱ';
  animations.forEach(animation=>{if(animation.time>=.9)return;if(canRun())animation.play();else animation.pause();});
  schedule();
 }
 controls.forEach(control=>control.addEventListener('click',()=>{manualPause=true;select(Number(control.dataset.heroChoose),false);sync();},options));
 pause.addEventListener('click',()=>{manualPause=!manualPause;sync();},options);
 root.addEventListener('pointerenter',()=>{if(hover.matches){inside=true;sync();}},options);
 root.addEventListener('pointerleave',()=>{inside=false;sync();},options);
 root.addEventListener('focusin',()=>{focused=true;sync();},options);
 root.addEventListener('focusout',event=>{focused=root.contains(event.relatedTarget as Node);sync();},options);
 document.addEventListener('visibilitychange',sync,options);
 window.addEventListener('blur',()=>{windowFocused=false;sync();},options);
 window.addEventListener('focus',()=>{windowFocused=true;sync();},options);
 reduce.addEventListener('change',()=>{if(reduce.matches)select(0,false);sync();},options);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(root);
 select(0,false);sync();
 root.classList.add('is-shuffling');
 return()=>{stop();animations.forEach(animation=>animation.cancel());observer.disconnect();controller.abort();root.classList.remove('is-shuffling');};
}
