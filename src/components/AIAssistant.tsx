import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Zap, BarChart3, AlertTriangle, FileText } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'chart' | 'list';
  data?: any;
}

interface AIAssistantProps {
  onClose: () => void;
  fleetMode: FleetMode;
  language: Language;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, fleetMode, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'NavEdge AI Fleet Assistant',
      subtitle: 'Powered by Advanced Analytics',
      placeholder: 'Ask me about your fleet operations...',
      send: 'Send',
      typing: 'AI is analyzing...',
      welcome: `Hello! I'm your AI-powered fleet assistant. I can help you analyze driver performance, track earnings, manage fines, and generate insights. What would you like to know about your ${fleetMode} fleet?`,
      quickActions: 'Quick Actions',
      examples: [
        'Which driver earned the most this week?',
        'Show drivers with more than 2 fines',
        'List inactive drivers',
        'Generate performance report',
        'Export contract for Ahmed',
        'What\'s the total fleet earnings today?',
        'Show me drivers with low performance scores',
        'Which vehicles need maintenance?'
      ]
    },
    ar: {
      title: 'مساعد الأسطول الذكي نافيدج',
      subtitle: 'مدعوم بالتحليلات المتقدمة',
      placeholder: 'اسألني عن عمليات أسطولك...',
      send: 'إرسال',
      typing: 'الذكي الاصطناعي يحلل...',
      welcome: `مرحباً! أنا مساعدك الذكي المدعوم بالذكاء الاصطناعي للأسطول. يمكنني مساعدتك في تحليل أداء السائقين وتتبع الأرباح وإدارة المخالفات وإنشاء الرؤى. ماذا تريد أن تعرف عن أسطول ${fleetMode === 'rental' ? 'الإيجار' : 'التاكسي'} الخاص بك؟`,
      quickActions: 'الإجراءات السريعة',
      examples: [
        'أي سائق حقق أعلى أرباح هذا الأسبوع؟',
        'أظهر السائقين الذين لديهم أكثر من مخالفتين',
        'اعرض السائقين غير النشطين',
        'إنشاء تقرير الأداء',
        'تصدير عقد أحمد',
        'ما هو إجمالي أرباح الأسطول اليوم؟',
        'أظهر السائقين ذوي درجات الأداء المنخفضة',
        'أي مركبات تحتاج صيانة؟'
      ]
    }
  };

  const t = texts[language];

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      text: t.welcome,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }]);
  }, [language, fleetMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processAdvancedQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // Performance analysis
    if (lowerQuery.includes('performance') && (lowerQuery.includes('report') || lowerQuery.includes('analysis'))) {
      const performanceData = mockDriversData.map(driver => ({
        name: driver.name,
        score: driver.performanceScore,
        earnings: driver.earnings,
        trips: driver.trips,
        status: driver.status
      })).sort((a, b) => b.score - a.score);

      return {
        id: Date.now().toString(),
        text: 'Here\'s your fleet performance analysis:',
        isUser: false,
        timestamp: new Date(),
        type: 'list',
        data: performanceData
      };
    }

    // Top earners
    if (lowerQuery.includes('earned') || lowerQuery.includes('earning') || lowerQuery.includes('most')) {
      const topDrivers = mockDriversData
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 3);
      
      const response = `Top earning drivers ${fleetMode === 'taxi' ? 'today' : 'this month'}:\n\n` +
        topDrivers.map((driver, index) => 
          `${index + 1}. ${driver.name}: $${driver.earnings.toLocaleString()} (${driver.trips} ${fleetMode === 'taxi' ? 'trips' : 'rentals'})`
        ).join('\n') +
        `\n\nTotal fleet earnings: $${topDrivers.reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}`;

      return {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Fines analysis
    if (lowerQuery.includes('fine') || lowerQuery.includes('violation')) {
      const driversWithFines = mockDriversData.filter(driver => 
        mockFinesData.some(fine => fine.driverId === driver.id)
      );
      
      if (driversWithFines.length === 0) {
        return {
          id: Date.now().toString(),
          text: '🎉 Excellent news! No drivers currently have outstanding fines. Your fleet maintains high compliance standards.',
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
      }
      
      const finesSummary = driversWithFines.map(driver => {
        const driverFines = mockFinesData.filter(fine => fine.driverId === driver.id);
        const totalAmount = driverFines.reduce((sum, fine) => sum + fine.amount, 0);
        return `${driver.name}: ${driverFines.length} fine(s) - AED ${totalAmount}`;
      }).join('\n');

      return {
        id: Date.now().toString(),
        text: `Drivers with fines:\n\n${finesSummary}\n\nRecommendation: Consider driver training for repeat offenders.`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Low performance drivers
    if (lowerQuery.includes('low') && lowerQuery.includes('performance')) {
      const lowPerformanceDrivers = mockDriversData.filter(d => d.performanceScore < 80);
      
      if (lowPerformanceDrivers.length === 0) {
        return {
          id: Date.now().toString(),
          text: '👏 Great job! All drivers are performing above 80%. Your fleet management is excellent.',
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
      }

      const lowPerformanceList = lowPerformanceDrivers.map(driver => 
        `${driver.name}: ${driver.performanceScore}% (${driver.status})`
      ).join('\n');

      return {
        id: Date.now().toString(),
        text: `Drivers with performance below 80%:\n\n${lowPerformanceList}\n\nSuggestion: Schedule performance review meetings and provide additional training.`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Inactive drivers
    if (lowerQuery.includes('inactive') || lowerQuery.includes('offline')) {
      const inactiveDrivers = mockDriversData.filter(d => d.status === 'offline');
      if (inactiveDrivers.length === 0) {
        return {
          id: Date.now().toString(),
          text: '🚗 All drivers are currently active and on the road! Your fleet utilization is at 100%.',
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
      }
      
      const inactiveList = inactiveDrivers.map(driver => 
        `${driver.name} - Last active: ${driver.joinDate} (${driver.trips} total trips)`
      ).join('\n');

      return {
        id: Date.now().toString(),
        text: `Inactive drivers (${inactiveDrivers.length}):\n\n${inactiveList}\n\nAction needed: Contact these drivers to check availability.`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Total earnings
    if (lowerQuery.includes('total') && (lowerQuery.includes('earning') || lowerQuery.includes('revenue'))) {
      const totalEarnings = mockDriversData.reduce((sum, driver) => sum + driver.earnings, 0);
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      const avgEarnings = totalEarnings / activeDrivers;

      return {
        id: Date.now().toString(),
        text: `📊 Fleet Financial Summary:\n\n` +
              `Total Earnings: $${totalEarnings.toLocaleString()} ${fleetMode === 'taxi' ? 'today' : 'this month'}\n` +
              `Active Drivers: ${activeDrivers}\n` +
              `Average per Driver: $${Math.round(avgEarnings).toLocaleString()}\n` +
              `Fleet Utilization: ${Math.round((activeDrivers / mockDriversData.length) * 100)}%`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Contract export
    if (lowerQuery.includes('export') && lowerQuery.includes('contract')) {
      const driverName = lowerQuery.match(/contract for (\w+)/i)?.[1] || 'driver';
      return {
        id: Date.now().toString(),
        text: `📄 Contract export initiated for ${driverName}.\n\nThe contract PDF will be generated with:\n• Driver details\n• Vehicle assignment\n• Terms and conditions\n• Digital signatures\n\nDownload will start automatically once ready.`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Maintenance alerts
    if (lowerQuery.includes('maintenance') || lowerQuery.includes('vehicle')) {
      return {
        id: Date.now().toString(),
        text: `🔧 Vehicle Maintenance Status:\n\n` +
              `• DXB-A-12345: Service due in 500km\n` +
              `• DXB-B-67890: Oil change overdue\n` +
              `• DXB-C-11111: All systems normal\n` +
              `• DXB-D-22222: Tire rotation needed\n\n` +
              `Recommendation: Schedule maintenance for 2 vehicles this week.`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Default intelligent response
    return {
      id: Date.now().toString(),
      text: `I understand you're asking about "${query}". I can help you with:\n\n` +
            `📊 Driver performance analysis\n` +
            `💰 Earnings and revenue tracking\n` +
            `🚨 Fine management and alerts\n` +
            `📋 Contract generation and export\n` +
            `🚗 Vehicle maintenance tracking\n` +
            `📈 Fleet utilization reports\n\n` +
            `Try asking something like "Show me top performers" or "Generate weekly report".`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = processAdvancedQuery(inputText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'list' && message.data) {
      return (
        <div className="space-y-3">
          <p className="text-sm">{message.text}</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {message.data.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.score >= 90 ? 'bg-green-100 text-green-800' :
                    item.score >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.score}%
                  </span>
                  <span className="text-gray-600">${item.earnings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{t.title}</h2>
              <p className="text-blue-100 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.isUser ? 'bg-blue-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {renderMessage(message)}
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="text-sm text-gray-600">{t.typing}</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                {t.quickActions}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {t.examples.slice(0, 6).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(example)}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg text-blue-700 transition-all duration-200 text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;