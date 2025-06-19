import { useState, useEffect } from 'react';
import { Driver } from '../data/mockData';
import { useNotifications } from './useNotifications';

interface EarningEvent {
  id: string;
  driverId: number;
  amount: number;
  timestamp: Date;
  type: 'trip' | 'rental' | 'bonus' | 'penalty';
  details: {
    tripId?: string;
    contractId?: string;
    distance?: number;
    duration?: number;
    startLocation?: string;
    endLocation?: string;
    rentalDays?: number;
  };
}

export function useEarningsTracking(fleetMode: 'rental' | 'taxi') {
  const [earningEvents, setEarningEvents] = useState<EarningEvent[]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const { addNotification } = useNotifications();

  // Load earning events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('navedge_earning_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setEarningEvents(parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        })));
      } catch (error) {
        console.error('Error loading earning events:', error);
      }
    }
  }, []);

  // Save earning events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('navedge_earning_events', JSON.stringify(earningEvents));
  }, [earningEvents]);

  // Record a new earning event
  const recordEarning = (
    driver: Driver,
    amount: number,
    type: 'trip' | 'rental' | 'bonus' | 'penalty',
    details: EarningEvent['details'] = {}
  ) => {
    if (!isTracking) return;

    const newEvent: EarningEvent = {
      id: `earn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      driverId: driver.id,
      amount,
      timestamp: new Date(),
      type,
      details
    };

    setEarningEvents(prev => [newEvent, ...prev]);
    
    // Update driver's earnings
    driver.earnings += amount;

    // Create notification for significant earnings
    if (amount > 100) {
      addNotification({
        type: 'system',
        title: `${fleetMode === 'rental' ? 'Rental Payment' : 'Trip Earnings'} Recorded`,
        message: `${driver.name} earned $${amount.toFixed(2)} from ${type === 'trip' ? 'a trip' : 'rental payment'}`,
        priority: 'low',
        driverId: driver.id
      });
    }

    return newEvent;
  };

  // Record a trip completion (taxi mode)
  const recordTripCompletion = (
    driver: Driver,
    distance: number,
    duration: number,
    startLocation: string,
    endLocation: string
  ) => {
    if (fleetMode !== 'taxi') {
      console.warn('recordTripCompletion should only be used in taxi mode');
      return;
    }

    // Calculate fare based on distance and duration
    // Base fare + distance rate + time rate
    const baseFare = 12;
    const distanceRate = 2.5; // per km
    const timeRate = 0.5; // per minute
    
    const distanceFare = distance * distanceRate;
    const timeFare = duration * timeRate;
    const totalFare = Math.round(baseFare + distanceFare + timeFare);
    
    // Record the earning
    const event = recordEarning(driver, totalFare, 'trip', {
      distance,
      duration,
      startLocation,
      endLocation,
      tripId: `T-${Date.now().toString().substr(-6)}`
    });
    
    // Increment trip count
    driver.trips += 1;
    
    return event;
  };

  // Record a rental payment (rental mode)
  const recordRentalPayment = (
    driver: Driver,
    contractId: string,
    days: number = 30 // Default to monthly payment
  ) => {
    if (fleetMode !== 'rental') {
      console.warn('recordRentalPayment should only be used in rental mode');
      return;
    }

    // Calculate rental payment (simplified)
    // In a real system, this would pull from the contract details
    const dailyRate = 40; // $40 per day
    const totalPayment = dailyRate * days;
    
    // Record the earning
    const event = recordEarning(driver, totalPayment, 'rental', {
      contractId,
      rentalDays: days
    });
    
    return event;
  };

  // Get earnings for a specific driver
  const getDriverEarnings = (driverId: number) => {
    return earningEvents.filter(event => event.driverId === driverId);
  };

  // Get total earnings for a specific driver
  const getDriverTotalEarnings = (driverId: number) => {
    return earningEvents
      .filter(event => event.driverId === driverId)
      .reduce((total, event) => total + event.amount, 0);
  };

  // Get earnings for a specific time period
  const getEarningsForPeriod = (
    startDate: Date,
    endDate: Date,
    driverId?: number
  ) => {
    return earningEvents.filter(event => {
      const matchesDriver = driverId ? event.driverId === driverId : true;
      const matchesTimeframe = event.timestamp >= startDate && event.timestamp <= endDate;
      return matchesDriver && matchesTimeframe;
    });
  };

  // Get earnings summary by type
  const getEarningsSummaryByType = (driverId?: number) => {
    const filteredEvents = driverId 
      ? earningEvents.filter(event => event.driverId === driverId)
      : earningEvents;
    
    return {
      trip: filteredEvents.filter(e => e.type === 'trip').reduce((sum, e) => sum + e.amount, 0),
      rental: filteredEvents.filter(e => e.type === 'rental').reduce((sum, e) => sum + e.amount, 0),
      bonus: filteredEvents.filter(e => e.type === 'bonus').reduce((sum, e) => sum + e.amount, 0),
      penalty: filteredEvents.filter(e => e.type === 'penalty').reduce((sum, e) => sum + e.amount, 0),
      total: filteredEvents.reduce((sum, e) => sum + e.amount, 0)
    };
  };

  // Simulate automatic earnings for active drivers
  const simulateAutomaticEarnings = (drivers: Driver[]) => {
    const activeDrivers = drivers.filter(d => d.status === 'active');
    
    if (fleetMode === 'taxi') {
      // Simulate random trips for taxi drivers
      activeDrivers.forEach(driver => {
        // 30% chance of completing a trip in this cycle
        if (Math.random() < 0.3) {
          // Generate random trip details
          const distance = Math.floor(Math.random() * 20) + 5; // 5-25 km
          const duration = Math.floor(distance * 2) + Math.floor(Math.random() * 10); // Approx 2 min/km + traffic
          const locations = [
            'Dubai Mall', 'Marina', 'JBR', 'Airport', 'DIFC', 
            'Business Bay', 'Downtown', 'Jumeirah', 'Deira', 'Mall of Emirates'
          ];
          const startLocation = locations[Math.floor(Math.random() * locations.length)];
          const endLocation = locations[Math.floor(Math.random() * locations.length)];
          
          recordTripCompletion(driver, distance, duration, startLocation, endLocation);
        }
      });
    } else {
      // For rental mode, simulate daily rental income
      // In real system, this would be triggered by a scheduled job
      const today = new Date();
      const dayOfMonth = today.getDate();
      
      // Simulate monthly payments on the 1st of the month
      if (dayOfMonth === 1 || earningEvents.length === 0) {
        activeDrivers.forEach(driver => {
          if (driver.contractId) {
            recordRentalPayment(driver, driver.contractId);
          }
        });
      }
    }
  };

  return {
    earningEvents,
    recordEarning,
    recordTripCompletion,
    recordRentalPayment,
    getDriverEarnings,
    getDriverTotalEarnings,
    getEarningsForPeriod,
    getEarningsSummaryByType,
    simulateAutomaticEarnings,
    isTracking,
    setIsTracking
  };
}
```