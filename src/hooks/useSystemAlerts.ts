import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Users, TrendingUp, Car, FileText } from 'lucide-react';
import { mockDriversData, mockFinesData } from '../data/mockData';

interface SystemAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  icon: React.ComponentType<any>;
  dismissible?: boolean;
}

const DISMISSED_ALERTS_KEY = 'navedge_dismissed_alerts';

export function useSystemAlerts(language: 'en' | 'ar' | 'hi' | 'ur', fleetMode: 'rental' | 'taxi') {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const texts = {
    en: {
      pendingFine: 'pending fine',
      pendingFines: 'pending fines',
      requireAttention: 'require attention',
      contractExpiring: 'rental contract',
      contractsExpiring: 'rental contracts',
      expiringThisMonth: 'expiring this month',
      maintenanceAlert: 'vehicle',
      maintenanceAlerts: 'vehicles',
      dueForMaintenance: 'due for maintenance',
      fleetUtilizationAlert: 'fleet utilization rate',
      peakHoursAlert: 'drivers in high-demand zones',
      tripsCompletedAlert: 'trips completed today',
      driversCurrentlyActive: 'drivers currently active',
      rentersCurrentlyActive: 'renters currently active'
    },
    ar: {
      pendingFine: 'مخالفة معلقة',
      pendingFines: 'مخالفات معلقة',
      requireAttention: 'تتطلب انتباه',
      contractExpiring: 'عقد إيجار',
      contractsExpiring: 'عقود إيجار',
      expiringThisMonth: 'تنتهي هذا الشهر',
      maintenanceAlert: 'مركبة',
      maintenanceAlerts: 'مركبات',
      dueForMaintenance: 'تحتاج صيانة',
      fleetUtilizationAlert: 'معدل استخدام الأسطول',
      peakHoursAlert: 'سائقون في مناطق الطلب العالي',
      tripsCompletedAlert: 'رحلة مكتملة اليوم',
      driversCurrentlyActive: 'سائقون نشطون حالياً',
      rentersCurrentlyActive: 'مستأجرون نشطون حالياً'
    },
    hi: {
      pendingFine: 'लंबित जुर्माना',
      pendingFines: 'लंबित जुर्माने',
      requireAttention: 'ध्यान देने की आवश्यकता',
      contractExpiring: 'किराया अनुबंध',
      contractsExpiring: 'किराया अनुबंध',
      expiringThisMonth: 'इस महीने समाप्त हो रहे',
      maintenanceAlert: 'वाहन',
      maintenanceAlerts: 'वाहन',
      dueForMaintenance: 'रखरखाव के लिए देय',
      fleetUtilizationAlert: 'फ्लीट उपयोग दर',
      peakHoursAlert: 'उच्च मांग क्षेत्रों में ड्राइवर',
      tripsCompletedAlert: 'आज पूरी की गई यात्राएं',
      driversCurrentlyActive: 'वर्तमान में सक्रिय ड्राइवर',
      rentersCurrentlyActive: 'वर्तमान में सक्रिय किराएदार'
    },
    ur: {
      pendingFine: 'زیر التواء جرمانہ',
      pendingFines: 'زیر التواء جرمانے',
      requireAttention: 'توجہ درکار',
      contractExpiring: 'کرایہ کنٹریکٹ',
      contractsExpiring: 'کرایہ کنٹریکٹس',
      expiringThisMonth: 'اس مہینے ختم ہو رہے',
      maintenanceAlert: 'گاڑی',
      maintenanceAlerts: 'گاڑیاں',
      dueForMaintenance: 'دیکھ بھال کے لیے واجب',
      fleetUtilizationAlert: 'فلیٹ استعمال کی شرح',
      peakHoursAlert: 'زیادہ مانگ والے علاقوں میں ڈرائیورز',
      tripsCompletedAlert: 'آج مکمل ہونے والے سفر',
      driversCurrentlyActive: 'فی الوقت فعال ڈرائیورز',
      rentersCurrentlyActive: 'فی الوقت فعال کرایہ دار'
    }
  };

  const t = texts[language];

  // Load dismissed alerts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (saved) {
      try {
        setDismissedAlerts(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading dismissed alerts:', error);
      }
    }
  }, []);

  // Save dismissed alerts to localStorage
  useEffect(() => {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const generateSystemAlerts = (): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    const activeDrivers = mockDriversData.filter(d => d.status === 'active');
    const pendingFines = mockFinesData.filter(f => f.status === 'pending').length;

    // Pending fines alert
    if (pendingFines > 0) {
      const alertId = 'pending-fines';
      if (!dismissedAlerts.includes(alertId)) {
        alerts.push({
          id: alertId,
          type: 'warning',
          message: `${pendingFines} ${pendingFines === 1 ? t.pendingFine : t.pendingFines} ${t.requireAttention}`,
          icon: AlertTriangle
        });
      }
    }

    // Mode-specific alerts
    if (fleetMode === 'rental') {
      // Contract expiring alert
      const contractsExpiring = 3; // Mock data
      if (contractsExpiring > 0) {
        const alertId = 'contracts-expiring';
        if (!dismissedAlerts.includes(alertId)) {
          alerts.push({
            id: alertId,
            type: 'info',
            message: `${contractsExpiring} ${contractsExpiring === 1 ? t.contractExpiring : t.contractsExpiring} ${t.expiringThisMonth}`,
            icon: Calendar
          });
        }
      }

      // Maintenance alert
      const maintenanceAlerts = 1; // Mock data
      if (maintenanceAlerts > 0) {
        const alertId = 'maintenance-due';
        if (!dismissedAlerts.includes(alertId)) {
          alerts.push({
            id: alertId,
            type: 'warning',
            message: `${maintenanceAlerts} ${maintenanceAlerts === 1 ? t.maintenanceAlert : t.maintenanceAlerts} ${t.dueForMaintenance}`,
            icon: Car
          });
        }
      }

      // Fleet utilization
      const utilizationRate = 87;
      const alertId = 'fleet-utilization';
      if (!dismissedAlerts.includes(alertId)) {
        alerts.push({
          id: alertId,
          type: 'success',
          message: `${utilizationRate}% ${t.fleetUtilizationAlert}`,
          icon: TrendingUp
        });
      }
    } else {
      // Taxi mode alerts
      const peakHoursActive = 12; // Mock data
      const alertId = 'peak-hours';
      if (!dismissedAlerts.includes(alertId)) {
        alerts.push({
          id: alertId,
          type: 'info',
          message: `${peakHoursActive} ${t.peakHoursAlert}`,
          icon: Car
        });
      }

      const tripsToday = mockDriversData.reduce((sum, d) => sum + d.trips, 0);
      const alertId2 = 'trips-completed';
      if (!dismissedAlerts.includes(alertId2)) {
        alerts.push({
          id: alertId2,
          type: 'success',
          message: `${tripsToday} ${t.tripsCompletedAlert}`,
          icon: TrendingUp
        });
      }
    }

    // Active drivers alert
    const alertId = 'active-drivers';
    if (!dismissedAlerts.includes(alertId)) {
      alerts.push({
        id: alertId,
        type: 'success',
        message: `${activeDrivers.length} ${fleetMode === 'rental' ? t.rentersCurrentlyActive : t.driversCurrentlyActive}`,
        icon: Users
      });
    }

    return alerts;
  };

  const alerts = generateSystemAlerts();

  return {
    alerts,
    dismissAlert,
    clearDismissedAlerts: () => setDismissedAlerts([])
  };
}