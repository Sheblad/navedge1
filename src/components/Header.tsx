import React from 'react';
import { Menu, Bell, User, Car, CarTaxiFront as Taxi } from 'lucide-react';

type FleetMode = 'rental' | 'taxi';

interface HeaderProps {
  fleetMode: FleetMode;
  setFleetMode: (mode: FleetMode) => void;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ fleetMode, setFleetMode, setSidebarOpen }) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Fleet Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, manage your fleet efficiently</p>
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
              <span>Rental</span>
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
              <span>Taxi</span>
            </button>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;