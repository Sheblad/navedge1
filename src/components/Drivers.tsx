import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Star, Satellite } from 'lucide-react';
import { Driver } from '../data/mockData';
import DriverProfile from './DriverProfile';
import GPSIntegrationWizard from './GPSIntegrationWizard';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface DriversProps {
  fleetMode: FleetMode;
  language: Language;
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver?: (driver: Driver) => void;
  onRemoveDriver?: (driverId: number) => void;
}

const Drivers: React.FC<DriversProps> = ({ 
  fleetMode, 
  language, 
  drivers, 
  onAddDriver,
  onUpdateDriver,
  onRemoveDriver 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'offline'>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [showGPSWizard, setShowGPSWizard] = useState(false);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);

  const texts = {
    en: {
      title: 'Drivers',
      subtitle: 'Manage your fleet drivers and their performance',
      addDriver: 'Add Driver',
      addGPS: 'Add GPS Trackers',
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
      viewProfile: 'View Profile',
      gpsStatus: 'GPS Status',
      gpsConnected: 'GPS Connected',
      gpsNotConnected: 'No GPS',
      mobileApp: 'Mobile App',
      // Add driver form
      addNewDriver: 'Add New Driver',
      driverName: 'Driver Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      vehicleId: 'Vehicle ID',
      cancel: 'Cancel',
      saveDriver: 'Save Driver',
      driverAdded: 'Driver added successfully!'
    },
    ar: {
      title: 'السائقون',
      subtitle: 'إدارة سائقي الأسطول وأدائهم',
      addDriver: 'إضافة سائق',
      addGPS: 'إضافة أجهزة GPS',
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
      viewProfile: 'عرض الملف الشخصي',
      gpsStatus: 'حالة GPS',
      gpsConnected: 'GPS متصل',
      gpsNotConnected: 'لا يوجد GPS',
      mobileApp: 'تطبيق الهاتف',
      // Add driver form
      addNewDriver: 'إضافة سائق جديد',
      driverName: 'اسم السائق',
      emailAddress: 'عنوان البريد الإلكتروني',
      phoneNumber: 'رقم الهاتف',
      vehicleId: 'رقم المركبة',
      cancel: 'إلغاء',
      saveDriver: 'حفظ السائق',
      driverAdded: 'تم إضافة السائق بنجاح!'
    },
    hi: {
      title: 'ड्राइवर',
      subtitle: 'अपने फ्लीट ड्राइवरों और उनके प्रदर्शन का प्रबंधन करें',
      addDriver: 'ड्राइवर जोड़ें',
      addGPS: 'GPS ट्रैकर जोड़ें',
      searchPlaceholder: 'ड्राइवर खोजें...',
      filter: 'फ़िल्टर',
      driver: 'ड्राइवर',
      contact: 'संपर्क',
      status: 'स्थिति',
      totalTrips: fleetMode === 'taxi' ? 'कुल यात्राएं' : 'सक्रिय किराए',
      earnings: 'कमाई',
      performance: 'प्रदर्शन',
      actions: 'कार्रवाई',
      active: 'सक्रिय',
      offline: 'ऑफ़लाइन',
      all: 'सभी',
      joined: 'शामिल हुए',
      noDrivers: 'कोई ड्राइवर नहीं मिला',
      rating: 'रेटिंग',
      viewProfile: 'प्रोफ़ाइल देखें',
      gpsStatus: 'GPS स्थिति',
      gpsConnected: 'GPS कनेक्टेड',
      gpsNotConnected: 'कोई GPS नहीं',
      mobileApp: 'मोबाइल ऐप',
      // Add driver form
      addNewDriver: 'नया ड्राइवर जोड़ें',
      driverName: 'ड्राइवर का नाम',
      emailAddress: 'ईमेल पता',
      phoneNumber: 'फोन नंबर',
      vehicleId: 'वाहन ID',
      cancel: 'रद्द करें',
      saveDriver: 'ड्राइवर सहेजें',
      driverAdded: 'ड्राइवर सफलतापूर्वक जोड़ा गया!'
    },
    ur: {
      title: 'ڈرائیورز',
      subtitle: 'اپنے فلیٹ ڈرائیورز اور ان کی کارکردگی کا انتظام کریں',
      addDriver: 'ڈرائیور شامل کریں',
      addGPS: 'GPS ٹریکرز شامل کریں',
      searchPlaceholder: 'ڈرائیورز تلاش کریں...',
      filter: 'فلٹر',
      driver: 'ڈرائیور',
      contact: 'رابطہ',
      status: 'حالت',
      totalTrips: fleetMode === 'taxi' ? 'کل سفر' : 'فعال کرایے',
      earnings: 'کمائی',
      performance: 'کارکردگی',
      actions: 'اقدامات',
      active: 'فعال',
      offline: 'آف لائن',
      all: 'تمام',
      joined: 'شامل ہوئے',
      noDrivers: 'کوئی ڈرائیور نہیں ملا',
      rating: 'ریٹنگ',
      viewProfile: 'پروفائل دیکھیں',
      gpsStatus: 'GPS حالت',
      gpsConnected: 'GPS جڑا ہوا',
      gpsNotConnected: 'کوئی GPS نہیں',
      mobileApp: 'موبائل ایپ',
      // Add driver form
      addNewDriver: 'نیا ڈرائیور شامل کریں',
      driverName: 'ڈرائیور کا نام',
      emailAddress: 'ای میل ایڈریس',
      phoneNumber: 'فون نمبر',
      vehicleId: 'گاڑی ID',
      cancel: 'منسوخ کریں',
      saveDriver: 'ڈرائیور محفوظ کریں',
      driverAdded: 'ڈرائیور کامیابی سے شامل کر دیا گیا!'
    }
  };

  const t = texts[language];

  const filteredDrivers = drivers.filter(driver => {
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

  const handleAddNewDriver = (formData: any) => {
    const newDriver: Driver = {
      id: Math.max(...drivers.map(d => d.id), 0) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      trips: 0,
      earnings: 0,
      status: 'active',
      performanceScore: 85,
      joinDate: new Date().toISOString().split('T')[0],
      location: { lat: 25.2048, lng: 55.2708 }, // Default Dubai location
      vehicleId: formData.vehicleId || undefined
    };

    onAddDriver(newDriver);
    setShowAddDriverForm(false);
    
    // Show success message
    alert(t.driverAdded);
  };

  const renderAddDriverForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t.addNewDriver}</h2>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleAddNewDriver({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            vehicleId: formData.get('vehicleId')
          });
        }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.driverName}</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter driver name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailAddress}</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="driver@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneNumber}</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+971 50 123 4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.vehicleId}</label>
            <input
              type="text"
              name="vehicleId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="DXB-A-12345 (optional)"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDriverForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.saveDriver}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowGPSWizard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Satellite className="w-4 h-4" />
            <span>{t.addGPS}</span>
          </button>
          <button 
            onClick={() => setShowAddDriverForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addDriver}</span>
          </button>
        </div>
      </div>

      {/* GPS Integration Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Satellite className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">🛰️ GPS Tracking Available</h4>
            <p className="text-green-800 text-sm mb-3">
              Add hardware GPS trackers to your fleet for 24/7 monitoring. Works alongside mobile app tracking for complete coverage.
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-700">
              <span>📱 Mobile App GPS (Free)</span>
              <span>🛰️ Hardware GPS (Professional)</span>
              <span>🔄 Automatic Failover</span>
              <span>📍 Real-time Updates</span>
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.gpsStatus}</th>
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
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {/* Simulate GPS status - some drivers have GPS, some don't */}
                        {driver.id <= 2 ? (
                          <div className="flex items-center space-x-1">
                            <Satellite className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">{t.gpsConnected}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs">📱</span>
                            </div>
                            <span className="text-xs text-blue-600 font-medium">{t.mobileApp}</span>
                          </div>
                        )}
                      </div>
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
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    {t.noDrivers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Form Modal */}
      {showAddDriverForm && renderAddDriverForm()}

      {/* GPS Integration Wizard */}
      {showGPSWizard && (
        <GPSIntegrationWizard />
      )}
    </div>
  );
};

export default Drivers;