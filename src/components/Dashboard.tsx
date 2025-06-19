import React, { useState, useEffect } from 'react';
import DriverCard from './DriverCard';
import DriverProfile from './DriverProfile';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';
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
      performance: 'Performance Insights',
      // Rental specific
      monthlyRevenue: 'Monthly Rental Revenue',
      contractsExpiring: 'Contracts Expiring Soon',
      vehicleUtilization: 'Vehicle Utilization Rate',
      depositsPending: 'Deposits Pending',
      maintenanceAlerts: 'Maintenance Alerts',
      // Taxi specific
      dailyRevenue: 'Today\'s Trip Revenue',
      tripsCompleted: 'Trips Completed Today',
      averageTripTime: 'Average Trip Duration',
      peakHours: 'Peak Hours Performance',
      driverShifts: 'Active Shifts',
      // Alert messages
      pendingFinesAlert: 'pending fine',
      pendingFinesAlertPlural: 'pending fines',
      requireAttention: 'require attention',
      contractsExpiringAlert: 'rental contract',
      contractsExpiringAlertPlural: 'rental contracts',
      expiringThisMonth: 'expiring this month',
      maintenanceAlert: 'vehicle',
      maintenanceAlertPlural: 'vehicles',
      dueForMaintenance: 'due for maintenance',
      fleetUtilizationAlert: 'fleet utilization rate',
      peakHoursAlert: 'drivers in high-demand zones',
      tripsCompletedAlert: 'trips completed today',
      driversCurrentlyActive: 'drivers currently active',
      rentersCurrentlyActive: 'renters currently active'
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
      performance: 'رؤى الأداء',
      // Rental specific
      monthlyRevenue: 'إيرادات الإيجار الشهرية',
      contractsExpiring: 'العقود المنتهية قريباً',
      vehicleUtilization: 'معدل استخدام المركبات',
      depositsPending: 'الودائع المعلقة',
      maintenanceAlerts: 'تنبيهات الصيانة',
      // Taxi specific
      dailyRevenue: 'إيرادات الرحلات اليوم',
      tripsCompleted: 'الرحلات المكتملة اليوم',
      averageTripTime: 'متوسط مدة الرحلة',
      peakHours: 'أداء ساعات الذروة',
      driverShifts: 'المناوبات النشطة',
      // Alert messages
      pendingFinesAlert: 'مخالفة معلقة',
      pendingFinesAlertPlural: 'مخالفات معلقة',
      requireAttention: 'تتطلب انتباه',
      contractsExpiringAlert: 'عقد إيجار',
      contractsExpiringAlertPlural: 'عقود إيجار',
      expiringThisMonth: 'تنتهي هذا الشهر',
      maintenanceAlert: 'مركبة',
      maintenanceAlertPlural: 'مركبات',
      dueForMaintenance: 'تحتاج صيانة',
      fleetUtilizationAlert: 'معدل استخدام الأسطول',
      peakHoursAlert: 'سائقون في مناطق الطلب العالي',
      tripsCompletedAlert: 'رحلة مكتملة اليوم',
      driversCurrentlyActive: 'سائقون نشطون حالياً',
      rentersCurrentlyActive: 'مستأجرون نشطون حالياً'
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
      performance: 'प्रदर्शन अंतर्दृष्टि',
      // Rental specific
      monthlyRevenue: 'मासिक किराया राजस्व',
      contractsExpiring: 'जल्द समाप्त होने वाले अनुबंध',
      vehicleUtilization: 'वाहन उपयोग दर',
      depositsPending: 'लंबित जमा',
      maintenanceAlerts: 'रखरखाव अलर्ट',
      // Taxi specific
      dailyRevenue: 'आज की यात्रा आय',
      tripsCompleted: 'आज पूरी की गई यात्राएं',
      averageTripTime: 'औसत यात्रा अवधि',
      peakHours: 'पीक ऑवर्स प्रदर्शन',
      driverShifts: 'सक्रिय शिफ्ट',
      // Alert messages
      pendingFinesAlert: 'लंबित जुर्माना',
      pendingFinesAlertPlural: 'लंबित जुर्माने',
      requireAttention: 'ध्यान देने की आवश्यकता',
      contractsExpiringAlert: 'किराया अनुबंध',
      contractsExpiringAlertPlural: 'किराया अनुबंध',
      expiringThisMonth: 'इस महीने समाप्त हो रहे',
      maintenanceAlert: 'वाहन',
      maintenanceAlertPlural: 'वाहन',
      dueForMaintenance: 'रखरखाव के लिए देय',
      fleetUtilizationAlert: 'फ्लीट उपयोग दर',
      peakHoursAlert: 'उच्च मांग क्षेत्रों में ड्राइवर',
      tripsCompletedAlert: 'आज पूरी की गई यात्राएं',
      driversCurrentlyActive: 'वर्तमान में सक्रिय ड्राइवर',
      rentersCurrentlyActive: 'वर्तमान में सक्रिय किराएदार'
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
      performance: 'کارکردگی کی بصیرت',
      // Rental specific
      monthlyRevenue: 'ماہانہ کرایہ آمدنی',
      contractsExpiring: 'جلد ختم ہونے والے کنٹریکٹس',
      vehicleUtilization: 'گاڑی کا استعمال کی شرح',
      depositsPending: 'زیر التواء ڈپازٹس',
      maintenanceAlerts: 'دیکھ بھال کے الرٹس',
      // Taxi specific
      dailyRevenue: 'آج کی سفری آمدنی',
      tripsCompleted: 'آج مکمل ہونے والے سفر',
      averageTripTime: 'اوسط سفر کا دورانیہ',
      peakHours: 'پیک اوقات کی کارکردگی',
      driverShifts: 'فعال شفٹس',
      // Alert messages
      pendingFinesAlert: 'زیر التواء جرمانہ',
      pendingFinesAlertPlural: 'زیر التواء جرمانے',
      requireAttention: 'توجہ درکار',
      contractsExpiringAlert: 'کرایہ کنٹریکٹ',
      contractsExpiringAlertPlural: 'کرایہ کنٹریکٹس',
      expiringThisMonth: 'اس مہینے ختم ہو رہے',
      maintenanceAlert: 'گاڑی',
      maintenanceAlertPlural: 'گاڑیاں',
      dueForMaintenance: 'دیکھ بھال کے لیے واجب',
      fleetUtilizationAlert: 'فلیٹ استعمال کی شرح',
      peakHoursAlert: 'زیادہ مانگ والے علاقوں میں ڈرائیورز',
      tripsCompletedAlert: 'آج مکمل ہونے والے سفر',
      driversCurrentlyActive: 'فی الوقت فعال ڈرائیورز',
      rentersCurrentlyActive: 'فی الوقت فعال کرایہ دار'
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

  // Mode-specific calculations
  const modeSpecificStats = fleetMode === 'rental' ? {
    contractsExpiring: 3,
    vehicleUtilization: 87,
    depositsPending: 2,
    maintenanceAlerts: 1
  } : {
    tripsToday: drivers.reduce((sum, d) => sum + d.trips, 0),
    averageTripTime: '24 min',
    peakHoursActive: 12,
    shiftsActive: activeDrivers.length
  };

  // System alerts with mode-specific content and proper translations
  const alerts = [
    ...(pendingFines > 0 ? [{
      type: 'warning' as const,
      message: `${pendingFines} ${pendingFines === 1 ? t.pendingFinesAlert : t.pendingFinesAlertPlural} ${t.requireAttention}`,
      icon: AlertTriangle
    }] : []),
    ...(fleetMode === 'rental' ? [
      ...(modeSpecificStats.contractsExpiring > 0 ? [{
        type: 'info' as const,
        message: `${modeSpecificStats.contractsExpiring} ${modeSpecificStats.contractsExpiring === 1 ? t.contractsExpiringAlert : t.contractsExpiringAlertPlural} ${t.expiringThisMonth}`,
        icon: Calendar
      }] : []),
      ...(modeSpecificStats.maintenanceAlerts > 0 ? [{
        type: 'warning' as const,
        message: `${modeSpecificStats.maintenanceAlerts} ${modeSpecificStats.maintenanceAlerts === 1 ? t.maintenanceAlert : t.maintenanceAlertPlural} ${t.dueForMaintenance}`,
        icon: Car
      }] : []),
      {
        type: 'success' as const,
        message: `${modeSpecificStats.vehicleUtilization}% ${t.fleetUtilizationAlert}`,
        icon: TrendingUp
      }
    ] : [
      {
        type: 'info' as const,
        message: `${language === 'ar' ? 'ساعات الذروة:' : language === 'hi' ? 'पीक ऑवर्स:' : language === 'ur' ? 'پیک اوقات:' : 'Peak hours:'} ${modeSpecificStats.peakHoursActive} ${t.peakHoursAlert}`,
        icon: MapPin
      },
      {
        type: 'success' as const,
        message: `${modeSpecificStats.tripsToday} ${t.tripsCompletedAlert}`,
        icon: Navigation
      }
    ]),
    {
      type: 'success' as const,
      message: `${activeDrivers.length} ${fleetMode === 'rental' ? t.rentersCurrentlyActive : t.driversCurrentlyActive}`,
      icon: Users
    }
  ];

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
      {fleetMode === 'rental' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-2xl font-semibold text-gray-900">{activeDrivers.length}</p>
                <p className="text-xs text-emerald-600 mt-1">+2 this week</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Car className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">+18% vs last month</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-semibold text-gray-900">{modeSpecificStats.vehicleUtilization}%</p>
                <p className="text-xs text-emerald-600 mt-1">Excellent rate</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contracts Expiring</p>
                <p className="text-2xl font-semibold text-gray-900">{modeSpecificStats.contractsExpiring}</p>
                <p className="text-xs text-yellow-600 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drivers on Duty</p>
                <p className="text-2xl font-semibold text-gray-900">{activeDrivers.length}</p>
                <p className="text-xs text-orange-600 mt-1">Peak hours active</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Users className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trips Today</p>
                <p className="text-2xl font-semibold text-gray-900">{modeSpecificStats.tripsToday}</p>
                <p className="text-xs text-orange-600 mt-1">+12% vs yesterday</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Navigation className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">+8% vs yesterday</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Trip Time</p>
                <p className="text-2xl font-semibold text-gray-900">{modeSpecificStats.averageTripTime}</p>
                <p className="text-xs text-orange-600 mt-1">Optimal efficiency</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{t.alerts}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    alert.type === 'info' ? 'bg-blue-50 border-blue-400' :
                    'bg-green-50 border-green-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'info' ? 'text-blue-600' :
                      'text-green-600'
                    }`} />
                    <p className={`text-sm font-medium ${
                      alert.type === 'warning' ? 'text-yellow-800' :
                      alert.type === 'info' ? 'text-blue-800' :
                      'text-green-800'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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