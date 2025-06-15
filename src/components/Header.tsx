import React from 'react';
import { Menu, Bell, User, Car, CarTaxiFront as Taxi, Bot, LogOut, Globe } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface HeaderProps {
  fleetMode: FleetMode;
  setFleetMode: (mode: FleetMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  setShowAIAssistant: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  fleetMode, 
  setFleetMode, 
  language, 
  setLanguage, 
  setSidebarOpen, 
  onLogout,
  setShowAIAssistant 
}) => {
  const texts = {
    en: {
      title: 'Fleet Dashboard',
      subtitle: 'Welcome back, manage your fleet efficiently',
      rental: 'Rental',
      taxi: 'Taxi',
      admin: 'Admin',
      aiAssistant: 'AI Assistant',
      logout: 'Logout'
    },
    ar: {
      title: 'لوحة تحكم الأسطول',
      subtitle: 'مرحباً بك، أدر أسطولك بكفاءة',
      rental: 'تأجير',
      taxi: 'تاكسي',
      admin: 'المدير',
      aiAssistant: 'المساعد الذكي',
      logout: 'تسجيل الخروج'
    }
  };

  const t = texts[language];

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

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 rounded-lg hover:bg-gray-100"
            title={language === 'en' ? 'العربية' : 'English'}
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>

          {/* AI Assistant */}
          <button 
            onClick={() => setShowAIAssistant(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title={t.aiAssistant}
          >
            <Bot className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

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