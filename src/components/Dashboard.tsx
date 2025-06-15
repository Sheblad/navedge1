import React, { useState, useEffect } from 'react';
import DriverCard from './DriverCard';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';
import { mockDriversData, mockFinesData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface DashboardProps {
  fleetMode: FleetMode;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ fleetMode, language }) => {
  const [drivers, setDrivers] = useState(mockDriversData);
  const [fines, setFines] = useState(mockFinesData);

  const texts = {
    en: {
      activeDrivers: 'Active Drivers',
      liveTracking: 'Live Fleet Tracking',
      noDrivers: 'No active drivers found'
    },
    ar: {
      activeDrivers: 'السائقون النشطون',
      liveTracking: 'تتبع الأسطول المباشر',
      noDrivers: 'لا يوجد سائقون نشطون'
    }
  };

  const t = texts[language];

  // Simulate real-time updates
  useEffect(() => {
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
  }, []);

  const activeDrivers = drivers.filter(d => d.status === 'active');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards drivers={drivers} fines={fines} fleetMode={fleetMode} language={language} />

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