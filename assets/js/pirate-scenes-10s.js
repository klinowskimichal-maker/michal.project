(function(){
'use strict';
const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
if(window.PSKL_PIRATE_SCENES_10S||motion?.matches)return;
const $=s=>document.querySelector(s);
const layer=document.createElement('div');layer.id='pskl-scene-layer';layer.setAttribute('aria-hidden','true');
$('#pskl-scene-layer')?.remove();document.body.appendChild(layer);
let running=false,index=0,interrupted=false;
const active=new Set(),poses=['look','crouch','laugh','kneel','dance','salute'];
const assistant=()=>$('#pskl-assistant'),pirate=()=>$('#pskl-assistant .pskl-pirate');
const centerX=()=>{const r=assistant()?.getBoundingClientRect();return r?Math.max(50,Math.min(innerWidth-70,r.left+r.width/2)):90};
const make=(cls,markup='')=>{const e=document.createElement('div');e.className='scene-object '+cls;e.innerHTML=markup;layer.appendChild(e);return e};
async function wait(ms){await new Promise(r=>setTimeout(r,ms));if(interrupted)throw new Error('Scene paused')}
async function animate(el,keys,options){
 if(interrupted)throw new Error('Scene paused');
 const animation=el.animate(keys,{fill:'forwards',...options});active.add(animation);
 try{await animation.finished}finally{active.delete(animation)}
 if(interrupted)throw new Error('Scene paused');
}
function pose(cls){const p=pirate();if(p){poses.forEach(x=>p.classList.remove(x));p.classList.add(cls)}}
function hideHome(){const a=assistant();if(a){a.style.setProperty('opacity','0','important');a.style.pointerEvents='none'}}
function clear(){
 active.forEach(a=>a.cancel?.());active.clear();layer.replaceChildren();layer.getAnimations?.().forEach(a=>a.cancel());
 const a=assistant();if(a){a.style.opacity='';a.style.pointerEvents=''}
 const p=pirate();if(p)poses.forEach(x=>p.classList.remove(x));
}
function clonePirate(){const c=pirate()?.cloneNode(true);if(c){c.removeAttribute('aria-label');c.tabIndex=-1;c.style.pointerEvents='none';poses.forEach(x=>c.classList.remove(x))}return c}
async function parrot(){
 const p=make('scene-parrot flying','<div class="parrot-facing"><span class="p-tail"></span><span class="p-wing"></span><span class="p-body"></span><span class="p-head"></span></div>');
 pose('look');
 await animate(p,[{transform:`translate(${innerWidth+30}px,15px)`},{transform:`translate(${centerX()+60}px,4px)`,offset:.6},{transform:`translate(${centerX()+15}px,18px)`}],{duration:3300,easing:'cubic-bezier(.3,0,.2,1)'});
 p.classList.remove('flying');pose('salute');await wait(1100);p.classList.add('flying');
 await animate(p,[{transform:`translate(${centerX()+15}px,18px)`},{transform:'translate(-45px,4px)'}],{duration:1400,easing:'ease-in'});
}
async function cannon(){
 const x=Math.max(8,Math.min(innerWidth-110,centerX()-70));
 const c=make('scene-cannon lit','<span class="c-barrel"></span><span class="c-base"></span><span class="c-wheel left"></span><span class="c-wheel right"></span><span class="c-fuse"></span><span class="c-spark"></span>');c.style.left=x+'px';c.style.top='18px';
 pose('crouch');await animate(c,[{opacity:0,transform:'translateX(-18px)'},{opacity:1,transform:'translateX(0)'}],{duration:600,easing:'ease-out'});
 await wait(1400);c.classList.remove('lit');c.classList.add('fire');
 const b=make('scene-cannonball');b.style.left=(x+60)+'px';b.style.top='27px';
 const smoke=make('scene-smoke');smoke.style.left=(x+50)+'px';smoke.style.top='20px';
 await Promise.all([
  animate(b,[{transform:'translate(0,0)'},{transform:'translate(100px,-16px)',offset:.35},{transform:`translate(${innerWidth-x}px,26px)`}],{duration:1500,easing:'linear'}),
  animate(smoke,[{opacity:0,transform:'scale(.5)'},{opacity:.8,offset:.2},{opacity:0,transform:'translate(20px,-15px) scale(2.3)'}],{duration:1700,easing:'ease-out'})
 ]);pose('laugh');await wait(900);
}
async function treasure(){
 const x=Math.max(25,Math.min(innerWidth-70,centerX()-5));
 const h=make('scene-hole'),sh=make('scene-shovel digging');h.style.left=(x-12)+'px';h.style.top='52px';sh.style.left=(x+10)+'px';sh.style.top='8px';pose('kneel');
 await animate(h,[{opacity:0},{opacity:.9}],{duration:400});await wait(1800);sh.classList.remove('digging');
 const t=make('scene-treasure','<span class="t-box"></span><span class="t-lid"></span><span class="t-gold"></span>');t.style.left=(x-8)+'px';t.style.top='38px';
 await animate(t,[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(-8px)'}],{duration:800,easing:'ease-out'});
 t.classList.add('open');pose('dance');
 const sparks=Array.from({length:5},(_,i)=>{const s=make('scene-sparkle');s.style.left=(x+i*6)+'px';s.style.top='31px';return animate(s,[{opacity:0,transform:'translateY(0) scale(.4)'},{opacity:1,offset:.3},{opacity:0,transform:`translate(${(i-2)*8}px,-25px) rotate(100deg)`}],{duration:1300,delay:i*80,easing:'ease-out'})});
 await Promise.all(sparks);await wait(500);
}
async function chase(){
 if(!assistant())return;hideHome();
 const r=make('scene-runner');r.style.top='6px';const cp=clonePirate();if(cp)r.appendChild(cp);
 const followers=Array.from({length:3},(_,i)=>{const n=make('scene-pursuer running','<span class="leg a"></span><span class="leg b"></span>');n.style.top='15px';return animate(n,[{transform:`translateX(${innerWidth+135+i*36}px)`},{transform:`translateX(${-140+i*36}px)`}],{duration:5700,easing:'linear'})});
 await Promise.all([animate(r,[{transform:`translateX(${innerWidth+35}px)`},{transform:'translateX(-240px)'}],{duration:5700,easing:'linear'}),...followers]);
}
async function boat(){
 if(!assistant())return;hideHome();
 const x=Math.max(5,Math.min(innerWidth-115,centerX()-45));
 const b=make('scene-boat','<span class="mast"></span><span class="sail"></span><span class="hull"></span><span class="hole"></span><span class="water"></span>');b.style.left=x+'px';b.style.top='0';
 const d=document.createElement('div');d.className='scene-deck-pirate';const cp=clonePirate();if(cp)d.appendChild(cp);b.appendChild(d);
 await animate(b,[{opacity:0,transform:'translateX(-30px) rotate(-4deg)'},{opacity:1,transform:'translateX(0) rotate(0)'}],{duration:800,easing:'ease-out'});
 await wait(600);b.classList.add('leaking');
 await animate(b,[{transform:'rotate(-3deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-3deg)'}],{duration:700,iterations:2,easing:'ease-in-out'});
 await animate(b,[{opacity:1,transform:'translateY(0) rotate(0)'},{opacity:.9,transform:'translateY(20px) rotate(8deg)',offset:.5},{opacity:0,transform:'translateY(65px) rotate(19deg)'}],{duration:2100,easing:'ease-in'});
}
const scenes=[parrot,cannon,treasure,chase,boat];
async function run(){
 if(running||document.hidden||motion?.matches||$('.pskl-chat.open'))return;
 running=true;interrupted=false;clear();
 try{
  await scenes[index]();
  await animate(layer,[{opacity:1},{opacity:0}],{duration:250});
 }catch(e){if(!interrupted)console.warn('Nie udało się odtworzyć scenki Pirata:',e)}
 finally{
  const hidden=assistant()?.style.opacity==='0';clear();
  if(hidden&&!document.hidden&&!interrupted)assistant()?.animate([{opacity:0},{opacity:1}],{duration:350,easing:'ease-out'});
  index=(index+1)%scenes.length;running=false;
 }
}
function pause(){interrupted=true;clear()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
motion?.addEventListener?.('change',e=>{if(e.matches)pause()});
setInterval(run,10000);
window.PSKL_PIRATE_SCENES_10S={playNow:run,names:['papuga','armata','skarb','pościg','łódź']};
})();
