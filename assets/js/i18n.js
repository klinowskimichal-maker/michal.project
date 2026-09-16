(function(){
'use strict';
const style=document.createElement('link');style.rel='stylesheet';style.href='assets/css/i18n.css?v=1';document.head.appendChild(style);
const lang=localStorage.getItem('pskl-language')==='en'?'en':'pl';
window.PSKL_LANG=lang;
window.PSKL_SET_LANG=value=>{localStorage.setItem('pskl-language',value==='en'?'en':'pl');location.reload();};
document.documentElement.lang=lang;
document.querySelectorAll('[data-lang]').forEach(button=>{
  button.classList.toggle('active',button.dataset.lang===lang);
  button.addEventListener('click',()=>window.PSKL_SET_LANG(button.dataset.lang));
});
if(lang!=='en')return;

const data=window.PSKL_I18N_DATA||{};
const ui={
  'Start':'Home','Katalog':'Catalogue','Oferty':'Listings','Szukaj':'Search','Oferty rynkowe':'Market listings','Wyszukiwanie':'Search','Księga':'Founding Book','Logo i instalacja':'Logo and installation','Dane kontaktowe':'Contact details','05 · DANE KONTAKTOWE':'05 · CONTACT DETAILS',
  'modele i profile':'models and profiles','obserwowane i analiza':'watchlist and analysis','wyniki według filtrów':'filtered results','34 strony':'34 pages','udostępnij i instaluj':'share and install','telefon i email':'phone and email','Telefon':'Phone','Email':'Email','Założyciel':'Founder','Polskie Stowarzyszenie Zabytkowych i Klasycznych Łodzi oraz Tradycyjnego Szkutnictwa':'Polish Association of Antique and Classic Boats and Traditional Boatbuilding',
  'POLSKIE STOWARZYSZENIE KLASYCZNYCH I ZABYTKOWYCH ŁODZI':'POLISH ASSOCIATION OF ANTIQUE AND CLASSIC BOATS',
  'Klasyczne łodzie.':'Classic boats.','Dziedzictwo, które żyje.':'Living heritage.',
  'Cyfrowy katalog klasycznych i zabytkowych łodzi: historia modeli, konstrukcja, oryginalne i typowe fabryczne silniki, lata produkcji, profile kolekcjonerskie oraz wyszukiwanie aktualnych ofert na rynkach polskich, skandynawskich, europejskich i północnoamerykańskich.':'A digital catalogue of classic and antique boats, including model histories, construction, original and typical factory engines, production years, collector profiles and current listings from Poland, Scandinavia, Europe and North America.',
  'Otwórz katalog':'Open catalogue','Szukaj aktualnych ofert':'Search current listings','Logo i skrót na pulpit':'Logo and home-screen shortcut',
  'Tradycja szkutnicza od historycznych łodzi klinkierowych po klasyczne runabouty':'Boatbuilding tradition, from historic clinker boats to classic runabouts',
  'Modele według krajów':'Models by country','Wybierz model lub typ. Zdjęcia i historia są dostępne po wejściu w pozycję.':'Select a model or type. Photos and history are available in its profile.',
  'Wybierz kraj, a następnie konkretny model lub typ. Każda pozycja zawiera zdjęcia referencyjne, rozbudowaną historię, cechy rozpoznawcze, oryginalne lub typowe fabryczne silniki oraz ocenę kolekcjonerską PSKL:':'Select a country, then a specific model or type. Each entry includes reference photos, detailed history, distinguishing features, original or typical factory engines and a PSKL collector rating:',
  'popularność ⭐ 1–5':'popularity ⭐ 1–5','trudność zdobycia ⭐ 1–5':'acquisition difficulty ⭐ 1–5','Przy modelach produkowanych przez wiele lat podano warianty silników zależne od rocznika i wersji.':'For models produced over many years, engine variants are shown by year and version.',
  'Zdjęcia i historia →':'Photos and history →','← Wstecz do listy modeli':'← Back to model list','Zdjęcie chwilowo niedostępne':'Photo temporarily unavailable',
  'Zdjęcie tego modelu nie zostało jeszcze zweryfikowane':'A photo of this exact model has not yet been verified','Brak zweryfikowanego zdjęcia dokładnie tego modelu. Nie pokazujemy zdjęcia innego modelu jako zamiennika.':'No verified photo of this exact model. A different model is not shown as a substitute.',
  'Produkcja':'Production','Konstrukcja':'Construction','Długość':'Length','Historia i cechy':'History and features','Źródło historyczne ↗':'Historical source ↗',
  'Typ / zastosowanie':'Type / use','Oryginalny silnik / napęd':'Original engine / propulsion','PSKL · PROFIL KOLEKCJONERSKI':'PSKL · COLLECTOR PROFILE','Znaczenie i dostępność':'Significance and availability',
  'Popularność':'Popularity','Trudność zdobycia':'Acquisition difficulty','rozpoznawalność i obecność na rynku':'recognition and market presence','5 oznacza bardzo rzadką dostępność':'5 means very rare availability',
  'Cechy rozpoznawcze':'Distinguishing features','Wskazówka kolekcjonerska':'Collector guidance','Ocena kolekcjonerska PSKL ma charakter orientacyjny i porównawczy. Nie jest wyceną rynkową ani statystyką liczby istniejących egzemplarzy.':'The PSKL collector rating is indicative and comparative. It is not a market valuation or a count of surviving boats.',
  'Obserwowane i analizowane oferty':'Watched and analysed listings','OBSERWOWANE OFERTY':'WATCHED LISTINGS','wybrane w zakładce „Szukaj”':'selected in Search','Pozostałe oferty w indeksie PSKL':'Other listings in the PSKL index','bieżące i wcześniej zweryfikowane pozycje':'current and previously verified entries',
  'Oferty zaznaczone w wyszukiwaniu są zapisywane tutaj do dalszego śledzenia, porównywania i analizy. Każda zachowuje nazwę portalu, z którego została znaleziona, oraz bezpośredni link do oryginalnego ogłoszenia.':'Listings selected in Search are saved here for tracking, comparison and analysis. Each item retains the marketplace name and a direct link to the original listing.',
  'Brak obserwowanych ofert. W zakładce „Szukaj” zaznacz ✓ przy interesującej pozycji.':'No watched listings. Select ✓ next to a listing in Search.',
  'Wyszukaj oferty według kryteriów':'Search listings by criteria','Fraza / marka / model':'Phrase / make / model','Materiał':'Material','Kraj':'Country','Każdy':'Any','Drewno':'Wood','Laminat':'Fibreglass','Wszystkie kraje':'All countries','SZUKAJ':'SEARCH',
  'Ustaw frazę, materiał i kraj, a następnie naciśnij':'Set a phrase, material and country, then press','Pasujące zapisane oferty pojawią się poniżej. Indeks PSKL obejmuje część rynku; data odczytu i dostępność źródeł są podane przy wynikach. Aktualne wyniki można też otworzyć bezpośrednio w portalach. Każdy wynik pokazuje':'Matching saved listings will appear below. The PSKL index covers part of the market; the retrieval date and source availability are shown with the results. Current results can also be opened directly on each marketplace. Every result shows the','źródło':'source','i zawiera':'and includes a','bezpośredni link do konkretnego ogłoszenia':'direct link to the specific listing','Zaznacz':'Select','✓ Obserwuj ofertę':'✓ Watch listing','aby zapisać ją w zakładce „Oferty” do dalszego śledzenia i analizy.':'to save it under Listings for tracking and analysis.',
  'Ustaw kryteria i naciśnij „SZUKAJ”.':'Set the criteria and press SEARCH.','Oferty bezpośrednio w portalach':'Listings directly on marketplaces','Sprawdź też:':'Also check:','Brak wyników? Szukaj mahoniowych:':'No results? Search for mahogany boats:',
  'Źródło':'Source','Obserwuj ofertę':'Watch listing','Dodaj do zakładki Oferty':'Add to the Listings tab','Obserwowana':'Watched','Zapisana do dalszej analizy':'Saved for further analysis','Otwórz ofertę ↗':'Open listing ↗',
  '04 · KSIĘGA ZAŁOŻYCIELSKA':'04 · FOUNDING BOOK','Księga Założycielska — Wydanie I':'Founding Book, First Edition','Otwórz Księgę':'Open the Book','Otwórz PDF':'Open PDF','Pobierz PDF':'Download PDF',
  'Księga Założycielska opisuje misję, wartości, cele, strukturę i kierunek rozwoju Stowarzyszenia. Jest widoczna publicznie, aby każdy mógł poznać fundamenty oraz założenia organizacji.':'The Founding Book presents the Association’s mission, values, objectives, structure and direction. It is public so everyone can understand the organisation’s foundations and principles.',
  'Chronimy dziedzictwo. Budujemy tradycję. Inspirujemy przyszłość.':'We protect heritage. We build tradition. We inspire the future.',
  'Udostępnij':'Share','Zainstaluj':'Install','Kopiuj link':'Copy link','Link skopiowany.':'Link copied.','Instalacja została anulowana.':'Installation cancelled.','PSKL zostało zainstalowane.':'PSKL has been installed.',
  'Polska':'Poland','Norwegia':'Norway','Szwecja':'Sweden','Dania':'Denmark','Niemcy':'Germany','Finlandia':'Finland','Kanada':'Canada','Szwajcaria':'Switzerland','Wielka Brytania':'United Kingdom','Włochy':'Italy','Świat':'Worldwide','Europa':'Europe',
  'Rok niepodany':'Year not provided','Inny':'Other','Cena w ogłoszeniu':'Price in listing','Zdjęcie poglądowe':'Reference image','Zdjęcie poglądowe klasycznego Chris-Craft':'Reference image of a classic Chris-Craft','Zdjęcie z wyniku portalu':'Image from marketplace result','Brak zdjęcia w indeksie':'No image in the index','Do potwierdzenia':'To be confirmed','Widoczna w wynikach OLX':'Visible in OLX results','Brak w najnowszym indeksie — zachowano ostatni zapis oferty, źródło i link.':'Not present in the latest index. The last saved listing, source and link have been retained.'
  ,'1946–1968 (drewniane)':'1946–1968 (wooden)','1955–1968 (drewniane)':'1955–1968 (wooden)','lata 20.–40.':'1920s–1940s','lata 20.–40.; późniejsze repliki':'1920s–1940s; later replicas','lata 50.–60.':'1950s–1960s','lata 30.–60.':'1930s–1960s','lata 40.–60.':'1940s–1960s','ok. 1910–1950':'ca. 1910–1950','lata 60.':'1960s','korzenie od epoki wikingów; motorsnekke od pocz. XX w.; szczególnie popularne od lat 50.':'roots in the Viking Age; motor snekke from the early 20th century; especially popular since the 1950s','XIX w. – dziś; zorganizowane regaty od 1897':'19th century to the present; organised racing since 1897'
};
const map={...data,...ui};
function translateValue(value){return typeof value==='string'?(map[value.trim()]||value):value;}
function translateData(value,seen=new Set()){
  if(!value||typeof value!=='object'||seen.has(value))return;
  seen.add(value);
  if(Array.isArray(value)){value.forEach(v=>translateData(v,seen));return;}
  for(const key of Object.keys(value)){
    if(typeof value[key]==='string'&&map[value[key].trim()])value[key]=map[value[key].trim()];
    else translateData(value[key],seen);
  }
}
translateData(window.PSKL_DATA);translateData(window.PSKL_CATALOG);
window.addEventListener('pskl-market-loaded',()=>{try{if(typeof window.allOffers==='function')translateData(window.allOffers());translateData(window.PSKL_MARKET_STATUS);}catch(e){}});

const searchIntro=document.querySelector('#search .section-intro');
if(searchIntro)searchIntro.innerHTML='Set a phrase, material and country, then press <strong>SEARCH</strong>. Matching saved listings will appear below. The PSKL index covers part of the market. The retrieval date and source availability are shown with the results. Current results can also be opened directly on the marketplaces. Each result shows its <strong>source</strong>, for example OLX, Blocket, FINN.no or Boat24, and contains a <strong>direct link to the specific listing</strong>. Select <strong>✓ Watch listing</strong> to save it in Listings for further tracking and analysis.';
const catalogIntro=document.querySelector('#catalogIntro');
if(catalogIntro)catalogIntro.innerHTML='Select a country, then a specific model or type. Each entry includes reference photos, detailed history, distinguishing features, original or typical factory engines and a PSKL collector rating: <strong>popularity ⭐ 1-5</strong> and <strong>acquisition difficulty ⭐ 1-5</strong>. For models produced over many years, engine variants are shown by year and version.';

const replacements=[
  [/^(\d+) modele?$/,(_,n)=>`${n} models`],[/^(\d+) modeli$/,(_,n)=>`${n} models`],[/^1 model$/,'1 model'],
  [/^(\d+) oferty$/,(_,n)=>`${n} listings`],[/^(\d+) ofert$/,(_,n)=>`${n} listings`],[/^1 oferta$/,'1 listing'],
  [/^(\d+) obserwowane · (\d+) pozostałe$/,(_,a,b)=>`${a} watched · ${b} others`],
  [/^Otwórz ogłoszenie w (.+) ↗$/,(_,s)=>`Open listing on ${s} ↗`],[/^Otwórz (.+) ↗$/,(_,s)=>`Open ${s} ↗`],
  [/^Rynek: /,'Market: '],[/^Zapytanie \((.+)\): /,(_,x)=>`Query (${x}): `],[/^Wybrany kraj: /,'Selected country: '],
  [/^sprawdzono /,'checked '],[/^materiał: drewno$/,'material: wood'],[/^materiał: laminat$/,'material: fibreglass'],
  [/\. Zdjęcie przedstawia wskazany model lub typ, ale nie konkretny opisywany egzemplarz\.$/,'. The photo shows the specified model or type, but not the particular example described.'],
  [/\. Nie pokazujemy zdjęcia innego modelu jako zamiennika\.$/,'. A photo of a different model is not shown as a substitute.'],
  [/^Do potwierdzenia · (.+), Polska$/,(_,place)=>`To be confirmed · ${place}, Poland`],[/, Polska$/,', Poland']
];
function textEN(raw){
  const lead=raw.match(/^\s*/)[0],trail=raw.match(/\s*$/)[0],core=raw.trim();if(!core)return raw;
  let out=map[core]||core;
  if(out===core)for(const [pattern,replacement] of replacements)if(pattern.test(out)){out=out.replace(pattern,replacement);break;}
  return lead+out+trail;
}
function translateNode(root){
  if(root.nodeType===3){root.nodeValue=textEN(root.nodeValue);return;}
  if(root.nodeType!==1)return;
  if(root.matches('[data-lang],script,style'))return;
  if(root.hasAttribute('placeholder'))root.setAttribute('placeholder','e.g. wood Poland, Storebro, Riva Aquarama, Snekke');
  if(root.hasAttribute('aria-label'))root.setAttribute('aria-label',textEN(root.getAttribute('aria-label')));
  [...root.childNodes].forEach(translateNode);
}
translateNode(document.body);
new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(translateNode))).observe(document.body,{childList:true,subtree:true});
})();
