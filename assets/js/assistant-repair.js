(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const data=()=>window.PSKL_DATA||{models:[],offers:[]};
let selectedOffer=null;

function findModel(q){
  const nq=norm(q),models=data().models||[];
  let m=[...models].sort((a,b)=>b.model.length-a.model.length).find(x=>nq.includes(norm(`${x.brand} ${x.model}`)));
  if(m)return m;
  const tokens=nq.split(/[^a-z0-9ąćęłńóśźż]+/).filter(x=>x.length>2);
  const ranked=models.map(x=>({x,score:tokens.filter(t=>norm(`${x.brand} ${x.model}`).includes(t)).length})).sort((a,b)=>b.score-a.score);
  return ranked[0]?.score?ranked[0].x:null;
}
function activeModel(){
  const h=$('.model-detail-copy h2')?.textContent?.trim();
  const index=$('#modelList')?.dataset.selectedModel;
  return h&&index!==undefined?data().models[Number(index)]:null;
}
function modelText(m){
  if(!m)return 'Nie mam jeszcze wybranego modelu. Wejdź w Katalog i wybierz łódź albo wpisz jej nazwę.';
  const stars=n=>'★'.repeat(clamp(Number(n)||3,1,5))+'☆'.repeat(5-clamp(Number(n)||3,1,5));
  return `${m.brand} ${m.model}\nOkres: ${m.years||'—'}\nKonstrukcja: ${m.construction||'—'}${m.length?`\nDługość: ${m.length} m`:''}\nPopularność: ${stars(m.popularity)} ${m.popularity||3}/5\nTrudność zdobycia: ${stars(m.difficulty)} ${m.difficulty||3}/5\nNapęd oryginalny / typowy: ${m.originalEngine||'do potwierdzenia dla rocznika'}\n\n${m.history||''}`;
}
function cardOffer(card){
  const title=card.querySelector('h3')?.textContent?.trim()||'Oferta';
  const all=(typeof window.allOffers==='function'?window.allOffers():data().offers)||[];
  const found=all.find(o=>norm(o.title)===norm(title))||all.find(o=>norm(o.title).includes(norm(title))||norm(title).includes(norm(o.title)));
  if(found)return {...found};
  const tags=[...card.querySelectorAll('.tags span')].map(x=>x.textContent.trim());
  const detail=card.querySelector('.offer-details')?.textContent?.trim()||'';
  return {title,year:tags.find(x=>/^\d{4}$/.test(x))||'',material:tags.some(x=>/drewno/i.test(x))?'wood':tags.some(x=>/laminat/i.test(x))?'fiberglass':'',price:card.querySelector('.price')?.textContent?.trim()||'',engine:detail,status:[...card.querySelectorAll('.offer-body>small')].map(x=>x.textContent.trim()).filter(Boolean).join(' · '),link:card.querySelector('.offer-link')?.href||'',description:card.textContent.trim(),source:card.querySelector('.eyebrow')?.textContent?.split('·')[0]?.trim()||''};
}
function modelForOffer(o){
  const t=norm(`${o?.title||''} ${o?.description||''}`),models=data().models||[];
  return models.find(m=>t.includes(norm(m.model)))||models.find(m=>t.includes(norm(m.brand)))||null;
}
function evaluate(o){
  if(!o)return 'Wybierz konkretną ofertę przyciskiem „🏴‍☠️ Pirat: oceń ofertę”.';
  const m=modelForOffer(o),txt=norm(`${o.title||''} ${o.description||''} ${o.engine||''}`);
  let score=48;const plus=[],risk=[];
  const wood=o.material==='wood'||/drew|wood|treb|träb|mahog/.test(txt);
  if(m){score+=14;plus.push(`dopasowanie do katalogu: ${m.brand} ${m.model}`);if(Number(m.difficulty)>=4){score+=5;plus.push(`rzadszy model — trudność zdobycia ${m.difficulty}/5`)}if(Number(m.popularity)>=4){score+=4;plus.push(`wysoka popularność kolekcjonerska ${m.popularity}/5`)}}else risk.push('brak pewnego dopasowania modelu do katalogu');
  if(wood){score+=8;plus.push('materiał wygląda na drewno')}else risk.push('drewno nie jest jednoznacznie potwierdzone');
  const year=Number(String(o.year||'').match(/(19|20)\d{2}/)?.[0]||0);
  if(year&&year<=1970){score+=5;plus.push(`historyczny rocznik ${year}`)}else if(!year)risk.push('brak pewnego rocznika');
  if(o.engine)plus.push('podano dane napędu');else risk.push('brak danych silnika');
  if(o.link){score+=3;plus.push('jest link do źródła')}else risk.push('brak bezpośredniego linku do źródła');
  if(o.verifiedAt){score+=4;plus.push(`oferta była weryfikowana: ${o.verifiedAt}`)}
  if(/sold|sprzedan|expired|nieakt/.test(norm(o.status))){score-=18;risk.push(`status może oznaczać nieaktywną ofertę: ${o.status}`)}
  score=clamp(score,20,95);
  const verdict=score>=82?'BARDZO CIEKAWA':score>=72?'WARTA UWAGI':score>=60?'CIEKAWA, ALE DO SPRAWDZENIA':'WYMAGA OSTROŻNEJ WERYFIKACJI';
  let out=`${o.title}\nOcena Pirata PSKŁ: ${verdict} · ${score}/100${o.price?`\nCena: ${o.price}`:''}`;
  if(plus.length)out+=`\n\nNa plus:\n• ${plus.join('\n• ')}`;
  if(risk.length)out+=`\n\nRyzyka / braki:\n• ${risk.join('\n• ')}`;
  if(m?.originalEngine)out+=`\n\nNapęd referencyjny modelu:\n${m.originalEngine}`;
  out+='\n\nPrzed zakupem sprawdź: dno i poszycie, wręgi, pawęż, zgniliznę i wilgoć, naprawy konstrukcyjne, numer kadłuba, dokumentację renowacji oraz zimny rozruch silnika.';
  return out;
}
function routeName(){return $('.view.active')?.dataset.view||location.hash.replace('#','')||'home'}
function guide(){
  const route=routeName();
  const hints={home:['.actions .route[data-route="catalog"]','Zacznij od Katalogu — tam wybierzesz kraj i model.'],catalog:['#countryCards','Wybierz kraj, potem model. Mogę opisać historię, konstrukcję, silnik i rzadkość.'],offers:['#offerCards','Przy każdej karcie oferty kliknij przycisk Pirata — ocenię ją osobno.'],search:['#searchNow','Ustaw materiał i opcjonalnie markę/model, potem naciśnij SZUKAJ TERAZ.'],book:['.book-actions a','Tutaj otwierasz Księgę Założycielską.']};
  const [sel,text]=hints[route]||hints.home,target=$(sel);
  if(target){target.classList.add('pskl-guide-highlight');target.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>target.classList.remove('pskl-guide-highlight'),5000)}
  return text;
}
function answer(q){
  const n=norm(q),m=findModel(q)||activeModel();
  if(selectedOffer&&/ocen|wart|ryzyk|kup|cena|silnik|ofert|weryfik/.test(n))return evaluate(selectedOffer);
  if(/prowadz|pomoc|pokaż|pokaz|gdzie/.test(n))return guide();
  if(/gwiazd|popular|trudno.*zdob|rzadk/.test(n))return 'Skala PSKŁ: popularność 1–5 oznacza rozpoznawalność i obecność modelu na rynku. Trudność zdobycia 1–5 oznacza rzadkość; 5/5 = bardzo trudny do znalezienia dobry egzemplarz.';
  if(/wyszuk|drewn|olx|finn|blocket|boat24|allegro/.test(n))return 'W Wyszukiwaniu wybierz materiał. „Drewno” filtruje zapisane oferty; marka lub model tylko zawężają wyniki. Potem otwieraj pełne wyniki w portalach i wróć do Pirata z konkretną ofertą.';
  if(/ofert|weryfik/.test(n))return selectedOffer?evaluate(selectedOffer):'Kliknij przy konkretnej łodzi „🏴‍☠️ Pirat: oceń ofertę”. Zapamiętam tę kartę i sprawdzę model, rocznik, materiał, napęd, status oraz ryzyka.';
  if(/silnik|napęd|naped|histori|model|konstruk|długo|dlugo/.test(n)&&m)return modelText(m);
  if(m&&norm(`${m.brand} ${m.model}`).split(' ').some(x=>x.length>3&&n.includes(x)))return modelText(m);
  return 'Mogę: prowadzić po stronie, wyjaśniać modele i ich historię, porównywać popularność i rzadkość, doradzać przy wyborze oraz oceniać konkretną ofertę przed zakupem.';
}

