#!/usr/bin/env python3
import json, re, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urljoin, urlsplit, urlunsplit, parse_qsl, urlencode

import requests
from bs4 import BeautifulSoup

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'data' / 'market-live.json'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36 PSKL-Market-Index/1.3'
SESSION = requests.Session()
SESSION.headers.update({'User-Agent': UA, 'Accept-Language': 'pl,en;q=0.8,no;q=0.7,sv;q=0.6'})

# Separate, local-language queries avoid requiring several unrelated brands at once.
QUERIES = {
    'olx': ['drewniana', 'drewniane', 'snekke'],
    'allegro': ['drewniana', 'snekke'],
    'finn': ['trebåt', 'snekke'],
    'blocket': ['träbåt', 'mahogny'],
    'boat24': ['wood', 'Riva', 'Boesch', 'Storebro'],
    'yachtworld': ['wood', 'Chris Craft'],
    'aba': ['Lyman', 'Chris Craft', 'Gar Wood'],
    'cbc': ['wooden', 'Chris Craft'],
}
MAX_PAGES = 3


PORTALS = [
    dict(id='olx', name='OLX', country='Polska', base='https://www.olx.pl',
         url=lambda q: f"https://www.olx.pl/sport-hobby/sporty-wodne/lodzie-i-jachty/q-{slug(q)}/",
         match=lambda u: '/d/oferta/' in u),
    dict(id='allegro', name='Allegro', country='Polska', base='https://allegro.pl',
         url=lambda q: 'https://allegro.pl/kategoria/lodzie-motorowki-4084?oferta-dotyczy=sprzeda%C5%BC&string=' + quote(q),
         match=lambda u: '/oferta/' in u),
    dict(id='finn', name='FINN', country='Norwegia', base='https://www.finn.no',
         url=lambda q: 'https://www.finn.no/mobility/search/boat?query=' + quote(q),
         match=lambda u: '/mobility/item/' in u),
    dict(id='blocket', name='Blocket', country='Szwecja', base='https://www.blocket.se',
         url=lambda q: 'https://www.blocket.se/mobility/search/boat?q=' + quote(q),
         match=lambda u: '/mobility/item/' in u),
    dict(id='boat24', name='Boat24', country='Europa', base='https://www.boat24.com',
         url=lambda q: 'https://www.boat24.com/en/powerboats/?q=' + quote(q),
         match=lambda u: '/en/powerboats/' in u and '/detail/' in u),
    dict(id='yachtworld', name='YachtWorld', country='Świat', base='https://www.yachtworld.com',
         url=lambda q: 'https://www.yachtworld.com/boats-for-sale/keyword-' + slug(q) + '/',
         match=lambda u: '/yacht/' in u),
    dict(id='aba', name='Antique Boat America', country='USA / Kanada', base='https://www.antiqueboatamerica.com',
         url=lambda q: 'https://www.antiqueboatamerica.com/BoatSearch.aspx?search=' + quote(q),
         match=lambda u: '/Boat/' in u),
    dict(id='cbc', name='Classic Boat Collective', country='USA / Kanada', base='https://classicboatcollective.com',
         url=lambda q: 'https://classicboatcollective.com/?s=' + quote(q),
         match=lambda u: '/listing/' in u),
]

def material_from(text):
    low = (text or '').lower()
    # A wooden interior or deck alone is not evidence of a wooden hull.
    if re.search(r'laminat|fiberglas|fibreglas|glasfiber|glassfiber|\bgrp\b|plast(?:ik|ics?)?\b', low):
        return 'unknown'
    low = re.sub(r'(?:wood(?:en)?|mahogany|teak|drewnian\w*|mahoniow\w*)\s+(?:interior|deck|trim|cockpit|pokład|wnętrz)\w*', '', low)
    low = re.sub(r'(?:interior|deck|trim|pokład\w*|wnętrz\w*)\s+(?:wood(?:en)?|mahogany|teak|drewnian\w*|mahoniow\w*)', '', low)
    if re.search(r'\bwood(?:en)?\b|\bmahogany\b|drewnian|mahoniow|träbåt|trebåt|trebat|mahogny', low):
        return 'wood'
    return 'unknown'


ENGINE_WORDS = ('Volvo Penta','Volvo','MerCruiser','Chris-Craft','Crusader','Marstal','Ford','Hercules','Chrysler','Gray Marine','Gray','Parsons','GM','Yanmar','Perkins','Beta Marine')
EQUIPMENT_WORDS = {
    'trailer': ('trailer','przyczep'),
    'cover': ('cover','pokrow'),
    'documentation': ('documentation','documents','history','dokument','historia'),
    'restored': ('restored','restoration','renovated','renovation','refit','odrestaurow','renowac'),
    'original': ('original','oryginal','matching numbers','matching-number'),
    'project': ('project boat','projekt','do renowacji','needs restoration','needs repair','wymaga napraw'),
}


def norm(s):
    return re.sub(r'\s+', ' ', (s or '')).strip()


def slug(s):
    import unicodedata
    s = s.lower().replace('ł','l').replace('ø','o').replace('æ','ae')
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def year_from(text):
    m = re.search(r'\b(19[0-9]{2}|20[0-2][0-9])\b', text)
    return int(m.group(1)) if m else None


