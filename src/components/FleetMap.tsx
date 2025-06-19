import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Driver } from '../data/mockData';
import { MapPin, Navigation, Clock, Phone, Eye, Zap } from 'lucide-react';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface FleetMapProps {
  drivers: Driver[];
  language: Language;
  onDriverClick?: (driverId: number) => void;
}

const FleetMap: React.FC<FleetMapProps> = ({ drivers, language, onDriverClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [liveDriverUpdates, setLiveDriverUpdates] = useState<Map<number, any>>(new Map());

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
      trackingActive: 'Tracking Active',
      mobileDriverConnected: 'Mobile Driver Connected'
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
      trackingActive: 'التتبع نشط',
      mobileDriverConnected: 'سائق الهاتف المحمول متصل'
    },
    hi: {
      status: 'स्थिति',
      trips: 'यात्राएं',
      earnings: 'कमाई',
      performance: 'प्रदर्शन',
      requiresAttention: '⚠️ ध्यान देने की आवश्यकता',
      fleetStatus: 'लाइव फ्लीट स्थिति',
      activeDrivers: 'सक्रिय ड्राइवर',
      offlineDrivers: 'ऑफ़लाइन ड्राइवर',
      legend: 'लेजेंड',
      active: 'सक्रिय',
      offline: 'ऑफ़लाइन',
      needsAttention: 'ध्यान चाहिए',
      viewProfile: 'पूरी प्रोफ़ाइल देखें',
      currentLocation: 'वर्तमान स्थान',
      lastUpdate: 'अंतिम अपडेट',
      speed: 'गति',
      heading: 'दिशा',
      accuracy: 'GPS सटीकता',
      realTimeTracking: 'रियल-टाइम ट्रैकिंग',
      clickForDetails: 'विवरण के लिए ड्राइवर पर क्लिक करें',
      liveUpdates: 'लाइव अपडेट',
      gpsConnected: 'GPS कनेक्टेड',
      trackingActive: 'ट्रैकिंग सक्रिय',
      mobileDriverConnected: 'मोबाइल ड्राइवर कनेक्टेड'
    },
    ur: {
      status: 'حالت',
      trips: 'سفر',
      earnings: 'کمائی',
      performance: 'کارکردگی',
      requiresAttention: '⚠️ توجہ درکار',
      fleetStatus: 'لائیو فلیٹ کی حالت',
      activeDrivers: 'فعال ڈرائیورز',
      offlineDrivers: 'آف لائن ڈرائیورز',
      legend: 'لیجنڈ',
      active: 'فعال',
      offline: 'آف لائن',
      needsAttention: 'توجہ چاہیے',
      viewProfile: 'مکمل پروفائل دیکھیں',
      currentLocation: 'موجودہ مقام',
      lastUpdate: 'آخری اپڈیٹ',
      speed: 'رفتار',
      heading: 'سمت',
      accuracy: 'GPS درستگی',
      realTimeTracking: 'ریئل ٹائم ٹریکنگ',
      clickForDetails: 'تفصیلات کے لیے ڈرائیور پر کلک کریں',
      liveUpdates: 'لائیو اپڈیٹس',
      gpsConnected: 'GPS جڑا ہوا',
      trackingActive: 'ٹریکنگ فعال',
      mobileDriverConnected: 'موبائل ڈرائیور جڑا ہوا'
    }
  };

  const t = texts[language];

  // Listen for real-time driver updates from mobile app
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DRIVER_LOCATION_UPDATE') {
        const { driverId, location, vehicleId, driverName } = event.data.data;
        
        // Update live driver data
        setLiveDriverUpdates(prev => new Map(prev.set(driverId, {
          location,
          vehicleId,
          driverName,
          lastUpdate: Date.now(),
          isLive: true
        })));

        // Update marker position
        const marker = markersRef.current.get(driverId);
        if (marker) {
          marker.setLatLng([location.lat, location.lng]);
          
          // Update popup with live data
          const popupContent = createPopupContent(
            drivers.find(d => d.id === driverId) || {
              id: driverId,
              name: driverName,
              vehicleId,
              location,
              status: 'active',
              trips: 0,
              earnings: 0,
              performanceScore: 85,
              avatar: driverName.split(' ').map((n: string) => n[0]).join(''),
              email: '',
              phone: '',
              joinDate: ''
            },
            true // isLive flag
          );
          marker.setPopupContent(popupContent);
        } else {
          // Create new marker for live driver
          addLiveDriverMarker(driverId, location, driverName, vehicleId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [drivers]);

  const addLiveDriverMarker = (driverId: number, location: any, driverName: string, vehicleId: string) => {
    if (!mapInstanceRef.current) return;

    const marker = L.marker([location.lat, location.lng], {
      icon: createDriverIcon({
        id: driverId,
        name: driverName,
        vehicleId,
        status: 'active',
        performanceScore: 85,
        earnings: 0,
        trips: 0,
        avatar: driverName.split(' ').map((n: string) => n[0]).join(''),
        email: '',
        phone: '',
        joinDate: '',
        location
      }, true)
    }).addTo(mapInstanceRef.current);

    markersRef.current.set(driverId, marker);

    const popupContent = createPopupContent({
      id: driverId,
      name: driverName,
      vehicleId,
      location,
      status: 'active',
      trips: 0,
      earnings: 0,
      performanceScore: 85,
      avatar: driverName.split(' ').map((n: string) => n[0]).join(''),
      email: '',
      phone: '',
      joinDate: ''
    }, true);

    marker.bindPopup(popupContent, {
      maxWidth: 350,
      className: 'custom-popup'
    });

    marker.on('click', () => {
      setSelectedDriver({
        id: driverId,
        name: driverName,
        vehicleId,
        location,
        status: 'active',
        trips: 0,
        earnings: 0,
        performanceScore: 85,
        avatar: driverName.split(' ').map((n: string) => n[0]).join(''),
        email: '',
        phone: '',
        joinDate: ''
      });
    });
  };

  // Simulate real-time GPS updates with realistic movement
  useEffect(() => {
    if (!isRealTimeActive) return;

    const interval = setInterval(() => {
      drivers.forEach(driver => {
        if (driver.status === 'active') {
          // Create realistic movement patterns
          const movementSpeed = 0.0005; // Adjust for realistic speed
          const randomDirection = Math.random() * 2 * Math.PI;
          
          // Simulate realistic GPS movement (following roads/paths)
          const latChange = Math.cos(randomDirection) * movementSpeed * (0.5 + Math.random());
          const lngChange = Math.sin(randomDirection) * movementSpeed * (0.5 + Math.random());
          
          // Keep drivers within Dubai bounds
          const newLat = Math.max(25.15, Math.min(25.35, driver.location.lat + latChange));
          const newLng = Math.max(55.15, Math.min(55.35, driver.location.lng + lngChange));
          
          // Update driver location
          driver.location.lat = newLat;
          driver.location.lng = newLng;
          
          // Update marker position with smooth animation
          const marker = markersRef.current.get(driver.id);
          if (marker) {
            // Smooth movement animation
            marker.setLatLng([newLat, newLng]);
            
            // Update popup content with new timestamp and simulated data
            const popupContent = createPopupContent(driver);
            marker.setPopupContent(popupContent);
          }
        }
      });
    }, 3000); // Update every 3 seconds for smooth movement

    return () => clearInterval(interval);
  }, [drivers, isRealTimeActive]);

  const createPopupContent = (driver: Driver, isLive = false) => {
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
              ${isLive ? '<span style="margin-left: 8px; padding: 2px 6px; background: #10b981; color: white; border-radius: 8px; font-size: 10px; font-weight: 600;">LIVE</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Real-time GPS Data -->
        <div style="
          background: linear-gradient(135deg, ${isLive ? '#dcfce7' : '#dbeafe'} 0%, ${isLive ? '#bbf7d0' : '#bfdbfe'} 100%);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid ${isLive ? '#86efac' : '#93c5fd'};
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: ${isLive ? '#15803d' : '#1d4ed8'}; font-size: 12px; font-weight: 600;">📍 ${t.realTimeTracking}</span>
            <div style="
              margin-left: auto;
              padding: 2px 8px;
              background: ${isLive ? '#10b981' : '#3b82f6'};
              color: white;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              animation: pulse 2s infinite;
            ">${isLive ? 'MOBILE' : 'SIM'}</div>
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

        ${isLive ? `
          <div style="
            margin-bottom: 16px; 
            padding: 10px; 
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
            border: 1px solid #bbf7d0; 
            border-radius: 8px;
          ">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">📱</span>
              <p style="margin: 0; font-size: 12px; color: #15803d; font-weight: 600;">${t.mobileDriverConnected}</p>
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
            onclick="window.callDriver('${driver.phone || '+971501234567'}')"
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

      <style>
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      </style>
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
    const createDriverIcon = (driver: Driver, isLive = false) => {
      const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;
      const color = driver.status === 'active' ? (hasAlert ? '#ef4444' : isLive ? '#10b981' : '#3b82f6') : '#6b7280';
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
              background-color: ${isLive ? '#10b981' : driver.status === 'active' ? '#3b82f6' : '#6b7280'};
              border: 2px solid white;
              border-radius: 50%;
              ${pulseAnimation}
            "></div>
            
            ${isLive ? `
              <!-- Live indicator -->
              <div style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 8px;
                height: 8px;
                background-color: #10b981;
                border: 1px solid white;
                border-radius: 50%;
                animation: pulse 1s infinite;
              "></div>
            ` : ''}
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

    // Store createDriverIcon in component scope
    (window as any).createDriverIcon = createDriverIcon;

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
        const liveCount = liveDriverUpdates.size;
        
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
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #1d4ed8;">${activeCount}</div>
              <div style="font-size: 10px; color: #1e40af; font-weight: 500;">${t.active}</div>
            </div>
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #15803d;">${liveCount}</div>
              <div style="font-size: 10px; color: #166534; font-weight: 500;">LIVE</div>
            </div>
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #6b7280;">${offlineCount}</div>
              <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${t.offline}</div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 600;">${t.legend}:</div>
            <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
              <div style="margin-bottom: 2px;">🟢 ${t.active} | 🟢 Live Mobile | ⚫ ${t.offline}</div>
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
      delete (window as any).createDriverIcon;
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
            {liveDriverUpdates.size > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>{liveDriverUpdates.size} Mobile Connected</span>
              </div>
            )}
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

      {/* Mobile App Instructions */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Mobile Driver App Available!</h4>
            <p className="text-blue-800 text-sm mb-3">
              Drivers can now use their mobile phones for real-time GPS tracking. 
              Visit <strong>/mobile.html</strong> on any smartphone to start tracking.
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-700">
              <span>📱 Works on any smartphone</span>
              <span>🌐 No app store needed</span>
              <span>📍 Real-time GPS tracking</span>
              <span>💾 Works offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetMap;