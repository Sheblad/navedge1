import React, { useState } from 'react';
import { 
  Satellite, 
  Plus, 
  Check, 
  AlertCircle, 
  MapPin, 
  Settings, 
  Zap,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface GPSDevice {
  id: string;
  name: string;
  imei: string;
  driverId?: number;
  vehicleId?: string;
  status: 'online' | 'offline' | 'testing';
  lastUpdate?: string;
  location?: { lat: number; lng: number };
}

interface GPSProvider {
  id: string;
  name: string;
  logo: string;
  apiEndpoint: string;
  authType: 'api_key' | 'basic' | 'oauth';
  testEndpoint: string;
}

const GPSIntegrationWizard: React.FC = () => {
  const [step, setStep] = useState<'provider' | 'credentials' | 'devices' | 'mapping' | 'complete'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<GPSProvider | null>(null);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    username: '',
    password: '',
    serverUrl: ''
  });
  const [devices, setDevices] = useState<GPSDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const gpsProviders: GPSProvider[] = [
    {
      id: 'teltonika',
      name: 'Teltonika',
      logo: '🛰️',
      apiEndpoint: 'https://api.teltonika.com/v1',
      authType: 'api_key',
      testEndpoint: '/devices'
    },
    {
      id: 'queclink',
      name: 'Queclink',
      logo: '📡',
      apiEndpoint: 'https://api.queclink.com/v2',
      authType: 'basic',
      testEndpoint: '/devices/list'
    },
    {
      id: 'concox',
      name: 'Concox',
      logo: '🌐',
      apiEndpoint: 'https://api.concox.com/v1',
      authType: 'api_key',
      testEndpoint: '/devices'
    },
    {
      id: 'custom',
      name: 'Custom API',
      logo: '⚙️',
      apiEndpoint: '',
      authType: 'api_key',
      testEndpoint: ''
    }
  ];

  const mockDrivers = [
    { id: 1, name: 'Ahmed Al-Rashid', vehicleId: 'DXB-A-12345' },
    { id: 2, name: 'Omar Khalil', vehicleId: 'DXB-C-11111' },
    { id: 3, name: 'Mohammed Hassan', vehicleId: 'DXB-B-67890' }
  ];

  const testConnection = async () => {
    if (!selectedProvider) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response with devices
      const mockDevices: GPSDevice[] = [
        {
          id: 'TLT001',
          name: 'Teltonika FMB920',
          imei: '123456789012345',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          location: { lat: 25.2048, lng: 55.2708 }
        },
        {
          id: 'TLT002',
          name: 'Teltonika FMB920',
          imei: '123456789012346',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          location: { lat: 25.1972, lng: 55.2744 }
        },
        {
          id: 'TLT003',
          name: 'Teltonika FMB920',
          imei: '123456789012347',
          status: 'offline',
          lastUpdate: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setDevices(mockDevices);
      setStep('devices');
    } catch (err) {
      setError('Failed to connect to GPS provider. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const assignDevice = (deviceId: string, driverId: number, vehicleId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, driverId, vehicleId }
        : device
    ));
  };

  const completeSetup = () => {
    // Save GPS configuration
    const config = {
      provider: selectedProvider,
      credentials,
      devices: devices.filter(d => d.driverId)
    };
    
    console.log('GPS Configuration saved:', config);
    setStep('complete');
  };

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Satellite className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your GPS Provider</h2>
        <p className="text-gray-600">Select your GPS tracking device provider to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gpsProviders.map((provider) => (
          <div
            key={provider.id}
            onClick={() => setSelectedProvider(provider)}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedProvider?.id === provider.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{provider.logo}</div>
              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
              {provider.id === 'custom' && (
                <p className="text-sm text-gray-500 mt-1">Any GPS provider with REST API</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedProvider && (
        <div className="flex justify-center">
          <button
            onClick={() => setStep('credentials')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue with {selectedProvider.name}
          </button>
        </div>
      )}
    </div>
  );

  const renderCredentials = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Credentials</h2>
        <p className="text-gray-600">Enter your {selectedProvider?.name} API credentials</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Where to find your credentials:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Log into your {selectedProvider?.name} dashboard</li>
          <li>• Go to Settings → API or Developer section</li>
          <li>• Copy your API key and server URL</li>
          <li>• Paste them below</li>
        </ul>
      </div>

      <div className="space-y-4">
        {selectedProvider?.authType === 'api_key' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              value={credentials.apiKey}
              onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Server URL</label>
          <input
            type="url"
            value={credentials.serverUrl || selectedProvider?.apiEndpoint}
            onChange={(e) => setCredentials({...credentials, serverUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.yourprovider.com"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setStep('provider')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={testConnection}
          disabled={isLoading || !credentials.apiKey && !credentials.username}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Test & Discover Devices
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">GPS Devices Found</h2>
        <p className="text-gray-600">We found {devices.length} GPS devices in your account</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-green-800">✅ Successfully connected to {selectedProvider?.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  <p className="text-sm text-gray-500">IMEI: {device.imei}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {device.status}
                </span>
                {device.lastUpdate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last seen: {new Date(device.lastUpdate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep('credentials')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep('mapping')}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Assign to Drivers
        </button>
      </div>
    </div>
  );

  const renderMapping = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign GPS Devices</h2>
        <p className="text-gray-600">Match each GPS device to a driver and vehicle</p>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <h4 className="font-medium text-gray-900">{device.name}</h4>
                <p className="text-sm text-gray-500">ID: {device.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Driver</label>
                <select
                  value={device.driverId || ''}
                  onChange={(e) => {
                    const driverId = parseInt(e.target.value);
                    const driver = mockDrivers.find(d => d.id === driverId);
                    if (driver) {
                      assignDevice(device.id, driverId, driver.vehicleId);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select driver...</option>
                  {mockDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.vehicleId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-center">
                {device.driverId ? (
                  <div className="flex items-center justify-center text-green-600">
                    <Check className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Assigned</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip:</h4>
        <p className="text-blue-800 text-sm">
          You can assign devices later from the Drivers page. Only assigned devices will appear on the live map.
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep('devices')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={completeSetup}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 GPS Integration Complete!</h2>
        <p className="text-gray-600">Your GPS devices are now connected and tracking</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-4">What's Next:</h3>
        <div className="space-y-2 text-green-800 text-sm">
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            <span>✅ {devices.filter(d => d.driverId).length} devices assigned to drivers</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            <span>✅ Real-time tracking enabled</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            <span>✅ Live map updated with GPS locations</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            <span>✅ Automatic alerts configured</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View Live Map
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Manage Devices
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">GPS Integration Wizard</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[
              { key: 'provider', label: 'Provider' },
              { key: 'credentials', label: 'Credentials' },
              { key: 'devices', label: 'Devices' },
              { key: 'mapping', label: 'Assignment' },
              { key: 'complete', label: 'Complete' }
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepItem.key ? 'bg-blue-600 text-white' : 
                  ['provider', 'credentials', 'devices', 'mapping', 'complete'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {['provider', 'credentials', 'devices', 'mapping', 'complete'].indexOf(step) > index ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{stepItem.label}</span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 'provider' && renderProviderSelection()}
          {step === 'credentials' && renderCredentials()}
          {step === 'devices' && renderDevices()}
          {step === 'mapping' && renderMapping()}
          {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default GPSIntegrationWizard;