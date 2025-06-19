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
      console.log('Fetching drivers from Supabase...');
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} drivers from database`);
      return data?.map(this.convertDriverFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      // Fallback to mock data for demo purposes
      console.log('Falling back to mock data');
      return mockDriversData;
    }
  }

  static async addDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    try {
      console.log('Adding driver to Supabase:', driver.name);
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

      console.log('Driver added successfully:', data.id);
      return this.convertDriverFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  static async updateDriver(driver: Driver): Promise<Driver> {
    try {
      console.log('Updating driver in Supabase:', driver.id);
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

      console.log('Driver updated successfully');
      return this.convertDriverFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  static async deleteDriver(driverId: number): Promise<void> {
    try {
      console.log('Deleting driver from Supabase:', driverId);
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Error deleting driver:', error);
        throw error;
      }

      console.log('Driver deleted successfully');
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // ==================== FINES ====================
  
  static async getFines(): Promise<Fine[]> {
    try {
      console.log('Fetching fines from Supabase...');
      const { data, error } = await supabase
        .from('fines')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching fines:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} fines from database`);
      return data?.map(this.convertFineFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async addFine(fine: Omit<Fine, 'id'>): Promise<Fine> {
    try {
      console.log('Adding fine to Supabase');
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

      console.log('Fine added successfully:', data.id);
      return this.convertFineFromDB(data);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // ==================== CONTRACTS ====================
  
  static async getContracts(): Promise<Contract[]> {
    try {
      console.log('Fetching contracts from Supabase...');
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} contracts from database`);
      return data?.map(this.convertContractFromDB) || [];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  static subscribeToDrivers(callback: (drivers: Driver[]) => void) {
    console.log('Setting up real-time subscription to drivers table');
    return supabase
      .channel('drivers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        async () => {
          console.log('Received real-time update for drivers');
          const drivers = await this.getDrivers();
          callback(drivers);
        }
      )
      .subscribe();
  }

  static subscribeToFines(callback: (fines: Fine[]) => void) {
    console.log('Setting up real-time subscription to fines table');
    return supabase
      .channel('fines_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fines' },
        async () => {
          console.log('Received real-time update for fines');
          const fines = await this.getFines();
          callback(fines);
        }
      )
      .subscribe();
  }

  // ==================== BULK OPERATIONS ====================
  
  static async bulkImportDrivers(drivers: Driver[]): Promise<void> {
    try {
      console.log(`Starting bulk import of ${drivers.length} drivers`);
      
      // Convert drivers to database format
      const driverData = drivers.map(driver => ({
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        avatar: driver.avatar,
        trips: driver.trips || 0,
        earnings: driver.earnings || 0,
        status: driver.status || 'active',
        performance_score: driver.performanceScore || 85,
        join_date: driver.joinDate || new Date().toISOString().split('T')[0],
        location_lat: driver.location?.lat || 25.2048,
        location_lng: driver.location?.lng || 55.2708,
        vehicle_id: driver.vehicleId || null,
        contract_id: driver.contractId || null
      }));

      // Process in batches to avoid request size limitations
      const batchSize = 20;
      for (let i = 0; i < driverData.length; i += batchSize) {
        const batch = driverData.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(driverData.length/batchSize)}, size: ${batch.length}`);
        
        const { error } = await supabase
          .from('drivers')
          .insert(batch);

        if (error) {
          console.error(`Error importing batch ${i/batchSize + 1}:`, error);
          throw error;
        }
        
        console.log(`Batch ${Math.floor(i/batchSize) + 1} imported successfully`);
      }

      console.log(`Successfully imported ${drivers.length} drivers`);
    } catch (error) {
      console.error('Bulk import error:', error);
      
      // If it's a 404 error (table doesn't exist), provide a more helpful message
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Database tables not found. You need to create the database schema first.');
      }
      
      throw error;
    }
  }

  static async exportAllData(): Promise<{
    drivers: Driver[];
    fines: Fine[];
    contracts: Contract[];
  }> {
    try {
      console.log('Exporting all data');
      const [drivers, fines, contracts] = await Promise.all([
        this.getDrivers(),
        this.getFines(),
        this.getContracts()
      ]);

      console.log(`Export complete: ${drivers.length} drivers, ${fines.length} fines, ${contracts.length} contracts`);
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
      contractId: dbDriver.contract_id,
      trips_today: dbDriver.trips_today || 0,
      earnings_today: dbDriver.earnings_today || 0
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
      console.log('Fetching fleet analytics');
      const [drivers, fines] = await Promise.all([
        this.getDrivers(),
        this.getFines()
      ]);

      const activeDrivers = drivers.filter(d => d.status === 'active').length;
      const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
      const avgPerformance = drivers.reduce((sum, d) => sum + d.performanceScore, 0) / drivers.length;
      const pendingFines = fines.filter(f => f.status === 'pending').length;

      console.log('Analytics calculated successfully');
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
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_IMPORT';
    table: 'drivers' | 'fines' | 'contracts';
    data: any;
    timestamp: number;
  }) {
    console.log('Adding operation to sync queue:', operation.type, operation.table);
    const queue = this.getSyncQueue();
    queue.push(operation);
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log('Operation added to queue, new queue size:', queue.length);
  }

  static getSyncQueue(): any[] {
    const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  static async syncPendingOperations(): Promise<void> {
    const queue = this.getSyncQueue();
    
    if (queue.length === 0) {
      console.log('No pending operations to sync');
      return;
    }

    console.log(`Starting sync of ${queue.length} pending operations`);
    try {
      for (const operation of queue) {
        console.log(`Syncing operation: ${operation.type} on ${operation.table}`);
        await this.executeOperation(operation);
      }
      
      // Clear queue after successful sync
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
      console.log(`Synced ${queue.length} pending operations successfully`);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private static async executeOperation(operation: any): Promise<void> {
    switch (operation.table) {
      case 'drivers':
        if (operation.type === 'CREATE') {
          console.log('Executing CREATE operation for driver');
          await DatabaseService.addDriver(operation.data);
        } else if (operation.type === 'UPDATE') {
          console.log('Executing UPDATE operation for driver');
          await DatabaseService.updateDriver(operation.data);
        } else if (operation.type === 'DELETE') {
          console.log('Executing DELETE operation for driver');
          await DatabaseService.deleteDriver(operation.data.id);
        } else if (operation.type === 'BULK_IMPORT') {
          console.log('Executing BULK_IMPORT operation for drivers');
          await DatabaseService.bulkImportDrivers(operation.data);
        }
        break;
      // Add other tables as needed
      default:
        console.warn(`Unknown table in sync operation: ${operation.table}`);
    }
  }
}