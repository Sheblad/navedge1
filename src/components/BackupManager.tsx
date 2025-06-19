import React, { useState, useRef } from 'react';
import { Download, Upload, Clock, RefreshCw, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { mockDriversData } from '../data/mockData';
import type { Driver } from '../data/mockData';

interface BackupManagerProps {
  drivers: Driver[];
  onRestoreData: (drivers: Driver[]) => void;
  onClose: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ drivers, onRestoreData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'auto'>('backup');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [autoBackupInterval, setAutoBackupInterval] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [lastBackup, setLastBackup] = useState<string | null>(localStorage.getItem('navedge_last_backup'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create a backup of all data
  const createBackup = () => {
    try {
      setIsLoading(true);
      
      // Collect all data to back up
      const backupData = {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        data: {
          drivers,
          settings: {
            fleetMode: localStorage.getItem('navedge_fleet_mode') || 'rental',
            language: localStorage.getItem('navedge_language') || 'en'
          }
        }
      };
      
      // Convert to JSON and create download
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `navedge-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Save backup timestamp
      const now = new Date().toISOString();
      localStorage.setItem('navedge_last_backup', now);
      setLastBackup(now);
      
      setMessage({ type: 'success', text: 'Backup created successfully!' });
    } catch (error) {
      console.error('Backup error:', error);
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore from a backup file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setMessage(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);
        
        // Validate backup format
        if (!backupData.data || !backupData.data.drivers) {
          throw new Error('Invalid backup file format');
        }
        
        // Restore drivers
        onRestoreData(backupData.data.drivers);
        
        // Restore settings
        if (backupData.data.settings) {
          if (backupData.data.settings.fleetMode) {
            localStorage.setItem('navedge_fleet_mode', backupData.data.settings.fleetMode);
          }
          if (backupData.data.settings.language) {
            localStorage.setItem('navedge_language', backupData.data.settings.language);
          }
        }
        
        setMessage({ type: 'success', text: 'Data restored successfully! Refresh the page to see changes.' });
      } catch (error) {
        console.error('Restore error:', error);
        setMessage({ type: 'error', text: 'Failed to restore backup. Invalid file format.' });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read backup file.' });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  // Configure auto backup
  const setupAutoBackup = () => {
    try {
      setIsLoading(true);
      
      // Save auto backup settings
      localStorage.setItem('navedge_auto_backup', 'enabled');
      localStorage.setItem('navedge_auto_backup_interval', autoBackupInterval);
      
      // Calculate next backup time
      let nextBackupDate = new Date();
      if (autoBackupInterval === 'daily') {
        nextBackupDate.setDate(nextBackupDate.getDate() + 1);
      } else if (autoBackupInterval === 'weekly') {
        nextBackupDate.setDate(nextBackupDate.getDate() + 7);
      } else if (autoBackupInterval === 'monthly') {
        nextBackupDate.setMonth(nextBackupDate.getMonth() + 1);
      }
      
      localStorage.setItem('navedge_next_auto_backup', nextBackupDate.toISOString());
      
      setMessage({ type: 'success', text: `Auto backup enabled. Next backup: ${nextBackupDate.toLocaleDateString()}` });
    } catch (error) {
      console.error('Auto backup setup error:', error);
      setMessage({ type: 'error', text: 'Failed to set up auto backup.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default data
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all data to default? This cannot be undone!')) {
      try {
        setIsLoading(true);
        
        // Restore default drivers
        onRestoreData(mockDriversData);
        
        // Reset settings
        localStorage.setItem('navedge_fleet_mode', 'rental');
        localStorage.setItem('navedge_language', 'en');
        
        setMessage({ type: 'success', text: 'Data reset to default successfully!' });
      } catch (error) {
        console.error('Reset error:', error);
        setMessage({ type: 'error', text: 'Failed to reset data.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Backup & Restore</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'backup' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="w-5 h-5 inline mr-2" />
            Create Backup
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'restore' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Restore Backup
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'auto' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Auto Backup
          </button>
        </div>

        <div className="p-6">
          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Backup Information</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Create a backup of all your fleet data. This backup can be used to restore your data in case of data loss or when moving to a new device.
                </p>
                <div className="text-sm text-blue-700">
                  <p><strong>Data included in backup:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>All driver information ({drivers.length} drivers)</li>
                    <li>Fleet settings and preferences</li>
                    <li>Language settings</li>
                  </ul>
                </div>
              </div>

              {lastBackup && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600">Last backup:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(lastBackup).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                </div>
              )}

              <button
                onClick={createBackup}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Backup File
                  </>
                )}
              </button>
            </div>
          )}

          {/* Restore Tab */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Restore Information</h3>
                <p className="text-yellow-800 text-sm mb-2">
                  Restore your data from a previously created backup file. This will replace your current data.
                </p>
                <p className="text-yellow-700 text-sm font-semibold">
                  ⚠️ Warning: Restoring will overwrite your current data. Make sure to create a backup first!
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                    <Upload className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Upload Backup File</p>
                    <p className="text-gray-600">Click to browse for a NavEdge backup file</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Backup File
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Reset to Default</h4>
                <p className="text-gray-600 text-sm mb-4">
                  If you want to start fresh, you can reset all data to the default sample data.
                </p>
                <button
                  onClick={resetToDefault}
                  className="w-full py-3 px-4 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reset to Default Data
                </button>
              </div>
            </div>
          )}

          {/* Auto Backup Tab */}
          {activeTab === 'auto' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Automatic Backup</h3>
                <p className="text-green-800 text-sm">
                  Configure automatic backups to ensure your data is always protected. Backups will be stored locally on your device.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={autoBackupInterval}
                    onChange={(e) => setAutoBackupInterval(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">How Auto Backup Works</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Backups are created automatically at the specified interval</li>
                    <li>• You'll be prompted to download the backup file</li>
                    <li>• Backups are only created when the app is open</li>
                    <li>• You'll receive a notification when a backup is due</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={setupAutoBackup}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Enable Auto Backup
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={createBackup}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Create a manual backup now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupManager;