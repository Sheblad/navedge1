import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Driver {
  id: number;
  name: string;
  avatar: string;
  trips: number;
  earnings: number;
  status: 'active' | 'offline';
  redFlag: boolean;
  location: { lat: number; lng: number };
}

interface FleetMapProps {
  drivers: Driver[];
}

const FleetMap: React.FC<FleetMapProps> = ({ drivers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([25.2048, 55.2708], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom icon for drivers
    const createDriverIcon = (status: string, redFlag: boolean) => {
      const color = status === 'active' ? (redFlag ? '#ef4444' : '#10b981') : '#6b7280';
      return L.divIcon({
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        `,
        className: 'custom-driver-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    // Add driver markers
    drivers.forEach((driver) => {
      const marker = L.marker([driver.location.lat, driver.location.lng], {
        icon: createDriverIcon(driver.status, driver.redFlag)
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-gray-900">${driver.name}</h3>
          <p class="text-sm text-gray-600">Status: ${driver.status}</p>
          <p class="text-sm text-gray-600">Trips: ${driver.trips}</p>
          <p class="text-sm text-gray-600">Earnings: $${driver.earnings.toLocaleString()}</p>
          ${driver.redFlag ? '<p class="text-sm text-red-600 font-medium">⚠️ Requires attention</p>' : ''}
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
  }, [drivers]);

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