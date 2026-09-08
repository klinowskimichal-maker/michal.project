(function(){
'use strict';
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Wewnętrzne, orientacyjne widełki PSKŁ w EUR. Używa ich wyłącznie lokalny ekspert.
// To heurystyka kwalifikacyjna, nie profesjonalna wycena ani indeks transakcyjny.
const BANDS={
  'riva aquarama':[450000,750000],'riva super aquarama':[500000,850000],'riva aquarama special':[650000,950000],
  'riva ariston':[70000,190000],'riva olympic':[45000,130000],'riva junior':[25000,75000],'riva florida':[40000,110000],
  'riva tritone':[120000,350000],'riva monte carlo superfast':[110000,320000],
  'chris-craft barrel back':[35000,130000],'chris craft barrel back':[35000,130000],'chris-craft riviera':[25000,85000],
  'chris-craft capri':[22000,60000],'chris-craft cobra':[60000,350000],'chris-craft u-22 sportsman':[18000,60000],
  'chris-craft continental':[18000,60000],'century resorter':[8000,45000],'century coronado':[18000,65000],
  'gar wood triple cockpit':[70000,300000],'hacker-craft triple cockpit':[90000,400000],
  'lyman 18':[8000,30000],'lyman cruisette':[10000,45000],'lyman sportsman':[12000,50000],
  'greavette streamliner':[25000,100000],'shepherd 22':[25000,90000],
  'pettersson':[12000,60000],'storebro solö ruff':[12000,35000],'storebro solo ruff':[12000,35000],
  'storebro royal cruiser i':[18000,65000],'storö i':[18000,65000],'storo i':[18000,65000],
  'arendal snekke':[7000,28000],'sørlandssnekke':[5000,24000],'snekke':[5000,30000],'færdersnekke':[7000,28000],
  'boesch 510':[25000,50000],'boesch 580':[45000,90000],'boesch 590':[55000,130000],
  'fairey huntress':[28000,70000],'fairey huntsman':[35000,100000],'fairey swordsman':[55000,150000]
};
const FAMILY={
  'riva':[60000,300000],'chris-craft':[15000,90000],'chris craft':[15000,90000],'century':[8000,55000],
  'gar wood':[50000,220000],'hacker':[70000,280000],'lyman':[8000,45000],'greavette':[22000,90000],
  'shepherd':[22000,80000],'storebro':[10000,60000],'boesch':[25000,120000],'fairey':[28000,120000],
  'snekke':[5000,30000],'pettersson':[10000,55000]
};
// Stałe kursy orientacyjne służą wyłącznie do lokalnego porównania ceny.
const FX={EUR:1,'€':1,USD:.86,'$':.86,GBP:1.15,'£':1.15,NOK:.086,SEK:.091,PLN:.235,'ZŁ':.235,CAD:.62};
const models=()=>window.PSKL_DATA?.models||window.PSKL_CATALOG||[];
function parsePrice(raw){
  const s=String(raw||'').replace(/\u00a0/g,' ').trim();
  if(!s||!/\d/.test(s)||/cena w ogłoszeniu|price on request|por|zapytaj/i.test(s))return null;
  let cur=Object.keys(FX).find(c=>new RegExp(c.replace('$','\\$'),'i').test(s));
  if(!cur){if(/\bkr\b/i.test(s))cur='SEK';else return null;}
  const m=s.match(/\d[\d\s.,]*/);if(!m)return null;
  let num=m[0].replace(/\s/g,'');
  if(num.includes(',')&&num.includes('.')){if(num.lastIndexOf(',')>num.lastIndexOf('.'))num=num.replace(/\./g,'').replace(',','.');else num=num.replace(/,/g,'');}
  else if((num.match(/[.,]/g)||[]).length===1){const sep=num.includes(',')?',':'.';const tail=num.split(sep)[1]||'';if(tail.length===3)num=num.replace(sep,'');else num=num.replace(',','.');}
  else num=num.replace(/[.,]/g,'');
  const value=Number(num);if(!Number.isFinite(value)||value<=0)return null;
  const key=cur.toUpperCase();return{original:value,currency:cur,eur:value*(FX[key]||FX[cur]||1)};
}
function findModel(o){
  const t=norm(`${o?.title||''} ${o?.description||''}`), ms=models();
  let best=null,bestScore=0;
  for(const m of ms){const brand=norm(m.brand),model=norm(m.model);let s=0;if(model&&t.includes(model))s+=8;if(brand&&t.includes(brand))s+=3;const toks=model.split(/[^a-z0-9]+/).filter(x=>x.length>3);s+=toks.filter(x=>t.includes(x)).length;if(s>bestScore){best=m;bestScore=s}}
  return bestScore>=3?best:null;
}
function baseBand(o,m){const t=norm(`${o?.title||''} ${m?.brand||''} ${m?.model||''}`);let hit=null,best=0;for(const [k,v] of Object.entries(BANDS)){if(t.includes(k)&&k.length>best){hit=v;best=k.length}}if(hit)return hit.slice();for(const [k,v] of Object.entries(FAMILY)){if(t.includes(k))return v.slice();}return[7000,45000];}
function engineState(o,m){const a=norm(o?.engine||o?.description||''),b=norm(m?.originalEngine||'');if(!a||!b)return'unknown';const brands=['volvo','penta','mercruiser','chris','crusader','marstal','ford','hercules','chrysler','gray','parsons','gm','yanmar','perkins'];return brands.some(x=>a.includes(x)&&b.includes(x))?'match':brands.some(x=>a.includes(x))?'different':'unknown';}
function signals(o){const t=norm(`${o?.title||''} ${o?.description||''} ${(o?.equipment||[]).join(' ')}`);const pos=[],neg=[];
  if(/restored|restaur|renov|refit|odrestaurow|renowac/.test(t))pos.push('udokumentowana/ogłoszona renowacja');
  if(/original|oryginal|matching numbers|matching-number/.test(t))pos.push('deklarowana oryginalność');
  if(/trailer|przyczep/.test(t))pos.push('przyczepa'); if(/cover|pokrow/.test(t))pos.push('pokrowiec'); if(/documents|documentation|dokument|history|historia/.test(t))pos.push('dokumentacja/historia');
  if(/project|projekt|do renowacji|needs restoration|repair|napraw/.test(t))neg.push('egzemplarz projektowy / wymaga prac');
  if(/rot|rotten|zgniliz|leak|przeciek|soft wood|wilgo/.test(t))neg.push('sygnał możliwych problemów konstrukcyjnych');
  return{pos,neg};}
function adjustedBand(o,m){let [low,high]=baseBand(o,m);let mult=1;const why=[];const diff=Number(m?.difficulty||3),pop=Number(m?.popularity||3);
  mult*=1+({1:-.10,2:-.05,3:0,4:.10,5:.20}[diff]||0); if(diff>=4)why.push(`rzadkość ${diff}/5`);
  mult*=1+({1:-.10,2:-.05,3:0,4:.06,5:.12}[pop]||0); if(pop>=4)why.push(`popularność kolekcjonerska ${pop}/5`);
  const year=Number(String(o?.year||'').match(/(19|20)\d{2}/)?.[0]||0);if(year&&year<1950){mult*=1.12;why.push('przedwojenny / bardzo wczesny rocznik')}else if(year&&year<=1969){mult*=1.07;why.push('wczesny klasyczny rocznik')}else if(year>=1990){mult*=.95;}
  const es=engineState(o,m);if(es==='match'){mult*=1.08;why.push('napęd zbieżny z typowym/originalnym')}else if(es==='different'){mult*=.92;why.push('napęd prawdopodobnie nieoryginalny')}
  const sig=signals(o);let equip=0;equip+=Math.min(.16,sig.pos.length*.035);equip-=Math.min(.30,sig.neg.length*.15);mult*=1+equip;
  mult=clamp(mult,.55,1.55);return{low:Math.round(low*mult/500)*500,high:Math.round(high*mult/500)*500,mult,why,engineState:es,signals:sig};
}
function evaluate(o){const m=findModel(o),band=adjustedBand(o,m),price=parsePrice(o?.price),reasons=[],risks=[];let score=52;
  if(m){score+=10;reasons.push(`dopasowano ${m.brand} ${m.model}`);score+=(Number(m.difficulty||3)-3)*4;score+=(Number(m.popularity||3)-3)*3}else risks.push('model nie został jednoznacznie dopasowany');
  if(o?.material==='wood'){score+=7;reasons.push('potwierdzone/zaklasyfikowane drewno')}else risks.push('materiał wymaga potwierdzenia');
  if(band.engineState==='match'){score+=6;reasons.push('napęd zgodny z typową rodziną')}else if(band.engineState==='different'){score-=7;risks.push('napęd może być nieoryginalny')}else risks.push('brak pewnych danych silnika');
  score+=band.signals.pos.length*2;score-=band.signals.neg.length*8;reasons.push(...band.signals.pos);risks.push(...band.signals.neg);
  let pricePosition='unknown',priceText='Cena nie została odczytana — brak oceny opłacalności cenowej.';
  if(price){if(price.eur<band.low*.78){pricePosition='very_low';score+=5;priceText='Cena jest wyraźnie poniżej wewnętrznego zakresu PSKŁ — może to być okazja, ale też sygnał ukrytych prac.'}
    else if(price.eur<band.low){pricePosition='low';score+=7;priceText='Cena jest poniżej wewnętrznego zakresu PSKŁ i wygląda atrakcyjnie, jeśli stan się potwierdzi.'}
    else if(price.eur<=band.high){pricePosition='fair';score+=8;priceText='Cena mieści się w wewnętrznym zakresie PSKŁ dla takiej konfiguracji.'}
    else if(price.eur<=band.high*1.25){pricePosition='high';score-=4;priceText='Cena jest powyżej wewnętrznego zakresu PSKŁ; musi ją uzasadniać stan, oryginalność lub dokumentacja.'}
    else{pricePosition='very_high';score-=12;priceText='Cena jest wyraźnie powyżej wewnętrznego zakresu PSKŁ.'}}
  if(!o?.year)risks.push('brak pewnego rocznika');if(!o?.link)risks.push('brak linku źródłowego');if(/sold|sprzedan|expired|nieakt/i.test(String(o?.status||''))){score-=18;risks.push('oferta może być nieaktywna')}
  score=clamp(Math.round(score),20,95);const verdict=score>=82?'BARDZO CIEKAWA':score>=72?'WARTA UWAGI':score>=60?'CIEKAWA, ALE DO SPRAWDZENIA':score>=48?'TYLKO PO DOKŁADNEJ WERYFIKACJI':'RACZEJ ODPUSZCZAĆ';
  return{o,m,band,price,score,verdict,pricePosition,priceText,reasons:[...new Set(reasons)],risks:[...new Set(risks)]};
}
window.PSKL_VALUATION={evaluate,findModel,parsePrice,adjustedBand,version:'1.1-free'};
})();