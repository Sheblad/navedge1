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
  
  // Shared drivers state with persistent storage
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('navedge_token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Load drivers from localStorage, fallback to mock data if none exist
    const savedDrivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    if (savedDrivers) {
      try {
        const parsedDrivers = JSON.parse(savedDrivers);
        setDrivers(parsedDrivers);
        console.log('Loaded drivers from storage:', parsedDrivers.length, 'drivers');
      } catch (error) {
        console.error('Error parsing saved drivers:', error);
        setDrivers(mockDriversData);
        localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(mockDriversData));
      }
    } else {
      // First time - save mock data to localStorage
      setDrivers(mockDriversData);
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(mockDriversData));
      console.log('Initialized drivers storage with mock data');
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
  }, []);

  // Save drivers to localStorage whenever drivers state changes
  useEffect(() => {
    if (drivers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      console.log('Saved drivers to storage:', drivers.length, 'drivers');
    }
  }, [drivers]);

  // Save fleet mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLEET_MODE, fleetMode);
  }, [fleetMode]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

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

  // Handle adding new driver with persistent storage
  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prevDrivers => {
      const updatedDrivers = [...prevDrivers, newDriver];
      console.log('Added new driver:', newDriver.name, '- Total drivers:', updatedDrivers.length);
      return updatedDrivers;
    });
  };

  // Handle updating existing driver
  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDrivers(prevDrivers => {
      const updatedDrivers = prevDrivers.map(driver => 
        driver.id === updatedDriver.id ? updatedDriver : driver
      );
      console.log('Updated driver:', updatedDriver.name);
      return updatedDrivers;
    });
  };

  // Handle removing driver
  const handleRemoveDriver = (driverId: number) => {
    setDrivers(prevDrivers => {
      const updatedDrivers = prevDrivers.filter(driver => driver.id !== driverId);
      console.log('Removed driver ID:', driverId, '- Remaining drivers:', updatedDrivers.length);
      return updatedDrivers;
    });
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
              onRemoveDriver={handleRemoveDriver}
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
          {renderActivePage()}
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