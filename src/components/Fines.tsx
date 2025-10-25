import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Calendar, DollarSign, FileText, RefreshCw, Loader } from 'lucide-react';
import { mockFinesData, mockDriversData } from '../data/mockData';
import { FastAPIService } from '../services/fastapi';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface FinesProps {
  fleetMode: FleetMode;
  language: Language;
}

const Fines: React.FC<FinesProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'deducted'>('all');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [checking, setChecking] = useState(false);
  const [dubaiFines, setDubaiFines] = useState<any[]>([]);

  const checkDubaiPoliceFines = async () => {
    if (!vehiclePlate.trim()) {
      alert('Please enter a vehicle plate number');
      return;
    }

    setChecking(true);
    try {
      const response = await FastAPIService.checkDubaiPoliceFines(vehiclePlate);
      setDubaiFines(response.fines);
      if (response.fines.length === 0) {
        alert('No fines found for this vehicle');
      }
    } catch (error) {
      console.error('Error checking fines:', error);
      alert('Failed to check fines. Please try again.');
    } finally {
      setChecking(false);
    }
  };

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
      viewDetails: 'View Details',
      checkDubaiPolice: 'Check Dubai Police Fines',
      vehiclePlate: 'Vehicle Plate Number',
      checkFines: 'Check Fines',
      checking: 'Checking...',
      location: 'Location'
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
    },
    hi: {
      title: 'जुर्माना प्रबंधन',
      subtitle: 'ट्रैफिक उल्लंघन और दंड को ट्रैक और प्रबंधित करें',
      totalFines: 'कुल जुर्माने',
      pendingFines: 'लंबित जुर्माने',
      paidFines: 'भुगतान किए गए जुर्माने',
      searchPlaceholder: 'जुर्माने खोजें...',
      filter: 'फ़िल्टर',
      fineId: 'जुर्माना ID',
      driver: 'ड्राइवर',
      vehicle: 'वाहन',
      violation: 'उल्लंघन',
      amount: 'राशि',
      date: 'तारीख',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      pending: 'लंबित',
      paid: 'भुगतान किया',
      deducted: 'कटौती की गई',
      all: 'सभी',
      noFines: 'कोई जुर्माना नहीं मिला',
      markPaid: 'भुगतान के रूप में चिह्नित करें',
      viewDetails: 'विवरण देखें'
    },
    ur: {
      title: 'جرمانہ منیجمنٹ',
      subtitle: 'ٹریفک خلاف ورزیوں اور جرمانوں کو ٹریک اور منظم کریں',
      totalFines: 'کل جرمانے',
      pendingFines: 'زیر التواء جرمانے',
      paidFines: 'ادا شدہ جرمانے',
      searchPlaceholder: 'جرمانے تلاش کریں...',
      filter: 'فلٹر',
      fineId: 'جرمانہ ID',
      driver: 'ڈرائیور',
      vehicle: 'گاڑی',
      violation: 'خلاف ورزی',
      amount: 'رقم',
      date: 'تاریخ',
      status: 'حالت',
      actions: 'اقدامات',
      pending: 'زیر التواء',
      paid: 'ادا شدہ',
      deducted: 'کٹوتی',
      all: 'تمام',
      noFines: 'کوئی جرمانہ نہیں ملا',
      markPaid: 'ادا شدہ کے طور پر نشان زد کریں',
      viewDetails: 'تفصیلات دیکھیں'
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

      {/* Dubai Police Fine Checker */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">{t.checkDubaiPolice}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            placeholder={t.vehiclePlate}
            className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={checkDubaiPoliceFines}
            disabled={checking}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {checking ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{t.checking}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>{t.checkFines}</span>
              </>
            )}
          </button>
        </div>
        {dubaiFines.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Found {dubaiFines.length} fine(s)</p>
            <div className="space-y-2">
              {dubaiFines.map((fine, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{fine.violation}</span>
                  <span className="font-semibold text-red-600">AED {fine.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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