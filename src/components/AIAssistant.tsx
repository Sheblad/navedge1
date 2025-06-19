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
    currentTopic?: string;
    timeframe?: 'today' | 'week' | 'month' | 'all';
    lastQuestion?: string;
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

  // Get driver by name or ID
  const getDriverByNameOrId = (nameOrId: string): number | null => {
    // Try to find by ID first
    const idMatch = parseInt(nameOrId);
    if (!isNaN(idMatch)) {
      const driver = mockDriversData.find(d => d.id === idMatch);
      if (driver) return driver.id;
    }
    
    // Try to find by name (case insensitive partial match)
    const nameLower = nameOrId.toLowerCase();
    const driver = mockDriversData.find(d => 
      d.name.toLowerCase().includes(nameLower)
    );
    
    return driver ? driver.id : null;
  };

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

  // Find top performing driver
  const getTopPerformingDriver = () => {
    return mockDriversData.reduce((top, current) => 
      current.performanceScore > top.performanceScore ? current : top
    );
  };

  // Find top earning driver
  const getTopEarningDriver = (timeframe: 'today' | 'week' | 'month' | 'all' = 'all') => {
    if (timeframe === 'today') {
      return mockDriversData.reduce((top, current) => 
        (current.trips_today || 0) > (top.trips_today || 0) ? current : top
      );
    }
    
    return mockDriversData.reduce((top, current) => 
      current.earnings > top.earnings ? current : top
    );
  };

  // Find driver with most trips
  const getTopTripDriver = (timeframe: 'today' | 'week' | 'month' | 'all' = 'all') => {
    if (timeframe === 'today') {
      return mockDriversData.reduce((top, current) => 
        (current.trips_today || 0) > (top.trips_today || 0) ? current : top
      );
    }
    
    return mockDriversData.reduce((top, current) => 
      current.trips > top.trips ? current : top
    );
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

  // Process bulk import from text
  const processBulkImport = (text: string) => {
    try {
      // Split by newlines
      const lines = text.trim().split(/\r?\n/);
      
      // Detect if there's a header row
      const firstLine = lines[0];
      const hasHeader = !firstLine.match(/^\d/) && !firstLine.match(/^[A-Za-z]+\s+[A-Za-z]+/);
      
      // Parse the data
      const startIndex = hasHeader ? 1 : 0;
      const drivers = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma or tab
        const delimiter = line.includes('\t') ? '\t' : ',';
        const fields = line.split(delimiter).map(f => f.trim());
        
        // Need at least name, email, phone
        if (fields.length < 3) continue;
        
        const name = fields[0];
        const email = fields[1];
        const phone = fields[2];
        const vehicleId = fields.length > 3 ? fields[3] : undefined;
        
        if (name && email && phone) {
          drivers.push({
            name,
            email,
            phone,
            vehicleId,
            avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
            status: 'active',
            trips: 0,
            earnings: 0,
            performanceScore: 85,
            joinDate: new Date().toISOString().split('T')[0]
          });
        }
      }
      
      return drivers;
    } catch (error) {
      console.error('Error processing bulk import:', error);
      return null;
    }
  };

  // Extract timeframe from query
  const extractTimeframe = (query: string): 'today' | 'week' | 'month' | 'all' => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('today') || lowerQuery.includes('now') || 
        lowerQuery.includes('current') || lowerQuery.includes('اليوم') || 
        lowerQuery.includes('आज') || lowerQuery.includes('آج')) {
      return 'today';
    }
    
    if (lowerQuery.includes('week') || lowerQuery.includes('أسبوع') || 
        lowerQuery.includes('सप्ताह') || lowerQuery.includes('ہفتہ')) {
      return 'week';
    }
    
    if (lowerQuery.includes('month') || lowerQuery.includes('شهر') || 
        lowerQuery.includes('महीना') || lowerQuery.includes('مہینہ')) {
      return 'month';
    }
    
    return 'all';
  };

  // Extract driver name from query
  const extractDriverName = (query: string): string | null => {
    // Common patterns to extract driver names
    const patterns = [
      // English patterns
      /(?:about|for|of|by|from|to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
      /([A-Za-z]+(?:\s+[A-Za-z]+)?)'s/i,
      /([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:has|have|is|did|earned)/i,
      
      // Arabic patterns
      /(?:عن|ل|من|إلى)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
      
      // Hindi patterns
      /(?:के बारे में|के लिए|से|को)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
      
      // Urdu patterns
      /(?:کے بارے میں|کے لیے|سے|کو)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const potentialName = match[1].trim();
        
        // Check if this is actually a driver name
        const driverId = getDriverByNameOrId(potentialName);
        if (driverId !== null) {
          return potentialName;
        }
      }
    }
    
    return null;
  };

  // Enhanced AI response logic with multilingual support and context awareness
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    const timeframe = extractTimeframe(input);
    
    // Update conversation context with timeframe
    setConversationContext(prev => ({
      ...prev,
      timeframe,
      lastQuestion: input
    }));

    // Check for bulk import command
    if (lowerInput.startsWith('import drivers') || 
        lowerInput.startsWith('استيراد السائقين') || 
        lowerInput.startsWith('ड्राइवर आयात') || 
        lowerInput.startsWith('ڈرائیورز امپورٹ')) {
      
      const importText = input.substring(input.indexOf('\n') + 1);
      if (importText.trim()) {
        const drivers = processBulkImport(importText);
        if (drivers && drivers.length > 0) {
          return `✅ **Bulk Import Successful**\n\nI've processed your data and found ${drivers.length} valid driver records. Here's a summary:\n\n${drivers.slice(0, 5).map(d => `• ${d.name} (${d.email})`).join('\n')}${drivers.length > 5 ? `\n• ...and ${drivers.length - 5} more` : ''}\n\nTo complete the import, go to **Drivers** → **Bulk Import** and paste this same data.`;
        } else {
          return `❌ **Import Failed**\n\nI couldn't process the data you provided. Please make sure your data is in the correct format with at least name, email, and phone columns. The data should be separated by commas or tabs.`;
        }
      } else {
        return `📋 **Bulk Import Instructions**\n\nTo import multiple drivers at once, please provide your data in the following format:\n\n\`\`\`\nName, Email, Phone, Vehicle ID (optional)\nJohn Smith, john@example.com, +971501234567, DXB-G-12345\nSarah Johnson, sarah@example.com, +971502345678, DXB-G-23456\n\`\`\`\n\nYou can copy this data directly from Excel or a CSV file. Just type "import drivers" followed by your data.`;
      }
    }

    // Handle contract creation flow
    if (conversationContext.currentTopic === 'creating_contract') {
      const details = extractContractDetails(input);
      
      // Check if we have enough details to create a contract
      if (details.driverName && details.emiratesId && details.vehicle) {
        setConversationContext(prev => ({ ...prev, currentTopic: undefined })); // Reset context
        
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

    // Extract driver name from query for context
    const driverName = extractDriverName(input);
    let driverId: number | null = null;
    
    if (driverName) {
      driverId = getDriverByNameOrId(driverName);
      if (driverId) {
        // Update conversation context with current driver
        setConversationContext(prev => ({
          ...prev,
          currentDriver: driverId
        }));
      }
    }
    
    // If no driver name in query but we have a driver in context, use that
    // UNLESS the query is asking about "who" or comparing drivers
    const isComparativeQuery = lowerInput.includes('who') || 
                              lowerInput.includes('which') || 
                              lowerInput.includes('top') || 
                              lowerInput.includes('best') || 
                              lowerInput.includes('most') ||
                              lowerInput.includes('من') ||
                              lowerInput.includes('أي') ||
                              lowerInput.includes('أفضل') ||
                              lowerInput.includes('कौन') ||
                              lowerInput.includes('कौनसा') ||
                              lowerInput.includes('सबसे') ||
                              lowerInput.includes('کون') ||
                              lowerInput.includes('کونسا') ||
                              lowerInput.includes('سب سے');
    
    if (!driverId && conversationContext.currentDriver && !isComparativeQuery) {
      driverId = conversationContext.currentDriver;
    }

    // Contract-related queries
    if (lowerInput.includes('contract') || lowerInput.includes('make contract') || lowerInput.includes('create contract') || lowerInput.includes('new contract') || lowerInput.includes('generate contract') ||
        lowerInput.includes('عقد') || lowerInput.includes('إنشاء عقد') || lowerInput.includes('عقد جديد') ||
        lowerInput.includes('अनुबंध') || lowerInput.includes('नया अनुबंध') || lowerInput.includes('अनुबंध बनाएं') ||
        lowerInput.includes('کنٹریکٹ') || lowerInput.includes('نیا کنٹریکٹ') || lowerInput.includes('کنٹریکٹ بنائیں')) {
      
      // Contract creation/generation
      if (lowerInput.includes('make') || lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('generate') ||
          lowerInput.includes('إنشاء') || lowerInput.includes('جديد') ||
          lowerInput.includes('बनाएं') || lowerInput.includes('नया') ||
          lowerInput.includes('بنائیں') || lowerInput.includes('نیا')) {
        
        setConversationContext(prev => ({ ...prev, currentTopic: 'creating_contract' })); // Set context for next messages
        
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
        
        // If a specific driver is mentioned, show their contracts
        if (driverId) {
          const driverContracts = mockContractsData.filter(c => c.driverId === driverId);
          
          if (driverContracts.length === 0) {
            const responses = {
              en: `📋 **No Contracts Found**\n\nI couldn't find any contracts for ${getDriverName(driverId)}. Would you like to create a new contract for this driver?`,
              ar: `📋 **لم يتم العثور على عقود**\n\nلم أتمكن من العثور على أي عقود لـ ${getDriverName(driverId)}. هل ترغب في إنشاء عقد جديد لهذا السائق؟`,
              hi: `📋 **कोई अनुबंध नहीं मिला**\n\nमुझे ${getDriverName(driverId)} के लिए कोई अनुबंध नहीं मिला। क्या आप इस ड्राइवर के लिए एक नया अनुबंध बनाना चाहते हैं?`,
              ur: `📋 **کوئی کنٹریکٹ نہیں ملا**\n\nمجھے ${getDriverName(driverId)} کے لیے کوئی کنٹریکٹ نہیں ملا۔ کیا آپ اس ڈرائیور کے لیے ایک نیا کنٹریکٹ بنانا چاہتے ہیں؟`
            };
            
            return responses[language];
          }
          
          const responses = {
            en: `📋 **Contracts for ${getDriverName(driverId)}**\n\n`,
            ar: `📋 **عقود ${getDriverName(driverId)}**\n\n`,
            hi: `📋 **${getDriverName(driverId)} के अनुबंध**\n\n`,
            ur: `📋 **${getDriverName(driverId)} کے کنٹریکٹس**\n\n`
          };
          
          let response = responses[language];
          
          driverContracts.forEach(contract => {
            const daysRemaining = getDaysRemaining(contract.endDate);
            
            if (language === 'ar') {
              response += `**${contract.id}**\n`;
              response += `• المركبة: ${contract.vehicleId}\n`;
              response += `• الإيجار الشهري: ${contract.monthlyRent.toLocaleString()} درهم\n`;
              response += `• الأيام المتبقية: ${daysRemaining > 0 ? daysRemaining + ' يوم' : 'منتهي الصلاحية'}\n`;
              response += `• الحالة: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ ينتهي قريباً' : daysRemaining <= 0 ? '🔴 منتهي الصلاحية' : '✅ نشط'}\n\n`;
            } else if (language === 'hi') {
              response += `**${contract.id}**\n`;
              response += `• वाहन: ${contract.vehicleId}\n`;
              response += `• मासिक किराया: AED ${contract.monthlyRent.toLocaleString()}\n`;
              response += `• शेष दिन: ${daysRemaining > 0 ? daysRemaining + ' दिन' : 'समाप्त'}\n`;
              response += `• स्थिति: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ जल्द समाप्त' : daysRemaining <= 0 ? '🔴 समाप्त' : '✅ सक्रिय'}\n\n`;
            } else if (language === 'ur') {
              response += `**${contract.id}**\n`;
              response += `• گاڑی: ${contract.vehicleId}\n`;
              response += `• ماہانہ کرایہ: AED ${contract.monthlyRent.toLocaleString()}\n`;
              response += `• باقی دن: ${daysRemaining > 0 ? daysRemaining + ' دن' : 'ختم'}\n`;
              response += `• حالت: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ جلد ختم' : daysRemaining <= 0 ? '🔴 ختم' : '✅ فعال'}\n\n`;
            } else {
              response += `**${contract.id}**\n`;
              response += `• Vehicle: ${contract.vehicleId}\n`;
              response += `• Monthly rent: AED ${contract.monthlyRent.toLocaleString()}\n`;
              response += `• Days remaining: ${daysRemaining > 0 ? daysRemaining + ' days' : 'Expired'}\n`;
              response += `• Status: ${daysRemaining < 30 && daysRemaining > 0 ? '⚠️ Expiring soon' : daysRemaining <= 0 ? '🔴 Expired' : '✅ Active'}\n\n`;
            }
          });
          
          return response;
        }
        
        // Otherwise show all active contracts
        const activeContracts = mockContractsData.filter(c => c.status === 'active');
        const totalRevenue = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0);
        
        const responses = {
          en: `📋 **Active Contracts Overview**\n\n**Summary:**\n• Total active contracts: ${activeContracts.length}\n• Monthly revenue: AED ${totalRevenue.toLocaleString()}\n• Average rent: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**Contract Details:**\n\n`,
          ar: `📋 **نظرة عامة على العقود النشطة**\n\n**الملخص:**\n• إجمالي العقود النشطة: ${activeContracts.length}\n• الإيرادات الشهرية: ${totalRevenue.toLocaleString()} درهم\n• متوسط الإيجار: ${Math.round(totalRevenue / activeContracts.length).toLocaleString()} درهم\n\n**تفاصيل العقود:**\n\n`,
          hi: `📋 **सक्रिय अनुबंध अवलोकन**\n\n**सारांश:**\n• कुल सक्रिय अनुबंध: ${activeContracts.length}\n• मासिक राजस्व: AED ${totalRevenue.toLocaleString()}\n• औसत किराया: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**अनुबंध विवरण:**\n\n`,
          ur: `📋 **فعال کنٹریکٹس کا جائزہ**\n\n**خلاصہ:**\n• کل فعال کنٹریکٹس: ${activeContracts.length}\n• ماہانہ آمدنی: AED ${totalRevenue.toLocaleString()}\n• اوسط کرایہ: AED ${Math.round(totalRevenue / activeContracts.length).toLocaleString()}\n\n**کنٹریکٹ کی تفصیلات:**\n\n`
        };
        
        let response = responses[language];
        
        activeContracts.slice(0, 5).forEach(contract => {
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
        
        if (activeContracts.length > 5) {
          const responses = {
            en: `...and ${activeContracts.length - 5} more contracts.`,
            ar: `...و ${activeContracts.length - 5} عقود أخرى.`,
            hi: `...और ${activeContracts.length - 5} अधिक अनुबंध.`,
            ur: `...اور ${activeContracts.length - 5} مزید کنٹریکٹس.`
          };
          
          response += responses[language];
        }
        
        return response;
      }
    }

    // Driver performance queries
    if (lowerInput.includes('performance') || lowerInput.includes('score') || lowerInput.includes('rating') ||
        lowerInput.includes('أداء') || lowerInput.includes('تقييم') ||
        lowerInput.includes('प्रदर्शन') || lowerInput.includes('स्कोर') || lowerInput.includes('रेटिंग') ||
        lowerInput.includes('کارکردگی') || lowerInput.includes('اسکور') || lowerInput.includes('ریٹنگ')) {
      
      // If asking about best performer
      if (lowerInput.includes('best') || lowerInput.includes('top') || lowerInput.includes('highest') ||
          lowerInput.includes('أفضل') || lowerInput.includes('أعلى') ||
          lowerInput.includes('सबसे अच्छा') || lowerInput.includes('उच्चतम') ||
          lowerInput.includes('بہترین') || lowerInput.includes('اعلی ترین')) {
        
        const topDriver = getTopPerformingDriver();
        
        const responses = {
          en: `🏆 **Top Performing Driver**\n\n**${topDriver.name}** currently has the highest performance score at **${topDriver.performanceScore}%**.\n\n**Performance Details:**\n• Total trips: ${topDriver.trips}\n• Total earnings: $${topDriver.earnings.toLocaleString()}\n• Status: ${topDriver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n• Vehicle: ${topDriver.vehicleId || 'Not assigned'}\n\nWould you like to see the full performance report for this driver?`,
          ar: `🏆 **أفضل سائق أداءً**\n\n**${topDriver.name}** لديه حالياً أعلى درجة أداء بنسبة **${topDriver.performanceScore}%**.\n\n**تفاصيل الأداء:**\n• إجمالي الرحلات: ${topDriver.trips}\n• إجمالي الأرباح: $${topDriver.earnings.toLocaleString()}\n• الحالة: ${topDriver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n• المركبة: ${topDriver.vehicleId || 'غير مخصصة'}\n\nهل ترغب في رؤية تقرير الأداء الكامل لهذا السائق؟`,
          hi: `🏆 **शीर्ष प्रदर्शन करने वाला ड्राइवर**\n\n**${topDriver.name}** वर्तमान में **${topDriver.performanceScore}%** के साथ सबसे अधिक प्रदर्शन स्कोर रखता है।\n\n**प्रदर्शन विवरण:**\n• कुल यात्राएं: ${topDriver.trips}\n• कुल कमाई: $${topDriver.earnings.toLocaleString()}\n• स्थिति: ${topDriver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n• वाहन: ${topDriver.vehicleId || 'असाइन नहीं किया गया'}\n\nक्या आप इस ड्राइवर के लिए पूर्ण प्रदर्शन रिपोर्ट देखना चाहते हैं?`,
          ur: `🏆 **بہترین کارکردگی والا ڈرائیور**\n\n**${topDriver.name}** فی الحال **${topDriver.performanceScore}%** کے ساتھ سب سے زیادہ کارکردگی اسکور رکھتا ہے۔\n\n**کارکردگی کی تفصیلات:**\n• کل سفر: ${topDriver.trips}\n• کل کمائی: $${topDriver.earnings.toLocaleString()}\n• حالت: ${topDriver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n• گاڑی: ${topDriver.vehicleId || 'تفویض نہیں کی گئی'}\n\nکیا آپ اس ڈرائیور کے لیے مکمل کارکردگی رپورٹ دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver's performance
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (!driver) {
          const responses = {
            en: `❌ **Driver Not Found**\n\nI couldn't find a driver with that name in your fleet. Please check the name and try again.`,
            ar: `❌ **لم يتم العثور على السائق**\n\nلم أتمكن من العثور على سائق بهذا الاسم في أسطولك. يرجى التحقق من الاسم والمحاولة مرة أخرى.`,
            hi: `❌ **ड्राइवर नहीं मिला**\n\nमुझे आपके फ्लीट में उस नाम का ड्राइवर नहीं मिला। कृपया नाम की जांच करें और पुनः प्रयास करें।`,
            ur: `❌ **ڈرائیور نہیں ملا**\n\nمجھے آپ کے فلیٹ میں اس نام کا ڈرائیور نہیں ملا۔ براہ کرم نام چیک کریں اور دوبارہ کوشش کریں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `📊 **Performance Report: ${driver.name}**\n\n**Performance Score:** ${driver.performanceScore}% ${driver.performanceScore >= 90 ? '(Excellent)' : driver.performanceScore >= 80 ? '(Good)' : driver.performanceScore >= 70 ? '(Average)' : '(Needs Improvement)'}\n\n**Activity Metrics:**\n• Total trips: ${driver.trips}\n• Trips today: ${driver.trips_today || 0}\n• Total earnings: $${driver.earnings.toLocaleString()}\n• Earnings today: $${driver.earnings_today || 0}\n• Status: ${driver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n\n**Vehicle Assignment:**\n• Vehicle ID: ${driver.vehicleId || 'Not assigned'}\n\nWould you like to see more details about this driver?`,
          ar: `📊 **تقرير الأداء: ${driver.name}**\n\n**درجة الأداء:** ${driver.performanceScore}% ${driver.performanceScore >= 90 ? '(ممتاز)' : driver.performanceScore >= 80 ? '(جيد)' : driver.performanceScore >= 70 ? '(متوسط)' : '(يحتاج إلى تحسين)'}\n\n**مقاييس النشاط:**\n• إجمالي الرحلات: ${driver.trips}\n• رحلات اليوم: ${driver.trips_today || 0}\n• إجمالي الأرباح: $${driver.earnings.toLocaleString()}\n• أرباح اليوم: $${driver.earnings_today || 0}\n• الحالة: ${driver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n\n**تخصيص المركبة:**\n• معرف المركبة: ${driver.vehicleId || 'غير مخصصة'}\n\nهل ترغب في رؤية المزيد من التفاصيل حول هذا السائق؟`,
          hi: `📊 **प्रदर्शन रिपोर्ट: ${driver.name}**\n\n**प्रदर्शन स्कोर:** ${driver.performanceScore}% ${driver.performanceScore >= 90 ? '(उत्कृष्ट)' : driver.performanceScore >= 80 ? '(अच्छा)' : driver.performanceScore >= 70 ? '(औसत)' : '(सुधार की आवश्यकता है)'}\n\n**गतिविधि मेट्रिक्स:**\n• कुल यात्राएं: ${driver.trips}\n• आज की यात्राएं: ${driver.trips_today || 0}\n• कुल कमाई: $${driver.earnings.toLocaleString()}\n• आज की कमाई: $${driver.earnings_today || 0}\n• स्थिति: ${driver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n\n**वाहन असाइनमेंट:**\n• वाहन आईडी: ${driver.vehicleId || 'असाइन नहीं किया गया'}\n\nक्या आप इस ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `📊 **کارکردگی رپورٹ: ${driver.name}**\n\n**کارکردگی اسکور:** ${driver.performanceScore}% ${driver.performanceScore >= 90 ? '(بہترین)' : driver.performanceScore >= 80 ? '(اچھا)' : driver.performanceScore >= 70 ? '(اوسط)' : '(بہتری کی ضرورت ہے)'}\n\n**سرگرمی کے اعداد و شمار:**\n• کل سفر: ${driver.trips}\n• آج کے سفر: ${driver.trips_today || 0}\n• کل کمائی: $${driver.earnings.toLocaleString()}\n• آج کی کمائی: $${driver.earnings_today || 0}\n• حالت: ${driver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n\n**گاڑی کی تفویض:**\n• گاڑی ID: ${driver.vehicleId || 'تفویض نہیں کی گئی'}\n\nکیا آپ اس ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about overall fleet performance
      const avgPerformance = mockDriversData.reduce((sum, d) => sum + d.performanceScore, 0) / mockDriversData.length;
      const activeDrivers = mockDriversData.filter(d => d.status === 'active').length;
      
      const responses = {
        en: `📊 **Fleet Performance Overview**\n\n**Overall Performance:** ${avgPerformance.toFixed(1)}% ${avgPerformance >= 90 ? '(Excellent)' : avgPerformance >= 80 ? '(Good)' : avgPerformance >= 70 ? '(Average)' : '(Needs Improvement)'}\n\n**Fleet Metrics:**\n• Total drivers: ${mockDriversData.length}\n• Active drivers: ${activeDrivers}\n• Inactive drivers: ${mockDriversData.length - activeDrivers}\n\n**Top Performers:**\n${mockDriversData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.performanceScore}%`).join('\n')}\n\n**Drivers Needing Attention:**\n${mockDriversData.filter(d => d.performanceScore < 80).map(d => `• ${d.name} - ${d.performanceScore}%`).join('\n') || 'None at this time'}\n\nWould you like to see detailed performance reports for any specific driver?`,
        ar: `📊 **نظرة عامة على أداء الأسطول**\n\n**الأداء العام:** ${avgPerformance.toFixed(1)}% ${avgPerformance >= 90 ? '(ممتاز)' : avgPerformance >= 80 ? '(جيد)' : avgPerformance >= 70 ? '(متوسط)' : '(يحتاج إلى تحسين)'}\n\n**مقاييس الأسطول:**\n• إجمالي السائقين: ${mockDriversData.length}\n• السائقون النشطون: ${activeDrivers}\n• السائقون غير النشطين: ${mockDriversData.length - activeDrivers}\n\n**أفضل المؤدين:**\n${mockDriversData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.performanceScore}%`).join('\n')}\n\n**السائقون الذين يحتاجون إلى اهتمام:**\n${mockDriversData.filter(d => d.performanceScore < 80).map(d => `• ${d.name} - ${d.performanceScore}%`).join('\n') || 'لا يوجد حالياً'}\n\nهل ترغب في رؤية تقارير أداء مفصلة لأي سائق محدد؟`,
        hi: `📊 **फ्लीट प्रदर्शन अवलोकन**\n\n**समग्र प्रदर्शन:** ${avgPerformance.toFixed(1)}% ${avgPerformance >= 90 ? '(उत्कृष्ट)' : avgPerformance >= 80 ? '(अच्छा)' : avgPerformance >= 70 ? '(औसत)' : '(सुधार की आवश्यकता है)'}\n\n**फ्लीट मेट्रिक्स:**\n• कुल ड्राइवर: ${mockDriversData.length}\n• सक्रिय ड्राइवर: ${activeDrivers}\n• निष्क्रिय ड्राइवर: ${mockDriversData.length - activeDrivers}\n\n**शीर्ष प्रदर्शनकर्ता:**\n${mockDriversData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.performanceScore}%`).join('\n')}\n\n**ध्यान देने की आवश्यकता वाले ड्राइवर:**\n${mockDriversData.filter(d => d.performanceScore < 80).map(d => `• ${d.name} - ${d.performanceScore}%`).join('\n') || 'इस समय कोई नहीं'}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए विस्तृत प्रदर्शन रिपोर्ट देखना चाहते हैं?`,
        ur: `📊 **فلیٹ کارکردگی کا جائزہ**\n\n**مجموعی کارکردگی:** ${avgPerformance.toFixed(1)}% ${avgPerformance >= 90 ? '(بہترین)' : avgPerformance >= 80 ? '(اچھا)' : avgPerformance >= 70 ? '(اوسط)' : '(بہتری کی ضرورت ہے)'}\n\n**فلیٹ کے اعداد و شمار:**\n• کل ڈرائیورز: ${mockDriversData.length}\n• فعال ڈرائیورز: ${activeDrivers}\n• غیر فعال ڈرائیورز: ${mockDriversData.length - activeDrivers}\n\n**بہترین کارکردگی والے:**\n${mockDriversData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.performanceScore}%`).join('\n')}\n\n**توجہ کی ضرورت والے ڈرائیورز:**\n${mockDriversData.filter(d => d.performanceScore < 80).map(d => `• ${d.name} - ${d.performanceScore}%`).join('\n') || 'اس وقت کوئی نہیں'}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے تفصیلی کارکردگی رپورٹس دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Earnings/revenue queries
    if (lowerInput.includes('earning') || lowerInput.includes('revenue') || lowerInput.includes('money') || lowerInput.includes('income') ||
        lowerInput.includes('أرباح') || lowerInput.includes('إيرادات') || lowerInput.includes('دخل') ||
        lowerInput.includes('कमाई') || lowerInput.includes('राजस्व') || lowerInput.includes('आय') ||
        lowerInput.includes('کمائی') || lowerInput.includes('آمدنی') || lowerInput.includes('ریونیو')) {
      
      // If asking about who earned the most
      if (lowerInput.includes('who') || lowerInput.includes('which') || lowerInput.includes('top') || lowerInput.includes('most') ||
          lowerInput.includes('من') || lowerInput.includes('أي') || lowerInput.includes('أكثر') ||
          lowerInput.includes('कौन') || lowerInput.includes('कौनसा') || lowerInput.includes('सबसे अधिक') ||
          lowerInput.includes('کون') || lowerInput.includes('کونسا') || lowerInput.includes('سب سے زیادہ')) {
        
        const topDriver = getTopEarningDriver(timeframe);
        
        const responses = {
          en: `💰 **Top Earning Driver**\n\n**${topDriver.name}** has earned the most with **$${topDriver.earnings.toLocaleString()}** ${timeframe === 'today' ? 'today' : 'overall'}.\n\n**Earnings Details:**\n• Total trips: ${topDriver.trips}\n• Trips today: ${topDriver.trips_today || 0}\n• Earnings today: $${topDriver.earnings_today || 0}\n• Status: ${topDriver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n• Vehicle: ${topDriver.vehicleId || 'Not assigned'}\n\nWould you like to see the earnings breakdown for this driver?`,
          ar: `💰 **أعلى سائق من حيث الأرباح**\n\n**${topDriver.name}** حقق أعلى أرباح بقيمة **$${topDriver.earnings.toLocaleString()}** ${timeframe === 'today' ? 'اليوم' : 'بشكل عام'}.\n\n**تفاصيل الأرباح:**\n• إجمالي الرحلات: ${topDriver.trips}\n• رحلات اليوم: ${topDriver.trips_today || 0}\n• أرباح اليوم: $${topDriver.earnings_today || 0}\n• الحالة: ${topDriver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n• المركبة: ${topDriver.vehicleId || 'غير مخصصة'}\n\nهل ترغب في رؤية تفصيل الأرباح لهذا السائق؟`,
          hi: `💰 **सबसे अधिक कमाई करने वाला ड्राइवर**\n\n**${topDriver.name}** ने **$${topDriver.earnings.toLocaleString()}** के साथ सबसे अधिक कमाई की है ${timeframe === 'today' ? 'आज' : 'कुल मिलाकर'}.\n\n**कमाई विवरण:**\n• कुल यात्राएं: ${topDriver.trips}\n• आज की यात्राएं: ${topDriver.trips_today || 0}\n• आज की कमाई: $${topDriver.earnings_today || 0}\n• स्थिति: ${topDriver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n• वाहन: ${topDriver.vehicleId || 'असाइन नहीं किया गया'}\n\nक्या आप इस ड्राइवर के लिए कमाई का विवरण देखना चाहते हैं?`,
          ur: `💰 **سب سے زیادہ کمانے والا ڈرائیور**\n\n**${topDriver.name}** نے **$${topDriver.earnings.toLocaleString()}** کے ساتھ سب سے زیادہ کمایا ہے ${timeframe === 'today' ? 'آج' : 'مجموعی طور پر'}.\n\n**کمائی کی تفصیلات:**\n• کل سفر: ${topDriver.trips}\n• آج کے سفر: ${topDriver.trips_today || 0}\n• آج کی کمائی: $${topDriver.earnings_today || 0}\n• حالت: ${topDriver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n• گاڑی: ${topDriver.vehicleId || 'تفویض نہیں کی گئی'}\n\nکیا آپ اس ڈرائیور کے لیے کمائی کی تفصیل دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver's earnings
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (!driver) {
          const responses = {
            en: `❌ **Driver Not Found**\n\nI couldn't find a driver with that name in your fleet. Please check the name and try again.`,
            ar: `❌ **لم يتم العثور على السائق**\n\nلم أتمكن من العثور على سائق بهذا الاسم في أسطولك. يرجى التحقق من الاسم والمحاولة مرة أخرى.`,
            hi: `❌ **ड्राइवर नहीं मिला**\n\nमुझे आपके फ्लीट में उस नाम का ड्राइवर नहीं मिला। कृपया नाम की जांच करें और पुनः प्रयास करें।`,
            ur: `❌ **ڈرائیور نہیں ملا**\n\nمجھے آپ کے فلیٹ میں اس نام کا ڈرائیور نہیں ملا۔ براہ کرم نام چیک کریں اور دوبارہ کوشش کریں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `💰 **Earnings Report: ${driver.name}**\n\n**Total Earnings:** $${driver.earnings.toLocaleString()}\n**Earnings Today:** $${driver.earnings_today || 0}\n\n**Activity Metrics:**\n• Total trips: ${driver.trips}\n• Trips today: ${driver.trips_today || 0}\n• Status: ${driver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n\n**Earnings Breakdown:**\n• Average per trip: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• Estimated monthly: $${Math.round(driver.earnings * 30 / Math.max(1, (new Date().getDate()))).toLocaleString()}\n\nWould you like to see more details about this driver's performance?`,
          ar: `💰 **تقرير الأرباح: ${driver.name}**\n\n**إجمالي الأرباح:** $${driver.earnings.toLocaleString()}\n**أرباح اليوم:** $${driver.earnings_today || 0}\n\n**مقاييس النشاط:**\n• إجمالي الرحلات: ${driver.trips}\n• رحلات اليوم: ${driver.trips_today || 0}\n• الحالة: ${driver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n\n**تفصيل الأرباح:**\n• المتوسط لكل رحلة: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• التقدير الشهري: $${Math.round(driver.earnings * 30 / Math.max(1, (new Date().getDate()))).toLocaleString()}\n\nهل ترغب في رؤية المزيد من التفاصيل حول أداء هذا السائق؟`,
          hi: `💰 **कमाई रिपोर्ट: ${driver.name}**\n\n**कुल कमाई:** $${driver.earnings.toLocaleString()}\n**आज की कमाई:** $${driver.earnings_today || 0}\n\n**गतिविधि मेट्रिक्स:**\n• कुल यात्राएं: ${driver.trips}\n• आज की यात्राएं: ${driver.trips_today || 0}\n• स्थिति: ${driver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n\n**कमाई विवरण:**\n• प्रति यात्रा औसत: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• अनुमानित मासिक: $${Math.round(driver.earnings * 30 / Math.max(1, (new Date().getDate()))).toLocaleString()}\n\nक्या आप इस ड्राइवर के प्रदर्शन के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `💰 **کمائی کی رپورٹ: ${driver.name}**\n\n**کل کمائی:** $${driver.earnings.toLocaleString()}\n**آج کی کمائی:** $${driver.earnings_today || 0}\n\n**سرگرمی کے اعداد و شمار:**\n• کل سفر: ${driver.trips}\n• آج کے سفر: ${driver.trips_today || 0}\n• حالت: ${driver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n\n**کمائی کی تفصیل:**\n• فی سفر اوسط: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• تخمینہ ماہانہ: $${Math.round(driver.earnings * 30 / Math.max(1, (new Date().getDate()))).toLocaleString()}\n\nکیا آپ اس ڈرائیور کی کارکردگی کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about overall fleet earnings
      const totalEarnings = mockDriversData.reduce((sum, d) => sum + d.earnings, 0);
      const totalEarningsToday = mockDriversData.reduce((sum, d) => sum + (d.earnings_today || 0), 0);
      const avgEarningsPerDriver = totalEarnings / mockDriversData.length;
      
      const responses = {
        en: `💰 **Fleet Earnings Overview**\n\n**Total Earnings:** $${totalEarnings.toLocaleString()}\n**Earnings Today:** $${totalEarningsToday.toLocaleString()}\n**Average per Driver:** $${Math.round(avgEarningsPerDriver).toLocaleString()}\n\n**Top Earning Drivers:**\n${mockDriversData.sort((a, b) => b.earnings - a.earnings).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - $${d.earnings.toLocaleString()}`).join('\n')}\n\n**Earnings by Status:**\n• Active drivers: $${mockDriversData.filter(d => d.status === 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n• Inactive drivers: $${mockDriversData.filter(d => d.status !== 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n\nWould you like to see a detailed earnings report for any specific driver?`,
        ar: `💰 **نظرة عامة على أرباح الأسطول**\n\n**إجمالي الأرباح:** $${totalEarnings.toLocaleString()}\n**أرباح اليوم:** $${totalEarningsToday.toLocaleString()}\n**المتوسط لكل سائق:** $${Math.round(avgEarningsPerDriver).toLocaleString()}\n\n**أعلى السائقين من حيث الأرباح:**\n${mockDriversData.sort((a, b) => b.earnings - a.earnings).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - $${d.earnings.toLocaleString()}`).join('\n')}\n\n**الأرباح حسب الحالة:**\n• السائقون النشطون: $${mockDriversData.filter(d => d.status === 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n• السائقون غير النشطين: $${mockDriversData.filter(d => d.status !== 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n\nهل ترغب في رؤية تقرير أرباح مفصل لأي سائق محدد؟`,
        hi: `💰 **फ्लीट कमाई अवलोकन**\n\n**कुल कमाई:** $${totalEarnings.toLocaleString()}\n**आज की कमाई:** $${totalEarningsToday.toLocaleString()}\n**प्रति ड्राइवर औसत:** $${Math.round(avgEarningsPerDriver).toLocaleString()}\n\n**शीर्ष कमाई करने वाले ड्राइवर:**\n${mockDriversData.sort((a, b) => b.earnings - a.earnings).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - $${d.earnings.toLocaleString()}`).join('\n')}\n\n**स्थिति के अनुसार कमाई:**\n• सक्रिय ड्राइवर: $${mockDriversData.filter(d => d.status === 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n• निष्क्रिय ड्राइवर: $${mockDriversData.filter(d => d.status !== 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए विस्तृत कमाई रिपोर्ट देखना चाहते हैं?`,
        ur: `💰 **فلیٹ کمائی کا جائزہ**\n\n**کل کمائی:** $${totalEarnings.toLocaleString()}\n**آج کی کمائی:** $${totalEarningsToday.toLocaleString()}\n**فی ڈرائیور اوسط:** $${Math.round(avgEarningsPerDriver).toLocaleString()}\n\n**سب سے زیادہ کمانے والے ڈرائیورز:**\n${mockDriversData.sort((a, b) => b.earnings - a.earnings).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - $${d.earnings.toLocaleString()}`).join('\n')}\n\n**حالت کے مطابق کمائی:**\n• فعال ڈرائیورز: $${mockDriversData.filter(d => d.status === 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n• غیر فعال ڈرائیورز: $${mockDriversData.filter(d => d.status !== 'active').reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے تفصیلی کمائی رپورٹ دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Trips/activity queries
    if (lowerInput.includes('trip') || lowerInput.includes('activity') || lowerInput.includes('completed') ||
        lowerInput.includes('رحلة') || lowerInput.includes('نشاط') || lowerInput.includes('مكتملة') ||
        lowerInput.includes('यात्रा') || lowerInput.includes('गतिविधि') || lowerInput.includes('पूर्ण') ||
        lowerInput.includes('سفر') || lowerInput.includes('سرگرمی') || lowerInput.includes('مکمل')) {
      
      // If asking about who completed the most trips
      if (lowerInput.includes('who') || lowerInput.includes('which') || lowerInput.includes('most') ||
          lowerInput.includes('من') || lowerInput.includes('أي') || lowerInput.includes('أكثر') ||
          lowerInput.includes('कौन') || lowerInput.includes('कौनसा') || lowerInput.includes('सबसे अधिक') ||
          lowerInput.includes('کون') || lowerInput.includes('کونسا') || lowerInput.includes('سب سے زیادہ')) {
        
        const topDriver = getTopTripDriver(timeframe);
        
        const responses = {
          en: `🚗 **Most Active Driver**\n\n**${topDriver.name}** has completed the most trips with **${timeframe === 'today' ? (topDriver.trips_today || 0) : topDriver.trips} trips** ${timeframe === 'today' ? 'today' : 'overall'}.\n\n**Activity Details:**\n• Total trips: ${topDriver.trips}\n• Trips today: ${topDriver.trips_today || 0}\n• Total earnings: $${topDriver.earnings.toLocaleString()}\n• Status: ${topDriver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n• Vehicle: ${topDriver.vehicleId || 'Not assigned'}\n\nWould you like to see the full activity report for this driver?`,
          ar: `🚗 **السائق الأكثر نشاطاً**\n\n**${topDriver.name}** أكمل أكبر عدد من الرحلات بـ **${timeframe === 'today' ? (topDriver.trips_today || 0) : topDriver.trips} رحلة** ${timeframe === 'today' ? 'اليوم' : 'بشكل عام'}.\n\n**تفاصيل النشاط:**\n• إجمالي الرحلات: ${topDriver.trips}\n• رحلات اليوم: ${topDriver.trips_today || 0}\n• إجمالي الأرباح: $${topDriver.earnings.toLocaleString()}\n• الحالة: ${topDriver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n• المركبة: ${topDriver.vehicleId || 'غير مخصصة'}\n\nهل ترغب في رؤية تقرير النشاط الكامل لهذا السائق؟`,
          hi: `🚗 **सबसे सक्रिय ड्राइवर**\n\n**${topDriver.name}** ने **${timeframe === 'today' ? (topDriver.trips_today || 0) : topDriver.trips} यात्राओं** के साथ सबसे अधिक यात्राएं पूरी की हैं ${timeframe === 'today' ? 'आज' : 'कुल मिलाकर'}.\n\n**गतिविधि विवरण:**\n• कुल यात्राएं: ${topDriver.trips}\n• आज की यात्राएं: ${topDriver.trips_today || 0}\n• कुल कमाई: $${topDriver.earnings.toLocaleString()}\n• स्थिति: ${topDriver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n• वाहन: ${topDriver.vehicleId || 'असाइन नहीं किया गया'}\n\nक्या आप इस ड्राइवर के लिए पूर्ण गतिविधि रिपोर्ट देखना चाहते हैं?`,
          ur: `🚗 **سب سے زیادہ فعال ڈرائیور**\n\n**${topDriver.name}** نے **${timeframe === 'today' ? (topDriver.trips_today || 0) : topDriver.trips} سفر** کے ساتھ سب سے زیادہ سفر مکمل کیے ہیں ${timeframe === 'today' ? 'آج' : 'مجموعی طور پر'}.\n\n**سرگرمی کی تفصیلات:**\n• کل سفر: ${topDriver.trips}\n• آج کے سفر: ${topDriver.trips_today || 0}\n• کل کمائی: $${topDriver.earnings.toLocaleString()}\n• حالت: ${topDriver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n• گاڑی: ${topDriver.vehicleId || 'تفویض نہیں کی گئی'}\n\nکیا آپ اس ڈرائیور کے لیے مکمل سرگرمی رپورٹ دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver's trips
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (!driver) {
          const responses = {
            en: `❌ **Driver Not Found**\n\nI couldn't find a driver with that name in your fleet. Please check the name and try again.`,
            ar: `❌ **لم يتم العثور على السائق**\n\nلم أتمكن من العثور على سائق بهذا الاسم في أسطولك. يرجى التحقق من الاسم والمحاولة مرة أخرى.`,
            hi: `❌ **ड्राइवर नहीं मिला**\n\nमुझे आपके फ्लीट में उस नाम का ड्राइवर नहीं मिला। कृपया नाम की जांच करें और पुनः प्रयास करें।`,
            ur: `❌ **ڈرائیور نہیں ملا**\n\nمجھے آپ کے فلیٹ میں اس نام کا ڈرائیور نہیں ملا۔ براہ کرم نام چیک کریں اور دوبارہ کوشش کریں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `🚗 **Trip Report: ${driver.name}**\n\n**Total Trips:** ${driver.trips}\n**Trips Today:** ${driver.trips_today || 0}\n\n**Activity Metrics:**\n• Total earnings: $${driver.earnings.toLocaleString()}\n• Earnings today: $${driver.earnings_today || 0}\n• Status: ${driver.status === 'active' ? '🟢 Active' : '⚫ Offline'}\n\n**Trip Efficiency:**\n• Average earnings per trip: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• Performance score: ${driver.performanceScore}%\n\nWould you like to see more details about this driver's earnings or performance?`,
          ar: `🚗 **تقرير الرحلات: ${driver.name}**\n\n**إجمالي الرحلات:** ${driver.trips}\n**رحلات اليوم:** ${driver.trips_today || 0}\n\n**مقاييس النشاط:**\n• إجمالي الأرباح: $${driver.earnings.toLocaleString()}\n• أرباح اليوم: $${driver.earnings_today || 0}\n• الحالة: ${driver.status === 'active' ? '🟢 نشط' : '⚫ غير متصل'}\n\n**كفاءة الرحلة:**\n• متوسط الأرباح لكل رحلة: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• درجة الأداء: ${driver.performanceScore}%\n\nهل ترغب في رؤية المزيد من التفاصيل حول أرباح أو أداء هذا السائق؟`,
          hi: `🚗 **यात्रा रिपोर्ट: ${driver.name}**\n\n**कुल यात्राएं:** ${driver.trips}\n**आज की यात्राएं:** ${driver.trips_today || 0}\n\n**गतिविधि मेट्रिक्स:**\n• कुल कमाई: $${driver.earnings.toLocaleString()}\n• आज की कमाई: $${driver.earnings_today || 0}\n• स्थिति: ${driver.status === 'active' ? '🟢 सक्रिय' : '⚫ ऑफलाइन'}\n\n**यात्रा दक्षता:**\n• प्रति यात्रा औसत कमाई: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• प्रदर्शन स्कोर: ${driver.performanceScore}%\n\nक्या आप इस ड्राइवर की कमाई या प्रदर्शन के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `🚗 **سفر کی رپورٹ: ${driver.name}**\n\n**کل سفر:** ${driver.trips}\n**آج کے سفر:** ${driver.trips_today || 0}\n\n**سرگرمی کے اعداد و شمار:**\n• کل کمائی: $${driver.earnings.toLocaleString()}\n• آج کی کمائی: $${driver.earnings_today || 0}\n• حالت: ${driver.status === 'active' ? '🟢 فعال' : '⚫ آف لائن'}\n\n**سفر کی کارکردگی:**\n• فی سفر اوسط کمائی: $${Math.round(driver.earnings / Math.max(1, driver.trips))}\n• کارکردگی اسکور: ${driver.performanceScore}%\n\nکیا آپ اس ڈرائیور کی کمائی یا کارکردگی کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about overall fleet trips
      const totalTrips = mockDriversData.reduce((sum, d) => sum + d.trips, 0);
      const totalTripsToday = mockDriversData.reduce((sum, d) => sum + (d.trips_today || 0), 0);
      const avgTripsPerDriver = totalTrips / mockDriversData.length;
      
      const responses = {
        en: `🚗 **Fleet Trip Overview**\n\n**Total Trips:** ${totalTrips.toLocaleString()}\n**Trips Today:** ${totalTripsToday}\n**Average per Driver:** ${Math.round(avgTripsPerDriver)}\n\n**Most Active Drivers:**\n${mockDriversData.sort((a, b) => b.trips - a.trips).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips} trips`).join('\n')}\n\n**Today's Activity:**\n${mockDriversData.filter(d => (d.trips_today || 0) > 0).sort((a, b) => (b.trips_today || 0) - (a.trips_today || 0)).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips_today || 0} trips today`).join('\n') || 'No trips recorded today'}\n\nWould you like to see a detailed trip report for any specific driver?`,
        ar: `🚗 **نظرة عامة على رحلات الأسطول**\n\n**إجمالي الرحلات:** ${totalTrips.toLocaleString()}\n**رحلات اليوم:** ${totalTripsToday}\n**المتوسط لكل سائق:** ${Math.round(avgTripsPerDriver)}\n\n**السائقون الأكثر نشاطاً:**\n${mockDriversData.sort((a, b) => b.trips - a.trips).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips} رحلة`).join('\n')}\n\n**نشاط اليوم:**\n${mockDriversData.filter(d => (d.trips_today || 0) > 0).sort((a, b) => (b.trips_today || 0) - (a.trips_today || 0)).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips_today || 0} رحلة اليوم`).join('\n') || 'لم يتم تسجيل رحلات اليوم'}\n\nهل ترغب في رؤية تقرير رحلات مفصل لأي سائق محدد؟`,
        hi: `🚗 **फ्लीट यात्रा अवलोकन**\n\n**कुल यात्राएं:** ${totalTrips.toLocaleString()}\n**आज की यात्राएं:** ${totalTripsToday}\n**प्रति ड्राइवर औसत:** ${Math.round(avgTripsPerDriver)}\n\n**सबसे सक्रिय ड्राइवर:**\n${mockDriversData.sort((a, b) => b.trips - a.trips).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips} यात्राएं`).join('\n')}\n\n**आज की गतिविधि:**\n${mockDriversData.filter(d => (d.trips_today || 0) > 0).sort((a, b) => (b.trips_today || 0) - (a.trips_today || 0)).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips_today || 0} यात्राएं आज`).join('\n') || 'आज कोई यात्रा दर्ज नहीं की गई'}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए विस्तृत यात्रा रिपोर्ट देखना चाहते हैं?`,
        ur: `🚗 **فلیٹ سفر کا جائزہ**\n\n**کل سفر:** ${totalTrips.toLocaleString()}\n**آج کے سفر:** ${totalTripsToday}\n**فی ڈرائیور اوسط:** ${Math.round(avgTripsPerDriver)}\n\n**سب سے زیادہ فعال ڈرائیورز:**\n${mockDriversData.sort((a, b) => b.trips - a.trips).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips} سفر`).join('\n')}\n\n**آج کی سرگرمی:**\n${mockDriversData.filter(d => (d.trips_today || 0) > 0).sort((a, b) => (b.trips_today || 0) - (a.trips_today || 0)).slice(0, 3).map((d, i) => `${i + 1}. ${d.name} - ${d.trips_today || 0} سفر آج`).join('\n') || 'آج کوئی سفر درج نہیں کیا گیا'}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے تفصیلی سفر رپورٹ دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Fines/violations queries
    if (lowerInput.includes('fine') || lowerInput.includes('violation') || lowerInput.includes('penalty') ||
        lowerInput.includes('مخالفة') || lowerInput.includes('غرامة') || lowerInput.includes('عقوبة') ||
        lowerInput.includes('जुर्माना') || lowerInput.includes('उल्लंघन') || lowerInput.includes('दंड') ||
        lowerInput.includes('جرمانہ') || lowerInput.includes('خلاف ورزی') || lowerInput.includes('سزا')) {
      
      // If asking about who has fines
      if (lowerInput.includes('who') || lowerInput.includes('which') || lowerInput.includes('has') ||
          lowerInput.includes('من') || lowerInput.includes('أي') || lowerInput.includes('لديه') ||
          lowerInput.includes('कौन') || lowerInput.includes('कौनसा') || lowerInput.includes('है') ||
          lowerInput.includes('کون') || lowerInput.includes('کونسا') || lowerInput.includes('ہے')) {
        
        const driversWithFines = mockFinesData.map(f => f.driverId);
        const uniqueDriversWithFines = [...new Set(driversWithFines)];
        
        if (uniqueDriversWithFines.length === 0) {
          const responses = {
            en: `✅ **No Pending Fines**\n\nGreat news! There are currently no drivers with pending fines in your fleet.`,
            ar: `✅ **لا توجد مخالفات معلقة**\n\nأخبار رائعة! لا يوجد حالياً سائقون لديهم مخالفات معلقة في أسطولك.`,
            hi: `✅ **कोई लंबित जुर्माना नहीं**\n\nअच्छी खबर! वर्तमान में आपके फ्लीट में कोई भी ड्राइवर लंबित जुर्माने के साथ नहीं है।`,
            ur: `✅ **کوئی زیر التواء جرمانہ نہیں**\n\nاچھی خبر! فی الحال آپ کے فلیٹ میں کوئی بھی ڈرائیور زیر التواء جرمانے کے ساتھ نہیں ہے۔`
          };
          
          return responses[language];
        }
        
        const pendingFines = mockFinesData.filter(f => f.status === 'pending');
        
        if (pendingFines.length === 0) {
          const responses = {
            en: `✅ **No Pending Fines**\n\nGreat news! There are currently no pending fines in your fleet. All fines have been paid or deducted.`,
            ar: `✅ **لا توجد مخالفات معلقة**\n\nأخبار رائعة! لا توجد حالياً مخالفات معلقة في أسطولك. تم دفع أو خصم جميع المخالفات.`,
            hi: `✅ **कोई लंबित जुर्माना नहीं**\n\nअच्छी खबर! वर्तमान में आपके फ्लीट में कोई लंबित जुर्माना नहीं है। सभी जुर्माने भुगतान किए गए हैं या काट लिए गए हैं।`,
            ur: `✅ **کوئی زیر التواء جرمانہ نہیں**\n\nاچھی خبر! فی الحال آپ کے فلیٹ میں کوئی زیر التواء جرمانہ نہیں ہے۔ تمام جرمانے ادا کر دیے گئے ہیں یا کاٹ لیے گئے ہیں۔`
          };
          
          return responses[language];
        }
        
        // Group fines by driver
        const finesByDriver: {[key: number]: number} = {};
        pendingFines.forEach(fine => {
          if (!finesByDriver[fine.driverId]) {
            finesByDriver[fine.driverId] = 0;
          }
          finesByDriver[fine.driverId]++;
        });
        
        const driversWithPendingFines = Object.keys(finesByDriver).map(id => parseInt(id));
        
        const responses = {
          en: `⚠️ **Drivers with Pending Fines**\n\n${driversWithPendingFines.length} drivers have pending fines that require attention:\n\n${driversWithPendingFines.map(id => {
            const driver = mockDriversData.find(d => d.id === id);
            const driverFines = pendingFines.filter(f => f.driverId === id);
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            return `• **${driver?.name}** - ${finesByDriver[id]} fine${finesByDriver[id] > 1 ? 's' : ''} (AED ${totalAmount})`;
          }).join('\n')}\n\n**Total Pending Amount:** AED ${pendingFines.reduce((sum, f) => sum + f.amount, 0)}\n\nWould you like to see detailed fine information for a specific driver?`,
          ar: `⚠️ **السائقون الذين لديهم مخالفات معلقة**\n\n${driversWithPendingFines.length} سائق لديهم مخالفات معلقة تتطلب الاهتمام:\n\n${driversWithPendingFines.map(id => {
            const driver = mockDriversData.find(d => d.id === id);
            const driverFines = pendingFines.filter(f => f.driverId === id);
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            return `• **${driver?.name}** - ${finesByDriver[id]} مخالفة${finesByDriver[id] > 2 ? 'ات' : finesByDriver[id] === 2 ? 'تان' : ''} (${totalAmount} درهم)`;
          }).join('\n')}\n\n**إجمالي المبلغ المعلق:** ${pendingFines.reduce((sum, f) => sum + f.amount, 0)} درهم\n\nهل ترغب في رؤية معلومات مفصلة عن المخالفات لسائق محدد؟`,
          hi: `⚠️ **लंबित जुर्माने वाले ड्राइवर**\n\n${driversWithPendingFines.length} ड्राइवरों के पास ध्यान देने की आवश्यकता वाले लंबित जुर्माने हैं:\n\n${driversWithPendingFines.map(id => {
            const driver = mockDriversData.find(d => d.id === id);
            const driverFines = pendingFines.filter(f => f.driverId === id);
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            return `• **${driver?.name}** - ${finesByDriver[id]} जुर्माना${finesByDriver[id] > 1 ? 'ए' : ''} (AED ${totalAmount})`;
          }).join('\n')}\n\n**कुल लंबित राशि:** AED ${pendingFines.reduce((sum, f) => sum + f.amount, 0)}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए विस्तृत जुर्माना जानकारी देखना चाहते हैं?`,
          ur: `⚠️ **زیر التواء جرمانے والے ڈرائیورز**\n\n${driversWithPendingFines.length} ڈرائیوروں کے پاس توجہ کی ضرورت والے زیر التواء جرمانے ہیں:\n\n${driversWithPendingFines.map(id => {
            const driver = mockDriversData.find(d => d.id === id);
            const driverFines = pendingFines.filter(f => f.driverId === id);
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            return `• **${driver?.name}** - ${finesByDriver[id]} جرمانہ${finesByDriver[id] > 1 ? 'ے' : ''} (AED ${totalAmount})`;
          }).join('\n')}\n\n**کل زیر التواء رقم:** AED ${pendingFines.reduce((sum, f) => sum + f.amount, 0)}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے تفصیلی جرمانہ کی معلومات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver's fines
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (!driver) {
          const responses = {
            en: `❌ **Driver Not Found**\n\nI couldn't find a driver with that name in your fleet. Please check the name and try again.`,
            ar: `❌ **لم يتم العثور على السائق**\n\nلم أتمكن من العثور على سائق بهذا الاسم في أسطولك. يرجى التحقق من الاسم والمحاولة مرة أخرى.`,
            hi: `❌ **ड्राइवर नहीं मिला**\n\nमुझे आपके फ्लीट में उस नाम का ड्राइवर नहीं मिला। कृपया नाम की जांच करें और पुनः प्रयास करें।`,
            ur: `❌ **ڈرائیور نہیں ملا**\n\nمجھے آپ کے فلیٹ میں اس نام کا ڈرائیور نہیں ملا۔ براہ کرم نام چیک کریں اور دوبارہ کوشش کریں۔`
          };
          
          return responses[language];
        }
        
        const driverFines = mockFinesData.filter(f => f.driverId === driverId);
        
        if (driverFines.length === 0) {
          const responses = {
            en: `✅ **No Fines Found**\n\n${driver.name} has no recorded fines. Great job keeping a clean record!`,
            ar: `✅ **لم يتم العثور على مخالفات**\n\n${driver.name} ليس لديه مخالفات مسجلة. عمل رائع في الحفاظ على سجل نظيف!`,
            hi: `✅ **कोई जुर्माना नहीं मिला**\n\n${driver.name} का कोई दर्ज जुर्माना नहीं है। एक साफ रिकॉर्ड रखने के लिए बढ़िया काम!`,
            ur: `✅ **کوئی جرمانہ نہیں ملا**\n\n${driver.name} کا کوئی درج جرمانہ نہیں ہے۔ صاف ریکارڈ رکھنے کے لیے شاندار کام!`
          };
          
          return responses[language];
        }
        
        const pendingFines = driverFines.filter(f => f.status === 'pending');
        const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
        const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
        
        const responses = {
          en: `⚠️ **Fine Report: ${driver.name}**\n\n**Summary:**\n• Total fines: ${driverFines.length}\n• Pending fines: ${pendingFines.length}\n• Total amount: AED ${totalAmount}\n• Pending amount: AED ${pendingAmount}\n\n**Recent Fines:**\n${driverFines.slice(0, 3).map(fine => `• ${new Date(fine.date).toLocaleDateString()}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ Pending' : fine.status === 'paid' ? '✅ Paid' : '💳 Deducted'})`).join('\n')}\n\nWould you like to see the complete fine history for this driver?`,
          ar: `⚠️ **تقرير المخالفات: ${driver.name}**\n\n**الملخص:**\n• إجمالي المخالفات: ${driverFines.length}\n• المخالفات المعلقة: ${pendingFines.length}\n• المبلغ الإجمالي: ${totalAmount} درهم\n• المبلغ المعلق: ${pendingAmount} درهم\n\n**المخالفات الأخيرة:**\n${driverFines.slice(0, 3).map(fine => `• ${new Date(fine.date).toLocaleDateString()}: ${fine.violation} - ${fine.amount} درهم (${fine.status === 'pending' ? '⚠️ معلق' : fine.status === 'paid' ? '✅ مدفوع' : '💳 مخصوم'})`).join('\n')}\n\nهل ترغب في رؤية سجل المخالفات الكامل لهذا السائق؟`,
          hi: `⚠️ **जुर्माना रिपोर्ट: ${driver.name}**\n\n**सारांश:**\n• कुल जुर्माने: ${driverFines.length}\n• लंबित जुर्माने: ${pendingFines.length}\n• कुल राशि: AED ${totalAmount}\n• लंबित राशि: AED ${pendingAmount}\n\n**हालिया जुर्माने:**\n${driverFines.slice(0, 3).map(fine => `• ${new Date(fine.date).toLocaleDateString()}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ लंबित' : fine.status === 'paid' ? '✅ भुगतान किया गया' : '💳 काटा गया'})`).join('\n')}\n\nक्या आप इस ड्राइवर के लिए पूर्ण जुर्माना इतिहास देखना चाहते हैं?`,
          ur: `⚠️ **جرمانہ رپورٹ: ${driver.name}**\n\n**خلاصہ:**\n• کل جرمانے: ${driverFines.length}\n• زیر التواء جرمانے: ${pendingFines.length}\n• کل رقم: AED ${totalAmount}\n• زیر التواء رقم: AED ${pendingAmount}\n\n**حالیہ جرمانے:**\n${driverFines.slice(0, 3).map(fine => `• ${new Date(fine.date).toLocaleDateString()}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ زیر التواء' : fine.status === 'paid' ? '✅ ادا شدہ' : '💳 کٹوتی'})`).join('\n')}\n\nکیا آپ اس ڈرائیور کے لیے مکمل جرمانہ ہسٹری دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about overall fleet fines
      const totalFines = mockFinesData.length;
      const pendingFines = mockFinesData.filter(f => f.status === 'pending');
      const totalAmount = mockFinesData.reduce((sum, f) => sum + f.amount, 0);
      const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
      
      const responses = {
        en: `⚠️ **Fleet Fines Overview**\n\n**Summary:**\n• Total fines: ${totalFines}\n• Pending fines: ${pendingFines.length}\n• Total amount: AED ${totalAmount}\n• Pending amount: AED ${pendingAmount}\n\n**Drivers with Most Fines:**\n${Object.entries(mockFinesData.reduce((acc: {[key: number]: number}, fine) => {
          acc[fine.driverId] = (acc[fine.driverId] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([driverId, count]) => {
          const driver = mockDriversData.find(d => d.id === parseInt(driverId));
          return `• ${driver?.name || 'Unknown Driver'} - ${count} fine${count > 1 ? 's' : ''}`;
        }).join('\n')}\n\n**Recent Fines:**\n${mockFinesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return `• ${driver?.name || 'Unknown Driver'}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ Pending' : fine.status === 'paid' ? '✅ Paid' : '💳 Deducted'})`;
        }).join('\n')}\n\nWould you like to see fines for a specific driver?`,
        ar: `⚠️ **نظرة عامة على مخالفات الأسطول**\n\n**الملخص:**\n• إجمالي المخالفات: ${totalFines}\n• المخالفات المعلقة: ${pendingFines.length}\n• المبلغ الإجمالي: ${totalAmount} درهم\n• المبلغ المعلق: ${pendingAmount} درهم\n\n**السائقون الأكثر مخالفات:**\n${Object.entries(mockFinesData.reduce((acc: {[key: number]: number}, fine) => {
          acc[fine.driverId] = (acc[fine.driverId] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([driverId, count]) => {
          const driver = mockDriversData.find(d => d.id === parseInt(driverId));
          return `• ${driver?.name || 'سائق غير معروف'} - ${count} مخالفة${count > 2 ? 'ات' : count === 2 ? 'تان' : ''}`;
        }).join('\n')}\n\n**المخالفات الأخيرة:**\n${mockFinesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return `• ${driver?.name || 'سائق غير معروف'}: ${fine.violation} - ${fine.amount} درهم (${fine.status === 'pending' ? '⚠️ معلق' : fine.status === 'paid' ? '✅ مدفوع' : '💳 مخصوم'})`;
        }).join('\n')}\n\nهل ترغب في رؤية مخالفات لسائق محدد؟`,
        hi: `⚠️ **फ्लीट जुर्माना अवलोकन**\n\n**सारांश:**\n• कुल जुर्माने: ${totalFines}\n• लंबित जुर्माने: ${pendingFines.length}\n• कुल राशि: AED ${totalAmount}\n• लंबित राशि: AED ${pendingAmount}\n\n**सबसे अधिक जुर्माने वाले ड्राइवर:**\n${Object.entries(mockFinesData.reduce((acc: {[key: number]: number}, fine) => {
          acc[fine.driverId] = (acc[fine.driverId] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([driverId, count]) => {
          const driver = mockDriversData.find(d => d.id === parseInt(driverId));
          return `• ${driver?.name || 'अज्ञात ड्राइवर'} - ${count} जुर्माना${count > 1 ? 'ए' : ''}`;
        }).join('\n')}\n\n**हालिया जुर्माने:**\n${mockFinesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return `• ${driver?.name || 'अज्ञात ड्राइवर'}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ लंबित' : fine.status === 'paid' ? '✅ भुगतान किया गया' : '💳 काटा गया'})`;
        }).join('\n')}\n\nक्या आप किसी विशिष्ट ड्राइवर के लिए जुर्माने देखना चाहते हैं?`,
        ur: `⚠️ **فلیٹ جرمانہ کا جائزہ**\n\n**خلاصہ:**\n• کل جرمانے: ${totalFines}\n• زیر التواء جرمانے: ${pendingFines.length}\n• کل رقم: AED ${totalAmount}\n• زیر التواء رقم: AED ${pendingAmount}\n\n**سب سے زیادہ جرمانے والے ڈرائیورز:**\n${Object.entries(mockFinesData.reduce((acc: {[key: number]: number}, fine) => {
          acc[fine.driverId] = (acc[fine.driverId] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([driverId, count]) => {
          const driver = mockDriversData.find(d => d.id === parseInt(driverId));
          return `• ${driver?.name || 'نامعلوم ڈرائیور'} - ${count} جرمانہ${count > 1 ? 'ے' : ''}`;
        }).join('\n')}\n\n**حالیہ جرمانے:**\n${mockFinesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(fine => {
          const driver = mockDriversData.find(d => d.id === fine.driverId);
          return `• ${driver?.name || 'نامعلوم ڈرائیور'}: ${fine.violation} - AED ${fine.amount} (${fine.status === 'pending' ? '⚠️ زیر التواء' : fine.status === 'paid' ? '✅ ادا شدہ' : '💳 کٹوتی'})`;
        }).join('\n')}\n\nکیا آپ کسی مخصوص ڈرائیور کے لیے جرمانے دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Driver status queries
    if (lowerInput.includes('active') || lowerInput.includes('online') || lowerInput.includes('offline') || lowerInput.includes('status') ||
        lowerInput.includes('نشط') || lowerInput.includes('متصل') || lowerInput.includes('غير متصل') || lowerInput.includes('حالة') ||
        lowerInput.includes('सक्रिय') || lowerInput.includes('ऑनलाइन') || lowerInput.includes('ऑफलाइन') || lowerInput.includes('स्थिति') ||
        lowerInput.includes('فعال') || lowerInput.includes('آن لائن') || lowerInput.includes('آف لائن') || lowerInput.includes('حالت')) {
      
      // If asking about active drivers
      if (lowerInput.includes('active') || lowerInput.includes('online') || 
          lowerInput.includes('نشط') || lowerInput.includes('متصل') ||
          lowerInput.includes('सक्रिय') || lowerInput.includes('ऑनलाइन') ||
          lowerInput.includes('فعال') || lowerInput.includes('آن لائن')) {
        
        const activeDrivers = mockDriversData.filter(d => d.status === 'active');
        
        if (activeDrivers.length === 0) {
          const responses = {
            en: `⚠️ **No Active Drivers**\n\nThere are currently no active drivers in your fleet. All drivers are offline.`,
            ar: `⚠️ **لا يوجد سائقون نشطون**\n\nلا يوجد حالياً سائقون نشطون في أسطولك. جميع السائقين غير متصلين.`,
            hi: `⚠️ **कोई सक्रिय ड्राइवर नहीं**\n\nवर्तमान में आपके फ्लीट में कोई सक्रिय ड्राइवर नहीं है। सभी ड्राइवर ऑफलाइन हैं।`,
            ur: `⚠️ **کوئی فعال ڈرائیور نہیں**\n\nفی الحال آپ کے فلیٹ میں کوئی فعال ڈرائیور نہیں ہے۔ تمام ڈرائیورز آف لائن ہیں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `🟢 **Active Drivers**\n\nThere are currently ${activeDrivers.length} active drivers in your fleet:\n\n${activeDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'No vehicle'} - ${driver.trips_today || 0} trips today`).join('\n')}\n\n**Total Active Earnings Today:** $${activeDrivers.reduce((sum, d) => sum + (d.earnings_today || 0), 0)}\n\nWould you like to see more details about any specific driver?`,
          ar: `🟢 **السائقون النشطون**\n\nيوجد حالياً ${activeDrivers.length} سائق نشط في أسطولك:\n\n${activeDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'لا توجد مركبة'} - ${driver.trips_today || 0} رحلة اليوم`).join('\n')}\n\n**إجمالي أرباح النشطين اليوم:** $${activeDrivers.reduce((sum, d) => sum + (d.earnings_today || 0), 0)}\n\nهل ترغب في رؤية المزيد من التفاصيل حول أي سائق محدد؟`,
          hi: `🟢 **सक्रिय ड्राइवर**\n\nवर्तमान में आपके फ्लीट में ${activeDrivers.length} सक्रिय ड्राइवर हैं:\n\n${activeDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'कोई वाहन नहीं'} - ${driver.trips_today || 0} यात्राएं आज`).join('\n')}\n\n**आज की कुल सक्रिय कमाई:** $${activeDrivers.reduce((sum, d) => sum + (d.earnings_today || 0), 0)}\n\nक्या आप किसी विशिष्ट ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `🟢 **فعال ڈرائیورز**\n\nفی الحال آپ کے فلیٹ میں ${activeDrivers.length} فعال ڈرائیورز ہیں:\n\n${activeDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'کوئی گاڑی نہیں'} - ${driver.trips_today || 0} سفر آج`).join('\n')}\n\n**آج کی کل فعال کمائی:** $${activeDrivers.reduce((sum, d) => sum + (d.earnings_today || 0), 0)}\n\nکیا آپ کسی مخصوص ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about inactive/offline drivers
      if (lowerInput.includes('offline') || lowerInput.includes('inactive') ||
          lowerInput.includes('غير متصل') || lowerInput.includes('غير نشط') ||
          lowerInput.includes('ऑफलाइन') || lowerInput.includes('निष्क्रिय') ||
          lowerInput.includes('آف لائن') || lowerInput.includes('غیر فعال')) {
        
        const inactiveDrivers = mockDriversData.filter(d => d.status !== 'active');
        
        if (inactiveDrivers.length === 0) {
          const responses = {
            en: `✅ **All Drivers Active**\n\nGreat news! All drivers in your fleet are currently active.`,
            ar: `✅ **جميع السائقين نشطون**\n\nأخبار رائعة! جميع السائقين في أسطولك نشطون حالياً.`,
            hi: `✅ **सभी ड्राइवर सक्रिय**\n\nअच्छी खबर! आपके फ्लीट में सभी ड्राइवर वर्तमान में सक्रिय हैं।`,
            ur: `✅ **تمام ڈرائیورز فعال**\n\nاچھی خبر! آپ کے فلیٹ میں تمام ڈرائیورز فی الحال فعال ہیں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `⚫ **Inactive Drivers**\n\nThere are currently ${inactiveDrivers.length} inactive drivers in your fleet:\n\n${inactiveDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'No vehicle'} - Last active: ${driver.joinDate}`).join('\n')}\n\nWould you like to see more details about any specific driver?`,
          ar: `⚫ **السائقون غير النشطين**\n\nيوجد حالياً ${inactiveDrivers.length} سائق غير نشط في أسطولك:\n\n${inactiveDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'لا توجد مركبة'} - آخر نشاط: ${driver.joinDate}`).join('\n')}\n\nهل ترغب في رؤية المزيد من التفاصيل حول أي سائق محدد؟`,
          hi: `⚫ **निष्क्रिय ड्राइवर**\n\nवर्तमान में आपके फ्लीट में ${inactiveDrivers.length} निष्क्रिय ड्राइवर हैं:\n\n${inactiveDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'कोई वाहन नहीं'} - अंतिम सक्रिय: ${driver.joinDate}`).join('\n')}\n\nक्या आप किसी विशिष्ट ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `⚫ **غیر فعال ڈرائیورز**\n\nفی الحال آپ کے فلیٹ میں ${inactiveDrivers.length} غیر فعال ڈرائیورز ہیں:\n\n${inactiveDrivers.map(driver => `• **${driver.name}** - ${driver.vehicleId || 'کوئی گاڑی نہیں'} - آخری فعال: ${driver.joinDate}`).join('\n')}\n\nکیا آپ کسی مخصوص ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about a specific driver's status
      if (driverId) {
        const driver = mockDriversData.find(d => d.id === driverId);
        if (!driver) {
          const responses = {
            en: `❌ **Driver Not Found**\n\nI couldn't find a driver with that name in your fleet. Please check the name and try again.`,
            ar: `❌ **لم يتم العثور على السائق**\n\nلم أتمكن من العثور على سائق بهذا الاسم في أسطولك. يرجى التحقق من الاسم والمحاولة مرة أخرى.`,
            hi: `❌ **ड्राइवर नहीं मिला**\n\nमुझे आपके फ्लीट में उस नाम का ड्राइवर नहीं मिला। कृपया नाम की जांच करें और पुनः प्रयास करें।`,
            ur: `❌ **ڈرائیور نہیں ملا**\n\nمجھے آپ کے فلیٹ میں اس نام کا ڈرائیور نہیں ملا۔ براہ کرم نام چیک کریں اور دوبارہ کوشش کریں۔`
          };
          
          return responses[language];
        }
        
        const responses = {
          en: `${driver.status === 'active' ? '🟢' : '⚫'} **${driver.name}'s Status**\n\n**Current Status:** ${driver.status === 'active' ? 'Active' : 'Offline'}\n\n**Activity Details:**\n• Total trips: ${driver.trips}\n• Trips today: ${driver.trips_today || 0}\n• Total earnings: $${driver.earnings.toLocaleString()}\n• Earnings today: $${driver.earnings_today || 0}\n• Performance score: ${driver.performanceScore}%\n\n**Vehicle Assignment:**\n• Vehicle ID: ${driver.vehicleId || 'Not assigned'}\n\nWould you like to see more details about this driver?`,
          ar: `${driver.status === 'active' ? '🟢' : '⚫'} **حالة ${driver.name}**\n\n**الحالة الحالية:** ${driver.status === 'active' ? 'نشط' : 'غير متصل'}\n\n**تفاصيل النشاط:**\n• إجمالي الرحلات: ${driver.trips}\n• رحلات اليوم: ${driver.trips_today || 0}\n• إجمالي الأرباح: $${driver.earnings.toLocaleString()}\n• أرباح اليوم: $${driver.earnings_today || 0}\n• درجة الأداء: ${driver.performanceScore}%\n\n**تخصيص المركبة:**\n• معرف المركبة: ${driver.vehicleId || 'غير مخصصة'}\n\nهل ترغب في رؤية المزيد من التفاصيل حول هذا السائق؟`,
          hi: `${driver.status === 'active' ? '🟢' : '⚫'} **${driver.name} की स्थिति**\n\n**वर्तमान स्थिति:** ${driver.status === 'active' ? 'सक्रिय' : 'ऑफलाइन'}\n\n**गतिविधि विवरण:**\n• कुल यात्राएं: ${driver.trips}\n• आज की यात्राएं: ${driver.trips_today || 0}\n• कुल कमाई: $${driver.earnings.toLocaleString()}\n• आज की कमाई: $${driver.earnings_today || 0}\n• प्रदर्शन स्कोर: ${driver.performanceScore}%\n\n**वाहन असाइनमेंट:**\n• वाहन आईडी: ${driver.vehicleId || 'असाइन नहीं किया गया'}\n\nक्या आप इस ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
          ur: `${driver.status === 'active' ? '🟢' : '⚫'} **${driver.name} کی حالت**\n\n**موجودہ حالت:** ${driver.status === 'active' ? 'فعال' : 'آف لائن'}\n\n**سرگرمی کی تفصیلات:**\n• کل سفر: ${driver.trips}\n• آج کے سفر: ${driver.trips_today || 0}\n• کل کمائی: $${driver.earnings.toLocaleString()}\n• آج کی کمائی: $${driver.earnings_today || 0}\n• کارکردگی اسکور: ${driver.performanceScore}%\n\n**گاڑی کی تفویض:**\n• گاڑی ID: ${driver.vehicleId || 'تفویض نہیں کی گئی'}\n\nکیا آپ اس ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
        };
        
        return responses[language];
      }
      
      // If asking about overall fleet status
      const activeDrivers = mockDriversData.filter(d => d.status === 'active');
      const inactiveDrivers = mockDriversData.filter(d => d.status !== 'active');
      
      const responses = {
        en: `📊 **Fleet Status Overview**\n\n**Driver Status:**\n• Total drivers: ${mockDriversData.length}\n• Active drivers: ${activeDrivers.length}\n• Inactive drivers: ${inactiveDrivers.length}\n\n**Active Drivers:**\n${activeDrivers.slice(0, 5).map(driver => `• ${driver.name} - ${driver.vehicleId || 'No vehicle'}`).join('\n')}${activeDrivers.length > 5 ? `\n• ...and ${activeDrivers.length - 5} more` : ''}\n\n**Inactive Drivers:**\n${inactiveDrivers.slice(0, 3).map(driver => `• ${driver.name} - ${driver.vehicleId || 'No vehicle'}`).join('\n')}${inactiveDrivers.length > 3 ? `\n• ...and ${inactiveDrivers.length - 3} more` : ''}\n\nWould you like to see more details about any specific driver?`,
        ar: `📊 **نظرة عامة على حالة الأسطول**\n\n**حالة السائقين:**\n• إجمالي السائقين: ${mockDriversData.length}\n• السائقون النشطون: ${activeDrivers.length}\n• السائقون غير النشطين: ${inactiveDrivers.length}\n\n**السائقون النشطون:**\n${activeDrivers.slice(0, 5).map(driver => `• ${driver.name} - ${driver.vehicleId || 'لا توجد مركبة'}`).join('\n')}${activeDrivers.length > 5 ? `\n• ...و ${activeDrivers.length - 5} آخرين` : ''}\n\n**السائقون غير النشطين:**\n${inactiveDrivers.slice(0, 3).map(driver => `• ${driver.name} - ${driver.vehicleId || 'لا توجد مركبة'}`).join('\n')}${inactiveDrivers.length > 3 ? `\n• ...و ${inactiveDrivers.length - 3} آخرين` : ''}\n\nهل ترغب في رؤية المزيد من التفاصيل حول أي سائق محدد؟`,
        hi: `📊 **फ्लीट स्थिति अवलोकन**\n\n**ड्राइवर स्थिति:**\n• कुल ड्राइवर: ${mockDriversData.length}\n• सक्रिय ड्राइवर: ${activeDrivers.length}\n• निष्क्रिय ड्राइवर: ${inactiveDrivers.length}\n\n**सक्रिय ड्राइवर:**\n${activeDrivers.slice(0, 5).map(driver => `• ${driver.name} - ${driver.vehicleId || 'कोई वाहन नहीं'}`).join('\n')}${activeDrivers.length > 5 ? `\n• ...और ${activeDrivers.length - 5} अधिक` : ''}\n\n**निष्क्रिय ड्राइवर:**\n${inactiveDrivers.slice(0, 3).map(driver => `• ${driver.name} - ${driver.vehicleId || 'कोई वाहन नहीं'}`).join('\n')}${inactiveDrivers.length > 3 ? `\n• ...और ${inactiveDrivers.length - 3} अधिक` : ''}\n\nक्या आप किसी विशिष्ट ड्राइवर के बारे में अधिक विवरण देखना चाहते हैं?`,
        ur: `📊 **فلیٹ حالت کا جائزہ**\n\n**ڈرائیور کی حالت:**\n• کل ڈرائیورز: ${mockDriversData.length}\n• فعال ڈرائیورز: ${activeDrivers.length}\n• غیر فعال ڈرائیورز: ${inactiveDrivers.length}\n\n**فعال ڈرائیورز:**\n${activeDrivers.slice(0, 5).map(driver => `• ${driver.name} - ${driver.vehicleId || 'کوئی گاڑی نہیں'}`).join('\n')}${activeDrivers.length > 5 ? `\n• ...اور ${activeDrivers.length - 5} مزید` : ''}\n\n**غیر فعال ڈرائیورز:**\n${inactiveDrivers.slice(0, 3).map(driver => `• ${driver.name} - ${driver.vehicleId || 'کوئی گاڑی نہیں'}`).join('\n')}${inactiveDrivers.length > 3 ? `\n• ...اور ${inactiveDrivers.length - 3} مزید` : ''}\n\nکیا آپ کسی مخصوص ڈرائیور کے بارے میں مزید تفصیلات دیکھنا چاہتے ہیں؟`
      };
      
      return responses[language];
    }

    // Default response for unrecognized queries with multilingual support
    const defaultResponses = {
      en: `🤔 **I'm here to help!**\n\nI didn't quite understand that. Here are some things you can ask me:\n\n**Driver Information:**\n• "Show me active drivers"\n• "What's Ahmed's performance score?"\n• "Who has the most trips today?"\n• "Who earned the most money this month?"\n\n**Financial Queries:**\n• "Show me total earnings"\n• "What are Ahmed's earnings today?"\n• "Who has pending fines?"\n\n**Contract Management:**\n• "Make a new contract"\n• "Show me expiring contracts"\n• "Show Ahmed's contract"\n\n**Fleet Operations:**\n• "What's my fleet status?"\n• "Show me fleet performance"\n• "Who needs attention?"\n\n💡 **Just ask naturally - I understand conversational language!**`,
      ar: `🤔 **أنا هنا للمساعدة!**\n\nلم أفهم ذلك تماماً. إليك بعض الأشياء التي يمكنك سؤالي عنها:\n\n**معلومات السائق:**\n• "أظهر لي السائقين النشطين"\n• "ما هي درجة أداء أحمد؟"\n• "من لديه أكثر الرحلات اليوم؟"\n• "من كسب أكثر المال هذا الشهر؟"\n\n**استفسارات مالية:**\n• "أظهر لي إجمالي الأرباح"\n• "ما هي أرباح أحمد اليوم؟"\n• "من لديه مخالفات معلقة؟"\n\n**إدارة العقود:**\n• "إنشاء عقد جديد"\n• "أظهر لي العقود المنتهية"\n• "أظهر عقد أحمد"\n\n**عمليات الأسطول:**\n• "ما هي حالة أسطولي؟"\n• "أظهر لي أداء الأسطول"\n• "من يحتاج إلى اهتمام؟"\n\n💡 **فقط اسأل بشكل طبيعي - أفهم لغة المحادثة!**`,
      hi: `🤔 **मैं मदद के लिए यहां हूं!**\n\nमैं इसे पूरी तरह से नहीं समझ पाया। यहां कुछ चीजें हैं जो आप मुझसे पूछ सकते हैं:\n\n**ड्राइवर जानकारी:**\n• "मुझे सक्रिय ड्राइवर दिखाएं"\n• "अहमद का प्रदर्शन स्कोर क्या है?"\n• "आज सबसे अधिक यात्राएं किसने की हैं?"\n• "इस महीने सबसे अधिक पैसा किसने कमाया?"\n\n**वित्तीय प्रश्न:**\n• "मुझे कुल कमाई दिखाएं"\n• "आज अहमद की कमाई क्या है?"\n• "किसके पास लंबित जुर्माने हैं?"\n\n**अनुबंध प्रबंधन:**\n• "एक नया अनुबंध बनाएं"\n• "मुझे समाप्त होने वाले अनुबंध दिखाएं"\n• "अहमद का अनुबंध दिखाएं"\n\n**फ्लीट संचालन:**\n• "मेरे फ्लीट की स्थिति क्या है?"\n• "मुझे फ्लीट प्रदर्शन दिखाएं"\n• "किसे ध्यान की आवश्यकता है?"\n\n💡 **बस स्वाभाविक रूप से पूछें - मैं बातचीत की भाषा समझता हूं!**`,
      ur: `🤔 **میں مدد کے لیے یہاں ہوں!**\n\nمیں اسے پوری طرح نہیں سمجھ پایا۔ یہاں کچھ چیزیں ہیں جو آپ مجھ سے پوچھ سکتے ہیں:\n\n**ڈرائیور کی معلومات:**\n• "مجھے فعال ڈرائیورز دکھائیں"\n• "احمد کا کارکردگی اسکور کیا ہے؟"\n• "آج سب سے زیادہ سفر کس نے کیے ہیں؟"\n• "اس مہینے سب سے زیادہ پیسہ کس نے کمایا؟"\n\n**مالی سوالات:**\n• "مجھے کل کمائی دکھائیں"\n• "آج احمد کی کمائی کیا ہے؟"\n• "کس کے پاس زیر التواء جرمانے ہیں؟"\n\n**کنٹریکٹ منیجمنٹ:**\n• "ایک نیا کنٹریکٹ بنائیں"\n• "مجھے ختم ہونے والے کنٹریکٹس دکھائیں"\n• "احمد کا کنٹریکٹ دکھائیں"\n\n**فلیٹ آپریشنز:**\n• "میرے فلیٹ کی حالت کیا ہے؟"\n• "مجھے فلیٹ کارکردگی دکھائیں"\n• "کسے توجہ کی ضرورت ہے؟"\n\n💡 **بس فطری طور پر پوچھیں - میں بات چیت کی زبان سمجھتا ہوں!**`
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