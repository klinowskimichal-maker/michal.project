(function(){
'use strict';
const $=s=>document.querySelector(s);
function scrollToModels(){
  setTimeout(()=>{
    const target=$('#modelList');
    if(!target||!target.children.length)return;
    const header=document.querySelector('.topbar');
    const option=document.querySelector('.optionbar');
    const offset=(header?.offsetHeight||70)+(option?.offsetHeight||0)+14;
    const y=target.getBoundingClientRect().top+window.scrollY-offset;
    window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
  },140);
}
document.addEventListener('click',e=>{if(e.target.closest('.country-card'))scrollToModels();},true);

const pirateMarkup=`<button class="pskl-pirate" type="button" aria-label="Piracki Asystent PSKŁ"><span class="map-glow"></span><span class="pirate-hat"></span><span class="pirate-head"><span class="pirate-ear"></span><span class="pirate-patch"></span><span class="pirate-eye"></span><span class="pirate-nose"></span><span class="pirate-smile"></span><span class="pirate-beard"></span></span><span class="pirate-body"></span><span class="pirate-belt"></span><span class="pirate-arm left"><span class="pirate-hand"></span></span><span class="pirate-arm right"><span class="pirate-hand"></span></span><span class="pirate-map"></span><span class="pirate-leg left"></span><span class="pirate-leg right"></span><span class="pirate-boot left"></span><span class="pirate-boot right"></span></button>`;
function forceVisible(root){
  if(!root)return false;
  root.style.setProperty('display','block','important');
  root.style.setProperty('visibility','visible','important');
  root.style.setProperty('opacity','1','important');
  root.style.setProperty('z-index','10080','important');
  root.style.setProperty('position','fixed','important');
  root.style.setProperty('top','2px','important');
  root.style.setProperty('left',innerWidth<760?'72px':'95px','important');
  if(!root.querySelector('.pskl-pirate'))root.insertAdjacentHTML('afterbegin',pirateMarkup);
  const pirate=root.querySelector('.pskl-pirate');
  pirate.style.setProperty('display','block','important');
  pirate.style.setProperty('visibility','visible','important');
  pirate.style.setProperty('opacity','1','important');
  pirate.style.setProperty('pointer-events','auto','important');
  return true;
}
function createPirate(){
  let root=$('#pskl-assistant');
  if(!root){
    root=document.createElement('div');
    root.id='pskl-assistant';
    root.dataset.failsafe='1';
    root.innerHTML=pirateMarkup;
    document.body.appendChild(root);
  }
  forceVisible(root);
  const pirate=root.querySelector('.pskl-pirate');
  if(!pirate.dataset.failsafeClick){
    pirate.dataset.failsafeClick='1';
    pirate.addEventListener('click',()=>{
      const chat=document.querySelector('.pskl-chat');
      if(chat){chat.classList.add('open');return;}
      pirate.classList.remove('salute');void pirate.offsetWidth;pirate.classList.add('salute');
      setTimeout(()=>pirate.classList.remove('salute'),1500);
    });
  }
  return root;
}
createPirate();
setTimeout(createPirate,300);
setTimeout(createPirate,1400);
setTimeout(()=>{
  const root=createPirate(),pirate=root.querySelector('.pskl-pirate');
  pirate.classList.add('peek');
  setTimeout(()=>pirate.classList.remove('peek'),1400);
},700);
window.addEventListener('resize',()=>forceVisible($('#pskl-assistant')));
})();