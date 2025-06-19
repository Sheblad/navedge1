import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Calendar, DollarSign, Upload, Eye, Edit, Trash2, Clock, Car, Users, TrendingUp } from 'lucide-react';
import { mockContractsData, mockDriversData } from '../data/mockData';
import ContractGenerator from './ContractGenerator';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

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
      // Rental mode
      rentalTitle: 'Rental Contracts',
      rentalSubtitle: 'Manage rental contracts with OCR and automated generation',
      newContract: 'New Contract',
      generateWithOCR: 'Generate with OCR',
      searchContracts: 'Search contracts...',
      activeContracts: 'Active Contracts',
      monthlyRevenue: 'Monthly Revenue',
      avgContractDuration: 'Avg Contract Duration',
      contractsExpiring: 'Expiring Soon',
      // Taxi mode
      taxiTitle: 'Driver Shifts & Schedules',
      taxiSubtitle: 'Manage driver shifts, schedules and duty rosters',
      newShift: 'New Shift',
      scheduleShift: 'Schedule Shift',
      searchShifts: 'Search shifts...',
      activeShifts: 'Active Shifts',
      dailyRevenue: 'Daily Revenue',
      avgShiftDuration: 'Avg Shift Duration',
      shiftsToday: 'Shifts Today',
      // Common
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
      viewContract: fleetMode === 'rental' ? 'View Contract' : 'View Shift',
      editContract: fleetMode === 'rental' ? 'Edit Contract' : 'Edit Shift',
      terminateContract: fleetMode === 'rental' ? 'Terminate Contract' : 'End Shift',
      downloadPDF: 'Download PDF',
      contractId: fleetMode === 'rental' ? 'Contract ID' : 'Shift ID',
      startTime: 'Start Time',
      endTime: 'End Time',
      shiftType: 'Shift Type',
      dayShift: 'Day Shift',
      nightShift: 'Night Shift',
      peakShift: 'Peak Hours'
    },
    ar: {
      // Rental mode
      rentalTitle: 'عقود الإيجار',
      rentalSubtitle: 'إدارة عقود الإيجار مع OCR والإنشاء التلقائي',
      newContract: 'عقد جديد',
      generateWithOCR: 'إنشاء مع OCR',
      searchContracts: 'البحث في العقود...',
      activeContracts: 'العقود النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      avgContractDuration: 'متوسط مدة العقد',
      contractsExpiring: 'تنتهي قريباً',
      // Taxi mode
      taxiTitle: 'مناوبات السائقين والجداول',
      taxiSubtitle: 'إدارة مناوبات السائقين والجداول وقوائم الخدمة',
      newShift: 'مناوبة جديدة',
      scheduleShift: 'جدولة مناوبة',
      searchShifts: 'البحث في المناوبات...',
      activeShifts: 'المناوبات النشطة',
      dailyRevenue: 'الإيرادات اليومية',
      avgShiftDuration: 'متوسط مدة المناوبة',
      shiftsToday: 'مناوبات اليوم',
      // Common
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
      viewContract: fleetMode === 'rental' ? 'عرض العقد' : 'عرض المناوبة',
      editContract: fleetMode === 'rental' ? 'تعديل العقد' : 'تعديل المناوبة',
      terminateContract: fleetMode === 'rental' ? 'إنهاء العقد' : 'إنهاء المناوبة',
      downloadPDF: 'تحميل PDF',
      contractId: fleetMode === 'rental' ? 'رقم العقد' : 'رقم المناوبة',
      startTime: 'وقت البداية',
      endTime: 'وقت النهاية',
      shiftType: 'نوع المناوبة',
      dayShift: 'مناوبة نهارية',
      nightShift: 'مناوبة ليلية',
      peakShift: 'ساعات الذروة'
    },
    hi: {
      // Rental mode
      rentalTitle: 'किराया अनुबंध',
      rentalSubtitle: 'OCR और स्वचालित जनरेशन के साथ किराया अनुबंधों का प्रबंधन करें',
      newContract: 'नया अनुबंध',
      generateWithOCR: 'OCR के साथ जेनरेट करें',
      searchContracts: 'अनुबंध खोजें...',
      activeContracts: 'सक्रिय अनुबंध',
      monthlyRevenue: 'मासिक राजस्व',
      avgContractDuration: 'औसत अनुबंध अवधि',
      contractsExpiring: 'जल्द समाप्त हो रहे',
      // Taxi mode
      taxiTitle: 'ड्राइवर शिफ्ट और शेड्यूल',
      taxiSubtitle: 'ड्राइवर शिफ्ट, शेड्यूल और ड्यूटी रोस्टर प्रबंधित करें',
      newShift: 'नई शिफ्ट',
      scheduleShift: 'शिफ्ट शेड्यूल करें',
      searchShifts: 'शिफ्ट खोजें...',
      activeShifts: 'सक्रिय शिफ्ट',
      dailyRevenue: 'दैनिक राजस्व',
      avgShiftDuration: 'औसत शिफ्ट अवधि',
      shiftsToday: 'आज की शिफ्ट',
      // Common
      driver: 'ड्राइवर',
      vehicle: 'वाहन',
      duration: 'अवधि',
      amount: fleetMode === 'rental' ? 'मासिक किराया' : 'शिफ्ट दर',
      deposit: 'जमा',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      active: 'सक्रिय',
      expired: 'समाप्त',
      terminated: 'समाप्त किया गया',
      all: 'सभी',
      viewContract: fleetMode === 'rental' ? 'अनुबंध देखें' : 'शिफ्ट देखें',
      editContract: fleetMode === 'rental' ? 'अनुबंध संपादित करें' : 'शिफ्ट संपादित करें',
      terminateContract: fleetMode === 'rental' ? 'अनुबंध समाप्त करें' : 'शिफ्ट समाप्त करें',
      downloadPDF: 'PDF डाउनलोड करें',
      contractId: fleetMode === 'rental' ? 'अनुबंध आईडी' : 'शिफ्ट आईडी',
      startTime: 'प्रारंभ समय',
      endTime: 'समाप्ति समय',
      shiftType: 'शिफ्ट प्रकार',
      dayShift: 'दिन की शिफ्ट',
      nightShift: 'रात की शिफ्ट',
      peakShift: 'पीक ऑवर्स'
    },
    ur: {
      // Rental mode
      rentalTitle: 'کرایہ کنٹریکٹس',
      rentalSubtitle: 'OCR اور آٹومیٹڈ جنریشن کے ساتھ کرایہ کنٹریکٹس کا انتظام کریں',
      newContract: 'نیا کنٹریکٹ',
      generateWithOCR: 'OCR کے ساتھ جنریٹ کریں',
      searchContracts: 'کنٹریکٹس تلاش کریں...',
      activeContracts: 'فعال کنٹریکٹس',
      monthlyRevenue: 'ماہانہ آمدنی',
      avgContractDuration: 'اوسط کنٹریکٹ مدت',
      contractsExpiring: 'جلد ختم ہونے والے',
      // Taxi mode
      taxiTitle: 'ڈرائیور شفٹس اور شیڈول',
      taxiSubtitle: 'ڈرائیور شفٹس، شیڈول اور ڈیوٹی روسٹر کا انتظام کریں',
      newShift: 'نئی شفٹ',
      scheduleShift: 'شفٹ شیڈول کریں',
      searchShifts: 'شفٹس تلاش کریں...',
      activeShifts: 'فعال شفٹس',
      dailyRevenue: 'روزانہ آمدنی',
      avgShiftDuration: 'اوسط شفٹ مدت',
      shiftsToday: 'آج کی شفٹس',
      // Common
      driver: 'ڈرائیور',
      vehicle: 'گاڑی',
      duration: 'مدت',
      amount: fleetMode === 'rental' ? 'ماہانہ کرایہ' : 'شفٹ ریٹ',
      deposit: 'ڈپازٹ',
      status: 'حالت',
      actions: 'اقدامات',
      active: 'فعال',
      expired: 'ختم',
      terminated: 'ختم کردہ',
      all: 'تمام',
      viewContract: fleetMode === 'rental' ? 'کنٹریکٹ دیکھیں' : 'شفٹ دیکھیں',
      editContract: fleetMode === 'rental' ? 'کنٹریکٹ میں ترمیم کریں' : 'شفٹ میں ترمیم کریں',
      terminateContract: fleetMode === 'rental' ? 'کنٹریکٹ ختم کریں' : 'شفٹ ختم کریں',
      downloadPDF: 'PDF ڈاؤنلوڈ کریں',
      contractId: fleetMode === 'rental' ? 'کنٹریکٹ ID' : 'شفٹ ID',
      startTime: 'شروع کا وقت',
      endTime: 'ختم کا وقت',
      shiftType: 'شفٹ کی قسم',
      dayShift: 'دن کی شفٹ',
      nightShift: 'رات کی شفٹ',
      peakShift: 'پیک اوقات'
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

  // Mode-specific stats
  const modeStats = fleetMode === 'rental' ? {
    stat1: { title: t.activeContracts, value: activeContracts, icon: FileText, color: 'emerald' },
    stat2: { title: t.contractsExpiring, value: expiringContracts, icon: Calendar, color: 'yellow' },
    stat3: { title: t.monthlyRevenue, value: `AED ${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
    stat4: { title: t.avgContractDuration, value: '11.2 months', icon: Clock, color: 'blue' }
  } : {
    stat1: { title: t.activeShifts, value: activeContracts, icon: Users, color: 'orange' },
    stat2: { title: t.shiftsToday, value: 24, icon: Clock, color: 'orange' },
    stat3: { title: t.dailyRevenue, value: `AED ${Math.round(monthlyRevenue / 30).toLocaleString()}`, icon: DollarSign, color: 'orange' },
    stat4: { title: t.avgShiftDuration, value: '8.5 hours', icon: TrendingUp, color: 'blue' }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return fleetMode === 'rental' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-700',
      orange: 'bg-orange-50 text-orange-700',
      yellow: 'bg-yellow-50 text-yellow-700',
      blue: 'bg-blue-50 text-blue-700',
      red: 'bg-red-50 text-red-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {fleetMode === 'rental' ? t.rentalTitle : t.taxiTitle}
          </h1>
          <p className="text-gray-600">
            {fleetMode === 'rental' ? t.rentalSubtitle : t.taxiSubtitle}
          </p>
        </div>
        <div className="flex space-x-3">
          {fleetMode === 'rental' && (
            <button 
              onClick={() => setShowContractGenerator(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              <span>{t.generateWithOCR}</span>
            </button>
          )}
          <button className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
            fleetMode === 'taxi' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-transparent hover:from-orange-600 hover:to-yellow-600' : ''
          }`}>
            <Plus className="w-4 h-4" />
            <span>{fleetMode === 'rental' ? t.newContract : t.newShift}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(modeStats).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    fleetMode === 'rental' ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {index === 1 ? (fleetMode === 'rental' ? 'Next 30 days' : 'Peak efficiency') : 
                     index === 2 ? '+15% vs last month' : 'Stable trend'}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={fleetMode === 'rental' ? t.searchContracts : t.searchShifts}
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

      {/* Contracts/Shifts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.contractId}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.vehicle}</th>
                {fleetMode === 'rental' ? (
                  <>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.duration}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.amount}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.deposit}</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.shiftType}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.startTime}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.endTime}</th>
                  </>
                )}
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className={`font-medium ${
                      fleetMode === 'rental' ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {contract.id}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${
                        fleetMode === 'rental' 
                          ? 'from-emerald-600 to-teal-600' 
                          : 'from-orange-500 to-yellow-500'
                      } rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs font-semibold">
                          {getDriverName(contract.driverId).split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{getDriverName(contract.driverId)}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-mono">{contract.vehicleId}</td>
                  {fleetMode === 'rental' ? (
                    <>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{contract.startDate}</div>
                        <div className="text-sm text-gray-500">to {contract.endDate}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          AED {contract.monthlyRent.toLocaleString()}/mo
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          AED {contract.depositAmount.toLocaleString()}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {t.dayShift}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">06:00 AM</td>
                      <td className="py-4 px-4 text-sm text-gray-900">02:00 PM</td>
                    </>
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