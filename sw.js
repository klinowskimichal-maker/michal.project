const CACHE='pskl-shell-v30';
const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/js/i18n-data.js',
  './assets/js/i18n.js',
  './assets/js/security.js',
  './assets/css/i18n.css',
  './assets/css/association.css',
  './assets/branding/pskl-tabliczka-icon-192.png',
  './assets/branding/pskl-tabliczka-icon-512.png',
  './assets/branding/pskl-tabliczka-maskable-192.png',
  './assets/branding/pskl-tabliczka-maskable-512.png',
  './assets/branding/pskl-tabliczka.webp'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin&&(url.pathname.endsWith('/udostepnij.html')||url.pathname.endsWith('/logo-link.html')||url.pathname.endsWith('/book.html')||url.pathname.includes('/assets/book/')||url.pathname.includes('/assets/book-en/'))){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    if(new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
