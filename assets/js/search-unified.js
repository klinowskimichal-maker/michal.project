(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const STORE='pskl-tracked-offers-v1';
let hasSearched=false;
let paintingOffers=false;

function keyFor(o){return String(o?.link||`${o?.source||''}|${o?.title||''}|${o?.price||''}`).trim().toLowerCase();}
function universe(){
  try{if(typeof allOffers==='function'){const a=allOffers();if(Array.isArray(a))return a;}}catch(e){}
  return window.PSKL_DATA?.offers||[];
}
function readTracked(){
  try{const x=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}
}
function writeTracked(x){try{localStorage.setItem(STORE,JSON.stringify(x));}catch(e){} }
function isTracked(o){const k=keyFor(o);return readTracked().some(x=>x.key===k);}
function addTracked(o){
  const list=readTracked(),k=keyFor(o);
  if(!list.some(x=>x.key===k))list.unshift({key:k,savedAt:new Date().toISOString(),offer:{...o}});
  writeTracked(list);renderOffersWorkspace();
}
function removeTracked(o){
  const k=keyFor(o);writeTracked(readTracked().filter(x=>x.key!==k));renderOffersWorkspace();
}
function currentTracked(){
  const now=new Map(universe().map(o=>[keyFor(o),o]));
  return readTracked().map(x=>({...(x.offer||{}),...(now.get(x.key)||{}),_trackKey:x.key,_savedAt:x.savedAt,_currentlyIndexed:now.has(x.key)}));
}
function cardHtml(o){
  try{if(typeof offerCard==='function')return offerCard(o);}catch(e){}
  return `<article class="offer-card"><div class="offer-body"><p class="eyebrow">${esc(o.source||'')}</p><h3>${esc(o.title||'Oferta')}</h3><strong class="price">${esc(o.price||'')}</strong>${o.link?`<a class="offer-link" href="${esc(o.link)}" target="_blank" rel="noopener">Otwórz ofertę ↗</a>`:''}</div></article>`;
}
function watchControl(card,o,checked,trackedView=false){
  const body=card.querySelector('.offer-body')||card;
  const old=body.querySelector('.pskl-watch-control');if(old)old.remove();
  const label=document.createElement('label');label.className='pskl-watch-control';
  label.innerHTML=`<input type="checkbox" ${checked?'checked':''}><span class="watch-box" aria-hidden="true">✓</span><span class="watch-copy"><b>${trackedView?'Obserwowana':'Obserwuj ofertę'}</b><small>${trackedView?'Zapisana do dalszej analizy':'Dodaj do zakładki Oferty'}</small></span>`;
  const input=label.querySelector('input');
  input.addEventListener('change',()=>{
    if(input.checked){addTracked(o);label.classList.add('saved');showToast('Oferta została dodana do obserwowanych.');}
    else{removeTracked(o);label.classList.remove('saved');showToast('Oferta została usunięta z obserwowanych.');}
    if(hasSearched)renderSearchResults(false);
  });
  body.insertBefore(label,body.firstChild);
  if(checked)label.classList.add('saved');
}
function showToast(text){
  let t=$('#pskl-watch-toast');if(!t){t=document.createElement('div');t.id='pskl-watch-toast';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600);
}
function plural(n){return n===1?'1 oferta':(n>=2&&n<=4?`${n} oferty`:`${n} ofert`);}
function matches(o){
  const q=norm($('#query')?.value||''),material=$('#material')?.value||'',country=$('#country')?.value||'';
  if(material&&o.material!==material)return false;
  if(country&&o.country!==country)return false;
  if(q){
    const hay=norm(`${o.title||''} ${o.source||''} ${o.country||''} ${o.engine||''} ${o.location||''} ${o.description||''} ${(o.equipment||[]).join(' ')}`);
    const terms=q.split(/\s+/).filter(Boolean);if(!terms.every(t=>hay.includes(t)))return false;
  }
  return true;
}
function renderSearchResults(scroll=true){
  hasSearched=true;
  const result=universe().filter(matches);
  const box=$('#searchResults'),summary=$('#searchSummary');if(!box)return;
  if(summary){
    const watched=result.filter(isTracked).length;
    summary.innerHTML=`<strong>${plural(result.length)}</strong> spełnia ustawione kryteria${watched?` · ${watched} obserwowane`:''}. Zaznaczenie „Obserwuj ofertę” zapisuje pozycję w zakładce Oferty do dalszego śledzenia i analizy.`;
  }
  box.innerHTML=result.length?result.map(cardHtml).join(''):'<p class="empty">Brak ofert spełniających aktualne kryteria w indeksie PSKŁ. Zmień filtry lub frazę wyszukiwania.</p>';
  if(result.length){const cards=[...box.querySelectorAll('.offer-card')];cards.forEach((card,i)=>watchControl(card,result[i],isTracked(result[i]),false));}
  try{if(typeof wireImageFallbacks==='function')wireImageFallbacks(box);}catch(e){}
  if(scroll)summary?.scrollIntoView({behavior:'smooth',block:'start'});
}
function renderOffersWorkspace(){
  const tracked=currentTracked(),trackedBox=$('#trackedOffers'),trackedEmpty=$('#trackedOffersEmpty');
  if(trackedBox){
    trackedBox.innerHTML=tracked.map(cardHtml).join('');
    if(trackedEmpty)trackedEmpty.hidden=tracked.length>0;
    [...trackedBox.querySelectorAll('.offer-card')].forEach((card,i)=>{
      watchControl(card,tracked[i],true,true);
      if(!tracked[i]._currentlyIndexed){const body=card.querySelector('.offer-body')||card;const s=document.createElement('small');s.className='tracked-status-note';s.textContent='Brak w najnowszym indeksie — zachowano ostatni zapis oferty.';body.appendChild(s);}
    });
    try{if(typeof wireImageFallbacks==='function')wireImageFallbacks(trackedBox);}catch(e){}
  }
  const trackedKeys=new Set(tracked.map(x=>keyFor(x))),rest=universe().filter(o=>!trackedKeys.has(keyFor(o))),box=$('#offerCards');
  if(box&&!paintingOffers){
    paintingOffers=true;box.innerHTML=rest.map(cardHtml).join('');
    try{if(typeof wireImageFallbacks==='function')wireImageFallbacks(box);}catch(e){}
    requestAnimationFrame(()=>paintingOffers=false);
  }
  const count=$('#offerCount');if(count)count.textContent=`${tracked.length} obserwowane · ${rest.length} pozostałe`;
}
function initSearchButton(){
  const old=$('#searchNow');if(!old)return;
  const fresh=old.cloneNode(true);old.replaceWith(fresh);
  fresh.addEventListener('click',()=>renderSearchResults(true));
  $('#query')?.addEventListener('input',()=>{if(hasSearched)renderSearchResults(false)});
  ['#material','#country'].forEach(sel=>$(sel)?.addEventListener('change',()=>{if(hasSearched)renderSearchResults(false)}));
}
function resetSearchPrompt(){
  const box=$('#searchResults');if(box)box.innerHTML='';
  const s=$('#searchSummary');if(s)s.textContent='Ustaw kryteria i naciśnij „SZUKAJ”.';
}
function cleanLegacySearch(){
  $$('.portal-block,.live-search-panel').forEach(x=>x.remove());
  resetSearchPrompt();
}
function observeMarketRefresh(){
  const box=$('#offerCards');if(box)new MutationObserver(()=>{if(!paintingOffers)requestAnimationFrame(()=>{renderOffersWorkspace();if(hasSearched)renderSearchResults(false);else resetSearchPrompt();});}).observe(box,{childList:true});
  setTimeout(()=>{renderOffersWorkspace();if(hasSearched)renderSearchResults(false);else resetSearchPrompt();},1200);
  setTimeout(()=>{renderOffersWorkspace();if(hasSearched)renderSearchResults(false);else resetSearchPrompt();},3200);
}
cleanLegacySearch();initSearchButton();renderOffersWorkspace();observeMarketRefresh();
window.PSKL_TRACKED_OFFERS={list:currentTracked,add:addTracked,remove:removeTracked,render:renderOffersWorkspace};
})();