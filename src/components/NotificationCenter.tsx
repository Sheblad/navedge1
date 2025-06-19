import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, FileText, Car, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'fine' | 'incident' | 'contract' | 'maintenance' | 'performance' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  driverId?: number;
  vehicleId?: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const texts = {
    en: {
      notifications: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      all: 'All',
      unread: 'Unread',
      high: 'High Priority',
      fine: 'Fine',
      incident: 'Incident',
      contract: 'Contract',
      maintenance: 'Maintenance',
      performance: 'Performance',
      system: 'System',
      now: 'now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago'
    },
    ar: {
      notifications: 'الإشعارات',
      markAllRead: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات',
      all: 'الكل',
      unread: 'غير مقروء',
      high: 'أولوية عالية',
      fine: 'مخالفة',
      incident: 'حادث',
      contract: 'عقد',
      maintenance: 'صيانة',
      performance: 'أداء',
      system: 'نظام',
      now: 'الآن',
      minutesAgo: 'دقائق مضت',
      hoursAgo: 'ساعات مضت',
      daysAgo: 'أيام مضت'
    },
    hi: {
      notifications: 'सूचनाएं',
      markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
      noNotifications: 'कोई सूचना नहीं',
      all: 'सभी',
      unread: 'अपठित',
      high: 'उच्च प्राथमिकता',
      fine: 'जुर्माना',
      incident: 'घटना',
      contract: 'अनुबंध',
      maintenance: 'रखरखाव',
      performance: 'प्रदर्शन',
      system: 'सिस्टम',
      now: 'अभी',
      minutesAgo: 'मिनट पहले',
      hoursAgo: 'घंटे पहले',
      daysAgo: 'दिन पहले'
    },
    ur: {
      notifications: 'اطلاعات',
      markAllRead: 'سب کو پڑھا ہوا نشان زد کریں',
      noNotifications: 'کوئی اطلاع نہیں',
      all: 'تمام',
      unread: 'غیر پڑھا',
      high: 'اعلیٰ ترجیح',
      fine: 'جرمانہ',
      incident: 'واقعہ',
      contract: 'کنٹریکٹ',
      maintenance: 'دیکھ بھال',
      performance: 'کارکردگی',
      system: 'سسٹم',
      now: 'ابھی',
      minutesAgo: 'منٹ پہلے',
      hoursAgo: 'گھنٹے پہلے',
      daysAgo: 'دن پہلے'
    }
  };

  const t = texts[language];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t.now;
    if (diffInMinutes < 60) return `${diffInMinutes} ${t.minutesAgo}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ${t.hoursAgo}`;
    return `${Math.floor(diffInMinutes / 1440)} ${t.daysAgo}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'fine': return AlertTriangle;
      case 'incident': return AlertTriangle;
      case 'contract': return FileText;
      case 'maintenance': return Car;
      case 'performance': return Users;
      case 'system': return Bell;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high' || notification.priority === 'critical';
    return true;
  });

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className={`absolute ${language === 'ar' || language === 'ur' ? 'left-0' : 'right-0'} mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{t.notifications}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t.markAllRead}
                  </button>
                )}
              </div>
              
              {/* Filter Tabs */}
              <div className="flex space-x-1 mt-3">
                {[
                  { key: 'all', label: t.all },
                  { key: 'unread', label: t.unread },
                  { key: 'high', label: t.high }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {getTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => onMarkAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteNotification(notification.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Delete notification"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>{t.noNotifications}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;