import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '../components/NotificationCenter';
import { mockDriversData, mockFinesData } from '../data/mockData';

// Storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'navedge_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Generate initial notifications for demo
    generateInitialNotifications();
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const generateInitialNotifications = () => {
    const initialNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'fine',
        title: 'New Fine Issued',
        message: 'Ahmed Al-Rashid received a speeding fine of AED 600 on Sheikh Zayed Road',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'high',
        driverId: 1
      },
      {
        id: 'notif-2',
        type: 'incident',
        title: 'Minor Incident Reported',
        message: 'Vehicle collision reported at Al Wasl Road intersection - no injuries',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'medium',
        driverId: 3
      },
      {
        id: 'notif-3',
        type: 'contract',
        title: 'Contract Expiring Soon',
        message: 'Mohammed Hassan\'s rental contract expires in 15 days',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'medium',
        driverId: 2
      },
      {
        id: 'notif-4',
        type: 'performance',
        title: 'Performance Alert',
        message: 'Yusuf Ahmad\'s performance score dropped below 80%',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false,
        priority: 'medium',
        driverId: 4
      },
      {
        id: 'notif-5',
        type: 'maintenance',
        title: 'Maintenance Due',
        message: 'Vehicle DXB-B-67890 is due for scheduled maintenance',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'low',
        vehicleId: 'DXB-B-67890'
      }
    ];

    // Only add initial notifications if none exist
    setNotifications(prev => prev.length === 0 ? initialNotifications : prev);
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-generate notifications for new fines (simulation)
  const generateFineNotification = useCallback((driverId: number, violation: string, amount: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    if (driver) {
      addNotification({
        type: 'fine',
        title: 'New Fine Issued',
        message: `${driver.name} received a ${violation} fine of AED ${amount}`,
        priority: amount > 500 ? 'high' : 'medium',
        driverId
      });
    }
  }, [addNotification]);

  // Auto-generate notifications for incidents
  const generateIncidentNotification = useCallback((driverId: number, incidentType: string, severity: string) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    if (driver) {
      addNotification({
        type: 'incident',
        title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Incident Reported`,
        message: `${driver.name} reported a ${incidentType} incident`,
        priority: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
        driverId
      });
    }
  }, [addNotification]);

  // Auto-generate notifications for performance issues
  const generatePerformanceNotification = useCallback((driverId: number, score: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    if (driver && score < 80) {
      addNotification({
        type: 'performance',
        title: 'Performance Alert',
        message: `${driver.name}'s performance score dropped to ${score}%`,
        priority: score < 70 ? 'high' : 'medium',
        driverId
      });
    }
  }, [addNotification]);

  // Auto-generate notifications for contract expiry
  const generateContractNotification = useCallback((driverId: number, daysUntilExpiry: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    if (driver) {
      addNotification({
        type: 'contract',
        title: 'Contract Expiring Soon',
        message: `${driver.name}'s rental contract expires in ${daysUntilExpiry} days`,
        priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
        driverId
      });
    }
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    generateFineNotification,
    generateIncidentNotification,
    generatePerformanceNotification,
    generateContractNotification,
    unreadCount: notifications.filter(n => !n.read).length
  };
}