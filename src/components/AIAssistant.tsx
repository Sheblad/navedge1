import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Brain, Zap, Users, AlertTriangle, FileText, Car, Navigation, DollarSign, TrendingUp, Calendar, MapPin, Phone, Mail, Settings, BarChart3 } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface NavEdgeAssistantProps {
  onClose: () => void;
  fleetMode: FleetMode;
  language: Language;
  onFleetModeChange: (mode: FleetMode) => void;
}

const NavEdgeAssistant: React.FC<NavEdgeAssistantProps> = ({ 
  onClose, 
  fleetMode, 
  language, 
  onFleetModeChange 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'NavEdge AI Assistant',
      subtitle: 'Your intelligent fleet management companion',
      placeholder: 'Ask me anything about your fleet...',
      send: 'Send',
      listening: 'Listening...',
      typing: 'NavEdge is typing...',
      welcomeMessage: `👋 **Welcome to NavEdge AI!**\n\nI'm your intelligent fleet management assistant. I can help you with:\n\n🚗 **Driver Management**\n• Check driver performance\n• View driver locations\n• Manage driver assignments\n\n📋 **Contract & Fine Management**\n• Review contract details\n• Track fine payments\n• Monitor compliance\n\n📊 **Analytics & Reports**\n• Performance insights\n• Revenue analysis\n• Fleet utilization\n\n💡 **Try asking:**\n• "Show me active drivers"\n• "Who has pending fines?"\n• "What's my fleet performance?"\n• "Switch to taxi mode"`
    },
    ar: {
      title: 'مساعد نافيدج الذكي',
      subtitle: 'رفيقك الذكي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن أسطولك...',
      send: 'إرسال',
      listening: 'أستمع...',
      typing: 'نافيدج يكتب...',
      welcomeMessage: `👋 **مرحباً بك في نافيدج الذكي!**\n\nأنا مساعدك الذكي لإدارة الأسطول. يمكنني مساعدتك في:\n\n🚗 **إدارة السائقين**\n• فحص أداء السائقين\n• عرض مواقع السائقين\n• إدارة تعيينات السائقين\n\n📋 **إدارة العقود والمخالفات**\n• مراجعة تفاصيل العقود\n• تتبع دفع المخالفات\n• مراقبة الامتثال\n\n📊 **التحليلات والتقارير**\n• رؤى الأداء\n• تحليل الإيرادات\n• استخدام الأسطول\n\n💡 **جرب السؤال:**\n• "أظهر لي السائقين النشطين"\n• "من لديه مخالفات معلقة؟"\n• "ما هو أداء أسطولي؟"\n• "التبديل إلى وضع التاكسي"`
    }
  };

  const t = texts[language];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: t.welcomeMessage,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get driver name by ID
  const getDriverName = (driverId: number) => {
    const driver = mockDriversData.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  // Enhanced AI response logic
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Fine-related queries - FIXED LOGIC
    if (lowerInput.includes('fine') || lowerInput.includes('violation') || lowerInput.includes('penalty')) {
      if (lowerInput.includes('who') || lowerInput.includes('which driver') || lowerInput.includes('show me drivers')) {
        // Get drivers who have fines
        const driversWithFines = mockFinesData.map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return {
            driverName: driver ? driver.name : 'Unknown',
            fine: fine
          };
        });

        if (driversWithFines.length === 0) {
          return "✅ **No Fines Found**\n\nGreat news! Currently no drivers have any recorded fines.";
        }

        // Group fines by driver
        const finesByDriver = driversWithFines.reduce((acc, item) => {
          if (!acc[item.driverName]) {
            acc[item.driverName] = [];
          }
          acc[item.driverName].push(item.fine);
          return acc;
        }, {} as Record<string, typeof mockFinesData>);

        let response = "🚨 **Drivers with Fines**\n\n";
        
        Object.entries(finesByDriver).forEach(([driverName, fines]) => {
          const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);
          const pendingFines = fines.filter(f => f.status === 'pending');
          
          response += `**${driverName}**\n`;
          response += `• Total fines: ${fines.length}\n`;
          response += `• Total amount: AED ${totalAmount.toLocaleString()}\n`;
          response += `• Pending: ${pendingFines.length} (AED ${pendingFines.reduce((sum, f) => sum + f.amount, 0).toLocaleString()})\n\n`;
        });

        return response;
      }

      // Specific driver fine query
      const driverMatch = mockDriversData.find(driver => 
        lowerInput.includes(driver.name.toLowerCase()) || 
        lowerInput.includes(driver.name.split(' ')[0].toLowerCase())
      );

      if (driverMatch) {
        const driverFines = mockFinesData.filter(fine => fine.driverId === driverMatch.id);
        
        if (driverFines.length === 0) {
          return `✅ **${driverMatch.name}**\n\nNo fines recorded for this driver.`;
        }

        let response = `🚨 **${driverMatch.name} - Fine Details**\n\n`;
        
        driverFines.forEach(fine => {
          response += `**${fine.violation}**\n`;
          response += `• Amount: AED ${fine.amount.toLocaleString()}\n`;
          response += `• Date: ${fine.date}\n`;
          response += `• Status: ${fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}\n`;
          response += `• Location: ${fine.location || 'Not specified'}\n\n`;
        });

        const totalAmount = driverFines.reduce((sum, fine) => sum + fine.amount, 0);
        const pendingAmount = driverFines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
        
        response += `**Summary:**\n`;
        response += `• Total fines: ${driverFines.length}\n`;
        response += `• Total amount: AED ${totalAmount.toLocaleString()}\n`;
        response += `• Pending amount: AED ${pendingAmount.toLocaleString()}`;

        return response;
      }

      // General fine statistics
      const totalFines = mockFinesData.length;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending');
      const totalAmount = mockFinesData.reduce((sum, fine) => sum + fine.amount, 0);
      const pendingAmount = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);

      return `🚨 **Fine Management Overview**\n\n**Statistics:**\n• Total fines: ${totalFines}\n• Pending fines: ${pendingFines.length}\n• Total amount: AED ${totalAmount.toLocaleString()}\n• Pending amount: AED ${pendingAmount.toLocaleString()}\n\n💡 **Ask me:**\n• "Who got a fine?"\n• "Show me Omar's fines"\n• "Which drivers have pending fines?"`;
    }

    // Driver-related queries
    if (lowerInput.includes('driver') || lowerInput.includes('active') || lowerInput.includes('performance')) {
      if (lowerInput.includes('active') || lowerInput.includes('online')) {
        const activeDrivers = mockDriversData.filter(d => d.status === 'active');
        let response = `👥 **Active Drivers (${activeDrivers.length}/${mockDriversData.length})**\n\n`;
        
        activeDrivers.forEach(driver => {
          response += `**${driver.name}**\n`;
          response += `• Vehicle: ${driver.vehicleId || 'Not assigned'}\n`;
          response += `• Performance: ${driver.performanceScore}%\n`;
          response += `• ${fleetMode === 'taxi' ? 'Trips today' : 'Monthly earnings'}: ${fleetMode === 'taxi' ? driver.trips : '$' + driver.earnings.toLocaleString()}\n\n`;
        });
        
        return response;
      }

      if (lowerInput.includes('performance') || lowerInput.includes('score')) {
        const avgPerformance = mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length;
        const topPerformer = mockDriversData.reduce((prev, current) => 
          prev.performanceScore > current.performanceScore ? prev : current
        );
        
        return `📊 **Driver Performance Overview**\n\n**Fleet Average:** ${avgPerformance.toFixed(1)}%\n\n**Top Performer:** ${topPerformer.name}\n• Score: ${topPerformer.performanceScore}%\n• ${fleetMode === 'taxi' ? 'Trips' : 'Earnings'}: ${fleetMode === 'taxi' ? topPerformer.trips : '$' + topPerformer.earnings.toLocaleString()}\n\n**Performance Distribution:**\n• Excellent (90%+): ${mockDriversData.filter(d => d.performanceScore >= 90).length} drivers\n• Good (80-89%): ${mockDriversData.filter(d => d.performanceScore >= 80 && d.performanceScore < 90).length} drivers\n• Needs Improvement (<80%): ${mockDriversData.filter(d => d.performanceScore < 80).length} drivers`;
      }

      // Specific driver lookup
      const driverMatch = mockDriversData.find(driver => 
        lowerInput.includes(driver.name.toLowerCase()) || 
        lowerInput.includes(driver.name.split(' ')[0].toLowerCase())
      );

      if (driverMatch) {
        const driverFines = mockFinesData.filter(f => f.driverId === driverMatch.id);
        const contract = mockContractsData.find(c => c.driverId === driverMatch.id);
        
        return `👤 **${driverMatch.name}**\n\n**Status:** ${driverMatch.status === 'active' ? '🟢 Active' : '🔴 Offline'}\n**Vehicle:** ${driverMatch.vehicleId || 'Not assigned'}\n**Performance:** ${driverMatch.performanceScore}%\n**${fleetMode === 'taxi' ? 'Trips Today' : 'Monthly Earnings'}:** ${fleetMode === 'taxi' ? driverMatch.trips : '$' + driverMatch.earnings.toLocaleString()}\n**Contact:** ${driverMatch.phone}\n**Fines:** ${driverFines.length} (${driverFines.filter(f => f.status === 'pending').length} pending)\n**Contract:** ${contract ? contract.status : 'No contract'}`;
      }
    }

    // Fleet mode switching
    if (lowerInput.includes('switch') || lowerInput.includes('change') || lowerInput.includes('mode')) {
      if (lowerInput.includes('taxi')) {
        onFleetModeChange('taxi');
        return `🚕 **Switched to Taxi Mode**\n\nYour dashboard is now optimized for taxi operations:\n• Trip-based tracking\n• Shift management\n• Real-time dispatch\n• Customer ratings\n\nThe interface will update to show taxi-specific metrics and controls.`;
      } else if (lowerInput.includes('rental')) {
        onFleetModeChange('rental');
        return `🚗 **Switched to Rental Mode**\n\nYour dashboard is now optimized for vehicle rentals:\n• Contract management\n• Monthly billing\n• Long-term tracking\n• Deposit handling\n\nThe interface will update to show rental-specific metrics and controls.`;
      }
    }

    // Contract-related queries
    if (lowerInput.includes('contract') || lowerInput.includes('rental') || lowerInput.includes('expir')) {
      const activeContracts = mockContractsData.filter(c => c.status === 'active');
      const totalRevenue = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0);
      
      return `📋 **Contract Overview**\n\n**Active Contracts:** ${activeContracts.length}\n**Monthly Revenue:** $${totalRevenue.toLocaleString()}\n**Average Rent:** $${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**Recent Contracts:**\n${activeContracts.slice(0, 3).map(contract => {
        const driver = mockDriversData.find(d => d.id === contract.driverId);
        return `• ${driver?.name || 'Unknown'} - $${contract.monthlyRent}/month`;
      }).join('\n')}`;
    }

    // Revenue and analytics
    if (lowerInput.includes('revenue') || lowerInput.includes('earning') || lowerInput.includes('money') || lowerInput.includes('profit')) {
      const totalEarnings = mockDriversData.reduce((sum, d) => sum + d.earnings, 0);
      const avgEarnings = totalEarnings / mockDriversData.length;
      const topEarner = mockDriversData.reduce((prev, current) => 
        prev.earnings > current.earnings ? prev : current
      );
      
      return `💰 **Revenue Analytics**\n\n**Total ${fleetMode === 'taxi' ? 'Daily' : 'Monthly'} Revenue:** $${totalEarnings.toLocaleString()}\n**Average per Driver:** $${Math.round(avgEarnings).toLocaleString()}\n**Top Earner:** ${topEarner.name} ($${topEarner.earnings.toLocaleString()})\n\n**Revenue Distribution:**\n• High earners ($1000+): ${mockDriversData.filter(d => d.earnings >= 1000).length} drivers\n• Medium earners ($500-999): ${mockDriversData.filter(d => d.earnings >= 500 && d.earnings < 1000).length} drivers\n• Low earners (<$500): ${mockDriversData.filter(d => d.earnings < 500).length} drivers`;
    }

    // Fleet statistics
    if (lowerInput.includes('fleet') || lowerInput.includes('overview') || lowerInput.includes('summary') || lowerInput.includes('status')) {
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      const totalTrips = mockDriversData.reduce((sum, d) => sum + d.trips, 0);
      const avgPerformance = mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending').length;
      
      return `🚗 **Fleet Status Overview**\n\n**Drivers:** ${activeDrivers}/${mockDriversData.length} active\n**${fleetMode === 'taxi' ? 'Total Trips Today' : 'Active Rentals'}:** ${fleetMode === 'taxi' ? totalTrips : activeDrivers}\n**Average Performance:** ${avgPerformance.toFixed(1)}%\n**Pending Fines:** ${pendingFines}\n**Fleet Mode:** ${fleetMode === 'taxi' ? '🚕 Taxi Operations' : '🚗 Rental Management'}\n\n**Quick Actions:**\n• "Show active drivers"\n• "Who has fines?"\n• "Switch to ${fleetMode === 'taxi' ? 'rental' : 'taxi'} mode"`;
    }

    // Help and capabilities
    if (lowerInput.includes('help') || lowerInput.includes('what can you') || lowerInput.includes('capabilities')) {
      return `🤖 **NavEdge AI Capabilities**\n\n**Driver Management:**\n• Check driver status and performance\n• View driver locations and assignments\n• Monitor driver earnings and trips\n\n**Fine & Compliance:**\n• Track traffic violations and fines\n• Monitor payment status\n• Generate compliance reports\n\n**Fleet Operations:**\n• Switch between taxi and rental modes\n• Monitor fleet utilization\n• Track revenue and performance\n\n**Analytics & Insights:**\n• Performance analytics\n• Revenue tracking\n• Operational insights\n\n💡 **Try asking:**\n• "Who got a fine?"\n• "Show me active drivers"\n• "What's my revenue?"\n• "Switch to taxi mode"`;
    }

    // Default response for unrecognized queries
    return `🤔 **I'm here to help!**\n\nI didn't quite understand that. Here are some things you can ask me:\n\n**Driver Queries:**\n• "Show me active drivers"\n• "Who has the best performance?"\n• "Find Omar Khalil"\n\n**Fine Management:**\n• "Who got a fine?"\n• "Show me pending fines"\n• "Omar's fine details"\n\n**Fleet Operations:**\n• "Switch to taxi mode"\n• "What's my fleet status?"\n• "Show me revenue"\n\n💡 **Just ask naturally - I understand conversational language!**`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold text-gray-900 mt-2 mb-1">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-gray-700">{line}</div>;
      }
      if (line.includes('🟢') || line.includes('🔴') || line.includes('🚕') || line.includes('🚗')) {
        return <div key={index} className="text-gray-800">{line}</div>;
      }
      return <div key={index} className="text-gray-700">{line}</div>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.type === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">{t.typing}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{t.send}</span>
            </button>
          </div>
          
          {isListening && (
            <div className="mt-2 text-center">
              <span className="text-sm text-red-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                {t.listening}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavEdgeAssistant;