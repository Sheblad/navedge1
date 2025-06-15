import React from 'react';
import { Search, Filter, Plus, FileText, Calendar, DollarSign } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';

interface ContractsProps {
  fleetMode: FleetMode;
}

const Contracts: React.FC<ContractsProps> = ({ fleetMode }) => {
  const mockContracts = [
    {
      id: 'CNT-001',
      driverName: 'Ahmed Al-Rashid',
      type: fleetMode === 'taxi' ? 'Commission Agreement' : 'Vehicle Rental',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      amount: fleetMode === 'taxi' ? '25%' : '$1,200/month',
      status: 'active',
      vehicle: 'Toyota Camry 2023'
    },
    {
      id: 'CNT-002',
      driverName: 'Mohammed Hassan',
      type: fleetMode === 'taxi' ? 'Commission Agreement' : 'Vehicle Rental',
      startDate: '2023-11-20',
      endDate: '2024-11-19',
      amount: fleetMode === 'taxi' ? '30%' : '$1,500/month',
      status: 'active',
      vehicle: 'Honda Accord 2022'
    },
    {
      id: 'CNT-003',
      driverName: 'Omar Khalil',
      type: fleetMode === 'taxi' ? 'Commission Agreement' : 'Vehicle Rental',
      startDate: '2024-02-10',
      endDate: '2025-02-09',
      amount: fleetMode === 'taxi' ? '25%' : '$1,100/month',
      status: 'pending',
      vehicle: 'Nissan Altima 2023'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">
            Manage {fleetMode === 'taxi' ? 'commission agreements' : 'rental contracts'} and terms
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Contract</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contracts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockContracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {fleetMode === 'taxi' ? 'Avg Commission' : 'Monthly Revenue'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {fleetMode === 'taxi' ? '26.7%' : '$3,800'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contract ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Driver</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  {fleetMode === 'taxi' ? 'Commission' : 'Amount'}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">{contract.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{contract.driverName}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{contract.type}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{contract.vehicle}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{contract.startDate}</div>
                    <div className="text-sm text-gray-500">to {contract.endDate}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{contract.amount}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contract.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : contract.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status}
                    </span>
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

export default Contracts;