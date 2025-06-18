const CACHE_NAME = 'navedge-fleet-v1';
const urlsToCache = [
  '/owner.html',
  '/src/components/MobileOwnerInterface.tsx',
  '/src/components/MobileOwnerApp.tsx',
  '/src/components/MobileOwnerLogin.tsx',
  '/owner-manifest.json',
  '/src/data/mockData.ts'
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

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-fleet') {
    event.waitUntil(syncFleetData());
  }
});

async function syncFleetData() {
  // Get stored fleet data from IndexedDB
  const fleetData = await getStoredFleetData();
  
  if (fleetData.length > 0) {
    try {
      // Send to server when online
      await fetch('/api/sync-fleet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fleetData)
      });
      
      // Clear stored data after successful sync
      await clearStoredFleetData();
    } catch (error) {
      console.log('Sync failed, will retry later');
    }
  }
}

async function getStoredFleetData() {
  // Implementation would use IndexedDB to get offline fleet data
  return [];
}

async function clearStoredFleetData() {
  // Implementation would clear IndexedDB after successful sync
}