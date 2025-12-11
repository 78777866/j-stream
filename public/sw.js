const CACHE_NAME = 'neon-v3';
const STATIC_CACHE = 'neon-static-v3';
const DYNAMIC_CACHE = 'neon-dynamic-v3';

// Assets to cache immediately
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/hero.jpg',
  '/images/grey-thumbnail.jpg',
  '/images/no-image.png',
  '/favicon.ico'
];

// ... (existing code)

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/images/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NEON', options)
  );
}); 