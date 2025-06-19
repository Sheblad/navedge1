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
import DataMigration from './components/DataMigration';
import { mockDriversData } from './data/mockData';
import type { Driver } from './data/mockData';
import { useDrivers } from './hooks/useDatabase';
import { supabase } from './services/database';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'incidents' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

// Storage keys
const STORAGE_KEYS = {
  DRIVERS: 'navedge_drivers',
  FLEET_MODE: 'navedge_fleet_mode',
  LANGUAGE: 'navedge_language',
  MIGRATION_COMPLETED: 'navedge_migration_completed'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNavEdgeAssistant, setShowNavEdgeAssistant] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  
  // Use the database hook for drivers
  const { 
    drivers, 
    loading: driversLoading, 
    addDriver, 
    updateDriver, 
    deleteDriver 
  } = useDrivers();

  // Check if Supabase is configured
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      setIsSupabaseConfigured(true);
    } else {
      console.warn('Supabase not configured. Using localStorage fallback.');
      setIsSupabaseConfigured(false);
    }
  }, []);

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

    // Check if migration is needed
    const migrationCompleted = localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETED);
    if (isSupabaseConfigured && !migrationCompleted && isAuthenticated) {
      setShowMigration(true);
    }
  }, [isAuthenticated, isSupabaseConfigured]);

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
    
    // Check if migration is needed after login
    const migrationCompleted = localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETED);
    if (isSupabaseConfigured && !migrationCompleted) {
      setShowMigration(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Sign out from Supabase if configured
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    
    localStorage.removeItem('navedge_token');
    setIsAuthenticated(false);
  };

  // Handle fleet mode change from NavEdge Assistant
  const handleFleetModeChange = (mode: FleetMode) => {
    setFleetMode(mode);
  };

  // Handle migration completion
  const handleMigrationComplete = () => {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETED, 'true');
    setShowMigration(false);
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
              onAddDriver={addDriver}
              onUpdateDriver={updateDriver}
              onRemoveDriver={deleteDriver}
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

  if (showMigration) {
    return (
      <ErrorBoundary>
        <DataMigration onMigrationComplete={handleMigrationComplete} />
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
          {driversLoading ? (
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