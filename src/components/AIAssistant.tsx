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
      welcomeMessage: `👋 **Welcome to NavEdge AI!**\n\nI'm your intelligent fleet management assistant. I can help you with:\n\n🚗 **Driver Management**\n• Check driver performance\n• View driver locations\n• Manage driver assignments\n\n📋 **Contract & Fine Management**\n• Review contract details\n• Track fine payments\n• Monitor compliance\n\n📊 **Analytics & Reports**\n• Performance insights\n• Revenue analysis\n• Fleet utilization\n\n💡 **Try asking:**\n• "How many trips did I complete today?"\n• "What's my total earnings this month?"\n• "How much do I owe in fines?"\n• "Do I have any warnings?"\n• "How's my performance score right now?"`
    },
    ar: {
      title: 'مساعد نافيدج الذكي',
      subtitle: 'رفيقك الذكي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن أسطولك...',
      send: 'إرسال',
      listening: 'أستمع...',
      typing: 'نافيدج يكتب...',
      welcomeMessage: `👋 **مرحباً بك في نافيدج الذكي!**\n\nأنا مساعدك الذكي لإدارة الأسطول. يمكنني مساعدتك في:\n\n🚗 **إدارة السائقين**\n• فحص أداء السائقين\n• عرض مواقع السائقين\n• إدارة تعيينات السائقين\n\n📋 **إدارة العقود والمخالفات**\n• مراجعة تفاصيل العقود\n• تتبع دفع المخالفات\n• مراقبة الامتثال\n\n📊 **التحليلات والتقارير**\n• رؤى الأداء\n• تحليل الإيرادات\n• استخدام الأسطول\n\n💡 **جرب السؤال:**\n• "كم عدد الرحلات التي أكملتها اليوم؟"\n• "ما هو إجمالي أرباحي هذا الشهر؟"\n• "كم أدين بالغرامات؟"\n• "هل لدي أي تحذيرات؟"\n• "كيف هي درجة أدائي الآن؟"`
    },
    hi: {
      title: 'नेवएज AI असिस्टेंट',
      subtitle: 'आपका बुद्धिमान फ्लीट प्रबंधन साथी',
      placeholder: 'अपने फ्लीट के बारे में कुछ भी पूछें...',
      send: 'भेजें',
      listening: 'सुन रहा हूं...',
      typing: 'नेवएज टाइप कर रहा है...',
      welcomeMessage: `👋 **नेवएज AI में आपका स्वागत है!**\n\nमैं आपका बुद्धिमान फ्लीट प्रबंधन सहायक हूं। मैं आपकी मदद कर सकता हूं:\n\n🚗 **ड्राइवर प्रबंधन**\n• ड्राइवर प्रदर्शन जांचें\n• ड्राइवर स्थान देखें\n• ड्राइवर असाइनमेंट प्रबंधित करें\n\n📋 **अनुबंध और जुर्माना प्रबंधन**\n• अनुबंध विवरण समीक्षा करें\n• जुर्माना भुगतान ट्रैक करें\n• अनुपालन की निगरानी करें\n\n📊 **एनालिटिक्स और रिपोर्ट**\n• प्रदर्शन अंतर्दृष्टि\n• राजस्व विश्लेषण\n• फ्लीट उपयोग\n\n💡 **पूछने की कोशिश करें:**\n• "आज मैंने कितनी यात्राएं पूरी कीं?"\n• "इस महीने मेरी कुल कमाई क्या है?"\n• "मुझे जुर्माने में कितना देना है?"\n• "क्या मुझे कोई चेतावनी मिली है?"\n• "अभी मेरा प्रदर्शन स्कोर कैसा है?"`
    },
    ur: {
      title: 'نیو ایج AI اسسٹنٹ',
      subtitle: 'آپ کا ذہین فلیٹ منیجمنٹ ساتھی',
      placeholder: 'اپنے فلیٹ کے بارے میں کچھ بھی پوچھیں...',
      send: 'بھیجیں',
      listening: 'سن رہا ہوں...',
      typing: 'نیو ایج ٹائپ کر رہا ہے...',
      welcomeMessage: `👋 **نیو ایج AI میں خوش آمدید!**\n\nمیں آپ کا ذہین فلیٹ منیجمنٹ اسسٹنٹ ہوں۔ میں آپ کی مدد کر سکتا ہوں:\n\n🚗 **ڈرائیور منیجمنٹ**\n• ڈرائیور کی کارکردگی چیک کریں\n• ڈرائیور کے مقامات دیکھیں\n• ڈرائیور اسائنمنٹس منظم کریں\n\n📋 **کنٹریکٹ اور جرمانہ منیجمنٹ**\n• کنٹریکٹ کی تفصیلات کا جائزہ لیں\n• جرمانے کی ادائیگی ٹریک کریں\n• تعمیل کی نگرانی کریں\n\n📊 **تجزیات اور رپورٹس**\n• کارکردگی کی بصیرت\n• آمدنی کا تجزیہ\n• فلیٹ کا استعمال\n\n💡 **پوچھنے کی کوشش کریں:**\n• "آج میں نے کتنے سفر مکمل کیے؟"\n• "اس مہینے میری کل کمائی کیا ہے؟"\n• "مجھے جرمانوں میں کتنا دینا ہے؟"\n• "کیا مجھے کوئی وارننگز ہیں؟"\n• "ابھی میری کارکردگی اسکور کیسی ہے؟"`
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

  // Get driver by name (case insensitive partial match)
  const getDriverByName = (name: string) => {
    const lowerName = name.toLowerCase();
    return mockDriversData.find(d => 
      d.name.toLowerCase().includes(lowerName)
    );
  };

  // Get driver's fines
  const getDriverFines = (driverId: number) => {
    return mockFinesData.filter(f => f.driverId === driverId);
  };

  // Get driver's contracts
  const getDriverContracts = (driverId: number) => {
    return mockContractsData.filter(c => c.driverId === driverId);
  };

  // Get current driver (for driver-specific questions)
  const getCurrentDriver = () => {
    // In a real app, this would be based on the logged-in user
    // For demo, we'll use the first driver
    return mockDriversData[0];
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Process natural language queries about trips
  const processTripsQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    // Today's trips
    if (lowerInput.includes('today') && 
        (lowerInput.includes('trip') || lowerInput.includes('ride'))) {
      return `You have completed ${driver.trips_today || 0} trips today.`;
    }
    
    // Total trips
    if ((lowerInput.includes('total') || lowerInput.includes('all')) && 
        (lowerInput.includes('trip') || lowerInput.includes('ride'))) {
      return `You have completed a total of ${driver.trips} trips.`;
    }
    
    // This week's trips
    if (lowerInput.includes('week') && 
        (lowerInput.includes('trip') || lowerInput.includes('ride'))) {
      // In a real app, this would calculate weekly trips
      const weeklyTrips = Math.round(driver.trips * 0.2);
      return `You have completed ${weeklyTrips} trips this week.`;
    }
    
    // This month's trips
    if (lowerInput.includes('month') && 
        (lowerInput.includes('trip') || lowerInput.includes('ride'))) {
      // In a real app, this would calculate monthly trips
      const monthlyTrips = Math.round(driver.trips * 0.8);
      return `You have completed ${monthlyTrips} trips this month.`;
    }
    
    // Longest trip
    if (lowerInput.includes('longest') && 
        (lowerInput.includes('trip') || lowerInput.includes('ride'))) {
      return `Your longest trip today was 28.5 km from Dubai Mall to Dubai Airport, which took 42 minutes.`;
    }
    
    // Default trips response
    return `You have completed a total of ${driver.trips} trips, with ${driver.trips_today || 0} trips today.`;
  };

  // Process natural language queries about earnings
  const processEarningsQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    // Today's earnings
    if (lowerInput.includes('today') && 
        (lowerInput.includes('earn') || lowerInput.includes('money') || lowerInput.includes('income'))) {
      return `You have earned ${formatCurrency(driver.earnings_today || 0)} today.`;
    }
    
    // Total earnings
    if ((lowerInput.includes('total') || lowerInput.includes('all')) && 
        (lowerInput.includes('earn') || lowerInput.includes('money') || lowerInput.includes('income'))) {
      return `Your total earnings are ${formatCurrency(driver.earnings)}.`;
    }
    
    // This week's earnings
    if (lowerInput.includes('week') && 
        (lowerInput.includes('earn') || lowerInput.includes('money') || lowerInput.includes('income'))) {
      // In a real app, this would calculate weekly earnings
      const weeklyEarnings = Math.round(driver.earnings * 0.2);
      return `You have earned ${formatCurrency(weeklyEarnings)} this week.`;
    }
    
    // This month's earnings
    if (lowerInput.includes('month') && 
        (lowerInput.includes('earn') || lowerInput.includes('money') || lowerInput.includes('income'))) {
      // In a real app, this would calculate monthly earnings
      const monthlyEarnings = Math.round(driver.earnings * 0.8);
      return `You have earned ${formatCurrency(monthlyEarnings)} this month.`;
    }
    
    // Default earnings response
    return `Your total earnings are ${formatCurrency(driver.earnings)}, with ${formatCurrency(driver.earnings_today || 0)} earned today.`;
  };

  // Process natural language queries about fines
  const processFinesQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    const fines = getDriverFines(driver.id);
    
    // Pending fines
    if ((lowerInput.includes('pending') || lowerInput.includes('unpaid') || lowerInput.includes('owe')) && 
        lowerInput.includes('fine')) {
      const pendingFines = fines.filter(f => f.status === 'pending');
      const totalAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
      
      if (pendingFines.length === 0) {
        return `You don't have any pending fines. Great job!`;
      } else {
        return `You have ${pendingFines.length} pending fine${pendingFines.length > 1 ? 's' : ''} totaling AED ${totalAmount}. ${
          pendingFines.map(f => `\n• ${f.violation} (AED ${f.amount})`).join('')
        }`;
      }
    }
    
    // All fines
    if (lowerInput.includes('fine')) {
      if (fines.length === 0) {
        return `You don't have any fines. Keep up the good work!`;
      } else {
        const totalAmount = fines.reduce((sum, f) => sum + f.amount, 0);
        const pendingAmount = fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
        
        return `You have a total of ${fines.length} fine${fines.length > 1 ? 's' : ''} (AED ${totalAmount}), with AED ${pendingAmount} still pending payment.`;
      }
    }
    
    // Default fines response
    return `You have ${fines.length} fine${fines.length > 1 ? 's' : ''} on record.`;
  };

  // Process natural language queries about performance
  const processPerformanceQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    // Performance score
    if ((lowerInput.includes('performance') || lowerInput.includes('score') || lowerInput.includes('rating')) && 
        (lowerInput.includes('my') || lowerInput.includes('current'))) {
      let performanceMessage = `Your current performance score is ${driver.performanceScore}%. `;
      
      if (driver.performanceScore >= 90) {
        performanceMessage += `That's excellent! You're among our top performers.`;
      } else if (driver.performanceScore >= 80) {
        performanceMessage += `That's good! Keep up the good work.`;
      } else if (driver.performanceScore >= 70) {
        performanceMessage += `That's average. There's room for improvement.`;
      } else {
        performanceMessage += `This needs improvement. Let's work on bringing it up.`;
      }
      
      return performanceMessage;
    }
    
    // How to improve performance
    if ((lowerInput.includes('improve') || lowerInput.includes('increase') || lowerInput.includes('better')) && 
        (lowerInput.includes('performance') || lowerInput.includes('score') || lowerInput.includes('rating'))) {
      return `To improve your performance score:\n\n• Complete more trips daily\n• Increase your earnings\n• Maintain a high customer rating\n• Avoid traffic violations\n• Keep your vehicle clean and well-maintained`;
    }
    
    // Default performance response
    return `Your current performance score is ${driver.performanceScore}%. This is calculated based on your trips, earnings, and customer ratings.`;
  };

  // Process natural language queries about contracts
  const processContractQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    const contracts = getDriverContracts(driver.id);
    
    if (contracts.length === 0) {
      return `You don't have any active contracts in the system.`;
    }
    
    // Active contract
    const activeContract = contracts.find(c => c.status === 'active');
    
    if (!activeContract) {
      return `You don't have any active contracts right now.`;
    }
    
    // Contract details
    if ((lowerInput.includes('contract') || lowerInput.includes('agreement')) && 
        (lowerInput.includes('detail') || lowerInput.includes('info'))) {
      const daysRemaining = getDaysRemaining(activeContract.endDate);
      
      return `Your current contract (${activeContract.id}):\n\n• Vehicle: ${activeContract.vehicleId}\n• Monthly rent: AED ${activeContract.monthlyRent}\n• Start date: ${activeContract.startDate}\n• End date: ${activeContract.endDate}\n• Days remaining: ${daysRemaining}\n• Daily KM limit: ${activeContract.dailyKmLimit} km\n• Security deposit: AED ${activeContract.depositAmount}`;
    }
    
    // Contract expiry
    if ((lowerInput.includes('contract') || lowerInput.includes('agreement')) && 
        (lowerInput.includes('expir') || lowerInput.includes('end') || lowerInput.includes('renew'))) {
      const daysRemaining = getDaysRemaining(activeContract.endDate);
      
      if (daysRemaining <= 0) {
        return `Your contract has expired! Please contact the fleet manager to renew it.`;
      } else if (daysRemaining <= 30) {
        return `Your contract will expire in ${daysRemaining} days. Please contact the fleet manager to discuss renewal options.`;
      } else {
        return `Your contract will expire on ${activeContract.endDate}, which is ${daysRemaining} days from now.`;
      }
    }
    
    // Default contract response
    return `You have an active contract for vehicle ${activeContract.vehicleId} with a monthly rent of AED ${activeContract.monthlyRent}.`;
  };

  // Process natural language queries about vehicles
  const processVehicleQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    if (!driver.vehicleId) {
      return `You don't have any vehicle assigned to you right now.`;
    }
    
    // Vehicle details
    if ((lowerInput.includes('vehicle') || lowerInput.includes('car')) && 
        (lowerInput.includes('detail') || lowerInput.includes('info') || lowerInput.includes('which'))) {
      return `You are currently assigned to vehicle ${driver.vehicleId}. This is a Toyota Camry (White) with license plate ${driver.vehicleId}.`;
    }
    
    // Vehicle maintenance
    if ((lowerInput.includes('vehicle') || lowerInput.includes('car')) && 
        (lowerInput.includes('maintenance') || lowerInput.includes('service'))) {
      return `Your vehicle ${driver.vehicleId} is due for maintenance in 15 days. Please ensure it's brought to the service center on time.`;
    }
    
    // Default vehicle response
    return `You are currently assigned to vehicle ${driver.vehicleId}.`;
  };

  // Process natural language queries about shifts
  const processShiftQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    // Current shift
    if ((lowerInput.includes('shift') || lowerInput.includes('duty')) && 
        (lowerInput.includes('current') || lowerInput.includes('now') || lowerInput.includes('today'))) {
      if (driver.status === 'active') {
        return `You are currently on shift. Your shift started at 08:00 AM and will end at 06:00 PM.`;
      } else {
        return `You are not currently on shift. Your next scheduled shift is tomorrow from 08:00 AM to 06:00 PM.`;
      }
    }
    
    // Shift schedule
    if ((lowerInput.includes('shift') || lowerInput.includes('duty') || lowerInput.includes('schedule')) && 
        (lowerInput.includes('next') || lowerInput.includes('upcoming') || lowerInput.includes('tomorrow'))) {
      return `Your upcoming shifts:\n\n• Tomorrow: 08:00 AM - 06:00 PM\n• Wednesday: 08:00 AM - 06:00 PM\n• Thursday: 08:00 AM - 06:00 PM\n• Friday: 10:00 AM - 08:00 PM\n• Saturday: 10:00 AM - 08:00 PM`;
    }
    
    // Default shift response
    return `Your regular shift hours are 08:00 AM to 06:00 PM, Sunday through Thursday.`;
  };

  // Process natural language queries about warnings
  const processWarningsQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('warning') || lowerInput.includes('alert')) {
      // Check for performance warnings
      if (driver.performanceScore < 80) {
        return `You have a performance warning. Your current score is ${driver.performanceScore}%, which is below our minimum threshold of 80%. Please work on improving your performance.`;
      }
      
      // Check for pending fines
      const pendingFines = getDriverFines(driver.id).filter(f => f.status === 'pending');
      if (pendingFines.length > 0) {
        return `You have ${pendingFines.length} pending fine${pendingFines.length > 1 ? 's' : ''} that require attention. Please settle them as soon as possible.`;
      }
      
      // Check for contract expiry
      const activeContract = getDriverContracts(driver.id).find(c => c.status === 'active');
      if (activeContract) {
        const daysRemaining = getDaysRemaining(activeContract.endDate);
        if (daysRemaining <= 30 && daysRemaining > 0) {
          return `Your contract will expire in ${daysRemaining} days. Please contact the fleet manager to discuss renewal options.`;
        }
      }
      
      return `You don't have any warnings or alerts at this time. Keep up the good work!`;
    }
    
    return null; // Not a warnings query
  };

  // Process natural language queries about location
  const processLocationQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    if ((lowerInput.includes('location') || lowerInput.includes('where') || lowerInput.includes('position')) && 
        (lowerInput.includes('my') || lowerInput.includes('current'))) {
      return `Your current location is near Dubai Marina (25.2048°N, 55.2708°E). This information is being tracked for fleet management purposes.`;
    }
    
    return null; // Not a location query
  };

  // Process natural language queries about driver status
  const processStatusQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('status') || 
        (lowerInput.includes('am i') && (lowerInput.includes('active') || lowerInput.includes('online')))) {
      return `Your current status is ${driver.status === 'active' ? 'ACTIVE' : 'OFFLINE'}. ${
        driver.status === 'active' 
          ? 'You are currently tracking your location and available for trips.' 
          : 'You are not currently tracking your location or available for trips.'
      }`;
    }
    
    return null; // Not a status query
  };

  // Process natural language queries about driver profile
  const processProfileQuery = (input: string, driver: any) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('profile') || lowerInput.includes('my info') || lowerInput.includes('my details')) {
      return `**Your Profile Information:**\n\n• Name: ${driver.name}\n• Email: ${driver.email}\n• Phone: ${driver.phone}\n• Join Date: ${driver.joinDate}\n• Status: ${driver.status === 'active' ? 'Active' : 'Offline'}\n• Vehicle: ${driver.vehicleId || 'None assigned'}\n• Performance Score: ${driver.performanceScore}%`;
    }
    
    return null; // Not a profile query
  };

  // Process natural language queries about help
  const processHelpQuery = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput.includes('how to use')) {
      return `**I can help you with:**\n\n• **Trips & Earnings**: Ask about your trips and earnings for today, this week, or this month\n• **Performance**: Check your current performance score and get tips for improvement\n• **Fines**: View your pending fines and payment status\n• **Vehicle**: Get information about your assigned vehicle\n• **Contract/Shift**: Check your contract details or shift schedule\n• **Profile**: View your profile information\n\n**Try asking me questions like:**\n• "How many trips did I complete today?"\n• "What's my total earnings this month?"\n• "Do I have any pending fines?"\n• "When does my contract expire?"\n• "What's my current performance score?"\n• "What's my next shift?"`;
    }
    
    return null; // Not a help query
  };

  // Process natural language queries about bulk import
  const processBulkImportQuery = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('import') && 
        (lowerInput.includes('driver') || lowerInput.includes('bulk') || lowerInput.includes('excel') || lowerInput.includes('csv'))) {
      return `**Bulk Import Drivers**\n\nYou can import multiple drivers at once using our bulk import feature:\n\n1. Go to the Drivers page\n2. Click the "Bulk Import" button\n3. Upload a CSV or Excel file with your driver data\n4. Map the columns to the correct fields\n5. Click Import\n\nYou can also paste data directly from your spreadsheet into the import tool. Need a template? You can download one from the import screen.`;
    }
    
    return null; // Not a bulk import query
  };

  // Enhanced AI response logic with multilingual support
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Get the current driver (for driver-specific questions)
    const currentDriver = getCurrentDriver();
    
    // Process contract creation flow (existing functionality)
    if (conversationContext === 'creating_contract') {
      // Existing contract creation logic
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

    // Process driver-specific queries
    if (lowerInput.includes('my') || 
        lowerInput.includes('i') || 
        lowerInput.includes('me') || 
        lowerInput.includes('mine')) {
      
      // Process trips queries
      const tripsResponse = processTripsQuery(input, currentDriver);
      if (tripsResponse) return tripsResponse;
      
      // Process earnings queries
      const earningsResponse = processEarningsQuery(input, currentDriver);
      if (earningsResponse) return earningsResponse;
      
      // Process fines queries
      const finesResponse = processFinesQuery(input, currentDriver);
      if (finesResponse) return finesResponse;
      
      // Process performance queries
      const performanceResponse = processPerformanceQuery(input, currentDriver);
      if (performanceResponse) return performanceResponse;
      
      // Process contract queries
      const contractResponse = processContractQuery(input, currentDriver);
      if (contractResponse) return contractResponse;
      
      // Process vehicle queries
      const vehicleResponse = processVehicleQuery(input, currentDriver);
      if (vehicleResponse) return vehicleResponse;
      
      // Process shift queries
      const shiftResponse = processShiftQuery(input, currentDriver);
      if (shiftResponse) return shiftResponse;
      
      // Process warnings queries
      const warningsResponse = processWarningsQuery(input, currentDriver);
      if (warningsResponse) return warningsResponse;
      
      // Process location queries
      const locationResponse = processLocationQuery(input, currentDriver);
      if (locationResponse) return locationResponse;
      
      // Process status queries
      const statusResponse = processStatusQuery(input, currentDriver);
      if (statusResponse) return statusResponse;
      
      // Process profile queries
      const profileResponse = processProfileQuery(input, currentDriver);
      if (profileResponse) return profileResponse;
    }

    // Process help queries
    const helpResponse = processHelpQuery(input);
    if (helpResponse) return helpResponse;
    
    // Process bulk import queries
    const bulkImportResponse = processBulkImportQuery(input);
    if (bulkImportResponse) return bulkImportResponse;

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

    // Process queries about specific drivers
    for (const driver of mockDriversData) {
      if (lowerInput.includes(driver.name.toLowerCase())) {
        // Driver performance query
        if (lowerInput.includes('performance') || lowerInput.includes('score') || lowerInput.includes('rating')) {
          return `${driver.name}'s current performance score is ${driver.performanceScore}%. ${
            driver.performanceScore >= 90 ? 'This is excellent.' : 
            driver.performanceScore >= 80 ? 'This is good.' : 
            driver.performanceScore >= 70 ? 'This is average.' : 
            'This needs improvement.'
          }`;
        }
        
        // Driver earnings query
        if (lowerInput.includes('earn') || lowerInput.includes('money') || lowerInput.includes('income')) {
          return `${driver.name} has earned a total of ${formatCurrency(driver.earnings)} to date, with ${formatCurrency(driver.earnings_today || 0)} earned today.`;
        }
        
        // Driver trips query
        if (lowerInput.includes('trip') || lowerInput.includes('ride')) {
          return `${driver.name} has completed a total of ${driver.trips} trips, with ${driver.trips_today || 0} trips today.`;
        }
        
        // Driver fines query
        if (lowerInput.includes('fine') || lowerInput.includes('penalty')) {
          const driverFines = getDriverFines(driver.id);
          const pendingFines = driverFines.filter(f => f.status === 'pending');
          
          if (driverFines.length === 0) {
            return `${driver.name} doesn't have any fines.`;
          } else {
            const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
            const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
            
            return `${driver.name} has ${driverFines.length} fine${driverFines.length > 1 ? 's' : ''} totaling AED ${totalAmount}, with ${pendingFines.length} pending (AED ${pendingAmount}).`;
          }
        }
        
        // Driver contract query
        if (lowerInput.includes('contract')) {
          const driverContracts = getDriverContracts(driver.id);
          const activeContract = driverContracts.find(c => c.status === 'active');
          
          if (!activeContract) {
            return `${driver.name} doesn't have any active contracts.`;
          } else {
            const daysRemaining = getDaysRemaining(activeContract.endDate);
            
            return `${driver.name} has an active contract (${activeContract.id}) for vehicle ${activeContract.vehicleId} with a monthly rent of AED ${activeContract.monthlyRent}. The contract ${
              daysRemaining <= 0 ? 'has expired' : `expires in ${daysRemaining} days`
            }.`;
          }
        }
        
        // Driver vehicle query
        if (lowerInput.includes('vehicle') || lowerInput.includes('car')) {
          if (!driver.vehicleId) {
            return `${driver.name} doesn't have any vehicle assigned.`;
          } else {
            return `${driver.name} is assigned to vehicle ${driver.vehicleId}.`;
          }
        }
        
        // Driver status query
        if (lowerInput.includes('status') || lowerInput.includes('active') || lowerInput.includes('online')) {
          return `${driver.name} is currently ${driver.status === 'active' ? 'ACTIVE' : 'OFFLINE'}.`;
        }
        
        // General driver info
        return `**Driver Information: ${driver.name}**\n\n• Status: ${driver.status === 'active' ? 'Active' : 'Offline'}\n• Email: ${driver.email}\n• Phone: ${driver.phone}\n• Join Date: ${driver.joinDate}\n• Performance Score: ${driver.performanceScore}%\n• Total Trips: ${driver.trips}\n• Total Earnings: ${formatCurrency(driver.earnings)}\n• Vehicle: ${driver.vehicleId || 'None assigned'}`;
      }
    }

    // Default response for unrecognized queries with multilingual support
    const defaultResponses = {
      en: `I'm here to help with any questions about your fleet management. You can ask me about:\n\n• Your trips and earnings\n• Your performance score\n• Your fines and payments\n• Your vehicle and contract details\n• Your shift schedule\n• Specific drivers in your fleet\n\nFor example, try asking:\n• "How many trips did I complete today?"\n• "What's my total earnings this month?"\n• "Do I have any pending fines?"\n• "When does my contract expire?"\n• "What's my current performance score?"\n• "Show me Ahmed's contract details"`,
      ar: `أنا هنا للمساعدة في أي أسئلة حول إدارة أسطولك. يمكنك أن تسألني عن:\n\n• رحلاتك وأرباحك\n• درجة أدائك\n• مخالفاتك ومدفوعاتك\n• تفاصيل مركبتك وعقدك\n• جدول مناوبتك\n• سائقين محددين في أسطولك\n\nعلى سبيل المثال، جرب أن تسأل:\n• "كم عدد الرحلات التي أكملتها اليوم؟"\n• "ما هو إجمالي أرباحي هذا الشهر؟"\n• "هل لدي أي مخالفات معلقة؟"\n• "متى ينتهي عقدي؟"\n• "ما هي درجة أدائي الحالية؟"\n• "أظهر لي تفاصيل عقد أحمد"`,
      hi: `मैं आपके फ्लीट प्रबंधन के बारे में किसी भी प्रश्न में मदद करने के लिए यहां हूं। आप मुझसे इन चीजों के बारे में पूछ सकते हैं:\n\n• आपकी यात्राएं और कमाई\n• आपका प्रदर्शन स्कोर\n• आपके जुर्माने और भुगतान\n• आपके वाहन और अनुबंध विवरण\n• आपका शिफ्ट शेड्यूल\n• आपके फ्लीट में विशिष्ट ड्राइवर\n\nउदाहरण के लिए, यह पूछने का प्रयास करें:\n• "आज मैंने कितनी यात्राएं पूरी कीं?"\n• "इस महीने मेरी कुल कमाई क्या है?"\n• "क्या मेरे कोई लंबित जुर्माने हैं?"\n• "मेरा अनुबंध कब समाप्त होता है?"\n• "मेरा वर्तमान प्रदर्शन स्कोर क्या है?"\n• "मुझे अहमद के अनुबंध विवरण दिखाएं"`,
      ur: `میں آپ کے فلیٹ منیجمنٹ کے بارے میں کسی بھی سوال میں مدد کرنے کے لیے یہاں ہوں۔ آپ مجھ سے ان چیزوں کے بارے میں پوچھ سکتے ہیں:\n\n• آپ کے سفر اور کمائی\n• آپ کا کارکردگی اسکور\n• آپ کے جرمانے اور ادائیگیاں\n• آپ کی گاڑی اور کنٹریکٹ کی تفصیلات\n• آپ کا شفٹ شیڈول\n• آپ کے فلیٹ میں مخصوص ڈرائیورز\n\nمثال کے طور پر، یہ پوچھنے کی کوشش کریں:\n• "آج میں نے کتنے سفر مکمل کیے؟"\n• "اس مہینے میری کل کمائی کیا ہے؟"\n• "کیا میرے کوئی زیر التواء جرمانے ہیں؟"\n• "میرا کنٹریکٹ کب ختم ہوتا ہے؟"\n• "میرا موجودہ کارکردگی اسکور کیا ہے؟"\n• "مجھے احمد کے کنٹریکٹ کی تفصیلات دکھائیں"`
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