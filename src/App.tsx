import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Drivers from './components/Drivers';
import Contracts from './components/Contracts';
import Fines from './components/Fines';
import Incidents from './components/Incidents';
import NavEdgeAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { mockDriversData } from './data/mockData';
import type { Driver } from './data/mockData';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'incidents' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

// Storage keys
const STORAGE_KEYS = {
  DRIVERS: 'navedge_drivers',
  FLEET_MODE: 'navedge_fleet_mode',
  LANGUAGE: 'navedge_language'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNavEdgeAssistant, setShowNavEdgeAssistant] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>(mockDriversData);
  const [loading, setLoading] = useState(false);
  
  // Load persisted data on mount
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('navedge_token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Load fleet mode
    const savedFleetMode = localStorage.getItem(STORAGE_KEYS.FLEET_MODE);
    if (savedFleetMode && (savedFleetMode === 'rental' || savedFleetMode === 'taxi')) {
      setFleetMode(savedFleetMode as FleetMode);
    }

    // Load language
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && ['en', 'ar', 'hi', 'ur'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }

    // Load drivers from localStorage
    const savedDrivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    if (savedDrivers) {
      try {
        setDrivers(JSON.parse(savedDrivers));
      } catch (e) {
        console.error('Error parsing drivers from localStorage:', e);
      }
    }
  }, []);

  // Save fleet mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLEET_MODE, fleetMode);
  }, [fleetMode]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  // Save drivers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  // Handle login - expects a token string
  const handleLogin = (token: string) => {
    localStorage.setItem('navedge_token', token);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('navedge_token');
    setIsAuthenticated(false);
  };

  // Handle fleet mode change from NavEdge Assistant
  const handleFleetModeChange = (mode: FleetMode) => {
    setFleetMode(mode);
  };

  // Driver management functions
  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prev => [...prev, newDriver]);
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === updatedDriver.id ? updatedDriver : driver
    ));
  };

  const handleDeleteDriver = (driverId: number) => {
    setDrivers(prev => prev.filter(driver => driver.id !== driverId));
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard fleetMode={fleetMode} language={language} drivers={drivers} />
          </ErrorBoundary>
        );
      case 'drivers':
        return (
          <ErrorBoundary>
            <Drivers 
              fleetMode={fleetMode} 
              language={language} 
              drivers={drivers} 
              onAddDriver={handleAddDriver}
              onUpdateDriver={handleUpdateDriver}
              onRemoveDriver={handleDeleteDriver}
            />
          </ErrorBoundary>
        );
      case 'contracts':
        return (
          <ErrorBoundary>
            <Contracts fleetMode={fleetMode} language={language} />
          </ErrorBoundary>
        );
      case 'fines':
        return (
          <ErrorBoundary>
            <Fines fleetMode={fleetMode} language={language} />
          </ErrorBoundary>
        );
      case 'incidents':
        return (
          <ErrorBoundary>
            <Incidents fleetMode={fleetMode} language={language} />
          </ErrorBoundary>
        );
      case 'reports':
        return (
          <ErrorBoundary>
            <Reports fleetMode={fleetMode} language={language} />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <Settings 
              fleetMode={fleetMode} 
              setFleetMode={setFleetMode}
              language={language}
              setLanguage={setLanguage}
            />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <Dashboard fleetMode={fleetMode} language={language} drivers={drivers} />
          </ErrorBoundary>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login 
          onLogin={handleLogin} 
          language={language}
          setLanguage={setLanguage}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex ${language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        language={language}
        fleetMode={fleetMode}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header 
          fleetMode={fleetMode}
          setFleetMode={setFleetMode}
          language={language}
          setLanguage={setLanguage}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          setShowNavEdgeAssistant={setShowNavEdgeAssistant}
        />
        
        <main className="flex-1 p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading fleet data...</p>
              </div>
            </div>
          ) : (
            renderActivePage()
          )}
        </main>
      </div>

      {/* NavEdge Assistant */}
      {showNavEdgeAssistant && (
        <NavEdgeAssistant 
          onClose={() => setShowNavEdgeAssistant(false)}
          fleetMode={fleetMode}
          language={language}
          onFleetModeChange={handleFleetModeChange}
        />
      )}
    </div>
  );
}

export default App;