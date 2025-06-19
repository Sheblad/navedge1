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
  const [conversationContext, setConversationContext] = useState<string>('');
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

  // Enhanced AI response logic with multilingual support
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Handle contract creation flow
    if (conversationContext === 'creating_contract') {
      const details = extractContractDetails(input);
      
      // Check if we have enough details to create a contract
      if (details.driverName && details.emiratesId && details.vehicle) {
        setConversationContext(''); // Reset context
        
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
        setConversationContext('creating_contract'); // Set context for next messages
        
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
      en: `🤔 **I'm here to help!**\n\nI didn't quite understand that. Here are some things you can ask me:\n\n**Contract Management:**\n• "Make a contract"\n• "Show me contracts"\n• "Which contracts are expiring?"\n• "Show Ahmed's contract"\n\n**Driver Queries:**\n• "Show me active drivers"\n• "Who has the best performance?"\n• "Find Omar Khalil"\n\n**Fine Management:**\n• "Who got a fine?"\n• "Show me pending fines"\n• "Omar's fine details"\n\n**Fleet Operations:**\n• "Switch to taxi mode"\n• "What's my fleet status?"\n• "Show me revenue"\n\n💡 **Just ask naturally - I understand conversational language!**`,
      ar: `🤔 **أنا هنا للمساعدة!**\n\nلم أفهم ذلك تماماً. إليك بعض الأشياء التي يمكنك سؤالي عنها:\n\n**إدارة العقود:**\n• "إنشاء عقد"\n• "أظهر لي العقود"\n• "أي العقود تنتهي؟"\n• "أظهر عقد أحمد"\n\n**استفسارات السائقين:**\n• "أظهر لي السائقين النشطين"\n• "من لديه أفضل أداء؟"\n• "ابحث عن عمر خليل"\n\n**إدارة المخالفات:**\n• "من حصل على مخالفة؟"\n• "أظهر لي المخالفات المعلقة"\n• "تفاصيل مخالفة عمر"\n\n**عمليات الأسطول:**\n• "التبديل إلى وضع التاكسي"\n• "ما هي حالة أسطولي؟"\n• "أظهر لي الإيرادات"\n\n💡 **فقط اسأل بشكل طبيعي - أفهم اللغة المحادثة!**`,
      hi: `🤔 **मैं मदद के लिए यहां हूं!**\n\nमैं इसे पूरी तरह से नहीं समझ पाया। यहां कुछ चीजें हैं जो आप मुझसे पूछ सकते हैं:\n\n**अनुबंध प्रबंधन:**\n• "एक अनुबंध बनाएं"\n• "मुझे अनुबंध दिखाएं"\n• "कौन से अनुबंध समाप्त हो रहे हैं?"\n• "अहमद का अनुबंध दिखाएं"\n\n**ड्राइवर प्रश्न:**\n• "मुझे सक्रिय ड्राइवर दिखाएं"\n• "सबसे अच्छा प्रदर्शन किसका है?"\n• "उमर खलील को खोजें"\n\n**जुर्माना प्रबंधन:**\n• "किसे जुर्माना मिला?"\n• "मुझे लंबित जुर्माने दिखाएं"\n• "उमर के जुर्माने का विवरण"\n\n**फ्लीट संचालन:**\n• "टैक्सी मोड पर स्विच करें"\n• "मेरे फ्लीट की स्थिति क्या है?"\n• "मुझे राजस्व दिखाएं"\n\n💡 **बस स्वाभाविक रूप से पूछें - मैं बातचीत की भाषा समझता हूं!**`,
      ur: `🤔 **میں مدد کے لیے یہاں ہوں!**\n\nمیں اسے پوری طرح نہیں سمجھ پایا۔ یہاں کچھ چیزیں ہیں جو آپ مجھ سے پوچھ سکتے ہیں:\n\n**کنٹریکٹ منیجمنٹ:**\n• "ایک کنٹریکٹ بنائیں"\n• "مجھے کنٹریکٹس دکھائیں"\n• "کون سے کنٹریکٹس ختم ہو رہے ہیں؟"\n• "احمد کا کنٹریکٹ دکھائیں"\n\n**ڈرائیور سوالات:**\n• "مجھے فعال ڈرائیورز دکھائیں"\n• "بہترین کارکردگی کس کی ہے؟"\n• "عمر خلیل کو تلاش کریں"\n\n**جرمانہ منیجمنٹ:**\n• "کسے جرمانہ ملا؟"\n• "مجھے زیر التواء جرمانے دکھائیں"\n• "عمر کے جرمانے کی تفصیلات"\n\n**فلیٹ آپریشنز:**\n• "ٹیکسی موڈ پر سوئچ کریں"\n• "میرے فلیٹ کی حالت کیا ہے؟"\n• "مجھے آمدنی دکھائیں"\n\n💡 **بس فطری طور پر پوچھیں - میں بات چیت کی زبان سمجھتا ہوں!**`
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