const CACHE_NAME = 'iesv-house-points-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pages/console.html',
  '/pages/teacher-mobile.html',
  '/pages/teacher-form.html',
  '/pages/leaderboard.html',
  '/pages/quiz.html',
  '/pages/sorting-ceremony.html',
  '/pages/house-finder.html',
  '/pages/house-display.html',
  '/assets/icons/console-favicon.ico',
  '/assets/icons/teacher-favicon.ico',
  '/assets/images/backgrounds/stone.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
