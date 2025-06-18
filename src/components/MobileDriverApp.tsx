import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Play, 
  Pause, 
  User, 
  Clock, 
  Navigation, 
  Battery, 
  Signal,
  Settings,
  LogOut,
  Car,
  DollarSign,
  Route
} from 'lucide-react';

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed?: number;
  heading?: number;
}

interface DriverSession {
  driverId: number;
  driverName: string;
  vehicleId: string;
  startTime: number;
  isActive: boolean;
  totalDistance: number;
  totalEarnings: number;
  currentTrip?: {
    startTime: number;
    startLocation: DriverLocation;
    distance: number;
    earnings: number;
  };
}

const MobileDriverApp: React.FC = () => {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [session, setSession] = useState<DriverSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  // Mock driver data - in real app this would come from login
  const mockDriver = {
    id: 1,
    name: 'Ahmed Al-Rashid',
    vehicleId: 'DXB-A-12345',
    avatar: 'AR'
  };

  // Initialize session
  useEffect(() => {
    setSession({
      driverId: mockDriver.id,
      driverName: mockDriver.name,
      vehicleId: mockDriver.vehicleId,
      startTime: Date.now(),
      isActive: false,
      totalDistance: 0,
      totalEarnings: 0
    });
  }, []);

  // Battery monitoring
  useEffect(() => {
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };

    updateBattery();
    const interval = setInterval(updateBattery, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Connection monitoring
  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  // GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: DriverLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        setLocation(newLocation);
        setError(null);

        // Send location to dashboard (in real app, this would be WebSocket or API call)
        sendLocationUpdate(newLocation);

        // Update session
        if (session) {
          setSession(prev => prev ? {
            ...prev,
            isActive: true
          } : null);
        }
      },
      (error) => {
        setError(`GPS Error: ${error.message}`);
        console.error('GPS Error:', error);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        isActive: false
      } : null);
    }
  };

  const sendLocationUpdate = (location: DriverLocation) => {
    // In a real app, this would send data to your server
    console.log('Sending location update:', {
      driverId: session?.driverId,
      location,
      timestamp: Date.now()
    });

    // Simulate updating dashboard
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'DRIVER_LOCATION_UPDATE',
        data: {
          driverId: session?.driverId,
          location,
          vehicleId: session?.vehicleId,
          driverName: session?.driverName
        }
      }, '*');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (startTime: number) => {
    const duration = Date.now() - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-bold">{mockDriver.avatar}</span>
            </div>
            <div>
              <h1 className="font-semibold">{mockDriver.name}</h1>
              <p className="text-sm text-blue-100">{mockDriver.vehicleId}</p>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Battery className="w-4 h-4" />
              <span className="text-xs">{batteryLevel}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Signal className={`w-4 h-4 ${connectionStatus === 'online' ? 'text-green-300' : 'text-red-300'}`} />
              <span className="text-xs">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-4">
        {/* Tracking Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isTracking ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isTracking ? (
                <MapPin className="w-10 h-10 text-green-600 animate-pulse" />
              ) : (
                <MapPin className="w-10 h-10 text-gray-400" />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isTracking ? 'Tracking Active' : 'Tracking Stopped'}
            </h2>
            
            {session && session.isActive && (
              <p className="text-gray-600 mb-4">
                Active for {formatDuration(session.startTime)}
              </p>
            )}

            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                isTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTracking ? (
                <div className="flex items-center justify-center space-x-2">
                  <Pause className="w-6 h-6" />
                  <span>Stop Tracking</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-6 h-6" />
                  <span>Start Tracking</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Current Location */}
        {location && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-blue-600" />
              Current Location
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <p className="font-mono">{location.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <p className="font-mono">{location.lng.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-gray-600">Accuracy:</span>
                <p>±{Math.round(location.accuracy)}m</p>
              </div>
              <div>
                <span className="text-gray-600">Speed:</span>
                <p>{location.speed ? `${Math.round(location.speed * 3.6)} km/h` : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Last update: {formatTime(location.timestamp)}
            </div>
          </div>
        )}

        {/* Session Stats */}
        {session && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Route className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Distance</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {session.totalDistance.toFixed(1)} km
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Earnings</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                AED {session.totalEarnings}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-colors">
            <Settings className="w-6 h-6 text-gray-600" />
            <span className="text-sm text-gray-700">Settings</span>
          </button>
          
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-colors">
            <LogOut className="w-6 h-6 text-gray-600" />
            <span className="text-sm text-gray-700">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      {!isTracking && (
        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Tap "Start Tracking" to begin your shift</li>
              <li>• Keep the app open for accurate GPS tracking</li>
              <li>• Your location will be sent to the fleet dashboard</li>
              <li>• Tap "Stop Tracking" when your shift ends</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDriverApp;