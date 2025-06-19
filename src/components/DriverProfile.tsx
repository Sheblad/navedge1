import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  Star,
  Edit,
  Download,
  Plus,
  Eye,
  Trash2,
  Navigation
} from 'lucide-react';
import { Driver, mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import EarningsTracker from './EarningsTracker';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface DriverProfileProps {
  driverId: number;
  fleetMode: FleetMode;
  language: Language;
  onClose: () => void;
}

const DriverProfile: React.FC<DriverProfileProps> = ({ driverId, fleetMode, language, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'fines' | 'contracts' | 'trips' | 'notes' | 'earnings'>('overview');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const texts = {
    en: {
      back: 'Back to Dashboard',
      overview: 'Overview',
      performance: 'Performance',
      fines: 'Fines',
      contracts: fleetMode === 'rental' ? 'Contracts' : 'Shifts',
      trips: 'Trip History',
      notes: 'Notes & Warnings',
      earnings: 'Earnings',
      driverInfo: 'Driver Information',
      assignedVehicle: 'Assigned Vehicle',
      performanceSummary: 'Performance Summary',
      fineHistory: 'Fine History',
      contractHistory: fleetMode === 'rental' ? 'Contract History' : 'Shift History',
      tripHistory: 'Recent Trips',
      warningsNotes: 'Warnings & Notes',
      currentLocation: 'Current Location',
      exportProfile: 'Export Profile',
      addNote: 'Add Note',
      editDriver: 'Edit Driver',
      status: 'Status',
      joinDate: 'Join Date',
      phone: 'Phone',
      email: 'Email',
      emiratesId: 'Emirates ID',
      driverType: 'Driver Type',
      online: 'Online',
      offline: 'Offline',
      active: 'Active',
      inactive: 'Inactive',
      vehicleAssigned: 'Vehicle Assigned',
      assignmentDate: 'Assignment Date',
      kmDriven: 'KM Driven',
      viewVehicle: 'View Vehicle Details',
      totalTrips: fleetMode === 'taxi' ? 'Total Trips' : 'Active Rentals',
      earningsToday: fleetMode === 'taxi' ? 'Earnings Today' : 'Monthly Earnings',
      earningsWeek: 'This Week',
      earningsMonth: 'This Month',
      performanceScore: 'Performance Score',
      rating: 'Customer Rating',
      last7Days: 'Last 7 Days Performance',
      earningsTrend: 'Earnings Trend',
      noFines: 'No fines recorded',
      noPendingFines: 'No pending fines',
      totalFines: 'Total Fines',
      pendingAmount: 'Pending Amount',
      paidAmount: 'Paid Amount',
      fineDate: 'Date',
      violation: 'Violation',
      amount: 'Amount',
      fineStatus: 'Status',
      location: 'Location',
      pending: 'Pending',
      paid: 'Paid',
      deducted: 'Deducted',
      noContracts: fleetMode === 'rental' ? 'No contracts found' : 'No shifts assigned',
      contractId: fleetMode === 'rental' ? 'Contract ID' : 'Shift ID',
      startDate: 'Start Date',
      endDate: 'End Date',
      monthlyRent: fleetMode === 'rental' ? 'Monthly Rent' : 'Shift Rate',
      deposit: 'Deposit',
      contractStatus: 'Status',
      viewContract: fleetMode === 'rental' ? 'View Contract' : 'View Shift',
      downloadContract: 'Download PDF',
      noTrips: 'No trips recorded',
      tripDate: 'Date',
      route: 'Route',
      distance: 'Distance',
      duration: 'Duration',
      earnings: 'Earnings',
      tripStatus: 'Status',
      completed: 'Completed',
      cancelled: 'Cancelled',
      noNotes: 'No notes or warnings',
      addNewNote: 'Add New Note',
      noteDate: 'Date',
      noteType: 'Type',
      noteContent: 'Content',
      warning: 'Warning',
      info: 'Info',
      reminder: 'Reminder',
      saveNote: 'Save Note',
      cancel: 'Cancel',
      lastUpdate: 'Last Update',
      liveTracking: 'Live Tracking',
      exportPDF: 'Export as PDF'
    },
    ar: {
      back: 'العودة إلى لوحة التحكم',
      overview: 'نظرة عامة',
      performance: 'الأداء',
      fines: 'المخالفات',
      contracts: fleetMode === 'rental' ? 'العقود' : 'المناوبات',
      trips: 'تاريخ الرحلات',
      notes: 'الملاحظات والتحذيرات',
      earnings: 'الأرباح',
      driverInfo: 'معلومات السائق',
      assignedVehicle: 'المركبة المخصصة',
      performanceSummary: 'ملخص الأداء',
      fineHistory: 'تاريخ المخالفات',
      contractHistory: fleetMode === 'rental' ? 'تاريخ العقود' : 'تاريخ المناوبات',
      tripHistory: 'الرحلات الأخيرة',
      warningsNotes: 'التحذيرات والملاحظات',
      currentLocation: 'الموقع الحالي',
      exportProfile: 'تصدير الملف الشخصي',
      addNote: 'إضافة ملاحظة',
      editDriver: 'تعديل السائق',
      status: 'الحالة',
      joinDate: 'تاريخ الانضمام',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      emiratesId: 'الهوية الإماراتية',
      driverType: 'نوع السائق',
      online: 'متصل',
      offline: 'غير متصل',
      active: 'نشط',
      inactive: 'غير نشط',
      vehicleAssigned: 'المركبة المخصصة',
      assignmentDate: 'تاريخ التخصيص',
      kmDriven: 'الكيلومترات المقطوعة',
      viewVehicle: 'عرض تفاصيل المركبة',
      totalTrips: fleetMode === 'taxi' ? 'إجمالي الرحلات' : 'التأجيرات النشطة',
      earningsToday: fleetMode === 'taxi' ? 'أرباح اليوم' : 'الأرباح الشهرية',
      earningsWeek: 'هذا الأسبوع',
      earningsMonth: 'هذا الشهر',
      performanceScore: 'نقاط الأداء',
      rating: 'تقييم العملاء',
      last7Days: 'أداء آخر 7 أيام',
      earningsTrend: 'اتجاه الأرباح',
      noFines: 'لا توجد مخالفات مسجلة',
      noPendingFines: 'لا توجد مخالفات معلقة',
      totalFines: 'إجمالي المخالفات',
      pendingAmount: 'المبلغ المعلق',
      paidAmount: 'المبلغ المدفوع',
      fineDate: 'التاريخ',
      violation: 'المخالفة',
      amount: 'المبلغ',
      fineStatus: 'الحالة',
      location: 'الموقع',
      pending: 'معلق',
      paid: 'مدفوع',
      deducted: 'مخصوم',
      noContracts: fleetMode === 'rental' ? 'لا توجد عقود' : 'لا توجد مناوبات',
      contractId: fleetMode === 'rental' ? 'رقم العقد' : 'رقم المناوبة',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      monthlyRent: fleetMode === 'rental' ? 'الإيجار الشهري' : 'معدل المناوبة',
      deposit: 'التأمين',
      contractStatus: 'الحالة',
      viewContract: fleetMode === 'rental' ? 'عرض العقد' : 'عرض المناوبة',
      downloadContract: 'تحميل PDF',
      noTrips: 'لا توجد رحلات مسجلة',
      tripDate: 'التاريخ',
      route: 'المسار',
      distance: 'المسافة',
      duration: 'المدة',
      earnings: 'الأرباح',
      tripStatus: 'الحالة',
      completed: 'مكتملة',
      cancelled: 'ملغية',
      noNotes: 'لا توجد ملاحظات أو تحذيرات',
      addNewNote: 'إضافة ملاحظة جديدة',
      noteDate: 'التاريخ',
      noteType: 'النوع',
      noteContent: 'المحتوى',
      warning: 'تحذير',
      info: 'معلومات',
      reminder: 'تذكير',
      saveNote: 'حفظ الملاحظة',
      cancel: 'إلغاء',
      lastUpdate: 'آخر تحديث',
      liveTracking: 'التتبع المباشر',
      exportPDF: 'تصدير كـ PDF'
    },
    hi: {
      back: 'डैशबोर्ड पर वापस जाएं',
      overview: 'अवलोकन',
      performance: 'प्रदर्शन',
      fines: 'जुर्माने',
      contracts: fleetMode === 'rental' ? 'अनुबंध' : 'शिफ्ट',
      trips: 'यात्रा इतिहास',
      notes: 'नोट्स और चेतावनियां',
      earnings: 'कमाई',
      driverInfo: 'ड्राइवर जानकारी',
      assignedVehicle: 'आवंटित वाहन',
      performanceSummary: 'प्रदर्शन सारांश',
      fineHistory: 'जुर्माना इतिहास',
      contractHistory: fleetMode === 'rental' ? 'अनुबंध इतिहास' : 'शिफ्ट इतिहास',
      tripHistory: 'हाल की यात्राएं',
      warningsNotes: 'चेतावनियां और नोट्स',
      currentLocation: 'वर्तमान स्थान',
      exportProfile: 'प्रोफाइल निर्यात करें',
      addNote: 'नोट जोड़ें',
      editDriver: 'ड्राइवर संपादित करें',
      status: 'स्थिति',
      joinDate: 'शामिल होने की तिथि',
      phone: 'फोन',
      email: 'ईमेल',
      emiratesId: 'एमिरेट्स आईडी',
      driverType: 'ड्राइवर प्रकार',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      vehicleAssigned: 'वाहन आवंटित',
      assignmentDate: 'आवंटन तिथि',
      kmDriven: 'चलाए गए किलोमीटर',
      viewVehicle: 'वाहन विवरण देखें',
      totalTrips: fleetMode === 'taxi' ? 'कुल यात्राएं' : 'सक्रिय किराए',
      earningsToday: fleetMode === 'taxi' ? 'आज की कमाई' : 'मासिक कमाई',
      earningsWeek: 'इस सप्ताह',
      earningsMonth: 'इस महीने',
      performanceScore: 'प्रदर्शन स्कोर',
      rating: 'ग्राहक रेटिंग',
      last7Days: 'पिछले 7 दिनों का प्रदर्शन',
      earningsTrend: 'कमाई का रुझान',
      noFines: 'कोई जुर्माना दर्ज नहीं',
      noPendingFines: 'कोई लंबित जुर्माना नहीं',
      totalFines: 'कुल जुर्माने',
      pendingAmount: 'लंबित राशि',
      paidAmount: 'भुगतान की गई राशि',
      fineDate: 'तिथि',
      violation: 'उल्लंघन',
      amount: 'राशि',
      fineStatus: 'स्थिति',
      location: 'स्थान',
      pending: 'लंबित',
      paid: 'भुगतान किया',
      deducted: 'कटौती की गई',
      noContracts: fleetMode === 'rental' ? 'कोई अनुबंध नहीं मिला' : 'कोई शिफ्ट आवंटित नहीं',
      contractId: fleetMode === 'rental' ? 'अनुबंध आईडी' : 'शिफ्ट आईडी',
      startDate: 'प्रारंभ तिथि',
      endDate: 'समाप्ति तिथि',
      monthlyRent: fleetMode === 'rental' ? 'मासिक किराया' : 'शिफ्ट दर',
      deposit: 'जमा',
      contractStatus: 'स्थिति',
      viewContract: fleetMode === 'rental' ? 'अनुबंध देखें' : 'शिफ्ट देखें',
      downloadContract: 'PDF डाउनलोड करें',
      noTrips: 'कोई यात्रा दर्ज नहीं',
      tripDate: 'तिथि',
      route: 'मार्ग',
      distance: 'दूरी',
      duration: 'अवधि',
      earnings: 'कमाई',
      tripStatus: 'स्थिति',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
      noNotes: 'कोई नोट या चेतावनी नहीं',
      addNewNote: 'नया नोट जोड़ें',
      noteDate: 'तिथि',
      noteType: 'प्रकार',
      noteContent: 'सामग्री',
      warning: 'चेतावनी',
      info: 'जानकारी',
      reminder: 'अनुस्मारक',
      saveNote: 'नोट सहेजें',
      cancel: 'रद्द करें',
      lastUpdate: 'अंतिम अपडेट',
      liveTracking: 'लाइव ट्रैकिंग',
      exportPDF: 'PDF के रूप में निर्यात करें'
    },
    ur: {
      back: 'ڈیش بورڈ پر واپس جائیں',
      overview: 'جائزہ',
      performance: 'کارکردگی',
      fines: 'جرمانے',
      contracts: fleetMode === 'rental' ? 'کنٹریکٹس' : 'شفٹس',
      trips: 'سفر کی تاریخ',
      notes: 'نوٹس اور وارننگز',
      earnings: 'کمائی',
      driverInfo: 'ڈرائیور کی معلومات',
      assignedVehicle: 'تفویض کردہ گاڑی',
      performanceSummary: 'کارکردگی کا خلاصہ',
      fineHistory: 'جرمانے کی تاریخ',
      contractHistory: fleetMode === 'rental' ? 'کنٹریکٹ کی تاریخ' : 'شفٹ کی تاریخ',
      tripHistory: 'حالیہ سفر',
      warningsNotes: 'وارننگز اور نوٹس',
      currentLocation: 'موجودہ مقام',
      exportProfile: 'پروفائل ایکسپورٹ کریں',
      addNote: 'نوٹ شامل کریں',
      editDriver: 'ڈرائیور میں ترمیم کریں',
      status: 'حالت',
      joinDate: 'شمولیت کی تاریخ',
      phone: 'فون',
      email: 'ای میل',
      emiratesId: 'ایمریٹس آئی ڈی',
      driverType: 'ڈرائیور کی قسم',
      online: 'آن لائن',
      offline: 'آف لائن',
      active: 'فعال',
      inactive: 'غیر فعال',
      vehicleAssigned: 'تفویض کردہ گاڑی',
      assignmentDate: 'تفویض کی تاریخ',
      kmDriven: 'چلائے گئے کلومیٹر',
      viewVehicle: 'گاڑی کی تفصیلات دیکھیں',
      totalTrips: fleetMode === 'taxi' ? 'کل سفر' : 'فعال کرایے',
      earningsToday: fleetMode === 'taxi' ? 'آج کی کمائی' : 'ماہانہ کمائی',
      earningsWeek: 'اس ہفتے',
      earningsMonth: 'اس مہینے',
      performanceScore: 'کارکردگی اسکور',
      rating: 'کسٹمر ریٹنگ',
      last7Days: 'آخری 7 دنوں کی کارکردگی',
      earningsTrend: 'کمائی کا رجحان',
      noFines: 'کوئی جرمانہ درج نہیں',
      noPendingFines: 'کوئی زیر التواء جرمانہ نہیں',
      totalFines: 'کل جرمانے',
      pendingAmount: 'زیر التواء رقم',
      paidAmount: 'ادا شدہ رقم',
      fineDate: 'تاریخ',
      violation: 'خلاف ورزی',
      amount: 'رقم',
      fineStatus: 'حالت',
      location: 'مقام',
      pending: 'زیر التواء',
      paid: 'ادا شدہ',
      deducted: 'کٹوتی',
      noContracts: fleetMode === 'rental' ? 'کوئی کنٹریکٹ نہیں ملا' : 'کوئی شفٹ تفویض نہیں کی گئی',
      contractId: fleetMode === 'rental' ? 'کنٹریکٹ آئی ڈی' : 'شفٹ آئی ڈی',
      startDate: 'شروع کی تاریخ',
      endDate: 'اختتامی تاریخ',
      monthlyRent: fleetMode === 'rental' ? 'ماہانہ کرایہ' : 'شفٹ ریٹ',
      deposit: 'ڈپازٹ',
      contractStatus: 'حالت',
      viewContract: fleetMode === 'rental' ? 'کنٹریکٹ دیکھیں' : 'شفٹ دیکھیں',
      downloadContract: 'PDF ڈاؤنلوڈ کریں',
      noTrips: 'کوئی سفر درج نہیں',
      tripDate: 'تاریخ',
      route: 'راستہ',
      distance: 'فاصلہ',
      duration: 'دورانیہ',
      earnings: 'کمائی',
      tripStatus: 'حالت',
      completed: 'مکمل',
      cancelled: 'منسوخ',
      noNotes: 'کوئی نوٹس یا وارننگز نہیں',
      addNewNote: 'نیا نوٹ شامل کریں',
      noteDate: 'تاریخ',
      noteType: 'قسم',
      noteContent: 'مواد',
      warning: 'وارننگ',
      info: 'معلومات',
      reminder: 'یاد دہانی',
      saveNote: 'نوٹ محفوظ کریں',
      cancel: 'منسوخ کریں',
      lastUpdate: 'آخری اپڈیٹ',
      liveTracking: 'لائیو ٹریکنگ',
      exportPDF: 'PDF کے طور پر ایکسپورٹ کریں'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const foundDriver = mockDriversData.find(d => d.id === driverId);
    setDriver(foundDriver || null);
  }, [driverId]);

  if (!driver) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Driver not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  // Mock data for charts and additional info
  const performanceData = [
    { day: 'Mon', earnings: 180, trips: 8, score: 92 },
    { day: 'Tue', earnings: 220, trips: 10, score: 88 },
    { day: 'Wed', earnings: 195, trips: 9, score: 90 },
    { day: 'Thu', earnings: 240, trips: 11, score: 94 },
    { day: 'Fri', earnings: 280, trips: 13, score: 96 },
    { day: 'Sat', earnings: 320, trips: 15, score: 95 },
    { day: 'Sun', earnings: 260, trips: 12, score: 93 }
  ];

  const driverFines = mockFinesData.filter(fine => fine.driverId === driver.id);
  const driverContracts = mockContractsData.filter(contract => contract.driverId === driver.id);
  
  // Mock trip data
  const mockTrips = [
    { id: 1, date: '2024-01-22', route: 'Dubai Mall → Airport', distance: '25 km', duration: '35 min', earnings: 45, status: 'completed' },
    { id: 2, date: '2024-01-22', route: 'Marina → Downtown', distance: '18 km', duration: '28 min', earnings: 38, status: 'completed' },
    { id: 3, date: '2024-01-21', route: 'JBR → DIFC', distance: '22 km', duration: '32 min', earnings: 42, status: 'completed' },
    { id: 4, date: '2024-01-21', route: 'Deira → Jumeirah', distance: '30 km', duration: '45 min', earnings: 55, status: 'completed' },
    { id: 5, date: '2024-01-20', route: 'Business Bay → Mall of Emirates', distance: '15 km', duration: '25 min', earnings: 32, status: 'cancelled' }
  ];

  // Mock notes data
  const mockNotes = [
    { id: 1, date: '2024-01-20', type: 'warning', content: 'Received customer complaint about late arrival. Advised to improve punctuality.' },
    { id: 2, date: '2024-01-15', type: 'info', content: 'Completed defensive driving course. Certificate on file.' },
    { id: 3, date: '2024-01-10', type: 'reminder', content: 'License renewal due in 3 months. Send reminder notification.' }
  ];

  const tabs = [
    { id: 'overview', label: t.overview, icon: Eye },
    { id: 'earnings', label: t.earnings, icon: DollarSign },
    { id: 'performance', label: t.performance, icon: TrendingUp },
    { id: 'fines', label: t.fines, icon: AlertTriangle },
    { id: 'contracts', label: t.contracts, icon: FileText },
    { id: 'trips', label: t.trips, icon: Navigation },
    { id: 'notes', label: t.notes, icon: Edit }
  ];

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would save to backend
      console.log('Adding note:', newNote);
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const exportProfile = () => {
    // In real app, this would generate a comprehensive PDF report
    alert('Profile export functionality would be implemented here');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Driver Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t.driverInfo}</h3>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="w-4 h-4" />
            <span>{t.editDriver}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{driver.avatar}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{driver.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {driver.status === 'active' ? t.online : t.offline}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{t.phone}:</span>
              <span className="font-medium">{driver.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{t.email}:</span>
              <span className="font-medium">{driver.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{t.joinDate}:</span>
              <span className="font-medium">{driver.joinDate}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{t.emiratesId}:</span>
              <span className="font-medium">784-1990-*******</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{t.driverType}:</span>
              <span className="font-medium capitalize">{fleetMode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Assignment */}
      {driver.vehicleId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.assignedVehicle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">{t.vehicleAssigned}</p>
              <p className="font-semibold text-gray-900">{driver.vehicleId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.assignmentDate}</p>
              <p className="font-semibold text-gray-900">2024-01-15</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.kmDriven}</p>
              <p className="font-semibold text-gray-900">12,450 km</p>
            </div>
          </div>
          <button className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Eye className="w-4 h-4" />
            <span>{t.viewVehicle}</span>
          </button>
        </div>
      )}

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalTrips}</p>
              <p className="text-2xl font-semibold text-gray-900">{driver.trips}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Navigation className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.earningsToday}</p>
              <p className="text-2xl font-semibold text-gray-900">${driver.earnings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.performanceScore}</p>
              <p className="text-2xl font-semibold text-gray-900">{driver.performanceScore}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.rating}</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-semibold text-gray-900">{(driver.performanceScore / 20).toFixed(1)}</p>
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.currentLocation}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{t.lastUpdate}: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>Dubai Marina, UAE</span>
          <span className="text-gray-500">•</span>
          <span className="text-green-600">{t.liveTracking}</span>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.last7Days}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Performance Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.earningsTrend}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="earnings" fill="#10b981" name="Earnings ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderFines = () => (
    <div className="space-y-6">
      {/* Fines Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalFines}</p>
              <p className="text-2xl font-semibold text-gray-900">{driverFines.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.pendingAmount}</p>
              <p className="text-2xl font-semibold text-gray-900">
                AED {driverFines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.paidAmount}</p>
              <p className="text-2xl font-semibold text-gray-900">
                AED {driverFines.filter(f => f.status !== 'pending').reduce((sum, f) => sum + f.amount, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t.fineHistory}</h3>
        </div>
        {driverFines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.fineDate}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.violation}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.amount}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.location}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.fineStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {driverFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {new Date(fine.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{fine.violation}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">AED {fine.amount}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{fine.location || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fine.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        fine.status === 'paid' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {t[fine.status as keyof typeof t] || fine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>{t.noFines}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t.contractHistory}</h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>New {fleetMode === 'rental' ? 'Contract' : 'Shift'}</span>
          </button>
        </div>
        {driverContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.contractId}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.startDate}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.endDate}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.monthlyRent}</th>
                  {fleetMode === 'rental' && (
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t.deposit}</th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.contractStatus}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {driverContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-blue-600">{contract.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{contract.startDate}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{contract.endDate}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      AED {contract.monthlyRent.toLocaleString()}
                    </td>
                    {fleetMode === 'rental' && (
                      <td className="py-4 px-4 text-sm text-gray-900">
                        AED {contract.depositAmount.toLocaleString()}
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>{t.noContracts}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t.tripHistory}</h3>
        </div>
        {mockTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.tripDate}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.route}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.distance}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.duration}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.earnings}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.tripStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">{trip.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{trip.route}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{trip.distance}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{trip.duration}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">${trip.earnings}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trip.status === 'completed' ? t.completed : t.cancelled}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>{t.noTrips}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t.warningsNotes}</h3>
          <button 
            onClick={() => setShowAddNote(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNote}</span>
          </button>
        </div>

        {showAddNote && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="info">{t.info}</option>
                  <option value="warning">{t.warning}</option>
                  <option value="reminder">{t.reminder}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Content</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your note here..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t.saveNote}
                </button>
                <button
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {mockNotes.length > 0 ? (
            <div className="space-y-4">
              {mockNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        note.type === 'warning' ? 'bg-red-100 text-red-800' :
                        note.type === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t[note.type as keyof typeof t] || note.type}
                      </span>
                      <span className="text-sm text-gray-500">{note.date}</span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>{t.noNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <EarningsTracker 
      driver={driver}
      drivers={mockDriversData}
      fleetMode={fleetMode}
      language={language}
    />
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t.back}</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{driver.avatar}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{driver.name}</h1>
                  <p className="text-sm text-gray-500">{driver.vehicleId || 'No vehicle assigned'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={exportProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportPDF}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'fines' && renderFines()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'trips' && renderTrips()}
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'earnings' && renderEarnings()}
      </div>
    </div>
  );
};

export default DriverProfile;
```