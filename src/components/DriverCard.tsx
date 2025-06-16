import React from 'react';
import { AlertTriangle, MapPin, DollarSign, Clock, Star, Phone, Calendar, FileText, Navigation, Car } from 'lucide-react';
import { Driver, mockContractsData } from '../data/mockData';

interface DriverCardProps {
  driver: Driver;
  fleetMode: 'rental' | 'taxi';
  language: 'en' | 'ar';
  onDriverClick?: (driverId: number) => void;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, fleetMode, language, onDriverClick }) => {
  const texts = {
    en: {
      // Rental mode
      rentalActive: 'Active Rental',
      monthlyEarnings: 'Monthly Revenue',
      contractStatus: 'Contract Status',
      vehicleAssigned: 'Vehicle Assigned',
      daysRemaining: 'Days Remaining',
      contractExpired: 'Contract Expired',
      contractExpiringSoon: 'Expires Soon',
      // Taxi mode
      tripsToday: 'Trips Today',
      todayEarnings: 'Today\'s Earnings',
      shiftStatus: 'Shift Status',
      onDuty: 'On Duty',
      performance: 'Performance',
      contact: 'Contact',
      viewProfile: 'View Full Profile',
      // Status
      active: 'Active',
      onShift: 'On Shift',
      offline: 'Offline'
    },
    ar: {
      // Rental mode
      rentalActive: 'إيجار نشط',
      monthlyEarnings: 'الإيرادات الشهرية',
      contractStatus: 'حالة العقد',
      vehicleAssigned: 'المركبة المخصصة',
      daysRemaining: 'الأيام المتبقية',
      contractExpired: 'انتهى العقد',
      contractExpiringSoon: 'ينتهي قريباً',
      // Taxi mode
      tripsToday: 'رحلات اليوم',
      todayEarnings: 'أرباح اليوم',
      shiftStatus: 'حالة المناوبة',
      onDuty: 'في الخدمة',
      performance: 'الأداء',
      contact: 'اتصال',
      viewProfile: 'عرض الملف الكامل',
      // Status
      active: 'نشط',
      onShift: 'في المناوبة',
      offline: 'غير متصل'
    }
  };

  const t = texts[language];

  const hasAlert = driver.performanceScore < 80 || driver.earnings < (fleetMode === 'rental' ? 1000 : 500);

  // Calculate days remaining for rental contracts
  const getContractDaysRemaining = () => {
    if (fleetMode !== 'rental') return null;
    
    const contract = mockContractsData.find(c => c.driverId === driver.id && c.status === 'active');
    if (!contract) return null;
    
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysRemaining;
  };

  const daysRemaining = getContractDaysRemaining();

  const handleCardClick = () => {
    if (onDriverClick) {
      onDriverClick(driver.id);
    }
  };

  // Mode-specific styling and content
  const cardStyle = fleetMode === 'rental' 
    ? 'hover:shadow-emerald-100 group-hover:bg-emerald-50' 
    : 'hover:shadow-orange-100 group-hover:bg-orange-50';

  const accentColor = fleetMode === 'rental' ? 'emerald' : 'orange';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group ${cardStyle}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-12 h-12 bg-gradient-to-r ${
              fleetMode === 'rental' 
                ? 'from-emerald-600 to-teal-600' 
                : 'from-orange-500 to-yellow-500'
            } rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold">{driver.avatar}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
              driver.status === 'active' 
                ? fleetMode === 'rental' ? 'bg-emerald-500' : 'bg-orange-500'
                : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 group-hover:text-${accentColor}-600 transition-colors`}>
              {driver.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 capitalize">
                {fleetMode === 'rental' ? (driver.status === 'active' ? t.active : t.offline) : (driver.status === 'active' ? t.onShift : t.offline)}
              </span>
              {driver.vehicleId && (
                <span className={`text-xs text-${accentColor}-600`}>{driver.vehicleId}</span>
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
            className={`h-2 rounded-full transition-all duration-300 ${
              driver.performanceScore >= 90 
                ? fleetMode === 'rental' ? 'bg-emerald-500' : 'bg-orange-500'
                : driver.performanceScore >= 80 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
            style={{ width: `${driver.performanceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Mode-Specific Stats */}
      {fleetMode === 'rental' ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-emerald-50 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs text-gray-500">{t.contractStatus}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Active</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-emerald-50 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs text-gray-500">{t.monthlyEarnings}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ${driver.earnings.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-emerald-50 transition-colors col-span-2">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs text-gray-500">{t.daysRemaining}</span>
            </div>
            {daysRemaining !== null ? (
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-semibold ${
                  daysRemaining < 0 ? 'text-red-600' : 
                  daysRemaining < 30 ? 'text-yellow-600' : 'text-gray-900'
                }`}>
                  {daysRemaining < 0 ? t.contractExpired : `${daysRemaining} days`}
                </span>
                {daysRemaining > 0 && daysRemaining < 30 && (
                  <span className="text-xs text-yellow-600 font-medium">{t.contractExpiringSoon}</span>
                )}
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-500">No contract</span>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-orange-50 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <Navigation className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
              <span className="text-xs text-gray-500">{t.tripsToday}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{driver.trips}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-orange-50 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
              <span className="text-xs text-gray-500">{t.todayEarnings}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ${driver.earnings.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-orange-50 transition-colors col-span-2">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
              <span className="text-xs text-gray-500">Shift Duration</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">8h 24m</span>
          </div>
        </div>
      )}

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
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle phone call
            }}
          >
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-${accentColor}-600 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300 pointer-events-none`} />
      
      {/* Click hint */}
      <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className={`text-xs text-${accentColor}-600 text-center font-medium`}>{t.viewProfile}</p>
      </div>
    </div>
  );
};

export default DriverCard;