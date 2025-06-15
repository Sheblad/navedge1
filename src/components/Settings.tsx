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
  CarTaxiFront as Taxi
} from 'lucide-react';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

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
      saveChanges: 'Save Changes',
      billingTitle: 'Billing Settings',
      billingContent: 'Manage your subscription and payment methods',
      preferencesTitle: 'Additional Preferences',
      preferencesContent: 'Customize your experience'
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
      saveChanges: 'حفظ التغييرات',
      billingTitle: 'إعدادات الفواتير',
      billingContent: 'إدارة اشتراكك وطرق الدفع',
      preferencesTitle: 'التفضيلات الإضافية',
      preferencesContent: 'تخصيص تجربتك'
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
    </div>
  );
};

export default Settings;