(function(){
'use strict';
const $=s=>document.querySelector(s);
function scrollToModels(country){
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
document.addEventListener('click',e=>{
  const country=e.target.closest('.country-card');
  if(country)scrollToModels(country.dataset.country||'');
},true);

function exposePirate(){
  const root=$('#pskl-assistant');
  if(!root)return false;
  root.style.setProperty('display','block','important');
  root.style.setProperty('visibility','visible','important');
  root.style.setProperty('opacity','1','important');
  root.style.setProperty('z-index','10050','important');
  const pirate=root.querySelector('.pskl-pirate');
  if(pirate){pirate.style.setProperty('display','block','important');pirate.style.setProperty('visibility','visible','important');pirate.style.setProperty('opacity','1','important');}
  return true;
}
function ensurePirate(){
  if(exposePirate())return;
  if(window.__psklPirateRetry)return;
  window.__psklPirateRetry=true;
  const s=document.createElement('script');
  s.src='assets/js/assistant.js?v=25';
  s.onload=()=>{exposePirate();if(!window.PSKL_PIRATE_SCENES){const sc=document.createElement('script');sc.src='assets/js/assistant-scenes.js?v=25';document.body.appendChild(sc);}};
  document.body.appendChild(s);
}
setTimeout(ensurePirate,250);
setTimeout(ensurePirate,1600);
})();