import React, { useState } from 'react';
import { Download, Calendar, BarChart3, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { mockDriversData, mockFinesData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface ReportsProps {
  fleetMode: FleetMode;
  language: Language;
}

const Reports: React.FC<ReportsProps> = ({ fleetMode, language }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const texts = {
    en: {
      title: 'Reports & Analytics',
      subtitle: 'Generate comprehensive reports and insights',
      downloadReport: 'Download Report',
      period: 'Period',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      driverPerformance: 'Driver Performance',
      earningsOverview: 'Earnings Overview',
      finesAnalysis: 'Fines Analysis',
      fleetUtilization: 'Fleet Utilization',
      totalEarnings: 'Total Earnings',
      totalFines: 'Total Fines',
      activeDrivers: 'Active Drivers',
      avgPerformance: 'Avg Performance',
      earnings: 'Earnings',
      trips: 'Trips',
      driver: 'Driver',
      amount: 'Amount',
      generatePDF: 'Generate PDF Report',
      exportData: 'Export Data'
    },
    ar: {
      title: 'التقارير والتحليلات',
      subtitle: 'إنشاء تقارير ورؤى شاملة',
      downloadReport: 'تحميل التقرير',
      period: 'الفترة',
      week: 'هذا الأسبوع',
      month: 'هذا الشهر',
      year: 'هذا العام',
      driverPerformance: 'أداء السائقين',
      earningsOverview: 'نظرة عامة على الأرباح',
      finesAnalysis: 'تحليل المخالفات',
      fleetUtilization: 'استخدام الأسطول',
      totalEarnings: 'إجمالي الأرباح',
      totalFines: 'إجمالي المخالفات',
      activeDrivers: 'السائقون النشطون',
      avgPerformance: 'متوسط الأداء',
      earnings: 'الأرباح',
      trips: 'الرحلات',
      driver: 'السائق',
      amount: 'المبلغ',
      generatePDF: 'إنشاء تقرير PDF',
      exportData: 'تصدير البيانات'
    },
    hi: {
      title: 'रिपोर्ट और एनालिटिक्स',
      subtitle: 'व्यापक रिपोर्ट और अंतर्दृष्टि उत्पन्न करें',
      downloadReport: 'रिपोर्ट डाउनलोड करें',
      period: 'अवधि',
      week: 'इस सप्ताह',
      month: 'इस महीने',
      year: 'इस साल',
      driverPerformance: 'ड्राइवर प्रदर्शन',
      earningsOverview: 'कमाई अवलोकन',
      finesAnalysis: 'जुर्माना विश्लेषण',
      fleetUtilization: 'फ्लीट उपयोग',
      totalEarnings: 'कुल कमाई',
      totalFines: 'कुल जुर्माने',
      activeDrivers: 'सक्रिय ड्राइवर',
      avgPerformance: 'औसत प्रदर्शन',
      earnings: 'कमाई',
      trips: 'यात्राएं',
      driver: 'ड्राइवर',
      amount: 'राशि',
      generatePDF: 'PDF रिपोर्ट जेनरेट करें',
      exportData: 'डेटा निर्यात करें'
    },
    ur: {
      title: 'رپورٹس اور تجزیات',
      subtitle: 'جامع رپورٹس اور بصیرت پیدا کریں',
      downloadReport: 'رپورٹ ڈاؤن لوڈ کریں',
      period: 'مدت',
      week: 'اس ہفتے',
      month: 'اس مہینے',
      year: 'اس سال',
      driverPerformance: 'ڈرائیور کارکردگی',
      earningsOverview: 'کمائی کا جائزہ',
      finesAnalysis: 'جرمانوں کا تجزیہ',
      fleetUtilization: 'فلیٹ کا استعمال',
      totalEarnings: 'کل کمائی',
      totalFines: 'کل جرمانے',
      activeDrivers: 'فعال ڈرائیورز',
      avgPerformance: 'اوسط کارکردگی',
      earnings: 'کمائی',
      trips: 'سفر',
      driver: 'ڈرائیور',
      amount: 'رقم',
      generatePDF: 'PDF رپورٹ جنریٹ کریں',
      exportData: 'ڈیٹا ایکسپورٹ کریں'
    }
  };

  const t = texts[language];

  // Prepare chart data
  const driverPerformanceData = mockDriversData.map(driver => ({
    name: driver.name.split(' ')[0],
    earnings: driver.earnings,
    trips: driver.trips,
    performance: driver.performanceScore
  }));

  const earningsData = [
    { name: 'Mon', earnings: 2400 },
    { name: 'Tue', earnings: 1398 },
    { name: 'Wed', earnings: 9800 },
    { name: 'Thu', earnings: 3908 },
    { name: 'Fri', earnings: 4800 },
    { name: 'Sat', earnings: 3800 },
    { name: 'Sun', earnings: 4300 }
  ];

  const finesData = [
    { name: 'Speeding', value: 45, color: '#ef4444' },
    { name: 'Parking', value: 30, color: '#f97316' },
    { name: 'Traffic Light', value: 15, color: '#eab308' },
    { name: 'Other', value: 10, color: '#6b7280' }
  ];

  const totalEarnings = mockDriversData.reduce((sum, driver) => sum + driver.earnings, 0);
  const totalFines = mockFinesData.reduce((sum, fine) => sum + fine.amount, 0);
  const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
  const avgPerformance = mockDriversData.reduce((sum, driver) => sum + driver.performanceScore, 0) / mockDriversData.length;

  const generatePDFReport = () => {
    // This would integrate with jsPDF to generate actual PDF reports
    alert('PDF report generation would be implemented here');
  };

  const exportData = () => {
    // This would export data as CSV or Excel
    alert('Data export would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">{t.week}</option>
            <option value="month">{t.month}</option>
            <option value="year">{t.year}</option>
          </select>
          <button
            onClick={generatePDFReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.generatePDF}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalEarnings}</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalFines}</p>
              <p className="text-2xl font-semibold text-gray-900">
                AED {totalFines.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <FileText className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.activeDrivers}</p>
              <p className="text-2xl font-semibold text-gray-900">{activeDrivers}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.avgPerformance}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {avgPerformance.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.driverPerformance}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings Overview Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.earningsOverview}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fines Analysis Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.finesAnalysis}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={finesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {finesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.fleetUtilization}</h3>
          <div className="space-y-4">
            {mockDriversData.slice(0, 5).map((driver) => (
              <div key={driver.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{driver.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${driver.earnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {driver.trips} {fleetMode === 'taxi' ? 'trips' : 'rentals'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exportData}</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Driver Performance CSV</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Earnings Report Excel</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Fines Summary PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;