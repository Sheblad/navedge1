import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Drivers from './components/Drivers';
import Contracts from './components/Contracts';
import Chat from './components/Chat';
import Settings from './components/Settings';

type ActivePage = 'dashboard' | 'drivers' | 'contracts' | 'chat' | 'settings';
type FleetMode = 'rental' | 'taxi';

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [fleetMode, setFleetMode] = useState<FleetMode>('rental');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard fleetMode={fleetMode} />;
      case 'drivers':
        return <Drivers fleetMode={fleetMode} />;
      case 'contracts':
        return <Contracts fleetMode={fleetMode} />;
      case 'chat':
        return <Chat />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard fleetMode={fleetMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header 
          fleetMode={fleetMode}
          setFleetMode={setFleetMode}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-4 lg:p-6">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;