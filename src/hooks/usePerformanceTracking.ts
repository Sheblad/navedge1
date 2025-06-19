import { useState, useEffect, useCallback } from 'react';
import { Driver } from '../data/mockData';
import { useNotifications } from './useNotifications';

export function usePerformanceTracking() {
  const [performanceHistory, setPerformanceHistory] = useState<{
    [driverId: number]: {
      date: string;
      score: number;
      trips_today: number;
      earnings_today: number;
    }[]
  }>({});
  
  const { generatePerformanceNotification } = useNotifications();

  // Load performance history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('navedge_performance_history');
    if (savedHistory) {
      try {
        setPerformanceHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading performance history:', error);
      }
    }
  }, []);

  // Save performance history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('navedge_performance_history', JSON.stringify(performanceHistory));
  }, [performanceHistory]);

  // Calculate performance score based on trips and earnings
  const calculatePerformanceScore = useCallback((trips_today: number, earnings_today: number) => {
    return Math.min(100, Math.round((earnings_today * 0.5) + (trips_today * 2)));
  }, []);

  // Update driver performance
  const updateDriverPerformance = useCallback((driver: Driver) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get or initialize driver's performance history
    const driverHistory = performanceHistory[driver.id] || [];
    
    // Check if we already have an entry for today
    const todayEntry = driverHistory.find(entry => entry.date === today);
    
    // Get trips_today and earnings_today from driver
    const trips_today = driver.trips_today || 0;
    const earnings_today = driver.earnings_today || 0;
    
    // Calculate new performance score
    const newScore = calculatePerformanceScore(trips_today, earnings_today);
    
    // Update performance history
    if (todayEntry) {
      // Update existing entry
      const updatedHistory = driverHistory.map(entry => 
        entry.date === today 
          ? { ...entry, score: newScore, trips_today, earnings_today }
          : entry
      );
      
      setPerformanceHistory(prev => ({
        ...prev,
        [driver.id]: updatedHistory
      }));
    } else {
      // Add new entry
      const updatedHistory = [
        ...driverHistory,
        { date: today, score: newScore, trips_today, earnings_today }
      ];
      
      setPerformanceHistory(prev => ({
        ...prev,
        [driver.id]: updatedHistory
      }));
    }
    
    // Update driver's performance score
    driver.performanceScore = newScore;
    
    // Generate notification if performance is low
    if (newScore < 80) {
      generatePerformanceNotification(driver.id, newScore);
    }
    
    return newScore;
  }, [performanceHistory, calculatePerformanceScore, generatePerformanceNotification]);

  // Reset daily metrics at midnight
  const resetDailyMetrics = useCallback((drivers: Driver[]) => {
    drivers.forEach(driver => {
      driver.trips_today = 0;
      driver.earnings_today = 0;
    });
    
    console.log('Daily metrics reset for all drivers');
  }, []);

  // Set up midnight reset
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
        // This will run at midnight
        const driversJson = localStorage.getItem('navedge_drivers');
        if (driversJson) {
          try {
            const drivers = JSON.parse(driversJson);
            resetDailyMetrics(drivers);
            localStorage.setItem('navedge_drivers', JSON.stringify(drivers));
            console.log('Midnight reset completed');
          } catch (error) {
            console.error('Error during midnight reset:', error);
          }
        }
        
        // Set up the next day's reset
        setupMidnightReset();
      }, msUntilMidnight);
    };
    
    const timerId = setupMidnightReset();
    return () => clearTimeout(timerId);
  }, [resetDailyMetrics]);

  // Get performance history for a driver
  const getDriverPerformanceHistory = useCallback((driverId: number) => {
    return performanceHistory[driverId] || [];
  }, [performanceHistory]);

  // Get today's performance for a driver
  const getDriverTodayPerformance = useCallback((driverId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const driverHistory = performanceHistory[driverId] || [];
    return driverHistory.find(entry => entry.date === today);
  }, [performanceHistory]);

  return {
    calculatePerformanceScore,
    updateDriverPerformance,
    resetDailyMetrics,
    getDriverPerformanceHistory,
    getDriverTodayPerformance
  };
}