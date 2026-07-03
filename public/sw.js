/* Sawai janitor PWA service worker */
const CACHE = 'sawai-v1';
const PRECACHE = ['/offline.html', '/icons/icon-192.png', '/icons/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Network-first for navigations, with an offline fallback shell.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match('/offline.html')) || Response.error();
        }
      })(),
    );
  }
});

// Web Push -> system notification.
self.addEventListener('push', (event) => {
  let data = { title: 'แจ้งเตือน', body: '', url: '/', taskId: undefined, urgent: false };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.title = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'แจ้งเตือน', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      lang: 'th',
      data: { url: data.url || '/' },
      tag: data.taskId || undefined,
      requireInteraction: !!data.urgent,
      vibrate: data.urgent ? [200, 100, 200, 100, 200] : undefined,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        if ('focus' in client) {
          try {
            await client.navigate(target);
          } catch {
            /* cross-origin navigate can throw; ignore */
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })(),
  );
});
