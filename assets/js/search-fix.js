(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=s=>norm(s).replace(/ł/g,'l').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let patching=false;

/* Filtr Drewno ma obejmować cały rynek drewnianych łodzi, bez faworyzowania jednej marki. */
try{
  const broadWood={finn:'trebåt',blocket:'träbåt',boat24:'wooden boat',yachtworld:'wooden boat',aba:'wooden boat',cbc:'wooden boat'};
  PORTALS.forEach(p=>{if(broadWood[p.id])p.wood=broadWood[p.id];});
}catch(e){}

function localMatches(){
  const offers=window.PSKL_DATA?.offers||[];
  const q=norm($('#query')?.value),material=$('#material')?.value||'',country=$('#country')?.value||'';
  return offers.filter(o=>(!material||o.material===material)&&(!country||o.country===country)&&(!q||norm(`${o.title} ${o.source} ${o.country} ${o.engine||''} ${o.location||''}`).includes(q)));
}
function termFor(name){
  const q=$('#query')?.value.trim()||'';
  const material=$('#material')?.value||'';
  const parts=[];
  if(q)parts.push(q);
  if(material==='wood'){
    if(name==='OLX')parts.push(q?'drewniana':'łódź motorowa drewniana');
    else if(name==='Allegro')parts.push(q?'drewniana':'drewniana łódź');
    else if(name==='FINN.no')parts.push('trebåt');
    else if(name==='Blocket')parts.push('träbåt');
    else parts.push('wooden boat');
  }
  if(material==='fiberglass'){
    if(name==='FINN.no')parts.push('glassfiber båt');
    else if(name==='Blocket')parts.push('glasfiberbåt');
    else parts.push('fiberglass boat');
  }
  if(!parts.length)parts.push('classic boat');
  return parts.join(' ');
}
function patchLinks(){
  if(patching)return;
  patching=true;
  try{
    $$('.portal-result').forEach(a=>{
      const name=a.querySelector('b')?.textContent.trim()||'';
      const term=termFor(name);
      let href=a.href;
      if(name==='OLX')href=`https://www.olx.pl/sport-hobby/sporty-wodne/q-${slug(term)}/`;
      else if(name==='Allegro')href=`https://allegro.pl/kategoria/lodzie-motorowki-4084?oferta-dotyczy=sprzeda%C5%BC&string=${encodeURIComponent(term)}`;
      else if(name==='FINN.no')href=`https://www.finn.no/mobility/search/boat?q=${encodeURIComponent(term)}`;
      else if(name==='Blocket')href=`https://www.blocket.se/mobility/search/boat?q=${encodeURIComponent(term)}`;
      if(a.href!==href)a.href=href;
      const em=a.querySelector('em');if(em&&em.textContent!==term)em.textContent=term;
      const cta=a.querySelector('strong:last-child');const label='Otwórz pełne aktualne wyniki ↗';if(cta&&cta.textContent!==label)cta.textContent=label;
    });
    const n=localMatches().length,summary=$('#searchSummary');
    if(summary)summary.innerHTML=`<strong>Wcześniej zapisane oferty w bazie PSKŁ: ${n}</strong> · Ta liczba nie opisuje całego rynku. Pełne bieżące wyniki są otwierane bezpośrednio w wybranych portalach powyżej.`;
  }finally{patching=false;}
}
function arrange(){
  const panel=$('#liveSearchPanel'),button=$('#searchNow'),summary=$('#searchSummary');
  if(panel&&button&&panel.previousElementSibling!==button)button.insertAdjacentElement('afterend',panel);
  const mh=panel?.querySelector('.mini-heading');
  if(mh){const s=mh.querySelector('span'),small=mh.querySelector('small');if(s)s.textContent='PEŁNE AKTUALNE WYNIKI W PORTALACH';if(small)small.textContent='Drewno = wszystkie drewniane łodzie; marka lub model tylko opcjonalnie zawęża wyniki';}
  if(summary)summary.classList.add('verified-db-summary');
}
const live=$('#liveSearchLinks');
if(live)new MutationObserver(()=>{requestAnimationFrame(()=>{arrange();patchLinks();});}).observe(live,{childList:true});
arrange();
$('#searchNow')?.addEventListener('click',()=>requestAnimationFrame(()=>{arrange();patchLinks();}));
})();
