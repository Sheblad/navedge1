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
import { mockDriversData } from './data/mockData';
import type { Driver } from './data/mockData';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'incidents' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNavEdgeAssistant, setShowNavEdgeAssistant] = useState(false);
  
  // Shared drivers state
  const [drivers, setDrivers] = useState<Driver[]>(mockDriversData);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('navedge_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle login
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

  // Handle adding new driver
  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prevDrivers => [...prevDrivers, newDriver]);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard fleetMode={fleetMode} language={language} drivers={drivers} />;
      case 'drivers':
        return <Drivers fleetMode={fleetMode} language={language} drivers={drivers} onAddDriver={handleAddDriver} />;
      case 'contracts':
        return <Contracts fleetMode={fleetMode} language={language} />;
      case 'fines':
        return <Fines fleetMode={fleetMode} language={language} />;
      case 'incidents':
        return <Incidents fleetMode={fleetMode} language={language} />;
      case 'reports':
        return <Reports fleetMode={fleetMode} language={language} />;
      case 'settings':
        return <Settings 
          fleetMode={fleetMode} 
          setFleetMode={setFleetMode}
          language={language}
          setLanguage={setLanguage}
        />;
      default:
        return <Dashboard fleetMode={fleetMode} language={language} drivers={drivers} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
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