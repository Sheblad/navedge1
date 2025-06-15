import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
      title: 'AI Fleet Assistant',
      placeholder: 'Ask me about your fleet...',
      send: 'Send',
      typing: 'AI is typing...',
      welcome: 'Hello! I\'m your AI fleet assistant. I can help you with driver information, earnings, fines, and more. What would you like to know?',
      examples: [
        'Which driver earned the most this week?',
        'Show drivers with more than 2 fines',
        'List inactive drivers',
        'What\'s the total fleet earnings today?'
      ]
    },
    ar: {
      title: 'المساعد الذكي للأسطول',
      placeholder: 'اسألني عن أسطولك...',
      send: 'إرسال',
      typing: 'الذكي الاصطناعي يكتب...',
      welcome: 'مرحباً! أنا مساعدك الذكي للأسطول. يمكنني مساعدتك في معلومات السائقين والأرباح والمخالفات والمزيد. ماذا تريد أن تعرف؟',
      examples: [
        'أي سائق حقق أعلى أرباح هذا الأسبوع؟',
        'أظهر السائقين الذين لديهم أكثر من مخالفتين',
        'اعرض السائقين غير النشطين',
        'ما هو إجمالي أرباح الأسطول اليوم؟'
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
      timestamp: new Date()
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Driver earnings queries
    if (lowerQuery.includes('earned') || lowerQuery.includes('earning') || lowerQuery.includes('most')) {
      const topDriver = mockDriversData.reduce((prev, current) => 
        prev.earnings > current.earnings ? prev : current
      );
      return `The highest earning driver is ${topDriver.name} with $${topDriver.earnings.toLocaleString()} ${fleetMode === 'taxi' ? 'today' : 'this month'}.`;
    }

    // Fines queries
    if (lowerQuery.includes('fine') || lowerQuery.includes('violation')) {
      const driversWithFines = mockDriversData.filter(driver => 
        mockFinesData.some(fine => fine.driverId === driver.id)
      );
      
      if (driversWithFines.length === 0) {
        return 'Great news! No drivers currently have outstanding fines.';
      }
      
      return `${driversWithFines.length} driver(s) have fines: ${driversWithFines.map(d => d.name).join(', ')}`;
    }

    // Inactive drivers
    if (lowerQuery.includes('inactive') || lowerQuery.includes('offline')) {
      const inactiveDrivers = mockDriversData.filter(d => d.status === 'offline');
      if (inactiveDrivers.length === 0) {
        return 'All drivers are currently active!';
      }
      return `Inactive drivers: ${inactiveDrivers.map(d => d.name).join(', ')}`;
    }

    // Total earnings
    if (lowerQuery.includes('total') && (lowerQuery.includes('earning') || lowerQuery.includes('revenue'))) {
      const totalEarnings = mockDriversData.reduce((sum, driver) => sum + driver.earnings, 0);
      return `Total fleet earnings: $${totalEarnings.toLocaleString()} ${fleetMode === 'taxi' ? 'today' : 'this month'}.`;
    }

    // Active drivers count
    if (lowerQuery.includes('active') && lowerQuery.includes('driver')) {
      const activeCount = mockDriversData.filter(d => d.status === 'active').length;
      return `You have ${activeCount} active drivers out of ${mockDriversData.length} total drivers.`;
    }

    // Default response
    return "I can help you with driver information, earnings, fines, and fleet statistics. Try asking about specific drivers, earnings, or fines.";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: processQuery(inputText),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
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
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.isUser ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-200 rounded-full">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Examples */}
          {messages.length === 1 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {t.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(example)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
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