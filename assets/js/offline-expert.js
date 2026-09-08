(function(){
'use strict';
const $=s=>document.querySelector(s);const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let selected=null;
function chatRoot(){return $('#pskl-repair-chat')||$('.pskl-chat')}
function universe(){try{if(typeof window.allOffers==='function'){const x=window.allOffers();if(Array.isArray(x))return x}}catch(e){}return window.PSKL_DATA?.offers||[]}
function findOffer(title){const n=norm(title),all=universe();return all.find(o=>norm(o.title)===n)||all.find(o=>norm(o.title).includes(n)||n.includes(norm(o.title)))||null}
function fromCard(card){const title=card.querySelector('h3')?.textContent?.trim()||'Oferta';const found=findOffer(title);if(found)return{...found};const tags=[...card.querySelectorAll('.tags span')].map(x=>x.textContent.trim());const eyebrow=card.querySelector('.eyebrow')?.textContent?.split('·').map(x=>x.trim())||[];return{title,source:eyebrow[0]||'',country:eyebrow[1]||'',year:tags.find(x=>/^\d{4}$/.test(x))||'',material:tags.some(x=>/drewno/i.test(x))?'wood':'',price:card.querySelector('.price')?.textContent?.trim()||'',engine:card.querySelector('.offer-details')?.textContent?.trim()||'',description:card.textContent.trim(),status:[...card.querySelectorAll('.offer-body>small')].map(x=>x.textContent.trim()).join(' · '),link:card.querySelector('.offer-link')?.href||''}}
function openChat(){const c=chatRoot();if(c)c.classList.add('open')}
function add(text,who='bot'){const c=chatRoot(),box=c?.querySelector('.pskl-messages');if(!box)return;const m=document.createElement('div');m.className=`pskl-msg ${who}`;m.textContent=text;box.appendChild(m);const body=c.querySelector('.pskl-chat-body');if(body)body.scrollTop=body.scrollHeight}
function eur(n){return new Intl.NumberFormat('pl-PL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)}
function summary(ev,showBand=false){let out=`${ev.o.title}\nWerdykt Pirata PSKŁ: ${ev.verdict} · ${ev.score}/100`;
  if(ev.confidence)out+=`\nPewność diagnozy na podstawie dostępnych danych: ${ev.confidence}%`;
  if(ev.o.year)out+=`\nRok: ${ev.o.year}`;if(ev.o.engine)out+=`\nSilnik/napęd: ${ev.o.engine}`;if(ev.o.price)out+=`\nCena: ${ev.o.price}`;
  out+=`\n\n${ev.priceText}`;
  if(showBand)out+=`\nOrientacyjny wewnętrzny zakres PSKŁ po korektach: ${eur(ev.band.low)} – ${eur(ev.band.high)}.`;
  if(ev.woodAssessment?.length)out+=`\n\nDrewno / konstrukcja — sygnały z opisu:\n• ${ev.woodAssessment.join('\n• ')}`;
  if(ev.equipmentAssessment?.length)out+=`\n\nWyposażenie zauważone w opisie:\n• ${ev.equipmentAssessment.join('\n• ')}`;
  if(ev.reasons.length)out+=`\n\nNa plus:\n• ${ev.reasons.slice(0,8).join('\n• ')}`;
  if(ev.risks.length)out+=`\n\nRyzyka / braki danych:\n• ${ev.risks.slice(0,8).join('\n• ')}`;
  out+=`\n\nCo sprawdzić fizycznie: poszycie i dno od środka, wręgi, pawęż, wilgoć/zgniliznę, mocowania i okucia, dokumentację napraw, numer kadłuba, oryginalność wyposażenia oraz zimny rozruch silnika. To bezpłatna lokalna kwalifikacja PSKŁ — nie survey ani profesjonalna wycena.`;
  return out;
}
function answer(q){if(!selected)return'Najpierw wybierz konkretną ofertę przyciskiem „🏴‍☠️ Pirat: oceń ofertę”.';const V=window.PSKL_VALUATION;if(!V)return'Ładuję bezpłatny lokalny moduł diagnozy PSKŁ.';const ev=V.evaluate(selected),n=norm(q);
  if(/wideł|widel|zakres|ile wart|wartosc|wartość|cena|kwot/.test(n))return summary(ev,true);
  if(/silnik|napęd|naped|motor/.test(n)){const m=ev.m;let s=`Dane napędu z oferty: ${selected.engine||'brak danych'}.`;if(m?.originalEngine)s+=`\nTypowy/originalny napęd katalogowy: ${m.originalEngine}.`;s+=ev.band.engineState==='match'?'\nOcena: napęd wygląda zgodnie z rodziną typową dla modelu.':ev.band.engineState==='different'?'\nOcena: napęd może być nieoryginalny lub nietypowy — sprawdzić dokumentację.':'\nOcena: za mało danych, żeby potwierdzić zgodność.';return s}
  if(/drew|maho|teak|dąb|dab|zgnil|wilgo|poszy/.test(n))return ev.woodAssessment?.length?`Z opisu oferty Pirat wychwycił:\n• ${ev.woodAssessment.join('\n• ')}\n\nRyzyka konstrukcyjne:\n• ${(ev.risks.length?ev.risks:['brak wyraźnych sygnałów w tekście — konieczne oględziny']).join('\n• ')}`:'W ogłoszeniu jest za mało danych o drewnie, żeby wiarygodnie ocenić jego jakość. Konieczne są zdjęcia od środka i oględziny wilgotności, wręg, poszycia i pawęży.';
  if(/wyposaż|wyposaz|gps|przyczep|pokrow|bezpiec/.test(n))return ev.equipmentAssessment?.length?`Wyposażenie rozpoznane w danych oferty:\n• ${ev.equipmentAssessment.join('\n• ')}`:'W danych karty nie rozpoznałem istotnego wyposażenia dodatkowego.';
  if(/ryzyk|problem|sprawd|uwaga/.test(n))return`Najważniejsze ryzyka dla tej oferty:\n• ${(ev.risks.length?ev.risks:['brak wystarczających danych konstrukcyjnych w indeksie']).join('\n• ')}\n\nDo obejrzenia fizycznie: dno/poszycie, wręgi, pawęż, wilgoć/zgnilizna, śruby i okucia, historia napraw oraz zimny rozruch.`;
  if(/unikal|rzadk|kolekc|popular/.test(n)){const m=ev.m;return m?`${m.brand} ${m.model}: popularność kolekcjonerska ${m.popularity||3}/5, trudność zdobycia ${m.difficulty||3}/5. Te parametry wpływają na lokalną ocenę atrakcyjności i orientacyjny zakres wartości.`:'Nie dopasowałem modelu wystarczająco pewnie, więc nie chcę zgadywać jego unikalności.'}
  return summary(ev,false);
}
function updateNote(){const c=chatRoot();const note=c?.querySelector('.pskl-ai-note span');if(note)note.textContent='Lokalny ekspert PSKŁ · bez API · 0 zł za odpowiedzi';const small=c?.querySelector('.pskl-chat-title small');if(small)small.textContent='POMOC · DORADCA · DIAGNOZA OFERT · 0 ZŁ'}
document.addEventListener('click',e=>{const btn=e.target.closest('.pskl-offer-ask');if(!btn)return;const card=btn.closest('.offer-card');if(!card)return;e.preventDefault();e.stopImmediatePropagation();selected=fromCard(card);window.PSKL_SELECTED_OFFER=selected;openChat();add(`Oceń ofertę: ${selected.title}`,'user');const V=window.PSKL_VALUATION;if(V)add(summary(V.evaluate(selected),false));else add('Moduł diagnozy nie został załadowany.');const pirate=$('.pskl-pirate');if(pirate){pirate.classList.add('spyglass');setTimeout(()=>pirate.classList.remove('spyglass'),1900)}},true);
document.addEventListener('submit',e=>{const form=e.target.closest('#pskl-repair-chat .pskl-chat-form');if(!form||!selected)return;e.preventDefault();e.stopImmediatePropagation();const ta=form.querySelector('textarea');const q=ta?.value?.trim();if(!q)return;ta.value='';add(q,'user');add(answer(q));},true);
setTimeout(updateNote,300);setTimeout(updateNote,1800);setTimeout(updateNote,3500);
window.PSKL_OFFLINE_EXPERT={getSelected:()=>selected,answer,summary};
})();