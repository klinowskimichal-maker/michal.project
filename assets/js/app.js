const {models, offers} = window.PSKL_DATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const materialLabel = m => m === 'wood' ? 'Drewno' : m === 'fiberglass' ? 'Laminat' : 'Inny';
function pluralModels(n){if(n===1)return '1 model';if(n>=2&&n<=4)return `${n} modele`;return `${n} modeli`;}
function pluralOffers(n){if(n===1)return '1 oferta';if(n>=2&&n<=4)return `${n} oferty`;return `${n} ofert`;}

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
    'https://images.boatsgroup.com/resize/1/23/94/2021-wood-traditional-coastal-motorboat-power-9882394-20250724030731064-1_XLARGE.jpg'
  ],
  storebro:[
    'https://classic-yachts.com/wp-content/uploads/2024/05/20240527_141627.jpg',
    'https://images.boatsgroup.com/resize/1/91/99/1968-storebro-34-power-9519199-20250417142953929-1_XLARGE.jpg'
  ],
  boesch:[
    'https://itboat.ams3.digitaloceanspaces.com/itboat/da8e/01e34t9dthx8hxc608hv3vgayy.jpg'
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
  if(t.includes('riva')) return {images:IMG.riva,note:'Zdjęcia referencyjne Riva / Aquarama'};
  if(t.includes('chris-craft')||t.includes('chris craft')) return {images:IMG.chris,note:'Zdjęcia referencyjne klasycznych Chris-Craft'};
  if(t.includes('snekke')||t.includes('arendal')) return {images:IMG.snekke,note:'Zdjęcie referencyjne tradycyjnej łodzi typu snekke'};
  if(t.includes('storebro')||t.includes('storö')||t.includes('storo')||t.includes('solö')||t.includes('solo')) return {images:IMG.storebro,note:'Zdjęcia referencyjne klasycznych Storebro'};
  if(t.includes('boesch')) return {images:IMG.boesch,note:'Zdjęcie referencyjne klasycznego Boesch'};
  if(t.includes('century')) return {images:IMG.century,note:'Zdjęcie referencyjne klasycznego Century'};
  if(t.includes('fairey')) return {images:IMG.fairey,note:'Zdjęcie referencyjne klasycznego Fairey'};
  if(t.includes('lyman')) return {images:IMG.lyman,note:'Zdjęcie referencyjne klasycznego Lyman'};
  if(t.includes('gar wood')||t.includes('hacker')) return {images:IMG.garwood,note:'Zdjęcie referencyjne amerykańskiego mahoniowego runaboutu'};
  if(t.includes('greavette')) return {images:IMG.greavette,note:'Zdjęcie referencyjne klasycznego Greavette'};
  if(t.includes('shepherd')) return {images:IMG.shepherd,note:'Zdjęcie referencyjne klasycznego Shepherd'};
  if(t.includes('pettersson')) return {images:IMG.storebro,note:'Zdjęcie referencyjne skandynawskiej klasycznej łodzi motorowej'};
  return {images:IMG.riva,note:'Zdjęcie referencyjne klasycznej łodzi drewnianej'};
}
function imageForOffer(o){
  if(o.image) return o.image;
  const t=norm(o.title);
  if(t.includes('snekke')||t.includes('arendal')) return IMG.snekke[0];
  if(t.includes('storebro')||t.includes('storo')||t.includes('sol')) return IMG.storebro[0];
  if(t.includes('chris')) return IMG.chris[0];
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
  $('#modelList').innerHTML=`<div class="model-list-screen"><div class="model-list-heading"><h3 class="model-country-title"><span class="flag">${list[0]?.flag||''}</span>${esc(country)}</h3><span>${pluralModels(list.length)}</span></div><p class="model-help">Wybierz model. Zdjęcia są dostępne dopiero po wejściu w konkretny model.</p><div class="model-select-grid">${list.map((m,i)=>`<button class="model-select-card" data-model-index="${i}"><span><small>${esc(m.brand)}</small><strong>${esc(m.model)}</strong></span><em>${esc(m.years)}</em><b>Zdjęcia i historia →</b></button>`).join('')}</div></div>`;
  $$('[data-model-index]').forEach(b=>b.onclick=()=>renderModelDetail(list[Number(b.dataset.modelIndex)]));
}
function renderModelDetail(m){
  const gallery=galleryForModel(m);
  $('#countryCards').style.display='none';
  $('#catalogIntro').style.display='none';
  const thumbs=gallery.images.map((src,i)=>`<button class="model-thumb${i===0?' active':''}" data-gallery-src="${esc(src)}" aria-label="Zdjęcie ${i+1}"><img data-photo src="${esc(src)}" alt="${esc(m.brand)} ${esc(m.model)} — zdjęcie ${i+1}" referrerpolicy="no-referrer"></button>`).join('');
  $('#modelList').innerHTML=`<article class="model-detail"><button class="model-back" id="modelBack">← Wstecz do listy modeli</button><div class="model-detail-grid"><div class="model-gallery"><div class="model-main-photo photo-shell"><div class="photo-fallback"><span>⚓</span><strong>${esc(m.brand)} ${esc(m.model)}</strong><small>Zdjęcie chwilowo niedostępne</small></div><img id="modelMainImage" data-photo src="${esc(gallery.images[0])}" alt="${esc(m.brand)} ${esc(m.model)}" loading="eager" referrerpolicy="no-referrer"></div>${gallery.images.length>1?`<div class="model-thumbs">${thumbs}</div>`:''}<small class="photo-note">${esc(gallery.note)}. Materiał ma charakter poglądowy i nie przedstawia konkretnego egzemplarza z katalogu.</small></div><div class="model-detail-copy"><p class="eyebrow">${m.flag} ${esc(m.country)} · ${esc(m.brand)}</p><h2>${esc(m.model)}</h2><dl><div><dt>Produkcja</dt><dd>${esc(m.years)}</dd></div><div><dt>Konstrukcja</dt><dd>${esc(m.construction)}</dd></div>${m.length?`<div><dt>Długość</dt><dd>${esc(m.length)} m</dd></div>`:''}</dl><h3>Historia i cechy modelu</h3><p>${esc(m.history)}</p></div></div></article>`;
  $('#modelBack').onclick=()=>{renderModelList(currentCountry);window.scrollTo({top:0,behavior:'smooth'});};
  $$('.model-thumb').forEach(btn=>btn.onclick=()=>{
    $$('.model-thumb').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    const main=$('#modelMainImage'); main.style.display='block'; main.parentElement.classList.remove('photo-missing'); main.src=btn.dataset.gallerySrc;
    wireImageFallbacks(main.parentElement);
  });
  wireImageFallbacks($('#modelList'));
  window.scrollTo({top:0,behavior:'smooth'});
}

function offerCard(o){
  const img=imageForOffer(o);
  return `<article class="offer-card"><div class="offer-photo photo-shell"><div class="photo-fallback"><span>⚓</span><strong>${esc(o.title)}</strong><small>Zdjęcie chwilowo niedostępne</small></div><img data-photo src="${esc(img)}" alt="${esc(o.title)}" loading="lazy" referrerpolicy="no-referrer"><span class="offer-photo-note">${esc(o.imageNote||'Zdjęcie poglądowe')}</span></div><div class="offer-body"><p class="eyebrow">${esc(o.source)} · ${esc(o.country)}</p><h3>${esc(o.title)}</h3><div class="tags"><span>${esc(o.year||'Rok niepodany')}</span><span>${materialLabel(o.material)}</span></div><strong class="price">${esc(o.price)}</strong><small>${esc(o.status)}</small></div></article>`;
}
function renderOffers(){
  const unique=[...new Map(offers.map(o=>[`${norm(o.source)}|${norm(o.title)}|${o.price}`,o])).values()];
  $('#offerCount').textContent=pluralOffers(unique.length);
  $('#offerCards').innerHTML=unique.map(offerCard).join('');
  wireImageFallbacks($('#offerCards'));
}
function populateCountries(){
  [...new Set([...models.map(m=>m.country),...offers.map(o=>o.country)])].sort().forEach(c=>$('#country').insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));
}
function search(){
  const q=norm($('#query').value),material=$('#material').value,country=$('#country').value;
  const result=offers.filter(o=>(!material||o.material===material)&&(!country||o.country===country)&&(!q||norm(`${o.title} ${o.source} ${o.country}`).includes(q)));
  $('#searchSummary').textContent=`Znaleziono: ${pluralOffers(result.length)}`;
  $('#searchResults').innerHTML=result.length?result.map(offerCard).join(''):'<p class="empty">Brak ofert spełniających wszystkie wybrane kryteria.</p>';
  wireImageFallbacks($('#searchResults'));
}
['query','material','country'].forEach(id=>document.addEventListener('input',e=>e.target.id===id&&search()));
$('#menuButton').onclick=()=>$('#nav').classList.toggle('open');
renderCountries();renderOffers();populateCountries();search();route(location.hash.slice(1)||'home',false);
