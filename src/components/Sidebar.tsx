import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageCircle, 
  Settings, 
  Navigation,
  X
} from 'lucide-react';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'chat' | 'settings';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const menuItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drivers' as ActivePage, label: 'Drivers', icon: Users },
    { id: 'contracts' as ActivePage, label: 'Contracts', icon: FileText },
    { id: 'chat' as ActivePage, label: 'Chat', icon: MessageCircle },
    { id: 'settings' as ActivePage, label: 'Settings', icon: Settings },
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
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

        {/* Navigation */}
        <nav className="p-4 space-y-2">
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
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            NavEdge Fleet Management
            <br />
            Version 2.1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;