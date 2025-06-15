import React, { useState, useEffect } from 'react';
import DriverCard from './DriverCard';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';
import { mockDriversData, mockFinesData } from '../data/mockData';
import { TrendingUp, AlertCircle, Users, DollarSign } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface DashboardProps {
  fleetMode: FleetMode;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ fleetMode, language }) => {
  const [drivers, setDrivers] = useState(mockDriversData);
  const [fines, setFines] = useState(mockFinesData);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const texts = {
    en: {
      welcome: 'Welcome to NavEdge',
      subtitle: `Your AI-powered ${fleetMode} fleet management dashboard`,
      activeDrivers: 'Active Drivers',
      liveTracking: 'Live Fleet Tracking',
      noDrivers: 'No active drivers found',
      realTimeUpdates: 'Real-time Updates',
      fleetOverview: 'Fleet Overview',
      quickStats: 'Quick Statistics',
      alerts: 'System Alerts',
      performance: 'Performance Insights'
    },
    ar: {
      welcome: 'مرحباً بك في نافيدج',
      subtitle: `لوحة تحكم إدارة أسطول ${fleetMode === 'rental' ? 'الإيجار' : 'التاكسي'} المدعومة بالذكاء الاصطناعي`,
      activeDrivers: 'السائقون النشطون',
      liveTracking: 'تتبع الأسطول المباشر',
      noDrivers: 'لا يوجد سائقون نشطون',
      realTimeUpdates: 'التحديثات المباشرة',
      fleetOverview: 'نظرة عامة على الأسطول',
      quickStats: 'إحصائيات سريعة',
      alerts: 'تنبيهات النظام',
      performance: 'رؤى الأداء'
    }
  };

  const t = texts[language];

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => ({
          ...driver,
          earnings: driver.earnings + Math.floor(Math.random() * 50),
          trips: driver.trips + (Math.random() > 0.8 ? 1 : 0),
          location: {
            lat: driver.location.lat + (Math.random() - 0.5) * 0.001,
            lng: driver.location.lng + (Math.random() - 0.5) * 0.001
          }
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
  const pendingFines = fines.filter(f => f.status === 'pending').length;

  // System alerts
  const alerts = [
    ...(pendingFines > 0 ? [{
      type: 'warning' as const,
      message: `${pendingFines} pending fine${pendingFines > 1 ? 's' : ''} require attention`,
      icon: AlertCircle
    }] : []),
    ...(avgPerformance < 85 ? [{
      type: 'info' as const,
      message: 'Fleet performance below target - consider driver training',
      icon: TrendingUp
    }] : []),
    {
      type: 'success' as const,
      message: `${activeDrivers.length} drivers currently active`,
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              <div className="text-blue-100 text-sm">
                {fleetMode === 'taxi' ? 'Today\'s Revenue' : 'Monthly Revenue'}
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-8 h-8" />
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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </label>
      </div>

      {/* Stats Cards */}
      <StatsCards drivers={drivers} fines={fines} fleetMode={fleetMode} language={language} />

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
              <DriverCard key={driver.id} driver={driver} fleetMode={fleetMode} language={language} />
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
        <FleetMap drivers={drivers} language={language} />
      </div>
    </div>
  );
};

export default Dashboard;