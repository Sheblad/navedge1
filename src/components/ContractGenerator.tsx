import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Eye, Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface ContractGeneratorProps {
  language: Language;
  onClose: () => void;
}

interface ExtractedData {
  fullName: string;
  idNumber: string;
  expiryDate: string;
  nationality: string;
}

interface ContractData {
  driverName: string;
  idNumber: string;
  startDate: string;
  duration: string;
  dailyKmLimit: string;
  depositAmount: string;
  monthlyRent: string;
  vehicleId: string;
}

interface ContractGeneratorProps {
  language: Language;
  onClose: () => void;
  useBackendAPI?: boolean;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ language, onClose, useBackendAPI = true }) => {
  const [step, setStep] = useState<'upload' | 'extract' | 'contract' | 'preview'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [contractData, setContractData] = useState<ContractData>({
    driverName: '',
    idNumber: '',
    startDate: '',
    duration: '12',
    dailyKmLimit: '300',
    depositAmount: '5000',
    monthlyRent: '1200',
    vehicleId: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    en: {
      title: 'Contract Generator with OCR',
      step1: 'Upload Emirates ID',
      step2: 'Extract Information',
      step3: 'Contract Details',
      step4: 'Preview & Generate',
      uploadId: 'Upload Emirates ID or License',
      dragDrop: 'Drag and drop your Emirates ID here, or click to browse',
      processing: 'Processing image...',
      extracting: 'Extracting information from ID...',
      fullName: 'Full Name',
      idNumber: 'ID Number',
      expiryDate: 'Expiry Date',
      nationality: 'Nationality',
      startDate: 'Rental Start Date',
      duration: 'Duration (months)',
      dailyKmLimit: 'Daily KM Limit',
      depositAmount: 'Deposit Amount (AED)',
      monthlyRent: 'Monthly Rent (AED)',
      vehicleId: 'Vehicle ID',
      generateContract: 'Generate Contract',
      downloadPDF: 'Download PDF',
      next: 'Next',
      back: 'Back',
      close: 'Close'
    },
    ar: {
      title: 'مولد العقود مع OCR',
      step1: 'رفع الهوية الإماراتية',
      step2: 'استخراج المعلومات',
      step3: 'تفاصيل العقد',
      step4: 'معاينة وإنشاء',
      uploadId: 'رفع الهوية الإماراتية أو الرخصة',
      dragDrop: 'اسحب وأفلت هويتك الإماراتية هنا، أو انقر للتصفح',
      processing: 'معالجة الصورة...',
      extracting: 'استخراج المعلومات من الهوية...',
      fullName: 'الاسم الكامل',
      idNumber: 'رقم الهوية',
      expiryDate: 'تاريخ الانتهاء',
      nationality: 'الجنسية',
      startDate: 'تاريخ بداية الإيجار',
      duration: 'المدة (أشهر)',
      dailyKmLimit: 'حد الكيلومترات اليومي',
      depositAmount: 'مبلغ التأمين (درهم)',
      monthlyRent: 'الإيجار الشهري (درهم)',
      vehicleId: 'رقم المركبة',
      generateContract: 'إنشاء العقد',
      downloadPDF: 'تحميل PDF',
      next: 'التالي',
      back: 'السابق',
      close: 'إغلاق'
    },
    hi: {
      title: 'OCR के साथ अनुबंध जेनरेटर',
      step1: 'एमिरेट्स आईडी अपलोड करें',
      step2: 'जानकारी निकालें',
      step3: 'अनुबंध विवरण',
      step4: 'प्रीव्यू और जेनरेट',
      uploadId: 'एमिरेट्स आईडी या लाइसेंस अपलोड करें',
      dragDrop: 'अपनी एमिरेट्स आईडी यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      processing: 'छवि प्रोसेसिंग...',
      extracting: 'आईडी से जानकारी निकाल रहा है...',
      fullName: 'पूरा नाम',
      idNumber: 'आईडी नंबर',
      expiryDate: 'समाप्ति तिथि',
      nationality: 'राष्ट्रीयता',
      startDate: 'किराया प्रारंभ तिथि',
      duration: 'अवधि (महीने)',
      dailyKmLimit: 'दैनिक KM सीमा',
      depositAmount: 'जमा राशि (AED)',
      monthlyRent: 'मासिक किराया (AED)',
      vehicleId: 'वाहन आईडी',
      generateContract: 'अनुबंध जेनरेट करें',
      downloadPDF: 'PDF डाउनलोड करें',
      next: 'अगला',
      back: 'पीछे',
      close: 'बंद करें'
    },
    ur: {
      title: 'OCR کے ساتھ کنٹریکٹ جنریٹر',
      step1: 'ایمریٹس ID اپلوڈ کریں',
      step2: 'معلومات نکالیں',
      step3: 'کنٹریکٹ کی تفصیلات',
      step4: 'پیش نظارہ اور جنریٹ',
      uploadId: 'ایمریٹس ID یا لائسنس اپلوڈ کریں',
      dragDrop: 'اپنی ایمریٹس ID یہاں کھینچیں اور چھوڑیں، یا براؤز کرنے کے لیے کلک کریں',
      processing: 'تصویر پروسیسنگ...',
      extracting: 'ID سے معلومات نکال رہا ہے...',
      fullName: 'پورا نام',
      idNumber: 'ID نمبر',
      expiryDate: 'ختم ہونے کی تاریخ',
      nationality: 'قومیت',
      startDate: 'کرایہ شروع کی تاریخ',
      duration: 'مدت (مہینے)',
      dailyKmLimit: 'روزانہ KM حد',
      depositAmount: 'ڈپازٹ رقم (AED)',
      monthlyRent: 'ماہانہ کرایہ (AED)',
      vehicleId: 'گاڑی ID',
      generateContract: 'کنٹریکٹ جنریٹ کریں',
      downloadPDF: 'PDF ڈاؤنلوڈ کریں',
      next: 'اگلا',
      back: 'پیچھے',
      close: 'بند کریں'
    }
  };

  const t = texts[language];

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const processOCR = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setStep('extract');

    try {
      if (useBackendAPI && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const response = await FastAPIService.uploadIDDocument(file);

        const extracted: ExtractedData = {
          fullName: response.extracted_data.name || 'Not detected',
          idNumber: response.extracted_data.id_number || 'Not detected',
          expiryDate: response.extracted_data.expiry_date || 'Not detected',
          nationality: response.extracted_data.nationality || 'UAE'
        };

        setExtractedData(extracted);
        setContractData(prev => ({
          ...prev,
          driverName: extracted.fullName,
          idNumber: extracted.idNumber
        }));

        setStep('contract');
        setIsProcessing(false);
        return;
      }

      const result = await Tesseract.recognize(selectedImage, 'eng+ara', {
        logger: m => console.log(m)
      });

      const text = result.data.text;
      
      // Extract information using regex patterns (simplified for demo)
      const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+)/i);
      const idMatch = text.match(/(\d{3}-\d{4}-\d{7}-\d{1})/);
      const expiryMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

      const extracted: ExtractedData = {
        fullName: nameMatch ? nameMatch[1].trim() : 'Not detected',
        idNumber: idMatch ? idMatch[1] : 'Not detected',
        expiryDate: expiryMatch ? expiryMatch[1] : 'Not detected',
        nationality: 'UAE' // Default for Emirates ID
      };

      setExtractedData(extracted);
      setContractData(prev => ({
        ...prev,
        driverName: extracted.fullName,
        idNumber: extracted.idNumber
      }));

      setStep('contract');
    } catch (error) {
      console.error('OCR Error:', error);
      // Fallback with demo data
      const demoData: ExtractedData = {
        fullName: 'Ahmed Mohammed Al-Rashid',
        idNumber: '784-1990-1234567-1',
        expiryDate: '15/12/2028',
        nationality: 'UAE'
      };
      setExtractedData(demoData);
      setContractData(prev => ({
        ...prev,
        driverName: demoData.fullName,
        idNumber: demoData.idNumber
      }));
      setStep('contract');
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = async () => {
    if (useBackendAPI) {
      try {
        const endDate = new Date(contractData.startDate);
        endDate.setMonth(endDate.getMonth() + parseInt(contractData.duration));

        const response = await FastAPIService.createContract({
          driver_id: contractData.idNumber,
          vehicle_id: contractData.vehicleId,
          start_date: contractData.startDate,
          end_date: endDate.toISOString().split('T')[0],
          rental_amount: parseFloat(contractData.monthlyRent),
          deposit_amount: parseFloat(contractData.depositAmount)
        });

        const pdfBlob = await FastAPIService.getContractPDF(response.contract_id);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setGeneratedPDF(pdfUrl);
        setStep('preview');
        return;
      } catch (error) {
        console.error('Error generating contract:', error);
      }
    }

    // Fallback to local PDF generation
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('NAVEDGE FLEET MANAGEMENT', 20, 30);
    doc.setFontSize(16);
    doc.text('VEHICLE RENTAL CONTRACT', 20, 45);
    
    // Contract details
    doc.setFontSize(12);
    let yPos = 70;
    
    const contractDetails = [
      `Driver Name: ${contractData.driverName}`,
      `ID Number: ${contractData.idNumber}`,
      `Start Date: ${contractData.startDate}`,
      `Duration: ${contractData.duration} months`,
      `Vehicle ID: ${contractData.vehicleId}`,
      `Daily KM Limit: ${contractData.dailyKmLimit} km`,
      `Monthly Rent: AED ${contractData.monthlyRent}`,
      `Security Deposit: AED ${contractData.depositAmount}`,
    ];

    contractDetails.forEach(detail => {
      doc.text(detail, 20, yPos);
      yPos += 10;
    });

    // Terms and conditions
    yPos += 20;
    doc.setFontSize(14);
    doc.text('TERMS AND CONDITIONS:', 20, yPos);
    yPos += 15;
    
    const terms = [
      '1. Driver must maintain a valid UAE driving license',
      '2. Vehicle must be returned in the same condition',
      '3. Any traffic fines will be deducted from the deposit',
      '4. Monthly rent is due by the 1st of each month',
      '5. Exceeding daily KM limit incurs additional charges',
      '6. Contract is renewable upon mutual agreement'
    ];

    doc.setFontSize(10);
    terms.forEach(term => {
      doc.text(term, 20, yPos);
      yPos += 8;
    });

    // Signatures
    yPos += 30;
    doc.text('Driver Signature: ____________________', 20, yPos);
    doc.text('Date: ____________________', 120, yPos);
    yPos += 20;
    doc.text('Company Representative: ____________________', 20, yPos);
    doc.text('Date: ____________________', 120, yPos);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setGeneratedPDF(pdfUrl);
    setStep('preview');
  };

  const downloadPDF = () => {
    if (generatedPDF) {
      const link = document.createElement('a');
      link.href = generatedPDF;
      link.download = `contract-${contractData.driverName.replace(/\s+/g, '-')}.pdf`;
      link.click();
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">{t.uploadId}</p>
            <p className="text-gray-600">{t.dragDrop}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Choose File
          </button>
        </div>
      </div>

      {selectedImage && (
        <div className="space-y-4">
          <img src={selectedImage} alt="Emirates ID" className="w-full max-w-md mx-auto rounded-lg shadow-md" />
          <div className="flex justify-center">
            <button
              onClick={processOCR}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderExtractStep = () => (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.processing}</h3>
        <p className="text-gray-600">{t.extracting}</p>
      </div>
    </div>
  );

  const renderContractStep = () => (
    <div className="space-y-6">
      {extractedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">Extracted Information:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>{t.fullName}:</strong> {extractedData.fullName}</div>
            <div><strong>{t.idNumber}:</strong> {extractedData.idNumber}</div>
            <div><strong>{t.expiryDate}:</strong> {extractedData.expiryDate}</div>
            <div><strong>{t.nationality}:</strong> {extractedData.nationality}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
          <input
            type="text"
            value={contractData.driverName}
            onChange={(e) => setContractData({...contractData, driverName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.idNumber}</label>
          <input
            type="text"
            value={contractData.idNumber}
            onChange={(e) => setContractData({...contractData, idNumber: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.startDate}</label>
          <input
            type="date"
            value={contractData.startDate}
            onChange={(e) => setContractData({...contractData, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.duration}</label>
          <select
            value={contractData.duration}
            onChange={(e) => setContractData({...contractData, duration: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.vehicleId}</label>
          <input
            type="text"
            value={contractData.vehicleId}
            onChange={(e) => setContractData({...contractData, vehicleId: e.target.value})}
            placeholder="DXB-A-12345"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.dailyKmLimit}</label>
          <input
            type="number"
            value={contractData.dailyKmLimit}
            onChange={(e) => setContractData({...contractData, dailyKmLimit: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.monthlyRent}</label>
          <input
            type="number"
            value={contractData.monthlyRent}
            onChange={(e) => setContractData({...contractData, monthlyRent: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.depositAmount}</label>
          <input
            type="number"
            value={contractData.depositAmount}
            onChange={(e) => setContractData({...contractData, depositAmount: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep('upload')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t.back}
        </button>
        <button
          onClick={generatePDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.generateContract}
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6 text-center">
      <div className="p-8 bg-green-50 border border-green-200 rounded-lg">
        <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Contract Generated Successfully!</h3>
        <p className="text-green-700">The rental contract has been created and is ready for download.</p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Download className="w-5 h-5 mr-2" />
          {t.downloadPDF}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t.close}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[
              { key: 'upload', label: t.step1 },
              { key: 'extract', label: t.step2 },
              { key: 'contract', label: t.step3 },
              { key: 'preview', label: t.step4 }
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepItem.key ? 'bg-blue-600 text-white' : 
                  ['upload', 'extract', 'contract', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{stepItem.label}</span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'extract' && renderExtractStep()}
          {step === 'contract' && renderContractStep()}
          {step === 'preview' && renderPreviewStep()}
        </div>
      </div>
    </div>
  );
};

export default ContractGenerator;