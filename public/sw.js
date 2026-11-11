/**
 * sw.js – Service Worker für "Mine Rescue" (Offline-Fähigkeit)
 *
 * Strategie:
 *  - Beim Installieren die Startseite, das Manifest und die Icons vorab laden.
 *  - Seitenaufrufe (Navigation): erst Netzwerk, bei Fehler aus dem Cache (neue Versionen kommen so an).
 *  - Alle anderen Dateien derselben Herkunft (Vite-Bundles mit Hash im Namen): Cache zuerst,
 *    im Hintergrund aktualisieren (stale-while-revalidate).
 * Bei größeren Änderungen CACHE_VERSION erhöhen, dann werden alte Caches gelöscht.
 */
const CACHE_VERSION = 'mine-rescue-v1';
const PRECACHE = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
