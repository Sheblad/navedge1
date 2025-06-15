import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Calendar, DollarSign, Upload, Eye } from 'lucide-react';
import { mockContractsData, mockDriversData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface ContractsProps {
  fleetMode: FleetMode;
  language: Language;
}

const Contracts: React.FC<ContractsProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  const [showContractForm, setShowContractForm] = useState(false);

  const texts = {
    en: {
      title: fleetMode === 'rental' ? 'Contracts' : 'Shifts Management',
      subtitle: fleetMode === 'rental' ? 'Manage rental contracts and terms' : 'Manage driver shifts and schedules',
      newContract: fleetMode === 'rental' ? 'New Contract' : 'New Shift',
      searchPlaceholder: fleetMode === 'rental' ? 'Search contracts...' : 'Search shifts...',
      activeContracts: fleetMode === 'rental' ? 'Active Contracts' : 'Active Shifts',
      expiringSoon: 'Expiring Soon',
      monthlyRevenue: fleetMode === 'rental' ? 'Monthly Revenue' : 'Shift Revenue',
      contractId: fleetMode === 'rental' ? 'Contract ID' : 'Shift ID',
      driver: 'Driver',
      vehicle: 'Vehicle',
      duration: 'Duration',
      amount: fleetMode === 'rental' ? 'Monthly Rent' : 'Shift Rate',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      expired: 'Expired',
      terminated: 'Terminated',
      all: 'All',
      viewContract: 'View Contract',
      generateContract: 'Generate Contract',
      uploadId: 'Upload Emirates ID',
      ocrProcessing: 'OCR Processing...'
    },
    ar: {
      title: fleetMode === 'rental' ? 'العقود' : 'إدارة المناوبات',
      subtitle: fleetMode === 'rental' ? 'إدارة عقود الإيجار والشروط' : 'إدارة مناوبات السائقين والجداول',
      newContract: fleetMode === 'rental' ? 'عقد جديد' : 'مناوبة جديدة',
      searchPlaceholder: fleetMode === 'rental' ? 'البحث في العقود...' : 'البحث في المناوبات...',
      activeContracts: fleetMode === 'rental' ? 'العقود النشطة' : 'المناوبات النشطة',
      expiringSoon: 'تنتهي قريباً',
      monthlyRevenue: fleetMode === 'rental' ? 'الإيرادات الشهرية' : 'إيرادات المناوبة',
      contractId: fleetMode === 'rental' ? 'رقم العقد' : 'رقم المناوبة',
      driver: 'السائق',
      vehicle: 'المركبة',
      duration: 'المدة',
      amount: fleetMode === 'rental' ? 'الإيجار الشهري' : 'معدل المناوبة',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      expired: 'منتهي',
      terminated: 'منهي',
      all: 'الكل',
      viewContract: 'عرض العقد',
      generateContract: 'إنشاء عقد',
      uploadId: 'رفع الهوية الإماراتية',
      ocrProcessing: 'معالجة OCR...'
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

  const handleContractGeneration = () => {
    // This would integrate with jsPDF and OCR processing
    alert('Contract generation with OCR would be implemented here');
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
              onClick={handleContractGeneration}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{t.generateContract}</span>
            </button>
          )}
          <button 
            onClick={() => setShowContractForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newContract}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.activeContracts}</p>
              <p className="text-2xl font-semibold text-gray-900">{activeContracts}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.expiringSoon}</p>
              <p className="text-2xl font-semibold text-gray-900">{expiringContracts}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.monthlyRevenue}</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${monthlyRevenue.toLocaleString()}
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">{contract.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{getDriverName(contract.driverId)}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{contract.vehicleId}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{contract.startDate}</div>
                    <div className="text-sm text-gray-500">to {contract.endDate}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      ${contract.monthlyRent.toLocaleString()}/mo
                    </div>
                    {fleetMode === 'rental' && (
                      <div className="text-sm text-gray-500">
                        Deposit: ${contract.depositAmount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contract.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : contract.status === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t[contract.status as keyof typeof t] || contract.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
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

export default Contracts;