def price_from(text):
    patterns = [
        r'(?<!\d)(\d[\d\s.,]{2,})\s?(PLN|zł|NOK|SEK|EUR|€|USD|\$|GBP|£|CAD)',
        r'(PLN|NOK|SEK|EUR|USD|GBP|CAD)\s?(\d[\d\s.,]{2,})',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m:
            a,b = m.groups()
            if re.search(r'\d', a):
                return norm(f'{a} {b}')
            return norm(f'{b} {a}')
    return 'Cena w ogłoszeniu'


def engine_from(text):
    low = text.lower()
    for brand in ENGINE_WORDS:
        idx = low.find(brand.lower())
        if idx >= 0:
            frag = norm(text[idx:idx+100])
            return frag[:100]
    return ''


def equipment_from(text):
    low = text.lower()
    found=[]
    for label, words in EQUIPMENT_WORDS.items():
        if any(w in low for w in words):
            found.append(label)
    return found


def image_from(anchor):
    parent = anchor
    for _ in range(4):
        if not parent:
            break
        img = parent.find('img') if hasattr(parent, 'find') else None
        if img:
            for key in ('src','data-src','data-lazy-src'):
                v = img.get(key)
                if v and not v.startswith('data:'):
                    return v
        parent = getattr(parent, 'parent', None)
    return None


def offer_signal(anchor):
    bits = [anchor.get_text(' ', strip=True), anchor.get('title'), anchor.get('aria-label')]
    img = anchor.find('img')
    if img:
        bits.extend([img.get('alt'), img.get('title')])
    return norm(' '.join(x for x in bits if x))


def collect(portal, label, query, page=1):
    url = portal['url'](query)
    if page > 1:
        parts = urlsplit(url)
        url = urlunsplit(parts._replace(query=urlencode(parse_qsl(parts.query) + [('page', page)])))
    r = SESSION.get(url, timeout=25, allow_redirects=True)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    items=[]
    seen=set()

    for a in soup.find_all('a', href=True):
        href = urljoin(portal['base'], a.get('href')).split('#')[0]
        if not portal['match'](href) or href in seen:
            continue

        signal = offer_signal(a)
        if len(signal) < 8:
            continue
        signal_low = signal.lower()
        wood_evidence = material_from(signal) == 'wood'
        signal_year = year_from(signal_low)

        if label == 'wood' and not wood_evidence:
            continue

        parent = a.parent
        txt = signal
        for _ in range(2):
            if parent is None:
                break
            candidate = norm(parent.get_text(' ', strip=True))
            if len(candidate) > len(txt) and len(candidate) <= 700:
                txt = candidate
            parent = parent.parent

        seen.add(href)
        image = image_from(a)
        items.append({
            'source': portal['name'],
            'country': portal['country'],
            'title': signal[:180],
            'year': signal_year or year_from(txt.lower()),
            'material': 'wood' if label == 'wood' else 'unknown',
            'materialConfidence': 'opis drewna w tytule oferty',
            'price': price_from(txt),
            'engine': engine_from(txt),
            'equipment': equipment_from(txt),
            'description': txt[:700],
            'status': 'Automatyczny odczyt — otworzyć i potwierdzić',
            'indexedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'link': href,
            'image': image,
            'imageNote': 'Zdjęcie z wyniku portalu' if image else 'Brak zdjęcia w indeksie',
            'query': query,
            'live': True,
        })

    return items, url


def main():
    all_items=[]
    errors=[]
    searches=[]
    for p in PORTALS:
        for q in QUERIES[p['id']]:
            known=set()
            for page in range(1, MAX_PAGES + 1):
                try:
                    items,url = collect(p,'wood',q,page)
                    searches.append({'portal':p['name'],'query':q,'page':page,'url':url,'found':len(items)})
                    fresh=[x for x in items if x['link'] not in known]
                    all_items.extend(fresh)
                    known.update(x['link'] for x in fresh)
                    if not fresh or p['id'] not in ('olx','finn','blocket'):
                        break
                except Exception as e:
                    errors.append({'portal':p['name'],'query':q,'page':page,'error':str(e)[:240]})
                    break
                time.sleep(0.4)
            # Respect a portal's access denial; do not keep trying other queries.
            if errors and errors[-1]['portal'] == p['name'] and any(code in errors[-1]['error'] for code in ('401 ', '403 ', '429 ')):
                break

    dedup={}
    failed={e['portal'] for e in errors}
    if OUT.exists():
        previous=json.loads(OUT.read_text(encoding='utf-8'))
        for x in previous.get('offers',[]):
            if x.get('source') in failed:
                x={**x,'stale':True,'status':'Ostatni zapis — aktualizacja źródła niedostępna'}
                dedup[x['link'].rstrip('/').lower()]=x
    for x in all_items:
        dedup[x['link'].rstrip('/').lower()] = x

    payload={
        'updatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'),
        'offers': list(dedup.values()),
        'searches': searches,
        'errors': errors,
        'notice': 'Częściowy indeks ofert, do 3 stron na zapytanie. Data oznacza próbę odświeżenia; źródła mogą być niedostępne. Materiał i dostępność wymagają potwierdzenia w ogłoszeniu.'
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Wrote {len(payload['offers'])} offers; {len(errors)} search errors -> {OUT}")


if __name__ == '__main__':
    main()
