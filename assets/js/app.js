const {models, offers} = window.PSKL_DATA;
const $ = s => document.querySelector(s);
const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const materialLabel = m => m === 'wood' ? 'Drewno' : m === 'fiberglass' ? 'Laminat' : 'Inny';
function pluralModels(n){if(n===1)return '1 model';if(n>=2&&n<=4)return `${n} modele`;return `${n} modeli`;}
function renderCountries(){
  const groups = Object.groupBy ? Object.groupBy(models,m=>m.country) : models.reduce((a,m)=>((a[m.country]??=[]).push(m),a),{});
  $('#catalogCount').textContent = pluralModels(models.length);
  $('#countryCards').innerHTML = Object.entries(groups).map(([country,items])=>`<button class="country-card" data-country="${country}"><span class="flag">${items[0].flag}</span><strong>${country}</strong><small>${pluralModels(items.length)}</small></button>`).join('');
  document.querySelectorAll('.country-card').forEach(b=>b.onclick=()=>renderModels(b.dataset.country));
  renderModels(Object.keys(groups)[0]);
}
function renderModels(country){
  const list=models.filter(m=>m.country===country);
  $('#modelList').innerHTML=`<h3>${list[0]?.flag||''} ${country}</h3><div class="model-toc">${list.map((m,i)=>`<a href="#model-${i}">— ${m.brand} ${m.model} <span>${m.years}</span></a>`).join('')}</div>${list.map((m,i)=>`<article id="model-${i}" class="model-card"><div><p class="eyebrow">${m.brand}</p><h3>${m.model}</h3></div><dl><div><dt>Produkcja</dt><dd>${m.years}</dd></div><div><dt>Konstrukcja</dt><dd>${m.construction}</dd></div>${m.length?`<div><dt>Długość</dt><dd>${m.length} m</dd></div>`:''}</dl><p>${m.history}</p></article>`).join('')}`;
}
function offerCard(o){return `<article class="offer-card"><p class="eyebrow">${o.source} · ${o.country}</p><h3>${o.title}</h3><div class="tags"><span>${o.year||'Rok niepodany'}</span><span>${materialLabel(o.material)}</span></div><strong class="price">${o.price}</strong><small>${o.status}</small></article>`;}
function renderOffers(){const unique=[...new Map(offers.map(o=>[`${norm(o.source)}|${norm(o.title)}|${o.price}`,o])).values()];$('#offerCount').textContent=`${unique.length} ofert`;$('#offerCards').innerHTML=unique.map(offerCard).join('');}
function populateCountries(){[...new Set([...models.map(m=>m.country),...offers.map(o=>o.country)])].sort().forEach(c=>$('#country').insertAdjacentHTML('beforeend',`<option>${c}</option>`));}
function search(){
  const q=norm($('#query').value), material=$('#material').value, country=$('#country').value;
  // Material is a strict structured field. Searching for wood never falls back to title keywords,
  // so fiberglass listings cannot leak into wooden results merely because their title mentions a classic brand.
  const result=offers.filter(o=>(!material||o.material===material)&&(!country||o.country===country)&&(!q||norm(`${o.title} ${o.source} ${o.country}`).includes(q)));
  $('#searchSummary').textContent=`Znaleziono: ${result.length}`;$('#searchResults').innerHTML=result.length?result.map(offerCard).join(''):'<p class="empty">Brak ofert spełniających wszystkie wybrane kryteria.</p>';
}
['query','material','country'].forEach(id=>document.addEventListener('input',e=>e.target.id===id&&search()));
$('#menuButton').onclick=()=>$('#nav').classList.toggle('open');
renderCountries();renderOffers();populateCountries();search();