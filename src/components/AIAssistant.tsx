import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Brain, Zap, Users, AlertTriangle, FileText, Car, Navigation, DollarSign, TrendingUp, Calendar, MapPin, Phone, Mail, Settings, BarChart3, Database } from 'lucide-react';
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
    currentTopic?: string;
    timeframe?: 'today' | 'week' | 'month' | 'year';
    isComparative?: boolean;
    lastMentionedDrivers?: number[];
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
      welcomeMessage: `👋 **Welcome to NavEdge AI!**\n\nI'm your intelligent fleet management assistant. I can help you with:\n\n🚗 **Driver Management**\n• Check driver performance\n• View driver locations\n• Manage driver assignments\n\n📋 **Contract & Fine Management**\n• Review contract details\n• Track fine payments\n• Monitor compliance\n\n📊 **Analytics & Reports**\n• Performance insights\n• Revenue analysis\n• Fleet utilization\n\n💡 **Try asking:**\n• "Show me active drivers"\n• "Who has pending fines?"\n• "What's my fleet performance?"\n• "Make a contract"\n• "Show me contracts"`
    },
    ar: {
      title: 'مساعد نافيدج الذكي',
      subtitle: 'رفيقك الذكي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن أسطولك...',
      send: 'إرسال',
      listening: 'أستمع...',
      typing: 'نافيدج يكتب...',
      welcomeMessage: `👋 **مرحباً بك في نافيدج الذكي!**\n\nأنا مساعدك الذكي لإدارة الأسطول. يمكنني مساعدتك في:\n\n🚗 **إدارة السائقين**\n• فحص أداء السائقين\n• عرض مواقع السائقين\n• إدارة تعيينات السائقين\n\n📋 **إدارة العقود والمخالفات**\n• مراجعة تفاصيل العقود\n• تتبع دفع المخالفات\n• مراقبة الامتثال\n\n📊 **التحليلات والتقارير**\n• رؤى الأداء\n• تحليل الإيرادات\n• استخدام الأسطول\n\n💡 **جرب السؤال:**\n• "أظهر لي السائقين النشطين"\n• "من لديه مخالفات معلقة؟"\n• "ما هو أداء أسطولي؟"\n• "إنشاء عقد"\n• "أظهر لي العقود"`
    },
    hi: {
      title: 'नेवएज AI असिस्टेंट',
      subtitle: 'आपका बुद्धिमान फ्लीट प्रबंधन साथी',
      placeholder: 'अपने फ्लीट के बारे में कुछ भी पूछें...',
      send: 'भेजें',
      listening: 'सुन रहा हूं...',
      typing: 'नेवएज टाइप कर रहा है...',
      welcomeMessage: `👋 **नेवएज AI में आपका स्वागत है!**\n\nमैं आपका बुद्धिमान फ्लीट प्रबंधन सहायक हूं। मैं आपकी मदद कर सकता हूं:\n\n🚗 **ड्राइवर प्रबंधन**\n• ड्राइवर प्रदर्शन जांचें\n• ड्राइवर स्थान देखें\n• ड्राइवर असाइनमेंट प्रबंधित करें\n\n📋 **अनुबंध और जुर्माना प्रबंधन**\n• अनुबंध विवरण समीक्षा करें\n• जुर्माना भुगतान ट्रैक करें\n• अनुपालन की निगरानी करें\n\n📊 **एनालिटिक्स और रिपोर्ट**\n• प्रदर्शन अंतर्दृष्टि\n• राजस्व विश्लेषण\n• फ्लीट उपयोग\n\n💡 **पूछने की कोशिश करें:**\n• "मुझे सक्रिय ड्राइवर दिखाएं"\n• "किसके पास लंबित जुर्माना है?"\n• "मेरे फ्लीट का प्रदर्शन क्या है?"\n• "एक अनुबंध बनाएं"\n• "मुझे अनुबंध दिखाएं"`
    },
    ur: {
      title: 'نیو ایج AI اسسٹنٹ',
      subtitle: 'آپ کا ذہین فلیٹ منیجمنٹ ساتھی',
      placeholder: 'اپنے فلیٹ کے بارے میں کچھ بھی پوچھیں...',
      send: 'بھیجیں',
      listening: 'سن رہا ہوں...',
      typing: 'نیو ایج ٹائپ کر رہا ہے...',
      welcomeMessage: `👋 **نیو ایج AI میں خوش آمدید!**\n\nمیں آپ کا ذہین فلیٹ منیجمنٹ اسسٹنٹ ہوں۔ میں آپ کی مدد کر سکتا ہوں:\n\n🚗 **ڈرائیور منیجمنٹ**\n• ڈرائیور کی کارکردگی چیک کریں\n• ڈرائیور کے مقامات دیکھیں\n• ڈرائیور اسائنمنٹس منظم کریں\n\n📋 **کنٹریکٹ اور جرمانہ منیجمنٹ**\n• کنٹریکٹ کی تفصیلات کا جائزہ لیں\n• جرمانے کی ادائیگی ٹریک کریں\n• تعمیل کی نگرانی کریں\n\n📊 **تجزیات اور رپورٹس**\n• کارکردگی کی بصیرت\n• آمدنی کا تجزیہ\n• فلیٹ کا استعمال\n\n💡 **پوچھنے کی کوشش کریں:**\n• "مجھے فعال ڈرائیورز دکھائیں"\n• "کس کے پاس زیر التواء جرمانے ہیں؟"\n• "میرے فلیٹ کی کارکردگی کیا ہے؟"\n• "ایک کنٹریکٹ بنائیں"\n• "مجھے کنٹریکٹس دکھائیں"`
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

  // Calculate days remaining for contracts
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const timeDiff = end.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining;
  };

  // Extract driver name from input
  const extractDriverName = (input: string): number | null => {
    // Check for specific driver mentions
    for (const driver of mockDriversData) {
      if (input.toLowerCase().includes(driver.name.toLowerCase())) {
        return driver.id;
      }
    }
    return null;
  };

  // Extract timeframe from input
  const extractTimeframe = (input: string): 'today' | 'week' | 'month' | 'year' | undefined => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('today') || lowerInput.includes('اليوم') || lowerInput.includes('आज') || lowerInput.includes('آج')) {
      return 'today';
    } else if (lowerInput.includes('week') || lowerInput.includes('أسبوع') || lowerInput.includes('सप्ताह') || lowerInput.includes('ہفتہ')) {
      return 'week';
    } else if (lowerInput.includes('month') || lowerInput.includes('شهر') || lowerInput.includes('महीना') || lowerInput.includes('مہینہ')) {
      return 'month';
    } else if (lowerInput.includes('year') || lowerInput.includes('سنة') || lowerInput.includes('वर्ष') || lowerInput.includes('سال')) {
      return 'year';
    }
    return undefined;
  };

  // Check if query is comparative (who has the most/least, etc.)
  const isComparativeQuery = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const comparativePatterns = [
      'who has the most', 'who has the least', 'who made the most', 'who made the least',
      'which driver has', 'which driver earned', 'top driver', 'best driver', 'worst driver',
      'highest earning', 'lowest earning', 'most trips', 'fewest trips', 'best performance',
      'worst performance', 'compare', 'ranking', 'leaderboard',
      // Arabic patterns
      'من لديه أكثر', 'من لديه أقل', 'من حقق أكثر', 'من حقق أقل', 'أي سائق لديه',
      // Hindi patterns
      'किसके पास सबसे अधिक', 'किसके पास सबसे कम', 'किसने सबसे अधिक', 'किसने सबसे कम',
      // Urdu patterns
      'کس کے پاس سب سے زیادہ', 'کس کے پاس سب سے کم', 'کس نے سب سے زیادہ', 'کس نے سب سے کم'
    ];
    
    return comparativePatterns.some(pattern => lowerInput.includes(pattern));
  };

  // Check if query is about bulk import
  const isBulkImportQuery = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const importPatterns = [
      'import drivers', 'bulk import', 'add multiple drivers', 'import data', 'upload drivers',
      'استيراد السائقين', 'استيراد بالجملة', 'إضافة سائقين متعددين', 'استيراد البيانات',
      'ड्राइवर आयात', 'बल्क आयात', 'कई ड्राइवर जोड़ें', 'डेटा आयात',
      'ڈرائیورز امپورٹ', 'بلک امپورٹ', 'متعدد ڈرائیورز شامل کریں', 'ڈیٹا امپورٹ'
    ];
    
    return importPatterns.some(pattern => lowerInput.includes(pattern));
  };

  // Process bulk import data from text
  const processBulkImportData = (input: string): any[] => {
    try {
      // Remove the command part
      const dataText = input.replace(/^.*?import drivers/i, '').trim();
      
      // Split by lines
      const lines = dataText.split(/\r?\n/);
      if (lines.length < 2) return [];
      
      // Determine delimiter (tab or comma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      // Parse headers
      const headers = firstLine.split(delimiter).map(h => h.trim());
      
      // Parse data rows
      const data = lines.slice(1).map(line => {
        const values = line.split(delimiter);
        const row: {[key: string]: string} = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        
        return row;
      });
      
      return data;
    } catch (error) {
      console.error('Error processing bulk import data:', error);
      return [];
    }
  };

  // Enhanced AI response logic with multilingual support and context awareness
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for bulk import
    if (isBulkImportQuery(input)) {
      const importData = processBulkImportData(input);
      if (importData.length > 0) {
        // Successfully parsed data
        return `✅ **Bulk Import Data Detected**\n\nI've found ${importData.length} driver records in your data. Here's a preview of the first few records:\n\n${importData.slice(0, 3).map(row => `• ${Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', ')}`).join('\n')}\n\n**Would you like me to import these drivers now?** Click "Import Drivers" to proceed.`;
      } else {
        // Failed to parse data
        return `📋 **Bulk Import**\n\nTo import multiple drivers at once, please provide your data in a structured format after the "import drivers" command. For example:\n\nName, Email, Phone, Vehicle ID\nJohn Smith, john@example.com, +971501234567, DXB-A-12345\nSarah Johnson, sarah@example.com, +971502345678, DXB-B-67890\n\nYou can copy-paste data directly from Excel or a CSV file.`;
      }
    }

    // Extract context from the query
    const mentionedDriverId = extractDriverName(input);
    const timeframe = extractTimeframe(input) || 'today';
    const isComparative = isComparativeQuery(input);
    
    // Update conversation context
    const newContext = {
      ...conversationContext,
      timeframe
    };
    
    // If this is a new query about a specific driver, update the context
    if (mentionedDriverId && !isComparative) {
      newContext.currentDriver = mentionedDriverId;
      newContext.isComparative = false;
    } 
    // If this is a comparative query, clear the current driver and set comparative flag
    else if (isComparative) {
      newContext.currentDriver = undefined;
      newContext.isComparative = true;
    }
    
    // Update the context
    setConversationContext(newContext);

    // Handle contract creation flow
    if (conversationContext.currentTopic === 'creating_contract') {
      const details = extractContractDetails(input);
      
      // Check if we have enough details to create a contract
      if (details.driverName && details.emiratesId && details.vehicle) {
        setConversationContext({}); // Reset context
        
        const responses = {
          en: `✅ **Contract Created Successfully!**\n\n**Contract Details:**\n• **Driver:** ${details.driverName}\n• **Emirates ID:** ${details.emiratesId}\n• **Vehicle:** ${details.vehicle}\n• **Duration:** ${details.duration || '12'} months\n• **Monthly Rent:** AED ${details.monthlyRent || '1,200'}\n• **Deposit:** AED ${details.deposit || '5,000'}\n• **Daily KM Limit:** ${details.kmLimit || '300'} km\n\n📋 **Next Steps:**\n• Contract has been generated\n• Driver will receive notification\n• Vehicle assignment confirmed\n• First payment due on contract start date\n\n💡 **The contract is now active in your system!**\n\nWould you like me to:\n• Show you all contracts\n• Create another contract\n• Check driver performance`,
          ar: `✅ **تم إنشاء العقد بنجاح!**\n\n**تفاصيل العقد:**\n• **السائق:** ${details.driverName}\n• **الهوية الإماراتية:** ${details.emiratesId}\n• **المركبة:** ${details.vehicle}\n• **المدة:** ${details.duration || '12'} شهر\n• **الإيجار الشهري:** ${details.monthlyRent || '1,200'} درهم\n• **التأمين:** ${details.deposit || '5,000'} درهم\n• **الحد اليومي للكيلومترات:** ${details.kmLimit || '300'} كم\n\n📋 **الخطوات التالية:**\n• تم إنشاء العقد\n• سيتلقى السائق إشعاراً\n• تم تأكيد تخصيص المركبة\n• الدفعة الأولى مستحقة في تاريخ بداية العقد\n\n💡 **العقد نشط الآن في نظامك!**\n\nهل تريد مني:\n• عرض جميع العقود\n• إنشاء عقد آخر\n• فحص أداء السائق`,
          hi: `✅ **अनुबंध सफलतापूर्वक बनाया गया!**\n\n**अनुबंध विवरण:**\n• **ड्राइवर:** ${details.driverName}\n• **एमिरेट्स ID:** ${details.emiratesId}\n• **वाहन:** ${details.vehicle}\n• **अवधि:** ${details.duration || '12'} महीने\n• **मासिक किराया:** AED ${details.monthlyRent || '1,200'}\n• **जमा:** AED ${details.deposit || '5,000'}\n• **दैनिक KM सीमा:** ${details.kmLimit || '300'} km\n\n📋 **अगले कदम:**\n• अनुबंध तैयार किया गया है\n• ड्राइवर को सूचना मिलेगी\n• वाहन असाइनमेंट की पुष्टि\n• पहला भुगतान अनुबंध शुरू की तारीख पर देय\n\n💡 **अनुबंध अब आपके सिस्टम में सक्रिय है!**\n\nक्या आप चाहते हैं कि मैं:\n• आपको सभी अनुबंध दिखाऊं\n• एक और अनुबंध बनाऊं\n• ड्राइवर प्रदर्शन जांचूं`,
          ur: `✅ **کنٹریکٹ کامیابی سے بنایا گیا!**\n\n**کنٹریکٹ کی تفصیلات:**\n• **ڈرائیور:** ${details.driverName}\n• **ایمریٹس ID:** ${details.emiratesId}\n• **گاڑی:** ${details.vehicle}\n• **مدت:** ${details.duration || '12'} مہینے\n• **ماہانہ کرایہ:** AED ${details.monthlyRent || '1,200'}\n• **ڈپازٹ:** AED ${details.deposit || '5,000'}\n• **روزانہ KM حد:** ${details.kmLimit || '300'} km\n\n📋 **اگلے قدم:**\n• کنٹریکٹ تیار کر دیا گیا\n• ڈرائیور کو اطلاع ملے گی\n• گاڑی کی تفویض کی تصدیق\n• پہلی ادائیگی کنٹریکٹ شروع کی تاریخ پر واجب\n\n💡 **کنٹریکٹ اب آپ کے سسٹم میں فعال ہے!**\n\nکیا آپ چاہتے ہیں کہ میں:\n• آپ کو تمام کنٹریکٹس دکھاؤں\n• ایک اور کنٹریکٹ بناؤں\n• ڈرائیور کی کارکردگی چیک کروں`
        };
        
        return responses[language];
      } else {
        // Ask for missing information
        const missing = [];
        if (!details.driverName) missing.push(language === 'ar' ? 'اسم السائق' : language === 'hi' ? 'ड्राइवर का नाम' : language === 'ur' ? 'ڈرائیور کا نام' : 'Driver name');
        if (!details.emiratesId) missing.push(language === 'ar' ? 'الهوية الإماراتية' : language === 'hi' ? 'एमिरेट्स ID' : language === 'ur' ? 'ایمریٹس ID' : 'Emirates ID');
        if (!details.vehicle) missing.push(language === 'ar' ? 'تخصيص المركبة' : language === 'hi' ? 'वाहन असाइनमेंट' : language === 'ur' ? 'گاڑی کی تفویض' : 'Vehicle assignment');
        
        const responses = {
          en: `📋 **Contract Information Received**\n\nI've captured some details, but I need a bit more information:\n\n**Still needed:**\n${missing.map(item => `• ${item}`).join('\n')}\n\n**What I have so far:**\n${details.driverName ? `• Driver: ${details.driverName}` : ''}\n${details.emiratesId ? `• Emirates ID: ${details.emiratesId}` : ''}\n${details.vehicle ? `• Vehicle: ${details.vehicle}` : ''}\n${details.duration ? `• Duration: ${details.duration} months` : ''}\n${details.monthlyRent ? `• Monthly Rent: AED ${details.monthlyRent}` : ''}\n${details.deposit ? `• Deposit: AED ${details.deposit}` : ''}\n${details.kmLimit ? `• KM Limit: ${details.kmLimit} km` : ''}\n\nPlease provide the missing information to complete the contract.`,
          ar: `📋 **تم استلام معلومات العقد**\n\nلقد التقطت بعض التفاصيل، لكنني أحتاج إلى مزيد من المعلومات:\n\n**ما زال مطلوباً:**\n${missing.map(item => `• ${item}`).join('\n')}\n\n**ما لدي حتى الآن:**\n${details.driverName ? `• السائق: ${details.driverName}` : ''}\n${details.emiratesId ? `• الهوية الإماراتية: ${details.emiratesId}` : ''}\n${details.vehicle ? `• المركبة: ${details.vehicle}` : ''}\n${details.duration ? `• المدة: ${details.duration} شهر` : ''}\n${details.monthlyRent ? `• الإيجار الشهري: ${details.monthlyRent} درهم` : ''}\n${details.deposit ? `• التأمين: ${details.deposit} درهم` : ''}\n${details.kmLimit ? `• حد الكيلومترات: ${details.kmLimit} كم` : ''}\n\nيرجى تقديم المعلومات المفقودة لإكمال العقد.`,
          hi: `📋 **अनुबंध की जानकारी प्राप्त हुई**\n\nमैंने कुछ विवरण कैप्चर किए हैं, लेकिन मुझे थोड़ी और जानकारी चाहिए:\n\n**अभी भी आवश्यक:**\n${missing.map(item => `• ${item}`).join('\n')}\n\n**अब तक मेरे पास क्या है:**\n${details.driverName ? `• ड्राइवर: ${details.driverName}` : ''}\n${details.emiratesId ? `• एमिरेट्स ID: ${details.emiratesId}` : ''}\n${details.vehicle ? `• वाहन: ${details.vehicle}` : ''}\n${details.duration ? `• अवधि: ${details.duration} महीने` : ''}\n${details.monthlyRent ? `• मासिक किराया: AED ${details.monthlyRent}` : ''}\n${details.deposit ? `• जमा: AED ${details.deposit}` : ''}\n${details.kmLimit ? `• KM सीमा: ${details.kmLimit} km` : ''}\n\nकृपया अनुबंध पूरा करने के लिए लापता जानकारी प्रदान करें।`,
          ur: `📋 **کنٹریکٹ کی معلومات موصول ہوئیں**\n\nمیں نے کچھ تفصیلات حاصل کی ہیں، لیکن مجھے تھوڑی اور معلومات درکار ہیں:\n\n**ابھی بھی ضروری:**\n${missing.map(item => `• ${item}`).join('\n')}\n\n**اب تک میرے پاس کیا ہے:**\n${details.driverName ? `• ڈرائیور: ${details.driverName}` : ''}\n${details.emiratesId ? `• ایمریٹس ID: ${details.emiratesId}` : ''}\n${details.vehicle ? `• گاڑی: ${details.vehicle}` : ''}\n${details.duration ? `• مدت: ${details.duration} مہینے` : ''}\n${details.monthlyRent ? `• ماہانہ کرایہ: AED ${details.monthlyRent}` : ''}\n${details.deposit ? `• ڈپازٹ: AED ${details.deposit}` : ''}\n${details.kmLimit ? `• KM حد: ${details.kmLimit} km` : ''}\n\nبراہ کرم کنٹریکٹ مکمل کرنے کے لیے لاپتہ معلومات فراہم کریں۔`
        };
        
        return responses[language];
      }
    }

    // Handle driver-specific queries
    if (lowerInput.includes('how many trips') || lowerInput.includes('trip count') || 
        lowerInput.includes('كم عدد الرحلات') || lowerInput.includes('عدد الرحلات') ||
        lowerInput.includes('कितनी यात्राएं') || lowerInput.includes('यात्रा संख्या') ||
        lowerInput.includes('کتنے سفر') || lowerInput.includes('سفر کی تعداد')) {
      
      // If it's a comparative query about trips
      if (isComparative) {
        // Find driver with most trips
        const sortedDrivers = [...mockDriversData].sort((a, b) => b.trips - a.trips);
        const topDriver = sortedDrivers[0];
        
        const responses = {
          en: `🏆 **Top Driver by Trip Count**\n\n**${topDriver.name}** has completed the most trips with **${topDriver.trips} trips** in total.\n\n**Top 3 Drivers by Trips:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].trips} trips\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].trips} trips\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].trips} trips\n\nWould you like to see the full driver ranking or check another metric?`,
          ar: `🏆 **أفضل سائق من حيث عدد الرحلات**\n\n**${topDriver.name}** أكمل أكبر عدد من الرحلات بإجمالي **${topDriver.trips} رحلة**.\n\n**أفضل 3 سائقين من حيث الرحلات:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].trips} رحلة\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].trips} رحلة\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].trips} رحلة\n\nهل ترغب في رؤية ترتيب السائقين الكامل أو التحقق من مقياس آخر؟`,
          hi: `🏆 **यात्रा संख्या के अनुसार शीर्ष ड्राइवर**\n\n**${topDriver.name}** ने कुल **${topDriver.trips} यात्राएं** पूरी करके सबसे अधिक यात्राएं पूरी की हैं।\n\n**यात्राओं के अनुसार शीर्ष 3 ड्राइवर:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].trips} यात्राएं\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].trips} यात्राएं\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].trips} यात्राएं\n\nक्या आप पूरी ड्राइवर रैंकिंग देखना चाहते हैं या किसी अन्य मेट्रिक की जांच करना चाहते हैं?`,
          ur: `🏆 **سفر کی تعداد کے لحاظ سے ٹاپ ڈرائیور**\n\n**${topDriver.name}** نے کل **${topDriver.trips} سفر** مکمل کرکے سب سے زیادہ سفر مکمل کیے ہیں۔\n\n**سفر کے لحاظ سے ٹاپ 3 ڈرائیورز:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].trips} سفر\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].trips} سفر\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].trips} سفر\n\nکیا آپ مکمل ڈرائیور رینکنگ دیکھنا چاہتے ہیں یا کسی اور میٹرک کو چیک کرنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver
      const driverId = mentionedDriverId || conversationContext.currentDriver;
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (driver) {
          const tripsToday = driver.trips_today || 0;
          
          const responses = {
            en: `📊 **Trip Count for ${driver.name}**\n\n${driver.name} has completed a total of **${driver.trips} trips**, with **${tripsToday} trips today**.\n\n**Trip Statistics:**\n• Total Trips: ${driver.trips}\n• Trips Today: ${tripsToday}\n• Average: ${Math.round(driver.trips / 30)} trips per day\n\nWould you like to see more details about ${driver.name}'s performance or check another driver?`,
            ar: `📊 **عدد رحلات ${driver.name}**\n\n${driver.name} أكمل إجمالي **${driver.trips} رحلة**، منها **${tripsToday} رحلة اليوم**.\n\n**إحصائيات الرحلات:**\n• إجمالي الرحلات: ${driver.trips}\n• رحلات اليوم: ${tripsToday}\n• المتوسط: ${Math.round(driver.trips / 30)} رحلة في اليوم\n\nهل ترغب في رؤية المزيد من التفاصيل حول أداء ${driver.name} أو التحقق من سائق آخر؟`,
            hi: `📊 **${driver.name} की यात्रा संख्या**\n\n${driver.name} ने कुल **${driver.trips} यात्राएं** पूरी की हैं, जिनमें **आज ${tripsToday} यात्राएं** शामिल हैं।\n\n**यात्रा आंकड़े:**\n• कुल यात्राएं: ${driver.trips}\n• आज की यात्राएं: ${tripsToday}\n• औसत: ${Math.round(driver.trips / 30)} यात्राएं प्रति दिन\n\nक्या आप ${driver.name} के प्रदर्शन के बारे में अधिक विवरण देखना चाहते हैं या किसी अन्य ड्राइवर की जांच करना चाहते हैं?`,
            ur: `📊 **${driver.name} کے سفر کی تعداد**\n\n${driver.name} نے کل **${driver.trips} سفر** مکمل کیے ہیں، جن میں **آج ${tripsToday} سفر** شامل ہیں۔\n\n**سفر کے اعداد و شمار:**\n• کل سفر: ${driver.trips}\n• آج کے سفر: ${tripsToday}\n• اوسط: ${Math.round(driver.trips / 30)} سفر فی دن\n\nکیا آپ ${driver.name} کی کارکردگی کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں یا کسی اور ڈرائیور کو چیک کرنا چاہتے ہیں؟`
          };
          
          return responses[language];
        }
      }
      
      // If no specific driver mentioned, show overall stats
      const totalTrips = mockDriversData.reduce((sum, d) => sum + d.trips, 0);
      const totalTripsToday = mockDriversData.reduce((sum, d) => sum + (d.trips_today || 0), 0);
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      
      const responses = {
        en: `📊 **Fleet Trip Summary**\n\nYour fleet has completed a total of **${totalTrips} trips**, with **${totalTripsToday} trips today**.\n\n**Trip Statistics:**\n• Total Trips: ${totalTrips}\n• Trips Today: ${totalTripsToday}\n• Active Drivers: ${activeDrivers}\n• Average: ${Math.round(totalTrips / activeDrivers)} trips per driver\n\nWould you like to see trip details for a specific driver?`,
        ar: `📊 **ملخص رحلات الأسطول**\n\nأكمل أسطولك إجمالي **${totalTrips} رحلة**، منها **${totalTripsToday} رحلة اليوم**.\n\n**إحصائيات الرحلات:**\n• إجمالي الرحلات: ${totalTrips}\n• رحلات اليوم: ${totalTripsToday}\n• السائقون النشطون: ${activeDrivers}\n• المتوسط: ${Math.round(totalTrips / activeDrivers)} رحلة لكل سائق\n\nهل ترغب في رؤية تفاصيل الرحلات لسائق معين؟`,
        hi: `📊 **फ्लीट यात्रा सारांश**\n\nआपके फ्लीट ने कुल **${totalTrips} यात्राएं** पूरी की हैं, जिनमें **आज ${totalTripsToday} यात्राएं** शामिल हैं।\n\n**यात्रा आंकड़े:**\n• कुल यात्राएं: ${totalTrips}\n• आज की यात्राएं: ${totalTripsToday}\n• सक्रिय ड्राइवर: ${activeDrivers}\n• औसत: ${Math.round(totalTrips / activeDrivers)} यात्राएं प्रति ड्राइवर\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए यात्रा विवरण देखना चाहते हैं?`,
        ur: `📊 **فلیٹ سفر کا خلاصہ**\n\nآپ کے فلیٹ نے کل **${totalTrips} سفر** مکمل کیے ہیں، جن میں **آج ${totalTripsToday} سفر** شامل ہیں۔\n\n**سفر کے اعداد و شمار:**\n• کل سفر: ${totalTrips}\n• آج کے سفر: ${totalTripsToday}\n• فعال ڈرائیورز: ${activeDrivers}\n• اوسط: ${Math.round(totalTrips / activeDrivers)} سفر فی ڈرائیور\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے سفر کی تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Handle earnings queries
    if (lowerInput.includes('earnings') || lowerInput.includes('money') || lowerInput.includes('revenue') || lowerInput.includes('income') ||
        lowerInput.includes('أرباح') || lowerInput.includes('مال') || lowerInput.includes('إيرادات') || lowerInput.includes('دخل') ||
        lowerInput.includes('कमाई') || lowerInput.includes('पैसा') || lowerInput.includes('राजस्व') || lowerInput.includes('आय') ||
        lowerInput.includes('کمائی') || lowerInput.includes('پیسہ') || lowerInput.includes('آمدنی') || lowerInput.includes('ریونیو')) {
      
      // If it's a comparative query about earnings
      if (isComparative) {
        // Find driver with most earnings
        const sortedDrivers = [...mockDriversData].sort((a, b) => b.earnings - a.earnings);
        const topDriver = sortedDrivers[0];
        
        const responses = {
          en: `💰 **Top Earning Driver**\n\n**${topDriver.name}** has earned the most with **$${topDriver.earnings.toLocaleString()}** in total earnings.\n\n**Top 3 Drivers by Earnings:**\n1. ${sortedDrivers[0].name}: $${sortedDrivers[0].earnings.toLocaleString()}\n2. ${sortedDrivers[1].name}: $${sortedDrivers[1].earnings.toLocaleString()}\n3. ${sortedDrivers[2].name}: $${sortedDrivers[2].earnings.toLocaleString()}\n\nWould you like to see the full earnings breakdown or check another metric?`,
          ar: `💰 **أعلى سائق من حيث الأرباح**\n\n**${topDriver.name}** حقق أكبر قدر من الأرباح بإجمالي **$${topDriver.earnings.toLocaleString()}**.\n\n**أفضل 3 سائقين من حيث الأرباح:**\n1. ${sortedDrivers[0].name}: $${sortedDrivers[0].earnings.toLocaleString()}\n2. ${sortedDrivers[1].name}: $${sortedDrivers[1].earnings.toLocaleString()}\n3. ${sortedDrivers[2].name}: $${sortedDrivers[2].earnings.toLocaleString()}\n\nهل ترغب في رؤية تفصيل كامل للأرباح أو التحقق من مقياس آخر؟`,
          hi: `💰 **शीर्ष कमाई वाला ड्राइवर**\n\n**${topDriver.name}** ने कुल **$${topDriver.earnings.toLocaleString()}** की सबसे अधिक कमाई की है।\n\n**कमाई के अनुसार शीर्ष 3 ड्राइवर:**\n1. ${sortedDrivers[0].name}: $${sortedDrivers[0].earnings.toLocaleString()}\n2. ${sortedDrivers[1].name}: $${sortedDrivers[1].earnings.toLocaleString()}\n3. ${sortedDrivers[2].name}: $${sortedDrivers[2].earnings.toLocaleString()}\n\nक्या आप पूरा कमाई विवरण देखना चाहते हैं या किसी अन्य मेट्रिक की जांच करना चाहते हैं?`,
          ur: `💰 **سب سے زیادہ کمانے والا ڈرائیور**\n\n**${topDriver.name}** نے کل **$${topDriver.earnings.toLocaleString()}** کے ساتھ سب سے زیادہ کمائی کی ہے۔\n\n**کمائی کے لحاظ سے ٹاپ 3 ڈرائیورز:**\n1. ${sortedDrivers[0].name}: $${sortedDrivers[0].earnings.toLocaleString()}\n2. ${sortedDrivers[1].name}: $${sortedDrivers[1].earnings.toLocaleString()}\n3. ${sortedDrivers[2].name}: $${sortedDrivers[2].earnings.toLocaleString()}\n\nکیا آپ مکمل کمائی کی تفصیل دیکھنا چاہتے ہیں یا کسی اور میٹرک کو چیک کرنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver
      const driverId = mentionedDriverId || conversationContext.currentDriver;
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (driver) {
          const earningsToday = driver.earnings_today || 0;
          
          const responses = {
            en: `💰 **Earnings for ${driver.name}**\n\n${driver.name} has earned a total of **$${driver.earnings.toLocaleString()}**, with **$${earningsToday}** earned today.\n\n**Earnings Breakdown:**\n• Total Earnings: $${driver.earnings.toLocaleString()}\n• Today's Earnings: $${earningsToday}\n• Average: $${Math.round(driver.earnings / 30)} per day\n\nWould you like to see more details about ${driver.name}'s performance or check another driver?`,
            ar: `💰 **أرباح ${driver.name}**\n\n${driver.name} حقق إجمالي **$${driver.earnings.toLocaleString()}**، منها **$${earningsToday}** اليوم.\n\n**تفصيل الأرباح:**\n• إجمالي الأرباح: $${driver.earnings.toLocaleString()}\n• أرباح اليوم: $${earningsToday}\n• المتوسط: $${Math.round(driver.earnings / 30)} في اليوم\n\nهل ترغب في رؤية المزيد من التفاصيل حول أداء ${driver.name} أو التحقق من سائق آخر؟`,
            hi: `💰 **${driver.name} की कमाई**\n\n${driver.name} ने कुल **$${driver.earnings.toLocaleString()}** कमाए हैं, जिनमें से **$${earningsToday}** आज कमाए गए हैं।\n\n**कमाई विवरण:**\n• कुल कमाई: $${driver.earnings.toLocaleString()}\n• आज की कमाई: $${earningsToday}\n• औसत: $${Math.round(driver.earnings / 30)} प्रति दिन\n\nक्या आप ${driver.name} के प्रदर्शन के बारे में अधिक विवरण देखना चाहते हैं या किसी अन्य ड्राइवर की जांच करना चाहते हैं?`,
            ur: `💰 **${driver.name} کی کمائی**\n\n${driver.name} نے کل **$${driver.earnings.toLocaleString()}** کمائے ہیں، جن میں سے **$${earningsToday}** آج کمائے گئے ہیں۔\n\n**کمائی کی تفصیل:**\n• کل کمائی: $${driver.earnings.toLocaleString()}\n• آج کی کمائی: $${earningsToday}\n• اوسط: $${Math.round(driver.earnings / 30)} فی دن\n\nکیا آپ ${driver.name} کی کارکردگی کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں یا کسی اور ڈرائیور کو چیک کرنا چاہتے ہیں؟`
          };
          
          return responses[language];
        }
      }
      
      // If no specific driver mentioned, show overall earnings
      const totalEarnings = mockDriversData.reduce((sum, d) => sum + d.earnings, 0);
      const totalEarningsToday = mockDriversData.reduce((sum, d) => sum + (d.earnings_today || 0), 0);
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      
      const responses = {
        en: `💰 **Fleet Earnings Summary**\n\nYour fleet has earned a total of **$${totalEarnings.toLocaleString()}**, with **$${totalEarningsToday}** earned today.\n\n**Earnings Statistics:**\n• Total Earnings: $${totalEarnings.toLocaleString()}\n• Earnings Today: $${totalEarningsToday}\n• Active Drivers: ${activeDrivers}\n• Average: $${Math.round(totalEarnings / activeDrivers)} per driver\n\nWould you like to see earnings details for a specific driver?`,
        ar: `💰 **ملخص أرباح الأسطول**\n\nحقق أسطولك إجمالي **$${totalEarnings.toLocaleString()}**، منها **$${totalEarningsToday}** اليوم.\n\n**إحصائيات الأرباح:**\n• إجمالي الأرباح: $${totalEarnings.toLocaleString()}\n• أرباح اليوم: $${totalEarningsToday}\n• السائقون النشطون: ${activeDrivers}\n• المتوسط: $${Math.round(totalEarnings / activeDrivers)} لكل سائق\n\nهل ترغب في رؤية تفاصيل الأرباح لسائق معين؟`,
        hi: `💰 **फ्लीट कमाई सारांश**\n\nआपके फ्लीट ने कुल **$${totalEarnings.toLocaleString()}** कमाए हैं, जिनमें से **$${totalEarningsToday}** आज कमाए गए हैं।\n\n**कमाई आंकड़े:**\n• कुल कमाई: $${totalEarnings.toLocaleString()}\n• आज की कमाई: $${totalEarningsToday}\n• सक्रिय ड्राइवर: ${activeDrivers}\n• औसत: $${Math.round(totalEarnings / activeDrivers)} प्रति ड्राइवर\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए कमाई विवरण देखना चाहते हैं?`,
        ur: `💰 **فلیٹ کمائی کا خلاصہ**\n\nآپ کے فلیٹ نے کل **$${totalEarnings.toLocaleString()}** کمائے ہیں، جن میں سے **$${totalEarningsToday}** آج کمائے گئے ہیں۔\n\n**کمائی کے اعداد و شمار:**\n• کل کمائی: $${totalEarnings.toLocaleString()}\n• آج کی کمائی: $${totalEarningsToday}\n• فعال ڈرائیورز: ${activeDrivers}\n• اوسط: $${Math.round(totalEarnings / activeDrivers)} فی ڈرائیور\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے کمائی کی تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Handle performance queries
    if (lowerInput.includes('performance') || lowerInput.includes('score') || lowerInput.includes('rating') ||
        lowerInput.includes('أداء') || lowerInput.includes('درجة') || lowerInput.includes('تقييم') ||
        lowerInput.includes('प्रदर्शन') || lowerInput.includes('स्कोर') || lowerInput.includes('रेटिंग') ||
        lowerInput.includes('کارکردگی') || lowerInput.includes('اسکور') || lowerInput.includes('ریٹنگ')) {
      
      // If it's a comparative query about performance
      if (isComparative) {
        // Find driver with best performance
        const sortedDrivers = [...mockDriversData].sort((a, b) => b.performanceScore - a.performanceScore);
        const topDriver = sortedDrivers[0];
        
        const responses = {
          en: `⭐ **Top Performing Driver**\n\n**${topDriver.name}** has the highest performance score of **${topDriver.performanceScore}%**.\n\n**Top 3 Drivers by Performance:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].performanceScore}%\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].performanceScore}%\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].performanceScore}%\n\nWould you like to see the full performance ranking or check another metric?`,
          ar: `⭐ **أفضل سائق من حيث الأداء**\n\n**${topDriver.name}** لديه أعلى درجة أداء بنسبة **${topDriver.performanceScore}%**.\n\n**أفضل 3 سائقين من حيث الأداء:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].performanceScore}%\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].performanceScore}%\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].performanceScore}%\n\nهل ترغب في رؤية ترتيب الأداء الكامل أو التحقق من مقياس آخر؟`,
          hi: `⭐ **शीर्ष प्रदर्शन वाला ड्राइवर**\n\n**${topDriver.name}** का सबसे अधिक प्रदर्शन स्कोर **${topDriver.performanceScore}%** है।\n\n**प्रदर्शन के अनुसार शीर्ष 3 ड्राइवर:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].performanceScore}%\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].performanceScore}%\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].performanceScore}%\n\nक्या आप पूरी प्रदर्शन रैंकिंग देखना चाहते हैं या किसी अन्य मेट्रिक की जांच करना चाहते हैं?`,
          ur: `⭐ **سب سے اچھی کارکردگی والا ڈرائیور**\n\n**${topDriver.name}** کا سب سے زیادہ کارکردگی اسکور **${topDriver.performanceScore}%** ہے۔\n\n**کارکردگی کے لحاظ سے ٹاپ 3 ڈرائیورز:**\n1. ${sortedDrivers[0].name}: ${sortedDrivers[0].performanceScore}%\n2. ${sortedDrivers[1].name}: ${sortedDrivers[1].performanceScore}%\n3. ${sortedDrivers[2].name}: ${sortedDrivers[2].performanceScore}%\n\nکیا آپ مکمل کارکردگی رینکنگ دیکھنا چاہتے ہیں یا کسی اور میٹرک کو چیک کرنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver
      const driverId = mentionedDriverId || conversationContext.currentDriver;
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (driver) {
          let performanceRating = '';
          if (driver.performanceScore >= 90) {
            performanceRating = language === 'ar' ? 'ممتاز' : language === 'hi' ? 'उत्कृष्ट' : language === 'ur' ? 'بہترین' : 'Excellent';
          } else if (driver.performanceScore >= 80) {
            performanceRating = language === 'ar' ? 'جيد جداً' : language === 'hi' ? 'बहुत अच्छा' : language === 'ur' ? 'بہت اچھا' : 'Very Good';
          } else if (driver.performanceScore >= 70) {
            performanceRating = language === 'ar' ? 'جيد' : language === 'hi' ? 'अच्छा' : language === 'ur' ? 'اچھا' : 'Good';
          } else {
            performanceRating = language === 'ar' ? 'يحتاج تحسين' : language === 'hi' ? 'सुधार की आवश्यकता' : language === 'ur' ? 'بہتری کی ضرورت' : 'Needs Improvement';
          }
          
          const responses = {
            en: `⭐ **Performance Score for ${driver.name}**\n\n${driver.name} has a performance score of **${driver.performanceScore}%** (${performanceRating}).\n\n**Performance Factors:**\n• Trip Completion Rate: ${Math.round(driver.performanceScore * 0.9)}%\n• Customer Rating: ${(driver.performanceScore / 20).toFixed(1)}/5.0\n• On-time Arrival: ${Math.round(driver.performanceScore * 0.95)}%\n\nWould you like to see more details about ${driver.name}'s performance or check another driver?`,
            ar: `⭐ **درجة أداء ${driver.name}**\n\n${driver.name} لديه درجة أداء **${driver.performanceScore}%** (${performanceRating}).\n\n**عوامل الأداء:**\n• معدل إكمال الرحلات: ${Math.round(driver.performanceScore * 0.9)}%\n• تقييم العملاء: ${(driver.performanceScore / 20).toFixed(1)}/5.0\n• الوصول في الوقت المحدد: ${Math.round(driver.performanceScore * 0.95)}%\n\nهل ترغب في رؤية المزيد من التفاصيل حول أداء ${driver.name} أو التحقق من سائق آخر؟`,
            hi: `⭐ **${driver.name} का प्रदर्शन स्कोर**\n\n${driver.name} का प्रदर्शन स्कोर **${driver.performanceScore}%** (${performanceRating}) है।\n\n**प्रदर्शन कारक:**\n• यात्रा पूर्णता दर: ${Math.round(driver.performanceScore * 0.9)}%\n• ग्राहक रेटिंग: ${(driver.performanceScore / 20).toFixed(1)}/5.0\n• समय पर पहुंचना: ${Math.round(driver.performanceScore * 0.95)}%\n\nक्या आप ${driver.name} के प्रदर्शन के बारे में अधिक विवरण देखना चाहते हैं या किसी अन्य ड्राइवर की जांच करना चाहते हैं?`,
            ur: `⭐ **${driver.name} کا کارکردگی اسکور**\n\n${driver.name} کا کارکردگی اسکور **${driver.performanceScore}%** (${performanceRating}) ہے۔\n\n**کارکردگی کے عوامل:**\n• سفر مکمل کرنے کی شرح: ${Math.round(driver.performanceScore * 0.9)}%\n• کسٹمر ریٹنگ: ${(driver.performanceScore / 20).toFixed(1)}/5.0\n• وقت پر پہنچنا: ${Math.round(driver.performanceScore * 0.95)}%\n\nکیا آپ ${driver.name} کی کارکردگی کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں یا کسی اور ڈرائیور کو چیک کرنا چاہتے ہیں؟`
          };
          
          return responses[language];
        }
      }
      
      // If no specific driver mentioned, show overall performance
      const avgPerformance = mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length;
      const topPerformer = [...mockDriversData].sort((a, b) => b.performanceScore - a.performanceScore)[0];
      const needsImprovement = mockDriversData.filter(d => d.performanceScore < 80).length;
      
      const responses = {
        en: `⭐ **Fleet Performance Summary**\n\nYour fleet has an average performance score of **${avgPerformance.toFixed(1)}%**.\n\n**Performance Statistics:**\n• Average Score: ${avgPerformance.toFixed(1)}%\n• Top Performer: ${topPerformer.name} (${topPerformer.performanceScore}%)\n• Drivers Needing Improvement: ${needsImprovement}\n\nWould you like to see performance details for a specific driver?`,
        ar: `⭐ **ملخص أداء الأسطول**\n\nأسطولك لديه متوسط درجة أداء **${avgPerformance.toFixed(1)}%**.\n\n**إحصائيات الأداء:**\n• متوسط الدرجة: ${avgPerformance.toFixed(1)}%\n• أفضل أداء: ${topPerformer.name} (${topPerformer.performanceScore}%)\n• السائقون الذين يحتاجون إلى تحسين: ${needsImprovement}\n\nهل ترغب في رؤية تفاصيل الأداء لسائق معين؟`,
        hi: `⭐ **फ्लीट प्रदर्शन सारांश**\n\nआपके फ्लीट का औसत प्रदर्शन स्कोर **${avgPerformance.toFixed(1)}%** है।\n\n**प्रदर्शन आंकड़े:**\n• औसत स्कोर: ${avgPerformance.toFixed(1)}%\n• शीर्ष प्रदर्शनकर्ता: ${topPerformer.name} (${topPerformer.performanceScore}%)\n• सुधार की आवश्यकता वाले ड्राइवर: ${needsImprovement}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए प्रदर्शन विवरण देखना चाहते हैं?`,
        ur: `⭐ **فلیٹ کارکردگی کا خلاصہ**\n\nآپ کے فلیٹ کا اوسط کارکردگی اسکور **${avgPerformance.toFixed(1)}%** ہے۔\n\n**کارکردگی کے اعداد و شمار:**\n• اوسط اسکور: ${avgPerformance.toFixed(1)}%\n• بہترین کارکردگی: ${topPerformer.name} (${topPerformer.performanceScore}%)\n• بہتری کی ضرورت والے ڈرائیورز: ${needsImprovement}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے کارکردگی کی تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Handle fines queries
    if (lowerInput.includes('fine') || lowerInput.includes('penalty') || lowerInput.includes('violation') ||
        lowerInput.includes('مخالفة') || lowerInput.includes('غرامة') || lowerInput.includes('عقوبة') ||
        lowerInput.includes('जुर्माना') || lowerInput.includes('दंड') || lowerInput.includes('उल्लंघन') ||
        lowerInput.includes('جرمانہ') || lowerInput.includes('سزا') || lowerInput.includes('خلاف ورزی')) {
      
      // If asking about a specific driver
      const driverId = mentionedDriverId || conversationContext.currentDriver;
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (driver) {
          const driverFines = mockFinesData.filter(f => f.driverId === driverId);
          const pendingFines = driverFines.filter(f => f.status === 'pending');
          const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
          const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
          
          const responses = {
            en: `🚨 **Fines for ${driver.name}**\n\n${driver.name} has **${driverFines.length} fines** in total, with **${pendingFines.length} pending** fines.\n\n**Fines Summary:**\n• Total Fines: ${driverFines.length}\n• Pending Fines: ${pendingFines.length}\n• Total Amount: AED ${totalAmount}\n• Pending Amount: AED ${pendingAmount}\n\n${pendingFines.length > 0 ? `**Pending Fines:**\n${pendingFines.map(f => `• ${f.violation} - AED ${f.amount} (${f.date})`).join('\n')}` : '**No pending fines!**'}\n\nWould you like to see more details about ${driver.name}'s fines or check another driver?`,
            ar: `🚨 **مخالفات ${driver.name}**\n\n${driver.name} لديه **${driverFines.length} مخالفة** بالإجمالي، منها **${pendingFines.length} مخالفة معلقة**.\n\n**ملخص المخالفات:**\n• إجمالي المخالفات: ${driverFines.length}\n• المخالفات المعلقة: ${pendingFines.length}\n• المبلغ الإجمالي: ${totalAmount} درهم\n• المبلغ المعلق: ${pendingAmount} درهم\n\n${pendingFines.length > 0 ? `**المخالفات المعلقة:**\n${pendingFines.map(f => `• ${f.violation} - ${f.amount} درهم (${f.date})`).join('\n')}` : '**لا توجد مخالفات معلقة!**'}\n\nهل ترغب في رؤية المزيد من التفاصيل حول مخالفات ${driver.name} أو التحقق من سائق آخر؟`,
            hi: `🚨 **${driver.name} के जुर्माने**\n\n${driver.name} के पास कुल **${driverFines.length} जुर्माने** हैं, जिनमें से **${pendingFines.length} लंबित** जुर्माने हैं।\n\n**जुर्माना सारांश:**\n• कुल जुर्माने: ${driverFines.length}\n• लंबित जुर्माने: ${pendingFines.length}\n• कुल राशि: AED ${totalAmount}\n• लंबित राशि: AED ${pendingAmount}\n\n${pendingFines.length > 0 ? `**लंबित जुर्माने:**\n${pendingFines.map(f => `• ${f.violation} - AED ${f.amount} (${f.date})`).join('\n')}` : '**कोई लंबित जुर्माना नहीं!**'}\n\nक्या आप ${driver.name} के जुर्मानों के बारे में अधिक विवरण देखना चाहते हैं या किसी अन्य ड्राइवर की जांच करना चाहते हैं?`,
            ur: `🚨 **${driver.name} کے جرمانے**\n\n${driver.name} کے پاس کل **${driverFines.length} جرمانے** ہیں، جن میں سے **${pendingFines.length} زیر التواء** جرمانے ہیں۔\n\n**جرمانہ خلاصہ:**\n• کل جرمانے: ${driverFines.length}\n• زیر التواء جرمانے: ${pendingFines.length}\n• کل رقم: AED ${totalAmount}\n• زیر التواء رقم: AED ${pendingAmount}\n\n${pendingFines.length > 0 ? `**زیر التواء جرمانے:**\n${pendingFines.map(f => `• ${f.violation} - AED ${f.amount} (${f.date})`).join('\n')}` : '**کوئی زیر التواء جرمانہ نہیں!**'}\n\nکیا آپ ${driver.name} کے جرمانوں کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں یا کسی اور ڈرائیور کو چیک کرنا چاہتے ہیں؟`
          };
          
          return responses[language];
        }
      }
      
      // If no specific driver mentioned, show overall fines
      const totalFines = mockFinesData.length;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending');
      const totalAmount = mockFinesData.reduce((sum, f) => sum + f.amount, 0);
      const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
      
      // Group fines by driver
      const finesByDriver: {[key: number]: number} = {};
      mockFinesData.forEach(fine => {
        finesByDriver[fine.driverId] = (finesByDriver[fine.driverId] || 0) + 1;
      });
      
      // Find driver with most fines
      let driverWithMostFines = { id: 0, count: 0 };
      Object.entries(finesByDriver).forEach(([driverId, count]) => {
        if (count > driverWithMostFines.count) {
          driverWithMostFines = { id: parseInt(driverId), count };
        }
      });
      
      const driverName = driverWithMostFines.id ? getDriverName(driverWithMostFines.id) : 'N/A';
      
      const responses = {
        en: `🚨 **Fleet Fines Summary**\n\nYour fleet has **${totalFines} fines** in total, with **${pendingFines.length} pending** fines.\n\n**Fines Statistics:**\n• Total Fines: ${totalFines}\n• Pending Fines: ${pendingFines.length}\n• Total Amount: AED ${totalAmount}\n• Pending Amount: AED ${pendingAmount}\n• Driver with Most Fines: ${driverName} (${driverWithMostFines.count} fines)\n\n${pendingFines.length > 0 ? `**Recent Pending Fines:**\n${pendingFines.slice(0, 3).map(f => `• ${getDriverName(f.driverId)}: ${f.violation} - AED ${f.amount}`).join('\n')}` : '**No pending fines!**'}\n\nWould you like to see fines details for a specific driver?`,
        ar: `🚨 **ملخص مخالفات الأسطول**\n\nأسطولك لديه **${totalFines} مخالفة** بالإجمالي، منها **${pendingFines.length} مخالفة معلقة**.\n\n**إحصائيات المخالفات:**\n• إجمالي المخالفات: ${totalFines}\n• المخالفات المعلقة: ${pendingFines.length}\n• المبلغ الإجمالي: ${totalAmount} درهم\n• المبلغ المعلق: ${pendingAmount} درهم\n• السائق الأكثر مخالفات: ${driverName} (${driverWithMostFines.count} مخالفة)\n\n${pendingFines.length > 0 ? `**المخالفات المعلقة الأخيرة:**\n${pendingFines.slice(0, 3).map(f => `• ${getDriverName(f.driverId)}: ${f.violation} - ${f.amount} درهم`).join('\n')}` : '**لا توجد مخالفات معلقة!**'}\n\nهل ترغب في رؤية تفاصيل المخالفات لسائق معين؟`,
        hi: `🚨 **फ्लीट जुर्माना सारांश**\n\nआपके फ्लीट में कुल **${totalFines} जुर्माने** हैं, जिनमें से **${pendingFines.length} लंबित** जुर्माने हैं।\n\n**जुर्माना आंकड़े:**\n• कुल जुर्माने: ${totalFines}\n• लंबित जुर्माने: ${pendingFines.length}\n• कुल राशि: AED ${totalAmount}\n• लंबित राशि: AED ${pendingAmount}\n• सबसे अधिक जुर्माने वाला ड्राइवर: ${driverName} (${driverWithMostFines.count} जुर्माने)\n\n${pendingFines.length > 0 ? `**हाल के लंबित जुर्माने:**\n${pendingFines.slice(0, 3).map(f => `• ${getDriverName(f.driverId)}: ${f.violation} - AED ${f.amount}`).join('\n')}` : '**कोई लंबित जुर्माना नहीं!**'}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए जुर्माना विवरण देखना चाहते हैं?`,
        ur: `🚨 **فلیٹ جرمانہ خلاصہ**\n\nآپ کے فلیٹ میں کل **${totalFines} جرمانے** ہیں، جن میں سے **${pendingFines.length} زیر التواء** جرمانے ہیں۔\n\n**جرمانہ کے اعداد و شمار:**\n• کل جرمانے: ${totalFines}\n• زیر التواء جرمانے: ${pendingFines.length}\n• کل رقم: AED ${totalAmount}\n• زیر التواء رقم: AED ${pendingAmount}\n• سب سے زیادہ جرمانے والا ڈرائیور: ${driverName} (${driverWithMostFines.count} جرمانے)\n\n${pendingFines.length > 0 ? `**حالیہ زیر التواء جرمانے:**\n${pendingFines.slice(0, 3).map(f => `• ${getDriverName(f.driverId)}: ${f.violation} - AED ${f.amount}`).join('\n')}` : '**کوئی زیر التواء جرمانہ نہیں!**'}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے جرمانہ کی تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Handle active drivers queries
    if (lowerInput.includes('active drivers') || lowerInput.includes('drivers on duty') || lowerInput.includes('who is active') ||
        lowerInput.includes('السائقين النشطين') || lowerInput.includes('السائقون في الخدمة') || lowerInput.includes('من هو نشط') ||
        lowerInput.includes('सक्रिय ड्राइवर') || lowerInput.includes('ड्यूटी पर ड्राइवर') || lowerInput.includes('कौन सक्रिय है') ||
        lowerInput.includes('فعال ڈرائیورز') || lowerInput.includes('ڈیوٹی پر ڈرائیورز') || lowerInput.includes('کون فعال ہے')) {
      
      const activeDrivers = mockDriversData.filter(d => d.status === 'active');
      
      const responses = {
        en: `👥 **Active Drivers**\n\nYou have **${activeDrivers.length} active drivers** out of ${mockDriversData.length} total drivers.\n\n**Active Driver List:**\n${activeDrivers.map(d => `• ${d.name} - ${d.vehicleId || 'No vehicle'}`).join('\n')}\n\nWould you like to see more details about a specific driver?`,
        ar: `👥 **السائقون النشطون**\n\nلديك **${activeDrivers.length} سائق نشط** من إجمالي ${mockDriversData.length} سائق.\n\n**قائمة السائقين النشطين:**\n${activeDrivers.map(d => `• ${d.name} - ${d.vehicleId || 'لا توجد مركبة'}`).join('\n')}\n\nهل ترغب في رؤية المزيد من التفاصيل حول سائق معين؟`,
        hi: `👥 **सक्रिय ड्राइवर**\n\nआपके पास कुल ${mockDriversData.length} ड्राइवरों में से **${activeDrivers.length} सक्रिय ड्राइवर** हैं।\n\n**सक्रिय ड्राइवर सूची:**\n${activeDrivers.map(d => `• ${d.name} - ${d.vehicleId || 'कोई वाहन नहीं'}`).join('\n')}\n\nक्या आप किसी विशिष्ट ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
        ur: `👥 **فعال ڈرائیورز**\n\nآپ کے پاس کل ${mockDriversData.length} ڈرائیورز میں سے **${activeDrivers.length} فعال ڈرائیورز** ہیں۔\n\n**فعال ڈرائیور لسٹ:**\n${activeDrivers.map(d => `• ${d.name} - ${d.vehicleId || 'کوئی گاڑی نہیں'}`).join('\n')}\n\nکیا آپ کسی مخصوص ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Contract-related queries - ENHANCED LOGIC with multilingual support
    if (lowerInput.includes('contract') || lowerInput.includes('make contract') || lowerInput.includes('create contract') || lowerInput.includes('new contract') || lowerInput.includes('generate contract') ||
        lowerInput.includes('عقد') || lowerInput.includes('إنشاء عقد') || lowerInput.includes('عقد جديد') ||
        lowerInput.includes('अनुबंध') || lowerInput.includes('नया अनुबंध') || lowerInput.includes('अनुबंध बनाएं') ||
        lowerInput.includes('کنٹریکٹ') || lowerInput.includes('نیا کنٹریکٹ') || lowerInput.includes('کنٹریکٹ بنائیں')) {
      
      // Contract creation/generation
      if (lowerInput.includes('make') || lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('generate') ||
          lowerInput.includes('إنشاء') || lowerInput.includes('جديد') ||
          lowerInput.includes('बनाएं') || lowerInput.includes('नया') ||
          lowerInput.includes('بنائیں') || lowerInput.includes('نیا')) {
        setConversationContext({ ...conversationContext, currentTopic: 'creating_contract' }); // Set context for next messages
        
        const responses = {
          en: `📋 **Let's Create a New Contract!**\n\nI'll help you generate a rental contract. Please provide the following information:\n\n**Required Details:**\n• **Driver Name:** (e.g., "Ahmed Al-Rashid")\n• **Emirates ID:** (e.g., "784-1990-1234567-1")\n• **Vehicle Assignment:** (e.g., "DXB-A-12345")\n• **Contract Duration:** (e.g., "12 months")\n• **Monthly Rent:** (e.g., "AED 1,200")\n• **Deposit Amount:** (e.g., "AED 5,000")\n• **Daily KM Limit:** (e.g., "300 km")\n\n💡 **You can provide all details at once or one by one. For example:**\n\n"Driver: Fatima Al-Zahra, Emirates ID: 784-1992-7654321-8, Vehicle: DXB-G-55555, Duration: 18 months, Monthly rent: AED 1,350, Deposit: AED 5,200, Daily limit: 280 km"\n\n**Or use the Contract Generator:**\nGo to **Contracts** → **"Generate with OCR"** to automatically scan Emirates ID!`,
          ar: `📋 **لننشئ عقداً جديداً!**\n\nسأساعدك في إنشاء عقد إيجار. يرجى تقديم المعلومات التالية:\n\n**التفاصيل المطلوبة:**\n• **اسم السائق:** (مثل "أحمد الراشد")\n• **الهوية الإماراتية:** (مثل "784-1990-1234567-1")\n• **تخصيص المركبة:** (مثل "DXB-A-12345")\n• **مدة العقد:** (مثل "12 شهر")\n• **الإيجار الشهري:** (مثل "1,200 درهم")\n• **مبلغ التأمين:** (مثل "5,000 درهم")\n• **الحد اليومي للكيلومترات:** (مثل "300 كم")\n\n💡 **يمكنك تقديم جميع التفاصيل دفعة واحدة أو واحداً تلو الآخر. على سبيل المثال:**\n\n"السائق: فاطمة الزهراء، الهوية الإماراتية: 784-1992-7654321-8، المركبة: DXB-G-55555، المدة: 18 شهر، الإيجار الشهري: 1,350 درهم، التأمين: 5,200 درهم، الحد اليومي: 280 كم"\n\n**أو استخدم مولد العقود:**\nاذهب إلى **العقود** → **"إنشاء مع OCR"** لمسح الهوية الإماراتية تلقائياً!`,
          hi: `📋 **आइए एक नया अनुबंध बनाते हैं!**\n\nमैं आपको एक किराया अनुबंध बनाने में मदद करूंगा। कृपया निम्नलिखित जानकारी प्रदान करें:\n\n**आवश्यक विवरण:**\n• **ड्राइवर का नाम:** (जैसे "अहमद अल-राशिद")\n• **एमिरेट्स ID:** (जैसे "784-1990-1234567-1")\n• **वाहन असाइनमेंट:** (जैसे "DXB-A-12345")\n• **अनुबंध अवधि:** (जैसे "12 महीने")\n• **मासिक किराया:** (जैसे "AED 1,200")\n• **जमा राशि:** (जैसे "AED 5,000")\n• **दैनिक KM सीमा:** (जैसे "300 km")\n\n💡 **आप सभी विवरण एक साथ या एक-एक करके दे सकते हैं। उदाहरण के लिए:**\n\n"ड्राइवर: फातिमा अल-जहरा, एमिरेट्स ID: 784-1992-7654321-8, वाहन: DXB-G-55555, अवधि: 18 महीने, मासिक किराया: AED 1,350, जमा: AED 5,200, दैनिक सीमा: 280 km"\n\n**या अनुबंध जेनरेटर का उपयोग करें:**\n**अनुबंध** → **"OCR के साथ जेनरेट करें"** पर जाकर एमिरेट्स ID को स्वचालित रूप से स्कैन करें!`,
          ur: `📋 **آئیے ایک نیا کنٹریکٹ بناتے ہیں!**\n\nمیں آپ کو کرایے کا کنٹریکٹ بنانے میں مدد کروں گا۔ براہ کرم درج ذیل معلومات فراہم کریں:\n\n**ضروری تفصیلات:**\n• **ڈرائیور کا نام:** (جیسے "احمد الراشد")\n• **ایمریٹس ID:** (جیسے "784-1990-1234567-1")\n• **گاڑی کی تفویض:** (جیسے "DXB-A-12345")\n• **کنٹریکٹ کی مدت:** (جیسے "12 مہینے")\n• **ماہانہ کرایہ:** (جیسے "AED 1,200")\n• **ڈپازٹ کی رقم:** (جیسے "AED 5,000")\n• **روزانہ KM حد:** (جیسے "300 km")\n\n💡 **آپ تمام تفصیلات ایک ساتھ یا ایک ایک کرکے دے سکتے ہیں۔ مثال کے طور پر:**\n\n"ڈرائیور: فاطمہ الزہرا، ایمریٹس ID: 784-1992-7654321-8، گاڑی: DXB-G-55555، مدت: 18 مہینے، ماہانہ کرایہ: AED 1,350، ڈپازٹ: AED 5,200، روزانہ حد: 280 km"\n\n**یا کنٹریکٹ جنریٹر استعمال کریں:**\n**کنٹریکٹس** → **"OCR کے ساتھ جنریٹ کریں"** پر جا کر ایمریٹس ID کو خودکار طور پر اسکین کریں!`
        };
        
        return responses[language];
      }

      // Show contracts
      if (lowerInput.includes('show') || lowerInput.includes('list') || lowerInput.includes('view') ||
          lowerInput.includes('أظهر') || lowerInput.includes('عرض') ||
          lowerInput.includes('दिखाएं') || lowerInput.includes('देखें') ||
          lowerInput.includes('دکھائیں') || lowerInput.includes('دیکھیں')) {
        
        // If asking about a specific driver's contracts
        const driverId = mentionedDriverId || conversationContext.currentDriver;
        if (driverId) {
          const driver = mockDriversData.find(d => d.id === driverId);
          if (driver) {
            const driverContracts = mockContractsData.filter(c => c.driverId === driverId);
            
            if (driverContracts.length === 0) {
              const responses = {
                en: `📋 **Contracts for ${driver.name}**\n\n${driver.name} doesn't have any active contracts in the system.\n\nWould you like to create a new contract for this driver?`,
                ar: `📋 **عقود ${driver.name}**\n\n${driver.name} ليس لديه أي عقود نشطة في النظام.\n\nهل ترغب في إنشاء عقد جديد لهذا السائق؟`,
                hi: `📋 **${driver.name} के अनुबंध**\n\n${driver.name} के पास सिस्टम में कोई सक्रिय अनुबंध नहीं है।\n\nक्या आप इस ड्राइवर के लिए एक नया अनुबंध बनाना चाहते हैं?`,
                ur: `📋 **${driver.name} کے کنٹریکٹس**\n\n${driver.name} کے پاس سسٹم میں کوئی فعال کنٹریکٹ نہیں ہے۔\n\nکیا آپ اس ڈرائیور کے لیے ایک نیا کنٹریکٹ بنانا چاہتے ہیں؟`
              };
              
              return responses[language];
            }
            
            const activeContract = driverContracts.find(c => c.status === 'active');
            if (activeContract) {
              const daysRemaining = getDaysRemaining(activeContract.endDate);
              
              const responses = {
                en: `📋 **Contract for ${driver.name}**\n\n${driver.name} has an active contract (${activeContract.id}).\n\n**Contract Details:**\n• Vehicle: ${activeContract.vehicleId}\n• Start Date: ${activeContract.startDate}\n• End Date: ${activeContract.endDate}\n• Monthly Rent: AED ${activeContract.monthlyRent.toLocaleString()}\n• Deposit: AED ${activeContract.depositAmount.toLocaleString()}\n• Daily KM Limit: ${activeContract.dailyKmLimit} km\n• Days Remaining: ${daysRemaining > 0 ? daysRemaining + ' days' : 'Expired'}\n• Status: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ Expiring soon' : daysRemaining <= 0 ? '🔴 Expired' : '✅ Active'}\n\nWould you like to see contract history for this driver or check another driver?`,
                ar: `📋 **عقد ${driver.name}**\n\n${driver.name} لديه عقد نشط (${activeContract.id}).\n\n**تفاصيل العقد:**\n• المركبة: ${activeContract.vehicleId}\n• تاريخ البدء: ${activeContract.startDate}\n• تاريخ الانتهاء: ${activeContract.endDate}\n• الإيجار الشهري: ${activeContract.monthlyRent.toLocaleString()} درهم\n• التأمين: ${activeContract.depositAmount.toLocaleString()} درهم\n• الحد اليومي للكيلومترات: ${activeContract.dailyKmLimit} كم\n• الأيام المتبقية: ${daysRemaining > 0 ? daysRemaining + ' يوم' : 'منتهي الصلاحية'}\n• الحالة: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ ينتهي قريباً' : daysRemaining <= 0 ? '🔴 منتهي الصلاحية' : '✅ نشط'}\n\nهل ترغب في رؤية تاريخ العقود لهذا السائق أو التحقق من سائق آخر؟`,
                hi: `📋 **${driver.name} का अनुबंध**\n\n${driver.name} का एक सक्रिय अनुबंध (${activeContract.id}) है।\n\n**अनुबंध विवरण:**\n• वाहन: ${activeContract.vehicleId}\n• प्रारंभ तिथि: ${activeContract.startDate}\n• समाप्ति तिथि: ${activeContract.endDate}\n• मासिक किराया: AED ${activeContract.monthlyRent.toLocaleString()}\n• जमा: AED ${activeContract.depositAmount.toLocaleString()}\n• दैनिक KM सीमा: ${activeContract.dailyKmLimit} km\n• शेष दिन: ${daysRemaining > 0 ? daysRemaining + ' दिन' : 'समाप्त'}\n• स्थिति: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ जल्द समाप्त' : daysRemaining <= 0 ? '🔴 समाप्त' : '✅ सक्रिय'}\n\nक्या आप इस ड्राइवर के लिए अनुबंध इतिहास देखना चाहते हैं या किसी अन्य ड्राइवर की जांच करना चाहते हैं?`,
                ur: `📋 **${driver.name} کا کنٹریکٹ**\n\n${driver.name} کا ایک فعال کنٹریکٹ (${activeContract.id}) ہے۔\n\n**کنٹریکٹ کی تفصیلات:**\n• گاڑی: ${activeContract.vehicleId}\n• شروع کی تاریخ: ${activeContract.startDate}\n• اختتامی تاریخ: ${activeContract.endDate}\n• ماہانہ کرایہ: AED ${activeContract.monthlyRent.toLocaleString()}\n• ڈپازٹ: AED ${activeContract.depositAmount.toLocaleString()}\n• روزانہ KM حد: ${activeContract.dailyKmLimit} km\n• باقی دن: ${daysRemaining > 0 ? daysRemaining + ' دن' : 'ختم'}\n• حالت: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ جلد ختم' : daysRemaining <= 0 ? '🔴 ختم' : '✅ فعال'}\n\nکیا آپ اس ڈرائیور کے لیے کنٹریکٹ کی تاریخ دیکھنا چاہتے ہیں یا کسی اور ڈرائیور کو چیک کرنا چاہتے ہیں؟`
              };
              
              return responses[language];
            }
          }
        }
        
        // Show all active contracts
        const activeContracts = mockContractsData.filter(c => c.status === 'active');
        const totalRevenue = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0);
        
        const responses = {
          en: `📋 **Active Contracts Overview**\n\n**Summary:**\n• Total active contracts: ${activeContracts.length}\n• Monthly revenue: AED ${totalRevenue.toLocaleString()}\n• Average rent: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**Contract Details:**\n\n`,
          ar: `📋 **نظرة عامة على العقود النشطة**\n\n**الملخص:**\n• إجمالي العقود النشطة: ${activeContracts.length}\n• الإيرادات الشهرية: ${totalRevenue.toLocaleString()} درهم\n• متوسط الإيجار: ${Math.round(totalRevenue / activeContracts.length).toLocaleString()} درهم\n\n**تفاصيل العقود:**\n\n`,
          hi: `📋 **सक्रिय अनुबंध अवलोकन**\n\n**सारांश:**\n• कुल सक्रिय अनुबंध: ${activeContracts.length}\n• मासिक राजस्व: AED ${totalRevenue.toLocaleString()}\n• औसत किराया: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**अनुबंध विवरण:**\n\n`,
          ur: `📋 **فعال کنٹریکٹس کا جائزہ**\n\n**خلاصہ:**\n• کل فعال کنٹریکٹس: ${activeContracts.length}\n• ماہانہ آمدنی: AED ${totalRevenue.toLocaleString()}\n• اوسط کرایہ: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**کنٹریکٹ کی تفصیلات:**\n\n`
        };
        
        let response = responses[language];
        
        activeContracts.forEach(contract => {
          const driver = mockDriversData.find(d => d.id === contract.driverId);
          const daysRemaining = getDaysRemaining(contract.endDate);
          
          if (language === 'ar') {
            response += `**${driver?.name || 'سائق غير معروف'}** (${contract.id})\n`;
            response += `• المركبة: ${contract.vehicleId}\n`;
            response += `• الإيجار الشهري: ${contract.monthlyRent.toLocaleString()} درهم\n`;
            response += `• الأيام المتبقية: ${daysRemaining > 0 ? daysRemaining + ' يوم' : 'منتهي الصلاحية'}\n`;
            response += `• الحالة: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ ينتهي قريباً' : daysRemaining <= 0 ? '🔴 منتهي الصلاحية' : '✅ نشط'}\n\n`;
          } else if (language === 'hi') {
            response += `**${driver?.name || 'अज्ञात ड्राइवर'}** (${contract.id})\n`;
            response += `• वाहन: ${contract.vehicleId}\n`;
            response += `• मासिक किराया: AED ${contract.monthlyRent.toLocaleString()}\n`;
            response += `• शेष दिन: ${daysRemaining > 0 ? daysRemaining + ' दिन' : 'समाप्त'}\n`;
            response += `• स्थिति: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ जल्द समाप्त' : daysRemaining <= 0 ? '🔴 समाप्त' : '✅ सक्रिय'}\n\n`;
          } else if (language === 'ur') {
            response += `**${driver?.name || 'نامعلوم ڈرائیور'}** (${contract.id})\n`;
            response += `• گاڑی: ${contract.vehicleId}\n`;
            response += `• ماہانہ کرایہ: AED ${contract.monthlyRent.toLocaleString()}\n`;
            response += `• باقی دن: ${daysRemaining > 0 ? daysRemaining + ' دن' : 'ختم'}\n`;
            response += `• حالت: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ جلد ختم' : daysRemaining <= 0 ? '🔴 ختم' : '✅ فعال'}\n\n`;
          } else {
            response += `**${driver?.name || 'Unknown Driver'}** (${contract.id})\n`;
            response += `• Vehicle: ${contract.vehicleId}\n`;
            response += `• Monthly rent: AED ${contract.monthlyRent.toLocaleString()}\n`;
            response += `• Days remaining: ${daysRemaining > 0 ? daysRemaining + ' days' : 'Expired'}\n`;
            response += `• Status: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ Expiring soon' : daysRemaining <= 0 ? '🔴 Expired' : '✅ Active'}\n\n`;
          }
        });

        return response;
      }
    }

    // Default response for unrecognized queries with multilingual support
    const defaultResponses = {
      en: `🤔 **I'm here to help!**\n\nI didn't quite understand that. Here are some things you can ask me:\n\n**Driver Information:**\n• "How many trips did Ahmed complete today?"\n• "Who made the most money today?"\n• "Show me Ahmed's performance score"\n• "Which driver has the best rating?"\n\n**Fleet Management:**\n• "Show me active drivers"\n• "Who has pending fines?"\n• "Show me contracts expiring this month"\n\n**Contract Management:**\n• "Create a new contract"\n• "Show me all contracts"\n\n**Data Import:**\n• "Import drivers" (followed by your data)\n\n💡 **Just ask naturally - I understand conversational language!**`,
      ar: `🤔 **أنا هنا للمساعدة!**\n\nلم أفهم ذلك تماماً. إليك بعض الأشياء التي يمكنك سؤالي عنها:\n\n**معلومات السائق:**\n• "كم عدد الرحلات التي أكملها أحمد اليوم؟"\n• "من حقق أكثر أموال اليوم؟"\n• "أظهر لي درجة أداء أحمد"\n• "أي سائق لديه أفضل تقييم؟"\n\n**إدارة الأسطول:**\n• "أظهر لي السائقين النشطين"\n• "من لديه مخالفات معلقة؟"\n• "أظهر لي العقود التي تنتهي هذا الشهر"\n\n**إدارة العقود:**\n• "إنشاء عقد جديد"\n• "أظهر لي جميع العقود"\n\n**استيراد البيانات:**\n• "استيراد السائقين" (متبوعًا ببياناتك)\n\n💡 **فقط اسأل بشكل طبيعي - أفهم لغة المحادثة!**`,
      hi: `🤔 **मैं मदद के लिए यहां हूं!**\n\nमैं इसे पूरी तरह से नहीं समझ पाया। यहां कुछ चीजें हैं जो आप मुझसे पूछ सकते हैं:\n\n**ड्राइवर जानकारी:**\n• "अहमद ने आज कितनी यात्राएं पूरी कीं?"\n• "आज किसने सबसे ज्यादा पैसे कमाए?"\n• "मुझे अहमद का प्रदर्शन स्कोर दिखाओ"\n• "किस ड्राइवर की सबसे अच्छी रेटिंग है?"\n\n**फ्लीट प्रबंधन:**\n• "मुझे सक्रिय ड्राइवर दिखाओ"\n• "किसके पास लंबित जुर्माने हैं?"\n• "मुझे इस महीने समाप्त होने वाले अनुबंध दिखाओ"\n\n**अनुबंध प्रबंधन:**\n• "एक नया अनुबंध बनाएं"\n• "मुझे सभी अनुबंध दिखाओ"\n\n**डेटा आयात:**\n• "ड्राइवर आयात करें" (उसके बाद आपका डेटा)\n\n💡 **बस स्वाभाविक रूप से पूछें - मैं बातचीत की भाषा समझता हूं!**`,
      ur: `🤔 **میں مدد کے لیے یہاں ہوں!**\n\nمیں اسے پوری طرح نہیں سمجھ پایا۔ یہاں کچھ چیزیں ہیں جو آپ مجھ سے پوچھ سکتے ہیں:\n\n**ڈرائیور کی معلومات:**\n• "احمد نے آج کتنے سفر مکمل کیے؟"\n• "آج کس نے سب سے زیادہ پیسے کمائے؟"\n• "مجھے احمد کا کارکردگی اسکور دکھائیں"\n• "کس ڈرائیور کی سب سے اچھی ریٹنگ ہے؟"\n\n**فلیٹ منیجمنٹ:**\n• "مجھے فعال ڈرائیورز دکھائیں"\n• "کس کے پاس زیر التواء جرمانے ہیں؟"\n• "مجھے اس مہینے ختم ہونے والے کنٹریکٹس دکھائیں"\n\n**کنٹریکٹ منیجمنٹ:**\n• "ایک نیا کنٹریکٹ بنائیں"\n• "مجھے تمام کنٹریکٹس دکھائیں"\n\n**ڈیٹا امپورٹ:**\n• "ڈرائیورز امپورٹ کریں" (اس کے بعد آپ کا ڈیٹا)\n\n💡 **بس فطری طور پر پوچھیں - میں بات چیت کی زبان سمجھتا ہوں!**`
    };

    return defaultResponses[language];
  };

  // Extract contract details from user input
  const extractContractDetails = (input: string) => {
    const details: any = {};
    
    // Extract name patterns
    const namePatterns = [
      /name[:\s]+([A-Za-z\s]+)/i,
      /driver[:\s]+([A-Za-z\s]+)/i,
      /([A-Za-z]+\s+[A-Za-z-]+)/i // General name pattern
    ];
    
    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match) {
        details.driverName = match[1].trim();
        break;
      }
    }

    // Extract Emirates ID
    const idMatch = input.match(/(\d{3}-\d{4}-\d{7}-\d{1})/);
    if (idMatch) {
      details.emiratesId = idMatch[1];
    }

    // Extract vehicle
    const vehicleMatch = input.match(/(DXB-[A-Z]-\d+)/i);
    if (vehicleMatch) {
      details.vehicle = vehicleMatch[1].toUpperCase();
    }

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*months?/i);
    if (durationMatch) {
      details.duration = durationMatch[1];
    }

    // Extract rent amount
    const rentMatch = input.match(/(?:rent|monthly)[:\s]*(?:AED\s*)?(\d+(?:,\d{3})*)/i);
    if (rentMatch) {
      details.monthlyRent = rentMatch[1].replace(/,/g, '');
    }

    // Extract deposit
    const depositMatch = input.match(/(?:deposit|security)[:\s]*(?:AED\s*)?(\d+(?:,\d{3})*)/i);
    if (depositMatch) {
      details.deposit = depositMatch[1].replace(/,/g, '');
    }

    // Extract KM limit
    const kmMatch = input.match(/(\d+)\s*km/i);
    if (kmMatch) {
      details.kmLimit = kmMatch[1];
    }

    return details;
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