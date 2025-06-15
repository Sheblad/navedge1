import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Drivers from './components/Drivers';
import Contracts from './components/Contracts';
import Fines from './components/Fines';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'fines' | 'reports' | 'settings';
type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

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

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard fleetMode={fleetMode} language={language} />;
      case 'drivers':
        return <Drivers fleetMode={fleetMode} language={language} />;
      case 'contracts':
        return <Contracts fleetMode={fleetMode} language={language} />;
      case 'fines':
        return <Fines fleetMode={fleetMode} language={language} />;
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
        return <Dashboard fleetMode={fleetMode} language={language} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex ${language === 'ar' ? 'rtl' : 'ltr'}`}>
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
          setShowAIAssistant={setShowAIAssistant}
        />
        
        <main className="flex-1 p-4 lg:p-6">
          {renderActivePage()}
        </main>
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant 
          onClose={() => setShowAIAssistant(false)}
          fleetMode={fleetMode}
          language={language}
        />
      )}
    </div>
  );
}

export default App;