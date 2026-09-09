(function(root){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ł/g,'l').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[-–—]/g,' ');
const woodWord=t=>/^(drewn\w*|wood|wooden|mahogany|mahon\w*|trebat\w*|trabat\w*)$/.test(t);
const glassWord=t=>/^(laminat\w*|fiberglas\w*|fibreglas\w*|glasfiber\w*|glassfiber\w*|grp)$/.test(t);
const boatWord=t=>/^(lodz|lodzie|lodka|lodki|boat|boats|bat|batar)$/.test(t);
const countryWords={polska:'Polska',polsce:'Polska',poland:'Polska',norwegia:'Norwegia',norwegii:'Norwegia',norway:'Norwegia',szwecja:'Szwecja',szwecji:'Szwecja',sweden:'Szwecja',dania:'Dania',danii:'Dania',denmark:'Dania',niemcy:'Niemcy',niemczech:'Niemcy',germany:'Niemcy',finlandia:'Finlandia',finlandii:'Finlandia',usa:'USA',kanada:'Kanada',canada:'Kanada'};
function criteria(query='',material='',country=''){
  const words=norm(query).trim().split(/\s+/).filter(Boolean);
  const wood=words.some(woodWord),glass=words.some(glassWord);
  const detected=[...new Set(words.map(t=>countryWords[t]).filter(Boolean))];
  const inferred=detected.length===1?detected[0]:'';
  const keep=t=>!woodWord(t)&&!glassWord(t)&&!boatWord(t)&&!(inferred&&countryWords[t]);
  return {material:material||(wood&&!glass?'wood':glass&&!wood?'fiberglass':''),country:country||inferred,
    terms:words.filter(keep),
    query:String(query).trim().split(/\s+/).filter(t=>keep(norm(t))).join(' ')};
}
function matches(o,c){
  if(c.material&&o.material!==c.material)return false;
  if(c.country&&o.country!==c.country)return false;
  const hay=norm([o.title,o.source,o.country,o.engine,o.location,o.description,...(o.equipment||[])].filter(Boolean).join(' '));
  return c.terms.every(t=>hay.includes(t));
}
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const portals=[
  {id:'olx',name:'OLX',country:'Polska',wood:'drewniana',glass:'laminat',url:q=>'https://www.olx.pl/sport-hobby/sporty-wodne/lodzie-i-jachty/'+(q?'q-'+slug(q)+'/':'')},
  {id:'allegro',name:'Allegro',country:'Polska',wood:'drewniana',glass:'laminat',url:q=>'https://allegro.pl/kategoria/lodzie-motorowki-4084?string='+encodeURIComponent(q)},
  {id:'finn',name:'FINN.no',country:'Norwegia',wood:'trebåt',glass:'glassfiber',url:q=>'https://www.finn.no/mobility/search/boat?query='+encodeURIComponent(q)},
  {id:'blocket',name:'Blocket',country:'Szwecja',wood:'träbåt',glass:'glasfiber',url:q=>'https://www.blocket.se/mobility/search/boat?q='+encodeURIComponent(q)},
  {id:'boat24',name:'Boat24',country:'Europa',wood:'wood',glass:'fiberglass',url:q=>'https://www.boat24.com/en/powerboats/?q='+encodeURIComponent(q)},
  {id:'yachtworld',name:'YachtWorld',country:'Świat',wood:'wood',glass:'fiberglass',url:q=>'https://www.yachtworld.com/boats-for-sale/'+(q?'keyword-'+slug(q)+'/':'')},
  {id:'aba',name:'Antique Boat America',country:'USA / Kanada',wood:'wooden',glass:'fiberglass',url:q=>'https://www.antiqueboatamerica.com/BoatSearch.aspx?search='+encodeURIComponent(q)},
  {id:'cbc',name:'Classic Boat Collective',country:'USA / Kanada',wood:'wooden',glass:'fiberglass',url:q=>'https://classicboatcollective.com/?s='+encodeURIComponent(q)}
];
function links(c){
  return portals.filter(p=>!c.country||p.country===c.country||['Europa','Świat'].includes(p.country)||(['USA','Kanada'].includes(c.country)&&p.country==='USA / Kanada')).flatMap(p=>{
    const variants=c.material==='wood'&&['olx','allegro'].includes(p.id)?['drewniana','drewniane','drewniany']:[c.material==='wood'?p.wood:c.material==='fiberglass'?p.glass:''];
    return variants.map(material=>{
      const query=[c.query,material].filter(Boolean).join(' ');
      return {...p,query,href:p.url(query)};
    });
  });
}
function sourceStatus(name,status){
  const canonical=s=>s==='FINN.no'?'FINN':s;
  const same=x=>canonical(x.portal)===canonical(name);
  if(!status)return {state:'loading',text:'Sprawdzanie ostatniej aktualizacji…'};
  if(status.failed)return {state:'unavailable',text:'Nie można sprawdzić aktualizacji. Otwórz oferty bezpośrednio w portalu.'};
  const errors=(status.errors||[]).filter(same),searches=(status.searches||[]).filter(same);
  if(errors.some(x=>/\b(401|403|429)\b/.test(x.error||'')))return {state:'blocked',text:'Portal blokuje automatyczne pobieranie ofert do PSKŁ. Otwórz wyszukiwanie bezpośrednio w portalu.'};
  if(errors.length)return {state:'unavailable',text:'Nie udało się pobrać części lub wszystkich ofert. Otwórz wyszukiwanie w portalu.'};
  if(!searches.length)return {state:'unknown',text:'Brak potwierdzonego odczytu ofert z tego portalu.'};
  if(!searches.some(x=>Number(x.found)>0))return {state:'empty',text:'Ostatnia aktualizacja nie odczytała żadnej oferty. Nie oznacza to braku ogłoszeń w portalu; poprawność pobierania nie jest potwierdzona.'};
  return {state:'partial',text:'Odczytano część ofert. Baza PSKŁ nie obejmuje wszystkich ogłoszeń w portalu.'};
}
const api={norm,criteria,matches,links,sourceStatus};root.PSKL_MARKET=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
