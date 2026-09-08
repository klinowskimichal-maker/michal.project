from pathlib import Path
import base64,gzip,re

ROOT=Path(__file__).resolve().parents[1]
parts=[]
for i in range(1,6):
    p=ROOT/'assets'/'js'/f'bookv12-{i}.js'
    text=p.read_text(encoding='utf-8')
    m=re.search(r"\+'([A-Za-z0-9+/=]+)'",text)
    if not m:
        raise SystemExit(f'Cannot parse {p}')
    parts.append(m.group(1))
raw=base64.b64decode(''.join(parts))
html=gzip.decompress(raw).decode('utf-8')
# Static output: no browser decompression, no Canva redirect, no PDF plugin.
# Add a small fixed PSKL navigation bar without changing the visual book pages.
toolbar='''<div id="pskl-book-toolbar"><a href="index.html#book">← PSKŁ</a><strong>Księga Założycielska · Wydanie I</strong><span>34 strony</span><button id="pskl-book-top" type="button">↑ Początek</button></div><style>#pskl-book-toolbar{position:fixed;z-index:999999;left:12px;right:12px;top:10px;min-height:42px;display:flex;align-items:center;gap:12px;padding:8px 12px;border:1px solid #b98b60;border-radius:10px;background:rgba(4,23,35,.94);color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.24);font:12px Arial;backdrop-filter:blur(10px)}#pskl-book-toolbar a{color:#e8bd87;text-decoration:none;font-weight:700}#pskl-book-toolbar strong{font-family:Georgia,serif;color:#f2d2a8;flex:1}#pskl-book-toolbar span{color:#b8c6ce}#pskl-book-toolbar button{border:1px solid #b98b60;background:#0b3147;color:#f2d2a8;border-radius:7px;padding:7px 9px;cursor:pointer}@media(max-width:620px){#pskl-book-toolbar{left:6px;right:6px;top:6px;gap:7px;padding:7px 8px}#pskl-book-toolbar strong{font-size:10px}#pskl-book-toolbar span{display:none}}</style><script>document.addEventListener('DOMContentLoaded',()=>{document.getElementById('pskl-book-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));});</script>'''
if '</body>' in html.lower():
    pos=html.lower().rfind('</body>')
    html=html[:pos]+toolbar+html[pos:]
else:
    html+=toolbar
(ROOT/'book.html').write_text(html,encoding='utf-8')
print('book.html generated:',len(html),'bytes')