let panel=$('#pskl-repair-chat');
if(!panel){
  panel=document.createElement('aside');panel.id='pskl-repair-chat';panel.className='pskl-chat';
  panel.innerHTML=`<div class="pskl-chat-head"><div class="pskl-chat-avatar">🏴‍☠️</div><div class="pskl-chat-title"><strong>Piracki Asystent PSKŁ</strong><small>POMOC · DORADZANIE · WERYFIKOWANIE</small></div><button class="pskl-chat-close" type="button">×</button></div><div class="pskl-chat-body"><div class="pskl-quick"><button data-pirate-q="Prowadź mnie po stronie">Prowadź mnie</button><button data-pirate-q="Doradź mi w wyborze modelu">Doradź</button><button data-pirate-q="Jak zweryfikować ofertę?">Weryfikacja</button><button data-pirate-q="Co oznaczają gwiazdki?">Gwiazdki</button></div><div class="pskl-messages"><div class="pskl-msg bot">Ahoj! Znowu jestem pełnym doradcą PSKŁ. Wybierz model lub ofertę, a pomogę ją przeanalizować.</div></div></div><div class="pskl-chat-foot"><form class="pskl-chat-form"><textarea rows="2" placeholder="Zapytaj o model, ofertę, silnik, historię albo ryzyko zakupu…"></textarea><button class="pskl-chat-send" type="submit">➤</button></form><div class="pskl-ai-note"><span>Asystent korzysta z danych katalogu i ofert PSKŁ.</span><b>PSKŁ</b></div></div>`;
  document.body.appendChild(panel);
}
const msgBox=panel.querySelector('.pskl-messages'),input=panel.querySelector('textarea');
function addMsg(text,who='bot'){const d=document.createElement('div');d.className=`pskl-msg ${who}`;d.textContent=text;msgBox.appendChild(d);panel.querySelector('.pskl-chat-body').scrollTop=99999;return d}
function open(seed){panel.classList.add('open');if(seed){addMsg(seed,'user');addMsg(answer(seed),'bot')}setTimeout(()=>input.focus(),80)}
function close(){panel.classList.remove('open')}
panel.querySelector('.pskl-chat-close').onclick=close;
panel.querySelectorAll('[data-pirate-q]').forEach(b=>b.onclick=()=>open(b.dataset.pirateQ));
panel.querySelector('.pskl-chat-form').onsubmit=e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value='';addMsg(q,'user');addMsg(answer(q),'bot')};

function bindPirate(){
  const pirate=$('#pskl-assistant .pskl-pirate');if(!pirate)return false;
  if(pirate.dataset.fullAdvisor==='1')return true;
  pirate.dataset.fullAdvisor='1';
  pirate.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open();},{capture:true});
  pirate.setAttribute('title','Pirat PSKŁ — pomoc, doradzanie i weryfikowanie');
  return true;
}
function decorateOffers(){
  $$('.offer-card').forEach(card=>{
    if(card.dataset.pirateRepair==='1')return;
    const body=card.querySelector('.offer-body')||card,b=document.createElement('button');
    b.type='button';b.className='pskl-offer-ask';b.textContent='🏴‍☠️ Pirat: oceń ofertę';
    b.onclick=e=>{e.preventDefault();e.stopPropagation();selectedOffer=cardOffer(card);open();addMsg(`Sprawdź ofertę: ${selectedOffer.title}`,'user');addMsg(evaluate(selectedOffer),'bot')};
    body.appendChild(b);card.dataset.pirateRepair='1';
  });
}
new MutationObserver(decorateOffers).observe(document.body,{childList:true,subtree:true});
decorateOffers();bindPirate();setTimeout(bindPirate,500);setTimeout(bindPirate,1800);

window.PSKL_PIRATE_FULL_ADVISOR=true;
})();