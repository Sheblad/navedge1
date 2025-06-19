import React from 'react';
import { X, AlertTriangle, Calendar, Users, TrendingUp, Car, FileText } from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  icon: React.ComponentType<any>;
  dismissible?: boolean;
}

interface SystemAlertsProps {
  alerts: SystemAlert[];
  onDismiss: (alertId: string) => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts, onDismiss, language }) => {
  if (alerts.length === 0) return null;

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800';
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${getAlertStyles(alert.type)} transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`w-5 h-5 mt-0.5 ${getIconColor(alert.type)} flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
              {alert.dismissible !== false && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className={`p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors ${getIconColor(alert.type)}`}
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SystemAlerts;