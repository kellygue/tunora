// service-worker.js
const CACHE_NAME = 'tunora-v1';
const ASSETS_TO_CACHE = [
  `assets/css/index.css`,
  `assets/js/index.js`,
  `assets/js/playerControls.js`,
  `assets/js/router.js`
];

// Install event - Cache the essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch event - Serve cached assets or return index.html for non-static requests
self.addEventListener('fetch', (event) => {

  if (event.request.url.includes('discogs.com')) {
    return; // Let this request go through to the network without service worker interference
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return from cache if it's already there
      }

      // If it's a navigation request (route change), serve the cached index.html
      if (event.request.mode === 'navigate') {
        return fetch('index.html'); // Always return index.html for navigation requests
      }

      // For other network requests (like images, styles, or scripts), fetch as usual
      return fetch(event.request).catch(() => {
        // If the network is unavailable, fallback to cache for assets
        return caches.match(event.request);
      });
    })
  );
});

// Activate event - Clean up old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete outdated caches
          }
        })
      );
    })
  );
});
