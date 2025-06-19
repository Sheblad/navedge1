import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle,
  BarChart3,
  Settings, 
  Navigation,
  X,
  ShieldAlert
} from 'lucide-react';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'incidents' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  language: Language;
  fleetMode: FleetMode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  sidebarOpen, 
  setSidebarOpen,
  language,
  fleetMode
}) => {
  const texts = {
    en: {
      dashboard: 'Dashboard',
      drivers: 'Drivers',
      contracts: fleetMode === 'rental' ? 'Contracts' : 'Shifts',
      fines: 'Fines',
      incidents: 'Incidents',
      reports: 'Reports',
      settings: 'Settings',
      version: 'Version 2.1.0'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      drivers: 'السائقون',
      contracts: fleetMode === 'rental' ? 'العقود' : 'المناوبات',
      fines: 'المخالفات',
      incidents: 'الحوادث',
      reports: 'التقارير',
      settings: 'الإعدادات',
      version: 'الإصدار 2.1.0'
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      drivers: 'ड्राइवर',
      contracts: fleetMode === 'rental' ? 'अनुबंध' : 'शिफ्ट',
      fines: 'जुर्माना',
      incidents: 'घटनाएं',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स',
      version: 'संस्करण 2.1.0'
    },
    ur: {
      dashboard: 'ڈیش بورڈ',
      drivers: 'ڈرائیورز',
      contracts: fleetMode === 'rental' ? 'کنٹریکٹس' : 'شفٹس',
      fines: 'جرمانے',
      incidents: 'واقعات',
      reports: 'رپورٹس',
      settings: 'سیٹنگز',
      version: 'ورژن 2.1.0'
    }
  };

  const t = texts[language];

  const menuItems = [
    { id: 'dashboard' as ActivePage, label: t.dashboard, icon: LayoutDashboard },
    { id: 'drivers' as ActivePage, label: t.drivers, icon: Users },
    { id: 'contracts' as ActivePage, label: t.contracts, icon: FileText },
    { id: 'fines' as ActivePage, label: t.fines, icon: AlertTriangle },
    { id: 'incidents' as ActivePage, label: t.incidents, icon: ShieldAlert },
    { id: 'reports' as ActivePage, label: t.reports, icon: BarChart3 },
    { id: 'settings' as ActivePage, label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 ${language === 'ar' || language === 'ur' ? 'right-0' : 'left-0'} z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : (language === 'ar' || language === 'ur' ? 'translate-x-full' : '-translate-x-full')}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NavEdge</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation - with flex-1 to take available space */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${isActive 
                    ? `bg-blue-50 text-blue-700 ${language === 'ar' || language === 'ur' ? 'border-l-2' : 'border-r-2'} border-blue-700` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer - fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            NavEdge Fleet Management
            <br />
            {t.version}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;