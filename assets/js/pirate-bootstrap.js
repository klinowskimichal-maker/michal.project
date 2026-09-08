(function(){
'use strict';
if(document.getElementById('pskl-assistant')) return;
const root=document.createElement('div');
root.id='pskl-assistant';
root.setAttribute('data-bootstrap','1');
root.innerHTML=`<button class="pskl-pirate" type="button" aria-label="Piracki Asystent PSKŁ">
<span class="map-glow"></span><span class="pirate-hat"></span><span class="pirate-head"><span class="pirate-ear"></span><span class="pirate-patch"></span><span class="pirate-eye"></span><span class="pirate-nose"></span><span class="pirate-smile"></span><span class="pirate-beard"></span></span><span class="pirate-body"></span><span class="pirate-belt"></span><span class="pirate-arm left"><span class="pirate-hand"></span></span><span class="pirate-arm right"><span class="pirate-hand"></span></span><span class="pirate-map"></span><span class="pirate-leg left"></span><span class="pirate-leg right"></span><span class="pirate-boot left"></span><span class="pirate-boot right"></span></button><div class="pskl-bootstrap-bubble">Ahoj! 🏴‍☠️</div>`;
document.body.appendChild(root);
root.style.setProperty('display','block','important');
root.style.setProperty('visibility','visible','important');
root.style.setProperty('opacity','1','important');
root.style.setProperty('z-index','10060','important');
root.style.left=innerWidth<760?'72px':'95px';
root.style.top='2px';
const pirate=root.querySelector('.pskl-pirate');
const bubble=root.querySelector('.pskl-bootstrap-bubble');
pirate.style.setProperty('display','block','important');
pirate.style.setProperty('visibility','visible','important');
pirate.style.setProperty('opacity','1','important');
function hello(){
 pirate.classList.remove('peek','salute','dance');
 pirate.classList.add('salute');
 if(bubble){bubble.classList.add('show');setTimeout(()=>bubble.classList.remove('show'),2600)}
 setTimeout(()=>pirate.classList.remove('salute'),1500);
}
pirate.addEventListener('click',()=>{
 const chat=document.querySelector('.pskl-chat');
 if(chat){chat.classList.add('open');return;}
 hello();
});
setTimeout(hello,650);
window.addEventListener('resize',()=>{root.style.left=innerWidth<760?'72px':'95px'});
window.PSKL_PIRATE_BOOTSTRAPPED=true;
})();