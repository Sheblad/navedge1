import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Clock, BarChart3, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Driver } from '../data/mockData';
import { useEarningsTracking } from '../hooks/useEarningsTracking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface EarningsTrackerProps {
  driver?: Driver;
  drivers: Driver[];
  fleetMode: 'rental' | 'taxi';
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const EarningsTracker: React.FC<EarningsTrackerProps> = ({ 
  driver, 
  drivers, 
  fleetMode, 
  language 
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    earningEvents,
    getDriverEarnings,
    getEarningsForPeriod,
    getEarningsSummaryByType
  } = useEarningsTracking(fleetMode);

  const texts = {
    en: {
      earningsTracker: 'Earnings Tracker',
      earningsOverview: 'Earnings Overview',
      timeframe: 'Timeframe',
      day: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      totalEarnings: 'Total Earnings',
      averagePerDay: 'Average Per Day',
      topEarningDriver: 'Top Earning Driver',
      earningsByDriver: 'Earnings by Driver',
      earningsByType: 'Earnings by Type',
      earningsTrend: 'Earnings Trend',
      trip: 'Trip Earnings',
      rental: 'Rental Payments',
      bonus: 'Bonuses',
      penalty: 'Penalties',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      date: 'Date',
      driver: 'Driver',
      amount: 'Amount',
      type: 'Type',
      details: 'Details',
      noEarnings: 'No earnings recorded in this period',
      downloadReport: 'Download Report',
      taxiEarnings: 'Taxi Trip Earnings',
      rentalEarnings: 'Rental Contract Payments',
      earningsAutomation: 'Earnings are automatically tracked:',
      taxiAutomation: 'Each completed trip is recorded with fare calculation based on distance and time',
      rentalAutomation: 'Monthly rental payments are automatically processed on the 1st of each month'
    },
    ar: {
      earningsTracker: 'متتبع الأرباح',
      earningsOverview: 'نظرة عامة على الأرباح',
      timeframe: 'الإطار الزمني',
      day: 'اليوم',
      week: 'هذا الأسبوع',
      month: 'هذا الشهر',
      year: 'هذا العام',
      totalEarnings: 'إجمالي الأرباح',
      averagePerDay: 'المتوسط اليومي',
      topEarningDriver: 'السائق الأعلى ربحاً',
      earningsByDriver: 'الأرباح حسب السائق',
      earningsByType: 'الأرباح حسب النوع',
      earningsTrend: 'اتجاه الأرباح',
      trip: 'أرباح الرحلات',
      rental: 'مدفوعات الإيجار',
      bonus: 'المكافآت',
      penalty: 'الغرامات',
      showDetails: 'عرض التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      date: 'التاريخ',
      driver: 'السائق',
      amount: 'المبلغ',
      type: 'النوع',
      details: 'التفاصيل',
      noEarnings: 'لا توجد أرباح مسجلة في هذه الفترة',
      downloadReport: 'تحميل التقرير',
      taxiEarnings: 'أرباح رحلات التاكسي',
      rentalEarnings: 'مدفوعات عقود الإيجار',
      earningsAutomation: 'يتم تتبع الأرباح تلقائياً:',
      taxiAutomation: 'يتم تسجيل كل رحلة مكتملة مع حساب الأجرة بناءً على المسافة والوقت',
      rentalAutomation: 'تتم معالجة مدفوعات الإيجار الشهرية تلقائياً في الأول من كل شهر'
    },
    hi: {
      earningsTracker: 'कमाई ट्रैकर',
      earningsOverview: 'कमाई अवलोकन',
      timeframe: 'समय सीमा',
      day: 'आज',
      week: 'इस सप्ताह',
      month: 'इस महीने',
      year: 'इस वर्ष',
      totalEarnings: 'कुल कमाई',
      averagePerDay: 'प्रति दिन औसत',
      topEarningDriver: 'शीर्ष कमाई वाला ड्राइवर',
      earningsByDriver: 'ड्राइवर द्वारा कमाई',
      earningsByType: 'प्रकार द्वारा कमाई',
      earningsTrend: 'कमाई का रुझान',
      trip: 'यात्रा कमाई',
      rental: 'किराया भुगतान',
      bonus: 'बोनस',
      penalty: 'जुर्माना',
      showDetails: 'विवरण दिखाएं',
      hideDetails: 'विवरण छिपाएं',
      date: 'तारीख',
      driver: 'ड्राइवर',
      amount: 'राशि',
      type: 'प्रकार',
      details: 'विवरण',
      noEarnings: 'इस अवधि में कोई कमाई दर्ज नहीं की गई',
      downloadReport: 'रिपोर्ट डाउनलोड करें',
      taxiEarnings: 'टैक्सी यात्रा कमाई',
      rentalEarnings: 'किराया अनुबंध भुगतान',
      earningsAutomation: 'कमाई स्वचालित रूप से ट्रैक की जाती है:',
      taxiAutomation: 'प्रत्येक पूर्ण यात्रा को दूरी और समय के आधार पर किराया गणना के साथ दर्ज किया जाता है',
      rentalAutomation: 'मासिक किराया भुगतान हर महीने की 1 तारीख को स्वचालित रूप से संसाधित किया जाता है'
    },
    ur: {
      earningsTracker: 'کمائی ٹریکر',
      earningsOverview: 'کمائی کا جائزہ',
      timeframe: 'ٹائم فریم',
      day: 'آج',
      week: 'اس ہفتے',
      month: 'اس مہینے',
      year: 'اس سال',
      totalEarnings: 'کل کمائی',
      averagePerDay: 'فی دن اوسط',
      topEarningDriver: 'سب سے زیادہ کمانے والا ڈرائیور',
      earningsByDriver: 'ڈرائیور کے حساب سے کمائی',
      earningsByType: 'قسم کے حساب سے کمائی',
      earningsTrend: 'کمائی کا رجحان',
      trip: 'سفر کی کمائی',
      rental: 'کرایہ ادائیگی',
      bonus: 'بونس',
      penalty: 'جرمانہ',
      showDetails: 'تفصیلات دکھائیں',
      hideDetails: 'تفصیلات چھپائیں',
      date: 'تاریخ',
      driver: 'ڈرائیور',
      amount: 'رقم',
      type: 'قسم',
      details: 'تفصیلات',
      noEarnings: 'اس مدت میں کوئی کمائی درج نہیں کی گئی',
      downloadReport: 'رپورٹ ڈاؤنلوڈ کریں',
      taxiEarnings: 'ٹیکسی سفر کی کمائی',
      rentalEarnings: 'کرایہ کنٹریکٹ ادائیگی',
      earningsAutomation: 'کمائی خودکار طریقے سے ٹریک کی جاتی ہے:',
      taxiAutomation: 'ہر مکمل سفر کو فاصلہ اور وقت کی بنیاد پر کرایہ کے حساب کے ساتھ ریکارڈ کیا جاتا ہے',
      rentalAutomation: 'ماہانہ کرایہ کی ادائیگی ہر مہینے کی پہلی تاریخ کو خودکار طریقے سے پروسیس کی جاتی ہے'
    }
  };

  const t = texts[language];

  // Get timeframe dates
  const getTimeframeDates = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    let endDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = startOfDay;
    }
    
    return { startDate, endDate };
  };

  // Get driver name by ID
  const getDriverName = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'ar' ? 'ar-AE' : language === 'hi' ? 'hi-IN' : 'ur-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get earnings data for the selected timeframe
  const { startDate, endDate } = getTimeframeDates();
  const timeframeEarnings = getEarningsForPeriod(
    startDate,
    endDate,
    driver?.id
  );

  // Calculate total and average earnings
  const totalEarnings = timeframeEarnings.reduce((sum, event) => sum + event.amount, 0);
  const daysInTimeframe = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const averagePerDay = totalEarnings / daysInTimeframe;

  // Find top earning driver
  const driverEarnings = drivers.map(d => ({
    driverId: d.id,
    name: d.name,
    total: getEarningsForPeriod(startDate, endDate, d.id).reduce((sum, e) => sum + e.amount, 0)
  })).sort((a, b) => b.total - a.total);

  const topEarningDriver = driverEarnings[0];

  // Prepare chart data
  const prepareChartData = () => {
    if (timeframe === 'day') {
      // Hourly breakdown for today
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(hour => {
        const hourStart = new Date(startDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(startDate);
        hourEnd.setHours(hour, 59, 59, 999);
        
        const hourEarnings = getEarningsForPeriod(hourStart, hourEnd, driver?.id);
        const total = hourEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: `${hour}:00`,
          earnings: total
        };
      });
    } else if (timeframe === 'week') {
      // Daily breakdown for week
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return date;
      });
      
      return days.map(day => {
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
        
        const dayEarnings = getEarningsForPeriod(dayStart, dayEnd, driver?.id);
        const total = dayEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: day.toLocaleDateString(language === 'en' ? 'en-US' : language === 'ar' ? 'ar-AE' : language === 'hi' ? 'hi-IN' : 'ur-PK', { weekday: 'short' }),
          earnings: total
        };
      });
    } else if (timeframe === 'month') {
      // Weekly breakdown for month
      const weeksInMonth = 4;
      return Array.from({ length: weeksInMonth }, (_, i) => {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekEarnings = getEarningsForPeriod(weekStart, weekEnd, driver?.id);
        const total = weekEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: `Week ${i + 1}`,
          earnings: total
        };
      });
    } else {
      // Monthly breakdown for year
      return Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date(new Date().getFullYear(), i, 1);
        const monthEnd = new Date(new Date().getFullYear(), i + 1, 0);
        
        const monthEarnings = getEarningsForPeriod(monthStart, monthEnd, driver?.id);
        const total = monthEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: monthStart.toLocaleDateString(language === 'en' ? 'en-US' : language === 'ar' ? 'ar-AE' : language === 'hi' ? 'hi-IN' : 'ur-PK', { month: 'short' }),
          earnings: total
        };
      });
    }
  };

  const chartData = prepareChartData();

  // Prepare earnings by type data
  const earningsByType = getEarningsSummaryByType(driver?.id);
  const typeChartData = [
    { name: t.trip, value: earningsByType.trip },
    { name: t.rental, value: earningsByType.rental },
    { name: t.bonus, value: earningsByType.bonus },
    { name: t.penalty, value: earningsByType.penalty }
  ].filter(item => item.value > 0);

  // Format type for display
  const formatType = (type: string) => {
    switch (type) {
      case 'trip': return t.trip;
      case 'rental': return t.rental;
      case 'bonus': return t.bonus;
      case 'penalty': return t.penalty;
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.earningsTracker}</h2>
          <p className="text-gray-600">{t.earningsOverview}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">{t.day}</option>
              <option value="week">{t.week}</option>
              <option value="month">{t.month}</option>
              <option value="year">{t.year}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showDetails ? t.hideDetails : t.showDetails}</span>
          </button>
        </div>
      </div>

      {/* Automation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">{t.earningsAutomation}</h3>
        <p className="text-blue-800 text-sm">
          {fleetMode === 'taxi' ? t.taxiAutomation : t.rentalAutomation}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalEarnings}</p>
              <p className="text-2xl font-semibold text-gray-900">${totalEarnings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.averagePerDay}</p>
              <p className="text-2xl font-semibold text-gray-900">${averagePerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        
        {!driver && topEarningDriver && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.topEarningDriver}</p>
                <p className="text-2xl font-semibold text-gray-900">{topEarningDriver.name}</p>
                <p className="text-sm text-gray-500">${topEarningDriver.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.earningsTrend}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, t.totalEarnings]} />
              <Bar 
                dataKey="earnings" 
                fill={fleetMode === 'rental' ? '#10b981' : '#f97316'} 
                name={t.totalEarnings} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings by Type */}
      {typeChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.earningsByType}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Bar 
                    dataKey="value" 
                    fill={fleetMode === 'rental' ? '#10b981' : '#f97316'} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {typeChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.name === t.trip ? 'bg-blue-500' :
                      item.name === t.rental ? 'bg-green-500' :
                      item.name === t.bonus ? 'bg-purple-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">${item.value.toLocaleString()}</span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{t.totalEarnings}</span>
                  <span className="font-bold text-gray-900">${earningsByType.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Earnings Table */}
      {showDetails && timeframeEarnings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{fleetMode === 'taxi' ? t.taxiEarnings : t.rentalEarnings}</h3>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>{t.downloadReport}</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.date}</th>
                  {!driver && <th className="text-left py-3 px-4 font-medium text-gray-900">{t.driver}</th>}
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.amount}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.type}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">{t.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeframeEarnings.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(event.timestamp)}
                    </td>
                    {!driver && (
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {getDriverName(event.driverId)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${event.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatType(event.type)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {event.type === 'trip' && event.details.distance && (
                        <span>{event.details.distance} km, {event.details.duration} min</span>
                      )}
                      {event.type === 'rental' && event.details.rentalDays && (
                        <span>{event.details.rentalDays} days</span>
                      )}
                      {event.details.contractId && (
                        <span className="ml-2 text-blue-600">{event.details.contractId}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Earnings Message */}
      {showDetails && timeframeEarnings.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t.noEarnings}</p>
        </div>
      )}
    </div>
  );
};

export default EarningsTracker;
```