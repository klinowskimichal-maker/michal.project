(function(){
'use strict';
const $=s=>document.querySelector(s);
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if(reduced)return;
const assistant=$('#pskl-assistant');
const pirate=assistant?.querySelector('.pskl-pirate');
if(!assistant||!pirate)return;

const layer=document.createElement('div');
layer.id='pskl-scene-layer';
layer.setAttribute('aria-hidden','true');
document.body.appendChild(layer);
let running=false,sceneIndex=0,lastActivity=Date.now(),timer=null;
const sceneNames=['parrot','cannon','treasure','chase','boat'];
const funnyClasses=['dance','trip','laugh','mapflip','shrug','spyglass','look','crouch','kneel','peek','salute','pointing','point-down'];

['pointerdown','touchstart','keydown','wheel'].forEach(ev=>window.addEventListener(ev,()=>{lastActivity=Date.now()},{passive:true}));
window.addEventListener('scroll',()=>{lastActivity=Date.now()},{passive:true});
function busyUser(){
  const a=document.activeElement,typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);
  return document.hidden||$('.pskl-chat.open')||typing||(Date.now()-lastActivity<4500);
}
function px(){const r=assistant.getBoundingClientRect();return Math.max(55,Math.min(innerWidth-60,r.left+r.width/2))}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function make(tag,cls,parent=layer){const e=document.createElement(tag);e.className=cls;parent.appendChild(e);return e}
function clear(){layer.replaceChildren();document.body.classList.remove('pskl-scene-active');assistant.style.opacity='';assistant.style.transition='';pirate.style.opacity='';}
function pose(name,ms){funnyClasses.forEach(c=>pirate.classList.remove(c));pirate.classList.add(name);setTimeout(()=>pirate.classList.remove(name),ms)}
function clonePirate(){const c=pirate.cloneNode(true);c.removeAttribute('aria-label');c.tabIndex=-1;c.style.pointerEvents='none';funnyClasses.forEach(x=>c.classList.remove(x));return c}
function anim(el,keyframes,options){const a=el.animate(keyframes,{fill:'forwards',...options});return a.finished.catch(()=>{});}
function parrotEl(){const p=make('div','scene-object scene-parrot flying');p.innerHTML='<span class="p-tail"></span><span class="p-wing"></span><span class="p-body"></span><span class="p-head"></span>';return p}
function sparkle(x,y,delay=0){const s=make('i','scene-object scene-sparkle');s.style.left=x+'px';s.style.top=y+'px';setTimeout(()=>anim(s,[{opacity:0,transform:'scale(.3) rotate(0)'},{opacity:1,transform:'scale(1.3) rotate(90deg)',offset:.5},{opacity:0,transform:'scale(.2) rotate(180deg)'}],{duration:900,easing:'ease-in-out'}),delay)}

async function sceneParrot(){
  const p=parrotEl(),x=px(),w=innerWidth;
  p.style.left='0';p.style.top='0';pose('look',1300);
  await anim(p,[
    {transform:`translate(${w+35}px,18px) rotate(-8deg)`},
    {transform:`translate(${clamp(x+95,70,w-35)}px,5px) rotate(-18deg)`,offset:.28},
    {transform:`translate(${clamp(x-55,20,w-45)}px,31px) rotate(15deg)`,offset:.48},
    {transform:`translate(${clamp(x+40,25,w-35)}px,10px) rotate(-12deg)`,offset:.66},
    {transform:`translate(${clamp(x-18,10,w-35)}px,23px) rotate(8deg)`,offset:.82},
    {transform:`translate(${clamp(x+24,15,w-35)}px,31px) rotate(0)`}
  ],{duration:5400,easing:'cubic-bezier(.45,.02,.3,1)'});
  p.classList.remove('flying');pose('peek',1100);await wait(1600);
  await anim(p,[{opacity:1},{opacity:0,transform:`translate(${clamp(x+40,20,w-35)}px,18px) scale(.8)`}],{duration:800,easing:'ease-in'});
}

async function sceneCannon(){
  const x=clamp(px()-85,8,innerWidth-130);pose('crouch',2100);
  const c=make('div','scene-object scene-cannon');c.style.left=x+'px';c.style.top='26px';c.innerHTML='<span class="c-barrel"></span><span class="c-base"></span><span class="c-wheel left"></span><span class="c-wheel right"></span><span class="c-fuse"></span><span class="c-spark"></span>';
  await anim(c,[{opacity:0,transform:'translateY(12px) scale(.85)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:700,easing:'ease-out'});
  c.classList.add('lit');
  // Długi, komiczny lont: Pirat czeka prawie 5 sekund na strzał.
  for(let i=0;i<3;i++){pose(i%2?'peek':'look',900);await wait(1050)}
  await wait(1200);
  c.classList.remove('lit');c.classList.add('fire');pose('shrug',900);
  const smoke=make('div','scene-object scene-smoke');smoke.style.left=(x+50)+'px';smoke.style.top='23px';
  anim(smoke,[{opacity:.9,transform:'scale(.5)'},{opacity:.6,transform:'translate(16px,-6px) scale(1.4)'},{opacity:0,transform:'translate(30px,-9px) scale(2)'}],{duration:1100,easing:'ease-out'});
  const ball=make('div','scene-object scene-cannonball');ball.style.left=(x+55)+'px';ball.style.top='29px';
  const end=clamp(x+145,40,innerWidth-18);
  await anim(ball,[
    {transform:'translate(0,0) scale(1)'},
    {transform:`translate(${(end-(x+55))*.58}px,-18px) scale(1)`,offset:.45},
    {transform:`translate(${end-(x+55)}px,17px) scale(1)`,offset:.88},
    {transform:`translate(${end-(x+55)-7}px,14px) scale(.85)`}
  ],{duration:1450,easing:'cubic-bezier(.23,.72,.48,1)'});
  pose('laugh',1000);await wait(700);
}

async function sceneTreasure(){
  const x=clamp(px()-10,40,innerWidth-70);pose('kneel',3000);
  const hole=make('div','scene-object scene-hole');hole.style.left=(x-9)+'px';hole.style.top='63px';
  anim(hole,[{opacity:0,transform:'scaleX(.3)'},{opacity:.85,transform:'scaleX(1)'}],{duration:500});
  const sh=make('div','scene-object scene-shovel digging');sh.style.left=(x+12)+'px';sh.style.top='19px';
  await wait(2600);sh.classList.remove('digging');
  await anim(sh,[{opacity:1},{opacity:0,transform:'translate(-12px,-14px) rotate(-35deg)'}],{duration:500});
  const t=make('div','scene-object scene-treasure');t.style.left=(x-8)+'px';t.style.top='51px';
  await anim(t,[{opacity:0,transform:'translateY(18px) scale(.7)'},{opacity:1,transform:'translateY(-20px) scale(1)'}],{duration:800,easing:'cubic-bezier(.2,.9,.28,1.15)'});
  t.classList.add('open');pose('dance',1450);
  for(let i=0;i<6;i++)sparkle(clamp(x-10+Math.random()*55,5,innerWidth-10),10+Math.random()*38,i*120);
  await wait(1800);
  await anim(t,[{opacity:1,transform:'translateY(-20px) scale(1)'},{opacity:0,transform:'translateY(12px) scale(.8)'}],{duration:650,easing:'ease-in'});
}

function pursuer(x,delay){const n=make('div','scene-object scene-pursuer running');n.style.left='0';n.style.top='26px';n.innerHTML='<span class="leg a"></span><span class="leg b"></span>';n.dataset.start=x;n.dataset.delay=delay;return n}
function palm(x,scale){const p=make('div','scene-object scene-palm');p.style.left=x+'px';p.style.top='5px';p.style.transform=`scale(${scale})`;p.innerHTML='<span class="trunk"></span><span class="leaf"></span><span class="leaf"></span><span class="leaf"></span><span class="leaf"></span><span class="leaf"></span>';return p}
async function sceneChase(){
  const w=innerWidth;document.body.classList.add('pskl-scene-active');assistant.style.transition='opacity .2s';assistant.style.opacity='0';
  palm(w*.20,.78);palm(w*.51,.9);palm(w*.78,.7);
  const runner=make('div','scene-object scene-runner');runner.style.left='0';runner.style.top='17px';runner.appendChild(clonePirate());
  const p=parrotEl();p.style.left='0';p.style.top='0';
  const purs=[pursuer(w+95,250),pursuer(w+135,430),pursuer(w+175,610)];
  const runnerA=anim(runner,[{transform:`translate(${w+75}px,0) rotate(0)`},{transform:`translate(${w*.55}px,-4px) rotate(-4deg)`,offset:.46},{transform:`translate(${w*.18}px,2px) rotate(4deg)`,offset:.8},{transform:'translate(-90px,-2px) rotate(-3deg)'}],{duration:6900,easing:'linear'});
  runner.animate([{translate:'0 0'},{translate:'0 -4px'},{translate:'0 0'}],{duration:240,iterations:28,easing:'ease-in-out'});
  anim(p,[{transform:`translate(${w+120}px,18px)`},{transform:`translate(${w*.55}px,2px)`,offset:.46},{transform:'translate(-60px,8px)'}],{duration:5900,easing:'linear'});
  purs.forEach((n,i)=>setTimeout(()=>anim(n,[{transform:`translate(${w+100+i*38}px,0)`},{transform:'translate(-80px,0)'}],{duration:6500,easing:'linear'}),Number(n.dataset.delay)));
  await runnerA;await wait(250);assistant.style.opacity='1';
}

async function sceneBoat(){
  const x=clamp(px()-45,5,innerWidth-110);document.body.classList.add('pskl-scene-active');assistant.style.transition='opacity .25s';assistant.style.opacity='0';
  const b=make('div','scene-object scene-boat');b.style.left=x+'px';b.style.top='7px';b.innerHTML='<span class="mast"></span><span class="sail"></span><span class="hull"></span><span class="hole"></span><span class="water"></span>';
  const deck=make('div','scene-deck-pirate',b);deck.appendChild(clonePirate());
  await anim(b,[{opacity:0,transform:'translateX(-35px) scale(.86)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:900,easing:'ease-out'});
  await wait(900);b.classList.add('leaking');
  deck.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-3px) rotate(-6deg)'},{transform:'translateY(0) rotate(5deg)'}],{duration:520,iterations:4,easing:'ease-in-out'});
  await wait(1800);
  await anim(b,[
    {opacity:1,transform:'translateY(0) rotate(0deg)'},
    {opacity:1,transform:'translateY(8px) rotate(5deg)',offset:.35},
    {opacity:.9,transform:'translateY(25px) rotate(10deg)',offset:.66},
    {opacity:0,transform:'translateY(62px) rotate(17deg)'}
  ],{duration:2800,easing:'cubic-bezier(.45,.03,.7,.7)'});
  assistant.style.opacity='1';
}

const scenes=[sceneParrot,sceneCannon,sceneTreasure,sceneChase,sceneBoat];
async function runNext(){
  if(running||busyUser()){schedule(8000);return}
  running=true;clear();document.body.classList.add('pskl-scene-active');
  const name=sceneNames[sceneIndex];
  try{await scenes[sceneIndex]()}catch(e){console.warn('PSKŁ pirate scene failed:',name,e)}
  sceneIndex=(sceneIndex+1)%scenes.length;
  await wait(250);clear();running=false;schedule(30000);
}
function schedule(ms){clearTimeout(timer);timer=setTimeout(runNext,ms)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);if(running)clear()}else if(!running)schedule(12000)});
window.PSKL_PIRATE_SCENES={play:i=>{if(Number.isInteger(i)&&i>=0&&i<scenes.length){sceneIndex=i;clearTimeout(timer);runNext()}},names:sceneNames};
schedule(22000);
})();
