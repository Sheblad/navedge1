import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Car,
  CarTaxiFront as Taxi,
  Download,
  Upload,
  Database
} from 'lucide-react';
import BackupManager from './BackupManager';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface SettingsProps {
  fleetMode: FleetMode;
  setFleetMode: (mode: FleetMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ fleetMode, setFleetMode, language, setLanguage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [showBackupManager, setShowBackupManager] = useState(false);

  const texts = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your account settings and preferences',
      profile: 'Profile Settings',
      profileDesc: 'Manage your account information',
      notifications: 'Notifications',
      notificationsDesc: 'Configure your notification preferences',
      security: 'Security',
      securityDesc: 'Password and security settings',
      billing: 'Billing',
      billingDesc: 'Subscription and payment methods',
      preferences: 'Preferences',
      preferencesDesc: 'Language and regional settings',
      fleetSettings: 'Fleet Settings',
      fleetSettingsDesc: 'Fleet mode and operational preferences',
      backupRestore: 'Backup & Restore',
      backupRestoreDesc: 'Manage data backups and restoration',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      company: 'Company',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security to your account',
      enable2FA: 'Enable 2FA',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive notifications via email',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Receive push notifications in browser',
      smsNotifications: 'SMS Notifications',
      smsNotificationsDesc: 'Receive notifications via SMS',
      fleetMode: 'Fleet Mode',
      fleetModeDesc: 'Choose your primary fleet operation mode',
      rental: 'Rental Mode',
      taxi: 'Taxi Mode',
      rentalDesc: 'Focus on vehicle rentals and contracts',
      taxiDesc: 'Focus on taxi trips and shifts',
      languageSettings: 'Language',
      languageDesc: 'Choose your preferred language',
      english: 'English',
      arabic: 'العربية',
      hindi: 'हिंदी',
      urdu: 'اردو',
      saveChanges: 'Save Changes',
      billingTitle: 'Billing Settings',
      billingContent: 'Manage your subscription and payment methods',
      preferencesTitle: 'Additional Preferences',
      preferencesContent: 'Customize your experience',
      createBackup: 'Create Backup',
      restoreBackup: 'Restore Backup',
      manageBackups: 'Manage Backups & Restore',
      backupDesc: 'Create and manage backups of your fleet data'
    },
    ar: {
      title: 'الإعدادات',
      subtitle: 'إدارة إعدادات حسابك وتفضيلاتك',
      profile: 'إعدادات الملف الشخصي',
      profileDesc: 'إدارة معلومات حسابك',
      notifications: 'الإشعارات',
      notificationsDesc: 'تكوين تفضيلات الإشعارات',
      security: 'الأمان',
      securityDesc: 'إعدادات كلمة المرور والأمان',
      billing: 'الفواتير',
      billingDesc: 'الاشتراك وطرق الدفع',
      preferences: 'التفضيلات',
      preferencesDesc: 'إعدادات اللغة والمنطقة',
      fleetSettings: 'إعدادات الأسطول',
      fleetSettingsDesc: 'وضع الأسطول والتفضيلات التشغيلية',
      backupRestore: 'النسخ الاحتياطي والاستعادة',
      backupRestoreDesc: 'إدارة النسخ الاحتياطي واستعادة البيانات',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'عنوان البريد الإلكتروني',
      phone: 'رقم الهاتف',
      company: 'الشركة',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور الجديدة',
      twoFactor: 'المصادقة الثنائية',
      twoFactorDesc: 'إضافة طبقة أمان إضافية لحسابك',
      enable2FA: 'تفعيل المصادقة الثنائية',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      emailNotificationsDesc: 'تلقي الإشعارات عبر البريد الإلكتروني',
      pushNotifications: 'الإشعارات المنبثقة',
      pushNotificationsDesc: 'تلقي الإشعارات المنبثقة في المتصفح',
      smsNotifications: 'إشعارات الرسائل النصية',
      smsNotificationsDesc: 'تلقي الإشعارات عبر الرسائل النصية',
      fleetMode: 'وضع الأسطول',
      fleetModeDesc: 'اختر وضع تشغيل الأسطول الأساسي',
      rental: 'وضع الإيجار',
      taxi: 'وضع التاكسي',
      rentalDesc: 'التركيز على تأجير المركبات والعقود',
      taxiDesc: 'التركيز على رحلات التاكسي والمناوبات',
      languageSettings: 'اللغة',
      languageDesc: 'اختر لغتك المفضلة',
      english: 'English',
      arabic: 'العربية',
      hindi: 'हिंदी',
      urdu: 'اردو',
      saveChanges: 'حفظ التغييرات',
      billingTitle: 'إعدادات الفواتير',
      billingContent: 'إدارة اشتراكك وطرق الدفع',
      preferencesTitle: 'التفضيلات الإضافية',
      preferencesContent: 'تخصيص تجربتك',
      createBackup: 'إنشاء نسخة احتياطية',
      restoreBackup: 'استعادة النسخة الاحتياطية',
      manageBackups: 'إدارة النسخ الاحتياطية والاستعادة',
      backupDesc: 'إنشاء وإدارة النسخ الاحتياطية لبيانات أسطولك'
    },
    hi: {
      title: 'सेटिंग्स',
      subtitle: 'अपने खाते की सेटिंग्स और प्राथमिकताएं प्रबंधित करें',
      profile: 'प्रोफ़ाइल सेटिंग्स',
      profileDesc: 'अपने खाते की जानकारी प्रबंधित करें',
      notifications: 'सूचनाएं',
      notificationsDesc: 'अपनी सूचना प्राथमिकताएं कॉन्फ़िगर करें',
      security: 'सुरक्षा',
      securityDesc: 'पासवर्ड और सुरक्षा सेटिंग्स',
      billing: 'बिलिंग',
      billingDesc: 'सदस्यता और भुगतान विधियां',
      preferences: 'प्राथमिकताएं',
      preferencesDesc: 'भाषा और क्षेत्रीय सेटिंग्स',
      fleetSettings: 'फ्लीट सेटिंग्स',
      fleetSettingsDesc: 'फ्लीट मोड और संचालन प्राथमिकताएं',
      backupRestore: 'बैकअप और रिस्टोर',
      backupRestoreDesc: 'डेटा बैकअप और रिस्टोरेशन प्रबंधित करें',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      email: 'ईमेल पता',
      phone: 'फोन नंबर',
      company: 'कंपनी',
      currentPassword: 'वर्तमान पासवर्ड',
      newPassword: 'नया पासवर्ड',
      confirmPassword: 'नए पासवर्ड की पुष्टि करें',
      twoFactor: 'दो-कारक प्रमाणीकरण',
      twoFactorDesc: 'अपने खाते में अतिरिक्त सुरक्षा परत जोड़ें',
      enable2FA: '2FA सक्षम करें',
      emailNotifications: 'ईमेल सूचनाएं',
      emailNotificationsDesc: 'ईमेल के माध्यम से सूचनाएं प्राप्त करें',
      pushNotifications: 'पुश सूचनाएं',
      pushNotificationsDesc: 'ब्राउज़र में पुश सूचनाएं प्राप्त करें',
      smsNotifications: 'एसएमएस सूचनाएं',
      smsNotificationsDesc: 'एसएमएस के माध्यम से सूचनाएं प्राप्त करें',
      fleetMode: 'फ्लीट मोड',
      fleetModeDesc: 'अपना प्राथमिक फ्लीट संचालन मोड चुनें',
      rental: 'रेंटल मोड',
      taxi: 'टैक्सी मोड',
      rentalDesc: 'वाहन किराये और अनुबंधों पर ध्यान केंद्रित करें',
      taxiDesc: 'टैक्सी यात्राओं और शिफ्ट पर ध्यान केंद्रित करें',
      languageSettings: 'भाषा',
      languageDesc: 'अपनी पसंदीदा भाषा चुनें',
      english: 'English',
      arabic: 'العربية',
      hindi: 'हिंदी',
      urdu: 'اردو',
      saveChanges: 'परिवर्तन सहेजें',
      billingTitle: 'बिलिंग सेटिंग्स',
      billingContent: 'अपनी सदस्यता और भुगतान विधियों का प्रबंधन करें',
      preferencesTitle: 'अतिरिक्त प्राथमिकताएं',
      preferencesContent: 'अपने अनुभव को अनुकूलित करें',
      createBackup: 'बैकअप बनाएं',
      restoreBackup: 'बैकअप रिस्टोर करें',
      manageBackups: 'बैकअप और रिस्टोर प्रबंधित करें',
      backupDesc: 'अपने फ्लीट डेटा के बैकअप बनाएं और प्रबंधित करें'
    },
    ur: {
      title: 'سیٹنگز',
      subtitle: 'اپنے اکاؤنٹ کی سیٹنگز اور ترجیحات کا انتظام کریں',
      profile: 'پروفائل سیٹنگز',
      profileDesc: 'اپنے اکاؤنٹ کی معلومات کا انتظام کریں',
      notifications: 'نوٹیفیکیشنز',
      notificationsDesc: 'اپنی نوٹیفیکیشن ترجیحات کو کنفیگر کریں',
      security: 'سیکیورٹی',
      securityDesc: 'پاس ورڈ اور سیکیورٹی سیٹنگز',
      billing: 'بلنگ',
      billingDesc: 'سبسکرپشن اور ادائیگی کے طریقے',
      preferences: 'ترجیحات',
      preferencesDesc: 'زبان اور علاقائی سیٹنگز',
      fleetSettings: 'فلیٹ سیٹنگز',
      fleetSettingsDesc: 'فلیٹ موڈ اور آپریشنل ترجیحات',
      backupRestore: 'بیک اپ اور بحالی',
      backupRestoreDesc: 'ڈیٹا بیک اپ اور بحالی کا انتظام کریں',
      firstName: 'پہلا نام',
      lastName: 'آخری نام',
      email: 'ای میل ایڈریس',
      phone: 'فون نمبر',
      company: 'کمپنی',
      currentPassword: 'موجودہ پاس ورڈ',
      newPassword: 'نیا پاس ورڈ',
      confirmPassword: 'نئے پاس ورڈ کی تصدیق کریں',
      twoFactor: 'دو عنصری تصدیق',
      twoFactorDesc: 'اپنے اکاؤنٹ میں اضافی سیکیورٹی لیئر شامل کریں',
      enable2FA: '2FA فعال کریں',
      emailNotifications: 'ای میل نوٹیفیکیشنز',
      emailNotificationsDesc: 'ای میل کے ذریعے نوٹیفیکیشنز حاصل کریں',
      pushNotifications: 'پش نوٹیفیکیشنز',
      pushNotificationsDesc: 'براؤزر میں پش نوٹیفیکیشنز حاصل کریں',
      smsNotifications: 'ایس ایم ایس نوٹیفیکیشنز',
      smsNotificationsDesc: 'ایس ایم ایس کے ذریعے نوٹیفیکیشنز حاصل کریں',
      fleetMode: 'فلیٹ موڈ',
      fleetModeDesc: 'اپنا بنیادی فلیٹ آپریشن موڈ منتخب کریں',
      rental: 'کرایہ موڈ',
      taxi: 'ٹیکسی موڈ',
      rentalDesc: 'گاڑیوں کے کرایہ اور کنٹریکٹس پر توجہ دیں',
      taxiDesc: 'ٹیکسی سفر اور شفٹس پر توجہ دیں',
      languageSettings: 'زبان',
      languageDesc: 'اپنی پسندیدہ زبان منتخب کریں',
      english: 'English',
      arabic: 'العربية',
      hindi: 'हिंदी',
      urdu: 'اردو',
      saveChanges: 'تبدیلیاں محفوظ کریں',
      billingTitle: 'بلنگ سیٹنگز',
      billingContent: 'اپنی سبسکرپشن اور ادائیگی کے طریقوں کا انتظام کریں',
      preferencesTitle: 'اضافی ترجیحات',
      preferencesContent: 'اپنے تجربے کو اپنی مرضی کے مطابق بنائیں',
      createBackup: 'بیک اپ بنائیں',
      restoreBackup: 'بیک اپ بحال کریں',
      manageBackups: 'بیک اپ اور بحالی کا انتظام کریں',
      backupDesc: 'اپنے فلیٹ ڈیٹا کے بیک اپ بنائیں اور انتظام کریں'
    }
  };

  const t = texts[language];

  const settingSections = [
    {
      id: 'profile',
      title: t.profile,
      icon: User,
      description: t.profileDesc
    },
    {
      id: 'fleet',
      title: t.fleetSettings,
      icon: fleetMode === 'rental' ? Car : Taxi,
      description: t.fleetSettingsDesc
    },
    {
      id: 'backup',
      title: t.backupRestore,
      icon: Database,
      description: t.backupRestoreDesc
    },
    {
      id: 'notifications',
      title: t.notifications,
      icon: Bell,
      description: t.notificationsDesc
    },
    {
      id: 'security',
      title: t.security,
      icon: Shield,
      description: t.securityDesc
    },
    {
      id: 'billing',
      title: t.billing,
      icon: CreditCard,
      description: t.billingDesc
    },
    {
      id: 'preferences',
      title: t.preferences,
      icon: Globe,
      description: t.preferencesDesc
    }
  ];

  const [activeSection, setActiveSection] = useState('profile');

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.firstName}
          </label>
          <input
            type="text"
            defaultValue="Fleet"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.lastName}
          </label>
          <input
            type="text"
            defaultValue="Manager"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.email}
        </label>
        <input
          type="email"
          defaultValue="admin@navedge.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.phone}
        </label>
        <input
          type="tel"
          defaultValue="+971 50 123 4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.company}
        </label>
        <input
          type="text"
          defaultValue="NavEdge Fleet Management"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderFleetSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t.fleetMode}</h4>
        <p className="text-sm text-gray-600 mb-6">{t.fleetModeDesc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              fleetMode === 'rental' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFleetMode('rental')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Car className={`w-6 h-6 ${fleetMode === 'rental' ? 'text-blue-600' : 'text-gray-500'}`} />
              <h5 className={`font-medium ${fleetMode === 'rental' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.rental}
              </h5>
            </div>
            <p className={`text-sm ${fleetMode === 'rental' ? 'text-blue-700' : 'text-gray-600'}`}>
              {t.rentalDesc}
            </p>
          </div>
          
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              fleetMode === 'taxi' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFleetMode('taxi')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Taxi className={`w-6 h-6 ${fleetMode === 'taxi' ? 'text-blue-600' : 'text-gray-500'}`} />
              <h5 className={`font-medium ${fleetMode === 'taxi' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.taxi}
              </h5>
            </div>
            <p className={`text-sm ${fleetMode === 'taxi' ? 'text-blue-700' : 'text-gray-600'}`}>
              {t.taxiDesc}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t.languageSettings}</h4>
        <p className="text-sm text-gray-600 mb-6">{t.languageDesc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              language === 'en' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setLanguage('en')}
          >
            <div className="flex items-center space-x-3">
              <Globe className={`w-5 h-5 ${language === 'en' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${language === 'en' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.english}
              </span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              language === 'ar' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setLanguage('ar')}
          >
            <div className="flex items-center space-x-3">
              <Globe className={`w-5 h-5 ${language === 'ar' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${language === 'ar' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.arabic}
              </span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              language === 'hi' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setLanguage('hi')}
          >
            <div className="flex items-center space-x-3">
              <Globe className={`w-5 h-5 ${language === 'hi' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${language === 'hi' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.hindi}
              </span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              language === 'ur' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setLanguage('ur')}
          >
            <div className="flex items-center space-x-3">
              <Globe className={`w-5 h-5 ${language === 'ur' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${language === 'ur' ? 'text-blue-900' : 'text-gray-900'}`}>
                {t.urdu}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Data Backup & Restore</h3>
        <p className="text-blue-800 text-sm mb-4">
          Protect your fleet data by creating regular backups. You can restore your data from these backups if needed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">{t.createBackup}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create a backup file of all your fleet data that you can download and store safely.
            </p>
            <button
              onClick={() => setShowBackupManager(true)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.createBackup}
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">{t.restoreBackup}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Restore your fleet data from a previously created backup file.
            </p>
            <button
              onClick={() => setShowBackupManager(true)}
              className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t.restoreBackup}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Advanced Backup Options</h4>
          <button
            onClick={() => setShowBackupManager(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {t.manageBackups}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Automatic Backups</p>
              <p className="text-sm text-gray-600">Schedule regular backups of your data</p>
            </div>
            <button
              onClick={() => setShowBackupManager(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Configure
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Export All Data</p>
              <p className="text-sm text-gray-600">Export all your data in JSON format</p>
            </div>
            <button
              onClick={() => setShowBackupManager(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Reset All Data</p>
              <p className="text-sm text-gray-600">Reset to default sample data</p>
            </div>
            <button
              onClick={() => setShowBackupManager(true)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{t.emailNotifications}</h4>
            <p className="text-sm text-gray-500">{t.emailNotificationsDesc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{t.pushNotifications}</h4>
            <p className="text-sm text-gray-500">{t.pushNotificationsDesc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{t.smsNotifications}</h4>
            <p className="text-sm text-gray-500">{t.smsNotificationsDesc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.currentPassword}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.newPassword}
        </label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.confirmPassword}
        </label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">{t.twoFactor}</h4>
        <p className="text-sm text-blue-700 mb-3">
          {t.twoFactorDesc}
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t.enable2FA}
        </button>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'fleet':
        return renderFleetSettings();
      case 'backup':
        return renderBackupSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'billing':
        return (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.billingTitle}</h3>
            <p className="text-gray-500">{t.billingContent}</p>
          </div>
        );
      case 'preferences':
        return (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.preferencesTitle}</h3>
            <p className="text-gray-500">{t.preferencesContent}</p>
          </div>
        );
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      activeSection === section.id ? 'text-blue-700' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {settingSections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-gray-600">
                {settingSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            {renderActiveSection()}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Manager Modal */}
      {showBackupManager && (
        <BackupManager 
          drivers={[]}  // This will be populated from App.tsx
          onRestoreData={() => {}}  // This will be implemented in App.tsx
          onClose={() => setShowBackupManager(false)}
        />
      )}
    </div>
  );
};

export default Settings;