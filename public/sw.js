const CACHE_NAME = 'neon-v3';
const STATIC_CACHE = 'neon-static-v3';
const DYNAMIC_CACHE = 'neon-dynamic-v3';

// Assets to cache immediately
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/logo.png?v=3',
  '/images/hero.jpg',
  '/images/grey-thumbnail.jpg',
  '/images/no-image.png',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests (TMDB, etc.) - always try network first
  if (url.pathname.startsWith('/api/') ||
    url.hostname.includes('api.themoviedb.org') ||
    url.hostname.includes('vidsrc.to')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets - cache first strategy
  if (request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Handle navigation requests - network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached version or offline page
          return caches.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              // Return offline page for navigation requests
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Default strategy - try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks
  return Promise.resolve();
}

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/images/logo.png?v=3',
    badge: '/images/logo.png?v=3',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/images/logo.png?v=3'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/logo.png?v=3'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NEON', options)
  );
}); 