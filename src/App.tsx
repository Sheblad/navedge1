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
import BackupManager from './components/BackupManager';
import DataMigration from './components/DataMigration';
import SystemAlerts from './components/SystemAlerts';
import { useDrivers, useFines } from './hooks/useDatabase';
import { useSystemAlerts } from './hooks/useSystemAlerts';
import { useNotifications } from './hooks/useNotifications';
import { useEarningsTracking } from './hooks/useEarningsTracking';
import { usePerformanceTracking } from './hooks/usePerformanceTracking';
import { DatabaseService } from './services/database';
import type { Driver } from './data/mockData';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'incidents' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

// Storage keys
const STORAGE_KEYS = {
  FLEET_MODE: 'navedge_fleet_mode',
  LANGUAGE: 'navedge_language',
  LAST_BACKUP: 'navedge_last_backup',
  AUTO_BACKUP: 'navedge_auto_backup',
  AUTO_BACKUP_INTERVAL: 'navedge_auto_backup_interval',
  NEXT_AUTO_BACKUP: 'navedge_next_auto_backup',
  MIGRATION_COMPLETE: 'navedge_migration_complete'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNavEdgeAssistant, setShowNavEdgeAssistant] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showDataMigration, setShowDataMigration] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Use database hooks
  const { 
    drivers, 
    loading: driversLoading, 
    error: driversError,
    addDriver,
    updateDriver,
    deleteDriver,
    bulkImportDrivers
  } = useDrivers();

  const { fines, loading: finesLoading } = useFines();

  // Use system alerts hook
  const { alerts, dismissAlert } = useSystemAlerts(language, fleetMode);

  // Use notifications hook
  const { 
    notifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    generateFineNotification,
    generateIncidentNotification
  } = useNotifications();

  // Use earnings tracking hook
  const { 
    simulateAutomaticEarnings,
    recordTripCompletion,
    recordRentalPayment
  } = useEarningsTracking(fleetMode);

  // Use performance tracking hook
  const {
    updateDriverPerformance,
    resetDailyMetrics
  } = usePerformanceTracking();

  // Load persisted settings on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
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
        const migrationComplete = localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE);
        const hasLocalData = localStorage.getItem('navedge_drivers');
        
        if (!migrationComplete && hasLocalData && token) {
          setShowDataMigration(true);
        }

        // Check for auto backup
        checkAutoBackup();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Save fleet mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLEET_MODE, fleetMode);
  }, [fleetMode]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  // Simulate automatic earnings for active drivers
  useEffect(() => {
    if (!drivers.length) return;
    
    // Simulate earnings every minute for taxi mode, every hour for rental mode
    const interval = setInterval(() => {
      simulateAutomaticEarnings(drivers);
    }, fleetMode === 'taxi' ? 60000 : 3600000);
    
    return () => clearInterval(interval);
  }, [drivers, fleetMode, simulateAutomaticEarnings]);

  // Set up midnight reset for daily metrics
  useEffect(() => {
    const setupMidnightReset = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0 // midnight
      );
      
      const msUntilMidnight = night.getTime() - now.getTime();
      
      return setTimeout(() => {
        // Reset daily metrics at midnight
        resetDailyMetrics(drivers);
        
        // Set up the next day's reset
        setupMidnightReset();
      }, msUntilMidnight);
    };
    
    const timerId = setupMidnightReset();
    return () => clearTimeout(timerId);
  }, [drivers, resetDailyMetrics]);

  // Check if auto backup is due
  const checkAutoBackup = () => {
    const autoBackupEnabled = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP) === 'enabled';
    if (!autoBackupEnabled) return;

    const nextBackupDate = localStorage.getItem(STORAGE_KEYS.NEXT_AUTO_BACKUP);
    if (!nextBackupDate) return;

    const now = new Date();
    const nextBackup = new Date(nextBackupDate);

    if (now >= nextBackup) {
      setShowBackupManager(true);
    }
  };

  // Handle login
  const handleLogin = (token: string) => {
    localStorage.setItem('navedge_token', token);
    setIsAuthenticated(true);
    
    // Check if migration is needed after login
    const migrationComplete = localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETE);
    const hasLocalData = localStorage.getItem('navedge_drivers');
    
    if (!migrationComplete && hasLocalData) {
      setShowDataMigration(true);
    }
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

  // Handle migration completion
  const handleMigrationComplete = () => {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETE, 'true');
    setShowDataMigration(false);
  };

  // Backup and restore functions
  const handleRestoreData = async (restoredDrivers: Driver[]) => {
    try {
      await bulkImportDrivers(restoredDrivers);
    } catch (error) {
      console.error('Error restoring data:', error);
      alert('Failed to restore data. Please try again.');
    }
  };

  const renderActivePage = () => {
    if (driversLoading && drivers.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading fleet data...</p>
          </div>
        </div>
      );
    }

    if (driversError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️ Database Connection Error</div>
            <p className="text-gray-600 mb-4">{driversError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

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

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Initializing NavEdge...</p>
        </div>
      </div>
    );
  }

  // Show data migration if needed
  if (showDataMigration) {
    return <DataMigration onMigrationComplete={handleMigrationComplete} />;
  }

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
          {/* System Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6">
              <SystemAlerts 
                alerts={alerts} 
                onDismiss={dismissAlert} 
                language={language} 
              />
            </div>
          )}
          
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

      {/* Backup Manager */}
      {showBackupManager && (
        <BackupManager 
          drivers={drivers}
          onRestoreData={handleRestoreData}
          onClose={() => setShowBackupManager(false)}
        />
      )}
    </div>
  );
}

export default App;