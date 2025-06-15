import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Driver } from '../data/mockData';

interface FleetMapProps {
  drivers: Driver[];
  language: 'en' | 'ar';
}

const FleetMap: React.FC<FleetMapProps> = ({ drivers, language }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const texts = {
    en: {
      status: 'Status',
      trips: 'Trips',
      earnings: 'Earnings',
      performance: 'Performance',
      requiresAttention: '⚠️ Requires attention'
    },
    ar: {
      status: 'الحالة',
      trips: 'الرحلات',
      earnings: 'الأرباح',
      performance: 'الأداء',
      requiresAttention: '⚠️ يتطلب انتباه'
    }
  };

  const t = texts[language];

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([25.2048, 55.2708], 12);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom icon for drivers
    const createDriverIcon = (driver: Driver) => {
      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;
      const color = driver.status === 'active' ? (hasAlert ? '#ef4444' : '#10b981') : '#6b7280';
      
      return L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
          ">${driver.avatar}</div>
        `,
        className: 'custom-driver-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Add driver markers
    drivers.forEach((driver) => {
      const marker = L.marker([driver.location.lat, driver.location.lng], {
        icon: createDriverIcon(driver)
      }).addTo(map);

      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;

      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-semibold">${driver.avatar}</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">${driver.name}</h3>
              <p class="text-xs text-gray-500">${driver.vehicleId || 'No vehicle assigned'}</p>
            </div>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">${t.status}:</span>
              <span class="font-medium ${driver.status === 'active' ? 'text-green-600' : 'text-gray-600'}">${driver.status}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">${t.trips}:</span>
              <span class="font-medium">${driver.trips}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">${t.earnings}:</span>
              <span class="font-medium">$${driver.earnings.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">${t.performance}:</span>
              <span class="font-medium">${driver.performanceScore}%</span>
            </div>
            ${hasAlert ? `<p class="text-xs text-red-600 font-medium mt-2">${t.requiresAttention}</p>` : ''}
          </div>
        </div>
      `);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [drivers, language]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-96"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default FleetMap;