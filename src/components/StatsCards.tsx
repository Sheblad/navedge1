import React from 'react';
import { Users, Car, DollarSign, AlertTriangle } from 'lucide-react';

interface Driver {
  id: number;
  name: string;
  avatar: string;
  trips: number;
  earnings: number;
  status: 'active' | 'offline';
  redFlag: boolean;
  location: { lat: number; lng: number };
}

interface StatsCardsProps {
  drivers: Driver[];
  fleetMode: 'rental' | 'taxi';
}

const StatsCards: React.FC<StatsCardsProps> = ({ drivers, fleetMode }) => {
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = drivers.reduce((sum, d) => sum + d.trips, 0);
  const redFlags = drivers.filter(d => d.redFlag).length;

  const stats = [
    {
      title: 'Active Drivers',
      value: activeDrivers,
      total: drivers.length,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: fleetMode === 'taxi' ? 'Total Trips Today' : 'Active Rentals',
      value: totalTrips,
      icon: Car,
      color: 'green',
      change: '+8%'
    },
    {
      title: fleetMode === 'taxi' ? 'Today\'s Revenue' : 'Monthly Revenue',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      change: '+15%'
    },
    {
      title: 'Alerts',
      value: redFlags,
      icon: AlertTriangle,
      color: 'red',
      change: redFlags > 0 ? 'Attention needed' : 'All clear'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      purple: 'bg-purple-50 text-purple-700',
      red: 'bg-red-50 text-red-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  stat.change.includes('Attention') ? 'text-red-600' : 'text-gray-500'
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