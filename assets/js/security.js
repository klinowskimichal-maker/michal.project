(function(){
'use strict';
const OFFICIAL_HOSTS=new Set(['klinowskimichal-maker.github.io','localhost','127.0.0.1']);
const official=OFFICIAL_HOSTS.has(location.hostname);
function protect(){
  document.documentElement.style.setProperty('-webkit-touch-callout','none');
  document.querySelectorAll('img').forEach(img=>{img.draggable=false;img.setAttribute('oncontextmenu','return false')});
  document.addEventListener('contextmenu',event=>{if(!event.target.closest('input,textarea,select'))event.preventDefault()});
  document.addEventListener('dragstart',event=>{if(event.target.closest('img,a'))event.preventDefault()});
  document.addEventListener('copy',event=>{if(!event.target.closest('input,textarea'))event.preventDefault()});
  document.addEventListener('keydown',event=>{
    if(!(event.ctrlKey||event.metaKey))return;
    if(['c','s','u'].includes(event.key.toLowerCase())&&!event.target.matches('input,textarea'))event.preventDefault();
  });
  const seal=document.createElement('div');seal.id='pskl-authenticity';seal.textContent='OFICJALNA WERSJA · PSKL MK · © 2026';seal.setAttribute('aria-label','Oficjalna wersja PSKL MK');
  Object.assign(seal.style,{position:'fixed',right:'8px',bottom:'8px',zIndex:'2147483646',padding:'5px 8px',border:'1px solid rgba(212,160,110,.7)',borderRadius:'4px',background:'rgba(6,27,43,.9)',color:'#e8c49b',font:'700 8px Arial,sans-serif',letterSpacing:'.09em',pointerEvents:'none',opacity:'.82'});
  document.body.appendChild(seal);
  if(!official){
    const warning=document.createElement('div');warning.id='pskl-unauthorised-copy';
    warning.innerHTML='<div><strong>NIEAUTORYZOWANA KOPIA</strong><p>Oficjalna aplikacja PSKL MK jest dostępna wyłącznie pod adresem klinowskimichal-maker.github.io.</p><a href="https://klinowskimichal-maker.github.io/michal.project/udostepnij.html">Otwórz oficjalną wersję</a></div>';
    Object.assign(warning.style,{position:'fixed',inset:'0',zIndex:'2147483647',display:'grid',placeItems:'center',padding:'24px',background:'#061b2b',color:'#fff',fontFamily:'Arial,sans-serif',textAlign:'center'});
    const box=warning.firstElementChild;Object.assign(box.style,{maxWidth:'620px',padding:'38px',border:'1px solid #d4a06e',background:'#0b3147'});
    warning.querySelector('strong').style.cssText='display:block;color:#e8c49b;font-size:24px;letter-spacing:.08em';
    warning.querySelector('p').style.cssText='line-height:1.6;margin:20px 0';
    warning.querySelector('a').style.cssText='display:inline-block;padding:12px 18px;background:#b97943;color:#071b2a;text-decoration:none;font-weight:800';
    document.body.appendChild(warning);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',protect,{once:true});else protect();
})();
