import React from 'react';
import { Users, Car, DollarSign, AlertTriangle, TrendingUp, Clock, Navigation, FileText, Calendar, MapPin } from 'lucide-react';
import { Driver, Fine } from '../data/mockData';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface StatsCardsProps {
  drivers: Driver[];
  fines: Fine[];
  fleetMode: 'rental' | 'taxi';
  language: Language;
}

const StatsCards: React.FC<StatsCardsProps> = ({ drivers, fines, fleetMode, language }) => {
  const texts = {
    en: {
      // Rental mode
      activeRentals: 'Active Rentals',
      monthlyRevenue: 'Monthly Revenue',
      contractsExpiring: 'Contracts Expiring',
      vehicleUtilization: 'Vehicle Utilization',
      avgRentalDuration: 'Avg Rental Duration',
      maintenanceAlerts: 'Maintenance Alerts',
      // Taxi mode
      driversOnDuty: 'Drivers on Duty',
      tripsToday: 'Trips Today',
      dailyRevenue: 'Daily Revenue',
      avgTripTime: 'Avg Trip Time',
      peakHoursActive: 'Peak Hours Active',
      customerRating: 'Customer Rating',
      // Common
      pendingFines: 'Pending Fines',
      avgPerformance: 'Avg Performance'
    },
    ar: {
      // Rental mode
      activeRentals: 'الإيجارات النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      contractsExpiring: 'العقود المنتهية',
      vehicleUtilization: 'استخدام الأسطول',
      avgRentalDuration: 'متوسط مدة الإيجار',
      maintenanceAlerts: 'تنبيهات الصيانة',
      // Taxi mode
      driversOnDuty: 'السائقون في الخدمة',
      tripsToday: 'رحلات اليوم',
      dailyRevenue: 'الإيرادات اليومية',
      avgTripTime: 'متوسط وقت الرحلة',
      peakHoursActive: 'ساعات الذروة النشطة',
      customerRating: 'تقييم العملاء',
      // Common
      pendingFines: 'المخالفات المعلقة',
      avgPerformance: 'متوسط الأداء'
    },
    hi: {
      // Rental mode
      activeRentals: 'सक्रिय किराए',
      monthlyRevenue: 'मासिक राजस्व',
      contractsExpiring: 'समाप्त हो रहे अनुबंध',
      vehicleUtilization: 'वाहन उपयोग',
      avgRentalDuration: 'औसत किराया अवधि',
      maintenanceAlerts: 'रखरखाव अलर्ट',
      // Taxi mode
      driversOnDuty: 'ड्यूटी पर ड्राइवर',
      tripsToday: 'आज की यात्राएं',
      dailyRevenue: 'दैनिक राजस्व',
      avgTripTime: 'औसत यात्रा समय',
      peakHoursActive: 'पीक ऑवर्स सक्रिय',
      customerRating: 'ग्राहक रेटिंग',
      // Common
      pendingFines: 'लंबित जुर्माने',
      avgPerformance: 'औसत प्रदर्शन'
    },
    ur: {
      // Rental mode
      activeRentals: 'فعال کرایے',
      monthlyRevenue: 'ماہانہ آمدنی',
      contractsExpiring: 'ختم ہونے والے کنٹریکٹس',
      vehicleUtilization: 'گاڑی کا استعمال',
      avgRentalDuration: 'اوسط کرایہ مدت',
      maintenanceAlerts: 'دیکھ بھال الرٹس',
      // Taxi mode
      driversOnDuty: 'ڈیوٹی پر ڈرائیورز',
      tripsToday: 'آج کے سفر',
      dailyRevenue: 'روزانہ آمدنی',
      avgTripTime: 'اوسط سفر کا وقت',
      peakHoursActive: 'پیک اوقات فعال',
      customerRating: 'کسٹمر ریٹنگ',
      // Common
      pendingFines: 'زیر التواء جرمانے',
      avgPerformance: 'اوسط کارکردگی'
    }
  };

  const t = texts[language];

  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = drivers.reduce((sum, d) => sum + d.trips, 0);
  const pendingFines = fines.filter(f => f.status === 'pending').length;
  const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
  const utilizationRate = (activeDrivers / drivers.length) * 100;

  // Mode-specific calculations
  const modeSpecificData = fleetMode === 'rental' ? {
    contractsExpiring: 3,
    avgRentalDuration: '11.2 months',
    maintenanceAlerts: 2,
    fleetUtilization: utilizationRate
  } : {
    avgTripTime: '24 min',
    peakHoursActive: 12,
    customerRating: 4.7,
    tripsCompleted: totalTrips
  };

  const stats = fleetMode === 'rental' ? [
    {
      title: t.activeRentals,
      value: activeDrivers,
      total: drivers.length,
      icon: Car,
      color: 'emerald',
      change: '+2 this month',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: t.monthlyRevenue,
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      change: '+18% vs last month',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: t.contractsExpiring,
      value: modeSpecificData.contractsExpiring,
      icon: Calendar,
      color: 'yellow',
      change: 'Next 30 days',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: t.vehicleUtilization,
      value: `${modeSpecificData.fleetUtilization.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'emerald',
      change: 'Excellent rate',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: t.avgRentalDuration,
      value: modeSpecificData.avgRentalDuration,
      icon: Clock,
      color: 'blue',
      change: 'Stable trend',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: t.pendingFines,
      value: pendingFines,
      icon: AlertTriangle,
      color: pendingFines > 0 ? 'red' : 'emerald',
      change: pendingFines > 0 ? 'Attention needed' : 'All clear',
      bgColor: pendingFines > 0 ? 'bg-red-50' : 'bg-emerald-50',
      textColor: pendingFines > 0 ? 'text-red-700' : 'text-emerald-700'
    }
  ] : [
    {
      title: t.driversOnDuty,
      value: activeDrivers,
      total: drivers.length,
      icon: Users,
      color: 'orange',
      change: 'Peak hours',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: t.tripsToday,
      value: modeSpecificData.tripsCompleted,
      icon: Navigation,
      color: 'orange',
      change: '+12% vs yesterday',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: t.dailyRevenue,
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'orange',
      change: '+8% vs yesterday',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: t.avgTripTime,
      value: modeSpecificData.avgTripTime,
      icon: Clock,
      color: 'blue',
      change: 'Optimal efficiency',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: t.peakHoursActive,
      value: modeSpecificData.peakHoursActive,
      icon: MapPin,
      color: 'purple',
      change: 'High demand zones',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: t.pendingFines,
      value: pendingFines,
      icon: AlertTriangle,
      color: pendingFines > 0 ? 'red' : 'orange',
      change: pendingFines > 0 ? 'Attention needed' : 'All clear',
      bgColor: pendingFines > 0 ? 'bg-red-50' : 'bg-orange-50',
      textColor: pendingFines > 0 ? 'text-red-700' : 'text-orange-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                    {stat.total && <span className="text-sm text-gray-500">/{stat.total}</span>}
                  </p>
                </div>
                <p className={`text-xs mt-1 ${
                  stat.change.includes('+') || stat.change.includes('Excellent') || stat.change.includes('Optimal') || stat.change.includes('All clear') ? 
                    fleetMode === 'rental' ? 'text-emerald-600' : 'text-orange-600' : 
                  stat.change.includes('Attention') || stat.change.includes('needed') ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;