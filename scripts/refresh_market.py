#!/usr/bin/env python3
import json, re, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'data' / 'market-live.json'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36 PSKL-Market-Index/1.0'
SESSION = requests.Session()
SESSION.headers.update({'User-Agent': UA, 'Accept-Language': 'pl,en;q=0.8,no;q=0.7,sv;q=0.6'})

QUERIES = [
    ('wood', 'drewniana łódź motorowa klasyczna'),
    ('wood', 'snekke trebåt'),
    ('wood', 'Riva Boesch Storebro classic wooden boat'),
    ('wood', 'Chris Craft Century Lyman wooden classic boat'),
]

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

WOOD_WORDS = ('wood','wooden','mahogany','timber','drewn','mahon','trä','trebåt','trebat','klink','clinker','plank')
CLASSIC_WORDS = ('riva','boesch','storebro','storö','storo','snekke','chris craft','chris-craft','century','lyman','gar wood','hacker','greavette','shepherd','fairey','pettersson')

def norm(s):
    return re.sub(r'\s+', ' ', (s or '')).strip()

def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode('ascii')
    s = s.replace('ł','l').replace('ø','o').replace('æ','ae')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def year_from(text):
    m = re.search(r'\b(19[0-9]{2}|20[0-2][0-9])\b', text)
    return int(m.group(1)) if m else None

def price_from(text):
    patterns = [
        r'(?<!\d)(\d[\d\s.,]{2,})\s?(PLN|zł|NOK|SEK|EUR|€|USD|\$)',
        r'(PLN|NOK|SEK|EUR|USD)\s?(\d[\d\s.,]{2,})',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m:
            a,b = m.groups()
            if re.search(r'\d', a): return norm(f'{a} {b}')
            return norm(f'{b} {a}')
    return 'Cena w ogłoszeniu'

def image_from(anchor):
    parent = anchor
    for _ in range(4):
        if not parent: break
        img = parent.find('img') if hasattr(parent, 'find') else None
        if img:
            for key in ('src','data-src','data-lazy-src'):
                v = img.get(key)
                if v and not v.startswith('data:'):
                    return v
        parent = getattr(parent, 'parent', None)
    return None

def collect(portal, label, query):
    url = portal['url'](query)
    r = SESSION.get(url, timeout=25, allow_redirects=True)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    items=[]; seen=set()
    for a in soup.find_all('a', href=True):
        href = urljoin(portal['base'], a.get('href'))
        href = href.split('#')[0]
        if not portal['match'](href) or href in seen:
            continue
        title = norm(a.get_text(' ', strip=True))
        parent = a.parent
        txt = title
        for _ in range(3):
            if parent is None: break
            candidate = norm(parent.get_text(' ', strip=True))
            if len(candidate) > len(txt): txt = candidate
            if len(txt) > 450: break
            parent = parent.parent
        title = title if len(title) >= 8 else txt[:150]
        if len(title) < 8: continue
        low = (title + ' ' + txt).lower()
        positive = any(w in low for w in WOOD_WORDS) or any(w in low for w in CLASSIC_WORDS)
        if label == 'wood' and not positive:
            continue
        seen.add(href)
        image = image_from(a)
        items.append({
            'source': portal['name'], 'country': portal['country'], 'title': title[:180],
            'year': year_from(low), 'material': 'wood' if label=='wood' else 'unknown',
            'materialConfidence': 'tekst/model' if any(w in low for w in WOOD_WORDS) else 'zapytanie/model',
            'price': price_from(txt), 'status': 'Automatyczny odczyt — otworzyć i potwierdzić',
            'verifiedAt': datetime.now(timezone.utc).date().isoformat(),
            'link': href, 'image': image,
            'imageNote': 'Zdjęcie z wyniku portalu' if image else 'Zdjęcie poglądowe',
            'query': query, 'live': True,
        })
        if len(items) >= 8: break
    return items, url

def main():
    all_items=[]; errors=[]; searches=[]
    for p in PORTALS:
        for label,q in QUERIES:
            try:
                items,url = collect(p,label,q)
                searches.append({'portal':p['name'],'query':q,'url':url,'found':len(items)})
                all_items.extend(items)
            except Exception as e:
                errors.append({'portal':p['name'],'query':q,'error':str(e)[:240]})
            time.sleep(0.7)
    dedup={}
    for x in all_items:
        key=x['link'].rstrip('/').lower()
        dedup[key]=x
    payload={
        'updatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'),
        'offers': list(dedup.values()),
        'searches': searches,
        'errors': errors,
        'notice': 'Automatyczny indeks pomocniczy. Każdą ofertę należy potwierdzić w portalu źródłowym.'
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Wrote {len(payload['offers'])} offers; {len(errors)} search errors -> {OUT}")

if __name__ == '__main__':
    main()
