import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader, Camera, CreditCard, UserCircle } from 'lucide-react';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';
type DocumentType = 'emirates_id' | 'driver_license';

interface DocumentOCRProps {
  language: Language;
  onDataExtracted?: (data: any, documentType: DocumentType) => void;
}

interface OCRResult {
  success: boolean;
  documentType: DocumentType;
  extractedData: {
    name?: string;
    id_number?: string;
    license_number?: string;
    expiry_date?: string;
    nationality?: string;
    date_of_birth?: string;
    issue_date?: string;
    [key: string]: any;
  };
  confidence: number;
  message?: string;
}

const DocumentOCR: React.FC<DocumentOCRProps> = ({ language, onDataExtracted }) => {
  const [activeTab, setActiveTab] = useState<DocumentType>('emirates_id');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const texts = {
    en: {
      title: 'Document OCR Scanner',
      subtitle: 'Upload Emirates ID or Driver License for automatic data extraction',
      emiratesId: 'Emirates ID',
      driverLicense: 'Driver License',
      uploadPrompt: 'Click to upload or drag and drop',
      fileTypes: 'PNG, JPG, PDF up to 10MB',
      processing: 'Processing document...',
      success: 'Document processed successfully!',
      error: 'Failed to process document',
      confidence: 'Confidence',
      extractedData: 'Extracted Information',
      name: 'Full Name',
      idNumber: 'ID Number',
      licenseNumber: 'License Number',
      nationality: 'Nationality',
      dateOfBirth: 'Date of Birth',
      expiryDate: 'Expiry Date',
      issueDate: 'Issue Date',
      uploadAnother: 'Upload Another Document',
      useData: 'Use This Data',
    },
    ar: {
      title: 'ماسح المستندات الضوئي',
      subtitle: 'قم بتحميل الهوية الإماراتية أو رخصة القيادة لاستخراج البيانات تلقائيًا',
      emiratesId: 'الهوية الإماراتية',
      driverLicense: 'رخصة القيادة',
      uploadPrompt: 'انقر للتحميل أو اسحب وأفلت',
      fileTypes: 'PNG، JPG، PDF حتى 10 ميجابايت',
      processing: 'معالجة المستند...',
      success: 'تمت معالجة المستند بنجاح!',
      error: 'فشلت معالجة المستند',
      confidence: 'الثقة',
      extractedData: 'المعلومات المستخرجة',
      name: 'الاسم الكامل',
      idNumber: 'رقم الهوية',
      licenseNumber: 'رقم الرخصة',
      nationality: 'الجنسية',
      dateOfBirth: 'تاريخ الميلاد',
      expiryDate: 'تاريخ الانتهاء',
      issueDate: 'تاريخ الإصدار',
      uploadAnother: 'تحميل مستند آخر',
      useData: 'استخدام هذه البيانات',
    },
    hi: {
      title: 'दस्तावेज़ OCR स्कैनर',
      subtitle: 'स्वचालित डेटा निष्कर्षण के लिए एमिरेट्स आईडी या ड्राइवर लाइसेंस अपलोड करें',
      emiratesId: 'एमिरेट्स आईडी',
      driverLicense: 'ड्राइवर लाइसेंस',
      uploadPrompt: 'अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें',
      fileTypes: '10MB तक PNG, JPG, PDF',
      processing: 'दस्तावेज़ संसाधित हो रहा है...',
      success: 'दस्तावेज़ सफलतापूर्वक संसाधित हुआ!',
      error: 'दस्तावेज़ संसाधित करने में विफल',
      confidence: 'विश्वास',
      extractedData: 'निकाली गई जानकारी',
      name: 'पूरा नाम',
      idNumber: 'आईडी नंबर',
      licenseNumber: 'लाइसेंस नंबर',
      nationality: 'राष्ट्रीयता',
      dateOfBirth: 'जन्म तिथि',
      expiryDate: 'समाप्ति तिथि',
      issueDate: 'जारी करने की तिथि',
      uploadAnother: 'अन्य दस्तावेज़ अपलोड करें',
      useData: 'इस डेटा का उपयोग करें',
    },
    ur: {
      title: 'دستاویز OCR سکینر',
      subtitle: 'خودکار ڈیٹا نکالنے کے لیے ایمریٹس آئی ڈی یا ڈرائیور لائسنس اپ لوڈ کریں',
      emiratesId: 'ایمریٹس آئی ڈی',
      driverLicense: 'ڈرائیور لائسنس',
      uploadPrompt: 'اپ لوڈ کرنے کے لیے کلک کریں یا گھسیٹیں اور چھوڑیں',
      fileTypes: '10MB تک PNG، JPG، PDF',
      processing: 'دستاویز پر کارروائی ہو رہی ہے...',
      success: 'دستاویز کامیابی سے پروسیس ہوگئی!',
      error: 'دستاویز پر کارروائی ناکام',
      confidence: 'اعتماد',
      extractedData: 'نکالی گئی معلومات',
      name: 'پورا نام',
      idNumber: 'آئی ڈی نمبر',
      licenseNumber: 'لائسنس نمبر',
      nationality: 'قومیت',
      dateOfBirth: 'تاریخ پیدائش',
      expiryDate: 'ختم ہونے کی تاریخ',
      issueDate: 'جاری کرنے کی تاریخ',
      uploadAnother: 'دوسری دستاویز اپ لوڈ کریں',
      useData: 'یہ ڈیٹا استعمال کریں',
    }
  };

  const t = texts[language];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      let response;
      if (activeTab === 'emirates_id') {
        response = await FastAPIService.uploadIDDocument(file);
      } else {
        response = await FastAPIService.uploadLicenseDocument(file);
      }

      const ocrResult: OCRResult = {
        success: true,
        documentType: activeTab,
        extractedData: response.extracted_data,
        confidence: response.confidence,
      };

      setResult(ocrResult);

      if (onDataExtracted) {
        onDataExtracted(response.extracted_data, activeTab);
      }
    } catch (error) {
      console.error('OCR error:', error);
      setResult({
        success: false,
        documentType: activeTab,
        extractedData: {},
        confidence: 0,
        message: error instanceof Error ? error.message : t.error,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetUpload = () => {
    setResult(null);
    setPreview(null);
  };

  const handleUseData = () => {
    if (result && result.success && onDataExtracted) {
      onDataExtracted(result.extractedData, activeTab);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">{t.title}</h2>
              <p className="text-blue-100 text-sm mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('emirates_id')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'emirates_id'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserCircle className="w-5 h-5" />
                <span>{t.emiratesId}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('driver_license')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'driver_license'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>{t.driverLicense}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!result ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t.processing}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.uploadPrompt}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.fileTypes}</p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                    {result.success ? t.success : t.error}
                  </p>
                  {result.success && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {t.confidence}: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {result.message && (
                    <p className="text-sm text-red-600 dark:text-red-400">{result.message}</p>
                  )}
                </div>
              </div>

              {preview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={preview} alt="Document preview" className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900" />
                </div>
              )}

              {result.success && Object.keys(result.extractedData).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    {t.extractedData}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.extractedData.name && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.name}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.name}</p>
                      </div>
                    )}
                    {result.extractedData.id_number && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.idNumber}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.id_number}</p>
                      </div>
                    )}
                    {result.extractedData.license_number && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.licenseNumber}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.license_number}</p>
                      </div>
                    )}
                    {result.extractedData.nationality && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.nationality}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.nationality}</p>
                      </div>
                    )}
                    {result.extractedData.date_of_birth && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.dateOfBirth}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.date_of_birth}</p>
                      </div>
                    )}
                    {result.extractedData.expiry_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.expiryDate}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.expiry_date}</p>
                      </div>
                    )}
                    {result.extractedData.issue_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.issueDate}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{result.extractedData.issue_date}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={resetUpload}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.uploadAnother}
                </button>
                {result.success && onDataExtracted && (
                  <button
                    onClick={handleUseData}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t.useData}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentOCR;
