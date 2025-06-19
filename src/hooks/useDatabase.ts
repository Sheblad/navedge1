import { useState, useEffect } from 'react';
import { DatabaseService, OfflineSync } from '../services/database';
import type { Driver, Fine, Contract } from '../data/mockData';

// Custom hook for managing drivers with database integration
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load drivers from database
  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load drivers from database');
      
      // Fallback to localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        setDrivers(JSON.parse(localDrivers));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new driver
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      const newDriver = await DatabaseService.addDriver(driver);
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (err) {
      console.error('Error adding driver:', err);
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'CREATE',
        table: 'drivers',
        data: driver,
        timestamp: Date.now()
      });
      
      // Add locally with temporary ID
      const tempDriver: Driver = {
        ...driver,
        id: Date.now() // Temporary ID
      };
      setDrivers(prev => [...prev, tempDriver]);
      return tempDriver;
    }
  };

  // Update existing driver
  const updateDriver = async (driver: Driver) => {
    try {
      const updatedDriver = await DatabaseService.updateDriver(driver);
      setDrivers(prev => prev.map(d => d.id === driver.id ? updatedDriver : d));
      return updatedDriver;
    } catch (err) {
      console.error('Error updating driver:', err);
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'UPDATE',
        table: 'drivers',
        data: driver,
        timestamp: Date.now()
      });
      
      // Update locally
      setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
      return driver;
    }
  };

  // Delete driver
  const deleteDriver = async (driverId: number) => {
    try {
      await DatabaseService.deleteDriver(driverId);
      setDrivers(prev => prev.filter(d => d.id !== driverId));
    } catch (err) {
      console.error('Error deleting driver:', err);
      
      // Add to offline sync queue
      OfflineSync.addToSyncQueue({
        type: 'DELETE',
        table: 'drivers',
        data: { id: driverId },
        timestamp: Date.now()
      });
      
      // Delete locally
      setDrivers(prev => prev.filter(d => d.id !== driverId));
    }
  };

  // Bulk import drivers
  const bulkImportDrivers = async (driversToImport: Driver[]) => {
    try {
      await DatabaseService.bulkImportDrivers(driversToImport);
      await loadDrivers(); // Reload all drivers
    } catch (err) {
      console.error('Error bulk importing drivers:', err);
      throw err;
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    loadDrivers();

    // Set up real-time subscription
    const subscription = DatabaseService.subscribeToDrivers((updatedDrivers) => {
      setDrivers(updatedDrivers);
    });

    // Sync pending operations when online
    const syncOfflineData = async () => {
      if (navigator.onLine) {
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
      subscription?.unsubscribe();
      window.removeEventListener('online', syncOfflineData);
    };
  }, []);

  return {
    drivers,
    loading,
    error,
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