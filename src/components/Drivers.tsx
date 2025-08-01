import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Star, Satellite, Upload, Database, AlertTriangle, X } from 'lucide-react';
import { Driver } from '../data/mockData';
import DriverProfile from './DriverProfile';
import GPSIntegrationWizard from './GPSIntegrationWizard';
import AddDriverForm from './AddDriverForm';
import BulkImportDrivers from './BulkImportDrivers';

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
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const texts = {
    en: {
      title: 'Drivers',
      subtitle: 'Manage your fleet drivers and their performance',
      addDriver: 'Add Driver',
      addGPS: 'Add GPS Trackers',
      bulkImport: 'Bulk Import',
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
      importError: 'Import Error',
      tryAgain: 'Try Again',
      removeDrivers: 'Remove 30 Drivers',
      driversRemoved: 'Drivers removed successfully'
    },
    ar: {
      title: 'السائقون',
      subtitle: 'إدارة سائقي الأسطول وأدائهم',
      addDriver: 'إضافة سائق',
      addGPS: 'إضافة أجهزة GPS',
      bulkImport: 'استيراد بالجملة',
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
      importError: 'خطأ في الاستيراد',
      tryAgain: 'حاول مرة أخرى',
      removeDrivers: 'إزالة 30 سائق',
      driversRemoved: 'تمت إزالة السائقين بنجاح'
    },
    hi: {
      title: 'ड्राइवर',
      subtitle: 'अपने फ्लीट ड्राइवरों और उनके प्रदर्शन का प्रबंधन करें',
      addDriver: 'ड्राइवर जोड़ें',
      addGPS: 'GPS ट्रैकर जोड़ें',
      bulkImport: 'बल्क इम्पोर्ट',
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
      importError: 'आयात त्रुटि',
      tryAgain: 'पुनः प्रयास करें',
      removeDrivers: '30 ड्राइवर हटाएं',
      driversRemoved: 'ड्राइवर सफलतापूर्वक हटा दिए गए'
    },
    ur: {
      title: 'ڈرائیورز',
      subtitle: 'اپنے فلیٹ ڈرائیورز اور ان کی کارکردگی کا انتظام کریں',
      addDriver: 'ڈرائیور شامل کریں',
      addGPS: 'GPS ٹریکرز شامل کریں',
      bulkImport: 'بلک امپورٹ',
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
      importError: 'امپورٹ میں خرابی',
      tryAgain: 'دوبارہ کوشش کریں',
      removeDrivers: '30 ڈرائیورز ہٹائیں',
      driversRemoved: 'ڈرائیورز کامیابی سے ہٹا دیئے گئے'
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

  const handleAddNewDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      id: Math.max(...drivers.map(d => d.id), 0) + 1,
      ...driver
    };

    onAddDriver(newDriver);
    setShowAddDriverForm(false);
  };

  const handleBulkImport = (driversToImport: Omit<Driver, 'id'>[]) => {
    try {
      setImportError(null);
      
      // Add IDs to the imported drivers
      const newDrivers = driversToImport.map((driver, index) => ({
        ...driver,
        id: Math.max(...drivers.map(d => d.id), 0) + index + 1
      }));
      
      console.log(`Importing ${newDrivers.length} drivers`);
      
      // Add each driver
      newDrivers.forEach(driver => {
        onAddDriver(driver);
      });
      
      setShowBulkImport(false);
    } catch (error) {
      console.error('Error during bulk import:', error);
      setImportError(error instanceof Error ? error.message : 'Unknown error during import');
    }
  };

  const handleRemoveDrivers = async () => {
    try {
      // Get the useDrivers hook from App.tsx
      const { removeMultipleDrivers } = require('../hooks/useDatabase').useDrivers();
      
      // Remove 30 random drivers
      await removeMultipleDrivers(30);
      
      // Show success message
      alert(t.driversRemoved);
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error removing drivers:', error);
      alert('Error removing drivers: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowBulkImport(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
          >
            <Database className="w-4 h-4" />
            <span>{t.bulkImport}</span>
          </button>
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

      {/* Import Error Alert */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">{t.importError}</h3>
              <p className="text-red-700 text-sm mt-1">{importError}</p>
            </div>
            <button 
              onClick={() => setImportError(null)}
              className="p-1 hover:bg-red-100 rounded-full"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
          <div className="mt-3 ml-8">
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}

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

      {/* Remove Drivers Button */}
      {drivers.length > 20 && (
        <div className="flex justify-end">
          <button
            onClick={handleRemoveDrivers}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t.removeDrivers}
          </button>
        </div>
      )}

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
      {showAddDriverForm && (
        <AddDriverForm 
          onAddDriver={handleAddNewDriver}
          onClose={() => setShowAddDriverForm(false)}
          language={language}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportDrivers
          onImportDrivers={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
          language={language}
        />
      )}

      {/* GPS Integration Wizard */}
      {showGPSWizard && (
        <GPSIntegrationWizard />
      )}
    </div>
  );
};

export default Drivers;