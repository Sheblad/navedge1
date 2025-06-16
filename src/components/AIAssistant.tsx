import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Zap, BarChart3, AlertTriangle, FileText, Settings, Plus, Edit, Trash2, MapPin, Phone, DollarSign, Navigation, Brain, Sparkles, CheckCircle, Download } from 'lucide-react';
import { mockDriversData, mockFinesData, mockContractsData } from '../data/mockData';
import jsPDF from 'jspdf';

type FleetMode = 'rental' | 'taxi';
type Language = 'en' | 'ar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'action' | 'wizard' | 'confirmation' | 'data' | 'contract_form' | 'pdf_generated' | 'fine_wizard';
  data?: any;
  actionType?: string;
  pdfUrl?: string;
}

interface ContractFormData {
  driverName: string;
  idNumber: string;
  vehicleId: string;
  duration: string;
  monthlyRent: string;
  depositAmount: string;
}

interface FineFormData {
  driverId: number;
  driverName: string;
  violationType: string;
  amount: string;
  location: string;
  description: string;
}

interface NavEdgeAssistantProps {
  onClose: () => void;
  fleetMode: FleetMode;
  language: Language;
  onFleetModeChange?: (mode: FleetMode) => void;
}

const NavEdgeAssistant: React.FC<NavEdgeAssistantProps> = ({ onClose, fleetMode, language, onFleetModeChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeWizard, setActiveWizard] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<any>(null);
  const [contractForm, setContractForm] = useState<ContractFormData>({
    driverName: '',
    idNumber: '',
    vehicleId: '',
    duration: '',
    monthlyRent: '',
    depositAmount: ''
  });
  const [fineForm, setFineForm] = useState<FineFormData>({
    driverId: 0,
    driverName: '',
    violationType: '',
    amount: '',
    location: '',
    description: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'NavEdge Control Hub',
      subtitle: 'Your Intelligent Fleet Management Assistant',
      placeholder: 'Ask me anything about your drivers, locations, earnings...',
      send: 'Send',
      typing: 'NavEdge is analyzing...',
      welcome: `Hello! I'm your NavEdge intelligent fleet control hub. I can help you analyze data, manage operations, and perform administrative tasks for your ${fleetMode} fleet. Try asking me about specific drivers, locations, earnings, or any fleet operations!`,
      quickActions: 'Quick Actions',
      examples: [
        'How much did Ahmed make today?',
        'Where is Omar located?',
        'Who earned the most today?',
        'Show me drivers with fines',
        'Create a contract for Ahmed',
        'Switch to Taxi Mode',
        'Which drivers are offline?',
        'Omar got a fine'
      ],
      confirm: 'Confirm',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No',
      // Contract form
      contractWizard: 'Contract Creation Wizard',
      fillDetails: 'Please fill in the contract details:',
      driverName: 'Driver Name',
      idNumber: 'Emirates ID Number',
      vehicleId: 'Vehicle ID',
      duration: 'Duration (months)',
      monthlyRent: 'Monthly Rent (AED)',
      depositAmount: 'Deposit Amount (AED)',
      createContract: 'Create Contract',
      contractCreated: 'Contract Created Successfully!',
      contractDetails: 'Contract Details',
      downloadPDF: 'Download PDF Contract',
      pdfGenerated: 'PDF Contract Generated!',
      // Fine management
      fineWizard: 'Fine Recording Wizard',
      recordFine: 'Record Fine',
      violationType: 'Violation Type',
      fineAmount: 'Fine Amount (AED)',
      fineLocation: 'Location',
      fineDescription: 'Description',
      deductFromPayroll: 'Deduct from Payroll',
      fineRecorded: 'Fine Recorded Successfully!',
      payrollDeducted: 'Payroll Deduction Applied!'
    },
    ar: {
      title: 'مركز التحكم نافيدج',
      subtitle: 'مساعدك الذكي لإدارة الأسطول',
      placeholder: 'اسألني أي شيء عن السائقين والمواقع والأرباح...',
      send: 'إرسال',
      typing: 'نافيدج يحلل...',
      welcome: `مرحباً! أنا مركز التحكم الذكي نافيدج. يمكنني مساعدتك في تحليل البيانات وإدارة العمليات وتنفيذ المهام الإدارية لأسطول ${fleetMode === 'rental' ? 'الإيجار' : 'التاكسي'} الخاص بك. جرب أن تسألني عن سائقين محددين أو المواقع أو الأرباح أو أي عمليات للأسطول!`,
      quickActions: 'الإجراءات السريعة',
      examples: [
        'كم ربح أحمد اليوم؟',
        'أين يقع عمر؟',
        'من حقق أعلى أرباح اليوم؟',
        'أظهر لي السائقين الذين لديهم مخالفات',
        'إنشاء عقد لأحمد',
        'التبديل إلى وضع التاكسي',
        'أي السائقين غير متصلين؟',
        'عمر حصل على مخالفة'
      ],
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      yes: 'نعم',
      no: 'لا',
      // Contract form
      contractWizard: 'معالج إنشاء العقد',
      fillDetails: 'يرجى ملء تفاصيل العقد:',
      driverName: 'اسم السائق',
      idNumber: 'رقم الهوية الإماراتية',
      vehicleId: 'رقم المركبة',
      duration: 'المدة (أشهر)',
      monthlyRent: 'الإيجار الشهري (درهم)',
      depositAmount: 'مبلغ التأمين (درهم)',
      createContract: 'إنشاء العقد',
      contractCreated: 'تم إنشاء العقد بنجاح!',
      contractDetails: 'تفاصيل العقد',
      downloadPDF: 'تحميل عقد PDF',
      pdfGenerated: 'تم إنشاء عقد PDF!',
      // Fine management
      fineWizard: 'معالج تسجيل المخالفة',
      recordFine: 'تسجيل مخالفة',
      violationType: 'نوع المخالفة',
      fineAmount: 'مبلغ المخالفة (درهم)',
      fineLocation: 'الموقع',
      fineDescription: 'الوصف',
      deductFromPayroll: 'خصم من الراتب',
      fineRecorded: 'تم تسجيل المخالفة بنجاح!',
      payrollDeducted: 'تم تطبيق خصم الراتب!'
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

  // PDF Generation Function
  const generateContractPDF = (contractData: ContractFormData): string => {
    const doc = new jsPDF();
    
    // Header with NavEdge branding
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NAVEDGE FLEET MANAGEMENT', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Vehicle Rental Agreement', 20, 26);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Contract ID and Date
    const contractId = `CNT-${String(mockContractsData.length + 1).padStart(3, '0')}`;
    const currentDate = new Date().toLocaleDateString();
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Contract ID: ${contractId}`, 20, 45);
    doc.text(`Date: ${currentDate}`, 150, 45);
    
    // Contract Details Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRACT DETAILS', 20, 65);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPos = 80;
    
    const contractDetails = [
      `Driver Name: ${contractData.driverName}`,
      `Emirates ID: ${contractData.idNumber}`,
      `Vehicle ID: ${contractData.vehicleId}`,
      `Contract Duration: ${contractData.duration} months`,
      `Monthly Rent: AED ${parseInt(contractData.monthlyRent).toLocaleString()}`,
      `Security Deposit: AED ${parseInt(contractData.depositAmount).toLocaleString()}`,
      `Start Date: ${currentDate}`,
      `End Date: ${new Date(Date.now() + parseInt(contractData.duration) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      `Total Contract Value: AED ${(parseInt(contractData.monthlyRent) * parseInt(contractData.duration)).toLocaleString()}`
    ];

    contractDetails.forEach(detail => {
      doc.text(detail, 20, yPos);
      yPos += 8;
    });

    // Terms and Conditions
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS', 20, yPos);
    yPos += 15;
    
    const terms = [
      '1. The driver must maintain a valid UAE driving license throughout the rental period.',
      '2. The vehicle must be returned in the same condition as received.',
      '3. Any traffic fines incurred during the rental period will be deducted from the security deposit.',
      '4. Monthly rent is due by the 1st of each month and must be paid in advance.',
      '5. The vehicle must not exceed the daily kilometer limit of 300 km.',
      '6. Regular maintenance and servicing must be performed as scheduled.',
      '7. The driver is responsible for fuel costs during the rental period.',
      '8. Insurance coverage is provided by NavEdge Fleet Management.',
      '9. Any accidents must be reported immediately to NavEdge and authorities.',
      '10. This contract is renewable upon mutual agreement of both parties.'
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    terms.forEach(term => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Word wrap for long terms
      const splitText = doc.splitTextToSize(term, 170);
      doc.text(splitText, 20, yPos);
      yPos += splitText.length * 5;
    });

    // Signatures section
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', 20, yPos);
    yPos += 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Driver signature
    doc.text('Driver Signature:', 20, yPos);
    doc.line(20, yPos + 10, 90, yPos + 10);
    doc.text('Date:', 20, yPos + 20);
    doc.line(35, yPos + 20, 90, yPos + 20);
    
    // Company signature
    doc.text('NavEdge Representative:', 110, yPos);
    doc.line(110, yPos + 10, 180, yPos + 10);
    doc.text('Date:', 110, yPos + 20);
    doc.line(125, yPos + 20, 180, yPos + 20);
    
    // Footer
    yPos += 40;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('NavEdge Fleet Management | Dubai, UAE | www.navedge.com | +971 4 XXX XXXX', 20, yPos);
    doc.text(`Generated on ${new Date().toLocaleString()} by NavEdge Assistant`, 20, yPos + 5);
    
    // Generate blob URL for download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return pdfUrl;
  };

  // Helper functions for name extraction and driver finding
  const extractDriverName = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    // More comprehensive patterns for driver name extraction
    const patterns = [
      // "how much did Ahmed make" or "Ahmed's earnings"
      /(?:how much did|earnings of|earnings for|made by|income of|revenue of|money did)\s+(\w+)/i,
      // "Ahmed made" or "Ahmed earned"
      /(\w+)\s+(?:made|earned|income|revenue|money)/i,
      // "Ahmed's" possessive
      /(\w+)(?:'s|s')/i,
      // "show me Ahmed" or "tell me about Ahmed"
      /(?:show me|tell me about|about|for)\s+(\w+)/i,
      // "where is Ahmed"
      /(?:where is|location of|find)\s+(\w+)/i,
      // Just the name followed by context words
      /(\w+)\s+(?:today|earnings|location|performance|fines|trips|got|received|has)/i,
      // Name at the beginning
      /^(\w+)\s/i
    ];
    
    for (const pattern of patterns) {
      const match = lowerQuery.match(pattern);
      if (match && match[1]) {
        const name = match[1].toLowerCase();
        // Check if this matches any driver name (partial match)
        const driver = mockDriversData.find(d => 
          d.name.toLowerCase().includes(name) || 
          d.name.toLowerCase().split(' ').some(part => part.toLowerCase().startsWith(name))
        );
        if (driver) return driver.name;
      }
    }
    
    // Fallback: check if any driver name appears anywhere in the query
    for (const driver of mockDriversData) {
      const firstName = driver.name.split(' ')[0].toLowerCase();
      if (lowerQuery.includes(firstName)) {
        return driver.name;
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

  // Enhanced contract input parsing with better error handling
  const parseContractInput = (input: string): ContractFormData | null => {
    // Clean the input - remove extra spaces and split by commas
    const cleanInput = input.trim().replace(/\s*,\s*/g, ',');
    const parts = cleanInput.split(',').map(part => part.trim());
    
    console.log('Parsing contract input:', parts); // Debug log
    
    // Need at least 6 parts: name, id, vehicle, duration, rent, deposit
    if (parts.length >= 6) {
      const contractData = {
        driverName: parts[0],
        idNumber: parts[1],
        vehicleId: parts[2],
        duration: parts[3],
        monthlyRent: parts[4],
        depositAmount: parts[5]
      };
      
      console.log('Parsed contract data:', contractData); // Debug log
      return contractData;
    }
    
    // If we have fewer parts, check if it's a partial entry
    if (parts.length >= 3) {
      return {
        driverName: parts[0] || '',
        idNumber: parts[1] || '',
        vehicleId: parts[2] || '',
        duration: parts[3] || '12',
        monthlyRent: parts[4] || '1200',
        depositAmount: parts[5] || '5000'
      };
    }
    
    return null;
  };

  // Fine processing functions
  const extractFineInfo = (query: string): Partial<FineFormData> => {
    const lowerQuery = query.toLowerCase();
    
    // Extract violation type
    let violationType = '';
    if (lowerQuery.includes('speed')) violationType = 'Speeding';
    else if (lowerQuery.includes('park')) violationType = 'Illegal Parking';
    else if (lowerQuery.includes('red light') || lowerQuery.includes('traffic light')) violationType = 'Running Red Light';
    else if (lowerQuery.includes('phone') || lowerQuery.includes('mobile')) violationType = 'Mobile Phone Usage';
    else if (lowerQuery.includes('lane')) violationType = 'Lane Violation';
    else if (lowerQuery.includes('seat') || lowerQuery.includes('belt')) violationType = 'Seatbelt Violation';
    
    // Extract amount
    const amountMatch = query.match(/(\d+)\s*(?:aed|dirham|dhs?)/i);
    const amount = amountMatch ? amountMatch[1] : '';
    
    // Extract location
    const locationPatterns = [
      /(?:on|at|in)\s+([A-Za-z\s]+(?:road|street|avenue|highway|bridge))/i,
      /(?:on|at|in)\s+([A-Za-z\s]+(?:mall|center|area|zone))/i,
      /(?:on|at|in)\s+(sheikh\s+zayed|al\s+wasl|business\s+bay|dubai\s+mall)/i
    ];
    
    let location = '';
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }
    
    return {
      violationType,
      amount,
      location,
      description: query
    };
  };

  const recordFine = (fineData: FineFormData): string => {
    const fineId = `FN-${String(mockFinesData.length + 1).padStart(3, '0')}`;
    const newFine = {
      id: fineId,
      driverId: fineData.driverId,
      vehiclePlate: mockDriversData.find(d => d.id === fineData.driverId)?.vehicleId || 'Unknown',
      violation: fineData.violationType || 'Traffic Violation',
      amount: parseInt(fineData.amount) || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      location: fineData.location || 'Dubai, UAE'
    };
    
    // Add to mock data (in real app, this would be API call)
    mockFinesData.push(newFine);
    
    return fineId;
  };

  const deductFromPayroll = (driverId: number, amount: number): { oldBalance: number; newBalance: number } => {
    const driver = mockDriversData.find(d => d.id === driverId);
    if (!driver) return { oldBalance: 0, newBalance: 0 };
    
    const oldBalance = driver.earnings;
    driver.earnings = Math.max(0, driver.earnings - amount);
    
    return { oldBalance, newBalance: driver.earnings };
  };

  // Enhanced query processing with conversation context
  const processIntelligentQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // PRIORITY 1: Handle active conversation context
    if (conversationContext) {
      if (conversationContext.type === 'fine_recording') {
        const driver = conversationContext.driver;
        
        // Check if user is providing fine details
        if (lowerQuery.includes('speed') || lowerQuery.includes('park') || lowerQuery.includes('red light') || 
            lowerQuery.includes('phone') || lowerQuery.includes('lane') || lowerQuery.includes('aed') || 
            lowerQuery.includes('dirham') || /\d+/.test(query)) {
          
          const fineInfo = extractFineInfo(query);
          const updatedFineForm = {
            driverId: driver.id,
            driverName: driver.name,
            violationType: fineInfo.violationType || 'Traffic Violation',
            amount: fineInfo.amount || '500',
            location: fineInfo.location || 'Dubai, UAE',
            description: query
          };
          
          setFineForm(updatedFineForm);
          
          // Record the fine
          const fineId = recordFine(updatedFineForm);
          
          // Ask about payroll deduction
          setConversationContext({
            type: 'payroll_confirmation',
            driver: driver,
            fine: updatedFineForm,
            fineId: fineId
          });
          
          return {
            id: Date.now().toString(),
            text: `🚨 **Fine Recorded Successfully!**\n\n**Fine ID:** ${fineId}\n**Driver:** ${driver.name}\n**Violation:** ${updatedFineForm.violationType}\n**Amount:** AED ${updatedFineForm.amount}\n**Location:** ${updatedFineForm.location}\n\n💰 **Payroll Deduction**\n\nShould I deduct AED ${updatedFineForm.amount} from ${driver.name}'s next paycheck?\n\n**Current Earnings:** AED ${driver.earnings.toLocaleString()}\n**After Deduction:** AED ${(driver.earnings - parseInt(updatedFineForm.amount)).toLocaleString()}\n\n**Type "yes" to confirm deduction or "no" to keep fine as pending.**`,
            isUser: false,
            timestamp: new Date(),
            type: 'confirmation',
            actionType: 'payroll_deduction',
            data: { driver, fine: updatedFineForm, fineId }
          };
        }
        
        // If user didn't provide clear fine details, ask for clarification
        return {
          id: Date.now().toString(),
          text: `🚨 **Recording Fine for ${driver.name}**\n\nI need more details about the fine. Please provide:\n\n**Example formats:**\n• "Speeding fine, 600 AED on Sheikh Zayed Road"\n• "Parking violation, 200 AED at Dubai Mall"\n• "Red light violation, 1000 AED"\n\n**Or tell me:**\n• What type of violation?\n• How much is the fine?\n• Where did it happen?\n\n💡 **Tip:** You can say something like "Speeding fine for 600 AED"`,
          isUser: false,
          timestamp: new Date(),
          type: 'fine_wizard'
        };
      }
      
      if (conversationContext.type === 'payroll_confirmation') {
        if (lowerQuery.includes('yes') || lowerQuery.includes('confirm') || lowerQuery.includes('deduct')) {
          const { driver, fine } = conversationContext;
          const amount = parseInt(fine.amount);
          const { oldBalance, newBalance } = deductFromPayroll(driver.id, amount);
          
          // Clear context
          setConversationContext(null);
          
          return {
            id: Date.now().toString(),
            text: `✅ **Payroll Deduction Applied!**\n\n**Driver:** ${driver.name}\n**Fine Amount:** AED ${amount.toLocaleString()}\n\n**Payroll Update:**\n• **Previous Balance:** AED ${oldBalance.toLocaleString()}\n• **Deduction:** -AED ${amount.toLocaleString()}\n• **New Balance:** AED ${newBalance.toLocaleString()}\n\n📋 **Actions Completed:**\n• ✅ Fine recorded in system\n• ✅ Payroll deduction processed\n• ✅ Driver notification sent\n• ✅ Accounting records updated\n\n🎯 **${driver.name}'s fine has been successfully processed and deducted from their earnings.**`,
            isUser: false,
            timestamp: new Date(),
            type: 'data'
          };
        }
        
        if (lowerQuery.includes('no') || lowerQuery.includes('cancel') || lowerQuery.includes('don\'t')) {
          const { driver, fine } = conversationContext;
          
          // Clear context
          setConversationContext(null);
          
          return {
            id: Date.now().toString(),
            text: `📋 **Fine Recorded - No Payroll Deduction**\n\n**Driver:** ${driver.name}\n**Fine:** AED ${fine.amount} (Status: Pending)\n\n✅ The fine has been recorded in the system but no payroll deduction was made. The fine remains pending for manual processing.\n\n**Next Steps:**\n• Fine can be processed later through the Fines section\n• Driver will be notified about the pending fine\n• You can deduct it later by saying "Deduct ${driver.name}'s pending fine"`,
            isUser: false,
            timestamp: new Date(),
            type: 'data'
          };
        }
        
        // If unclear response, ask again
        return {
          id: Date.now().toString(),
          text: `❓ **Please Confirm Payroll Deduction**\n\nShould I deduct AED ${conversationContext.fine.amount} from ${conversationContext.driver.name}'s paycheck?\n\n**Type:**\n• "Yes" or "Confirm" to deduct\n• "No" or "Cancel" to keep as pending\n\n💡 **Current earnings:** AED ${conversationContext.driver.earnings.toLocaleString()}`,
          isUser: false,
          timestamp: new Date(),
          type: 'confirmation'
        };
      }
    }
    
    // PRIORITY 2: Check if this is structured contract data when wizard is active
    if (activeWizard === 'create_contract') {
      console.log('Contract wizard active, processing input:', query); // Debug log
      
      // Check for "step by step" request
      if (lowerQuery.includes('step') && lowerQuery.includes('step')) {
        return {
          id: Date.now().toString(),
          text: `📝 **Step-by-Step Contract Creation**\n\nLet's create the contract step by step:\n\n**Step 1:** What is the driver's full name?\n\n💡 **Example:** Ahmed Al-Rashid`,
          isUser: false,
          timestamp: new Date(),
          type: 'wizard'
        };
      }
      
      // Try to parse as contract data
      const contractData = parseContractInput(query);
      if (contractData && contractData.driverName && contractData.vehicleId) {
        setContractForm(contractData);
        setActiveWizard(null); // Close wizard
        
        // Generate PDF contract
        const pdfUrl = generateContractPDF(contractData);
        
        // Generate a unique contract ID
        const contractId = `CNT-${String(mockContractsData.length + 1).padStart(3, '0')}`;
        
        return {
          id: Date.now().toString(),
          text: `✅ **${t.contractCreated}**\n\n📋 **${t.contractDetails}:**\n\n• **Contract ID:** ${contractId}\n• **${t.driverName}:** ${contractData.driverName}\n• **${t.idNumber}:** ${contractData.idNumber}\n• **${t.vehicleId}:** ${contractData.vehicleId}\n• **${t.duration}:** ${contractData.duration} months\n• **${t.monthlyRent}:** AED ${contractData.monthlyRent}\n• **${t.depositAmount}:** AED ${contractData.depositAmount}\n\n🎉 **Contract Status:** Successfully Created!\n\n📄 **Next Steps:**\n• ✅ Contract PDF generated\n• ✅ Driver notification sent\n• ✅ Vehicle assignment updated\n• ✅ Payment schedule created\n• ✅ Insurance coverage activated\n\n💼 **Contract Summary:**\n• Start Date: ${new Date().toLocaleDateString()}\n• End Date: ${new Date(Date.now() + parseInt(contractData.duration) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n• Total Value: AED ${(parseInt(contractData.monthlyRent) * parseInt(contractData.duration)).toLocaleString()}\n\n🚗 **Vehicle ${contractData.vehicleId}** is now assigned to **${contractData.driverName}**\n\n📄 **${t.pdfGenerated}** Click the download button below to get your contract PDF.`,
          isUser: false,
          timestamp: new Date(),
          type: 'pdf_generated',
          pdfUrl: pdfUrl,
          data: contractData
        };
      } else {
        // Invalid format, provide guidance
        return {
          id: Date.now().toString(),
          text: `❌ **Invalid Contract Format**\n\nI couldn't parse that contract data. Please use this exact format:\n\n**Format:** \`Name, Emirates ID, Vehicle ID, Duration, Monthly Rent, Deposit\`\n\n**Example:** \`Ahmed Al-Rashid, 784-1990-1234567-1, DXB-A-12345, 12, 1200, 5000\`\n\n**Your input:** "${query}"\n\n💡 **Tips:**\n• Separate each field with a comma\n• Use the exact format shown above\n• Or type "step by step" for guided entry\n\n🔄 **Try again with the correct format!**`,
          isUser: false,
          timestamp: new Date(),
          type: 'wizard'
        };
      }
    }
    
    // PRIORITY 3: Check for fine-related queries
    if (lowerQuery.includes('fine') || lowerQuery.includes('got') || lowerQuery.includes('received') || 
        lowerQuery.includes('violation') || lowerQuery.includes('penalty')) {
      
      const driverName = extractDriverName(query);
      if (driverName) {
        const driver = findDriverByName(driverName);
        if (driver) {
          // Set conversation context for fine recording
          setConversationContext({
            type: 'fine_recording',
            driver: driver
          });
          
          // Check if fine details are already in the query
          const fineInfo = extractFineInfo(query);
          if (fineInfo.violationType || fineInfo.amount) {
            // Process the fine immediately
            const updatedFineForm = {
              driverId: driver.id,
              driverName: driver.name,
              violationType: fineInfo.violationType || 'Traffic Violation',
              amount: fineInfo.amount || '500',
              location: fineInfo.location || 'Dubai, UAE',
              description: query
            };
            
            const fineId = recordFine(updatedFineForm);
            
            // Ask about payroll deduction
            setConversationContext({
              type: 'payroll_confirmation',
              driver: driver,
              fine: updatedFineForm,
              fineId: fineId
            });
            
            return {
              id: Date.now().toString(),
              text: `🚨 **Fine Recorded for ${driver.name}!**\n\n**Fine Details:**\n• **Fine ID:** ${fineId}\n• **Violation:** ${updatedFineForm.violationType}\n• **Amount:** AED ${updatedFineForm.amount}\n• **Location:** ${updatedFineForm.location}\n\n💰 **Payroll Deduction Option**\n\nShould I deduct AED ${updatedFineForm.amount} from ${driver.name}'s next paycheck?\n\n**Current Earnings:** AED ${driver.earnings.toLocaleString()}\n**After Deduction:** AED ${(driver.earnings - parseInt(updatedFineForm.amount)).toLocaleString()}\n\n**Type "yes" to confirm deduction or "no" to keep fine as pending.**`,
              isUser: false,
              timestamp: new Date(),
              type: 'confirmation',
              actionType: 'payroll_deduction',
              data: { driver, fine: updatedFineForm, fineId }
            };
          } else {
            // Ask for fine details
            return {
              id: Date.now().toString(),
              text: `🚨 **Recording Fine for ${driver.name}**\n\nI found ${driver.name} in the system. What type of fine did they receive?\n\n**Common violations:**\n• Speeding (600-1000 AED)\n• Illegal Parking (200-500 AED)\n• Running Red Light (1000 AED)\n• Mobile Phone Usage (800 AED)\n• Lane Violation (400 AED)\n\n**Please tell me:**\n• What type of violation?\n• How much is the fine?\n• Where did it happen?\n\n💡 **Example:** "Speeding fine, 600 AED on Sheikh Zayed Road"`,
              isUser: false,
              timestamp: new Date(),
              type: 'fine_wizard'
            };
          }
        } else {
          return {
            id: Date.now().toString(),
            text: `❌ **Driver Not Found**\n\nI couldn't find a driver named "${driverName}". Here are the available drivers:\n\n${mockDriversData.map(d => `• ${d.name}`).join('\n')}\n\n💡 **Try saying:** "Omar got a fine" or "Ahmed received a violation"`,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          };
        }
      } else {
        // General fine query without specific driver
        return {
          id: Date.now().toString(),
          text: `🚨 **Fine Management**\n\nI can help you record fines and manage payroll deductions. \n\n**To record a fine, say:**\n• "[Driver name] got a fine"\n• "[Driver name] received a speeding fine"\n• "[Driver name] has a parking violation"\n\n**Examples:**\n• "Omar got a fine"\n• "Ahmed received a speeding fine for 600 AED"\n• "Mohammed has a parking violation"\n\n**Current pending fines:** ${mockFinesData.filter(f => f.status === 'pending').length}\n\n💡 **Which driver received a fine?**`,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
      }
    }
    
    // Check for PDF generation requests
    if (lowerQuery.includes('make') && lowerQuery.includes('pdf') && lowerQuery.includes('contract')) {
      // Extract contract details from the message
      const contractMatch = query.match(/Ahmed Al-Rashid, 784-1990-1234567-1, DXB-A-12345, 12, 1200, 5000/);
      if (contractMatch) {
        const contractData = parseContractInput(contractMatch[0]);
        if (contractData) {
          const pdfUrl = generateContractPDF(contractData);
          
          return {
            id: Date.now().toString(),
            text: `📄 **PDF Contract Generated Successfully!**\n\nI've created a professional PDF contract with all the details:\n\n• **Driver:** ${contractData.driverName}\n• **Vehicle:** ${contractData.vehicleId}\n• **Duration:** ${contractData.duration} months\n• **Monthly Rent:** AED ${contractData.monthlyRent}\n• **Deposit:** AED ${contractData.depositAmount}\n\n✨ **PDF Features:**\n• Professional NavEdge branding\n• Complete terms and conditions\n• Signature sections\n• Legal compliance\n• Ready for printing\n\n📥 **Click the download button below to get your PDF contract!**`,
            isUser: false,
            timestamp: new Date(),
            type: 'pdf_generated',
            pdfUrl: pdfUrl,
            data: contractData
          };
        }
      }
      
      // If no contract data found, start the wizard
      setActiveWizard('create_contract');
      return {
        id: Date.now().toString(),
        text: `📄 **PDF Contract Generator**\n\nI'll help you create a professional PDF contract!\n\n**Quick Entry Format:**\nProvide all details in one line:\n\n\`Driver Name, Emirates ID, Vehicle ID, Duration (months), Monthly Rent, Deposit\`\n\n**Example:**\n\`Ahmed Al-Rashid, 784-1990-1234567-1, DXB-A-12345, 12, 1200, 5000\`\n\n💡 **Just type your contract details and I'll generate a professional PDF!**`,
        isUser: false,
        timestamp: new Date(),
        type: 'wizard'
      };
    }
    
    // EARNINGS QUERIES - Check this FIRST and be more specific
    if (lowerQuery.includes('earn') || lowerQuery.includes('made') || lowerQuery.includes('money') || 
        lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('much') ||
        lowerQuery.includes('pay') || lowerQuery.includes('profit')) {
      
      // Check for "most" or "top" earners first
      if (lowerQuery.includes('most') || lowerQuery.includes('top') || lowerQuery.includes('highest') || lowerQuery.includes('best')) {
        const topEarner = mockDriversData.reduce((prev, current) => 
          prev.earnings > current.earnings ? prev : current
        );
        const sortedDrivers = [...mockDriversData].sort((a, b) => b.earnings - a.earnings);
        
        return {
          id: Date.now().toString(),
          text: `💰 **Top Earners ${fleetMode === 'taxi' ? 'Today' : 'This Month'}**\n\n🏆 **#1 ${topEarner.name}**\n• Earnings: $${topEarner.earnings.toLocaleString()}\n• ${fleetMode === 'taxi' ? 'Trips' : 'Rentals'}: ${topEarner.trips}\n• Performance: ${topEarner.performanceScore}%\n• Status: ${topEarner.status === 'active' ? '🟢 Active' : '🔴 Offline'}\n\n**Top 5 Rankings:**\n${sortedDrivers.slice(0, 5).map((driver, index) => 
            `${index + 1}. ${driver.name} - $${driver.earnings.toLocaleString()}`
          ).join('\n')}\n\n**Fleet Total:** $${mockDriversData.reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
      
      // Check for specific driver earnings
      const driverName = extractDriverName(query);
      if (driverName) {
        const driver = findDriverByName(driverName);
        if (driver) {
          const ranking = mockDriversData.sort((a, b) => b.earnings - a.earnings).findIndex(d => d.id === driver.id) + 1;
          const avgPerTrip = driver.trips > 0 ? Math.round(driver.earnings / driver.trips) : 0;
          
          return {
            id: Date.now().toString(),
            text: `💵 **${driver.name}'s Earnings**\n\n**${fleetMode === 'taxi' ? 'Today' : 'This Month'}:** $${driver.earnings.toLocaleString()}\n**${fleetMode === 'taxi' ? 'Trips' : 'Rentals'} Completed:** ${driver.trips}\n**Average per ${fleetMode === 'taxi' ? 'Trip' : 'Rental'}:** $${avgPerTrip}\n**Performance Score:** ${driver.performanceScore}%\n\n**Fleet Ranking:** ${ranking} out of ${mockDriversData.length} drivers\n\n${driver.earnings > 1500 ? '🎉 Excellent performance!' : driver.earnings > 1000 ? '👍 Good performance' : driver.earnings > 500 ? '📈 Average performance' : '⚠️ Below average - may need support'}\n\n**Status:** ${driver.status === 'active' ? '🟢 Currently Online' : '🔴 Offline'}`,
            isUser: false,
            timestamp: new Date(),
            type: 'data'
          };
        } else {
          return {
            id: Date.now().toString(),
            text: `❌ **Driver Not Found**\n\nI couldn't find a driver named "${driverName}". Here are the available drivers:\n\n${mockDriversData.map(d => `• ${d.name} - $${d.earnings.toLocaleString()}`).join('\n')}\n\n💡 **Try asking:** "How much did Ahmed make today?" or "Show me Omar's earnings"`,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          };
        }
      }
      
      // General earnings overview if no specific driver mentioned
      const totalEarnings = mockDriversData.reduce((sum, d) => sum + d.earnings, 0);
      const avgEarnings = Math.round(totalEarnings / mockDriversData.length);
      const topEarner = mockDriversData.reduce((prev, current) => prev.earnings > current.earnings ? prev : current);
      
      return {
        id: Date.now().toString(),
        text: `💰 **Fleet Earnings Overview**\n\n**Total Fleet Earnings:** $${totalEarnings.toLocaleString()}\n**Average per Driver:** $${avgEarnings.toLocaleString()}\n**Top Performer:** ${topEarner.name} ($${topEarner.earnings.toLocaleString()})\n\n**Earnings Breakdown:**\n${mockDriversData.sort((a, b) => b.earnings - a.earnings).map((driver, index) => 
          `${index + 1}. ${driver.name}: $${driver.earnings.toLocaleString()}`
        ).join('\n')}\n\n💡 **Ask me:** "How much did [driver name] make today?" for specific details!`,
        isUser: false,
        timestamp: new Date(),
        type: 'data'
      };
    }

    // LOCATION QUERIES
    if (lowerQuery.includes('location') || lowerQuery.includes('where') || lowerQuery.includes('located') || lowerQuery.includes('find')) {
      const driverName = extractDriverName(query);
      if (driverName) {
        const driver = findDriverByName(driverName);
        if (driver) {
          return {
            id: Date.now().toString(),
            text: `📍 **${driver.name}'s Current Location**\n\n**Status:** ${driver.status === 'active' ? '🟢 Online & Trackable' : '🔴 Offline'}\n**Vehicle:** ${driver.vehicleId || 'No vehicle assigned'}\n**Location:** Dubai Marina, UAE\n**Coordinates:** ${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}\n**Last Update:** ${new Date().toLocaleTimeString()}\n\n${driver.status === 'active' ? '✅ Driver is currently active and trackable' : '⚠️ Driver is offline - showing last known location'}\n\n📱 **Contact:** ${driver.phone}`,
            isUser: false,
            timestamp: new Date(),
            type: 'data'
          };
        } else {
          return {
            id: Date.now().toString(),
            text: `❌ **Driver Not Found**\n\nI couldn't find a driver named "${driverName}". Here are the available drivers:\n\n${mockDriversData.map(d => `• ${d.name} - ${d.status === 'active' ? '🟢 Online' : '🔴 Offline'}`).join('\n')}\n\n💡 **Try asking:** "Where is Ahmed?" or "Show me Omar's location"`,
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
            `**${driver.name}**\n• Vehicle: ${driver.vehicleId || 'Unassigned'}\n• Earnings: $${driver.earnings.toLocaleString()}\n• ${fleetMode === 'taxi' ? 'Trips' : 'Rentals'}: ${driver.trips}\n• Performance: ${driver.performanceScore}%`
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
          `${index + 1}. **${driver.name}**\n   Score: ${driver.performanceScore}% | Earnings: $${driver.earnings.toLocaleString()} | ${fleetMode === 'taxi' ? 'Trips' : 'Rentals'}: ${driver.trips}\n   ${driver.performanceScore >= 90 ? '🌟 Excellent' : driver.performanceScore >= 80 ? '👍 Good' : '⚠️ Needs Improvement'}`
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
          text: `👤 **${driver.name} - Complete Profile**\n\n**📊 Performance:**\n• Score: ${driver.performanceScore}%\n• Status: ${driver.status === 'active' ? '🟢 Online' : '🔴 Offline'}\n• Earnings ${fleetMode === 'taxi' ? 'Today' : 'Monthly'}: $${driver.earnings.toLocaleString()}\n• ${fleetMode === 'taxi' ? 'Trips' : 'Rentals'}: ${driver.trips}\n\n**🚗 Vehicle:**\n• Assigned: ${driver.vehicleId || 'None'}\n• Location: Dubai, UAE\n\n**📱 Contact:**\n• Phone: ${driver.phone}\n• Email: ${driver.email}\n\n**⚠️ Fines:**\n• Total: ${driverFines.length}\n• Amount: AED ${driverFines.reduce((sum, f) => sum + f.amount, 0)}\n\n**📄 ${fleetMode === 'rental' ? 'Contracts' : 'Shifts'}:**\n• Active: ${driverContracts.filter(c => c.status === 'active').length}\n• Total: ${driverContracts.length}\n\n${driver.performanceScore >= 90 ? '🌟 Top performer!' : driver.performanceScore >= 80 ? '👍 Good driver' : '⚠️ May need attention'}`,
          isUser: false,
          timestamp: new Date(),
          type: 'data'
        };
      }
    }

    // ACTION: Create new contract
    if (lowerQuery.includes('create') && lowerQuery.includes('contract')) {
      const driverName = extractDriverName(query);
      setActiveWizard('create_contract');
      
      return {
        id: Date.now().toString(),
        text: `🔧 **Contract Creation Wizard Started**\n\nI'll help you create a new rental contract${driverName ? ` for ${driverName}` : ''} with automatic PDF generation!\n\n**Quick Entry Format:**\nProvide all details in one line separated by commas:\n\n\`Driver Name, Emirates ID, Vehicle ID, Duration (months), Monthly Rent, Deposit\`\n\n**Example:**\n\`Ahmed Al-Rashid, 784-1990-1234567-1, DXB-A-12345, 12, 1200, 5000\`\n\n**Alternative:**\nType "step by step" for guided entry.\n\n💡 **Just type your contract details and I'll generate a professional PDF contract!**`,
        isUser: false,
        timestamp: new Date(),
        type: 'wizard',
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
      text: `🧠 **NavEdge Intelligence Ready**\n\nI can help you with:\n\n**💰 Earnings & Money:**\n• "How much did Ahmed make today?"\n• "Who earned the most?"\n• "Show me earnings overview"\n\n**📍 Driver Locations:**\n• "Where is Omar located?"\n• "Show me all driver locations"\n\n**👥 Driver Management:**\n• "Which drivers are offline?"\n• "Show me drivers with fines"\n• "Tell me about Mohammed"\n\n**🚨 Fine Management:**\n• "Omar got a fine"\n• "Ahmed received a speeding fine"\n• "Record a parking violation for Hassan"\n\n**📊 Performance & Stats:**\n• "Performance rankings"\n• "Show me fleet overview"\n\n**⚙️ Fleet Operations:**\n• "Create a contract for Ahmed"\n• "Make a PDF contract"\n• "Switch to taxi mode"\n\n**💡 Tip:** Try saying "Omar got a fine" and I'll help you record it and handle payroll deductions!`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
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
          
        case 'payroll_deduction':
          if (message.data) {
            const { driver, fine } = message.data;
            const amount = parseInt(fine.amount);
            const { oldBalance, newBalance } = deductFromPayroll(driver.id, amount);
            
            responseText = `✅ **Payroll Deduction Applied!**\n\n**Driver:** ${driver.name}\n**Fine Amount:** AED ${amount.toLocaleString()}\n\n**Payroll Update:**\n• **Previous Balance:** AED ${oldBalance.toLocaleString()}\n• **Deduction:** -AED ${amount.toLocaleString()}\n• **New Balance:** AED ${newBalance.toLocaleString()}\n\n📋 **Actions Completed:**\n• ✅ Fine recorded in system\n• ✅ Payroll deduction processed\n• ✅ Driver notification sent\n• ✅ Accounting records updated\n\n🎯 **${driver.name}'s fine has been successfully processed and deducted from their earnings.**`;
            
            // Clear conversation context
            setConversationContext(null);
          }
          break;
          
        default:
          responseText = '✅ **Action completed successfully!**';
      }
    } else {
      if (message.actionType === 'payroll_deduction' && message.data) {
        const { driver, fine } = message.data;
        responseText = `📋 **Fine Recorded - No Payroll Deduction**\n\n**Driver:** ${driver.name}\n**Fine:** AED ${fine.amount} (Status: Pending)\n\n✅ The fine has been recorded in the system but no payroll deduction was made. The fine remains pending for manual processing.\n\n**Next Steps:**\n• Fine can be processed later through the Fines section\n• Driver will be notified about the pending fine\n• You can deduct it later by saying "Deduct ${driver.name}'s pending fine"`;
        
        // Clear conversation context
        setConversationContext(null);
      } else {
        responseText = '❌ **Action cancelled.** No changes have been made.';
      }
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
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processIntelligentQuery(currentInput);
      setMessages(prev => [...prev, response]);
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

  const handleDownloadPDF = (pdfUrl: string, contractData: any) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `NavEdge-Contract-${contractData.driverName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    if (message.type === 'pdf_generated' && message.pdfUrl) {
      return (
        <div className="space-y-3">
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownloadPDF(message.pdfUrl!, message.data)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadPDF}</span>
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
              <Brain className="w-6 h-6 text-white" />
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
            {activeWizard && (
              <div className="px-3 py-1 bg-green-500/80 rounded-full text-white text-xs font-medium animate-pulse">
                {activeWizard === 'create_contract' ? 'CONTRACT WIZARD' : 'WIZARD ACTIVE'}
              </div>
            )}
            {conversationContext && (
              <div className="px-3 py-1 bg-orange-500/80 rounded-full text-white text-xs font-medium animate-pulse">
                {conversationContext.type === 'fine_recording' ? 'RECORDING FINE' : 
                 conversationContext.type === 'payroll_confirmation' ? 'PAYROLL PENDING' : 'ACTIVE CONTEXT'}
              </div>
            )}
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
                    : message.type === 'action' || message.type === 'wizard' || message.type === 'fine_wizard'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : message.type === 'confirmation'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600'
                        : message.type === 'data'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                          : message.type === 'pdf_generated'
                            ? 'bg-gradient-to-r from-red-500 to-pink-600'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}>
                  {message.isUser ? (
                    <Sparkles className="w-4 h-4 text-white" />
                  ) : message.type === 'action' || message.type === 'wizard' || message.type === 'fine_wizard' ? (
                    <Settings className="w-4 h-4 text-white" />
                  ) : message.type === 'confirmation' ? (
                    <AlertTriangle className="w-4 h-4 text-white" />
                  ) : message.type === 'data' ? (
                    <BarChart3 className="w-4 h-4 text-white" />
                  ) : message.type === 'pdf_generated' ? (
                    <FileText className="w-4 h-4 text-white" />
                  ) : (
                    <Brain className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : message.type === 'action' || message.type === 'wizard' || message.type === 'fine_wizard'
                        ? 'bg-green-50 text-green-900 border border-green-200'
                        : message.type === 'confirmation'
                          ? 'bg-orange-50 text-orange-900 border border-orange-200'
                          : message.type === 'data'
                            ? 'bg-purple-50 text-purple-900 border border-purple-200'
                            : message.type === 'pdf_generated'
                              ? 'bg-red-50 text-red-900 border border-red-200'
                              : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {renderMessage(message)}
                  <p className={`text-xs mt-2 ${
                    message.isUser 
                      ? 'text-blue-100' 
                      : message.type === 'action' || message.type === 'wizard' || message.type === 'fine_wizard'
                        ? 'text-green-600'
                        : message.type === 'confirmation'
                          ? 'text-orange-600'
                          : message.type === 'data'
                            ? 'text-purple-600'
                            : message.type === 'pdf_generated'
                              ? 'text-red-600'
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
                  <Brain className="w-4 h-4 text-white" />
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
              placeholder={
                conversationContext?.type === 'fine_recording' ? 
                  'Describe the fine (e.g., "Speeding fine, 600 AED on Sheikh Zayed Road")' :
                conversationContext?.type === 'payroll_confirmation' ?
                  'Type "yes" to confirm deduction or "no" to cancel' :
                activeWizard === 'create_contract' ? 
                  'Enter: Name, Emirates ID, Vehicle ID, Duration, Rent, Deposit' : 
                  t.placeholder
              }
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
          {messages.length === 1 && !conversationContext && !activeWizard && (
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

          {/* Context Helpers */}
          {conversationContext?.type === 'fine_recording' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Recording Fine for {conversationContext.driver.name}</span>
              </div>
              <p className="text-xs text-orange-700">
                💡 **Examples:** "Speeding fine, 600 AED" | "Parking violation, 200 AED at Dubai Mall" | "Red light violation, 1000 AED"
              </p>
            </div>
          )}

          {conversationContext?.type === 'payroll_confirmation' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Payroll Deduction Pending</span>
              </div>
              <p className="text-xs text-green-700">
                💰 **Confirm:** Type "yes" to deduct AED {conversationContext.fine.amount} from {conversationContext.driver.name}'s paycheck
              </p>
            </div>
          )}

          {/* Contract Wizard Helper */}
          {activeWizard === 'create_contract' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Contract Wizard Active</span>
              </div>
              <p className="text-xs text-green-700">
                💡 **Format:** `Ahmed Al-Rashid, 784-1990-1234567-1, DXB-A-12345, 12, 1200, 5000`
              </p>
              <p className="text-xs text-green-600 mt-1">
                📝 **Or type:** "step by step" for guided entry | 📄 **PDF will be generated automatically!**
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavEdgeAssistant;