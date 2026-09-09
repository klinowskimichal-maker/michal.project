(function(root){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ł/g,'l').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[-–—]/g,' ');
const woodWord=t=>/^(drewn\w*|wood|wooden|mahogany|mahon\w*|trebat\w*|trabat\w*)$/.test(t);
const glassWord=t=>/^(laminat\w*|fiberglas\w*|fibreglas\w*|glasfiber\w*|glassfiber\w*|grp)$/.test(t);
const boatWord=t=>/^(lodz|lodzie|lodka|lodki|boat|boats|bat|batar)$/.test(t);
function criteria(query='',material='',country=''){
  const words=norm(query).trim().split(/\s+/).filter(Boolean);
  const wood=words.some(woodWord),glass=words.some(glassWord);
  return {material:material||(wood&&!glass?'wood':glass&&!wood?'fiberglass':''),country,
    terms:words.filter(t=>!woodWord(t)&&!glassWord(t)&&!boatWord(t)),
    query:String(query).trim().split(/\s+/).filter(t=>{const n=norm(t);return !woodWord(n)&&!glassWord(n)&&!boatWord(n)}).join(' ')};
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
  return portals.filter(p=>!c.country||p.country===c.country||['Europa','Świat'].includes(p.country)||(['USA','Kanada'].includes(c.country)&&p.country==='USA / Kanada')).map(p=>{
    const query=[c.query,c.material==='wood'?p.wood:c.material==='fiberglass'?p.glass:''].filter(Boolean).join(' ');
    return {...p,query,href:p.url(query)};
  });
}
const api={norm,criteria,matches,links};root.PSKL_MARKET=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
