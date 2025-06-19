import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Star, DollarSign, Navigation } from 'lucide-react';
import { Driver } from '../data/mockData';

interface DriverPerformanceCardProps {
  driver: Driver;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const DriverPerformanceCard: React.FC<DriverPerformanceCardProps> = ({ driver, language }) => {
  const texts = {
    en: {
      performanceScore: 'Performance Score',
      tripsToday: 'Trips Today',
      earningsToday: 'Earnings Today',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      needsImprovement: 'Needs Improvement',
      automaticCalculation: 'Score is automatically calculated based on trips and earnings',
      formula: 'Formula: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    ar: {
      performanceScore: 'درجة الأداء',
      tripsToday: 'الرحلات اليوم',
      earningsToday: 'الأرباح اليوم',
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      needsImprovement: 'يحتاج تحسين',
      automaticCalculation: 'يتم حساب الدرجة تلقائيًا بناءً على الرحلات والأرباح',
      formula: 'الصيغة: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    hi: {
      performanceScore: 'प्रदर्शन स्कोर',
      tripsToday: 'आज की यात्राएं',
      earningsToday: 'आज की कमाई',
      excellent: 'उत्कृष्ट',
      good: 'अच्छा',
      average: 'औसत',
      needsImprovement: 'सुधार की आवश्यकता है',
      automaticCalculation: 'स्कोर यात्राओं और कमाई के आधार पर स्वचालित रूप से गणना की जाती है',
      formula: 'सूत्र: min(100, earnings_today × 0.5 + trips_today × 2)'
    },
    ur: {
      performanceScore: 'کارکردگی اسکور',
      tripsToday: 'آج کے سفر',
      earningsToday: 'آج کی کمائی',
      excellent: 'بہترین',
      good: 'اچھا',
      average: 'اوسط',
      needsImprovement: 'بہتری کی ضرورت ہے',
      automaticCalculation: 'اسکور سفر اور کمائی کی بنیاد پر خودکار طریقے سے حساب کیا جاتا ہے',
      formula: 'فارمولا: min(100, earnings_today × 0.5 + trips_today × 2)'
    }
  };

  const t = texts[language];

  // Get performance rating text
  const getPerformanceRating = (score: number) => {
    if (score >= 90) return t.excellent;
    if (score >= 80) return t.good;
    if (score >= 70) return t.average;
    return t.needsImprovement;
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

  const PerformanceIcon = getPerformanceIcon(driver.performanceScore);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.performanceScore}</h3>
        <div className={`p-2 rounded-full ${getPerformanceBackgroundColor(driver.performanceScore)}`}>
          <PerformanceIcon className={`w-5 h-5 ${getPerformanceColor(driver.performanceScore)}`} />
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full flex items-center justify-center border-8 border-gray-100">
            <div className={`text-4xl font-bold ${getPerformanceColor(driver.performanceScore)}`}>
              {driver.performanceScore}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-gray-200">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className={`text-lg font-semibold ${getPerformanceColor(driver.performanceScore)}`}>
          {getPerformanceRating(driver.performanceScore)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Navigation className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{t.tripsToday}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{driver.trips_today || 0}</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{t.earningsToday}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">${driver.earnings_today || 0}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
        <p className="mb-1">{t.automaticCalculation}</p>
        <p className="font-mono">{t.formula}</p>
      </div>
    </div>
  );
};

export default DriverPerformanceCard;