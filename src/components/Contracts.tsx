import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Calendar, DollarSign, Upload, Eye, Edit, Trash2 } from 'lucide-react';
import { mockContractsData, mockDriversData } from '../data/mockData';
import ContractGenerator from './ContractGenerator';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface ContractsProps {
  fleetMode: FleetMode;
  language: Language;
}

const Contracts: React.FC<ContractsProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  const [showContractGenerator, setShowContractGenerator] = useState(false);

  const texts = {
    en: {
      title: fleetMode === 'rental' ? 'Rental Contracts' : 'Driver Shifts',
      subtitle: fleetMode === 'rental' ? 'Manage rental contracts with OCR and automated generation' : 'Manage driver shifts and schedules',
      newContract: fleetMode === 'rental' ? 'New Contract' : 'New Shift',
      generateWithOCR: 'Generate with OCR',
      searchPlaceholder: fleetMode === 'rental' ? 'Search contracts...' : 'Search shifts...',
      activeContracts: fleetMode === 'rental' ? 'Active Contracts' : 'Active Shifts',
      expiringSoon: 'Expiring Soon',
      monthlyRevenue: fleetMode === 'rental' ? 'Monthly Revenue' : 'Shift Revenue',
      contractId: fleetMode === 'rental' ? 'Contract ID' : 'Shift ID',
      driver: 'Driver',
      vehicle: 'Vehicle',
      duration: 'Duration',
      amount: fleetMode === 'rental' ? 'Monthly Rent' : 'Shift Rate',
      deposit: 'Deposit',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      expired: 'Expired',
      terminated: 'Terminated',
      all: 'All',
      viewContract: 'View Contract',
      editContract: 'Edit Contract',
      terminateContract: 'Terminate Contract',
      downloadPDF: 'Download PDF'
    },
    ar: {
      title: fleetMode === 'rental' ? 'عقود الإيجار' : 'مناوبات السائقين',
      subtitle: fleetMode === 'rental' ? 'إدارة عقود الإيجار مع OCR والإنشاء التلقائي' : 'إدارة مناوبات السائقين والجداول',
      newContract: fleetMode === 'rental' ? 'عقد جديد' : 'مناوبة جديدة',
      generateWithOCR: 'إنشاء مع OCR',
      searchPlaceholder: fleetMode === 'rental' ? 'البحث في العقود...' : 'البحث في المناوبات...',
      activeContracts: fleetMode === 'rental' ? 'العقود النشطة' : 'المناوبات النشطة',
      expiringSoon: 'تنتهي قريباً',
      monthlyRevenue: fleetMode === 'rental' ? 'الإيرادات الشهرية' : 'إيرادات المناوبة',
      contractId: fleetMode === 'rental' ? 'رقم العقد' : 'رقم المناوبة',
      driver: 'السائق',
      vehicle: 'المركبة',
      duration: 'المدة',
      amount: fleetMode === 'rental' ? 'الإيجار الشهري' : 'معدل المناوبة',
      deposit: 'التأمين',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      expired: 'منتهي',
      terminated: 'منهي',
      all: 'الكل',
      viewContract: 'عرض العقد',
      editContract: 'تعديل العقد',
      terminateContract: 'إنهاء العقد',
      downloadPDF: 'تحميل PDF'
    }
  };

  const t = texts[language];

  const getDriverName = (driverId: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const filteredContracts = mockContractsData.filter(contract => {
    const matchesSearch = 
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(contract.driverId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeContracts = mockContractsData.filter(c => c.status === 'active').length;
  const expiringContracts = 2; // Mock data
  const monthlyRevenue = mockContractsData
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyRent, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex space-x-3">
          {fleetMode === 'rental' && (
            <button 
              onClick={() => setShowContractGenerator(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              <span>{t.generateWithOCR}</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>{t.newContract}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.activeContracts}</p>
              <p className="text-2xl font-semibold text-gray-900">{activeContracts}</p>
              <p className="text-xs text-green-600 mt-1">+2 this month</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.expiringSoon}</p>
              <p className="text-2xl font-semibold text-gray-900">{expiringContracts}</p>
              <p className="text-xs text-yellow-600 mt-1">Next 30 days</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.monthlyRevenue}</p>
              <p className="text-2xl font-semibold text-gray-900">
                AED {monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">+15% vs last month</p>
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
          <option value="expired">{t.expired}</option>
          <option value="terminated">{t.terminated}</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.contractId}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.vehicle}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.duration}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.amount}</th>
                {fleetMode === 'rental' && (
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.deposit}</th>
                )}
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">{contract.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {getDriverName(contract.driverId).split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{getDriverName(contract.driverId)}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-mono">{contract.vehicleId}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{contract.startDate}</div>
                    <div className="text-sm text-gray-500">to {contract.endDate}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      AED {contract.monthlyRent.toLocaleString()}/mo
                    </div>
                  </td>
                  {fleetMode === 'rental' && (
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        AED {contract.depositAmount.toLocaleString()}
                      </div>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                      {t[contract.status as keyof typeof t] || contract.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t.viewContract}
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t.editContract}
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t.downloadPDF}
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                      </button>
                      {contract.status === 'active' && (
                        <button 
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title={t.terminateContract}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Generator Modal */}
      {showContractGenerator && (
        <ContractGenerator 
          language={language}
          onClose={() => setShowContractGenerator(false)}
        />
      )}
    </div>
  );
};

export default Contracts;