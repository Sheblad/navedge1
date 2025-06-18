import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  AlertTriangle,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Phone,
  Navigation,
  Car,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  LogOut,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';
import { mockDriversData, mockFinesData } from '../data/mockData';

interface MobileOwnerAppProps {
  ownerData: any;
  onLogout: () => void;
}

type ActivePage = 'dashboard' | 'drivers' | 'map' | 'fines' | 'reports' | 'settings';

const MobileOwnerApp: React.FC<MobileOwnerAppProps> = ({ ownerData, onLogout }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drivers, setDrivers] = useState(mockDriversData);
  const [fines, setFines] = useState(mockFinesData);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Ahmed Al-Rashid completed trip', time: '2 min ago', type: 'success' },
    { id: 2, message: 'New fine recorded for Omar Khalil', time: '5 min ago', type: 'warning' },
    { id: 3, message: 'Vehicle DXB-A-12345 maintenance due', time: '1 hour ago', type: 'info' }
  ]);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor battery
  useEffect(() => {
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };

    updateBattery();
    const interval = setInterval(updateBattery, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const pendingFines = fines.filter(f => f.status === 'pending').length;
  const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'fines', label: 'Fines', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">NavEdge Fleet</h1>
            <p className="text-sm text-blue-100">{ownerData.company}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-300" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" />
            )}
          </div>
          
          {/* Battery */}
          <div className="flex items-center space-x-1">
            <Battery className="w-4 h-4" />
            <span className="text-xs">{batteryLevel}%</span>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col safe-area-top
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">NavEdge</h2>
              <p className="text-sm text-gray-500">Fleet Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as ActivePage);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="font-medium text-lg">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 safe-area-bottom">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{ownerData.avatar}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{ownerData.name}</h3>
              <p className="text-sm text-gray-500">Fleet Owner</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  const renderDashboard = () => (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{activeDrivers.length}</p>
              <p className="text-xs text-green-600 mt-1">+2 today</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+15% vs yesterday</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Fines</p>
              <p className="text-2xl font-bold text-gray-900">{pendingFines}</p>
              <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{avgPerformance.toFixed(1)}%</p>
              <p className="text-xs text-green-600 mt-1">Excellent</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-blue-600 text-white rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Add Driver</span>
        </button>
        <button className="bg-green-600 text-white rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-green-700 transition-colors">
          <MapPin className="w-6 h-6" />
          <span className="text-sm font-medium">View Map</span>
        </button>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search drivers..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Driver List */}
      <div className="space-y-3">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{driver.avatar}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-500">{driver.vehicleId || 'No vehicle'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  driver.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {driver.status}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Trips</p>
                <p className="font-semibold text-gray-900">{driver.trips}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="font-semibold text-gray-900">${driver.earnings}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance</p>
                <p className="font-semibold text-gray-900">{driver.performanceScore}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Fleet Tracking</h2>
        <p className="text-sm text-gray-600">{activeDrivers.length} drivers active</p>
      </div>
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Interactive map would be displayed here</p>
          <p className="text-sm text-gray-500 mt-2">Showing real-time driver locations</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'drivers':
        return renderDrivers();
      case 'map':
        return renderMap();
      case 'fines':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fines Management</h2>
            <p className="text-gray-600">Fines management interface would be here</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reports and analytics would be here</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings interface would be here</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderHeader()}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto safe-area-bottom">
        {renderContent()}
      </div>

      {/* Bottom Navigation (Alternative to sidebar) */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as ActivePage)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileOwnerApp;