(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function universe(){try{const x=typeof window.allOffers==='function'?window.allOffers():null;if(Array.isArray(x))return x}catch(e){}return window.PSKL_DATA?.offers||[]}
function fromCard(card){
  const title=card.querySelector('h3')?.textContent?.trim()||'Oferta',all=universe();
  const found=all.find(o=>norm(o.title)===norm(title))||all.find(o=>norm(o.title).includes(norm(title))||norm(title).includes(norm(o.title)));
  if(found)return {...found};
  const tags=[...card.querySelectorAll('.tags span')].map(x=>x.textContent.trim());
  return{title,year:tags.find(x=>/^\d{4}$/.test(x))||'',material:tags.some(x=>/drewno/i.test(x))?'wood':tags.some(x=>/laminat/i.test(x))?'fiberglass':'',price:card.querySelector('.price')?.textContent?.trim()||'',engine:card.querySelector('.offer-details')?.textContent?.trim()||'',description:card.textContent.trim(),link:card.querySelector('.offer-link')?.href||'',status:[...card.querySelectorAll('.offer-body>small')].map(x=>x.textContent.trim()).join(' · ')};
}
function tone(v){if(v>=84)return'great';if(v>=73)return'good';if(v>=61)return'check';if(v>=49)return'caution';return'avoid'}
function analyseCard(card){
  if(card.dataset.pirateAuto==='1')return;
  const V=window.PSKL_VALUATION;if(!V)return;
  const o=fromCard(card),ev=V.evaluate(o),body=card.querySelector('.offer-body')||card;
  const badge=document.createElement('button');badge.type='button';badge.className=`pirate-auto-verdict ${tone(ev.score)}`;
  badge.innerHTML=`<span>🏴‍☠️ PIRAT PSKŁ</span><strong>${ev.verdict}</strong><small>${ev.score}/100 · pewność ${ev.confidence||'—'}%</small>`;
  badge.title='Kliknij, aby zobaczyć pełną analizę Pirata';
  badge.onclick=e=>{e.preventDefault();e.stopPropagation();const ask=card.querySelector('.pskl-offer-ask');if(ask)ask.click();else document.querySelector('#pskl-assistant .pskl-pirate')?.click();};
  body.insertBefore(badge,body.firstChild);card.dataset.pirateAuto='1';
}
function scan(){$$('.offer-card').forEach(analyseCard)}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();setTimeout(scan,800);setTimeout(scan,2200);
function greet(){
  const root=$('#pskl-assistant');if(!root||root.querySelector('.pirate-auto-greeting'))return;
  const b=document.createElement('div');b.className='pirate-auto-greeting';b.innerHTML='<b>Ahoj! 🏴‍☠️</b><span>Jestem Piratem PSKŁ. Pomagam po stronie, doradzam przy modelach i po cichu oceniam oferty.</span>';
  root.appendChild(b);requestAnimationFrame(()=>b.classList.add('show'));setTimeout(()=>b.classList.remove('show'),6500);setTimeout(()=>b.remove(),7200);
  const p=root.querySelector('.pskl-pirate');if(p){p.classList.add('salute');setTimeout(()=>p.classList.remove('salute'),1600)}
}
setTimeout(greet,900);
})();