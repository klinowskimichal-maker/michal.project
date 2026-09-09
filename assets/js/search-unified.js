(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const STORE='pskl-tracked-offers-v1';
let hasSearched=false;
let paintingOffers=false;

function sourceFromLink(link){
  if(!link)return'';
  try{
    const h=new URL(link,location.href).hostname.replace(/^www\./,'').toLowerCase();
    if(h.includes('olx.'))return'OLX';
    if(h.includes('allegro.'))return'Allegro';
    if(h.includes('finn.no'))return'FINN.no';
    if(h.includes('blocket.se'))return'Blocket';
    if(h.includes('boat24.'))return'Boat24';
    if(h.includes('yachtworld.'))return'YachtWorld';
    if(h.includes('antiqueboatamerica.'))return'Antique Boat America';
    if(h.includes('classicboatcollective.'))return'Classic Boat Collective';
    return h;
  }catch(e){return'';}
}
function normalizeOffer(o){
  const x={...(o||{})};
  x.source=(x.source||sourceFromLink(x.link)||'Źródło nieoznaczone').trim();
  return x;
}
function keyFor(o){const x=normalizeOffer(o);return String(x.link||`${x.source||''}|${x.title||''}|${x.price||''}`).trim().toLowerCase();}
function universe(){
  let a=[];
  try{if(typeof allOffers==='function'){const x=allOffers();if(Array.isArray(x))a=x;}}catch(e){}
  if(!a.length)a=window.PSKL_DATA?.offers||[];
  return a.map(normalizeOffer);
}
function readTracked(){
  try{const x=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}
}
function writeTracked(x){try{localStorage.setItem(STORE,JSON.stringify(x));}catch(e){} }
function isTracked(o){const k=keyFor(o);return readTracked().some(x=>x.key===k);}
function addTracked(o){
  const clean=normalizeOffer(o),list=readTracked(),k=keyFor(clean);
  if(!list.some(x=>x.key===k))list.unshift({key:k,savedAt:new Date().toISOString(),offer:{...clean}});
  writeTracked(list);renderOffersWorkspace();
}
function removeTracked(o){
  const k=keyFor(o);writeTracked(readTracked().filter(x=>x.key!==k));renderOffersWorkspace();
}
function currentTracked(){
  const now=new Map(universe().map(o=>[keyFor(o),o]));
  return readTracked().map(x=>normalizeOffer({...(x.offer||{}),...(now.get(x.key)||{}),_trackKey:x.key,_savedAt:x.savedAt,_currentlyIndexed:now.has(x.key)}));
}
function cardHtml(o){
  const x=normalizeOffer(o);
  try{if(typeof offerCard==='function')return offerCard(x);}catch(e){}
  return `<article class="offer-card"><div class="offer-body"><p class="eyebrow">${esc(x.source||'')}</p><h3>${esc(x.title||'Oferta')}</h3><strong class="price">${esc(x.price||'')}</strong>${x.link?`<a class="offer-link" href="${esc(x.link)}" target="_blank" rel="noopener">Otwórz ogłoszenie w ${esc(x.source)} ↗</a>`:''}</div></article>`;
}
function ensureSource(card,o){
  const x=normalizeOffer(o),body=card.querySelector('.offer-body')||card;
  let meta=body.querySelector('.pskl-source-meta');
  if(!meta){meta=document.createElement('div');meta.className='pskl-source-meta';body.insertBefore(meta,body.firstChild);}
  meta.innerHTML=`<span>Źródło</span><strong>${esc(x.source)}</strong>`;
  let link=body.querySelector('.offer-link');
  if(x.link){
    if(!link){link=document.createElement('a');link.className='offer-link';link.target='_blank';link.rel='noopener';body.appendChild(link);}
    link.href=x.link;link.textContent=`Otwórz ogłoszenie w ${x.source} ↗`;
  }
}
function watchControl(card,o,checked,trackedView=false){
  const x=normalizeOffer(o),body=card.querySelector('.offer-body')||card;
  ensureSource(card,x);
  const old=body.querySelector('.pskl-watch-control');if(old)old.remove();
  const label=document.createElement('label');label.className='pskl-watch-control';
  label.innerHTML=`<input type="checkbox" ${checked?'checked':''}><span class="watch-box" aria-hidden="true">✓</span><span class="watch-copy"><b>${trackedView?'Obserwowana':'Obserwuj ofertę'}</b><small>${trackedView?'Zapisana do dalszej analizy':'Dodaj do zakładki Oferty'}</small></span>`;
  const input=label.querySelector('input');
  input.addEventListener('change',()=>{
    if(input.checked){addTracked(x);label.classList.add('saved');showToast(`Oferta z ${x.source} została dodana do obserwowanych.`);}
    else{removeTracked(x);label.classList.remove('saved');showToast('Oferta została usunięta z obserwowanych.');}
    if(hasSearched)renderSearchResults(false);
  });
  body.insertBefore(label,body.firstChild);
  if(checked)label.classList.add('saved');
}
function showToast(text){
  let t=$('#pskl-watch-toast');if(!t){t=document.createElement('div');t.id='pskl-watch-toast';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600);
}
function plural(n){return n===1?'1 oferta':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?`${n} oferty`:`${n} ofert`);}
function searchCriteria(){return window.PSKL_MARKET.criteria($('#query')?.value,$('#material')?.value,$('#country')?.value)}
function matches(o){
  return window.PSKL_MARKET.matches(normalizeOffer(o),searchCriteria());
}
function renderMarketCoverage(){
  let panel=$('#marketCoverage');
  if(!panel){panel=document.createElement('div');panel.id='marketCoverage';$('#searchSummary').insertAdjacentElement('afterend',panel);}
  const status=window.PSKL_MARKET_STATUS,c=searchCriteria();
  const failed=[...new Set((status?.errors||[]).map(x=>x.portal))];
  const timestamp=status?.updatedAt?new Date(status.updatedAt).toLocaleString('pl-PL'):'';
  panel.innerHTML=`<p class="market-status">${timestamp?`Ostatnia próba aktualizacji: ${esc(timestamp)}.`:status?.failed?'Aktualizacja indeksu jest niedostępna; widoczne są wcześniejsze zapisane oferty.':'Dostępne są zapisane oferty; trwa sprawdzanie indeksu.'} ${failed.length?`Nie udało się pobrać części wyników: ${failed.map(esc).join(', ')}.`:''} Indeks obejmuje tylko część ogłoszeń. Dostępność i materiał kadłuba należy potwierdzić w treści oferty.</p><details class="portal-more"><summary>Więcej ogłoszeń — wyszukiwanie w portalach</summary><p>Linki przekazują frazę i materiał w języku portalu. Kraj wybrany na stronie filtruje indeks; lokalizację i materiał warto dodatkowo ustawić w portalu.</p><div class="market-portal-links">${window.PSKL_MARKET.links(c).map(p=>`<a class="button" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.name)} · ${esc(p.query||'wszystkie łodzie')} ↗</a>`).join('')}</div></details>`;
}
function renderSearchResults(scroll=true){
  hasSearched=true;
  /* W wyszukiwaniu pokazujemy wyłącznie pozycje z bezpośrednim adresem ogłoszenia. */
  const result=universe().filter(o=>o.link).filter(matches);
  const box=$('#searchResults'),summary=$('#searchSummary');if(!box)return;
  if(summary){
    const watched=result.filter(isTracked).length;
    const material=searchCriteria().material;
    summary.innerHTML=`<strong>W zapisanym indeksie PSKŁ: ${plural(result.length)}</strong>${material?` · materiał: ${material==='wood'?'drewno':'laminat'}`:''}${watched?` · obserwowane: ${watched}`:''}. To liczba pasujących zapisanych ofert, a nie wszystkich ogłoszeń w portalach.`;
  }
  box.innerHTML=result.length?result.map(cardHtml).join(''):'<p class="empty">Brak pasujących ofert w zapisanym indeksie PSKŁ. Więcej ogłoszeń można sprawdzić przez linki do portali powyżej.</p>';
  renderMarketCoverage();
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
      if(!tracked[i]._currentlyIndexed){const body=card.querySelector('.offer-body')||card;const s=document.createElement('small');s.className='tracked-status-note';s.textContent='Brak w najnowszym indeksie — zachowano ostatni zapis oferty, źródło i link.';body.appendChild(s);}
    });
    try{if(typeof wireImageFallbacks==='function')wireImageFallbacks(trackedBox);}catch(e){}
  }
  const trackedKeys=new Set(tracked.map(x=>keyFor(x))),rest=universe().filter(o=>!trackedKeys.has(keyFor(o))),box=$('#offerCards');
  if(box&&!paintingOffers){
    paintingOffers=true;box.innerHTML=rest.map(cardHtml).join('');
    [...box.querySelectorAll('.offer-card')].forEach((card,i)=>ensureSource(card,rest[i]));
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
  $('#query')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderSearchResults(true)}});
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
  window.addEventListener('pskl-market-loaded',()=>{renderOffersWorkspace();if(hasSearched)renderSearchResults(false);else resetSearchPrompt();});
}
cleanLegacySearch();initSearchButton();renderOffersWorkspace();observeMarketRefresh();
window.PSKL_TRACKED_OFFERS={list:currentTracked,add:addTracked,remove:removeTracked,render:renderOffersWorkspace};
})();
