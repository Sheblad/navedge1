import React from 'react';
import { AlertTriangle, MapPin, DollarSign, Clock, Star, Phone } from 'lucide-react';
import { Driver } from '../data/mockData';

interface DriverCardProps {
  driver: Driver;
  fleetMode: 'rental' | 'taxi';
  language: 'en' | 'ar';
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, fleetMode, language }) => {
  const texts = {
    en: {
      tripsToday: fleetMode === 'taxi' ? 'Trips Today' : 'Active Rentals',
      earnings: fleetMode === 'taxi' ? 'Today' : 'Monthly',
      performance: 'Performance',
      contact: 'Contact'
    },
    ar: {
      tripsToday: fleetMode === 'taxi' ? 'رحلات اليوم' : 'التأجيرات النشطة',
      earnings: fleetMode === 'taxi' ? 'اليوم' : 'شهرياً',
      performance: 'الأداء',
      contact: 'اتصال'
    }
  };

  const t = texts[language];

  const hasAlert = driver.performanceScore < 80 || driver.earnings < 500;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{driver.avatar}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
              driver.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 capitalize">{driver.status}</span>
              {driver.vehicleId && (
                <span className="text-xs text-blue-600">{driver.vehicleId}</span>
              )}
            </div>
          </div>
        </div>
        
        {hasAlert && (
          <div className="p-1 bg-red-100 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        )}
      </div>

      {/* Performance Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{t.performance}</span>
          <span className="text-xs font-medium text-gray-900">{driver.performanceScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              driver.performanceScore >= 90 ? 'bg-green-500' :
              driver.performanceScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${driver.performanceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{t.tripsToday}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{driver.trips}</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{t.earnings}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${driver.earnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Location & Contact */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>Dubai, UAE</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{(driver.performanceScore / 20).toFixed(1)}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;