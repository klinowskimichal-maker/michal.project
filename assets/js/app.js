const {models, offers} = window.PSKL_DATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const materialLabel = m => m === 'wood' ? 'Drewno' : m === 'fiberglass' ? 'Laminat' : 'Inny';
function pluralModels(n){if(n===1)return '1 model';if(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))return `${n} modele`;return `${n} modeli`;}
function pluralOffers(n){if(n===1)return '1 oferta';if(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))return `${n} oferty`;return `${n} ofert`;}
const slug=s=>norm(s).replace(/ł/g,'l').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const IMG={
  riva:[
    'https://commons.wikimedia.org/wiki/Special:FilePath/Riva%20Aquarama.jpg?width=1280',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Riva%20Aquarama%2001.jpg?width=1280'
  ],
  chris:[
    'https://i0.wp.com/www.acontinuouslean.com/wp-content/uploads/2012/04/Chris_craft_Barrel_back_4.jpeg?fit=1600%2C989&ssl=1',
    'https://i.pinimg.com/736x/33/6d/9f/336d9f12cfaba4fd030e98089d1eba53.jpg'
  ],
  snekke:[
    'https://baatplassen.no/i/uploads/monthly_2023_08/359_221750599.jpg.9a575e960c14bb7a6d47c344a3fb72cb.jpg'
  ],
  arendal:[
    'https://baatplassen.no/i/uploads/monthly_2020_12/Skjermbilde_2020-12-21_kl._09_39_49.png.9fb73a96cb6079cd630390a8a8206ff5.png',
    'https://images.finncdn.no/dynamic/default/item/41963799/d8a0269a-d510-4314-831b-d2a415e20f62'
  ],
  faerder:[
    'https://smallboatsmonthly.com/wp-content/uploads/2015/02/Vesla-FS9-HvasserPS.jpg'
  ],
  storebro:[
    'https://classic-yachts.com/wp-content/uploads/2024/05/20240527_141627.jpg',
    'https://images.boatsgroup.com/resize/1/91/99/1968-storebro-34-power-9519199-20250417142953929-1_XLARGE.jpg'
  ],
  boesch510:[
    'https://www.best-boats24.net/haendler/malibu/boote/111333/1.gr.jpg',
    'https://images.boatsgroup.com/resize/1/78/24/1971-boesch-510-saint-tropez-power-10097824-20260302064843079-0.jpg'
  ],
  boesch580:[
    'https://images.botenwebmanager.nl/b6c10cc7-c525-44f0-8cef-cd4af9244b3b_500.jpg',
    'https://images.boats.com/resize/1/12/40/1967-boesch-580-power-10071240-20260202080300969-1.jpg'
  ],
  boesch590:[
    'https://ea2xbj72fxx.exactdn.com/wp-content/uploads/2022/08/BOESCH-590-ACAPULCO0014-scaled.jpg',
    'https://ea2xbj72fxx.exactdn.com/wp-content/uploads/2022/08/BOESCH-590-ACAPULCO0011-scaled.jpg?strip=all'
  ],
  century:['https://cdn.themarket.co.uk/f4659e77-5b9e-4619-9ed3-cc02ae2ba784/c8bf8ea9-2e87-4a0d-bfb6-dbfa711c3a5d.jpg?height=650&optimizer=image&width=900'],
  fairey:['https://images.sandemanyachtcompany.co.uk/uploads/boats/1170x600_163_119669699359c380e1b742f.JPG'],
  lyman:['https://admin.antiqueboatamerica.com/pictures/5/57/30282%285%29.JPG'],
  garwood:['https://admin.antiqueboatamerica.com/pictures/8/49/39380%281%29.JPG'],
  greavette:['https://static.wixstatic.com/media/fcaebf_fe657183be524edfbb22ef1129e7d9ec~mv2.jpg/v1/fill/w_1000,h_660,al_c,q_90/fcaebf_fe657183be524edfbb22ef1129e7d9ec~mv2.jpg'],
  shepherd:['https://admin.antiqueboatamerica.com/pictures/4/29/27462%284%29.jpg']
};

function galleryForModel(m){
  const t=norm(`${m.brand} ${m.model}`);
  if(t.includes('boesch')&&t.includes('510')) return {images:IMG.boesch510,note:'Boesch 510 / St. Tropez'};
  if(t.includes('boesch')&&t.includes('580')) return {images:IMG.boesch580,note:'Boesch 580'};
  if(t.includes('boesch')&&t.includes('590')) return {images:IMG.boesch590,note:'Boesch 590 Acapulco'};
  if(t.includes('faerder')||t.includes('færder')) return {images:IMG.faerder,note:'Færdersnekke — tradycyjna odmiana z Oslofjordu'};
  if(t.includes('arendal')) return {images:IMG.arendal,note:'Arendalsnekke — zdjęcia referencyjne'};
  if(t.includes('snekke')) return {images:IMG.snekke,note:'Tradycyjna norweska snekke'};
  if(t.includes('riva')) return {images:IMG.riva,note:'Riva — zdjęcia referencyjne'};
  if(t.includes('chris-craft')||t.includes('chris craft')) return {images:IMG.chris,note:'Klasyczne Chris-Craft'};
  if(t.includes('storebro')||t.includes('storö')||t.includes('storo')||t.includes('solö')||t.includes('solo')) return {images:IMG.storebro,note:'Klasyczne Storebro'};
  if(t.includes('century')) return {images:IMG.century,note:'Klasyczne Century'};
  if(t.includes('fairey')) return {images:IMG.fairey,note:'Klasyczne Fairey'};
  if(t.includes('lyman')) return {images:IMG.lyman,note:'Klasyczny Lyman'};
  if(t.includes('gar wood')||t.includes('hacker')) return {images:IMG.garwood,note:'Amerykański mahoniowy runabout'};
  if(t.includes('greavette')) return {images:IMG.greavette,note:'Klasyczny Greavette'};
  if(t.includes('shepherd')) return {images:IMG.shepherd,note:'Klasyczny Shepherd'};
  if(t.includes('pettersson')) return {images:IMG.storebro,note:'Skandynawska klasyczna łódź motorowa'};
  return {images:IMG.riva,note:'Klasyczna łódź drewniana'};
}

function imageForOffer(o){
  if(o.image) return o.image;
  const t=norm(o.title);
  if(t.includes('boesch 510')) return IMG.boesch510[0];
  if(t.includes('boesch 580')) return IMG.boesch580[0];
  if(t.includes('boesch 590')) return IMG.boesch590[0];
  if(t.includes('snekke')||t.includes('arendal')) return IMG.snekke[0];
  if(t.includes('storebro')||t.includes('storo')||t.includes('sol')) return IMG.storebro[0];
  if(t.includes('century')) return IMG.century[0];
  if(t.includes('shepherd')) return IMG.shepherd[0];
  if(t.includes('lyman')) return IMG.lyman[0];
  if(t.includes('chris')) return IMG.chris[0];
  if(t.includes('riva')) return IMG.riva[0];
  return IMG.riva[0];
}
function wireImageFallbacks(root=document){
  root.querySelectorAll('img[data-photo]').forEach(img=>{
    img.addEventListener('error',()=>{
      img.style.display='none';
      const box=img.closest('.photo-shell,.offer-photo,.model-main-photo');
      if(box) box.classList.add('photo-missing');
    },{once:true});
  });
}

function route(name,updateHash=true){
  const valid=['home','catalog','offers','search','book'];
  if(!valid.includes(name))name='home';
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
  $$('.route').forEach(b=>b.classList.toggle('active',b.dataset.route===name));
  $('#nav').classList.remove('open');
  if(updateHash&&location.hash!==`#${name}`)history.pushState(null,'',`#${name}`);
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.route').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
window.addEventListener('popstate',()=>route(location.hash.slice(1)||'home',false));
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['home','catalog','offers','search','book'].includes(h))route(h,false)});

