/* Detektiv Emilie og Camille — service worker: hele spillet gemmes paa telefonen, saa det
   virker uden net (fx i flyet). CACHE-navnet skrives af byg.py ud fra filernes indhold,
   saa en ny udgave hentes automatisk, naar der ER net, og den gamle slettes. */
const CACHE = 'detektiv-68123c4aa2b0';
const FILER = [
  './', 'index.html', 'emilie.html', 'camille.html', 'emilie/', 'camille/',
  'manifest-detektiv.webmanifest', 'manifest-emilie.webmanifest', 'manifest-camille.webmanifest',
  'fonts/fonts.css', 'fonts/specialelite-400.woff2', 'fonts/nunito-400.woff2',
  'fonts/nunito-600.woff2', 'fonts/nunito-700.woff2', 'fonts/nunito-800.woff2',
  'ikoner/emilie-192.png', 'ikoner/emilie-512.png', 'ikoner/emilie-180.png',
  'ikoner/camille-192.png', 'ikoner/camille-512.png', 'ikoner/camille-180.png',
  'ikoner/detektiv-192.png', 'ikoner/detektiv-512.png', 'ikoner/detektiv-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILER)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Cache foerst, net som nødløsning. Spillet har ingen data udefra, saa den gemte udgave er
   altid komplet; nye udgaver kommer via et nyt CACHE-navn, ikke via net-foerst. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(svar => {
      if (svar && svar.ok && new URL(e.request.url).origin === self.location.origin) {
        const kopi = svar.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopi));
      }
      return svar;
    }).catch(() => caches.match('index.html')))
  );
});
