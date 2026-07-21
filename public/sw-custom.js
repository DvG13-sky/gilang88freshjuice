// Service Worker - Gilang Fresh Juice
// PURE JAVASCRIPT - JANGAN TAMBAHKAN TYPESCRIPT SYNTAX

const CACHE_NAME = 'gilang-jus-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  self.clients.claim();
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event.data?.text());

  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    data = { title: 'Gilang Fresh Juice', body: event.data ? event.data.text() : 'Notifikasi baru' };
  }

  var title = data.title || 'Gilang Fresh Juice';
  var options = {
    body: data.body || 'Anda memiliki notifikasi baru',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    vibrate: data.tag === 'stock_out' ? [200, 100, 200] : [100],
    timestamp: Date.now(),
  };

  console.log('[SW] Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  var url = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncPending('pending_sales'));
  }
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncPending('pending_expenses'));
  }
});

function syncPending(storeName) {
  // Placeholder: implement IndexedDB sync if needed
  console.log('[SW] Sync pending for:', storeName);
  return Promise.resolve();
}

// Skip Waiting Message
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