let currentCountry='';
function renderCountries(){
  const groups=Object.groupBy?Object.groupBy(models,m=>m.country):models.reduce((a,m)=>((a[m.country]??=[]).push(m),a),{});
  $('#catalogCount').textContent=pluralModels(models.length);
  $('#countryCards').innerHTML=Object.entries(groups).map(([country,items],i)=>`<button class="country-card${i===0?' active':''}" data-country="${esc(country)}"><span class="flag-stage"><span class="flag">${items[0].flag}</span></span><strong>${esc(country)}</strong><small>${pluralModels(items.length)}</small></button>`).join('');
  $$('.country-card').forEach(b=>b.onclick=()=>{$$('.country-card').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderModelList(b.dataset.country);});
  if(Object.keys(groups).length) renderModelList(Object.keys(groups)[0]);
}
function renderModelList(country){
  currentCountry=country;
  const list=models.filter(m=>m.country===country);
  $('#countryCards').style.display='grid';
  $('#catalogIntro').style.display='block';
  $('#modelList').innerHTML=`<div class="model-list-screen"><div class="model-list-heading"><h3 class="model-country-title"><span class="flag">${list[0]?.flag||''}</span>${esc(country)}</h3><span>${pluralModels(list.length)}</span></div><p class="model-help">Wybierz model lub typ. Zdjęcia i historia są dostępne po wejściu w pozycję.</p><div class="model-select-grid">${list.map((m,i)=>`<button class="model-select-card" data-model-index="${i}" data-catalog-index="${models.indexOf(m)}"><span><small>${esc(m.brand)}</small><strong>${esc(m.model)}</strong></span><em>${esc(m.years)}</em><b>Zdjęcia i historia →</b></button>`).join('')}</div></div>`;
  $$('[data-model-index]').forEach(b=>b.onclick=()=>renderModelDetail(list[Number(b.dataset.modelIndex)]));
}
function renderModelDetail(m){
  const gallery=galleryForModel(m);
  $('#modelList').dataset.selectedModel=String(models.indexOf(m));
  $('#countryCards').style.display='none';
  $('#catalogIntro').style.display='none';
  const thumbs=gallery.images.map((src,i)=>`<button class="model-thumb${i===0?' active':''}" data-gallery-src="${esc(src)}" aria-label="Zdjęcie ${i+1}"><img data-photo src="${esc(src)}" alt="${esc(m.brand)} ${esc(m.model)} — zdjęcie ${i+1}" referrerpolicy="no-referrer"></button>`).join('');
  $('#modelList').innerHTML=`<article class="model-detail"><button class="model-back" id="modelBack">← Wstecz do listy modeli</button><div class="model-detail-grid"><div class="model-gallery"><div class="model-main-photo photo-shell"><div class="photo-fallback"><span>⚓</span><strong>${esc(m.brand)} ${esc(m.model)}</strong><small>Zdjęcie chwilowo niedostępne</small></div><img id="modelMainImage" data-photo src="${esc(gallery.images[0])}" alt="${esc(m.brand)} ${esc(m.model)}" loading="eager" referrerpolicy="no-referrer"></div>${gallery.images.length>1?`<div class="model-thumbs">${thumbs}</div>`:''}<small class="photo-note">${esc(gallery.note)}. Materiał referencyjny — nie przedstawia konkretnego egzemplarza, chyba że opis mówi inaczej.</small></div><div class="model-detail-copy"><p class="eyebrow">${m.flag} ${esc(m.country)} · ${esc(m.brand)}</p><h2>${esc(m.model)}</h2><dl><div><dt>${esc(m.periodLabel||'Produkcja')}</dt><dd>${esc(m.years)}</dd></div><div><dt>Konstrukcja</dt><dd>${esc(m.construction)}</dd></div>${m.length?`<div><dt>Długość</dt><dd>${esc(m.length)} m</dd></div>`:''}</dl><h3>Historia i cechy</h3><p>${esc(m.history)}</p>${m.source?`<p class="source-link"><a href="${esc(m.source)}" target="_blank" rel="noopener">Źródło historyczne ↗</a></p>`:''}</div></div></article>`;
  $('#modelBack').onclick=()=>{renderModelList(currentCountry);window.scrollTo({top:0,behavior:'smooth'});};
  $$('.model-thumb').forEach(btn=>btn.onclick=()=>{
    $$('.model-thumb').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    const main=$('#modelMainImage');main.style.display='block';main.parentElement.classList.remove('photo-missing');main.src=btn.dataset.gallerySrc;
    wireImageFallbacks(main.parentElement);
  });
  wireImageFallbacks($('#modelList'));
  window.scrollTo({top:0,behavior:'smooth'});
}

