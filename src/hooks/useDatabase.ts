import { useState, useEffect, useCallback } from 'react';
import { DatabaseService, OfflineSync } from '../services/database';
import type { Driver, Fine, Contract } from '../data/mockData';
import { mockDriversData } from '../data/mockData';

// Custom hook for managing drivers with database integration
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load drivers from database
  const loadDrivers = async () => {
    try {
      setLoading(true);
      
      // First check if we have a connection to Supabase
      const hasConnection = await DatabaseService.testConnection();
      setIsConnected(hasConnection);
      
      if (hasConnection) {
        console.log('Connected to Supabase, fetching drivers...');
        const data = await DatabaseService.getDrivers();
        setDrivers(data);
        setError(null);
      } else {
        console.log('No Supabase connection, using localStorage');
        // Fallback to localStorage
        const localDrivers = localStorage.getItem('navedge_drivers');
        if (localDrivers) {
          setDrivers(JSON.parse(localDrivers));
        } else {
          // If no local data, use mock data
          setDrivers(mockDriversData);
          localStorage.setItem('navedge_drivers', JSON.stringify(mockDriversData));
        }
        setError('Not connected to database. Using local storage instead.');
      }
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load drivers from database');
      
      // Fallback to localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        setDrivers(JSON.parse(localDrivers));
      } else {
        // If no local data, use mock data
        setDrivers(mockDriversData);
        localStorage.setItem('navedge_drivers', JSON.stringify(mockDriversData));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new driver
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      let newDriver: Driver;
      
      if (isConnected) {
        // Add to database
        newDriver = await DatabaseService.addDriver(driver);
      } else {
        // Add locally with temporary ID
        newDriver = {
          ...driver,
          id: Date.now() // Temporary ID
        };
        
        // Update localStorage
        const localDrivers = localStorage.getItem('navedge_drivers');
        const drivers = localDrivers ? JSON.parse(localDrivers) : [];
        drivers.push(newDriver);
        localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
        
        // Add to offline sync queue
        OfflineSync.addToSyncQueue({
          type: 'CREATE',
          table: 'drivers',
          data: driver,
          timestamp: Date.now()
        });
      }
      
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (err) {
      console.error('Error adding driver:', err);
      
      // Add locally with temporary ID
      const tempDriver: Driver = {
        ...driver,
        id: Date.now() // Temporary ID
      };
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      const drivers = localDrivers ? JSON.parse(localDrivers) : [];
      drivers.push(tempDriver);
      localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'CREATE',
        table: 'drivers',
        data: driver,
        timestamp: Date.now()
      });
      
      setDrivers(prev => [...prev, tempDriver]);
      return tempDriver;
    }
  };

  // Update existing driver
  const updateDriver = async (driver: Driver) => {
    try {
      if (isConnected) {
        // Update in database
        const updatedDriver = await DatabaseService.updateDriver(driver);
        setDrivers(prev => prev.map(d => d.id === driver.id ? updatedDriver : d));
        return updatedDriver;
      } else {
        // Update locally
        setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
        
        // Update localStorage
        const localDrivers = localStorage.getItem('navedge_drivers');
        if (localDrivers) {
          const drivers = JSON.parse(localDrivers);
          const updatedDrivers = drivers.map((d: Driver) => d.id === driver.id ? driver : d);
          localStorage.setItem('navedge_drivers', JSON.stringify(updatedDrivers));
        }
        
        // Add to offline sync queue
        OfflineSync.addToSyncQueue({
          type: 'UPDATE',
          table: 'drivers',
          data: driver,
          timestamp: Date.now()
        });
        
        return driver;
      }
    } catch (err) {
      console.error('Error updating driver:', err);
      
      // Update locally
      setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const drivers = JSON.parse(localDrivers);
        const updatedDrivers = drivers.map((d: Driver) => d.id === driver.id ? driver : d);
        localStorage.setItem('navedge_drivers', JSON.stringify(updatedDrivers));
      }
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'UPDATE',
        table: 'drivers',
        data: driver,
        timestamp: Date.now()
      });
      
      return driver;
    }
  };

  // Delete driver
  const deleteDriver = async (driverId: number) => {
    try {
      if (isConnected) {
        // Delete from database
        await DatabaseService.deleteDriver(driverId);
      } else {
        // Add to offline sync queue
        OfflineSync.addToSyncQueue({
          type: 'DELETE',
          table: 'drivers',
          data: { id: driverId },
          timestamp: Date.now()
        });
      }
      
      // Delete locally
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const drivers = JSON.parse(localDrivers);
        const filteredDrivers = drivers.filter((d: Driver) => d.id !== driverId);
        localStorage.setItem('navedge_drivers', JSON.stringify(filteredDrivers));
      }
    } catch (err) {
      console.error('Error deleting driver:', err);
      
      // Delete locally
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const drivers = JSON.parse(localDrivers);
        const filteredDrivers = drivers.filter((d: Driver) => d.id !== driverId);
        localStorage.setItem('navedge_drivers', JSON.stringify(filteredDrivers));
      }
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'DELETE',
        table: 'drivers',
        data: { id: driverId },
        timestamp: Date.now()
      });
    }
  };

  // Bulk import drivers
  const bulkImportDrivers = async (driversToImport: Driver[]) => {
    try {
      if (isConnected) {
        // Import to database
        await DatabaseService.bulkImportDrivers(driversToImport);
        await loadDrivers(); // Reload all drivers
      } else {
        // Import locally
        const newDrivers = driversToImport.map((driver, index) => ({
          ...driver,
          id: Date.now() + index // Temporary IDs
        }));
        
        setDrivers(prev => [...prev, ...newDrivers]);
        
        // Update localStorage
        const localDrivers = localStorage.getItem('navedge_drivers');
        const existingDrivers = localDrivers ? JSON.parse(localDrivers) : [];
        localStorage.setItem('navedge_drivers', JSON.stringify([...existingDrivers, ...newDrivers]));
        
        // Add to offline sync queue
        OfflineSync.addToSyncQueue({
          type: 'BULK_IMPORT',
          table: 'drivers',
          data: driversToImport,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('Error bulk importing drivers:', err);
      
      // Import locally
      const newDrivers = driversToImport.map((driver, index) => ({
        ...driver,
        id: Date.now() + index // Temporary IDs
      }));
      
      setDrivers(prev => [...prev, ...newDrivers]);
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      const existingDrivers = localDrivers ? JSON.parse(localDrivers) : [];
      localStorage.setItem('navedge_drivers', JSON.stringify([...existingDrivers, ...newDrivers]));
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'BULK_IMPORT',
        table: 'drivers',
        data: driversToImport,
        timestamp: Date.now()
      });
      
      throw err;
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    loadDrivers();

    // Set up real-time subscription if connected
    let subscription: any = null;
    if (isConnected) {
      subscription = DatabaseService.subscribeToDrivers((updatedDrivers) => {
        setDrivers(updatedDrivers);
      });
    }

    // Sync pending operations when online
    const syncOfflineData = async () => {
      if (navigator.onLine && isConnected) {
        try {
          await OfflineSync.syncPendingOperations();
          await loadDrivers(); // Reload after sync
        } catch (err) {
          console.error('Sync failed:', err);
        }
      }
    };

    // Sync when coming online
    window.addEventListener('online', syncOfflineData);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('online', syncOfflineData);
    };
  }, [isConnected]);

  // Save drivers to localStorage whenever they change
  useEffect(() => {
    if (drivers.length > 0 && !isConnected) {
      localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
    }
  }, [drivers, isConnected]);

  return {
    drivers,
    loading,
    error,
    isConnected,
    addDriver,
    updateDriver,
    deleteDriver,
    bulkImportDrivers,
    refreshDrivers: loadDrivers
  };
}

// Custom hook for managing fines
export function useFines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFines = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getFines();
      setFines(data);
      setError(null);
    } catch (err) {
      console.error('Error loading fines:', err);
      setError('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const addFine = async (fine: Omit<Fine, 'id'>) => {
    try {
      const newFine = await DatabaseService.addFine(fine);
      setFines(prev => [...prev, newFine]);
      return newFine;
    } catch (err) {
      console.error('Error adding fine:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadFines();

    // Set up real-time subscription
    const subscription = DatabaseService.subscribeToFines((updatedFines) => {
      setFines(updatedFines);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    fines,
    loading,
    error,
    addFine,
    refreshFines: loadFines
  };
}

// Custom hook for fleet analytics
export function useFleetAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getFleetAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    analytics,
    loading,
    refreshAnalytics: loadAnalytics
  };
}