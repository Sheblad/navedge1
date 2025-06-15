import React from 'react';
import { Users, Car, DollarSign, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Driver, Fine } from '../data/mockData';

interface StatsCardsProps {
  drivers: Driver[];
  fines: Fine[];
  fleetMode: 'rental' | 'taxi';
  language: 'en' | 'ar';
}

const StatsCards: React.FC<StatsCardsProps> = ({ drivers, fines, fleetMode, language }) => {
  const texts = {
    en: {
      activeDrivers: 'Active Drivers',
      totalTrips: fleetMode === 'taxi' ? 'Total Trips Today' : 'Active Rentals',
      totalRevenue: fleetMode === 'taxi' ? 'Today\'s Revenue' : 'Monthly Revenue',
      pendingFines: 'Pending Fines',
      avgPerformance: 'Avg Performance',
      fleetUtilization: 'Fleet Utilization'
    },
    ar: {
      activeDrivers: 'السائقون النشطون',
      totalTrips: fleetMode === 'taxi' ? 'إجمالي الرحلات اليوم' : 'التأجيرات النشطة',
      totalRevenue: fleetMode === 'taxi' ? 'إيرادات اليوم' : 'الإيرادات الشهرية',
      pendingFines: 'المخالفات المعلقة',
      avgPerformance: 'متوسط الأداء',
      fleetUtilization: 'استخدام الأسطول'
    }
  };

  const t = texts[language];

  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = drivers.reduce((sum, d) => sum + d.trips, 0);
  const pendingFines = fines.filter(f => f.status === 'pending').length;
  const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
  const utilizationRate = (activeDrivers / drivers.length) * 100;

  const stats = [
    {
      title: t.activeDrivers,
      value: activeDrivers,
      total: drivers.length,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: t.totalTrips,
      value: totalTrips,
      icon: Car,
      color: 'green',
      change: '+8%'
    },
    {
      title: t.totalRevenue,
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      change: '+15%'
    },
    {
      title: t.pendingFines,
      value: pendingFines,
      icon: AlertTriangle,
      color: pendingFines > 0 ? 'red' : 'green',
      change: pendingFines > 0 ? 'Attention needed' : 'All clear'
    },
    {
      title: t.avgPerformance,
      value: `${avgPerformance.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'indigo',
      change: '+3%'
    },
    {
      title: t.fleetUtilization,
      value: `${utilizationRate.toFixed(1)}%`,
      icon: Clock,
      color: 'cyan',
      change: '+5%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      purple: 'bg-purple-50 text-purple-700',
      red: 'bg-red-50 text-red-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      cyan: 'bg-cyan-50 text-cyan-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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
                  stat.change.includes('+') ? 'text-green-600' : 
                  stat.change.includes('Attention') || stat.change.includes('needed') ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;