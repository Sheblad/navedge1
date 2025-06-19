import React, { useState, useEffect } from 'react';
import DriverCard from './DriverCard';
import DriverProfile from './DriverProfile';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';
import SystemAlerts from './SystemAlerts';
import { useSystemAlerts } from '../hooks/useSystemAlerts';
import { mockFinesData } from '../data/mockData';
import type { Driver } from '../data/mockData';
import { TrendingUp, AlertCircle, Users, DollarSign, Clock, MapPin, Car, Navigation, Calendar, FileText, AlertTriangle } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface DashboardProps {
  fleetMode: FleetMode;
  language: Language;
  drivers: Driver[];
}

const Dashboard: React.FC<DashboardProps> = ({ fleetMode, language, drivers }) => {
  const [fines, setFines] = useState(mockFinesData);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const { alerts, dismissAlert } = useSystemAlerts(language, fleetMode);

  const texts = {
    en: {
      welcome: fleetMode === 'rental' ? 'Welcome to NavEdge Rental Hub' : 'Welcome to NavEdge Taxi Control',
      subtitle: fleetMode === 'rental' 
        ? 'Your AI-powered vehicle rental management dashboard' 
        : 'Your AI-powered taxi fleet operations center',
      activeDrivers: fleetMode === 'rental' ? 'Active Renters' : 'Drivers on Duty',
      liveTracking: fleetMode === 'rental' ? 'Live Vehicle Tracking' : 'Live Taxi Fleet',
      noDrivers: fleetMode === 'rental' ? 'No active renters found' : 'No drivers on duty',
      realTimeUpdates: 'Real-time Updates',
      fleetOverview: fleetMode === 'rental' ? 'Rental Fleet Overview' : 'Taxi Operations Overview',
      quickStats: 'Quick Statistics',
      alerts: 'System Alerts',
      performance: 'Performance Insights'
    },
    ar: {
      welcome: fleetMode === 'rental' ? 'مرحباً بك في مركز نافيدج للإيجار' : 'مرحباً بك في مركز تحكم نافيدج للتاكسي',
      subtitle: fleetMode === 'rental' 
        ? 'لوحة تحكم إدارة تأجير المركبات المدعومة بالذكاء الاصطناعي' 
        : 'مركز عمليات أسطول التاكسي المدعوم بالذكاء الاصطناعي',
      activeDrivers: fleetMode === 'rental' ? 'المستأجرون النشطون' : 'السائقون في الخدمة',
      liveTracking: fleetMode === 'rental' ? 'تتبع المركبات المباشر' : 'أسطول التاكسي المباشر',
      noDrivers: fleetMode === 'rental' ? 'لا يوجد مستأجرون نشطون' : 'لا يوجد سائقون في الخدمة',
      realTimeUpdates: 'التحديثات المباشرة',
      fleetOverview: fleetMode === 'rental' ? 'نظرة عامة على أسطول الإيجار' : 'نظرة عامة على عمليات التاكسي',
      quickStats: 'إحصائيات سريعة',
      alerts: 'تنبيهات النظام',
      performance: 'رؤى الأداء'
    },
    hi: {
      welcome: fleetMode === 'rental' ? 'नेवएज रेंटल हब में आपका स्वागत है' : 'नेवएज टैक्सी कंट्रोल में आपका स्वागत है',
      subtitle: fleetMode === 'rental' 
        ? 'आपका AI-संचालित वाहन किराया प्रबंधन डैशबोर्ड' 
        : 'आपका AI-संचालित टैक्सी फ्लीट संचालन केंद्र',
      activeDrivers: fleetMode === 'rental' ? 'सक्रिय किराएदार' : 'ड्यूटी पर ड्राइवर',
      liveTracking: fleetMode === 'rental' ? 'लाइव वाहन ट्रैकिंग' : 'लाइव टैक्सी फ्लीट',
      noDrivers: fleetMode === 'rental' ? 'कोई सक्रिय किराएदार नहीं मिला' : 'कोई ड्राइवर ड्यूटी पर नहीं',
      realTimeUpdates: 'रियल-टाइम अपडेट',
      fleetOverview: fleetMode === 'rental' ? 'रेंटल फ्लीट अवलोकन' : 'टैक्सी संचालन अवलोकन',
      quickStats: 'त्वरित आंकड़े',
      alerts: 'सिस्टम अलर्ट',
      performance: 'प्रदर्शन अंतर्दृष्टि'
    },
    ur: {
      welcome: fleetMode === 'rental' ? 'نیو ایج رینٹل ہب میں خوش آمدید' : 'نیو ایج ٹیکسی کنٹرول میں خوش آمدید',
      subtitle: fleetMode === 'rental' 
        ? 'آپ کا AI سے چلنے والا گاڑی کرایہ منیجمنٹ ڈیش بورڈ' 
        : 'آپ کا AI سے چلنے والا ٹیکسی فلیٹ آپریشن سینٹر',
      activeDrivers: fleetMode === 'rental' ? 'فعال کرایہ دار' : 'ڈیوٹی پر ڈرائیورز',
      liveTracking: fleetMode === 'rental' ? 'لائیو گاڑی ٹریکنگ' : 'لائیو ٹیکسی فلیٹ',
      noDrivers: fleetMode === 'rental' ? 'کوئی فعال کرایہ دار نہیں ملا' : 'کوئی ڈرائیور ڈیوٹی پر نہیں',
      realTimeUpdates: 'ریئل ٹائم اپڈیٹس',
      fleetOverview: fleetMode === 'rental' ? 'رینٹل فلیٹ جائزہ' : 'ٹیکسی آپریشنز جائزہ',
      quickStats: 'فوری اعداد و شمار',
      alerts: 'سسٹم الرٹس',
      performance: 'کارکردگی کی بصیرت'
    }
  };

  const t = texts[language];

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      // Update drivers with new earnings and trips
      drivers.forEach(driver => {
        if (driver.status === 'active') {
          driver.earnings += Math.floor(Math.random() * (fleetMode === 'taxi' ? 50 : 20));
          driver.trips += (Math.random() > (fleetMode === 'taxi' ? 0.7 : 0.9) ? 1 : 0);
          driver.location = {
            lat: driver.location.lat + (Math.random() - 0.5) * 0.001,
            lng: driver.location.lng + (Math.random() - 0.5) * 0.001
          };
        }
      });
    }, fleetMode === 'taxi' ? 15000 : 60000); // Taxi updates faster

    return () => clearInterval(interval);
  }, [realTimeUpdates, fleetMode, drivers]);

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
  const pendingFines = fines.filter(f => f.status === 'pending').length;

  const handleDriverClick = (driverId: number) => {
    setSelectedDriverId(driverId);
  };

  const handleMapDriverClick = (driverId: number) => {
    setSelectedDriverId(driverId);
  };

  if (selectedDriverId) {
    return (
      <DriverProfile
        driverId={selectedDriverId}
        fleetMode={fleetMode}
        language={language}
        onClose={() => setSelectedDriverId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header - Mode Specific */}
      <div className={`${
        fleetMode === 'rental' 
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
          : 'bg-gradient-to-r from-yellow-500 to-orange-600'
      } rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">
                {fleetMode === 'rental' ? `$${totalEarnings.toLocaleString()}` : `$${totalEarnings.toLocaleString()}`}
              </div>
              <div className="text-blue-100 text-sm">
                {fleetMode === 'rental' ? 'Monthly Revenue' : 'Today\'s Revenue'}
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              {fleetMode === 'rental' ? (
                <FileText className="w-8 h-8" />
              ) : (
                <Navigation className="w-8 h-8" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t.fleetOverview}</h2>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={realTimeUpdates}
            onChange={(e) => setRealTimeUpdates(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">{t.realTimeUpdates}</span>
          {realTimeUpdates && (
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              fleetMode === 'rental' ? 'bg-emerald-500' : 'bg-orange-500'
            }`}></div>
          )}
        </label>
      </div>

      {/* Mode-Specific Stats Cards */}
      <StatsCards 
        drivers={drivers} 
        fines={fines} 
        fleetMode={fleetMode} 
        language={language} 
      />

      {/* Driver Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.activeDrivers}</h2>
        {activeDrivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDrivers.map((driver) => (
              <DriverCard 
                key={driver.id} 
                driver={driver} 
                fleetMode={fleetMode} 
                language={language}
                onDriverClick={handleDriverClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t.noDrivers}</p>
          </div>
        )}
      </div>

      {/* Fleet Map */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.liveTracking}</h2>
        <FleetMap 
          drivers={drivers} 
          language={language}
          onDriverClick={handleMapDriverClick}
        />
      </div>
    </div>
  );
};

export default Dashboard;