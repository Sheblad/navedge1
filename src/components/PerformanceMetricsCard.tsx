import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Navigation } from 'lucide-react';
import { Driver } from '../data/mockData';

interface PerformanceMetricsCardProps {
  driver: Driver;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ driver, language }) => {
  const texts = {
    en: {
      dailyMetrics: 'Today\'s Performance Metrics',
      tripsToday: 'Trips Today',
      earningsToday: 'Earnings Today',
      performanceScore: 'Performance Score',
      automaticCalculation: 'Score is automatically calculated based on trips and earnings',
      formula: 'Formula: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    ar: {
      dailyMetrics: 'مقاييس الأداء اليومية',
      tripsToday: 'الرحلات اليوم',
      earningsToday: 'الأرباح اليوم',
      performanceScore: 'درجة الأداء',
      automaticCalculation: 'يتم حساب الدرجة تلقائيًا بناءً على الرحلات والأرباح',
      formula: 'الصيغة: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    hi: {
      dailyMetrics: 'आज के प्रदर्शन मेट्रिक्स',
      tripsToday: 'आज की यात्राएं',
      earningsToday: 'आज की कमाई',
      performanceScore: 'प्रदर्शन स्कोर',
      automaticCalculation: 'स्कोर यात्राओं और कमाई के आधार पर स्वचालित रूप से गणना की जाती है',
      formula: 'सूत्र: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    ur: {
      dailyMetrics: 'آج کے کارکردگی اعداد و شمار',
      tripsToday: 'آج کے سفر',
      earningsToday: 'آج کی کمائی',
      performanceScore: 'کارکردگی اسکور',
      automaticCalculation: 'اسکور سفر اور کمائی کی بنیاد پر خودکار طریقے سے حساب کیا جاتا ہے',
      formula: 'فارمولا: min(100, earnings_today × 0.5 + trips_today × 2)'
    }
  };

  const t = texts[language];

  // Calculate performance score based on trips and earnings
  const calculatePerformanceScore = (trips_today: number, earnings_today: number) => {
    return Math.min(100, Math.round((earnings_today * 0.5) + (trips_today * 2)));
  };

  // Get performance color
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get performance background color
  const getPerformanceBackgroundColor = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // Get performance icon
  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return TrendingUp;
    return TrendingDown;
  };

  const trips_today = driver.trips_today || 0;
  const earnings_today = driver.earnings_today || 0;
  const score = driver.performanceScore;
  const PerformanceIcon = getPerformanceIcon(score);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.dailyMetrics}</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{t.tripsToday}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{trips_today}</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{t.earningsToday}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">${earnings_today}</div>
        </div>
        
        <div className={`rounded-lg p-4 ${getPerformanceBackgroundColor(score)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <PerformanceIcon className={`w-5 h-5 ${getPerformanceColor(score)}`} />
            <span className="text-sm text-gray-600">{t.performanceScore}</span>
          </div>
          <div className={`text-2xl font-semibold ${getPerformanceColor(score)}`}>{score}</div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
        <p className="mb-1">{t.automaticCalculation}</p>
        <p className="font-mono">{t.formula}</p>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;