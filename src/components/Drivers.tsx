import React from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';

interface DriversProps {
  fleetMode: FleetMode;
}

const Drivers: React.FC<DriversProps> = ({ fleetMode }) => {
  const mockDrivers = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      phone: '+971 50 123 4567',
      status: 'active',
      joinDate: '2024-01-15',
      trips: fleetMode === 'taxi' ? 1250 : 45,
      earnings: 15420,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Mohammed Hassan',
      email: 'mohammed@example.com',
      phone: '+971 55 987 6543',
      status: 'active',
      joinDate: '2023-11-20',
      trips: fleetMode === 'taxi' ? 980 : 32,
      earnings: 12350,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Omar Khalil',
      email: 'omar@example.com',
      phone: '+971 52 456 7890',
      status: 'inactive',
      joinDate: '2024-02-10',
      trips: fleetMode === 'taxi' ? 750 : 28,
      earnings: 9800,
      rating: 4.9
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600">Manage your fleet drivers and their performance</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Driver</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  {fleetMode === 'taxi' ? 'Total Trips' : 'Active Rentals'}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Earnings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">Joined {driver.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{driver.email}</div>
                    <div className="text-sm text-gray-500">{driver.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      driver.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{driver.trips}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">${driver.earnings.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-900">{driver.rating}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Drivers;