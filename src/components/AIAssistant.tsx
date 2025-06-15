import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Zap, BarChart3, AlertTriangle, FileText, Settings, Plus, Edit, Trash2, MapPin, Phone, DollarSign, Navigation } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'action' | 'wizard' | 'confirmation' | 'data';
  data?: any;
  actionType?: string;
}

interface AIAssistantProps {
  onClose: () => void;
  fleetMode: FleetMode;
  language: Language;
  onFleetModeChange?: (mode: FleetMode) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, fleetMode, language, onFleetModeChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeWizard, setActiveWizard] = useState<string | null>(null);
  const [wizardData, setWizardData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'NavEdge AI Control Hub',
      subtitle: 'Your Personal Fleet Management Assistant',
      placeholder: 'Ask me anything about your drivers, locations, earnings...',
      send: 'Send',
      typing: 'AI is analyzing...',
      welcome: `Hello! I'm your AI-powered fleet control hub. I can help you analyze data, manage operations, and perform administrative tasks for your ${fleetMode} fleet. Try asking me about specific drivers, locations, earnings, or any fleet operations!`,
      quickActions: 'Quick Actions',
      examples: [
        'Where is Ahmed located?',
        'Who earned the most today?',
        'Show me drivers with fines',
        'Create a contract for Omar',
        'Switch to Taxi Mode',
        'Export earnings report',
        'Which drivers are offline?',
        'Show me performance rankings'
      ],
      confirm: 'Confirm',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No'
    },
    ar: {
      title: 'مركز التحكم الذكي نافيدج',
      subtitle: 'مساعدك الشخصي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن السائقين والمواقع والأرباح...',
      send: 'إرسال',
      typing: 'الذكي الاصطناعي يحلل...',
      welcome: `مرحباً! أنا مركز التحكم الذكي المدعوم بالذكاء الاصطناعي. يمكنني مساعدتك في تحليل البيانات وإدارة العمليات وتنفيذ المهام الإدارية لأسطول ${fleetMode === 'rental' ? 'الإيجار' : 'التاكسي'} الخاص بك. جرب أن تسألني عن سائقين محددين أو المواقع أو الأرباح أو أي عمليات للأسطول!`,
      quickActions: 'الإجراءات السريعة',
      examples: [
        'أين يقع أحمد؟',
        'من حقق أعلى أرباح اليوم؟',
        'أظهر لي السائقين الذين لديهم مخالفات',
        'إنشاء عقد لعمر',
        'التبديل إلى وضع التاكسي',
        'تصدير تقرير الأرباح',
        'أي السائقين غير متصلين؟',
        'أظهر لي ترتيب الأداء'
      ],
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      yes: 'نعم',
      no: 'لا'
    }
  };

  const t = texts[language];

  useEffect(() => {
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

  // Enhanced query processing with natural language understanding
  const processIntelligentQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // LOCATION QUERIES
    if (lowerQuery.includes('location') || lowerQuery.includes('where') || lowerQuery.includes('located')) {
      const driverName = extractDriverName(query);
      if (driverName) {
        const driver = findDriverByName(driverName);
        if (driver) {
          return {
            id: Date.now().toString(),
            text: `📍 **${driver.name}'s Current Location**\n\n**Status:** ${driver.status === 'active' ? '🟢 Online' : '🔴 Offline'}\n**Vehicle:** ${driver.vehicleId || 'No vehicle assigned'}\n**Location:** Dubai Marina, UAE\n**Coordinates:** ${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}\n**Last Update:** ${new Date().toLocaleTimeString()}\n\n${driver.status === 'active' ? '✅ Driver is currently active and trackable' : '⚠️ Driver is offline - showing last known location'}`,
            isUser: false,
            timestamp: new Date(),
            type: 'data'
          };
        } else {
          return {
            id: Date.now().toString(),
            text: `❌ **Driver Not Found**\n\nI couldn't find a driver named "${driverName}". Here are the available drivers:\n\n${mockDriversData.map(d => `• ${d.name}`).join('\n')}\n\nTry asking: "Where is Ahmed located?" or "Show me Omar's location"`,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          };
        }
      } else {
        return {
          id: Date.now().toString(),
          text: `🗺️ **All Driver Locations**\n\n${mockDriversData.map(driver => 
            `**${driver.name}**\n• Status: ${driver.status === 'active' ? '🟢 Online' : '🔴 Offline'}\n• Vehicle: ${driver.vehicleId || 'Unassigned'}\n• Location: Dubai, UAE\n• Last seen: ${new Date().toLocaleTimeString()}`
          ).join('\n\n')}\n\n💡 **Tip:** Ask "Where is [driver name]?" for specific location details.`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
    }

    // EARNINGS QUERIES
    if (lowerQuery.includes('earn') || lowerQuery.includes('money') || lowerQuery.includes('revenue') || lowerQuery.includes('income')) {
      if (lowerQuery.includes('most') || lowerQuery.includes('top') || lowerQuery.includes('highest')) {
        const topEarner = mockDriversData.reduce((prev, current) => 
          prev.earnings > current.earnings ? prev : current
        );
        const sortedDrivers = [...mockDriversData].sort((a, b) => b.earnings - a.earnings);
        
        return {
          id: Date.now().toString(),
          text: `💰 **Top Earners Today**\n\n🏆 **#1 ${topEarner.name}**\n• Earnings: $${topEarner.earnings.toLocaleString()}\n• Trips: ${topEarner.trips}\n• Performance: ${topEarner.performanceScore}%\n• Status: ${topEarner.status === 'active' ? '🟢 Active' : '🔴 Offline'}\n\n**Top 5 Rankings:**\n${sortedDrivers.slice(0, 5).map((driver, index) => 
            `${index + 1}. ${driver.name} - $${driver.earnings.toLocaleString()}`
          ).join('\n')}\n\n**Fleet Total:** $${mockDriversData.reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      } else {
        const driverName = extractDriverName(query);
        if (driverName) {
          const driver = findDriverByName(driverName);
          if (driver) {
            return {
              id: Date.now().toString(),
              text: `💵 **${driver.name}'s Earnings**\n\n**Today:** $${driver.earnings.toLocaleString()}\n**Trips Completed:** ${driver.trips}\n**Average per Trip:** $${Math.round(driver.earnings / driver.trips)}\n**Performance Score:** ${driver.performanceScore}%\n\n**Ranking:** ${mockDriversData.sort((a, b) => b.earnings - a.earnings).findIndex(d => d.id === driver.id) + 1} out of ${mockDriversData.length} drivers\n\n${driver.earnings > 1000 ? '🎉 Excellent performance today!' : driver.earnings > 500 ? '👍 Good performance' : '⚠️ Below average - may need support'}`,
              isUser: false,
              timestamp: new Date(),
              type: 'data'
            };
          }
        }
      }
    }

    // DRIVER STATUS QUERIES
    if (lowerQuery.includes('offline') || lowerQuery.includes('online') || lowerQuery.includes('active') || lowerQuery.includes('status')) {
      const activeDrivers = mockDriversData.filter(d => d.status === 'active');
      const offlineDrivers = mockDriversData.filter(d => d.status === 'offline');
      
      if (lowerQuery.includes('offline')) {
        return {
          id: Date.now().toString(),
          text: `🔴 **Offline Drivers**\n\n${offlineDrivers.length > 0 ? 
            offlineDrivers.map(driver => 
              `**${driver.name}**\n• Vehicle: ${driver.vehicleId || 'Unassigned'}\n• Last earnings: $${driver.earnings.toLocaleString()}\n• Performance: ${driver.performanceScore}%\n• Last seen: ${new Date().toLocaleTimeString()}`
            ).join('\n\n') :
            '✅ All drivers are currently online!'
          }\n\n**Summary:** ${offlineDrivers.length} offline, ${activeDrivers.length} active`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      } else {
        return {
          id: Date.now().toString(),
          text: `🟢 **Active Drivers**\n\n${activeDrivers.map(driver => 
            `**${driver.name}**\n• Vehicle: ${driver.vehicleId || 'Unassigned'}\n• Earnings: $${driver.earnings.toLocaleString()}\n• Trips: ${driver.trips}\n• Performance: ${driver.performanceScore}%`
          ).join('\n\n')}\n\n**Fleet Status:** ${activeDrivers.length}/${mockDriversData.length} drivers active (${Math.round((activeDrivers.length / mockDriversData.length) * 100)}%)`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
    }

    // FINES QUERIES
    if (lowerQuery.includes('fine') || lowerQuery.includes('violation') || lowerQuery.includes('penalty')) {
      const driversWithFines = mockDriversData.filter(driver => 
        mockFinesData.some(fine => fine.driverId === driver.id)
      );
      
      if (driversWithFines.length > 0) {
        return {
          id: Date.now().toString(),
          text: `🚨 **Drivers with Fines**\n\n${driversWithFines.map(driver => {
            const driverFines = mockFinesData.filter(f => f.driverId === driver.id);
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            const pendingFines = driverFines.filter(f => f.status === 'pending');
            
            return `**${driver.name}**\n• Total Fines: ${driverFines.length}\n• Total Amount: AED ${totalAmount.toLocaleString()}\n• Pending: ${pendingFines.length}\n• Recent: ${driverFines[0]?.violation || 'N/A'}`;
          }).join('\n\n')}\n\n**Fleet Summary:**\n• Total Fines: ${mockFinesData.length}\n• Total Amount: AED ${mockFinesData.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}\n• Pending: ${mockFinesData.filter(f => f.status === 'pending').length}`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      } else {
        return {
          id: Date.now().toString(),
          text: `✅ **No Active Fines**\n\nGreat news! Currently no drivers have outstanding fines.\n\n**Fleet Compliance Status:** Excellent\n**Last Fine:** ${mockFinesData[mockFinesData.length - 1]?.date || 'N/A'}\n\n🎉 Keep up the good work!`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
    }

    // PERFORMANCE QUERIES
    if (lowerQuery.includes('performance') || lowerQuery.includes('ranking') || lowerQuery.includes('score')) {
      const sortedByPerformance = [...mockDriversData].sort((a, b) => b.performanceScore - a.performanceScore);
      
      return {
        id: Date.now().toString(),
        text: `📊 **Performance Rankings**\n\n${sortedByPerformance.map((driver, index) => 
          `${index + 1}. **${driver.name}**\n   Score: ${driver.performanceScore}% | Earnings: $${driver.earnings.toLocaleString()} | Trips: ${driver.trips}\n   ${driver.performanceScore >= 90 ? '🌟 Excellent' : driver.performanceScore >= 80 ? '👍 Good' : '⚠️ Needs Improvement'}`
        ).join('\n\n')}\n\n**Fleet Average:** ${Math.round(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length)}%\n\n💡 **Tip:** Drivers below 80% may need additional training or support.`,
        isUser: false,
        timestamp: new Date(),
        type: 'data'
      };
    }

    // SPECIFIC DRIVER QUERIES
    const driverName = extractDriverName(query);
    if (driverName && (lowerQuery.includes('show') || lowerQuery.includes('tell') || lowerQuery.includes('about'))) {
      const driver = findDriverByName(driverName);
      if (driver) {
        const driverFines = mockFinesData.filter(f => f.driverId === driver.id);
        const driverContracts = mockContractsData.filter(c => c.driverId === driver.id);
        
        return {
          id: Date.now().toString(),
          text: `👤 **${driver.name} - Complete Profile**\n\n**📊 Performance:**\n• Score: ${driver.performanceScore}%\n• Status: ${driver.status === 'active' ? '🟢 Online' : '🔴 Offline'}\n• Earnings Today: $${driver.earnings.toLocaleString()}\n• Trips: ${driver.trips}\n\n**🚗 Vehicle:**\n• Assigned: ${driver.vehicleId || 'None'}\n• Location: Dubai, UAE\n\n**📱 Contact:**\n• Phone: ${driver.phone}\n• Email: ${driver.email}\n\n**⚠️ Fines:**\n• Total: ${driverFines.length}\n• Amount: AED ${driverFines.reduce((sum, f) => sum + f.amount, 0)}\n\n**📄 Contracts:**\n• Active: ${driverContracts.filter(c => c.status === 'active').length}\n• Total: ${driverContracts.length}\n\n${driver.performanceScore >= 90 ? '🌟 Top performer!' : driver.performanceScore >= 80 ? '👍 Good driver' : '⚠️ May need attention'}`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
    }

    // ACTION: Create new contract
    if (lowerQuery.includes('create') && lowerQuery.includes('contract')) {
      const driverName = extractDriverName(query);
      return {
        id: Date.now().toString(),
        text: `🔧 **Contract Creation Wizard Started**\n\nI'll help you create a new rental contract${driverName ? ` for ${driverName}` : ''}.\n\nPlease provide:\n1. Driver's full name\n2. Emirates ID number\n3. Vehicle ID to assign\n4. Rental duration (months)\n5. Monthly rent amount\n6. Deposit amount\n\nYou can also upload the driver's Emirates ID for automatic data extraction.`,
        isUser: false,
        timestamp: new Date(),
        type: 'action',
        actionType: 'create_contract'
      };
    }

    // ACTION: Switch fleet mode
    if (lowerQuery.includes('switch') && (lowerQuery.includes('taxi') || lowerQuery.includes('rental'))) {
      const targetMode = lowerQuery.includes('taxi') ? 'taxi' : 'rental';
      if (targetMode === fleetMode) {
        return {
          id: Date.now().toString(),
          text: `ℹ️ You're already in ${fleetMode} mode. No changes needed.`,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
      }
      
      return {
        id: Date.now().toString(),
        text: `🔄 **Fleet Mode Switch**\n\nSwitching from ${fleetMode} mode to ${targetMode} mode will:\n\n${targetMode === 'taxi' ? 
          '• Hide contract management\n• Focus on trips and shifts\n• Change earnings calculations\n• Update driver metrics' :
          '• Enable contract management\n• Focus on rentals and deposits\n• Change to monthly earnings\n• Update performance metrics'
        }\n\nConfirm the switch?`,
        isUser: false,
        timestamp: new Date(),
        type: 'confirmation',
        actionType: 'switch_mode',
        data: { targetMode }
      };
    }

    // Default intelligent response with suggestions
    return {
      id: Date.now().toString(),
      text: `🤖 **I'm here to help!** I didn't quite understand that query, but I can help you with:\n\n**📍 Location Queries:**\n• "Where is Ahmed located?"\n• "Show me all driver locations"\n\n**💰 Earnings & Performance:**\n• "Who earned the most today?"\n• "Show me Ahmed's earnings"\n• "Performance rankings"\n\n**👥 Driver Management:**\n• "Which drivers are offline?"\n• "Show me drivers with fines"\n• "Tell me about Omar"\n\n**⚙️ Fleet Operations:**\n• "Create a contract for Ahmed"\n• "Switch to taxi mode"\n• "Export earnings report"\n\n**💡 Tip:** Try being specific with driver names and what information you need!`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
  };

  // Helper functions for name extraction and driver finding
  const extractDriverName = (query: string): string | null => {
    const patterns = [
      /(?:for|about|is|where|show|tell)\s+(\w+)/i,
      /(\w+)(?:'s|s')/i,
      /driver\s+(\w+)/i,
      /(\w+)\s+(?:located|location|earnings|performance)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        const name = match[1].toLowerCase();
        // Check if this matches any driver name (partial match)
        const driver = mockDriversData.find(d => 
          d.name.toLowerCase().includes(name) || 
          d.name.toLowerCase().split(' ').some(part => part.startsWith(name))
        );
        if (driver) return driver.name;
      }
    }
    return null;
  };

  const findDriverByName = (name: string) => {
    return mockDriversData.find(d => 
      d.name.toLowerCase().includes(name.toLowerCase()) ||
      d.name.toLowerCase().split(' ').some(part => part.toLowerCase().startsWith(name.toLowerCase()))
    );
  };

  const handleConfirmation = (messageId: string, confirmed: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.actionType) return;

    let responseText = '';
    
    if (confirmed) {
      switch (message.actionType) {
        case 'switch_mode':
          if (onFleetModeChange && message.data?.targetMode) {
            onFleetModeChange(message.data.targetMode);
            responseText = `✅ **Fleet mode switched successfully!**\n\nYou're now in ${message.data.targetMode} mode. The interface has been updated with relevant features and metrics.`;
          }
          break;
          
        default:
          responseText = '✅ **Action completed successfully!**';
      }
    } else {
      responseText = '❌ **Action cancelled.** No changes have been made.';
    }

    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, responseMessage]);
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

    setTimeout(() => {
      const aiResponse = processIntelligentQuery(inputText);
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
    if (message.type === 'confirmation') {
      return (
        <div className="space-y-3">
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleConfirmation(message.id, true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              {t.yes}
            </button>
            <button
              onClick={() => handleConfirmation(message.id, false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              {t.no}
            </button>
          </div>
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[800px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{t.title}</h2>
              <p className="text-blue-100 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
              {fleetMode.toUpperCase()} MODE
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${
                  message.isUser 
                    ? 'bg-blue-600' 
                    : message.type === 'action' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : message.type === 'confirmation'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600'
                        : message.type === 'data'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.type === 'action' ? (
                    <Settings className="w-4 h-4 text-white" />
                  ) : message.type === 'confirmation' ? (
                    <AlertTriangle className="w-4 h-4 text-white" />
                  ) : message.type === 'data' ? (
                    <BarChart3 className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : message.type === 'action'
                        ? 'bg-green-50 text-green-900 border border-green-200'
                        : message.type === 'confirmation'
                          ? 'bg-orange-50 text-orange-900 border border-orange-200'
                          : message.type === 'data'
                            ? 'bg-purple-50 text-purple-900 border border-purple-200'
                            : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {renderMessage(message)}
                  <p className={`text-xs mt-2 ${
                    message.isUser 
                      ? 'text-blue-100' 
                      : message.type === 'action'
                        ? 'text-green-600'
                        : message.type === 'confirmation'
                          ? 'text-orange-600'
                          : message.type === 'data'
                            ? 'text-purple-600'
                            : 'text-gray-500'
                  }`}>
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
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
                {t.examples.map((example, index) => (
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