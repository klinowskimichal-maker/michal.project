const {models, offers} = window.PSKL_DATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const materialLabel = m => m === 'wood' ? 'Drewno' : m === 'fiberglass' ? 'Laminat' : 'Inny';
function pluralModels(n){if(n===1)return '1 model';if(n>=2&&n<=4)return `${n} modele`;return `${n} modeli`;}
function pluralOffers(n){if(n===1)return '1 oferta';if(n>=2&&n<=4)return `${n} oferty`;return `${n} ofert`;}

const showcase = [
  {country:'Włochy', title:'Riva Aquarama', note:'mahoniowy runabout', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Riva%20Aquarama.jpg?width=900'},
  {country:'USA', title:'Chris-Craft Barrel Back', note:'amerykańska klasyka', img:'https://www.classicboat.com/19-chris-craft-barrel-back-20n-b022-9in.jpg'},
  {country:'Norwegia', title:'Snekke', note:'tradycja skandynawska', img:'https://images.boatsgroup.com/resize/1/23/94/2021-wood-traditional-coastal-motorboat-power-9882394-20250724030731064-1.jpg'},
  {country:'Szwajcaria', title:'Boesch', note:'szwajcarskie runabouty', img:'https://commons.wikimedia.org/wiki/Special:FilePath/1950%20Boesch%20Motorboote%20.jpg?width=900'}
];

function route(name, updateHash=true){
  const valid=['home','catalog','offers','search','book'];
  if(!valid.includes(name)) name='home';
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
  $$('.route').forEach(b=>b.classList.toggle('active',b.dataset.route===name));
  $('#nav').classList.remove('open');
  if(updateHash && location.hash !== `#${name}`) history.pushState(null,'',`#${name}`);
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.route').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
window.addEventListener('popstate',()=>route(location.hash.slice(1)||'home',false));
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['home','catalog','offers','search','book'].includes(h))route(h,false)});

function renderShowcase(){
  $('#modelShowcase').innerHTML=showcase.map(s=>`<article class="showcase-card"><img src="${s.img}" alt="${s.title}" loading="lazy" referrerpolicy="no-referrer"><div class="showcase-caption"><strong>${s.title}</strong><small>${s.country} · ${s.note}</small></div></article>`).join('');
}
function renderCountries(){
  const groups = Object.groupBy ? Object.groupBy(models,m=>m.country) : models.reduce((a,m)=>((a[m.country]??=[]).push(m),a),{});
  $('#catalogCount').textContent = pluralModels(models.length);
  $('#countryCards').innerHTML = Object.entries(groups).map(([country,items],i)=>`<button class="country-card${i===0?' active':''}" data-country="${country}"><span class="flag-stage"><span class="flag">${items[0].flag}</span></span><strong>${country}</strong><small>${pluralModels(items.length)}</small></button>`).join('');
  $$('.country-card').forEach(b=>b.onclick=()=>{ $$('.country-card').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderModels(b.dataset.country); });
  renderModels(Object.keys(groups)[0]);
}
function renderModels(country){
  const list=models.filter(m=>m.country===country);
  $('#modelList').innerHTML=`<h3 class="model-country-title"><span class="flag">${list[0]?.flag||''}</span>${country}</h3><div class="model-toc">${list.map((m,i)=>`<button data-model-target="model-${i}"><span>— ${m.brand} ${m.model}</span><span>${m.years}</span></button>`).join('')}</div>${list.map((m,i)=>`<article id="model-${i}" class="model-card"><div><p class="eyebrow">${m.brand}</p><h3>${m.model}</h3></div><dl><div><dt>Produkcja</dt><dd>${m.years}</dd></div><div><dt>Konstrukcja</dt><dd>${m.construction}</dd></div>${m.length?`<div><dt>Długość</dt><dd>${m.length} m</dd></div>`:''}</dl><p>${m.history}</p></article>`).join('')}`;
  $$('[data-model-target]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.modelTarget)?.scrollIntoView({behavior:'smooth',block:'start'}));
}
function offerCard(o){return `<article class="offer-card"><p class="eyebrow">${o.source} · ${o.country}</p><h3>${o.title}</h3><div class="tags"><span>${o.year||'Rok niepodany'}</span><span>${materialLabel(o.material)}</span></div><strong class="price">${o.price}</strong><small>${o.status}</small></article>`;}
function renderOffers(){const unique=[...new Map(offers.map(o=>[`${norm(o.source)}|${norm(o.title)}|${o.price}`,o])).values()];$('#offerCount').textContent=pluralOffers(unique.length);$('#offerCards').innerHTML=unique.map(offerCard).join('');}
function populateCountries(){[...new Set([...models.map(m=>m.country),...offers.map(o=>o.country)])].sort().forEach(c=>$('#country').insertAdjacentHTML('beforeend',`<option>${c}</option>`));}
function search(){
  const q=norm($('#query').value), material=$('#material').value, country=$('#country').value;
  const result=offers.filter(o=>(!material||o.material===material)&&(!country||o.country===country)&&(!q||norm(`${o.title} ${o.source} ${o.country}`).includes(q)));
  $('#searchSummary').textContent=`Znaleziono: ${result.length}`;
  $('#searchResults').innerHTML=result.length?result.map(offerCard).join(''):'<p class="empty">Brak ofert spełniających wszystkie wybrane kryteria.</p>';
}
['query','material','country'].forEach(id=>document.addEventListener('input',e=>e.target.id===id&&search()));
$('#menuButton').onclick=()=>$('#nav').classList.toggle('open');
renderShowcase();renderCountries();renderOffers();populateCountries();search();route(location.hash.slice(1)||'home',false);