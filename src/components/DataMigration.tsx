import React, { useState } from 'react';
import { Upload, Download, Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { DatabaseService } from '../services/database';
import { mockDriversData } from '../data/mockData';
import SQLDownloader from './SQLDownloader';
import type { Driver } from '../data/mockData';

interface DataMigrationProps {
  onMigrationComplete: () => void;
}

const DataMigration: React.FC<DataMigrationProps> = ({ onMigrationComplete }) => {
  const [migrationStep, setMigrationStep] = useState<'check' | 'migrate' | 'complete' | 'sql-download'>('check');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localData, setLocalData] = useState<{
    drivers: Driver[];
    hasData: boolean;
  }>({ drivers: [], hasData: false });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check for existing local data and database connection
  React.useEffect(() => {
    const checkLocalData = () => {
      const savedDrivers = localStorage.getItem('navedge_drivers');
      if (savedDrivers) {
        try {
          const drivers = JSON.parse(savedDrivers);
          setLocalData({
            drivers,
            hasData: drivers.length > 0
          });
        } catch (err) {
          console.error('Error parsing local data:', err);
        }
      }
    };

    const checkDatabaseConnection = async () => {
      try {
        const isConnected = await DatabaseService.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Error checking database connection:', error);
        setConnectionStatus('disconnected');
      }
    };

    checkLocalData();
    checkDatabaseConnection();
  }, []);

  const migrateToDatabase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setMigrationStep('migrate');

      // Check connection again
      const isConnected = await DatabaseService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to database. Please check your Supabase configuration.');
      }

      // Migrate drivers
      if (localData.hasData) {
        console.log(`Migrating ${localData.drivers.length} drivers to database...`);
        await DatabaseService.bulkImportDrivers(localData.drivers);
      } else {
        // Import default mock data if no local data exists
        console.log('No local data found, importing default mock data...');
        await DatabaseService.bulkImportDrivers(mockDriversData);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('navedge_drivers');
      localStorage.removeItem('navedge_fleet_mode');
      localStorage.removeItem('navedge_language');

      setMigrationStep('complete');
      
      // Auto-complete after 2 seconds
      setTimeout(() => {
        onMigrationComplete();
      }, 2000);

    } catch (err) {
      console.error('Migration failed:', err);
      
      // Check if it's a 404 error (table doesn't exist)
      if (err instanceof Error && err.message.includes('404')) {
        setError('Database tables not found. You need to create the database schema first.');
        setMigrationStep('sql-download');
      } else {
        setError('Migration failed. Please try again or contact support.');
        setMigrationStep('check');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportLocalData = () => {
    const data = {
      drivers: localData.drivers,
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navedge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const skipMigration = () => {
    // Clear localStorage and proceed with empty database
    localStorage.removeItem('navedge_drivers');
    localStorage.removeItem('navedge_fleet_mode');
    localStorage.removeItem('navedge_language');
    onMigrationComplete();
  };

  if (migrationStep === 'sql-download') {
    return <SQLDownloader />;
  }

  if (migrationStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Migration Complete!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your data has been successfully migrated to the cloud database. You can now access your fleet data from any device!
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-900 mb-2">What's New:</h4>
            <ul className="text-green-800 text-sm space-y-1 text-left">
              <li>✅ Multi-device access</li>
              <li>✅ Real-time synchronization</li>
              <li>✅ Automatic backups</li>
              <li>✅ Enhanced security</li>
              <li>✅ Offline support</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Database Setup
          </h2>
          
          <p className="text-gray-600">
            {connectionStatus === 'checking' ? 'Checking database connection...' :
             connectionStatus === 'connected' ? 'Connected to Supabase database' :
             'Not connected to Supabase database'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('Database tables not found') && (
                  <p className="text-red-700 text-sm mt-1">
                    Click "Download SQL Schema" below to get the database setup file.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {localData.hasData ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Local Data Found</h4>
              <p className="text-blue-800 text-sm mb-2">
                We found {localData.drivers.length} drivers in your local storage. This data will be migrated to the cloud database.
              </p>
              <button
                onClick={exportLocalData}
                className="text-blue-700 text-sm font-medium flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Backup local data first
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">No Local Data Found</h4>
              <p className="text-yellow-800 text-sm">
                We'll set up your database with sample data to get you started.
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Benefits of Cloud Database</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Access your fleet data from any device</li>
              <li>• Real-time updates across all devices</li>
              <li>• Secure data storage with backups</li>
              <li>• Support for large fleets (500+ vehicles)</li>
              <li>• Offline mode with automatic sync</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            {connectionStatus === 'disconnected' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Database Connection Required</h4>
                <p className="text-yellow-800 text-sm mb-4">
                  To use cloud database features, you need to connect to Supabase. Please follow these steps:
                </p>
                <ol className="text-yellow-800 text-sm space-y-2 list-decimal pl-5">
                  <li>Click the "Connect to Supabase" button in the top right corner</li>
                  <li>Create a new Supabase project or connect to an existing one</li>
                  <li>Run the SQL schema to create the necessary tables</li>
                  <li>Return to this page and click "Migrate to Cloud Database"</li>
                </ol>
              </div>
            ) : null}
            
            {error && error.includes('Database tables not found') ? (
              <button
                onClick={() => setMigrationStep('sql-download')}
                className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Database className="w-5 h-5 mr-2" />
                Download SQL Schema
              </button>
            ) : (
              <button
                onClick={migrateToDatabase}
                disabled={isLoading || connectionStatus !== 'connected'}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Migrating Data...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Migrate to Cloud Database
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={skipMigration}
              disabled={isLoading}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMigration;