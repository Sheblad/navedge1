import React from 'react';
import { AlertTriangle, MapPin, DollarSign, Clock } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';

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

interface DriverCardProps {
  driver: Driver;
  fleetMode: FleetMode;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, fleetMode }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{driver.avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                driver.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-500 capitalize">{driver.status}</span>
            </div>
          </div>
        </div>
        
        {driver.redFlag && (
          <div className="p-1 bg-red-100 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">
              {fleetMode === 'taxi' ? 'Trips Today' : 'Active Rentals'}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{driver.trips}</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">
              {fleetMode === 'taxi' ? 'Today' : 'Monthly'}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${driver.earnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>Dubai, UAE</span>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;