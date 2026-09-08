(function(){
'use strict';
const V=window.PSKL_VALUATION;if(!V||V._plus)return;
const baseEvaluate=V.evaluate;const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const uniq=a=>[...new Set(a)];const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function inspectText(o){
  const t=norm(`${o?.title||''} ${o?.description||''} ${o?.engine||''} ${(o?.equipment||[]).join(' ')} ${o?.notes||''}`);
  const plus=[],risk=[],wood=[],equipment=[];let delta=0,confidence=35;
  const hit=(re)=>re.test(t);
  if(hit(/mahog|mahoni|teak|tikow|oak|dąb|dab|pitch.?pine|cedar/)){wood.push('określony gatunek drewna');delta+=2;confidence+=4}
  if(hit(/solid mahogany|lity maho|solid wood|lity dąb|lity dab/)){wood.push('deklarowane lite drewno');delta+=3;confidence+=3}
  if(hit(/dry stored|stored indoors|garaż|garaz|under cover|winter storage|heated storage/)){wood.push('korzystne informacje o przechowywaniu');delta+=3;confidence+=3}
  if(hit(/rot|rotten|zgniliz|soft wood|miękkie drewno|miekke drewno|delamin|osmo|wilgo|moisture|leak|przeciek/)){risk.push('opis zawiera sygnał możliwego problemu z drewnem lub wilgocią');delta-=10;confidence+=5}
  if(hit(/new planks|new bottom|new frames|replanked|wymienione poszycie|nowe wręgi|nowe wregi|new keel/)){wood.push('deklarowane prace konstrukcyjne przy drewnie');delta+=4;confidence+=4}
  if(hit(/survey|raport inspekcji|inspection report|moisture report/)){plus.push('dostępna/deklarowana inspekcja lub survey');delta+=5;confidence+=7}
  if(hit(/receipts|invoice|faktury|documentation|dokumentacja|service history|historia serwisowa|restoration history/)){plus.push('dokumentacja prac lub historii');delta+=4;confidence+=5}
  if(hit(/original engine|matching numbers|oryginalny silnik|factory engine/)){plus.push('deklarowana oryginalność napędu');delta+=4;confidence+=3}
  if(hit(/trailer|przyczep/)){equipment.push('przyczepa');delta+=1}
  if(hit(/cover|pokrow/)){equipment.push('pokrowiec');delta+=1}
  if(hit(/gps|plotter|chartplotter|sonar|echo sounder|echosonda/)){equipment.push('nawigacja/elektronika');delta+=1}
  if(hit(/bilge pump|pompa zęz|pompa zez|automatic bilge/)){equipment.push('pompa zęzowa');delta+=1}
  if(hit(/fire extinguisher|gaśnic|gasnic|life jacket|kamizelk/)){equipment.push('wyposażenie bezpieczeństwa');delta+=1}
  if(hit(/new upholstery|tapicerk|new cushions|new canvas|nowa plandeka/)){equipment.push('odnowione wyposażenie');delta+=1}
  if(hit(/project boat|do renowacji|needs restoration|major restoration|structural repair/)){risk.push('egzemplarz projektowy / duży zakres prac');delta-=8;confidence+=4}
  if(hit(/unknown condition|stan nieznany|no history|brak historii/)){risk.push('niepełna historia lub stan');delta-=4}
  const fields=['year','price','engine','material','location','link'];confidence+=fields.filter(k=>o?.[k]).length*6;
  confidence=clamp(confidence,30,95);
  return{delta,confidence,plus, risk, wood, equipment};
}
function evaluate(o){
  const ev=baseEvaluate(o),x=inspectText(o);let score=clamp(Math.round(ev.score+x.delta),20,95);
  const verdict=score>=84?'BARDZO CIEKAWA':score>=73?'WARTA UWAGI':score>=61?'CIEKAWA, ALE DO SPRAWDZENIA':score>=49?'TYLKO PO DOKŁADNEJ WERYFIKACJI':'RACZEJ ODPUSZCZAĆ';
  const reasons=uniq([...(ev.reasons||[]),...x.plus,...x.wood,...x.equipment.map(e=>`wyposażenie: ${e}`)]);
  const risks=uniq([...(ev.risks||[]),...x.risk]);
  return{...ev,score,verdict,reasons,risks,confidence:x.confidence,woodAssessment:x.wood,equipmentAssessment:x.equipment,diagnosticVersion:'2.0-free-local'};
}
V.evaluate=evaluate;V.inspectText=inspectText;V.version='2.0-free-local';V._plus=true;
})();