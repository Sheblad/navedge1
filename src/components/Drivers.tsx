import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Star, X, Upload, Calendar, User, FileText, Car, DollarSign, MapPin, Camera, Smartphone, Wifi, QrCode, Link } from 'lucide-react';
import DriverProfile from './DriverProfile';
import type { Driver } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface DriversProps {
  fleetMode: FleetMode;
  language: Language;
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
}

interface NewDriverData {
  // Personal Information
  firstName: string;
  lastName: string;
  emiratesId: string;
  dateOfBirth: string;
  nationality: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // License Information
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  
  // Contract Information
  contractType: 'rental' | 'employment';
  vehicleAssignment: string;
  monthlyAmount: string;
  depositAmount: string;
  startDate: string;
  contractDuration: string;
  
  // GPS Tracking Setup
  gpsTrackingMethod: 'mobile_app' | 'gps_device' | 'both';
  mobileAppAccess: boolean;
  gpsDeviceId: string;
  trackingPermissions: {
    realTimeLocation: boolean;
    routeHistory: boolean;
    speedMonitoring: boolean;
    geofenceAlerts: boolean;
  };
  
  // Additional Information
  notes: string;
  photo?: File;
  documents?: File[];
}

const Drivers: React.FC<DriversProps> = ({ fleetMode, language, drivers, onAddDriver }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'offline'>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showGPSSetup, setShowGPSSetup] = useState(false);
  
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    firstName: '',
    lastName: '',
    emiratesId: '',
    dateOfBirth: '',
    nationality: 'UAE',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: 'Light Vehicle',
    contractType: fleetMode === 'rental' ? 'rental' : 'employment',
    vehicleAssignment: '',
    monthlyAmount: '',
    depositAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    contractDuration: '12',
    gpsTrackingMethod: 'mobile_app',
    mobileAppAccess: true,
    gpsDeviceId: '',
    trackingPermissions: {
      realTimeLocation: true,
      routeHistory: true,
      speedMonitoring: true,
      geofenceAlerts: false
    },
    notes: ''
  });

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
      viewProfile: 'View Profile',
      
      // Add Driver Form
      addNewDriver: 'Add New Driver',
      step: 'Step',
      of: 'of',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      licenseInfo: 'License Information',
      contractInfo: 'Contract Information',
      gpsSetup: 'GPS Tracking Setup',
      additionalInfo: 'Additional Information',
      
      // Personal Information
      firstName: 'First Name',
      lastName: 'Last Name',
      emiratesId: 'Emirates ID',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      
      // Contact Information
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      emergencyContact: 'Emergency Contact Name',
      emergencyPhone: 'Emergency Contact Phone',
      
      // License Information
      licenseNumber: 'License Number',
      licenseExpiry: 'License Expiry Date',
      licenseType: 'License Type',
      lightVehicle: 'Light Vehicle',
      heavyVehicle: 'Heavy Vehicle',
      motorcycle: 'Motorcycle',
      
      // Contract Information
      contractType: 'Contract Type',
      rentalAgreement: 'Rental Agreement',
      employmentContract: 'Employment Contract',
      vehicleAssignment: 'Vehicle Assignment',
      monthlyRent: 'Monthly Rent (AED)',
      monthlySalary: 'Monthly Salary (AED)',
      depositAmount: 'Security Deposit (AED)',
      startDate: 'Start Date',
      contractDuration: 'Contract Duration (months)',
      
      // GPS Tracking Setup
      gpsTrackingMethod: 'GPS Tracking Method',
      mobileApp: 'Mobile App Tracking',
      gpsDevice: 'GPS Device',
      bothMethods: 'Mobile App + GPS Device',
      mobileAppDesc: 'Driver uses smartphone for GPS tracking',
      gpsDeviceDesc: 'Hardware GPS device installed in vehicle',
      bothMethodsDesc: 'Dual tracking for maximum accuracy',
      mobileAppAccess: 'Enable Mobile App Access',
      gpsDeviceId: 'GPS Device ID',
      trackingPermissions: 'Tracking Permissions',
      realTimeLocation: 'Real-time Location Tracking',
      routeHistory: 'Route History Recording',
      speedMonitoring: 'Speed Monitoring',
      geofenceAlerts: 'Geofence Alerts',
      generateQRCode: 'Generate QR Code for Mobile App',
      sendAppLink: 'Send App Link via SMS',
      setupGPSDevice: 'Setup GPS Device',
      
      // Additional Information
      notes: 'Additional Notes',
      uploadPhoto: 'Upload Driver Photo',
      uploadDocuments: 'Upload Documents',
      
      // Buttons
      next: 'Next',
      previous: 'Previous',
      cancel: 'Cancel',
      addDriverBtn: 'Add Driver',
      setupGPS: 'Setup GPS Tracking',
      
      // Success
      driverAdded: 'Driver Added Successfully!',
      driverAddedDesc: 'The new driver has been added to your fleet with GPS tracking configured.',
      
      // GPS Setup
      gpsSetupTitle: 'GPS Tracking Setup',
      gpsSetupDesc: 'Configure GPS tracking for the new driver',
      mobileAppSetup: 'Mobile App Setup',
      qrCodeInstructions: 'Driver can scan this QR code to access the mobile tracking app',
      appLinkInstructions: 'Or send the app link directly to their phone',
      gpsDeviceSetup: 'GPS Device Setup',
      deviceIdInstructions: 'Enter the GPS device ID that will be installed in the vehicle',
      trackingPreferences: 'Tracking Preferences',
      permissionsDesc: 'Configure what tracking data will be collected',
      
      // Placeholders
      firstNamePlaceholder: 'Enter first name',
      lastNamePlaceholder: 'Enter last name',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      emailPlaceholder: 'driver@example.com',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'Full address in Dubai, UAE',
      emergencyContactPlaceholder: 'Emergency contact full name',
      emergencyPhonePlaceholder: '+971 55 987 6543',
      licenseNumberPlaceholder: 'License number',
      vehicleAssignmentPlaceholder: 'DXB-A-12345',
      gpsDeviceIdPlaceholder: 'GPS-DEV-001',
      notesPlaceholder: 'Any additional notes about the driver...'
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
      viewProfile: 'عرض الملف الشخصي',
      
      // Add Driver Form
      addNewDriver: 'إضافة سائق جديد',
      step: 'الخطوة',
      of: 'من',
      personalInfo: 'المعلومات الشخصية',
      contactInfo: 'معلومات الاتصال',
      licenseInfo: 'معلومات الرخصة',
      contractInfo: 'معلومات العقد',
      gpsSetup: 'إعداد تتبع GPS',
      additionalInfo: 'معلومات إضافية',
      
      // Personal Information
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      emiratesId: 'الهوية الإماراتية',
      dateOfBirth: 'تاريخ الميلاد',
      nationality: 'الجنسية',
      
      // Contact Information
      email: 'عنوان البريد الإلكتروني',
      phone: 'رقم الهاتف',
      address: 'العنوان',
      emergencyContact: 'اسم جهة الاتصال الطارئة',
      emergencyPhone: 'هاتف جهة الاتصال الطارئة',
      
      // License Information
      licenseNumber: 'رقم الرخصة',
      licenseExpiry: 'تاريخ انتهاء الرخصة',
      licenseType: 'نوع الرخصة',
      lightVehicle: 'مركبة خفيفة',
      heavyVehicle: 'مركبة ثقيلة',
      motorcycle: 'دراجة نارية',
      
      // Contract Information
      contractType: 'نوع العقد',
      rentalAgreement: 'اتفاقية إيجار',
      employmentContract: 'عقد عمل',
      vehicleAssignment: 'تخصيص المركبة',
      monthlyRent: 'الإيجار الشهري (درهم)',
      monthlySalary: 'الراتب الشهري (درهم)',
      depositAmount: 'مبلغ التأمين (درهم)',
      startDate: 'تاريخ البداية',
      contractDuration: 'مدة العقد (أشهر)',
      
      // GPS Tracking Setup
      gpsTrackingMethod: 'طريقة تتبع GPS',
      mobileApp: 'تتبع تطبيق الهاتف المحمول',
      gpsDevice: 'جهاز GPS',
      bothMethods: 'تطبيق الهاتف + جهاز GPS',
      mobileAppDesc: 'السائق يستخدم الهاتف الذكي لتتبع GPS',
      gpsDeviceDesc: 'جهاز GPS مثبت في المركبة',
      bothMethodsDesc: 'تتبع مزدوج لأقصى دقة',
      mobileAppAccess: 'تفعيل الوصول لتطبيق الهاتف',
      gpsDeviceId: 'رقم جهاز GPS',
      trackingPermissions: 'أذونات التتبع',
      realTimeLocation: 'تتبع الموقع المباشر',
      routeHistory: 'تسجيل تاريخ المسار',
      speedMonitoring: 'مراقبة السرعة',
      geofenceAlerts: 'تنبيهات الحدود الجغرافية',
      generateQRCode: 'إنشاء رمز QR لتطبيق الهاتف',
      sendAppLink: 'إرسال رابط التطبيق عبر SMS',
      setupGPSDevice: 'إعداد جهاز GPS',
      
      // Additional Information
      notes: 'ملاحظات إضافية',
      uploadPhoto: 'رفع صورة السائق',
      uploadDocuments: 'رفع المستندات',
      
      // Buttons
      next: 'التالي',
      previous: 'السابق',
      cancel: 'إلغاء',
      addDriverBtn: 'إضافة السائق',
      setupGPS: 'إعداد تتبع GPS',
      
      // Success
      driverAdded: 'تم إضافة السائق بنجاح!',
      driverAddedDesc: 'تم إضافة السائق الجديد إلى أسطولك مع تكوين تتبع GPS.',
      
      // GPS Setup
      gpsSetupTitle: 'إعداد تتبع GPS',
      gpsSetupDesc: 'تكوين تتبع GPS للسائق الجديد',
      mobileAppSetup: 'إعداد تطبيق الهاتف المحمول',
      qrCodeInstructions: 'يمكن للسائق مسح رمز QR هذا للوصول إلى تطبيق التتبع',
      appLinkInstructions: 'أو إرسال رابط التطبيق مباشرة إلى هاتفه',
      gpsDeviceSetup: 'إعداد جهاز GPS',
      deviceIdInstructions: 'أدخل رقم جهاز GPS الذي سيتم تثبيته في المركبة',
      trackingPreferences: 'تفضيلات التتبع',
      permissionsDesc: 'تكوين بيانات التتبع التي سيتم جمعها',
      
      // Placeholders
      firstNamePlaceholder: 'أدخل الاسم الأول',
      lastNamePlaceholder: 'أدخل اسم العائلة',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      emailPlaceholder: 'driver@example.com',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'العنوان الكامل في دبي، الإمارات',
      emergencyContactPlaceholder: 'الاسم الكامل لجهة الاتصال الطارئة',
      emergencyPhonePlaceholder: '+971 55 987 6543',
      licenseNumberPlaceholder: 'رقم الرخصة',
      vehicleAssignmentPlaceholder: 'DXB-A-12345',
      gpsDeviceIdPlaceholder: 'GPS-DEV-001',
      notesPlaceholder: 'أي ملاحظات إضافية حول السائق...'
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

  const handleAddDriver = () => {
    setShowAddDriver(true);
    setCurrentStep(1);
  };

  const handleCloseAddDriver = () => {
    setShowAddDriver(false);
    setCurrentStep(1);
    setShowGPSSetup(false);
    setNewDriverData({
      firstName: '',
      lastName: '',
      emiratesId: '',
      dateOfBirth: '',
      nationality: 'UAE',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseType: 'Light Vehicle',
      contractType: fleetMode === 'rental' ? 'rental' : 'employment',
      vehicleAssignment: '',
      monthlyAmount: '',
      depositAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      contractDuration: '12',
      gpsTrackingMethod: 'mobile_app',
      mobileAppAccess: true,
      gpsDeviceId: '',
      trackingPermissions: {
        realTimeLocation: true,
        routeHistory: true,
        speedMonitoring: true,
        geofenceAlerts: false
      },
      notes: ''
    });
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitDriver = () => {
    // Create new driver object
    const newDriver: Driver = {
      id: Math.max(...drivers.map(d => d.id)) + 1,
      name: `${newDriverData.firstName} ${newDriverData.lastName}`,
      email: newDriverData.email,
      phone: newDriverData.phone,
      avatar: `${newDriverData.firstName[0]}${newDriverData.lastName[0]}`.toUpperCase(),
      trips: 0,
      earnings: 0,
      status: 'active',
      performanceScore: 85,
      joinDate: newDriverData.startDate,
      location: { 
        lat: 25.2048 + (Math.random() - 0.5) * 0.1, 
        lng: 55.2708 + (Math.random() - 0.5) * 0.1 
      },
      vehicleId: newDriverData.vehicleAssignment || undefined
    };

    // Add to drivers list via callback
    onAddDriver(newDriver);
    
    // Show GPS setup if mobile app is enabled
    if (newDriverData.mobileAppAccess) {
      setShowGPSSetup(true);
    } else {
      // Show success and close form
      alert(`${t.driverAdded}\n${t.driverAddedDesc}`);
      handleCloseAddDriver();
    }
  };

  const updateDriverData = (field: keyof NewDriverData, value: any) => {
    setNewDriverData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateQRCode = () => {
    const mobileAppUrl = `${window.location.origin}/mobile.html`;
    // In a real app, you would generate an actual QR code
    alert(`QR Code would be generated for: ${mobileAppUrl}\n\nDriver credentials:\nID: driver${Math.floor(Math.random() * 1000)}\nPassword: ${newDriverData.firstName.toLowerCase()}123`);
  };

  const sendAppLink = () => {
    const mobileAppUrl = `${window.location.origin}/mobile.html`;
    // In a real app, you would send SMS via API
    alert(`SMS would be sent to ${newDriverData.phone}:\n\n"Welcome to NavEdge! Download the driver app: ${mobileAppUrl}\nYour login: driver${Math.floor(Math.random() * 1000)}\nPassword: ${newDriverData.firstName.toLowerCase()}123"`);
  };

  const renderGPSSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t.gpsTrackingMethod}</h4>
        <p className="text-sm text-gray-600 mb-6">Choose how this driver will be tracked</p>
        
        <div className="grid grid-cols-1 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              newDriverData.gpsTrackingMethod === 'mobile_app' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateDriverData('gpsTrackingMethod', 'mobile_app')}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className={`w-6 h-6 ${newDriverData.gpsTrackingMethod === 'mobile_app' ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <h5 className={`font-medium ${newDriverData.gpsTrackingMethod === 'mobile_app' ? 'text-blue-900' : 'text-gray-900'}`}>
                  {t.mobileApp}
                </h5>
                <p className={`text-sm ${newDriverData.gpsTrackingMethod === 'mobile_app' ? 'text-blue-700' : 'text-gray-600'}`}>
                  {t.mobileAppDesc}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              newDriverData.gpsTrackingMethod === 'gps_device' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateDriverData('gpsTrackingMethod', 'gps_device')}
          >
            <div className="flex items-center space-x-3">
              <MapPin className={`w-6 h-6 ${newDriverData.gpsTrackingMethod === 'gps_device' ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <h5 className={`font-medium ${newDriverData.gpsTrackingMethod === 'gps_device' ? 'text-blue-900' : 'text-gray-900'}`}>
                  {t.gpsDevice}
                </h5>
                <p className={`text-sm ${newDriverData.gpsTrackingMethod === 'gps_device' ? 'text-blue-700' : 'text-gray-600'}`}>
                  {t.gpsDeviceDesc}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              newDriverData.gpsTrackingMethod === 'both' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateDriverData('gpsTrackingMethod', 'both')}
          >
            <div className="flex items-center space-x-3">
              <Wifi className={`w-6 h-6 ${newDriverData.gpsTrackingMethod === 'both' ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <h5 className={`font-medium ${newDriverData.gpsTrackingMethod === 'both' ? 'text-blue-900' : 'text-gray-900'}`}>
                  {t.bothMethods}
                </h5>
                <p className={`text-sm ${newDriverData.gpsTrackingMethod === 'both' ? 'text-blue-700' : 'text-gray-600'}`}>
                  {t.bothMethodsDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Setup */}
      {(newDriverData.gpsTrackingMethod === 'mobile_app' || newDriverData.gpsTrackingMethod === 'both') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3">{t.mobileAppSetup}</h5>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newDriverData.mobileAppAccess}
                onChange={(e) => updateDriverData('mobileAppAccess', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-blue-800">{t.mobileAppAccess}</span>
            </label>
            
            {newDriverData.mobileAppAccess && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={generateQRCode}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm">{t.generateQRCode}</span>
                </button>
                <button
                  type="button"
                  onClick={sendAppLink}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">{t.sendAppLink}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GPS Device Setup */}
      {(newDriverData.gpsTrackingMethod === 'gps_device' || newDriverData.gpsTrackingMethod === 'both') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.gpsDeviceId}
          </label>
          <input
            type="text"
            value={newDriverData.gpsDeviceId}
            onChange={(e) => updateDriverData('gpsDeviceId', e.target.value)}
            placeholder={t.gpsDeviceIdPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{t.deviceIdInstructions}</p>
        </div>
      )}

      {/* Tracking Permissions */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">{t.trackingPermissions}</h5>
        <p className="text-sm text-gray-600 mb-4">{t.permissionsDesc}</p>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={newDriverData.trackingPermissions.realTimeLocation}
              onChange={(e) => updateDriverData('trackingPermissions', {
                ...newDriverData.trackingPermissions,
                realTimeLocation: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t.realTimeLocation}</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={newDriverData.trackingPermissions.routeHistory}
              onChange={(e) => updateDriverData('trackingPermissions', {
                ...newDriverData.trackingPermissions,
                routeHistory: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t.routeHistory}</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={newDriverData.trackingPermissions.speedMonitoring}
              onChange={(e) => updateDriverData('trackingPermissions', {
                ...newDriverData.trackingPermissions,
                speedMonitoring: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t.speedMonitoring}</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={newDriverData.trackingPermissions.geofenceAlerts}
              onChange={(e) => updateDriverData('trackingPermissions', {
                ...newDriverData.trackingPermissions,
                geofenceAlerts: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t.geofenceAlerts}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.firstName} *
                </label>
                <input
                  type="text"
                  value={newDriverData.firstName}
                  onChange={(e) => updateDriverData('firstName', e.target.value)}
                  placeholder={t.firstNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.lastName} *
                </label>
                <input
                  type="text"
                  value={newDriverData.lastName}
                  onChange={(e) => updateDriverData('lastName', e.target.value)}
                  placeholder={t.lastNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.emiratesId} *
              </label>
              <input
                type="text"
                value={newDriverData.emiratesId}
                onChange={(e) => updateDriverData('emiratesId', e.target.value)}
                placeholder={t.emiratesIdPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dateOfBirth} *
                </label>
                <input
                  type="date"
                  value={newDriverData.dateOfBirth}
                  onChange={(e) => updateDriverData('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.nationality} *
                </label>
                <select
                  value={newDriverData.nationality}
                  onChange={(e) => updateDriverData('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UAE">UAE</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={newDriverData.email}
                  onChange={(e) => updateDriverData('email', e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  value={newDriverData.phone}
                  onChange={(e) => updateDriverData('phone', e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.address} *
              </label>
              <textarea
                value={newDriverData.address}
                onChange={(e) => updateDriverData('address', e.target.value)}
                placeholder={t.addressPlaceholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.emergencyContact} *
                </label>
                <input
                  type="text"
                  value={newDriverData.emergencyContact}
                  onChange={(e) => updateDriverData('emergencyContact', e.target.value)}
                  placeholder={t.emergencyContactPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.emergencyPhone} *
                </label>
                <input
                  type="tel"
                  value={newDriverData.emergencyPhone}
                  onChange={(e) => updateDriverData('emergencyPhone', e.target.value)}
                  placeholder={t.emergencyPhonePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.licenseNumber} *
                </label>
                <input
                  type="text"
                  value={newDriverData.licenseNumber}
                  onChange={(e) => updateDriverData('licenseNumber', e.target.value)}
                  placeholder={t.licenseNumberPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.licenseExpiry} *
                </label>
                <input
                  type="date"
                  value={newDriverData.licenseExpiry}
                  onChange={(e) => updateDriverData('licenseExpiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.licenseType} *
              </label>
              <select
                value={newDriverData.licenseType}
                onChange={(e) => updateDriverData('licenseType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Light Vehicle">{t.lightVehicle}</option>
                <option value="Heavy Vehicle">{t.heavyVehicle}</option>
                <option value="Motorcycle">{t.motorcycle}</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.contractType} *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    newDriverData.contractType === 'rental' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateDriverData('contractType', 'rental')}
                >
                  <div className="flex items-center space-x-3">
                    <Car className={`w-5 h-5 ${newDriverData.contractType === 'rental' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`font-medium ${newDriverData.contractType === 'rental' ? 'text-blue-900' : 'text-gray-900'}`}>
                      {t.rentalAgreement}
                    </span>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    newDriverData.contractType === 'employment' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateDriverData('contractType', 'employment')}
                >
                  <div className="flex items-center space-x-3">
                    <User className={`w-5 h-5 ${newDriverData.contractType === 'employment' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`font-medium ${newDriverData.contractType === 'employment' ? 'text-blue-900' : 'text-gray-900'}`}>
                      {t.employmentContract}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.vehicleAssignment}
                </label>
                <input
                  type="text"
                  value={newDriverData.vehicleAssignment}
                  onChange={(e) => updateDriverData('vehicleAssignment', e.target.value)}
                  placeholder={t.vehicleAssignmentPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newDriverData.contractType === 'rental' ? t.monthlyRent : t.monthlySalary} *
                </label>
                <input
                  type="number"
                  value={newDriverData.monthlyAmount}
                  onChange={(e) => updateDriverData('monthlyAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            {newDriverData.contractType === 'rental' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.depositAmount} *
                </label>
                <input
                  type="number"
                  value={newDriverData.depositAmount}
                  onChange={(e) => updateDriverData('depositAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.startDate} *
                </label>
                <input
                  type="date"
                  value={newDriverData.startDate}
                  onChange={(e) => updateDriverData('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.contractDuration} *
                </label>
                <select
                  value={newDriverData.contractDuration}
                  onChange={(e) => updateDriverData('contractDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return renderGPSSetupStep();

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                value={newDriverData.notes}
                onChange={(e) => updateDriverData('notes', e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.uploadPhoto}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to upload driver photo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.uploadDocuments}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to upload documents</p>
                <p className="text-xs text-gray-400 mt-1">License, Emirates ID, etc. (PDF, JPG, PNG)</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderGPSSetupModal = () => {
    if (!showGPSSetup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.gpsSetupTitle}</h2>
                <p className="text-gray-600">{t.gpsSetupDesc}</p>
              </div>
              <button
                onClick={() => setShowGPSSetup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Mobile App Setup */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">{t.mobileAppSetup}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 border-blue-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800 mb-3">{t.qrCodeInstructions}</p>
                  <button
                    onClick={generateQRCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.generateQRCode}
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 border-green-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-green-600" />
                  </div>
                  <p className="text-sm text-green-800 mb-3">{t.appLinkInstructions}</p>
                  <button
                    onClick={sendAppLink}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t.sendAppLink}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Mobile App URL:</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm">
                    {window.location.origin}/mobile.html
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/mobile.html`)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Driver Credentials */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver ID:</label>
                  <code className="block px-3 py-2 bg-white border rounded text-sm">
                    driver{Math.floor(Math.random() * 1000)}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                  <code className="block px-3 py-2 bg-white border rounded text-sm">
                    {newDriverData.firstName.toLowerCase()}123
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowGPSSetup(false);
                alert(`${t.driverAdded}\n${t.driverAddedDesc}`);
                handleCloseAddDriver();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddDriverModal = () => {
    if (!showAddDriver) return null;

    const stepTitles = [
      t.personalInfo,
      t.contactInfo,
      t.licenseInfo,
      t.contractInfo,
      t.gpsSetup,
      t.additionalInfo
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.addNewDriver}</h2>
                <p className="text-gray-600">{t.step} {currentStep} {t.of} 6: {stepTitles[currentStep - 1]}</p>
              </div>
              <button
                onClick={handleCloseAddDriver}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 6 && (
                      <div className={`w-8 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={currentStep === 1 ? handleCloseAddDriver : handlePreviousStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? t.cancel : t.previous}
            </button>
            
            <button
              onClick={currentStep === 6 ? handleSubmitDriver : handleNextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === 6 ? t.addDriverBtn : t.next}
            </button>
          </div>
        </div>
      </div>
    );
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
        <button 
          onClick={handleAddDriver}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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

      {/* Add Driver Modal */}
      {renderAddDriverModal()}
      
      {/* GPS Setup Modal */}
      {renderGPSSetupModal()}
    </div>
  );
};

export default Drivers;