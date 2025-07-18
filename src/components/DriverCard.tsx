import React, { useState } from 'react';
import { AlertTriangle, MapPin, DollarSign, Clock, Star, Phone, Calendar, FileText, Navigation, Car } from 'lucide-react';
import { Driver, mockContractsData } from '../data/mockData';
import TripCompletionModal from './TripCompletionModal';
import RentalPaymentModal from './RentalPaymentModal';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface DriverCardProps {
  driver: Driver;
  fleetMode: 'rental' | 'taxi';
  language: Language;
  onDriverClick?: (driverId: number) => void;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, fleetMode, language, onDriverClick }) => {
  const [showTripModal, setShowTripModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      recordPayment: 'Record Payment',
      // Taxi mode
      tripsToday: 'Trips Today',
      todayEarnings: 'Today\'s Earnings',
      shiftStatus: 'Shift Status',
      onDuty: 'On Duty',
      performance: 'Performance',
      contact: 'Contact',
      viewProfile: 'View Full Profile',
      completeTrip: 'Complete Trip',
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
      recordPayment: 'تسجيل الدفع',
      // Taxi mode
      tripsToday: 'رحلات اليوم',
      todayEarnings: 'أرباح اليوم',
      shiftStatus: 'حالة المناوبة',
      onDuty: 'في الخدمة',
      performance: 'الأداء',
      contact: 'اتصال',
      viewProfile: 'عرض الملف الكامل',
      completeTrip: 'إكمال الرحلة',
      // Status
      active: 'نشط',
      onShift: 'في المناوبة',
      offline: 'غير متصل'
    },
    hi: {
      // Rental mode
      rentalActive: 'सक्रिय किराया',
      monthlyEarnings: 'मासिक आय',
      contractStatus: 'अनुबंध स्थिति',
      vehicleAssigned: 'वाहन आवंटित',
      daysRemaining: 'शेष दिन',
      contractExpired: 'अनुबंध समाप्त',
      contractExpiringSoon: 'जल्द समाप्त',
      recordPayment: 'भुगतान दर्ज करें',
      // Taxi mode
      tripsToday: 'आज की यात्राएं',
      todayEarnings: 'आज की कमाई',
      shiftStatus: 'शिफ्ट स्थिति',
      onDuty: 'ड्यूटी पर',
      performance: 'प्रदर्शन',
      contact: 'संपर्क',
      viewProfile: 'पूरी प्रोफ़ाइल देखें',
      completeTrip: 'यात्रा पूरी करें',
      // Status
      active: 'सक्रिय',
      onShift: 'शिफ्ट में',
      offline: 'ऑफ़लाइन'
    },
    ur: {
      // Rental mode
      rentalActive: 'فعال کرایہ',
      monthlyEarnings: 'ماہانہ آمدنی',
      contractStatus: 'کنٹریکٹ کی حالت',
      vehicleAssigned: 'گاڑی تفویض',
      daysRemaining: 'باقی دن',
      contractExpired: 'کنٹریکٹ ختم',
      contractExpiringSoon: 'جلد ختم',
      recordPayment: 'ادائیگی ریکارڈ کریں',
      // Taxi mode
      tripsToday: 'آج کے سفر',
      todayEarnings: 'آج کی کمائی',
      shiftStatus: 'شفٹ کی حالت',
      onDuty: 'ڈیوٹی پر',
      performance: 'کارکردگی',
      contact: 'رابطہ',
      viewProfile: 'مکمل پروفائل دیکھیں',
      completeTrip: 'سفر مکمل کریں',
      // Status
      active: 'فعال',
      onShift: 'شفٹ میں',
      offline: 'آف لائن'
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
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3" onClick={handleCardClick}>
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

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700`}
        >
          {t.viewProfile}
        </button>
        
        {fleetMode === 'taxi' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTripModal(true);
            }}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors text-white`}
          >
            {t.completeTrip}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPaymentModal(true);
            }}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors text-white`}
          >
            {t.recordPayment}
          </button>
        )}
      </div>

      {/* Trip Completion Modal */}
      {showTripModal && (
        <TripCompletionModal 
          driver={driver}
          onClose={() => setShowTripModal(false)}
          language={language}
        />
      )}

      {/* Rental Payment Modal */}
      {showPaymentModal && (
        <RentalPaymentModal
          driver={driver}
          onClose={() => setShowPaymentModal(false)}
          language={language}
        />
      )}
    </div>
  );
};

export default DriverCard;