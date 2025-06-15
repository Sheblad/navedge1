import React from 'react';
import DriverCard from './DriverCard';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';

type FleetMode = 'rental' | 'taxi';

interface DashboardProps {
  fleetMode: FleetMode;
}

const Dashboard: React.FC<DashboardProps> = ({ fleetMode }) => {
  const mockDrivers = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      avatar: 'AR',
      trips: fleetMode === 'taxi' ? 24 : 8,
      earnings: fleetMode === 'taxi' ? 1250 : 2400,
      status: 'active',
      redFlag: false,
      location: { lat: 25.2048, lng: 55.2708 }
    },
    {
      id: 2,
      name: 'Mohammed Hassan',
      avatar: 'MH',
      trips: fleetMode === 'taxi' ? 18 : 12,
      earnings: fleetMode === 'taxi' ? 980 : 3200,
      status: 'active',
      redFlag: true,
      location: { lat: 25.1972, lng: 55.2744 }
    },
    {
      id: 3,
      name: 'Omar Khalil',
      avatar: 'OK',
      trips: fleetMode === 'taxi' ? 31 : 6,
      earnings: fleetMode === 'taxi' ? 1680 : 1800,
      status: 'active',
      redFlag: false,
      location: { lat: 25.2084, lng: 55.2719 }
    },
    {
      id: 4,
      name: 'Yusuf Ahmad',
      avatar: 'YA',
      trips: fleetMode === 'taxi' ? 15 : 9,
      earnings: fleetMode === 'taxi' ? 820 : 2700,
      status: 'offline',
      redFlag: false,
      location: { lat: 25.2011, lng: 55.2762 }
    },
    {
      id: 5,
      name: 'Khalid Saeed',
      avatar: 'KS',
      trips: fleetMode === 'taxi' ? 22 : 14,
      earnings: fleetMode === 'taxi' ? 1150 : 3800,
      status: 'active',
      redFlag: false,
      location: { lat: 25.2103, lng: 55.2681 }
    },
    {
      id: 6,
      name: 'Hassan Ali',
      avatar: 'HA',
      trips: fleetMode === 'taxi' ? 19 : 7,
      earnings: fleetMode === 'taxi' ? 1020 : 2100,
      status: 'active',
      redFlag: true,
      location: { lat: 25.1995, lng: 55.2790 }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards drivers={mockDrivers} fleetMode={fleetMode} />

      {/* Driver Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Drivers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDrivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} fleetMode={fleetMode} />
          ))}
        </div>
      </div>

      {/* Fleet Map */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Fleet Tracking</h2>
        <FleetMap drivers={mockDrivers} />
      </div>
    </div>
  );
};

export default Dashboard;