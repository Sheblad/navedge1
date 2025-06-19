import { useState, useEffect, useCallback } from 'react';
import { DatabaseService, OfflineSync } from '../services/database';
import type { Driver, Fine, Contract } from '../data/mockData';
import { mockDriversData, mockFinesData } from '../data/mockData';

// Custom hook for managing drivers with database integration
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load drivers from database or localStorage
  const loadDrivers = async () => {
    try {
      setLoading(true);
      
      // First check if we have a connection to Supabase
      const hasConnection = false; // Always use localStorage
      setIsConnected(hasConnection);
      
      // Always use localStorage
      console.log('Using localStorage for drivers');
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const parsedDrivers = JSON.parse(localDrivers);
        console.log(`Loaded ${parsedDrivers.length} drivers from localStorage`);
        setDrivers(parsedDrivers);
      } else {
        // If no local data, use mock data
        console.log('No drivers in localStorage, using mock data');
        setDrivers(mockDriversData);
        localStorage.setItem('navedge_drivers', JSON.stringify(mockDriversData));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load drivers');
      
      // Fallback to mock data
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        setDrivers(JSON.parse(localDrivers));
      } else {
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
      // Add locally with temporary ID
      const newDriver: Driver = {
        ...driver,
        id: Date.now() // Temporary ID
      };
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      const drivers = localDrivers ? JSON.parse(localDrivers) : [];
      drivers.push(newDriver);
      localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
      
      console.log(`Added driver ${newDriver.name} to localStorage`);
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (err) {
      console.error('Error adding driver:', err);
      throw err;
    }
  };

  // Update existing driver
  const updateDriver = async (driver: Driver) => {
    try {
      // Update locally
      setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const drivers = JSON.parse(localDrivers);
        const updatedDrivers = drivers.map((d: Driver) => d.id === driver.id ? driver : d);
        localStorage.setItem('navedge_drivers', JSON.stringify(updatedDrivers));
      }
      
      console.log(`Updated driver ${driver.name} in localStorage`);
      return driver;
    } catch (err) {
      console.error('Error updating driver:', err);
      throw err;
    }
  };

  // Delete driver
  const deleteDriver = async (driverId: number) => {
    try {
      // Delete locally
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (localDrivers) {
        const drivers = JSON.parse(localDrivers);
        const filteredDrivers = drivers.filter((d: Driver) => d.id !== driverId);
        localStorage.setItem('navedge_drivers', JSON.stringify(filteredDrivers));
      }
      
      console.log(`Deleted driver with ID ${driverId} from localStorage`);
    } catch (err) {
      console.error('Error deleting driver:', err);
      throw err;
    }
  };

  // Remove multiple drivers
  const removeMultipleDrivers = async (count: number) => {
    try {
      // Get current drivers
      const localDrivers = localStorage.getItem('navedge_drivers');
      if (!localDrivers) return;
      
      const allDrivers = JSON.parse(localDrivers) as Driver[];
      if (allDrivers.length <= count) {
        console.warn(`Cannot remove ${count} drivers, only ${allDrivers.length} exist`);
        return;
      }
      
      // Keep original drivers (first 6) and remove random ones from the rest
      const originalDrivers = allDrivers.slice(0, 6); // Keep the original mock drivers
      const importedDrivers = allDrivers.slice(6);
      
      // Shuffle imported drivers
      for (let i = importedDrivers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [importedDrivers[i], importedDrivers[j]] = [importedDrivers[j], importedDrivers[i]];
      }
      
      // Keep only some of the imported drivers
      const driversToKeep = importedDrivers.slice(0, Math.max(0, importedDrivers.length - count));
      
      // Combine original and kept drivers
      const remainingDrivers = [...originalDrivers, ...driversToKeep];
      
      // Update localStorage and state
      localStorage.setItem('navedge_drivers', JSON.stringify(remainingDrivers));
      setDrivers(remainingDrivers);
      
      console.log(`Removed ${count} random drivers, ${remainingDrivers.length} drivers remaining`);
      return remainingDrivers.length;
    } catch (err) {
      console.error('Error removing drivers:', err);
      throw err;
    }
  };

  // Bulk import drivers
  const bulkImportDrivers = async (driversToImport: Omit<Driver, 'id'>[]) => {
    try {
      console.log(`Bulk importing ${driversToImport.length} drivers to localStorage`);
      
      // Import locally
      const newDrivers = driversToImport.map((driver, index) => ({
        ...driver,
        id: Date.now() + index // Temporary IDs
      }));
      
      // Update state
      setDrivers(prev => [...prev, ...newDrivers]);
      
      // Update localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      const existingDrivers = localDrivers ? JSON.parse(localDrivers) : [];
      const allDrivers = [...existingDrivers, ...newDrivers];
      localStorage.setItem('navedge_drivers', JSON.stringify(allDrivers));
      
      console.log(`Successfully imported ${newDrivers.length} drivers to localStorage`);
      return newDrivers;
    } catch (err) {
      console.error('Error bulk importing drivers:', err);
      throw err;
    }
  };

  // Load drivers on mount
  useEffect(() => {
    loadDrivers();
  }, []);

  // Save drivers to localStorage whenever they change
  useEffect(() => {
    if (drivers.length > 0) {
      localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
    }
  }, [drivers]);

  return {
    drivers,
    loading,
    error,
    isConnected,
    addDriver,
    updateDriver,
    deleteDriver,
    removeMultipleDrivers,
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
      
      // Use mock data for fines
      setFines(mockFinesData);
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
      // Create new fine with generated ID
      const newFine: Fine = {
        ...fine,
        id: `FN-${Date.now().toString().substring(7)}`
      };
      
      // Update state
      setFines(prev => [...prev, newFine]);
      
      return newFine;
    } catch (err) {
      console.error('Error adding fine:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadFines();
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
      
      // Get drivers from localStorage
      const localDrivers = localStorage.getItem('navedge_drivers');
      const drivers = localDrivers ? JSON.parse(localDrivers) : mockDriversData;
      
      // Calculate analytics
      const activeDrivers = drivers.filter((d: Driver) => d.status === 'active').length;
      const totalEarnings = drivers.reduce((sum: number, d: Driver) => sum + d.earnings, 0);
      const avgPerformance = drivers.length > 0 
        ? drivers.reduce((sum: number, d: Driver) => sum + d.performanceScore, 0) / drivers.length
        : 0;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending').length;
      
      setAnalytics({
        totalDrivers: drivers.length,
        activeDrivers,
        totalEarnings,
        avgPerformance,
        totalFines: mockFinesData.length,
        pendingFines
      });
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