function offerCard(o){
  const img=imageForOffer(o);
  const details=[o.length?`${Number(o.length).toFixed(2)} m`:null,o.engine||null,o.location||null].filter(Boolean);
  return `<article class="offer-card"><div class="offer-photo photo-shell"><div class="photo-fallback"><span>⚓</span><strong>${esc(o.title)}</strong><small>Zdjęcie chwilowo niedostępne</small></div><img data-photo src="${esc(img)}" alt="${esc(o.title)}" loading="lazy" referrerpolicy="no-referrer"><span class="offer-photo-note">${esc(o.imageNote||'Zdjęcie poglądowe')}</span></div><div class="offer-body"><p class="eyebrow">${esc(o.source)} · ${esc(o.country)}</p><h3>${esc(o.title)}</h3><div class="tags"><span>${esc(o.year||'Rok niepodany')}</span><span>${materialLabel(o.material)}</span>${o.verifiedAt?`<span>sprawdzono ${esc(o.verifiedAt)}</span>`:''}</div>${details.length?`<p class="offer-details">${details.map(esc).join(' · ')}</p>`:''}<strong class="price">${esc(o.price)}</strong><small>${esc(o.status)}</small>${o.link?`<a class="offer-link" href="${esc(o.link)}" target="_blank" rel="noopener">Otwórz ofertę ↗</a>`:''}</div></article>`;
}
let liveOffers=[];
let liveUpdatedAt=null;
function allOffers(){
  const merged=[...offers,...liveOffers];
  return [...new Map(merged.map(o=>[(o.link||`${norm(o.source)}|${norm(o.title)}|${o.price}`).toLowerCase(),o])).values()];
}
function renderOffers(){
  const unique=allOffers();
  $('#offerCount').textContent=pluralOffers(unique.length);
  $('#offerCards').innerHTML=unique.map(offerCard).join('');
  wireImageFallbacks($('#offerCards'));
}
function populateCountries(){
  const select=$('#country');
  const current=select.value;
  select.innerHTML='<option value="">Wszystkie kraje</option>';
  [...new Set([...models.map(m=>m.country),...allOffers().map(o=>o.country)])].filter(Boolean).sort().forEach(c=>select.insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));
  if([...select.options].some(o=>o.value===current))select.value=current;
}

const PORTALS=[
  {id:'olx',name:'OLX',market:'Polska',domain:'olx.pl',wood:'łódź drewniana motorowa',url:q=>`https://www.olx.pl/sport-hobby/sporty-wodne/lodzie-i-jachty/q-${slug(q)}/`},
  {id:'allegro',name:'Allegro',market:'Polska',domain:'allegro.pl',wood:'łódź motorowa drewniana',url:q=>`https://allegro.pl/kategoria/lodzie-motorowki-4084?oferta-dotyczy=sprzeda%C5%BC&string=${encodeURIComponent(q)}`},
  {id:'finn',name:'FINN.no',market:'Norwegia',domain:'finn.no',wood:'snekke trebåt',url:q=>`https://www.finn.no/mobility/search/boat?query=${encodeURIComponent(q)}`},
  {id:'blocket',name:'Blocket',market:'Szwecja',domain:'blocket.se',wood:'träbåt',url:q=>`https://www.blocket.se/mobility/search/boat?q=${encodeURIComponent(q)}`},
  {id:'boat24',name:'Boat24',market:'Europa',domain:'boat24.com',wood:'wooden classic powerboat',url:q=>`https://www.google.com/search?q=${encodeURIComponent(`site:boat24.com/en/powerboats ${q}`)}`},
  {id:'yachtworld',name:'YachtWorld',market:'Świat',domain:'yachtworld.com',wood:'wood antique classic',url:q=>`https://www.yachtworld.com/boats-for-sale/keyword-${slug(q)}/`},
  {id:'aba',name:'Antique Boat America',market:'USA / Kanada',domain:'antiqueboatamerica.com',wood:'wooden classic boat',url:q=>`https://www.google.com/search?q=${encodeURIComponent(`site:antiqueboatamerica.com/Boat ${q}`)}`},
  {id:'cbc',name:'Classic Boat Collective',market:'USA / Kanada',domain:'classicboatcollective.com',wood:'wooden classic boat',url:q=>`https://www.google.com/search?q=${encodeURIComponent(`site:classicboatcollective.com/listing ${q}`)}`}
];

function renderPortalChecks(){
  const box=$('#portalChecks');
  if(!box)return;
  box.innerHTML=PORTALS.map(p=>`<label class="portal-check"><input type="checkbox" value="${p.id}" checked><span><b>${p.name}</b><small>${p.market}</small></span></label>`).join('');
}
function buildPortalQuery(p){
  const q=$('#query').value.trim();
  const material=$('#material').value;
  const country=$('#country').value;
  const parts=[];
  if(q) parts.push(q);
  if(material==='wood') parts.push(p.wood);
  if(material==='fiberglass') parts.push(p.id==='blocket'?'glasfiberbåt':p.id==='finn'?'glassfiber båt':'fiberglass boat');
  if(country && !norm(p.market).includes(norm(country))) parts.push(country);
  if(!parts.length) parts.push('classic boat');
  return parts.join(' ');
}
function renderLiveSearch(){
  const selected=new Set($$('#portalChecks input:checked').map(x=>x.value));
  const chosen=PORTALS.filter(p=>selected.has(p.id));
  const target=$('#liveSearchLinks');
  if(!chosen.length){target.innerHTML='<p class="empty">Wybierz co najmniej jeden portal.</p>';return;}
  target.innerHTML=`<div class="live-search-head"><div><strong>Aktualne wyszukiwanie w portalach</strong><small>Każdy przycisk otwiera bieżące wyniki w danym serwisie.</small></div><span>${chosen.length} portali</span></div><div class="portal-results">${chosen.map(p=>{const q=buildPortalQuery(p);return `<a class="portal-result" href="${esc(p.url(q))}" target="_blank" rel="noopener"><span><b>${p.name}</b><small>${esc(p.domain)} · ${esc(p.market)}</small></span><em>${esc(q)}</em><strong>Szukaj teraz ↗</strong></a>`}).join('')}</div>`;
}
function searchLocal(){
  const q=norm($('#query').value),material=$('#material').value,country=$('#country').value;
  const result=allOffers().filter(o=>(!material||o.material===material)&&(!country||o.country===country)&&(!q||norm(`${o.title} ${o.source} ${o.country} ${o.engine||''} ${o.location||''}`).includes(q)));
  const auto=liveOffers.length?` Automatyczny indeks: ${liveOffers.length} ofert${liveUpdatedAt?`, aktualizacja ${new Date(liveUpdatedAt).toLocaleString('pl-PL')}`:''}.`:'';
  $('#searchSummary').textContent=`Znaleziono w bazie: ${pluralOffers(result.length)}. Baza ręcznie zweryfikowana: 07.09.2026.${auto}`;
  $('#searchResults').innerHTML=result.length?result.map(offerCard).join(''):'<p class="empty">Brak zapisanych ofert spełniających filtry. Poniżej nadal można uruchomić wyszukiwanie na żywo w wybranych portalach.</p>';
  wireImageFallbacks($('#searchResults'));
}

async function loadLiveMarket(){
  try{
    const r=await fetch(`assets/data/market-live.json?t=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)throw new Error('Indeks rynku niedostępny');
    const data=await r.json();
    window.PSKL_MARKET_STATUS={updatedAt:data.updatedAt,errors:data.errors||[],searches:data.searches||[]};
    liveOffers=Array.isArray(data.offers)?data.offers:[];
    liveUpdatedAt=data.updatedAt||null;
    renderOffers();
    populateCountries();
    searchLocal();
    window.dispatchEvent(new Event('pskl-market-loaded'));
  }catch(e){
    window.PSKL_MARKET_STATUS={failed:true,errors:[],searches:[]};
    window.dispatchEvent(new Event('pskl-market-loaded'));
    console.warn('Automatyczny indeks rynku niedostępny',e);
  }
}

function runSearch(){
  searchLocal();
  renderLiveSearch();
  $('#liveSearchPanel')?.classList.add('ready');
  document.querySelector('#liveSearchPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
}

$('#searchNow')?.addEventListener('click',runSearch);
$('#menuButton').onclick=()=>$('#nav').classList.toggle('open');
renderPortalChecks();
renderCountries();
renderOffers();
populateCountries();
searchLocal();
loadLiveMarket();
route(location.hash.slice(1)||'home',false);
