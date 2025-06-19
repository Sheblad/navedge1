import React, { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, Calendar, Clock, FileText, Eye, Edit, Trash2, Download, Upload, Camera, MapPin, Phone, User } from 'lucide-react';
import { mockDriversData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface Incident {
  id: string;
  driverId: number;
  vehicleId: string;
  type: 'crash' | 'breakdown' | 'theft' | 'damage' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  dateTime: string;
  reportedBy: 'driver' | 'admin' | 'automatic';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  photos?: string[];
  witnesses?: string[];
  policeReport?: string;
  insuranceClaim?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface IncidentsProps {
  fleetMode: FleetMode;
  language: Language;
}

const Incidents: React.FC<IncidentsProps> = ({ fleetMode, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'investigating' | 'resolved' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'crash' | 'breakdown' | 'theft' | 'damage' | 'other'>('all');
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const texts = {
    en: {
      title: 'Incident Management',
      subtitle: 'Track and manage fleet incidents, crashes, and safety reports',
      addIncident: 'Report Incident',
      searchPlaceholder: 'Search incidents...',
      totalIncidents: 'Total Incidents',
      activeIncidents: 'Active Cases',
      resolvedIncidents: 'Resolved This Month',
      avgResolutionTime: 'Avg Resolution Time',
      incidentId: 'Incident ID',
      driver: 'Driver',
      vehicle: 'Vehicle',
      type: 'Type',
      severity: 'Severity',
      location: 'Location',
      dateTime: 'Date & Time',
      status: 'Status',
      actions: 'Actions',
      all: 'All',
      reported: 'Reported',
      investigating: 'Investigating',
      resolved: 'Resolved',
      closed: 'Closed',
      crash: 'Crash',
      breakdown: 'Breakdown',
      theft: 'Theft',
      damage: 'Damage',
      other: 'Other',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      viewDetails: 'View Details',
      editIncident: 'Edit Incident',
      deleteIncident: 'Delete Incident',
      exportReport: 'Export Report',
      noIncidents: 'No incidents found'
    },
    ar: {
      title: 'إدارة الحوادث',
      subtitle: 'تتبع وإدارة حوادث الأسطول والتصادمات وتقارير السلامة',
      addIncident: 'الإبلاغ عن حادث',
      searchPlaceholder: 'البحث في الحوادث...',
      totalIncidents: 'إجمالي الحوادث',
      activeIncidents: 'الحالات النشطة',
      resolvedIncidents: 'المحلولة هذا الشهر',
      avgResolutionTime: 'متوسط وقت الحل',
      incidentId: 'رقم الحادث',
      driver: 'السائق',
      vehicle: 'المركبة',
      type: 'النوع',
      severity: 'الخطورة',
      location: 'الموقع',
      dateTime: 'التاريخ والوقت',
      status: 'الحالة',
      actions: 'الإجراءات',
      all: 'الكل',
      reported: 'مبلغ عنه',
      investigating: 'قيد التحقيق',
      resolved: 'محلول',
      closed: 'مغلق',
      crash: 'تصادم',
      breakdown: 'عطل',
      theft: 'سرقة',
      damage: 'ضرر',
      other: 'أخرى',
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      critical: 'حرج',
      viewDetails: 'عرض التفاصيل',
      editIncident: 'تعديل الحادث',
      deleteIncident: 'حذف الحادث',
      exportReport: 'تصدير التقرير',
      noIncidents: 'لا توجد حوادث'
    },
    hi: {
      title: 'घटना प्रबंधन',
      subtitle: 'फ्लीट घटनाओं, दुर्घटनाओं और सुरक्षा रिपोर्ट को ट्रैक और प्रबंधित करें',
      addIncident: 'घटना की रिपोर्ट करें',
      searchPlaceholder: 'घटनाएं खोजें...',
      totalIncidents: 'कुल घटनाएं',
      activeIncidents: 'सक्रिय मामले',
      resolvedIncidents: 'इस महीने हल किए गए',
      avgResolutionTime: 'औसत समाधान समय',
      incidentId: 'घटना ID',
      driver: 'ड्राइवर',
      vehicle: 'वाहन',
      type: 'प्रकार',
      severity: 'गंभीरता',
      location: 'स्थान',
      dateTime: 'दिनांक और समय',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      all: 'सभी',
      reported: 'रिपोर्ट किया गया',
      investigating: 'जांच में',
      resolved: 'हल किया गया',
      closed: 'बंद',
      crash: 'दुर्घटना',
      breakdown: 'खराबी',
      theft: 'चोरी',
      damage: 'नुकसान',
      other: 'अन्य',
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      critical: 'गंभीर',
      viewDetails: 'विवरण देखें',
      editIncident: 'घटना संपादित करें',
      deleteIncident: 'घटना हटाएं',
      exportReport: 'रिपोर्ट निर्यात करें',
      noIncidents: 'कोई घटना नहीं मिली'
    },
    ur: {
      title: 'واقعہ منیجمنٹ',
      subtitle: 'فلیٹ واقعات، حادثات اور حفاظتی رپورٹس کو ٹریک اور منظم کریں',
      addIncident: 'واقعہ کی رپورٹ کریں',
      searchPlaceholder: 'واقعات تلاش کریں...',
      totalIncidents: 'کل واقعات',
      activeIncidents: 'فعال کیسز',
      resolvedIncidents: 'اس مہینے حل شدہ',
      avgResolutionTime: 'اوسط حل کا وقت',
      incidentId: 'واقعہ ID',
      driver: 'ڈرائیور',
      vehicle: 'گاڑی',
      type: 'قسم',
      severity: 'شدت',
      location: 'مقام',
      dateTime: 'تاریخ اور وقت',
      status: 'حالت',
      actions: 'اقدامات',
      all: 'تمام',
      reported: 'رپورٹ شدہ',
      investigating: 'تحقیق میں',
      resolved: 'حل شدہ',
      closed: 'بند',
      crash: 'حادثہ',
      breakdown: 'خرابی',
      theft: 'چوری',
      damage: 'نقصان',
      other: 'دیگر',
      low: 'کم',
      medium: 'درمیانہ',
      high: 'زیادہ',
      critical: 'انتہائی اہم',
      viewDetails: 'تفصیلات دیکھیں',
      editIncident: 'واقعہ میں ترمیم کریں',
      deleteIncident: 'واقعہ ہٹائیں',
      exportReport: 'رپورٹ ایکسپورٹ کریں',
      noIncidents: 'کوئی واقعہ نہیں ملا'
    }
  };

  const t = texts[language];

  // Mock incidents data
  const mockIncidents: Incident[] = [
    {
      id: 'INC-001',
      driverId: 1,
      vehicleId: 'DXB-A-12345',
      type: 'crash',
      severity: 'medium',
      title: 'Minor collision at intersection',
      description: 'Vehicle collided with another car while turning left at Al Wasl Road intersection. Minor damage to front bumper.',
      location: 'Al Wasl Road, Dubai',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      dateTime: '2024-01-22T14:30:00',
      reportedBy: 'driver',
      status: 'investigating',
      photos: ['photo1.jpg', 'photo2.jpg'],
      witnesses: ['John Doe - +971501234567'],
      policeReport: 'POL-2024-001234',
      estimatedCost: 3500,
      notes: 'Driver was not at fault according to witness statements.',
      createdAt: '2024-01-22T14:45:00',
      updatedAt: '2024-01-22T16:20:00'
    },
    {
      id: 'INC-002',
      driverId: 3,
      vehicleId: 'DXB-C-11111',
      type: 'breakdown',
      severity: 'low',
      title: 'Engine overheating',
      description: 'Vehicle engine started overheating during regular operation. Driver safely pulled over.',
      location: 'Sheikh Zayed Road, Dubai',
      dateTime: '2024-01-21T11:15:00',
      reportedBy: 'driver',
      status: 'resolved',
      estimatedCost: 800,
      actualCost: 650,
      notes: 'Coolant leak repaired. Vehicle back in service.',
      createdAt: '2024-01-21T11:30:00',
      updatedAt: '2024-01-21T18:45:00'
    },
    {
      id: 'INC-003',
      driverId: 2,
      vehicleId: 'DXB-B-67890',
      type: 'damage',
      severity: 'low',
      title: 'Parking lot scratch',
      description: 'Minor scratch on passenger side door discovered during vehicle inspection.',
      location: 'Dubai Mall Parking',
      dateTime: '2024-01-20T16:00:00',
      reportedBy: 'admin',
      status: 'closed',
      estimatedCost: 500,
      actualCost: 450,
      createdAt: '2024-01-20T16:15:00',
      updatedAt: '2024-01-20T20:30:00'
    }
  ];

  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const getDriverName = (driverId: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(incident.driverId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crash':
        return '🚗💥';
      case 'breakdown':
        return '🔧';
      case 'theft':
        return '🚨';
      case 'damage':
        return '⚠️';
      default:
        return '📋';
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
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>{t.addIncident}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalIncidents}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalIncidents}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.activeIncidents}</p>
              <p className="text-2xl font-semibold text-gray-900">{activeIncidents}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.resolvedIncidents}</p>
              <p className="text-2xl font-semibold text-gray-900">{resolvedIncidents}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.avgResolutionTime}</p>
              <p className="text-2xl font-semibold text-gray-900">2.3 days</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-700" />
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
          <option value="reported">{t.reported}</option>
          <option value="investigating">{t.investigating}</option>
          <option value="resolved">{t.resolved}</option>
          <option value="closed">{t.closed}</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{t.all}</option>
          <option value="crash">{t.crash}</option>
          <option value="breakdown">{t.breakdown}</option>
          <option value="theft">{t.theft}</option>
          <option value="damage">{t.damage}</option>
          <option value="other">{t.other}</option>
        </select>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.incidentId}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.type}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.vehicle}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.severity}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.dateTime}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.status}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-red-600">{incident.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span>{getTypeIcon(incident.type)}</span>
                        <span className="text-sm text-gray-900">{t[incident.type as keyof typeof t]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{getDriverName(incident.driverId)}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-mono">{incident.vehicleId}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                        {t[incident.severity as keyof typeof t]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {new Date(incident.dateTime).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                        {t[incident.status as keyof typeof t]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t.viewDetails}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t.editIncident}
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title={t.deleteIncident}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    {t.noIncidents}
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

export default Incidents;