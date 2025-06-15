import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Star } from 'lucide-react';
import { mockDriversData } from '../data/mockData';
import DriverProfile from './DriverProfile';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface DriversProps {
  fleetMode: FleetMode;
  language: Language;
}

const Drivers: React.FC<DriversProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'offline'>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  const texts = {
    en: {
      title: 'Drivers',
      subtitle: 'Manage your fleet drivers and their performance',
      addDriver: 'Add Driver',
      searchPlaceholder: 'Search drivers...',
      filter: 'Filter',
      driver: 'Driver',
      contact: 'Contact',
      status: 'Status',
      totalTrips: fleetMode === 'taxi' ? 'Total Trips' : 'Active Rentals',
      earnings: 'Earnings',
      performance: 'Performance',
      actions: 'Actions',
      active: 'Active',
      offline: 'Offline',
      all: 'All',
      joined: 'Joined',
      noDrivers: 'No drivers found',
      rating: 'Rating',
      viewProfile: 'View Profile'
    },
    ar: {
      title: 'السائقون',
      subtitle: 'إدارة سائقي الأسطول وأدائهم',
      addDriver: 'إضافة سائق',
      searchPlaceholder: 'البحث في السائقين...',
      filter: 'تصفية',
      driver: 'السائق',
      contact: 'الاتصال',
      status: 'الحالة',
      totalTrips: fleetMode === 'taxi' ? 'إجمالي الرحلات' : 'التأجيرات النشطة',
      earnings: 'الأرباح',
      performance: 'الأداء',
      actions: 'الإجراءات',
      active: 'نشط',
      offline: 'غير متصل',
      all: 'الكل',
      joined: 'انضم في',
      noDrivers: 'لا يوجد سائقون',
      rating: 'التقييم',
      viewProfile: 'عرض الملف الشخصي'
    }
  };

  const t = texts[language];

  const filteredDrivers = mockDriversData.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDriverClick = (driverId: number) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>{t.addDriver}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{t.all}</option>
          <option value="active">{t.active}</option>
          <option value="offline">{t.offline}</option>
        </select>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.contact}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.totalTrips}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.earnings}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.performance}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.rating}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr 
                    key={driver.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleDriverClick(driver.id)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{driver.avatar}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 hover:text-blue-600 transition-colors">{driver.name}</div>
                          <div className="text-sm text-gray-500">{t.joined} {driver.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{driver.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{driver.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t[driver.status as keyof typeof t] || driver.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{driver.trips}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">${driver.earnings.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              driver.performanceScore >= 90 ? 'bg-green-500' :
                              driver.performanceScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${driver.performanceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{driver.performanceScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-900">{(driver.performanceScore / 20).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDriverClick(driver.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    {t.noDrivers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Drivers;