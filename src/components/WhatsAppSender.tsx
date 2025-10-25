import React, { useState } from 'react';
import { MessageCircle, Send, X, Loader, CheckCircle, XCircle } from 'lucide-react';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface WhatsAppSenderProps {
  language: Language;
  onClose: () => void;
}

const WhatsAppSender: React.FC<WhatsAppSenderProps> = ({ language, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const texts = {
    en: {
      title: 'Send WhatsApp Notification',
      phoneNumber: 'Phone Number',
      phonePlaceholder: '+971501234567',
      message: 'Message',
      messagePlaceholder: 'Enter your message...',
      templateName: 'Template Name (Optional)',
      templatePlaceholder: 'e.g., contract_reminder',
      send: 'Send Notification',
      sending: 'Sending...',
      close: 'Close',
      success: 'Message sent successfully!',
      error: 'Failed to send message',
      templates: 'Quick Templates',
      contractReminder: 'Contract Expiry Reminder',
      paymentDue: 'Payment Due Notice',
      fineNotification: 'Traffic Fine Notification',
      welcome: 'Welcome Message',
    },
    ar: {
      title: 'إرسال إشعار واتساب',
      phoneNumber: 'رقم الهاتف',
      phonePlaceholder: '+971501234567',
      message: 'الرسالة',
      messagePlaceholder: 'أدخل رسالتك...',
      templateName: 'اسم القالب (اختياري)',
      templatePlaceholder: 'مثال: تذكير_العقد',
      send: 'إرسال الإشعار',
      sending: 'جاري الإرسال...',
      close: 'إغلاق',
      success: 'تم إرسال الرسالة بنجاح!',
      error: 'فشل إرسال الرسالة',
      templates: 'قوالب سريعة',
      contractReminder: 'تذكير انتهاء العقد',
      paymentDue: 'إشعار استحقاق الدفع',
      fineNotification: 'إشعار مخالفة مرورية',
      welcome: 'رسالة ترحيب',
    },
    hi: {
      title: 'WhatsApp सूचना भेजें',
      phoneNumber: 'फ़ोन नंबर',
      phonePlaceholder: '+971501234567',
      message: 'संदेश',
      messagePlaceholder: 'अपना संदेश दर्ज करें...',
      templateName: 'टेम्पलेट नाम (वैकल्पिक)',
      templatePlaceholder: 'उदा., अनुबंध_अनुस्मारक',
      send: 'सूचना भेजें',
      sending: 'भेजा जा रहा है...',
      close: 'बंद करें',
      success: 'संदेश सफलतापूर्वक भेजा गया!',
      error: 'संदेश भेजने में विफल',
      templates: 'त्वरित टेम्पलेट',
      contractReminder: 'अनुबंध समाप्ति अनुस्मारक',
      paymentDue: 'भुगतान देय सूचना',
      fineNotification: 'ट्रैफिक जुर्माना सूचना',
      welcome: 'स्वागत संदेश',
    },
    ur: {
      title: 'WhatsApp اطلاع بھیجیں',
      phoneNumber: 'فون نمبر',
      phonePlaceholder: '+971501234567',
      message: 'پیغام',
      messagePlaceholder: 'اپنا پیغام درج کریں...',
      templateName: 'ٹیمپلیٹ کا نام (اختیاری)',
      templatePlaceholder: 'مثال: معاہدہ_یاد_دہانی',
      send: 'اطلاع بھیجیں',
      sending: 'بھیجا جا رہا ہے...',
      close: 'بند کریں',
      success: 'پیغام کامیابی سے بھیجا گیا!',
      error: 'پیغام بھیجنے میں ناکامی',
      templates: 'فوری ٹیمپلیٹس',
      contractReminder: 'معاہدہ ختم ہونے کی یاد دہانی',
      paymentDue: 'ادائیگی واجب الادا نوٹس',
      fineNotification: 'ٹریفک جرمانہ اطلاع',
      welcome: 'خوش آمدید پیغام',
    }
  };

  const t = texts[language];

  const quickTemplates = {
    contractReminder: `Dear Customer,\n\nThis is a reminder that your rental contract is expiring soon. Please contact us to renew or return the vehicle.\n\nThank you,\nNavEdge Fleet Management`,
    paymentDue: `Dear Customer,\n\nYour monthly rental payment is due. Please make the payment at your earliest convenience.\n\nAmount Due: AED [AMOUNT]\n\nThank you,\nNavEdge Fleet Management`,
    fineNotification: `Dear Customer,\n\nWe have detected a traffic fine on your rented vehicle. Please contact us for more details.\n\nThank you,\nNavEdge Fleet Management`,
    welcome: `Welcome to NavEdge Fleet Management!\n\nThank you for choosing our services. We're here to provide you with the best rental experience.\n\nFor any assistance, feel free to contact us.\n\nBest regards,\nNavEdge Team`,
  };

  const handleTemplateSelect = (template: keyof typeof quickTemplates) => {
    setMessage(quickTemplates[template]);
  };

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      // Try FastAPI backend first
      try {
        await FastAPIService.sendWhatsAppNotification(
          phoneNumber,
          message,
          templateName || undefined
        );

        setResult({
          success: true,
          message: t.success,
        });

        setTimeout(() => {
          onClose();
        }, 2000);
        setSending(false);
        return;
      } catch (apiError) {
        console.log('FastAPI unavailable, using mock notification:', apiError);
      }

      // Fallback to mock notification (demo mode)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResult({
        success: true,
        message: `${t.success} (Demo Mode - Message not actually sent)`,
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : t.error,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-green-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.templates}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTemplateSelect('contractReminder')}
                className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.contractReminder}
              </button>
              <button
                onClick={() => handleTemplateSelect('paymentDue')}
                className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.paymentDue}
              </button>
              <button
                onClick={() => handleTemplateSelect('fineNotification')}
                className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.fineNotification}
              </button>
              <button
                onClick={() => handleTemplateSelect('welcome')}
                className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.welcome}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.message}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.templateName}
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t.templatePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {result && (
            <div
              className={`flex items-center space-x-2 p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p
                className={`text-sm ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.message}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSend}
              disabled={!phoneNumber || !message || sending}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {sending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t.send}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSender;
