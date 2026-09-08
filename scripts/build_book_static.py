from pathlib import Path
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
import struct
import time

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILES = sorted((ROOT / 'scripts').glob('book-source-20260908-*.txt'))
OUT_DIR = ROOT / 'assets' / 'book'
OUT_DIR.mkdir(parents=True, exist_ok=True)

urls = []
for source in SOURCE_FILES:
    for line in source.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            urls.append(line)

if len(urls) != 34:
    raise SystemExit(f'Expected 34 Founder Charter page sources, got {len(urls)}')


def png_dimensions(data: bytes):
    if not data.startswith(b'\x89PNG\r\n\x1a\n') or len(data) < 24:
        return None
    return struct.unpack('>II', data[16:24])


def download(url: str, target: Path, page_no: int):
    parsed = urlparse(url)
    fallback = parse_qs(parsed.query).get('fallback', [None])[0]
    candidates = [u for u in (fallback, url) if u]
    last_error = None
    for candidate in candidates:
        for attempt in range(1, 4):
            try:
                req = Request(candidate, headers={
                    'User-Agent': 'Mozilla/5.0 PSKL-Founder-Charter/1.0',
                    'Accept': 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
                })
                with urlopen(req, timeout=45) as response:
                    data = response.read()
                dims = png_dimensions(data)
                if not dims:
                    raise ValueError(f'page {page_no}: downloaded file is not PNG')
                if len(data) < 5000:
                    raise ValueError(f'page {page_no}: PNG unexpectedly small ({len(data)} bytes)')
                target.write_bytes(data)
                print(f'page {page_no:02d}: {dims[0]}x{dims[1]}, {len(data)} bytes')
                if dims[0] < 700:
                    print(f'WARNING page {page_no:02d}: source resolution is {dims[0]} px wide')
                return dims
            except Exception as exc:
                last_error = exc
                print(f'page {page_no:02d}: attempt {attempt} failed: {exc}')
                time.sleep(attempt * 1.5)
    raise RuntimeError(f'page {page_no}: cannot download: {last_error}')


dimensions = []
for index, url in enumerate(urls, start=1):
    dimensions.append(download(url, OUT_DIR / f'page-{index:02d}.png', index))

if len(list(OUT_DIR.glob('page-*.png'))) != 34:
    raise SystemExit('Static Founder Charter build is incomplete')

figures = []
for i in range(1, 35):
    loading = 'eager' if i <= 2 else 'lazy'
    fetchpriority = 'high' if i == 1 else 'auto'
    figures.append(
        f'''<figure class="sheet" id="page-{i}" data-page="{i}">
          <img src="assets/book/page-{i:02d}.png" alt="Księga Założycielska - strona {i} z 34" loading="{loading}" fetchpriority="{fetchpriority}" decoding="async">
          <figcaption>STRONA {i} / 34</figcaption>
        </figure>'''
    )

pages_html = '\n'.join(figures)
html = f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#061b2b">
<title>Księga Założycielska - Wydanie I | PSKŁ</title>
<meta name="description" content="Księga Założycielska PSKŁ - Wydanie I, 34 strony. Własny czytnik Polskiego Stowarzyszenia Klasycznych i Zabytkowych Łodzi.">
<style>
:root{{--navy:#061b2b;--navy2:#0b3147;--copper:#b8793f;--brass:#d4a06e;--paper:#f5f1e8;--page-w:892px}}
*{{box-sizing:border-box}}
html{{scroll-behavior:smooth;background:var(--navy)}}
body{{margin:0;background:radial-gradient(circle at 50% -10%,#123f58 0,var(--navy) 43%,#03131f 100%);color:#fff;font-family:Arial,Helvetica,sans-serif}}
.toolbar{{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:9px;min-height:58px;padding:9px max(10px,env(safe-area-inset-left));border-bottom:1px solid rgba(212,160,110,.55);background:rgba(4,23,35,.94);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.24)}}
.back,.ctrl{{border:1px solid rgba(212,160,110,.7);background:#0b3147;color:#f3d3aa;border-radius:9px;padding:9px 11px;text-decoration:none;font-weight:700;cursor:pointer;white-space:nowrap}}
.back:hover,.ctrl:hover{{background:#124662}}
.title{{min-width:0;flex:1}}
.title strong{{display:block;color:#f3d3aa;font:700 15px/1.2 Georgia,serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.title small{{display:block;margin-top:3px;color:#9eb0ba;font-size:10px;letter-spacing:.09em}}
.pagebox{{display:flex;align-items:center;gap:5px;color:#d4a06e;font-weight:700;font-size:12px;white-space:nowrap}}
.pagebox input{{width:48px;border:1px solid rgba(212,160,110,.55);border-radius:7px;background:#041a28;color:#fff;padding:7px 5px;text-align:center;font-weight:700}}
.stage{{width:100%;overflow-x:auto;padding:24px 10px 80px;scrollbar-color:#b8793f #061b2b}}
.reader{{display:flex;flex-direction:column;align-items:center;gap:28px;min-width:100%}}
.sheet{{width:min(var(--page-w),calc(100vw - 24px));margin:0;position:relative;border-radius:4px;background:white;box-shadow:0 18px 48px rgba(0,0,0,.42),0 0 0 1px rgba(212,160,110,.48);overflow:hidden;transition:width .2s ease,box-shadow .2s ease}}
.sheet img{{display:block;width:100%;height:auto;background:white}}
.sheet figcaption{{position:absolute;right:10px;bottom:8px;padding:4px 7px;border-radius:5px;background:rgba(4,23,35,.82);color:#eac28e;font-size:9px;font-weight:700;letter-spacing:.08em;opacity:.1;transition:opacity .2s}}
.sheet:hover figcaption,.sheet.current figcaption{{opacity:.9}}
.sheet.current{{box-shadow:0 22px 65px rgba(0,0,0,.52),0 0 0 2px rgba(212,160,110,.75)}}
.intro{{max-width:892px;margin:22px auto 0;padding:0 14px;color:#c6d3d9;text-align:center;line-height:1.55;font-size:13px}}
.intro b{{color:#efc692}}
.fab{{position:fixed;right:14px;bottom:16px;z-index:40;border:1px solid #d4a06e;border-radius:999px;background:rgba(4,23,35,.94);color:#f3d3aa;width:46px;height:46px;font-size:20px;box-shadow:0 10px 30px rgba(0,0,0,.32);cursor:pointer}}
@media(max-width:680px){{
 .toolbar{{gap:6px;min-height:54px;padding:7px 6px}}
 .back{{font-size:0;padding:9px 10px}}.back::after{{content:'←';font-size:17px}}
 .ctrl{{padding:8px 9px}}
 .title strong{{font-size:12px}}.title small{{display:none}}
 .pagebox{{font-size:10px}}.pagebox input{{width:40px;padding:6px 3px}}
 .stage{{padding:14px 6px 70px}}
 .reader{{gap:17px}}
 .sheet{{width:calc(100vw - 14px);border-radius:2px}}
}}
@media print{{.toolbar,.intro,.fab,figcaption{{display:none!important}}.stage{{padding:0}}.reader{{gap:0}}.sheet{{width:100%;box-shadow:none;break-after:page;border:0}}}}
</style>
</head>
<body>
<nav class="toolbar" aria-label="Nawigacja Księgi">
  <a class="back" href="index.html#book">← PSKŁ</a>
  <div class="title"><strong>Księga Założycielska - Wydanie I</strong><small>PSKŁ · SZCZECIN · 2026 · 34 STRONY</small></div>
  <button class="ctrl" id="prev" type="button" aria-label="Poprzednia strona">‹</button>
  <div class="pagebox"><input id="pageInput" type="number" min="1" max="34" value="1" aria-label="Numer strony"><span>/ 34</span></div>
  <button class="ctrl" id="next" type="button" aria-label="Następna strona">›</button>
  <button class="ctrl" id="zoomOut" type="button" aria-label="Pomniejsz">−</button>
  <button class="ctrl" id="zoomIn" type="button" aria-label="Powiększ">+</button>
</nav>
<p class="intro"><b>Księga Założycielska</b> przedstawia misję, wartości, cele, strukturę i kierunek rozwoju Stowarzyszenia. Poniżej znajduje się pełne Wydanie I w 34 stronach, wyświetlane bezpośrednio przez PSKŁ.</p>
<main class="stage" id="stage"><div class="reader" id="reader">
{pages_html}
</div></main>
<button class="fab" id="top" type="button" aria-label="Początek Księgi">↑</button>
<script>
(()=>{{
 const sheets=[...document.querySelectorAll('.sheet')];
 const input=document.getElementById('pageInput');
 let current=1, pageWidth=892;
 const go=n=>{{n=Math.max(1,Math.min(34,Number(n)||1));document.getElementById('page-'+n)?.scrollIntoView({{behavior:'smooth',block:'start'}});}};
 document.getElementById('prev').onclick=()=>go(current-1);
 document.getElementById('next').onclick=()=>go(current+1);
 input.addEventListener('change',()=>go(input.value));
 input.addEventListener('keydown',e=>{{if(e.key==='Enter')go(input.value)}});
 document.getElementById('top').onclick=()=>go(1);
 document.getElementById('zoomIn').onclick=()=>{{pageWidth=Math.min(1400,pageWidth+120);document.documentElement.style.setProperty('--page-w',pageWidth+'px')}};
 document.getElementById('zoomOut').onclick=()=>{{pageWidth=Math.max(560,pageWidth-120);document.documentElement.style.setProperty('--page-w',pageWidth+'px')}};
 const observer=new IntersectionObserver(entries=>{{
   const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(!visible)return;
   sheets.forEach(s=>s.classList.remove('current'));
   visible.target.classList.add('current');
   current=Number(visible.target.dataset.page);input.value=current;
 }},{{threshold:[.25,.45,.65,.8]}});
 sheets.forEach(s=>observer.observe(s));
 document.addEventListener('keydown',e=>{{if(e.key==='ArrowRight'||e.key==='PageDown')go(current+1);if(e.key==='ArrowLeft'||e.key==='PageUp')go(current-1);if(e.key==='Home')go(1);if(e.key==='End')go(34)}});
}})();
</script>
</body>
</html>'''

(ROOT / 'book.html').write_text(html, encoding='utf-8')
print('book.html generated with 34 local PNG pages')
