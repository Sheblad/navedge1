import React, { useState } from 'react';
import { X, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { Driver } from '../data/mockData';
import { useEarningsTracking } from '../hooks/useEarningsTracking';

interface RentalPaymentModalProps {
  driver: Driver;
  onClose: () => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const RentalPaymentModal: React.FC<RentalPaymentModalProps> = ({ driver, onClose, language }) => {
  const [paymentType, setPaymentType] = useState<'monthly' | 'custom'>('monthly');
  const [days, setDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const { recordRentalPayment } = useEarningsTracking('rental');

  const texts = {
    en: {
      title: 'Record Rental Payment',
      paymentDetails: 'Payment Details',
      paymentType: 'Payment Type',
      monthly: 'Monthly Payment',
      custom: 'Custom Period',
      days: 'Number of Days',
      dailyRate: 'Daily Rate',
      totalAmount: 'Total Amount',
      recordPayment: 'Record Payment',
      paymentCompleted: 'Payment Recorded',
      paymentCompletedMessage: 'The rental payment has been recorded and earnings have been updated.',
      close: 'Close',
      aed: 'AED',
      paymentSummary: 'Payment Summary',
      driver: 'Driver',
      vehicle: 'Vehicle',
      contractId: 'Contract ID',
      paymentDate: 'Payment Date',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      receiptSent: 'Receipt has been sent to driver'
    },
    ar: {
      title: 'تسجيل دفعة الإيجار',
      paymentDetails: 'تفاصيل الدفع',
      paymentType: 'نوع الدفع',
      monthly: 'دفع شهري',
      custom: 'فترة مخصصة',
      days: 'عدد الأيام',
      dailyRate: 'المعدل اليومي',
      totalAmount: 'المبلغ الإجمالي',
      recordPayment: 'تسجيل الدفع',
      paymentCompleted: 'تم تسجيل الدفع',
      paymentCompletedMessage: 'تم تسجيل دفعة الإيجار وتحديث الأرباح.',
      close: 'إغلاق',
      aed: 'درهم',
      paymentSummary: 'ملخص الدفع',
      driver: 'السائق',
      vehicle: 'المركبة',
      contractId: 'رقم العقد',
      paymentDate: 'تاريخ الدفع',
      paymentMethod: 'طريقة الدفع',
      cash: 'نقداً',
      bankTransfer: 'تحويل بنكي',
      receiptSent: 'تم إرسال الإيصال إلى السائق'
    },
    hi: {
      title: 'किराया भुगतान दर्ज करें',
      paymentDetails: 'भुगतान विवरण',
      paymentType: 'भुगतान प्रकार',
      monthly: 'मासिक भुगतान',
      custom: 'कस्टम अवधि',
      days: 'दिनों की संख्या',
      dailyRate: 'दैनिक दर',
      totalAmount: 'कुल राशि',
      recordPayment: 'भुगतान दर्ज करें',
      paymentCompleted: 'भुगतान दर्ज किया गया',
      paymentCompletedMessage: 'किराया भुगतान दर्ज किया गया है और कमाई अपडेट की गई है।',
      close: 'बंद करें',
      aed: 'AED',
      paymentSummary: 'भुगतान सारांश',
      driver: 'ड्राइवर',
      vehicle: 'वाहन',
      contractId: 'अनुबंध आईडी',
      paymentDate: 'भुगतान तिथि',
      paymentMethod: 'भुगतान विधि',
      cash: 'नकद',
      bankTransfer: 'बैंक ट्रांसफर',
      receiptSent: 'ड्राइवर को रसीद भेज दी गई है'
    },
    ur: {
      title: 'کرایہ ادائیگی ریکارڈ کریں',
      paymentDetails: 'ادائیگی کی تفصیلات',
      paymentType: 'ادائیگی کی قسم',
      monthly: 'ماہانہ ادائیگی',
      custom: 'حسب ضرورت مدت',
      days: 'دنوں کی تعداد',
      dailyRate: 'روزانہ کی شرح',
      totalAmount: 'کل رقم',
      recordPayment: 'ادائیگی ریکارڈ کریں',
      paymentCompleted: 'ادائیگی ریکارڈ کی گئی',
      paymentCompletedMessage: 'کرایہ کی ادائیگی ریکارڈ کی گئی ہے اور کمائی اپڈیٹ کی گئی ہے۔',
      close: 'بند کریں',
      aed: 'AED',
      paymentSummary: 'ادائیگی کا خلاصہ',
      driver: 'ڈرائیور',
      vehicle: 'گاڑی',
      contractId: 'کنٹریکٹ ID',
      paymentDate: 'ادائیگی کی تاریخ',
      paymentMethod: 'ادائیگی کا طریقہ',
      cash: 'نقد',
      bankTransfer: 'بینک ٹرانسفر',
      receiptSent: 'ڈرائیور کو رسید بھیج دی گئی ہے'
    }
  };

  const t = texts[language];

  // Calculate payment amount based on days
  const calculatePayment = () => {
    const dailyRate = 40; // $40 per day
    const amount = dailyRate * days;
    setPaymentAmount(amount);
    return amount;
  };

  const handleRecordPayment = () => {
    if (paymentAmount === 0) {
      calculatePayment();
    }
    
    setIsSubmitting(true);
    
    // Record the rental payment
    const contractId = driver.contractId || `CNT-${Date.now().toString().substring(-6)}`;
    recordRentalPayment(
      driver,
      contractId,
      days
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
              {isCompleted ? t.paymentCompleted : t.title}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.paymentCompleted}</h3>
                <p className="text-gray-600">{t.paymentCompletedMessage}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-3">{t.paymentSummary}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.driver}:</span>
                    <span className="font-medium text-gray-900">{driver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vehicle}:</span>
                    <span className="font-medium text-gray-900">{driver.vehicleId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.days}:</span>
                    <span className="font-medium text-gray-900">{days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.totalAmount}:</span>
                    <span className="font-medium text-gray-900">{t.aed} {paymentAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.paymentMethod}:</span>
                    <span className="font-medium text-gray-900">{t.bankTransfer}</span>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.paymentDetails}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.paymentType}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setPaymentType('monthly');
                          setDays(30);
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentType === 'monthly'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {t.monthly}
                      </button>
                      <button
                        onClick={() => {
                          setPaymentType('custom');
                          setDays(1);
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentType === 'custom'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {t.custom}
                      </button>
                    </div>
                  </div>
                  
                  {paymentType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.days}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">{t.dailyRate}:</span>
                      <span className="font-medium text-gray-900">{t.aed} 40</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t.totalAmount}:</span>
                      <span className="text-xl font-bold text-gray-900">{t.aed} {calculatePayment()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRecordPayment}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.recordPayment}...
                  </>
                ) : (
                  t.recordPayment
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalPaymentModal;