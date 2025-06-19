import React, { useState } from 'react';
import { X, Navigation, DollarSign, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Driver } from '../data/mockData';
import { useEarningsTracking } from '../hooks/useEarningsTracking';

interface TripCompletionModalProps {
  driver: Driver;
  onClose: () => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const TripCompletionModal: React.FC<TripCompletionModalProps> = ({ driver, onClose, language }) => {
  const [distance, setDistance] = useState(15);
  const [duration, setDuration] = useState(25);
  const [startLocation, setStartLocation] = useState('Dubai Mall');
  const [endLocation, setEndLocation] = useState('Dubai Marina');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fareDetails, setFareDetails] = useState<{
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    totalFare: number;
  } | null>(null);

  const { recordTripCompletion } = useEarningsTracking('taxi');

  const texts = {
    en: {
      title: 'Complete Trip',
      tripDetails: 'Trip Details',
      startLocation: 'Start Location',
      endLocation: 'End Location',
      distance: 'Distance (km)',
      duration: 'Duration (min)',
      calculateFare: 'Calculate Fare',
      fareDetails: 'Fare Details',
      baseFare: 'Base Fare',
      distanceFare: 'Distance Fare',
      timeFare: 'Time Fare',
      totalFare: 'Total Fare',
      completeTrip: 'Complete Trip',
      tripCompleted: 'Trip Completed',
      tripCompletedMessage: 'The trip has been completed and earnings have been recorded.',
      close: 'Close',
      aed: 'AED',
      perKm: 'per km',
      perMin: 'per min',
      fareCalculation: 'Fare Calculation',
      tripSummary: 'Trip Summary',
      driver: 'Driver',
      date: 'Date',
      time: 'Time',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      card: 'Card',
      receipt: 'Receipt will be sent to passenger'
    },
    ar: {
      title: 'إكمال الرحلة',
      tripDetails: 'تفاصيل الرحلة',
      startLocation: 'موقع البداية',
      endLocation: 'موقع النهاية',
      distance: 'المسافة (كم)',
      duration: 'المدة (دقيقة)',
      calculateFare: 'حساب الأجرة',
      fareDetails: 'تفاصيل الأجرة',
      baseFare: 'الأجرة الأساسية',
      distanceFare: 'أجرة المسافة',
      timeFare: 'أجرة الوقت',
      totalFare: 'إجمالي الأجرة',
      completeTrip: 'إكمال الرحلة',
      tripCompleted: 'تم إكمال الرحلة',
      tripCompletedMessage: 'تم إكمال الرحلة وتسجيل الأرباح.',
      close: 'إغلاق',
      aed: 'درهم',
      perKm: 'لكل كم',
      perMin: 'لكل دقيقة',
      fareCalculation: 'حساب الأجرة',
      tripSummary: 'ملخص الرحلة',
      driver: 'السائق',
      date: 'التاريخ',
      time: 'الوقت',
      paymentMethod: 'طريقة الدفع',
      cash: 'نقداً',
      card: 'بطاقة',
      receipt: 'سيتم إرسال الإيصال إلى الراكب'
    },
    hi: {
      title: 'यात्रा पूरी करें',
      tripDetails: 'यात्रा विवरण',
      startLocation: 'प्रारंभ स्थान',
      endLocation: 'अंतिम स्थान',
      distance: 'दूरी (किमी)',
      duration: 'अवधि (मिनट)',
      calculateFare: 'किराया गणना करें',
      fareDetails: 'किराया विवरण',
      baseFare: 'बेस किराया',
      distanceFare: 'दूरी किराया',
      timeFare: 'समय किराया',
      totalFare: 'कुल किराया',
      completeTrip: 'यात्रा पूरी करें',
      tripCompleted: 'यात्रा पूरी हुई',
      tripCompletedMessage: 'यात्रा पूरी हो गई है और कमाई दर्ज कर ली गई है।',
      close: 'बंद करें',
      aed: 'AED',
      perKm: 'प्रति किमी',
      perMin: 'प्रति मिनट',
      fareCalculation: 'किराया गणना',
      tripSummary: 'यात्रा सारांश',
      driver: 'ड्राइवर',
      date: 'दिनांक',
      time: 'समय',
      paymentMethod: 'भुगतान विधि',
      cash: 'नकद',
      card: 'कार्ड',
      receipt: 'रसीद यात्री को भेजी जाएगी'
    },
    ur: {
      title: 'سفر مکمل کریں',
      tripDetails: 'سفر کی تفصیلات',
      startLocation: 'شروع کا مقام',
      endLocation: 'آخری مقام',
      distance: 'فاصلہ (کلومیٹر)',
      duration: 'دورانیہ (منٹ)',
      calculateFare: 'کرایہ کا حساب کریں',
      fareDetails: 'کرایہ کی تفصیلات',
      baseFare: 'بنیادی کرایہ',
      distanceFare: 'فاصلہ کرایہ',
      timeFare: 'وقت کرایہ',
      totalFare: 'کل کرایہ',
      completeTrip: 'سفر مکمل کریں',
      tripCompleted: 'سفر مکمل ہو گیا',
      tripCompletedMessage: 'سفر مکمل ہو گیا ہے اور کمائی ریکارڈ کر لی گئی ہے۔',
      close: 'بند کریں',
      aed: 'AED',
      perKm: 'فی کلومیٹر',
      perMin: 'فی منٹ',
      fareCalculation: 'کرایہ کا حساب',
      tripSummary: 'سفر کا خلاصہ',
      driver: 'ڈرائیور',
      date: 'تاریخ',
      time: 'وقت',
      paymentMethod: 'ادائیگی کا طریقہ',
      cash: 'نقد',
      card: 'کارڈ',
      receipt: 'رسید مسافر کو بھیجی جائے گی'
    }
  };

