import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Brain, Zap, Users, AlertTriangle, FileText, Car, Navigation, DollarSign, TrendingUp, Calendar, MapPin, Phone, Mail, Settings, BarChart3 } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar' | 'hi' | 'ur';

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
  const [conversationContext, setConversationContext] = useState<{
    currentDriver?: number;
    topic?: string;
    lastQuery?: string;
    followUpContext?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'NavEdge AI Assistant',
      subtitle: 'Your intelligent fleet management companion',
      placeholder: 'Ask me anything about your fleet...',
      send: 'Send',
      listening: 'Listening...',
      typing: 'NavEdge is typing...',
      welcomeMessage: `👋 **Welcome to NavEdge AI!**\n\nI'm your intelligent fleet management assistant. I can help you with:\n\n🚗 **Driver Management**\n• Check driver performance\n• View driver locations\n• Manage driver assignments\n\n📋 **Contract & Fine Management**\n• Review contract details\n• Track fine payments\n• Monitor compliance\n\n📊 **Analytics & Reports**\n• Performance insights\n• Revenue analysis\n• Fleet utilization\n\n💡 **Try asking:**\n• "How many trips did Ahmed complete today?"\n• "What's my total earnings this month?"\n• "Who has pending fines?"\n• "Show me Ahmed's performance score"\n• "When does Omar's contract expire?"`
    },
    ar: {
      title: 'مساعد نافيدج الذكي',
      subtitle: 'رفيقك الذكي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن أسطولك...',
      send: 'إرسال',
      listening: 'أستمع...',
      typing: 'نافيدج يكتب...',
      welcomeMessage: `👋 **مرحباً بك في نافيدج الذكي!**\n\nأنا مساعدك الذكي لإدارة الأسطول. يمكنني مساعدتك في:\n\n🚗 **إدارة السائقين**\n• فحص أداء السائقين\n• عرض مواقع السائقين\n• إدارة تعيينات السائقين\n\n📋 **إدارة العقود والمخالفات**\n• مراجعة تفاصيل العقود\n• تتبع دفع المخالفات\n• مراقبة الامتثال\n\n📊 **التحليلات والتقارير**\n• رؤى الأداء\n• تحليل الإيرادات\n• استخدام الأسطول\n\n💡 **جرب السؤال:**\n• "كم عدد الرحلات التي أكملها أحمد اليوم؟"\n• "ما هي إجمالي أرباحي هذا الشهر؟"\n• "من لديه مخالفات معلقة؟"\n• "أظهر لي درجة أداء أحمد"\n• "متى ينتهي عقد عمر؟"`
    },
    hi: {
      title: 'नेवएज AI असिस्टेंट',
      subtitle: 'आपका बुद्धिमान फ्लीट प्रबंधन साथी',
      placeholder: 'अपने फ्लीट के बारे में कुछ भी पूछें...',
      send: 'भेजें',
      listening: 'सुन रहा हूं...',
      typing: 'नेवएज टाइप कर रहा है...',
      welcomeMessage: `👋 **नेवएज AI में आपका स्वागत है!**\n\nमैं आपका बुद्धिमान फ्लीट प्रबंधन सहायक हूं। मैं आपकी मदद कर सकता हूं:\n\n🚗 **ड्राइवर प्रबंधन**\n• ड्राइवर प्रदर्शन जांचें\n• ड्राइवर स्थान देखें\n• ड्राइवर असाइनमेंट प्रबंधित करें\n\n📋 **अनुबंध और जुर्माना प्रबंधन**\n• अनुबंध विवरण समीक्षा करें\n• जुर्माना भुगतान ट्रैक करें\n• अनुपालन की निगरानी करें\n\n📊 **एनालिटिक्स और रिपोर्ट**\n• प्रदर्शन अंतर्दृष्टि\n• राजस्व विश्लेषण\n• फ्लीट उपयोग\n\n💡 **पूछने की कोशिश करें:**\n• "अहमद ने आज कितनी यात्राएं पूरी कीं?"\n• "इस महीने मेरी कुल कमाई क्या है?"\n• "किसके पास लंबित जुर्माना है?"\n• "मुझे अहमद का प्रदर्शन स्कोर दिखाएं"\n• "उमर का अनुबंध कब समाप्त होता है?"`
    },
    ur: {
      title: 'نیو ایج AI اسسٹنٹ',
      subtitle: 'آپ کا ذہین فلیٹ منیجمنٹ ساتھی',
      placeholder: 'اپنے فلیٹ کے بارے میں کچھ بھی پوچھیں...',
      send: 'بھیجیں',
      listening: 'سن رہا ہوں...',
      typing: 'نیو ایج ٹائپ کر رہا ہے...',
      welcomeMessage: `👋 **نیو ایج AI میں خوش آمدید!**\n\nمیں آپ کا ذہین فلیٹ منیجمنٹ اسسٹنٹ ہوں۔ میں آپ کی مدد کر سکتا ہوں:\n\n🚗 **ڈرائیور منیجمنٹ**\n• ڈرائیور کی کارکردگی چیک کریں\n• ڈرائیور کے مقامات دیکھیں\n• ڈرائیور اسائنمنٹس منظم کریں\n\n📋 **کنٹریکٹ اور جرمانہ منیجمنٹ**\n• کنٹریکٹ کی تفصیلات کا جائزہ لیں\n• جرمانے کی ادائیگی ٹریک کریں\n• تعمیل کی نگرانی کریں\n\n📊 **تجزیات اور رپورٹس**\n• کارکردگی کی بصیرت\n• آمدنی کا تجزیہ\n• فلیٹ کا استعمال\n\n💡 **پوچھنے کی کوشش کریں:**\n• "احمد نے آج کتنے سفر مکمل کیے؟"\n• "اس مہینے میری کل کمائی کیا ہے؟"\n• "کس کے پاس زیر التواء جرمانے ہیں؟"\n• "مجھے احمد کا کارکردگی اسکور دکھائیں"\n• "عمر کا کنٹریکٹ کب ختم ہوتا ہے؟"`
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

  // Find driver by name (case insensitive partial match)
  const findDriverByName = (name: string) => {
    const lowerName = name.toLowerCase();
    return mockDriversData.find(driver => 
      driver.name.toLowerCase().includes(lowerName)
    );
  };

  // Calculate days remaining for contracts
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const timeDiff = end.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining;
  };

  // Process trip-related queries
  const processTripQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // If no specific driver is mentioned or in context, use the first active driver for demo
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : mockDriversData.find(d => d.status === 'active');
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (!targetDriver) {
      targetDriver = mockDriversData[0]; // Fallback to first driver
    }
    
    // Set context for follow-up questions
    setConversationContext({
      currentDriver: targetDriver.id,
      topic: 'trips',
      lastQuery: query
    });
    
    // Check for specific trip queries
    if (lowerQuery.includes('today') || lowerQuery.includes('complete today') || lowerQuery.includes('did today')) {
      return {
        en: `${targetDriver.name} has completed a total of ${targetDriver.trips_today || 3} trips today.`,
        ar: `أكمل ${targetDriver.name} ما مجموعه ${targetDriver.trips_today || 3} رحلات اليوم.`,
        hi: `${targetDriver.name} ने आज कुल ${targetDriver.trips_today || 3} यात्राएं पूरी की हैं।`,
        ur: `${targetDriver.name} نے آج کل ${targetDriver.trips_today || 3} سفر مکمل کیے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('week') || lowerQuery.includes('this week')) {
      const weeklyTrips = (targetDriver.trips_today || 3) * 5; // Simulate weekly data
      return {
        en: `${targetDriver.name} has completed ${weeklyTrips} trips this week.`,
        ar: `أكمل ${targetDriver.name} ${weeklyTrips} رحلة هذا الأسبوع.`,
        hi: `${targetDriver.name} ने इस सप्ताह ${weeklyTrips} यात्राएं पूरी की हैं।`,
        ur: `${targetDriver.name} نے اس ہفتے ${weeklyTrips} سفر مکمل کیے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('month') || lowerQuery.includes('this month')) {
      const monthlyTrips = targetDriver.trips;
      return {
        en: `${targetDriver.name} has completed ${monthlyTrips} trips this month.`,
        ar: `أكمل ${targetDriver.name} ${monthlyTrips} رحلة هذا الشهر.`,
        hi: `${targetDriver.name} ने इस महीने ${monthlyTrips} यात्राएं पूरी की हैं।`,
        ur: `${targetDriver.name} نے اس مہینے ${monthlyTrips} سفر مکمل کیے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('total') || lowerQuery.includes('all time')) {
      return {
        en: `${targetDriver.name} has completed a total of ${targetDriver.trips} trips.`,
        ar: `أكمل ${targetDriver.name} ما مجموعه ${targetDriver.trips} رحلة.`,
        hi: `${targetDriver.name} ने कुल ${targetDriver.trips} यात्राएं पूरी की हैं।`,
        ur: `${targetDriver.name} نے کل ${targetDriver.trips} سفر مکمل کیے ہیں۔`
      }[language];
    }
    
    // Default response for trip queries
    return {
      en: `${targetDriver.name} has completed a total of ${targetDriver.trips} trips, with ${targetDriver.trips_today || 3} trips today.`,
      ar: `أكمل ${targetDriver.name} ما مجموعه ${targetDriver.trips} رحلة، مع ${targetDriver.trips_today || 3} رحلات اليوم.`,
      hi: `${targetDriver.name} ने कुल ${targetDriver.trips} यात्राएं पूरी की हैं, आज ${targetDriver.trips_today || 3} यात्राएं।`,
      ur: `${targetDriver.name} نے کل ${targetDriver.trips} سفر مکمل کیے ہیں، آج ${targetDriver.trips_today || 3} سفر۔`
    }[language];
  };

  // Process earnings-related queries
  const processEarningsQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // If no specific driver is mentioned or in context, use the first active driver for demo
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : mockDriversData.find(d => d.status === 'active');
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (!targetDriver) {
      targetDriver = mockDriversData[0]; // Fallback to first driver
    }
    
    // Set context for follow-up questions
    setConversationContext({
      currentDriver: targetDriver.id,
      topic: 'earnings',
      lastQuery: query
    });
    
    // Check for specific earnings queries
    if (lowerQuery.includes('today') || lowerQuery.includes('earn today')) {
      const todayEarnings = targetDriver.earnings_today || Math.round(targetDriver.earnings / 20);
      return {
        en: `${targetDriver.name} has earned $${todayEarnings} today.`,
        ar: `كسب ${targetDriver.name} $${todayEarnings} اليوم.`,
        hi: `${targetDriver.name} ने आज $${todayEarnings} कमाए हैं।`,
        ur: `${targetDriver.name} نے آج $${todayEarnings} کمائے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('week') || lowerQuery.includes('this week')) {
      const weeklyEarnings = Math.round(targetDriver.earnings / 4);
      return {
        en: `${targetDriver.name} has earned $${weeklyEarnings} this week.`,
        ar: `كسب ${targetDriver.name} $${weeklyEarnings} هذا الأسبوع.`,
        hi: `${targetDriver.name} ने इस सप्ताह $${weeklyEarnings} कमाए हैं।`,
        ur: `${targetDriver.name} نے اس ہفتے $${weeklyEarnings} کمائے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('month') || lowerQuery.includes('this month')) {
      return {
        en: `${targetDriver.name} has earned $${targetDriver.earnings} this month.`,
        ar: `كسب ${targetDriver.name} $${targetDriver.earnings} هذا الشهر.`,
        hi: `${targetDriver.name} ने इस महीने $${targetDriver.earnings} कमाए हैं।`,
        ur: `${targetDriver.name} نے اس مہینے $${targetDriver.earnings} کمائے ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('total') || lowerQuery.includes('all time')) {
      const totalEarnings = targetDriver.earnings * 3; // Simulate all-time earnings
      return {
        en: `${targetDriver.name} has earned a total of $${totalEarnings} all time.`,
        ar: `كسب ${targetDriver.name} ما مجموعه $${totalEarnings} طوال الوقت.`,
        hi: `${targetDriver.name} ने अब तक कुल $${totalEarnings} कमाए हैं।`,
        ur: `${targetDriver.name} نے اب تک کل $${totalEarnings} کمائے ہیں۔`
      }[language];
    }
    
    // Default response for earnings queries
    return {
      en: `${targetDriver.name} has earned $${targetDriver.earnings} this month and $${targetDriver.earnings_today || Math.round(targetDriver.earnings / 20)} today.`,
      ar: `كسب ${targetDriver.name} $${targetDriver.earnings} هذا الشهر و $${targetDriver.earnings_today || Math.round(targetDriver.earnings / 20)} اليوم.`,
      hi: `${targetDriver.name} ने इस महीने $${targetDriver.earnings} और आज $${targetDriver.earnings_today || Math.round(targetDriver.earnings / 20)} कमाए हैं।`,
      ur: `${targetDriver.name} نے اس مہینے $${targetDriver.earnings} اور آج $${targetDriver.earnings_today || Math.round(targetDriver.earnings / 20)} کمائے ہیں۔`
    }[language];
  };

  // Process fine-related queries
  const processFineQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for general fine queries
    if (lowerQuery.includes('all') || lowerQuery.includes('total')) {
      const totalFines = mockFinesData.length;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending').length;
      
      return {
        en: `There are ${totalFines} total fines in the system, with ${pendingFines} pending fines that require attention.`,
        ar: `هناك ${totalFines} مخالفة إجمالية في النظام، مع ${pendingFines} مخالفات معلقة تتطلب الاهتمام.`,
        hi: `सिस्टम में कुल ${totalFines} जुर्माने हैं, जिनमें से ${pendingFines} लंबित जुर्माने हैं जिन्हें ध्यान देने की आवश्यकता है।`,
        ur: `سسٹم میں کل ${totalFines} جرمانے ہیں، جن میں سے ${pendingFines} زیر التواء جرمانے ہیں جن کو توجہ کی ضرورت ہے۔`
      }[language];
    }
    
    if (lowerQuery.includes('pending') || lowerQuery.includes('unpaid')) {
      const pendingFines = mockFinesData.filter(f => f.status === 'pending');
      
      if (pendingFines.length === 0) {
        return {
          en: `There are no pending fines at the moment.`,
          ar: `لا توجد مخالفات معلقة في الوقت الحالي.`,
          hi: `इस समय कोई लंबित जुर्माना नहीं है।`,
          ur: `اس وقت کوئی زیر التواء جرمانہ نہیں ہے۔`
        }[language];
      }
      
      let response = {
        en: `There are ${pendingFines.length} pending fines:\n\n`,
        ar: `هناك ${pendingFines.length} مخالفات معلقة:\n\n`,
        hi: `${pendingFines.length} लंबित जुर्माने हैं:\n\n`,
        ur: `${pendingFines.length} زیر التواء جرمانے ہیں:\n\n`
      }[language];
      
      pendingFines.forEach((fine, index) => {
        const driverName = getDriverName(fine.driverId);
        
        if (language === 'en') {
          response += `${index + 1}. ${driverName}: ${fine.violation} - AED ${fine.amount}\n`;
        } else if (language === 'ar') {
          response += `${index + 1}. ${driverName}: ${fine.violation} - ${fine.amount} درهم\n`;
        } else if (language === 'hi') {
          response += `${index + 1}. ${driverName}: ${fine.violation} - AED ${fine.amount}\n`;
        } else {
          response += `${index + 1}. ${driverName}: ${fine.violation} - AED ${fine.amount}\n`;
        }
      });
      
      return response;
    }
    
    // Check for driver-specific fine queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'fines',
        lastQuery: query
      });
      
      const driverFines = mockFinesData.filter(f => f.driverId === targetDriver!.id);
      const pendingFines = driverFines.filter(f => f.status === 'pending');
      
      if (driverFines.length === 0) {
        return {
          en: `${targetDriver.name} has no fines on record.`,
          ar: `ليس لدى ${targetDriver.name} أي مخالفات مسجلة.`,
          hi: `${targetDriver.name} के पास कोई दर्ज जुर्माना नहीं है।`,
          ur: `${targetDriver.name} کے پاس کوئی درج جرمانہ نہیں ہے۔`
        }[language];
      }
      
      if (pendingFines.length === 0) {
        return {
          en: `${targetDriver.name} has ${driverFines.length} fines on record, but none are pending payment.`,
          ar: `لدى ${targetDriver.name} ${driverFines.length} مخالفات مسجلة، ولكن لا يوجد أي منها معلق الدفع.`,
          hi: `${targetDriver.name} के पास ${driverFines.length} दर्ज जुर्माने हैं, लेकिन कोई भी भुगतान के लिए लंबित नहीं है।`,
          ur: `${targetDriver.name} کے پاس ${driverFines.length} درج جرمانے ہیں، لیکن کوئی بھی ادائیگی کے لیے زیر التواء نہیں ہے۔`
        }[language];
      }
      
      let response = {
        en: `${targetDriver.name} has ${driverFines.length} fines on record, with ${pendingFines.length} pending payment:\n\n`,
        ar: `لدى ${targetDriver.name} ${driverFines.length} مخالفات مسجلة، مع ${pendingFines.length} معلقة الدفع:\n\n`,
        hi: `${targetDriver.name} के पास ${driverFines.length} दर्ज जुर्माने हैं, जिनमें से ${pendingFines.length} भुगतान के लिए लंबित हैं:\n\n`,
        ur: `${targetDriver.name} کے پاس ${driverFines.length} درج جرمانے ہیں، جن میں سے ${pendingFines.length} ادائیگی کے لیے زیر التواء ہیں:\n\n`
      }[language];
      
      pendingFines.forEach((fine, index) => {
        if (language === 'en') {
          response += `${index + 1}. ${fine.violation} - AED ${fine.amount} (${fine.date})\n`;
        } else if (language === 'ar') {
          response += `${index + 1}. ${fine.violation} - ${fine.amount} درهم (${fine.date})\n`;
        } else if (language === 'hi') {
          response += `${index + 1}. ${fine.violation} - AED ${fine.amount} (${fine.date})\n`;
        } else {
          response += `${index + 1}. ${fine.violation} - AED ${fine.amount} (${fine.date})\n`;
        }
      });
      
      return response;
    }
    
    // Default response for fine queries
    const pendingFines = mockFinesData.filter(f => f.status === 'pending');
    return {
      en: `There are ${pendingFines.length} pending fines in the system. You can ask about specific drivers or say "Show all pending fines" for details.`,
      ar: `هناك ${pendingFines.length} مخالفات معلقة في النظام. يمكنك السؤال عن سائقين محددين أو قول "أظهر جميع المخالفات المعلقة" للحصول على التفاصيل.`,
      hi: `सिस्टम में ${pendingFines.length} लंबित जुर्माने हैं। आप विशिष्ट ड्राइवरों के बारे में पूछ सकते हैं या विवरण के लिए "सभी लंबित जुर्माने दिखाएं" कह सकते हैं।`,
      ur: `سسٹم میں ${pendingFines.length} زیر التواء جرمانے ہیں۔ آپ مخصوص ڈرائیوروں کے بارے میں پوچھ سکتے ہیں یا تفصیلات کے لیے "تمام زیر التواء جرمانے دکھائیں" کہہ سکتے ہیں۔`
    }[language];
  };

  // Process performance-related queries
  const processPerformanceQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for general performance queries
    if (lowerQuery.includes('all') || lowerQuery.includes('overall') || lowerQuery.includes('average')) {
      const avgPerformance = mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length;
      const topPerformer = [...mockDriversData].sort((a, b) => b.performanceScore - a.performanceScore)[0];
      
      return {
        en: `The average performance score across all drivers is ${avgPerformance.toFixed(1)}%. ${topPerformer.name} has the highest score at ${topPerformer.performanceScore}%.`,
        ar: `متوسط درجة الأداء عبر جميع السائقين هو ${avgPerformance.toFixed(1)}%. ${topPerformer.name} لديه أعلى درجة بنسبة ${topPerformer.performanceScore}%.`,
        hi: `सभी ड्राइवरों का औसत प्रदर्शन स्कोर ${avgPerformance.toFixed(1)}% है। ${topPerformer.name} का सबसे अधिक स्कोर ${topPerformer.performanceScore}% है।`,
        ur: `تمام ڈرائیوروں کا اوسط کارکردگی اسکور ${avgPerformance.toFixed(1)}% ہے۔ ${topPerformer.name} کا سب سے زیادہ اسکور ${topPerformer.performanceScore}% ہے۔`
      }[language];
    }
    
    // Check for driver-specific performance queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'performance',
        lastQuery: query
      });
      
      let performanceRating;
      if (targetDriver.performanceScore >= 90) {
        performanceRating = {
          en: 'excellent',
          ar: 'ممتاز',
          hi: 'उत्कृष्ट',
          ur: 'بہترین'
        }[language];
      } else if (targetDriver.performanceScore >= 80) {
        performanceRating = {
          en: 'good',
          ar: 'جيد',
          hi: 'अच्छा',
          ur: 'اچھا'
        }[language];
      } else if (targetDriver.performanceScore >= 70) {
        performanceRating = {
          en: 'average',
          ar: 'متوسط',
          hi: 'औसत',
          ur: 'اوسط'
        }[language];
      } else {
        performanceRating = {
          en: 'needs improvement',
          ar: 'يحتاج إلى تحسين',
          hi: 'सुधार की आवश्यकता है',
          ur: 'بہتری کی ضرورت ہے'
        }[language];
      }
      
      return {
        en: `${targetDriver.name}'s current performance score is ${targetDriver.performanceScore}%, which is ${performanceRating}. This is based on ${targetDriver.trips} completed trips and $${targetDriver.earnings} in earnings.`,
        ar: `درجة أداء ${targetDriver.name} الحالية هي ${targetDriver.performanceScore}%، وهي ${performanceRating}. يستند هذا إلى ${targetDriver.trips} رحلة مكتملة و $${targetDriver.earnings} في الأرباح.`,
        hi: `${targetDriver.name} का वर्तमान प्रदर्शन स्कोर ${targetDriver.performanceScore}% है, जो ${performanceRating} है। यह ${targetDriver.trips} पूर्ण यात्राओं और $${targetDriver.earnings} की कमाई पर आधारित है।`,
        ur: `${targetDriver.name} کا موجودہ کارکردگی اسکور ${targetDriver.performanceScore}% ہے، جو ${performanceRating} ہے۔ یہ ${targetDriver.trips} مکمل سفر اور $${targetDriver.earnings} کی کمائی پر مبنی ہے۔`
      }[language];
    }
    
    // Default response for performance queries
    return {
      en: `The average performance score across all drivers is ${(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length).toFixed(1)}%. You can ask about specific drivers for more details.`,
      ar: `متوسط درجة الأداء عبر جميع السائقين هو ${(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length).toFixed(1)}%. يمكنك السؤال عن سائقين محددين لمزيد من التفاصيل.`,
      hi: `सभी ड्राइवरों का औसत प्रदर्शन स्कोर ${(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length).toFixed(1)}% है। अधिक जानकारी के लिए आप विशिष्ट ड्राइवरों के बारे में पूछ सकते हैं।`,
      ur: `تمام ڈرائیوروں کا اوسط کارکردگی اسکور ${(mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length).toFixed(1)}% ہے۔ مزید تفصیلات کے لیے آپ مخصوص ڈرائیوروں کے بارے میں پوچھ سکتے ہیں۔`
    }[language];
  };

  // Process contract-related queries
  const processContractQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for general contract queries
    if (lowerQuery.includes('all') || lowerQuery.includes('list')) {
      const activeContracts = mockContractsData.filter(c => c.status === 'active');
      
      let response = {
        en: `There are ${activeContracts.length} active contracts:\n\n`,
        ar: `هناك ${activeContracts.length} عقود نشطة:\n\n`,
        hi: `${activeContracts.length} सक्रिय अनुबंध हैं:\n\n`,
        ur: `${activeContracts.length} فعال کنٹریکٹس ہیں:\n\n`
      }[language];
      
      activeContracts.forEach((contract, index) => {
        const driverName = getDriverName(contract.driverId);
        const daysRemaining = getDaysRemaining(contract.endDate);
        
        if (language === 'en') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} days remaining\n`;
        } else if (language === 'ar') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} يوم متبقي\n`;
        } else if (language === 'hi') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} दिन शेष\n`;
        } else {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} دن باقی\n`;
        }
      });
      
      return response;
    }
    
    if (lowerQuery.includes('expir') || lowerQuery.includes('end')) {
      const expiringContracts = mockContractsData
        .filter(c => c.status === 'active' && getDaysRemaining(c.endDate) <= 30)
        .sort((a, b) => getDaysRemaining(a.endDate) - getDaysRemaining(b.endDate));
      
      if (expiringContracts.length === 0) {
        return {
          en: `No contracts are expiring in the next 30 days.`,
          ar: `لا توجد عقود تنتهي في الثلاثين يومًا القادمة.`,
          hi: `अगले 30 दिनों में कोई अनुबंध समाप्त नहीं हो रहा है।`,
          ur: `اگلے 30 دنوں میں کوئی کنٹریکٹ ختم نہیں ہو رہا ہے۔`
        }[language];
      }
      
      let response = {
        en: `${expiringContracts.length} contracts are expiring in the next 30 days:\n\n`,
        ar: `${expiringContracts.length} عقود تنتهي في الثلاثين يومًا القادمة:\n\n`,
        hi: `${expiringContracts.length} अनुबंध अगले 30 दिनों में समाप्त हो रहे हैं:\n\n`,
        ur: `${expiringContracts.length} کنٹریکٹس اگلے 30 دنوں میں ختم ہو رہے ہیں:\n\n`
      }[language];
      
      expiringContracts.forEach((contract, index) => {
        const driverName = getDriverName(contract.driverId);
        const daysRemaining = getDaysRemaining(contract.endDate);
        
        if (language === 'en') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} days remaining (${contract.endDate})\n`;
        } else if (language === 'ar') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} يوم متبقي (${contract.endDate})\n`;
        } else if (language === 'hi') {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} दिन शेष (${contract.endDate})\n`;
        } else {
          response += `${index + 1}. ${driverName} (${contract.vehicleId}): ${daysRemaining} دن باقی (${contract.endDate})\n`;
        }
      });
      
      return response;
    }
    
    // Check for driver-specific contract queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'contracts',
        lastQuery: query
      });
      
      const driverContract = mockContractsData.find(c => c.driverId === targetDriver!.id && c.status === 'active');
      
      if (!driverContract) {
        return {
          en: `${targetDriver.name} does not have an active contract.`,
          ar: `ليس لدى ${targetDriver.name} عقد نشط.`,
          hi: `${targetDriver.name} का कोई सक्रिय अनुबंध नहीं है।`,
          ur: `${targetDriver.name} کا کوئی فعال کنٹریکٹ نہیں ہے۔`
        }[language];
      }
      
      const daysRemaining = getDaysRemaining(driverContract.endDate);
      
      return {
        en: `${targetDriver.name}'s contract (${driverContract.id}) expires in ${daysRemaining} days on ${driverContract.endDate}. Monthly rent: AED ${driverContract.monthlyRent}, Vehicle: ${driverContract.vehicleId}.`,
        ar: `ينتهي عقد ${targetDriver.name} (${driverContract.id}) في غضون ${daysRemaining} يومًا في ${driverContract.endDate}. الإيجار الشهري: ${driverContract.monthlyRent} درهم، المركبة: ${driverContract.vehicleId}.`,
        hi: `${targetDriver.name} का अनुबंध (${driverContract.id}) ${daysRemaining} दिनों में ${driverContract.endDate} को समाप्त होता है। मासिक किराया: AED ${driverContract.monthlyRent}, वाहन: ${driverContract.vehicleId}।`,
        ur: `${targetDriver.name} کا کنٹریکٹ (${driverContract.id}) ${daysRemaining} دنوں میں ${driverContract.endDate} کو ختم ہوتا ہے۔ ماہانہ کرایہ: AED ${driverContract.monthlyRent}، گاڑی: ${driverContract.vehicleId}۔`
      }[language];
    }
    
    // Default response for contract queries
    return {
      en: `There are ${mockContractsData.filter(c => c.status === 'active').length} active contracts in the system. You can ask about specific drivers or say "Show all contracts" for details.`,
      ar: `هناك ${mockContractsData.filter(c => c.status === 'active').length} عقود نشطة في النظام. يمكنك السؤال عن سائقين محددين أو قول "أظهر جميع العقود" للحصول على التفاصيل.`,
      hi: `सिस्टम में ${mockContractsData.filter(c => c.status === 'active').length} सक्रिय अनुबंध हैं। आप विशिष्ट ड्राइवरों के बारे में पूछ सकते हैं या विवरण के लिए "सभी अनुबंध दिखाएं" कह सकते हैं।`,
      ur: `سسٹم میں ${mockContractsData.filter(c => c.status === 'active').length} فعال کنٹریکٹس ہیں۔ آپ مخصوص ڈرائیوروں کے بارے میں پوچھ سکتے ہیں یا تفصیلات کے لیے "تمام کنٹریکٹس دکھائیں" کہہ سکتے ہیں۔`
    }[language];
  };

  // Process driver-related queries
  const processDriverQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for general driver queries
    if (lowerQuery.includes('all') || lowerQuery.includes('list')) {
      const activeDrivers = mockDriversData.filter(d => d.status === 'active');
      
      let response = {
        en: `There are ${activeDrivers.length} active drivers:\n\n`,
        ar: `هناك ${activeDrivers.length} سائقين نشطين:\n\n`,
        hi: `${activeDrivers.length} सक्रिय ड्राइवर हैं:\n\n`,
        ur: `${activeDrivers.length} فعال ڈرائیورز ہیں:\n\n`
      }[language];
      
      activeDrivers.forEach((driver, index) => {
        if (language === 'en') {
          response += `${index + 1}. ${driver.name} (${driver.vehicleId || 'No vehicle'}) - ${driver.performanceScore}% performance\n`;
        } else if (language === 'ar') {
          response += `${index + 1}. ${driver.name} (${driver.vehicleId || 'لا توجد مركبة'}) - ${driver.performanceScore}% أداء\n`;
        } else if (language === 'hi') {
          response += `${index + 1}. ${driver.name} (${driver.vehicleId || 'कोई वाहन नहीं'}) - ${driver.performanceScore}% प्रदर्शन\n`;
        } else {
          response += `${index + 1}. ${driver.name} (${driver.vehicleId || 'کوئی گاڑی نہیں'}) - ${driver.performanceScore}% کارکردگی\n`;
        }
      });
      
      return response;
    }
    
    if (lowerQuery.includes('active') || lowerQuery.includes('on duty')) {
      const activeDrivers = mockDriversData.filter(d => d.status === 'active');
      
      return {
        en: `There are ${activeDrivers.length} active drivers out of ${mockDriversData.length} total drivers.`,
        ar: `هناك ${activeDrivers.length} سائقين نشطين من أصل ${mockDriversData.length} سائق إجمالي.`,
        hi: `कुल ${mockDriversData.length} ड्राइवरों में से ${activeDrivers.length} सक्रिय ड्राइवर हैं।`,
        ur: `کل ${mockDriversData.length} ڈرائیوروں میں سے ${activeDrivers.length} فعال ڈرائیورز ہیں۔`
      }[language];
    }
    
    if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
      const sortedDrivers = [...mockDriversData].sort((a, b) => b.performanceScore - a.performanceScore);
      const topDriver = sortedDrivers[0];
      
      return {
        en: `${topDriver.name} is the top performing driver with a performance score of ${topDriver.performanceScore}%.`,
        ar: `${topDriver.name} هو السائق الأفضل أداءً بدرجة أداء ${topDriver.performanceScore}%.`,
        hi: `${topDriver.name} ${topDriver.performanceScore}% के प्रदर्शन स्कोर के साथ सर्वश्रेष्ठ प्रदर्शन करने वाला ड्राइवर है।`,
        ur: `${topDriver.name} ${topDriver.performanceScore}% کے کارکردگی اسکور کے ساتھ سب سے بہتر کارکردگی والا ڈرائیور ہے۔`
      }[language];
    }
    
    // Check for specific driver queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'driver',
        lastQuery: query
      });
      
      return {
        en: `${targetDriver.name} is a ${targetDriver.status} driver with ${targetDriver.trips} total trips and a performance score of ${targetDriver.performanceScore}%. Vehicle: ${targetDriver.vehicleId || 'None assigned'}.`,
        ar: `${targetDriver.name} هو سائق ${targetDriver.status === 'active' ? 'نشط' : 'غير نشط'} مع ${targetDriver.trips} رحلة إجمالية ودرجة أداء ${targetDriver.performanceScore}%. المركبة: ${targetDriver.vehicleId || 'لم يتم تعيين'}.`,
        hi: `${targetDriver.name} ${targetDriver.status === 'active' ? 'सक्रिय' : 'निष्क्रिय'} ड्राइवर है जिसने कुल ${targetDriver.trips} यात्राएं की हैं और प्रदर्शन स्कोर ${targetDriver.performanceScore}% है। वाहन: ${targetDriver.vehicleId || 'कोई असाइन नहीं'}।`,
        ur: `${targetDriver.name} ${targetDriver.status === 'active' ? 'فعال' : 'غیر فعال'} ڈرائیور ہے جس نے کل ${targetDriver.trips} سفر کیے ہیں اور کارکردگی اسکور ${targetDriver.performanceScore}% ہے۔ گاڑی: ${targetDriver.vehicleId || 'کوئی تفویض نہیں'}۔`
      }[language];
    }
    
    // Default response for driver queries
    return {
      en: `There are ${mockDriversData.length} drivers in the system, with ${mockDriversData.filter(d => d.status === 'active').length} currently active. You can ask about specific drivers by name.`,
      ar: `هناك ${mockDriversData.length} سائق في النظام، مع ${mockDriversData.filter(d => d.status === 'active').length} نشط حاليًا. يمكنك السؤال عن سائقين محددين بالاسم.`,
      hi: `सिस्टम में ${mockDriversData.length} ड्राइवर हैं, जिनमें से ${mockDriversData.filter(d => d.status === 'active').length} वर्तमान में सक्रिय हैं। आप नाम से विशिष्ट ड्राइवरों के बारे में पूछ सकते हैं।`,
      ur: `سسٹم میں ${mockDriversData.length} ڈرائیورز ہیں، جن میں سے ${mockDriversData.filter(d => d.status === 'active').length} فی الحال فعال ہیں۔ آپ نام سے مخصوص ڈرائیوروں کے بارے میں پوچھ سکتے ہیں۔`
    }[language];
  };

  // Process vehicle-related queries
  const processVehicleQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for general vehicle queries
    if (lowerQuery.includes('all') || lowerQuery.includes('list')) {
      const assignedVehicles = mockDriversData.filter(d => d.vehicleId).length;
      
      return {
        en: `There are ${assignedVehicles} vehicles currently assigned to drivers.`,
        ar: `هناك ${assignedVehicles} مركبة مخصصة حاليًا للسائقين.`,
        hi: `वर्तमान में ${assignedVehicles} वाहन ड्राइवरों को असाइन किए गए हैं।`,
        ur: `فی الحال ${assignedVehicles} گاڑیاں ڈرائیوروں کو تفویض کی گئی ہیں۔`
      }[language];
    }
    
    // Check for driver-specific vehicle queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'vehicle',
        lastQuery: query
      });
      
      if (!targetDriver.vehicleId) {
        return {
          en: `${targetDriver.name} does not have a vehicle assigned.`,
          ar: `${targetDriver.name} ليس لديه مركبة مخصصة.`,
          hi: `${targetDriver.name} को कोई वाहन असाइन नहीं किया गया है।`,
          ur: `${targetDriver.name} کو کوئی گاڑی تفویض نہیں کی گئی ہے۔`
        }[language];
      }
      
      return {
        en: `${targetDriver.name} is assigned to vehicle ${targetDriver.vehicleId}.`,
        ar: `${targetDriver.name} مخصص للمركبة ${targetDriver.vehicleId}.`,
        hi: `${targetDriver.name} को वाहन ${targetDriver.vehicleId} असाइन किया गया है।`,
        ur: `${targetDriver.name} کو گاڑی ${targetDriver.vehicleId} تفویض کی گئی ہے۔`
      }[language];
    }
    
    // Check for specific vehicle queries
    const vehicleId = query.match(/DXB-[A-Z]-\d+/i)?.[0];
    if (vehicleId) {
      const driver = mockDriversData.find(d => d.vehicleId === vehicleId);
      
      if (!driver) {
        return {
          en: `Vehicle ${vehicleId} is not assigned to any driver.`,
          ar: `المركبة ${vehicleId} غير مخصصة لأي سائق.`,
          hi: `वाहन ${vehicleId} किसी भी ड्राइवर को असाइन नहीं किया गया है।`,
          ur: `گاڑی ${vehicleId} کسی بھی ڈرائیور کو تفویض نہیں کی گئی ہے۔`
        }[language];
      }
      
      return {
        en: `Vehicle ${vehicleId} is assigned to ${driver.name}.`,
        ar: `المركبة ${vehicleId} مخصصة لـ ${driver.name}.`,
        hi: `वाहन ${vehicleId} ${driver.name} को असाइन किया गया है।`,
        ur: `گاڑی ${vehicleId} ${driver.name} کو تفویض کی گئی ہے۔`
      }[language];
    }
    
    // Default response for vehicle queries
    return {
      en: `There are ${mockDriversData.filter(d => d.vehicleId).length} vehicles currently assigned to drivers. You can ask about specific drivers or vehicles.`,
      ar: `هناك ${mockDriversData.filter(d => d.vehicleId).length} مركبة مخصصة حاليًا للسائقين. يمكنك السؤال عن سائقين أو مركبات محددة.`,
      hi: `वर्तमान में ${mockDriversData.filter(d => d.vehicleId).length} वाहन ड्राइवरों को असाइन किए गए हैं। आप विशिष्ट ड्राइवरों या वाहनों के बारे में पूछ सकते हैं।`,
      ur: `فی الحال ${mockDriversData.filter(d => d.vehicleId).length} گاڑیاں ڈرائیوروں کو تفویض کی گئی ہیں۔ آپ مخصوص ڈرائیوروں یا گاڑیوں کے بارے میں پوچھ سکتے ہیں۔`
    }[language];
  };

  // Process location-related queries
  const processLocationQuery = (query: string, driverId?: number) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for driver-specific location queries
    let targetDriver = driverId 
      ? mockDriversData.find(d => d.id === driverId)
      : null;
    
    // Try to extract driver name from query
    if (!targetDriver) {
      for (const driver of mockDriversData) {
        if (lowerQuery.includes(driver.name.toLowerCase())) {
          targetDriver = driver;
          break;
        }
      }
    }
    
    if (targetDriver) {
      // Set context for follow-up questions
      setConversationContext({
        currentDriver: targetDriver.id,
        topic: 'location',
        lastQuery: query
      });
      
      // Simulate location names based on coordinates
      const locations = [
        'Dubai Marina', 'Downtown Dubai', 'Deira', 'Jumeirah', 'Business Bay',
        'Al Quoz', 'Dubai Silicon Oasis', 'JBR', 'Palm Jumeirah', 'Dubai Hills'
      ];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      
      return {
        en: `${targetDriver.name} is currently located in ${randomLocation}. Last updated: ${new Date().toLocaleTimeString()}.`,
        ar: `${targetDriver.name} موجود حاليًا في ${randomLocation}. آخر تحديث: ${new Date().toLocaleTimeString()}.`,
        hi: `${targetDriver.name} वर्तमान में ${randomLocation} में स्थित है। अंतिम अपडेट: ${new Date().toLocaleTimeString()}।`,
        ur: `${targetDriver.name} فی الحال ${randomLocation} میں واقع ہے۔ آخری اپڈیٹ: ${new Date().toLocaleTimeString()}۔`
      }[language];
    }
    
    // Default response for location queries
    return {
      en: `You can check the location of any driver by asking "Where is [driver name]?" or view all drivers on the map in the Dashboard.`,
      ar: `يمكنك التحقق من موقع أي سائق عن طريق السؤال "أين [اسم السائق]؟" أو عرض جميع السائقين على الخريطة في لوحة التحكم.`,
      hi: `आप "[ड्राइवर का नाम] कहां है?" पूछकर किसी भी ड्राइवर का स्थान देख सकते हैं या डैशबोर्ड में मानचित्र पर सभी ड्राइवरों को देख सकते हैं।`,
      ur: `آپ "[ڈرائیور کا نام] کہاں ہے؟" پوچھ کر کسی بھی ڈرائیور کا مقام چیک کر سکتے ہیں یا ڈیش بورڈ میں نقشے پر تمام ڈرائیوروں کو دیکھ سکتے ہیں۔`
    }[language];
  };

  // Process bulk import queries
  const processBulkImportQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('import') || lowerQuery.includes('bulk') || lowerQuery.includes('csv') || lowerQuery.includes('excel')) {
      return {
        en: `To import drivers in bulk, you can use the "Bulk Import" feature in the Drivers section. You can upload a CSV or Excel file, or paste data directly. The file should include columns for Name, Email, Phone, and optionally Vehicle ID and Join Date.`,
        ar: `لاستيراد السائقين بالجملة، يمكنك استخدام ميزة "استيراد بالجملة" في قسم السائقين. يمكنك تحميل ملف CSV أو Excel، أو لصق البيانات مباشرة. يجب أن يتضمن الملف أعمدة للاسم والبريد الإلكتروني والهاتف، واختياريًا معرف المركبة وتاريخ الانضمام.`,
        hi: `ड्राइवरों को बल्क में आयात करने के लिए, आप ड्राइवर्स सेक्शन में "बल्क इम्पोर्ट" फीचर का उपयोग कर सकते हैं। आप CSV या Excel फ़ाइल अपलोड कर सकते हैं, या डेटा सीधे पेस्ट कर सकते हैं। फ़ाइल में नाम, ईमेल, फोन के लिए कॉलम होने चाहिए, और वैकल्पिक रूप से वाहन आईडी और शामिल होने की तिथि।`,
        ur: `ڈرائیوروں کو بلک میں درآمد کرنے کے لیے، آپ ڈرائیورز سیکشن میں "بلک امپورٹ" فیچر استعمال کر سکتے ہیں۔ آپ CSV یا Excel فائل اپلوڈ کر سکتے ہیں، یا ڈیٹا براہ راست پیسٹ کر سکتے ہیں۔ فائل میں نام، ای میل، فون کے لیے کالمز شامل ہونے چاہئیں، اور اختیاری طور پر گاڑی ID اور شمولیت کی تاریخ۔`
      }[language];
    }
    
    return null;
  };

  // Process follow-up questions based on context
  const processFollowUpQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // If we have a current driver in context
    if (conversationContext.currentDriver) {
      const driver = mockDriversData.find(d => d.id === conversationContext.currentDriver);
      
      if (!driver) return null;
      
      // Check for simple follow-up questions
      if (lowerQuery.includes('how many') || lowerQuery.includes('trips')) {
        return processTripQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('earn') || lowerQuery.includes('money') || lowerQuery.includes('revenue')) {
        return processEarningsQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('fine') || lowerQuery.includes('penalty')) {
        return processFineQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('performance') || lowerQuery.includes('score') || lowerQuery.includes('rating')) {
        return processPerformanceQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('contract') || lowerQuery.includes('expir') || lowerQuery.includes('end')) {
        return processContractQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('where') || lowerQuery.includes('location')) {
        return processLocationQuery(query, driver.id);
      }
      
      if (lowerQuery.includes('vehicle') || lowerQuery.includes('car')) {
        return processVehicleQuery(query, driver.id);
      }
      
      // Generic follow-up about the driver
      return processDriverQuery(query, driver.id);
    }
    
    // If we have a topic in context
    if (conversationContext.topic) {
      switch (conversationContext.topic) {
        case 'trips':
          return processTripQuery(query);
        case 'earnings':
          return processEarningsQuery(query);
        case 'fines':
          return processFineQuery(query);
        case 'performance':
          return processPerformanceQuery(query);
        case 'contracts':
          return processContractQuery(query);
        case 'location':
          return processLocationQuery(query);
        case 'vehicle':
          return processVehicleQuery(query);
        case 'driver':
          return processDriverQuery(query);
        default:
          return null;
      }
    }
    
    return null;
  };

  // Process bulk driver data import
  const processBulkDriverImport = (input: string) => {
    try {
      // Check if this is a bulk import command
      if (!input.toLowerCase().includes('import drivers')) {
        return null;
      }
      
      // Extract the data part (after "import drivers")
      const dataText = input.substring(input.toLowerCase().indexOf('import drivers') + 'import drivers'.length).trim();
      
      if (!dataText) {
        return {
          en: `To import drivers, please provide the data in CSV format or tab-separated values. For example:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          ar: `لاستيراد السائقين، يرجى تقديم البيانات بتنسيق CSV أو قيم مفصولة بعلامات تبويب. على سبيل المثال:\n\nالاسم، البريد الإلكتروني، الهاتف، معرف المركبة\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          hi: `ड्राइवरों को आयात करने के लिए, कृपया डेटा CSV प्रारूप या टैब-अलग मूल्यों में प्रदान करें। उदाहरण के लिए:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          ur: `ڈرائیوروں کو درآمد کرنے کے لیے، براہ کرم ڈیٹا CSV فارمیٹ یا ٹیب سے الگ کردہ اقدار میں فراہم کریں۔ مثال کے طور پر:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`
        }[language];
      }
      
      // Split by lines
      const lines = dataText.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        return {
          en: `Please provide at least a header row and one data row. For example:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          ar: `يرجى تقديم صف عنوان وصف بيانات واحد على الأقل. على سبيل المثال:\n\nالاسم، البريد الإلكتروني، الهاتف، معرف المركبة\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          hi: `कृपया कम से कम एक हेडर पंक्ति और एक डेटा पंक्ति प्रदान करें। उदाहरण के लिए:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`,
          ur: `براہ کرم کم از کم ایک ہیڈر قطار اور ایک ڈیٹا قطار فراہم کریں۔ مثال کے طور پر:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-G-12345`
        }[language];
      }
      
      // Detect delimiter (comma or tab)
      const delimiter = lines[0].includes('\t') ? '\t' : ',';
      
      // Parse header
      const headers = lines[0].split(delimiter).map(h => h.trim());
      
      // Parse data rows
      const drivers = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim());
        const driver: any = {};
        
        headers.forEach((header, index) => {
          if (index < values.length) {
            driver[header] = values[index];
          }
        });
        
        drivers.push(driver);
      }
      
      // Validate required fields
      const missingFields = [];
      for (const driver of drivers) {
        if (!driver.Name && !driver.name) missingFields.push('Name');
        if (!driver.Email && !driver.email) missingFields.push('Email');
        if (!driver.Phone && !driver.phone) missingFields.push('Phone');
      }
      
      if (missingFields.length > 0) {
        return {
          en: `Some required fields are missing: ${missingFields.join(', ')}. Please ensure all drivers have Name, Email, and Phone.`,
          ar: `بعض الحقول المطلوبة مفقودة: ${missingFields.join(', ')}. يرجى التأكد من أن جميع السائقين لديهم اسم وبريد إلكتروني وهاتف.`,
          hi: `कुछ आवश्यक फ़ील्ड गायब हैं: ${missingFields.join(', ')}। कृपया सुनिश्चित करें कि सभी ड्राइवरों के पास नाम, ईमेल और फोन हैं।`,
          ur: `کچھ ضروری فیلڈز غائب ہیں: ${missingFields.join(', ')}۔ براہ کرم یقینی بنائیں کہ تمام ڈرائیوروں کے پاس نام، ای میل، اور فون ہیں۔`
        }[language];
      }
      
      // Success response
      return {
        en: `✅ Successfully parsed ${drivers.length} drivers from your data. You can now import them using the "Bulk Import" button in the Drivers section.\n\nPreview of first driver:\nName: ${drivers[0].Name || drivers[0].name}\nEmail: ${drivers[0].Email || drivers[0].email}\nPhone: ${drivers[0].Phone || drivers[0].phone}`,
        ar: `✅ تم تحليل ${drivers.length} سائق من بياناتك بنجاح. يمكنك الآن استيرادهم باستخدام زر "استيراد بالجملة" في قسم السائقين.\n\nمعاينة أول سائق:\nالاسم: ${drivers[0].Name || drivers[0].name}\nالبريد الإلكتروني: ${drivers[0].Email || drivers[0].email}\nالهاتف: ${drivers[0].Phone || drivers[0].phone}`,
        hi: `✅ आपके डेटा से ${drivers.length} ड्राइवरों को सफलतापूर्वक पार्स किया गया। अब आप ड्राइवर्स सेक्शन में "बल्क इम्पोर्ट" बटन का उपयोग करके उन्हें आयात कर सकते हैं।\n\nपहले ड्राइवर का प्रीव्यू:\nनाम: ${drivers[0].Name || drivers[0].name}\nईमेल: ${drivers[0].Email || drivers[0].email}\nफोन: ${drivers[0].Phone || drivers[0].phone}`,
        ur: `✅ آپ کے ڈیٹا سے ${drivers.length} ڈرائیوروں کو کامیابی سے پارس کیا گیا۔ اب آپ ڈرائیورز سیکشن میں "بلک امپورٹ" بٹن استعمال کرکے انہیں درآمد کر سکتے ہیں۔\n\nپہلے ڈرائیور کا پیش نظارہ:\nنام: ${drivers[0].Name || drivers[0].name}\nای میل: ${drivers[0].Email || drivers[0].email}\nفون: ${drivers[0].Phone || drivers[0].phone}`
      }[language];
    } catch (error) {
      return {
        en: `There was an error processing your import data. Please check the format and try again.`,
        ar: `حدث خطأ في معالجة بيانات الاستيراد الخاصة بك. يرجى التحقق من التنسيق والمحاولة مرة أخرى.`,
        hi: `आपके आयात डेटा को संसाधित करने में एक त्रुटि हुई। कृपया प्रारूप की जांच करें और पुनः प्रयास करें।`,
        ur: `آپ کے درآمد ڈیٹا کو پروسیس کرنے میں ایک خرابی ہوئی۔ براہ کرم فارمیٹ چیک کریں اور دوبارہ کوشش کریں۔`
      }[language];
    }
  };

  // Enhanced AI response logic with multilingual support
  const generateResponse = (input: string): string => {
    // Check for bulk import command first
    const bulkImportResponse = processBulkDriverImport(input);
    if (bulkImportResponse) return bulkImportResponse;
    
    const lowerInput = input.toLowerCase();
    
    // Check for follow-up questions based on context
    const followUpResponse = processFollowUpQuery(input);
    if (followUpResponse) return followUpResponse;
    
    // Process trip-related queries
    if (lowerInput.includes('trip') || 
        lowerInput.includes('journey') || 
        lowerInput.includes('ride') || 
        lowerInput.includes('how many') ||
        lowerInput.includes('complete')) {
      return processTripQuery(input);
    }
    
    // Process earnings-related queries
    if (lowerInput.includes('earn') || 
        lowerInput.includes('money') || 
        lowerInput.includes('revenue') || 
        lowerInput.includes('income') ||
        lowerInput.includes('profit')) {
      return processEarningsQuery(input);
    }
    
    // Process fine-related queries
    if (lowerInput.includes('fine') || 
        lowerInput.includes('penalty') || 
        lowerInput.includes('ticket') || 
        lowerInput.includes('violation')) {
      return processFineQuery(input);
    }
    
    // Process performance-related queries
    if (lowerInput.includes('performance') || 
        lowerInput.includes('score') || 
        lowerInput.includes('rating') || 
        lowerInput.includes('evaluation')) {
      return processPerformanceQuery(input);
    }
    
    // Process contract-related queries
    if (lowerInput.includes('contract') || 
        lowerInput.includes('agreement') || 
        lowerInput.includes('expir') || 
        lowerInput.includes('rental')) {
      return processContractQuery(input);
    }
    
    // Process location-related queries
    if (lowerInput.includes('where') || 
        lowerInput.includes('location') || 
        lowerInput.includes('position') || 
        lowerInput.includes('track')) {
      return processLocationQuery(input);
    }
    
    // Process vehicle-related queries
    if (lowerInput.includes('vehicle') || 
        lowerInput.includes('car') || 
        lowerInput.includes('taxi') || 
        lowerInput.includes('assign')) {
      return processVehicleQuery(input);
    }
    
    // Process driver-related queries
    if (lowerInput.includes('driver') || 
        lowerInput.includes('who') || 
        lowerInput.includes('person') || 
        lowerInput.includes('employee')) {
      return processDriverQuery(input);
    }
    
    // Process bulk import queries
    const bulkImportQueryResponse = processBulkImportQuery(input);
    if (bulkImportQueryResponse) return bulkImportQueryResponse;
    
    // Try to identify a driver name in the query
    for (const driver of mockDriversData) {
      if (lowerInput.includes(driver.name.toLowerCase())) {
        return processDriverQuery(input, driver.id);
      }
    }
    
    // Default response for unrecognized queries with multilingual support
    const defaultResponses = {
      en: `I'm here to help with your fleet management questions. You can ask me about:\n\n• Driver information and performance\n• Trip details and statistics\n• Earnings and revenue\n• Fines and penalties\n• Contracts and agreements\n• Vehicle assignments\n• Driver locations\n\nFor example, try asking "How many trips did Ahmed complete today?" or "Show me drivers with pending fines."`,
      ar: `أنا هنا للمساعدة في أسئلة إدارة الأسطول. يمكنك أن تسألني عن:\n\n• معلومات وأداء السائق\n• تفاصيل وإحصاءات الرحلة\n• الأرباح والإيرادات\n• الغرامات والعقوبات\n• العقود والاتفاقيات\n• تخصيصات المركبات\n• مواقع السائقين\n\nعلى سبيل المثال، جرب أن تسأل "كم عدد الرحلات التي أكملها أحمد اليوم؟" أو "أظهر لي السائقين الذين لديهم غرامات معلقة."`,
      hi: `मैं आपके फ्लीट प्रबंधन प्रश्नों में मदद करने के लिए यहां हूं। आप मुझसे इन बारे में पूछ सकते हैं:\n\n• ड्राइवर जानकारी और प्रदर्शन\n• यात्रा विवरण और आंकड़े\n• कमाई और राजस्व\n• जुर्माने और दंड\n• अनुबंध और समझौते\n• वाहन असाइनमेंट\n• ड्राइवर स्थान\n\nउदाहरण के लिए, "अहमद ने आज कितनी यात्राएं पूरी कीं?" या "मुझे लंबित जुर्माने वाले ड्राइवर दिखाएं।" पूछने का प्रयास करें।`,
      ur: `میں آپ کے فلیٹ منیجمنٹ سوالات میں مدد کرنے کے لیے یہاں ہوں۔ آپ مجھ سے ان کے بارے میں پوچھ سکتے ہیں:\n\n• ڈرائیور کی معلومات اور کارکردگی\n• سفر کی تفصیلات اور اعداد و شمار\n• کمائی اور آمدنی\n• جرمانے اور سزائیں\n• کنٹریکٹس اور معاہدے\n• گاڑی کی تفویض\n• ڈرائیور کے مقامات\n\nمثال کے طور پر، "احمد نے آج کتنے سفر مکمل کیے؟" یا "مجھے زیر التواء جرمانے والے ڈرائیورز دکھائیں۔" پوچھنے کی کوشش کریں۔`
    };

    return defaultResponses[language];
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
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(currentInput);
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
                className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === 'ar' || language === 'ur' ? 'text-right' : 'text-left'
                }`}
                dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}
              />
              <button
                onClick={toggleListening}
                className={`absolute ${language === 'ar' || language === 'ur' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
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