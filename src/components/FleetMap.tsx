import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Driver } from '../data/mockData';
import { MapPin, Navigation, Clock, Phone, Eye, Zap } from 'lucide-react';

interface FleetMapProps {
  drivers: Driver[];
  language: 'en' | 'ar';
  onDriverClick?: (driverId: number) => void;
}

const FleetMap: React.FC<FleetMapProps> = ({ drivers, language, onDriverClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);

  const texts = {
    en: {
      status: 'Status',
      trips: 'Trips',
      earnings: 'Earnings',
      performance: 'Performance',
      requiresAttention: '⚠️ Requires attention',
      fleetStatus: 'Live Fleet Status',
      activeDrivers: 'Active Drivers',
      offlineDrivers: 'Offline Drivers',
      legend: 'Legend',
      active: 'Active',
      offline: 'Offline',
      needsAttention: 'Needs Attention',
      viewProfile: 'View Full Profile',
      currentLocation: 'Current Location',
      lastUpdate: 'Last Update',
      speed: 'Speed',
      heading: 'Heading',
      accuracy: 'GPS Accuracy',
      realTimeTracking: 'Real-Time Tracking',
      clickForDetails: 'Click driver for details',
      liveUpdates: 'Live Updates',
      gpsConnected: 'GPS Connected',
      trackingActive: 'Tracking Active'
    },
    ar: {
      status: 'الحالة',
      trips: 'الرحلات',
      earnings: 'الأرباح',
      performance: 'الأداء',
      requiresAttention: '⚠️ يتطلب انتباه',
      fleetStatus: 'حالة الأسطول المباشرة',
      activeDrivers: 'السائقون النشطون',
      offlineDrivers: 'السائقون غير المتصلين',
      legend: 'المفتاح',
      active: 'نشط',
      offline: 'غير متصل',
      needsAttention: 'يحتاج انتباه',
      viewProfile: 'عرض الملف الكامل',
      currentLocation: 'الموقع الحالي',
      lastUpdate: 'آخر تحديث',
      speed: 'السرعة',
      heading: 'الاتجاه',
      accuracy: 'دقة GPS',
      realTimeTracking: 'التتبع المباشر',
      clickForDetails: 'انقر على السائق للتفاصيل',
      liveUpdates: 'التحديثات المباشرة',
      gpsConnected: 'GPS متصل',
      trackingActive: 'التتبع نشط'
    }
  };

  const t = texts[language];

  // Simulate real-time GPS updates
  useEffect(() => {
    if (!isRealTimeActive) return;

    const interval = setInterval(() => {
      drivers.forEach(driver => {
        if (driver.status === 'active') {
          // Simulate GPS movement (small random changes)
          const newLat = driver.location.lat + (Math.random() - 0.5) * 0.002;
          const newLng = driver.location.lng + (Math.random() - 0.5) * 0.002;
          
          // Update driver location
          driver.location.lat = newLat;
          driver.location.lng = newLng;
          
          // Update marker position if it exists
          const marker = markersRef.current.get(driver.id);
          if (marker) {
            marker.setLatLng([newLat, newLng]);
            
            // Update popup content with new timestamp
            const popupContent = createPopupContent(driver);
            marker.setPopupContent(popupContent);
          }
        }
      });
    }, 5000); // Update every 5 seconds for real-time feel

    return () => clearInterval(interval);
  }, [drivers, isRealTimeActive]);

  const createPopupContent = (driver: Driver) => {
    const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;
    const speed = Math.floor(Math.random() * 60) + 20; // Simulate speed
    const heading = Math.floor(Math.random() * 360); // Simulate heading
    const accuracy = Math.floor(Math.random() * 10) + 3; // Simulate GPS accuracy

    return `
      <div style="
        padding: 20px;
        min-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 12px;
        border: 2px solid #e2e8f0;
      ">
        <!-- Header -->
        <div style="display: flex; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          ">
            <span style="color: white; font-size: 14px; font-weight: 700;">${driver.avatar}</span>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">${driver.name}</h3>
            <div style="display: flex; align-items: center; margin-top: 4px;">
              <div style="
                width: 8px; 
                height: 8px; 
                background: ${driver.status === 'active' ? '#10b981' : '#6b7280'}; 
                border-radius: 50%; 
                margin-right: 6px;
                ${driver.status === 'active' ? 'animation: pulse 2s infinite;' : ''}
              "></div>
              <span style="font-size: 12px; color: #64748b; font-weight: 500;">${driver.vehicleId || 'No vehicle assigned'}</span>
            </div>
          </div>
        </div>

        <!-- Real-time GPS Data -->
        <div style="
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid #93c5fd;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #1d4ed8; font-size: 12px; font-weight: 600;">📍 ${t.realTimeTracking}</span>
            <div style="
              margin-left: auto;
              padding: 2px 8px;
              background: #10b981;
              color: white;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
            ">LIVE</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
            <div>
              <span style="color: #64748b;">${t.speed}:</span>
              <span style="font-weight: 600; color: #1e293b; margin-left: 4px;">${speed} km/h</span>
            </div>
            <div>
              <span style="color: #64748b;">${t.heading}:</span>
              <span style="font-weight: 600; color: #1e293b; margin-left: 4px;">${heading}°</span>
            </div>
            <div>
              <span style="color: #64748b;">${t.accuracy}:</span>
              <span style="font-weight: 600; color: #1e293b; margin-left: 4px;">±${accuracy}m</span>
            </div>
            <div>
              <span style="color: #64748b;">${t.lastUpdate}:</span>
              <span style="font-weight: 600; color: #10b981; margin-left: 4px;">Now</span>
            </div>
          </div>
        </div>

        <!-- Driver Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 16px;">
          <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 500;">${t.status}:</span>
              <span style="font-weight: 600; color: ${driver.status === 'active' ? '#059669' : '#6b7280'};">
                ${driver.status === 'active' ? t.active : t.offline}
              </span>
            </div>
          </div>
          <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 500;">${t.trips}:</span>
              <span style="font-weight: 600; color: #1e293b;">${driver.trips}</span>
            </div>
          </div>
          <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 500;">${t.earnings}:</span>
              <span style="font-weight: 600; color: #1e293b;">$${driver.earnings.toLocaleString()}</span>
            </div>
          </div>
          <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 500;">${t.performance}:</span>
              <span style="font-weight: 600; color: #1e293b;">${driver.performanceScore}%</span>
            </div>
          </div>
        </div>

        <!-- Alert if needed -->
        ${hasAlert ? `
          <div style="
            margin-bottom: 16px; 
            padding: 10px; 
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
            border: 1px solid #fecaca; 
            border-radius: 8px;
          ">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">⚠️</span>
              <p style="margin: 0; font-size: 12px; color: #dc2626; font-weight: 600;">${t.requiresAttention}</p>
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button 
            onclick="window.openDriverProfile(${driver.id})"
            style="
              padding: 10px 16px;
              background: linear-gradient(135deg, #3b82f6, #6366f1);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)'"
          >
            👤 ${t.viewProfile}
          </button>
          <button 
            onclick="window.callDriver('${driver.phone}')"
            style="
              padding: 10px 16px;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 16px rgba(16, 185, 129, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.3)'"
          >
            📞 Call Driver
          </button>
        </div>

        <!-- Coordinates -->
        <div style="
          margin-top: 16px; 
          padding-top: 12px; 
          border-top: 1px solid #e2e8f0;
          font-size: 10px;
          color: #64748b;
          text-align: center;
        ">
          📍 ${driver.location.lat.toFixed(6)}, ${driver.location.lng.toFixed(6)}
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([25.2048, 55.2708], 12);
    mapInstanceRef.current = map;

    // Use high-quality satellite tiles for better GPS visualization
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom icon for drivers with real-time indicators
    const createDriverIcon = (driver: Driver) => {
      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;
      const color = driver.status === 'active' ? (hasAlert ? '#ef4444' : '#10b981') : '#6b7280';
      const pulseAnimation = driver.status === 'active' ? 'animation: pulse 2s infinite;' : '';
      
      return L.divIcon({
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
          ">
            <!-- Pulse ring for active drivers -->
            ${driver.status === 'active' ? `
              <div style="
                position: absolute;
                top: -4px;
                left: -4px;
                width: 40px;
                height: 40px;
                background-color: ${color};
                border-radius: 50%;
                opacity: 0.3;
                animation: pulse 2s infinite;
              "></div>
            ` : ''}
            
            <!-- Main marker -->
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              cursor: pointer;
              transition: all 0.2s ease;
              position: relative;
              z-index: 10;
            ">${driver.avatar}</div>
            
            <!-- Status indicator -->
            <div style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 12px;
              height: 12px;
              background-color: ${driver.status === 'active' ? '#10b981' : '#6b7280'};
              border: 2px solid white;
              border-radius: 50%;
              ${pulseAnimation}
            "></div>
          </div>
          
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.2); opacity: 0.1; }
              100% { transform: scale(1); opacity: 0.3; }
            }
          </style>
        `,
        className: 'custom-driver-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    };

    // Add driver markers
    drivers.forEach((driver) => {
      const marker = L.marker([driver.location.lat, driver.location.lng], {
        icon: createDriverIcon(driver)
      }).addTo(map);

      // Store marker reference for real-time updates
      markersRef.current.set(driver.id, marker);

      const popupContent = createPopupContent(driver);
      marker.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'custom-popup'
      });

      // Handle marker click
      marker.on('click', () => {
        setSelectedDriver(driver);
      });
    });

    // Add global functions for popup interactions
    (window as any).openDriverProfile = (driverId: number) => {
      if (onDriverClick) {
        onDriverClick(driverId);
      }
    };

    (window as any).callDriver = (phone: string) => {
      alert(`Calling ${phone}...`);
    };

    // Enhanced fleet status control with real-time features
    const FleetStatusControl = L.Control.extend({
      onAdd: function(map: L.Map) {
        const activeCount = drivers.filter(d => d.status === 'active').length;
        const offlineCount = drivers.length - activeCount;
        
        const div = L.DomUtil.create('div', 'fleet-status-control');
        div.style.cssText = `
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 240px;
          backdrop-filter: blur(10px);
        `;
        
        div.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="
              width: 8px; 
              height: 8px; 
              background: #10b981; 
              border-radius: 50%; 
              margin-right: 8px;
              animation: pulse 2s infinite;
            "></div>
            <span style="font-weight: 700; font-size: 14px; color: #1e293b;">${t.fleetStatus}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #1d4ed8;">${activeCount}</div>
              <div style="font-size: 10px; color: #1e40af; font-weight: 500;">${t.active}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #6b7280;">${offlineCount}</div>
              <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${t.offline}</div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 600;">${t.legend}:</div>
            <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
              <div style="margin-bottom: 2px;">🟢 ${t.active} | 🔴 ${t.needsAttention} | ⚫ ${t.offline}</div>
              <div style="color: #10b981; font-weight: 500;">📡 ${t.gpsConnected} • ${t.liveUpdates}</div>
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

    // Add real-time tracking toggle
    const TrackingControl = L.Control.extend({
      onAdd: function(map: L.Map) {
        const div = L.DomUtil.create('div', 'tracking-control');
        div.style.cssText = `
          background: ${isRealTimeActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'};
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 10px;
        `;
        
        div.innerHTML = `
          <div style="display: flex; align-items: center; color: white;">
            <div style="
              width: 6px; 
              height: 6px; 
              background: white; 
              border-radius: 50%; 
              margin-right: 8px;
              ${isRealTimeActive ? 'animation: pulse 1s infinite;' : ''}
            "></div>
            <span style="font-size: 12px; font-weight: 600;">${isRealTimeActive ? t.trackingActive : 'Tracking Paused'}</span>
          </div>
        `;
        
        div.onclick = () => {
          setIsRealTimeActive(!isRealTimeActive);
        };
        
        return div;
      }
    });

    new TrackingControl({ position: 'topright' }).addTo(map);

    // Add custom CSS for enhanced styling
    const style = document.createElement('style');
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        border: 2px solid #e2e8f0;
        padding: 0;
        overflow: hidden;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .custom-popup .leaflet-popup-tip {
        background: white;
        border: 2px solid #e2e8f0;
      }
      .fleet-status-control, .tracking-control {
        pointer-events: auto;
      }
      .custom-driver-icon {
        transition: transform 0.2s ease;
      }
      .custom-driver-icon:hover {
        transform: scale(1.1);
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
      document.head.removeChild(style);
      // Clean up global functions
      delete (window as any).openDriverProfile;
      delete (window as any).callDriver;
    };
  }, [drivers, language, onDriverClick]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t.realTimeTracking}</h3>
              <p className="text-sm text-gray-600">{t.clickForDetails}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              isRealTimeActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span>{isRealTimeActive ? t.liveUpdates : 'Paused'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96"
        style={{ minHeight: '500px' }}
      />

      {/* Selected Driver Info */}
      {selectedDriver && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{selectedDriver.avatar}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedDriver.name}</h4>
                <p className="text-sm text-gray-600">{selectedDriver.vehicleId || 'No vehicle assigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDriverClick && onDriverClick(selectedDriver.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>{t.viewProfile}</span>
              </button>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetMap;