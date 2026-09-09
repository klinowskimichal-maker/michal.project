(function(){
'use strict';
const $=s=>document.querySelector(s);
const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
function polishPanel(){
  const panel=$('#pskl-repair-chat');if(!panel)return;
  const small=panel.querySelector('.pskl-chat-title small');setText(small,'NAWIGACJA · ANALIZA · WERYFIKACJA');
  const first=panel.querySelector('.pskl-messages .pskl-msg.bot');
  if(first&&/znowu jestem|pełnym doradcą/i.test(first.textContent))first.textContent='Witaj. Wybierz model lub ofertę, aby rozpocząć analizę. Mogę również pomóc w nawigacji po katalogu i wyszukiwaniu.';
  const buttons=[...panel.querySelectorAll('.pskl-quick button')];
  setText(buttons[0],'Nawigacja');
  setText(buttons[1],'Analiza modelu');
  setText(buttons[2],'Ocena oferty');
  setText(buttons[3],'Skala PSKŁ');
  const note=panel.querySelector('.pskl-ai-note span');setText(note,'Analiza danych katalogowych i ofert PSKŁ');
}
function polishGreeting(node){
  if(!node?.classList?.contains('pirate-auto-greeting'))return;
  node.innerHTML='<b>Witaj w PSKŁ.</b><span>Mogę pomóc w nawigacji, porównaniu modeli oraz analizie ofert.</span>';
}
new MutationObserver(m=>{for(const r of m)for(const n of r.addedNodes){if(n.nodeType===1){polishGreeting(n);n.querySelectorAll?.('.pirate-auto-greeting').forEach(polishGreeting);}}polishPanel();}).observe(document.body,{childList:true,subtree:true});
setTimeout(polishPanel,100);setTimeout(polishPanel,1200);

/* Aktualne objaśnienie wyszukiwania — bez ręcznego wyboru portali. */
document.addEventListener('submit',e=>{
  const form=e.target.closest?.('.pskl-chat-form');if(!form)return;
  const ta=form.querySelector('textarea'),q=(ta?.value||'').trim();
  if(!/wyszuk|szukaj|filtr|gdzie.*szuk|jak.*szuk/i.test(q))return;
  const panel=$('#pskl-repair-chat');if(!panel)return;
  e.preventDefault();e.stopImmediatePropagation();
  ta.value='';
  const box=panel.querySelector('.pskl-messages');
  const add=(text,who)=>{const d=document.createElement('div');d.className=`pskl-msg ${who}`;d.textContent=text;box.appendChild(d);};
  add(q,'user');
  add('W zakładce „Szukaj” ustaw frazę, materiał i kraj, a następnie wybierz „SZUKAJ”. Pasujące zapisane oferty pojawią się poniżej. Indeks obejmuje część rynku; więcej ogłoszeń można otworzyć przez linki do portali. Zaznaczenie „Obserwuj ofertę” zapisuje wybraną pozycję w zakładce „Oferty”, gdzie można ją dalej śledzić i analizować.','bot');
  const body=panel.querySelector('.pskl-chat-body');if(body)body.scrollTop=body.scrollHeight;
},true);
})();