const CACHE_NAME = 'navedge-driver-v1';
const urlsToCache = [
  '/mobile.html',
  '/src/components/MobileDriverInterface.tsx',
  '/src/components/MobileDriverApp.tsx',
  '/src/components/MobileDriverLogin.tsx',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline GPS data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-gps') {
    event.waitUntil(syncGPSData());
  }
});

async function syncGPSData() {
  // Get stored GPS data from IndexedDB
  const gpsData = await getStoredGPSData();
  
  if (gpsData.length > 0) {
    try {
      // Send to server when online
      await fetch('/api/sync-gps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gpsData)
      });
      
      // Clear stored data after successful sync
      await clearStoredGPSData();
    } catch (error) {
      console.log('Sync failed, will retry later');
    }
  }
}

async function getStoredGPSData() {
  // Implementation would use IndexedDB to get offline GPS data
  return [];
}

async function clearStoredGPSData() {
  // Implementation would clear IndexedDB after successful sync
}