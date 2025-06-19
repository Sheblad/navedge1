import { createClient } from '@supabase/supabase-js';
import type { Driver, Fine, Contract } from '../data/mockData';
import { mockDriversData } from '../data/mockData';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service for drivers
export class DatabaseService {
  // ==================== DRIVERS ====================
  
  static async getDrivers(): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }

      return data?.map(this.convertDriverFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      // Fallback to mock data for demo purposes
      return mockDriversData;
    }
  }

  static async addDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([{
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          avatar: driver.avatar,
          trips: driver.trips,
          earnings: driver.earnings,
          status: driver.status,
          performance_score: driver.performanceScore,
          join_date: driver.joinDate,
          location_lat: driver.location.lat,
          location_lng: driver.location.lng,
          vehicle_id: driver.vehicleId,
          contract_id: driver.contractId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding driver:', error);
        throw error;
      }

      return this.convertDriverFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  static async updateDriver(driver: Driver): Promise<Driver> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          avatar: driver.avatar,
          trips: driver.trips,
          earnings: driver.earnings,
          status: driver.status,
          performance_score: driver.performanceScore,
          location_lat: driver.location.lat,
          location_lng: driver.location.lng,
          vehicle_id: driver.vehicleId,
          contract_id: driver.contractId,
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating driver:', error);
        throw error;
      }

      return this.convertDriverFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  static async deleteDriver(driverId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Error deleting driver:', error);
        throw error;
      }
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // ==================== FINES ====================
  
  static async getFines(): Promise<Fine[]> {
    try {
      const { data, error } = await supabase
        .from('fines')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching fines:', error);
        throw error;
      }

      return data?.map(this.convertFineFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async addFine(fine: Omit<Fine, 'id'>): Promise<Fine> {
    try {
      const { data, error } = await supabase
        .from('fines')
        .insert([{
          driver_id: fine.driverId,
          vehicle_plate: fine.vehiclePlate,
          violation: fine.violation,
          amount: fine.amount,
          date: fine.date,
          status: fine.status,
          location: fine.location
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding fine:', error);
        throw error;
      }

      return this.convertFineFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // ==================== CONTRACTS ====================
  
  static async getContracts(): Promise<Contract[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }

      return data?.map(this.convertContractFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  static subscribeToDrivers(callback: (drivers: Driver[]) => void) {
    return supabase
      .channel('drivers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        async () => {
          const drivers = await this.getDrivers();
          callback(drivers);
        }
      )
      .subscribe();
  }

  static subscribeToFines(callback: (fines: Fine[]) => void) {
    return supabase
      .channel('fines_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fines' },
        async () => {
          const fines = await this.getFines();
          callback(fines);
        }
      )
      .subscribe();
  }

  // ==================== BULK OPERATIONS ====================
  
  static async bulkImportDrivers(drivers: Driver[]): Promise<void> {
    try {
      const driverData = drivers.map(driver => ({
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        avatar: driver.avatar,
        trips: driver.trips,
        earnings: driver.earnings,
        status: driver.status,
        performance_score: driver.performanceScore,
        join_date: driver.joinDate,
        location_lat: driver.location.lat,
        location_lng: driver.location.lng,
        vehicle_id: driver.vehicleId,
        contract_id: driver.contractId
      }));

      const { error } = await supabase
        .from('drivers')
        .insert(driverData);

      if (error) {
        console.error('Error bulk importing drivers:', error);
        throw error;
      }

      console.log(`Successfully imported ${drivers.length} drivers`);
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  }

  static async exportAllData(): Promise<{
    drivers: Driver[];
    fines: Fine[];
    contracts: Contract[];
  }> {
    try {
      const [drivers, fines, contracts] = await Promise.all([
        this.getDrivers(),
        this.getFines(),
        this.getContracts()
      ]);

      return { drivers, fines, contracts };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================
  
  private static convertDriverFromDB(dbDriver: any): Driver {
    return {
      id: dbDriver.id,
      name: dbDriver.name,
      email: dbDriver.email,
      phone: dbDriver.phone,
      avatar: dbDriver.avatar,
      trips: dbDriver.trips,
      earnings: dbDriver.earnings,
      status: dbDriver.status,
      performanceScore: dbDriver.performance_score,
      joinDate: dbDriver.join_date,
      location: {
        lat: dbDriver.location_lat,
        lng: dbDriver.location_lng
      },
      vehicleId: dbDriver.vehicle_id,
      contractId: dbDriver.contract_id
    };
  }

  private static convertFineFromDB(dbFine: any): Fine {
    return {
      id: dbFine.id,
      driverId: dbFine.driver_id,
      vehiclePlate: dbFine.vehicle_plate,
      violation: dbFine.violation,
      amount: dbFine.amount,
      date: dbFine.date,
      status: dbFine.status,
      location: dbFine.location
    };
  }

  private static convertContractFromDB(dbContract: any): Contract {
    return {
      id: dbContract.id,
      driverId: dbContract.driver_id,
      vehicleId: dbContract.vehicle_id,
      startDate: dbContract.start_date,
      endDate: dbContract.end_date,
      depositAmount: dbContract.deposit_amount,
      dailyKmLimit: dbContract.daily_km_limit,
      monthlyRent: dbContract.monthly_rent,
      status: dbContract.status,
      terms: dbContract.terms || []
    };
  }

  // ==================== ANALYTICS ====================
  
  static async getFleetAnalytics(): Promise<{
    totalDrivers: number;
    activeDrivers: number;
    totalEarnings: number;
    avgPerformance: number;
    totalFines: number;
    pendingFines: number;
  }> {
    try {
      const [drivers, fines] = await Promise.all([
        this.getDrivers(),
        this.getFines()
      ]);

      const activeDrivers = drivers.filter(d => d.status === 'active').length;
      const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
      const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
      const pendingFines = fines.filter(f => f.status === 'pending').length;

      return {
        totalDrivers: drivers.length,
        activeDrivers,
        totalEarnings,
        avgPerformance,
        totalFines: fines.length,
        pendingFines
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }
}

// ==================== OFFLINE SYNC ====================

export class OfflineSync {
  private static SYNC_QUEUE_KEY = 'navedge_sync_queue';

  static addToSyncQueue(operation: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    table: 'drivers' | 'fines' | 'contracts';
    data: any;
    timestamp: number;
  }) {
    const queue = this.getSyncQueue();
    queue.push(operation);
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static getSyncQueue(): any[] {
    const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  static async syncPendingOperations(): Promise<void> {
    const queue = this.getSyncQueue();
    
    if (queue.length === 0) return;

    try {
      for (const operation of queue) {
        await this.executeOperation(operation);
      }
      
      // Clear queue after successful sync
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
      console.log(`Synced ${queue.length} pending operations`);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private static async executeOperation(operation: any): Promise<void> {
    switch (operation.table) {
      case 'drivers':
        if (operation.type === 'CREATE') {
          await DatabaseService.addDriver(operation.data);
        } else if (operation.type === 'UPDATE') {
          await DatabaseService.updateDriver(operation.data);
        } else if (operation.type === 'DELETE') {
          await DatabaseService.deleteDriver(operation.data.id);
        }
        break;
      // Add other tables as needed
    }
  }
}