// Simple offline-first service worker for My Tiles Calculator.
// Bump this version string whenever the app files change, so users
// automatically get the update next time they open the app online.
const CACHE_NAME = 'tiles-calculator-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/favicon-glass.png',
  './assets/favicon-glass-32.png',
  './assets/fonts/inter-400.woff2',
  './assets/fonts/inter-500.woff2',
  './assets/fonts/inter-600.woff2',
  './assets/fonts/inter-700.woff2',
  './assets/fonts/nsb-400.woff2',
  './assets/fonts/nsb-500.woff2',
  './assets/fonts/nsb-600.woff2',
  './assets/fonts/nsb-700.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Cache-first: instant offline loads. Falls back to network if a file
// isn't cached yet, and updates the cache with whatever it fetches.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
