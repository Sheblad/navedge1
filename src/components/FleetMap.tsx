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
      requiresAttention: '⚠️ Requires attention',
      fleetStatus: 'Fleet Status',
      activeDrivers: 'Active Drivers',
      offlineDrivers: 'Offline Drivers',
      legend: 'Legend',
      active: 'Active',
      offline: 'Offline',
      needsAttention: 'Needs Attention'
    },
    ar: {
      status: 'الحالة',
      trips: 'الرحلات',
      earnings: 'الأرباح',
      performance: 'الأداء',
      requiresAttention: '⚠️ يتطلب انتباه',
      fleetStatus: 'حالة الأسطول',
      activeDrivers: 'السائقون النشطون',
      offlineDrivers: 'السائقون غير المتصلين',
      legend: 'المفتاح',
      active: 'نشط',
      offline: 'غير متصل',
      needsAttention: 'يحتاج انتباه'
    }
  };

  const t = texts[language];

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([25.2048, 55.2708], 12);
    mapInstanceRef.current = map;

    // Use CartoDB Positron tiles which are in English
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Alternative English tile options (you can switch between these):
    
    // Option 1: Stamen Toner (Clean English labels)
    // L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
    //   attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors',
    //   subdomains: 'abcd'
    // }).addTo(map);

    // Option 2: Esri World Street Map (English)
    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    //   attribution: 'Tiles © Esri'
    // }).addTo(map);

    // Custom icon for drivers
    const createDriverIcon = (driver: Driver) => {
      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;
      const color = driver.status === 'active' ? (hasAlert ? '#ef4444' : '#10b981') : '#6b7280';
      
      return L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">${driver.avatar}</div>
        `,
        className: 'custom-driver-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    };

    // Add driver markers
    drivers.forEach((driver) => {
      const marker = L.marker([driver.location.lat, driver.location.lng], {
        icon: createDriverIcon(driver)
      }).addTo(map);

      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;

      marker.bindPopup(`
        <div style="
          padding: 16px;
          min-width: 250px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #3b82f6, #6366f1);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
            ">
              <span style="color: white; font-size: 12px; font-weight: 600;">${driver.avatar}</span>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${driver.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">${driver.vehicleId || 'No vehicle assigned'}</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">${t.status}:</span>
              <span style="font-weight: 500; color: ${driver.status === 'active' ? '#059669' : '#6b7280'};">${driver.status === 'active' ? t.active : t.offline}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">${t.trips}:</span>
              <span style="font-weight: 500; color: #111827;">${driver.trips}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">${t.earnings}:</span>
              <span style="font-weight: 500; color: #111827;">$${driver.earnings.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">${t.performance}:</span>
              <span style="font-weight: 500; color: #111827;">${driver.performanceScore}%</span>
            </div>
          </div>
          ${hasAlert ? `<div style="margin-top: 12px; padding: 8px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px; color: #dc2626; font-weight: 500;">${t.requiresAttention}</p>
          </div>` : ''}
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af;">Last updated: ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    });

    // Add fleet status control
    const FleetStatusControl = L.Control.extend({
      onAdd: function(map: L.Map) {
        const activeCount = drivers.filter(d => d.status === 'active').length;
        const offlineCount = drivers.length - activeCount;
        
        const div = L.DomUtil.create('div', 'fleet-status-control');
        div.style.cssText = `
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 200px;
        `;
        
        div.innerHTML = `
          <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 8px;">${t.fleetStatus}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #059669;">● ${t.activeDrivers}:</span>
            <span style="font-size: 12px; font-weight: 500;">${activeCount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: #6b7280;">● ${t.offlineDrivers}:</span>
            <span style="font-size: 12px; font-weight: 500;">${offlineCount}</span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">${t.legend}:</div>
            <div style="font-size: 10px; color: #6b7280;">
              <div>🟢 ${t.active} | 🔴 ${t.needsAttention} | ⚫ ${t.offline}</div>
            </div>
          </div>
        `;
        
        return div;
      },
      
      onRemove: function(map: L.Map) {
        // Nothing to do here
      }
    });

    // Add the control to the map
    new FleetStatusControl({ position: 'topright' }).addTo(map);

    // Add custom CSS for popup styling
    const style = document.createElement('style');
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        border: 1px solid #e5e7eb;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .custom-popup .leaflet-popup-tip {
        background: white;
        border: 1px solid #e5e7eb;
      }
      .fleet-status-control {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.head.removeChild(style);
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