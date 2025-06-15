import React, { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, Calendar, Clock, FileText, Eye, Edit, Trash2, Download, Upload, Camera, MapPin, Phone, User } from 'lucide-react';
import { mockDriversData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

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
      noIncidents: 'No incidents found',
      // Add incident form
      reportNewIncident: 'Report New Incident',
      incidentType: 'Incident Type',
      incidentSeverity: 'Severity Level',
      incidentTitle: 'Incident Title',
      incidentDescription: 'Description',
      incidentLocation: 'Location',
      selectDriver: 'Select Driver',
      selectVehicle: 'Select Vehicle',
      uploadPhotos: 'Upload Photos',
      witnesses: 'Witnesses',
      policeReportNumber: 'Police Report Number',
      estimatedCost: 'Estimated Cost (AED)',
      additionalNotes: 'Additional Notes',
      submitReport: 'Submit Report',
      cancel: 'Cancel',
      // Incident details
      incidentDetails: 'Incident Details',
      reportedBy: 'Reported By',
      createdAt: 'Created At',
      lastUpdated: 'Last Updated',
      photos: 'Photos',
      witnessInfo: 'Witness Information',
      costEstimate: 'Cost Estimate',
      actualCost: 'Actual Cost',
      updateStatus: 'Update Status',
      addNote: 'Add Note'
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
      noIncidents: 'لا توجد حوادث',
      // Add incident form
      reportNewIncident: 'الإبلاغ عن حادث جديد',
      incidentType: 'نوع الحادث',
      incidentSeverity: 'مستوى الخطورة',
      incidentTitle: 'عنوان الحادث',
      incidentDescription: 'الوصف',
      incidentLocation: 'الموقع',
      selectDriver: 'اختر السائق',
      selectVehicle: 'اختر المركبة',
      uploadPhotos: 'رفع الصور',
      witnesses: 'الشهود',
      policeReportNumber: 'رقم تقرير الشرطة',
      estimatedCost: 'التكلفة المقدرة (درهم)',
      additionalNotes: 'ملاحظات إضافية',
      submitReport: 'إرسال التقرير',
      cancel: 'إلغاء',
      // Incident details
      incidentDetails: 'تفاصيل الحادث',
      reportedBy: 'أبلغ عنه',
      createdAt: 'تم الإنشاء في',
      lastUpdated: 'آخر تحديث',
      photos: 'الصور',
      witnessInfo: 'معلومات الشهود',
      costEstimate: 'تقدير التكلفة',
      actualCost: 'التكلفة الفعلية',
      updateStatus: 'تحديث الحالة',
      addNote: 'إضافة ملاحظة'
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
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    type: 'crash',
    severity: 'medium',
    reportedBy: 'admin',
    status: 'reported'
  });

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

  const handleSubmitIncident = () => {
    const incident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      driverId: newIncident.driverId || 1,
      vehicleId: newIncident.vehicleId || 'DXB-A-12345',
      type: newIncident.type || 'crash',
      severity: newIncident.severity || 'medium',
      title: newIncident.title || '',
      description: newIncident.description || '',
      location: newIncident.location || '',
      dateTime: new Date().toISOString(),
      reportedBy: newIncident.reportedBy || 'admin',
      status: 'reported',
      estimatedCost: newIncident.estimatedCost,
      notes: newIncident.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIncidents([incident, ...incidents]);
    setNewIncident({
      type: 'crash',
      severity: 'medium',
      reportedBy: 'admin',
      status: 'reported'
    });
    setShowAddIncident(false);
  };

  const exportToPDF = () => {
    // This would integrate with jsPDF to generate comprehensive incident reports
    alert('PDF export functionality would be implemented here with detailed incident reports');
  };

  const renderAddIncidentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t.reportNewIncident}</h2>
            <button
              onClick={() => setShowAddIncident(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentType}</label>
              <select
                value={newIncident.type}
                onChange={(e) => setNewIncident({...newIncident, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="crash">{t.crash}</option>
                <option value="breakdown">{t.breakdown}</option>
                <option value="theft">{t.theft}</option>
                <option value="damage">{t.damage}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentSeverity}</label>
              <select
                value={newIncident.severity}
                onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
                <option value="critical">{t.critical}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentTitle}</label>
            <input
              type="text"
              value={newIncident.title || ''}
              onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentDescription}</label>
            <textarea
              value={newIncident.description || ''}
              onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of what happened..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectDriver}</label>
              <select
                value={newIncident.driverId || ''}
                onChange={(e) => setNewIncident({...newIncident, driverId: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a driver</option>
                {mockDriversData.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectVehicle}</label>
              <input
                type="text"
                value={newIncident.vehicleId || ''}
                onChange={(e) => setNewIncident({...newIncident, vehicleId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="DXB-A-12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentLocation}</label>
            <input
              type="text"
              value={newIncident.location || ''}
              onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Street address or landmark"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.policeReportNumber}</label>
              <input
                type="text"
                value={newIncident.policeReport || ''}
                onChange={(e) => setNewIncident({...newIncident, policeReport: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="POL-2024-001234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.estimatedCost}</label>
              <input
                type="number"
                value={newIncident.estimatedCost || ''}
                onChange={(e) => setNewIncident({...newIncident, estimatedCost: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadPhotos}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Click to upload photos or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.additionalNotes}</label>
            <textarea
              value={newIncident.notes || ''}
              onChange={(e) => setNewIncident({...newIncident, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowAddIncident(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmitIncident}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t.submitReport}
          </button>
        </div>
      </div>
    </div>
  );

  const renderIncidentDetails = (incident: Incident) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.incidentDetails}</h2>
              <p className="text-gray-600">{incident.id} - {incident.title}</p>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Type:</strong> {getTypeIcon(incident.type)} {t[incident.type as keyof typeof t]}</div>
                <div><strong>Severity:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(incident.severity)}`}>{t[incident.severity as keyof typeof t]}</span></div>
                <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(incident.status)}`}>{t[incident.status as keyof typeof t]}</span></div>
                <div><strong>Driver:</strong> {getDriverName(incident.driverId)}</div>
                <div><strong>Vehicle:</strong> {incident.vehicleId}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Location & Time</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Location:</strong> {incident.location}</div>
                <div><strong>Date:</strong> {new Date(incident.dateTime).toLocaleDateString()}</div>
                <div><strong>Time:</strong> {new Date(incident.dateTime).toLocaleTimeString()}</div>
                <div><strong>Reported by:</strong> {incident.reportedBy}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cost Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Estimated:</strong> AED {incident.estimatedCost?.toLocaleString() || 'N/A'}</div>
                <div><strong>Actual:</strong> AED {incident.actualCost?.toLocaleString() || 'Pending'}</div>
                {incident.policeReport && <div><strong>Police Report:</strong> {incident.policeReport}</div>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{incident.description}</p>
          </div>

          {incident.photos && incident.photos.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.photos}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {incident.photos.map((photo, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg h-24 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {incident.witnesses && incident.witnesses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.witnessInfo}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {incident.witnesses.map((witness, index) => (
                  <div key={index} className="text-sm text-gray-700">{witness}</div>
                ))}
              </div>
            </div>
          )}

          {incident.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{incident.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={exportToPDF}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportReport}</span>
          </button>
          <button
            onClick={() => setSelectedIncident(null)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

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
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportReport}</span>
          </button>
          <button
            onClick={() => setShowAddIncident(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
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
                          onClick={() => setSelectedIncident(incident)}
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

      {/* Modals */}
      {showAddIncident && renderAddIncidentForm()}
      {selectedIncident && renderIncidentDetails(selectedIncident)}
    </div>
  );
};

export default Incidents;