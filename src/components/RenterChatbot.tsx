import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader } from 'lucide-react';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

interface RenterChatbotProps {
  language: Language;
  onClose: () => void;
  driverId?: string;
  contractId?: string;
}

const RenterChatbot: React.FC<RenterChatbotProps> = ({ language, onClose, driverId, contractId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState<string>(`conv_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'Renter Assistant',
      placeholder: 'Type your message...',
      send: 'Send',
      welcomeMessage: 'Hello! I am your rental assistant. How can I help you today?',
      error: 'Sorry, I encountered an error. Please try again.',
    },
    ar: {
      title: 'مساعد المستأجر',
      placeholder: 'اكتب رسالتك...',
      send: 'إرسال',
      welcomeMessage: 'مرحبا! أنا مساعد الإيجار الخاص بك. كيف يمكنني مساعدتك اليوم؟',
      error: 'عذرا، واجهت خطأ. يرجى المحاولة مرة أخرى.',
    },
    hi: {
      title: 'किराएदार सहायक',
      placeholder: 'अपना संदेश टाइप करें...',
      send: 'भेजें',
      welcomeMessage: 'नमस्ते! मैं आपका किराया सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
      error: 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।',
    },
    ur: {
      title: 'کرایہ دار معاون',
      placeholder: 'اپنا پیغام ٹائپ کریں...',
      send: 'بھیجیں',
      welcomeMessage: 'ہیلو! میں آپ کا کرایہ معاون ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟',
      error: 'معذرت، مجھے ایک خرابی کا سامنا کرنا پڑا۔ براہ کرم دوبارہ کوشش کریں۔',
    }
  };

  const t = texts[language];

  useEffect(() => {
    setMessages([{
      id: '1',
      text: t.welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: driverId ? [
        'How long do I have left on my contract?',
        'Do I have any fines?',
        'How many km do I have left?',
        'What is my current rental balance?',
        'When is my next payment due?'
      ] : [
        'How do I rent a vehicle?',
        'What documents do I need?',
        'What are the rental rates?',
        'How do I report damage?'
      ]
    }]);
  }, [t.welcomeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await FastAPIService.sendChatbotMessage(text, conversationId);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t.error,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl h-[80vh] md:h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t.title}</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-4 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 text-gray-500 animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterChatbot;