  const t = texts[language];

  const calculateFare = () => {
    // Base fare + distance rate + time rate
    const baseFare = 12;
    const distanceRate = 2.5; // per km
    const timeRate = 0.5; // per minute
    
    const distanceFare = distance * distanceRate;
    const timeFare = duration * timeRate;
    const totalFare = Math.round(baseFare + distanceFare + timeFare);
    
    setFareDetails({
      baseFare,
      distanceFare,
      timeFare,
      totalFare
    });
  };

  const handleCompleteTrip = () => {
    if (!fareDetails) return;
    
    setIsSubmitting(true);
    
    // Record the trip completion
    recordTripCompletion(
      driver,
      distance,
      duration,
      startLocation,
      endLocation
    );
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isCompleted ? t.tripCompleted : t.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isCompleted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.tripCompleted}</h3>
                <p className="text-gray-600">{t.tripCompletedMessage}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-3">{t.tripSummary}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.driver}:</span>
                    <span className="font-medium text-gray-900">{driver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.distance}:</span>
                    <span className="font-medium text-gray-900">{distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.duration}:</span>
                    <span className="font-medium text-gray-900">{duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.totalFare}:</span>
                    <span className="font-medium text-gray-900">{t.aed} {fareDetails?.totalFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.paymentMethod}:</span>
                    <span className="font-medium text-gray-900">{t.cash}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.tripDetails}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.startLocation}
                      </label>
                      <input
                        type="text"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.endLocation}
                      </label>
                      <input
                        type="text"
                        value={endLocation}
                        onChange={(e) => setEndLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.distance}
                      </label>
                      <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.duration}
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {!fareDetails ? (
                <button
                  onClick={calculateFare}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.calculateFare}
                </button>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t.fareDetails}</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Navigation className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700">{t.baseFare}</span>
                          </div>
                          <span className="font-medium text-gray-900">{t.aed} {fareDetails.baseFare.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <span className="text-gray-700">{t.distanceFare}</span>
                              <span className="text-xs text-gray-500 block">{distance} km × {t.aed} 2.5 {t.perKm}</span>
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">{t.aed} {fareDetails.distanceFare.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Clock className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <span className="text-gray-700">{t.timeFare}</span>
                              <span className="text-xs text-gray-500 block">{duration} min × {t.aed} 0.5 {t.perMin}</span>
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">{t.aed} {fareDetails.timeFare.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-900">{t.totalFare}</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{t.aed} {fareDetails.totalFare.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCompleteTrip}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t.completeTrip}...
                      </>
                    ) : (
                      t.completeTrip
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCompletionModal;