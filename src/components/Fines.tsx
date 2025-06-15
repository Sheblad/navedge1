import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Calendar, DollarSign, FileText } from 'lucide-react';
import { mockFinesData, mockDriversData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface FinesProps {
  fleetMode: FleetMode;
  language: Language;
}

const Fines: React.FC<FinesProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'deducted'>('all');

  const texts = {
    en: {
      title: 'Fines Management',
      subtitle: 'Track and manage traffic violations and penalties',
      totalFines: 'Total Fines',
      pendingFines: 'Pending Fines',
      paidFines: 'Paid Fines',
      searchPlaceholder: 'Search fines...',
      filter: 'Filter',
      fineId: 'Fine ID',
      driver: 'Driver',
      vehicle: 'Vehicle',
      violation: 'Violation',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      pending: 'Pending',
      paid: 'Paid',
      deducted: 'Deducted',
      all: 'All',
      noFines: 'No fines found',
      markPaid: 'Mark as Paid',
      viewDetails: 'View Details'
    },
    ar: {
      title: 'إدارة المخالفات',
      subtitle: 'تتبع وإدارة مخالفات المرور والغرامات',
      totalFines: 'إجمالي المخالفات',
      pendingFines: 'المخالفات المعلقة',
      paidFines: 'المخالفات المدفوعة',
      searchPlaceholder: 'البحث في المخالفات...',
      filter: 'تصفية',
      fineId: 'رقم المخالفة',
      driver: 'السائق',
      vehicle: 'المركبة',
      violation: 'المخالفة',
      amount: 'المبلغ',
      date: 'التاريخ',
      status: 'الحالة',
      actions: 'الإجراءات',
      pending: 'معلق',
      paid: 'مدفوع',
      deducted: 'مخصوم',
      all: 'الكل',
      noFines: 'لا توجد مخالفات',
      markPaid: 'تحديد كمدفوع',
      viewDetails: 'عرض التفاصيل'
    }
  };

  const t = texts[language];

  const getDriverName = (driverId: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const filteredFines = mockFinesData.filter(fine => {
    const matchesSearch = 
      fine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(fine.driverId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.violation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalFines = mockFinesData.length;
  const pendingFines = mockFinesData.filter(f => f.status === 'pending').length;
  const paidFines = mockFinesData.filter(f => f.status === 'paid' || f.status === 'deducted').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'deducted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalFines}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalFines}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.pendingFines}</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingFines}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.paidFines}</p>
              <p className="text-2xl font-semibold text-gray-900">{paidFines}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-700" />
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
          <option value="pending">{t.pending}</option>
          <option value="paid">{t.paid}</option>
          <option value="deducted">{t.deducted}</option>
        </select>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.fineId}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.vehicle}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.violation}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.amount}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.date}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFines.length > 0 ? (
                filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-blue-600">{fine.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{getDriverName(fine.driverId)}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{fine.vehiclePlate}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{fine.violation}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">AED {fine.amount}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {new Date(fine.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fine.status)}`}>
                        {t[fine.status as keyof typeof t] || fine.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    {t.noFines}
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

export default Fines;