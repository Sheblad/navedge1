import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Zap, BarChart3, AlertTriangle, FileText, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'action' | 'wizard' | 'confirmation';
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
      placeholder: 'Ask me anything or tell me what to do...',
      send: 'Send',
      typing: 'AI is working...',
      welcome: `Hello! I'm your AI-powered fleet control hub. I can help you analyze data, manage operations, and perform administrative tasks for your ${fleetMode} fleet. Just tell me what you need!`,
      quickActions: 'Quick Actions',
      examples: [
        'Create a new rental contract for Ahmed',
        'Switch to Taxi Mode',
        'Show me top performers this week',
        'Add a fine for speeding',
        'Export earnings report',
        'Assign car DXB-123 to driver Omar',
        'Send warning to low performers',
        'Generate maintenance schedule'
      ],
      confirm: 'Confirm',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No'
    },
    ar: {
      title: 'مركز التحكم الذكي نافيدج',
      subtitle: 'مساعدك الشخصي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء أو أخبرني ماذا تريد أن أفعل...',
      send: 'إرسال',
      typing: 'الذكي الاصطناعي يعمل...',
      welcome: `مرحباً! أنا مركز التحكم الذكي المدعوم بالذكاء الاصطناعي. يمكنني مساعدتك في تحليل البيانات وإدارة العمليات وتنفيذ المهام الإدارية لأسطول ${fleetMode === 'rental' ? 'الإيجار' : 'التاكسي'} الخاص بك. فقط أخبرني ما تحتاجه!`,
      quickActions: 'الإجراءات السريعة',
      examples: [
        'إنشاء عقد إيجار جديد لأحمد',
        'التبديل إلى وضع التاكسي',
        'أظهر لي أفضل الأداءات هذا الأسبوع',
        'إضافة مخالفة للسرعة الزائدة',
        'تصدير تقرير الأرباح',
        'تعيين السيارة DXB-123 للسائق عمر',
        'إرسال تحذير للأداءات المنخفضة',
        'إنشاء جدول الصيانة'
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

  const processAdvancedQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
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

    // ACTION: Add fine
    if (lowerQuery.includes('add') && lowerQuery.includes('fine')) {
      const driverName = extractDriverName(query);
      return {
        id: Date.now().toString(),
        text: `🚨 **Fine Registration Wizard**\n\nI'll help you add a new fine${driverName ? ` for ${driverName}` : ''}.\n\nPlease provide:\n1. Driver name\n2. Vehicle plate number\n3. Violation type (speeding, parking, etc.)\n4. Fine amount (AED)\n5. Location of violation\n6. Date of violation\n\nThe fine will be automatically processed according to your fleet mode.`,
        isUser: false,
        timestamp: new Date(),
        type: 'action',
        actionType: 'add_fine'
      };
    }

    // ACTION: Assign vehicle
    if (lowerQuery.includes('assign') && (lowerQuery.includes('car') || lowerQuery.includes('vehicle'))) {
      const vehicleId = extractVehicleId(query);
      const driverName = extractDriverName(query);
      
      return {
        id: Date.now().toString(),
        text: `🚗 **Vehicle Assignment**\n\n${vehicleId && driverName ? 
          `Assigning vehicle ${vehicleId} to ${driverName}` :
          'I need both vehicle ID and driver name to complete the assignment'
        }\n\nThis will:\n• Update driver's assigned vehicle\n• Log the assignment in the system\n• Send notification to the driver\n• Update vehicle status\n\nProceed with assignment?`,
        isUser: false,
        timestamp: new Date(),
        type: 'confirmation',
        actionType: 'assign_vehicle',
        data: { vehicleId, driverName }
      };
    }

    // ACTION: Export report
    if (lowerQuery.includes('export') && lowerQuery.includes('report')) {
      return {
        id: Date.now().toString(),
        text: `📊 **Report Export Center**\n\nAvailable reports:\n\n1. **Weekly Performance Report**\n   - Driver rankings and metrics\n   - Earnings breakdown\n   - Performance trends\n\n2. **Financial Summary**\n   - Total earnings\n   - Outstanding fines\n   - Revenue analysis\n\n3. **Fleet Utilization Report**\n   - Vehicle usage statistics\n   - Driver activity logs\n   - Efficiency metrics\n\n4. **Compliance Report**\n   - Fine history\n   - Contract status\n   - Maintenance records\n\nWhich report would you like to generate?`,
        isUser: false,
        timestamp: new Date(),
        type: 'action',
        actionType: 'export_report'
      };
    }

    // ACTION: Send warning
    if (lowerQuery.includes('send') && lowerQuery.includes('warning')) {
      const lowPerformers = mockDriversData.filter(d => d.performanceScore < 80);
      
      return {
        id: Date.now().toString(),
        text: `⚠️ **Driver Warning System**\n\n${lowPerformers.length > 0 ? 
          `Found ${lowPerformers.length} driver(s) with performance below 80%:\n\n${lowPerformers.map(d => `• ${d.name}: ${d.performanceScore}%`).join('\n')}\n\nWarning message will include:\n• Performance improvement requirements\n• Training recommendations\n• Timeline for improvement\n• Consequences of continued poor performance\n\nSend warnings to these drivers?` :
          'All drivers are performing above 80%. No warnings needed at this time.'
        }`,
        isUser: false,
        timestamp: new Date(),
        type: lowPerformers.length > 0 ? 'confirmation' : 'text',
        actionType: 'send_warning',
        data: { drivers: lowPerformers }
      };
    }

    // ANALYSIS: Performance queries
    if (lowerQuery.includes('performance') || lowerQuery.includes('top') || lowerQuery.includes('best')) {
      const topDrivers = mockDriversData
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 5);
      
      return {
        id: Date.now().toString(),
        text: `🏆 **Top Performers This Week**\n\n${topDrivers.map((driver, index) => 
          `${index + 1}. **${driver.name}**\n   Performance: ${driver.performanceScore}%\n   Earnings: $${driver.earnings.toLocaleString()}\n   Trips: ${driver.trips}\n   Status: ${driver.status === 'active' ? '🟢 Active' : '🔴 Offline'}`
        ).join('\n\n')}\n\n**Fleet Average:** ${Math.round(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length)}%`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // ANALYSIS: Earnings queries
    if (lowerQuery.includes('earning') || lowerQuery.includes('revenue') || lowerQuery.includes('money')) {
      const totalEarnings = mockDriversData.reduce((sum, d) => sum + d.earnings, 0);
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      const topEarner = mockDriversData.reduce((prev, current) => prev.earnings > current.earnings ? prev : current);
      
      return {
        id: Date.now().toString(),
        text: `💰 **Financial Dashboard**\n\n**Total Fleet Earnings:** $${totalEarnings.toLocaleString()}\n**Active Drivers:** ${activeDrivers}/${mockDriversData.length}\n**Average per Driver:** $${Math.round(totalEarnings / activeDrivers).toLocaleString()}\n\n**Top Earner:** ${topEarner.name}\n• Earnings: $${topEarner.earnings.toLocaleString()}\n• Trips: ${topEarner.trips}\n• Performance: ${topEarner.performanceScore}%\n\n**Fleet Utilization:** ${Math.round((activeDrivers / mockDriversData.length) * 100)}%`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // ANALYSIS: Fines and compliance
    if (lowerQuery.includes('fine') || lowerQuery.includes('violation') || lowerQuery.includes('compliance')) {
      const pendingFines = mockFinesData.filter(f => f.status === 'pending');
      const totalFineAmount = mockFinesData.reduce((sum, f) => sum + f.amount, 0);
      
      return {
        id: Date.now().toString(),
        text: `🚨 **Compliance Overview**\n\n**Total Fines:** ${mockFinesData.length}\n**Pending:** ${pendingFines.length}\n**Total Amount:** AED ${totalFineAmount.toLocaleString()}\n\n**Recent Violations:**\n${mockFinesData.slice(0, 3).map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return `• ${driver?.name || 'Unknown'}: ${fine.violation} - AED ${fine.amount}`;
        }).join('\n')}\n\n${pendingFines.length > 0 ? '⚠️ **Action Required:** Process pending fines' : '✅ **All fines processed**'}`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Default intelligent response
    return {
      id: Date.now().toString(),
      text: `🤖 **AI Assistant Ready**\n\nI can help you with:\n\n**📊 Data Analysis:**\n• Performance reports\n• Earnings analysis\n• Fleet utilization\n\n**⚙️ Administrative Actions:**\n• Create contracts\n• Add fines\n• Assign vehicles\n• Switch fleet modes\n\n**📋 Management Tasks:**\n• Export reports\n• Send warnings\n• Generate schedules\n• Process payments\n\nTry saying: "Create a contract for Ahmed" or "Show me top performers"`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const extractDriverName = (query: string): string | null => {
    const patterns = [
      /for (\w+)/i,
      /driver (\w+)/i,
      /(\w+)'s/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractVehicleId = (query: string): string | null => {
    const match = query.match(/([A-Z]{3}-[A-Z]-?\d+)/i);
    return match ? match[1] : null;
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
          
        case 'assign_vehicle':
          responseText = `✅ **Vehicle assignment completed!**\n\n${message.data?.vehicleId} has been assigned to ${message.data?.driverName}.\n\n• Driver notified\n• System updated\n• Assignment logged`;
          break;
          
        case 'send_warning':
          responseText = `✅ **Warning messages sent!**\n\nPerformance improvement notices have been sent to ${message.data?.drivers?.length || 0} driver(s).\n\n• Email notifications sent\n• SMS alerts delivered\n• Follow-up scheduled`;
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
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.type === 'action' ? (
                    <Settings className="w-4 h-4 text-white" />
                  ) : message.type === 'confirmation' ? (
                    <AlertTriangle className="w-4 h-4 text-white" />
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