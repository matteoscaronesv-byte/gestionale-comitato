/* Service worker del Gestionale: rende l'app installabile e utilizzabile senza connessione.
   La pagina viene sempre cercata prima in rete (così gli aggiornamenti arrivano subito) e, se non c'è rete,
   presa dalla copia salvata. Le richieste all'archivio (Google) e le mappe non passano dalla cache. */
const CACHE = "gestionale-comitato-202611251905";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
});
/* tocco sull'avviso del telefono o del PC: apre (o porta in primo piano) il Gestionale sulla pratica */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.id;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.indexOf(self.registration.scope) === 0);
    if (c) { c.focus(); if (id) c.postMessage({ apri: id }); return; }
    return self.clients.openWindow("./");
  }));
});
