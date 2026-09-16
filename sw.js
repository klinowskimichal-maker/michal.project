const CACHE='pskl-shell-v6';
const SHELL=[
  './',
  './index.html',
  './udostepnij.html',
  './manifest.webmanifest',
  './assets/js/i18n-data.js',
  './assets/js/i18n.js',
  './assets/css/i18n.css',
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
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    if(new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
