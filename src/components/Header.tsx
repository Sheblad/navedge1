import React from 'react';
import { Menu, User, Car, CarTaxiFront as Taxi, Brain, LogOut, Globe, Database } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface HeaderProps {
  fleetMode: FleetMode;
  setFleetMode: (mode: FleetMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  setShowNavEdgeAssistant: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  fleetMode, 
  setFleetMode, 
  language, 
  setLanguage, 
  setSidebarOpen, 
  onLogout,
  setShowNavEdgeAssistant 
}) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const texts = {
    en: {
      title: 'Fleet Dashboard',
      subtitle: 'Welcome back, manage your fleet efficiently',
      rental: 'Rental',
      taxi: 'Taxi',
      admin: 'Admin',
      navEdgeAssistant: 'NavEdge Assistant',
      backup: 'Backup & Restore',
      logout: 'Logout'
    },
    ar: {
      title: 'لوحة تحكم الأسطول',
      subtitle: 'مرحباً بك، أدر أسطولك بكفاءة',
      rental: 'تأجير',
      taxi: 'تاكسي',
      admin: 'المدير',
      navEdgeAssistant: 'مساعد نافيدج',
      backup: 'النسخ الاحتياطي والاستعادة',
      logout: 'تسجيل الخروج'
    },
    hi: {
      title: 'फ्लीट डैशबोर्ड',
      subtitle: 'वापस स्वागत है, अपने फ्लीट को कुशलता से प्रबंधित करें',
      rental: 'किराया',
      taxi: 'टैक्सी',
      admin: 'एडमिन',
      navEdgeAssistant: 'नेवएज असिस्टेंट',
      backup: 'बैकअप और रिस्टोर',
      logout: 'लॉग आउट'
    },
    ur: {
      title: 'فلیٹ ڈیش بورڈ',
      subtitle: 'واپس خوش آمدید، اپنے فلیٹ کو مؤثر طریقے سے منظم کریں',
      rental: 'کرایہ',
      taxi: 'ٹیکسی',
      admin: 'ایڈمن',
      navEdgeAssistant: 'نیو ایج اسسٹنٹ',
      backup: 'بیک اپ اور بحالی',
      logout: 'لاگ آؤٹ'
    }
  };

  const t = texts[language];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Fleet Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFleetMode('rental')}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${fleetMode === 'rental' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Car className="w-4 h-4" />
              <span>{t.rental}</span>
            </button>
            <button
              onClick={() => setFleetMode('taxi')}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${fleetMode === 'taxi' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Taxi className="w-4 h-4" />
              <span>{t.taxi}</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {languages.find(l => l.code === language)?.flag}
              </span>
            </button>
            
            {/* Language Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {language === lang.code && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Backup Button */}
          <button 
            onClick={() => window.location.href = '#/settings/backup'}
            className="p-2 rounded-lg hover:bg-gray-100"
            title={t.backup}
          >
            <Database className="w-5 h-5 text-gray-600" />
          </button>

          {/* NavEdge Assistant */}
          <button 
            onClick={() => setShowNavEdgeAssistant(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title={t.navEdgeAssistant}
          >
            <Brain className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <NotificationCenter 
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            language={language}
          />

          {/* Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{t.admin}</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;