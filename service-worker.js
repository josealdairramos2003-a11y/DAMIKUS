const CACHE_NAME = 'damikus-cache-v10';
const ASSETS_TO_CACHE = [
  'index.html',
  '404.html',
  'css/styles.css',
  'js/app.js',
  'manifest.json',
  'data/profile.json',
  'data/socials.json',
  'data/projects.json',
  'data/timeline.json',
  'data/music.json',
  'data/certificates.json',
  'data/skills.json',
  'data/chatbot.json',
  'data/gallery.json'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching files...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached asset, but fetch updated version in background (stale-while-revalidate)
          fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignore network failures in bg */});
          return cachedResponse;
        }

        // Fetch from network if not cached
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Cache new fetched assets dynamically
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(() => {
            // Fallback for offline if requesting HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('404.html');
            }
          });
      })
  );
});
