import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Drivers from './components/Drivers';
import Fines from './components/Fines';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import Contracts from './components/Contracts';
import Incidents from './components/Incidents';
import Chat from './components/Chat';
import ErrorBoundary from './components/ErrorBoundary';
import { mockDriversData } from './data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [drivers, setDrivers] = useState(mockDriversData);

  // Check for saved authentication state
  useEffect(() => {
    const savedAuth = localStorage.getItem('navedge_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    // Simple authentication logic
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('navedge_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('navedge_auth');
    setCurrentView('dashboard');
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

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard fleetMode={fleetMode} language={language} drivers={drivers} />
          </ErrorBoundary>
        );
      case 'drivers':
        return (
          <ErrorBoundary>
            <Drivers fleetMode={fleetMode} language={language} drivers={drivers} setDrivers={setDrivers} />
          </ErrorBoundary>
        );
      case 'fines':
        return (
          <ErrorBoundary>
            <Fines fleetMode={fleetMode} language={language} />
          </ErrorBoundary>
        );
      case 'contracts':
        return (
          <ErrorBoundary>
            <Contracts fleetMode={fleetMode} language={language} />
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
      case 'chat':
        return (
          <ErrorBoundary>
            <Chat fleetMode={fleetMode} language={language} />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        fleetMode={fleetMode} 
        language={language} 
        onLogout={handleLogout}
      />
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          fleetMode={fleetMode}
          language={language}
        />
        <main className="flex-1 p-6 ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;