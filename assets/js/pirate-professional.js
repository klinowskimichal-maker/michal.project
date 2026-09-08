(function(){
'use strict';
const $=s=>document.querySelector(s);
function polishPanel(){
  const panel=$('#pskl-repair-chat');if(!panel)return;
  const small=panel.querySelector('.pskl-chat-title small');if(small)small.textContent='NAWIGACJA · ANALIZA · WERYFIKACJA';
  const first=panel.querySelector('.pskl-messages .pskl-msg.bot');
  if(first&&/znowu jestem|pełnym doradcą/i.test(first.textContent))first.textContent='Witaj. Wybierz model lub ofertę, aby rozpocząć analizę. Mogę również pomóc w nawigacji po katalogu i wyszukiwaniu.';
  const buttons=[...panel.querySelectorAll('.pskl-quick button')];
  if(buttons[0])buttons[0].textContent='Nawigacja';
  if(buttons[1])buttons[1].textContent='Analiza modelu';
  if(buttons[2])buttons[2].textContent='Ocena oferty';
  if(buttons[3])buttons[3].textContent='Skala PSKŁ';
  const note=panel.querySelector('.pskl-ai-note span');if(note)note.textContent='Lokalny ekspert PSKŁ · analiza danych katalogowych i ofert';
}
function polishGreeting(node){
  if(!node?.classList?.contains('pirate-auto-greeting'))return;
  node.innerHTML='<b>Witaj w PSKŁ.</b><span>Mogę pomóc w nawigacji, porównaniu modeli oraz analizie ofert.</span>';
}
new MutationObserver(m=>{for(const r of m)for(const n of r.addedNodes){if(n.nodeType===1){polishGreeting(n);n.querySelectorAll?.('.pirate-auto-greeting').forEach(polishGreeting);}}polishPanel();}).observe(document.body,{childList:true,subtree:true});
setTimeout(polishPanel,100);setTimeout(polishPanel,1200);

/* Aktualne, profesjonalne objaśnienie wyszukiwania — bez ręcznego wyboru portali. */
document.addEventListener('submit',e=>{
  const form=e.target.closest?.('.pskl-chat-form');if(!form)return;
  const ta=form.querySelector('textarea'),q=(ta?.value||'').trim();
  if(!/wyszuk|szukaj|filtr|ofert/i.test(q))return;
  const panel=$('#pskl-repair-chat');if(!panel)return;
  e.preventDefault();e.stopImmediatePropagation();
  ta.value='';
  const box=panel.querySelector('.pskl-messages');
  const add=(text,who)=>{const d=document.createElement('div');d.className=`pskl-msg ${who}`;d.textContent=text;box.appendChild(d);};
  add(q,'user');
  add('W zakładce „Szukaj” ustaw frazę, materiał i kraj, a następnie wybierz „SZUKAJ”. Pasujące oferty pojawią się automatycznie poniżej. Zaznaczenie „Obserwuj ofertę” zapisuje wybraną pozycję w zakładce „Oferty”, gdzie można ją dalej śledzić i analizować.','bot');
  const body=panel.querySelector('.pskl-chat-body');if(body)body.scrollTop=body.scrollHeight;
},true);
})();