import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download, Database, RefreshCw } from 'lucide-react';
import { Driver } from '../data/mockData';

interface BulkImportDriversProps {
  onImportDrivers: (drivers: Omit<Driver, 'id'>[]) => void;
  onClose: () => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const BulkImportDrivers: React.FC<BulkImportDriversProps> = ({ onImportDrivers, onClose, language }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete' | 'error'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mappedDrivers, setMappedDrivers] = useState<Omit<Driver, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<{[key: string]: string}>({
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    vehicleId: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    en: {
      title: 'Bulk Import Drivers',
      uploadTitle: 'Upload Driver Data',
      uploadSubtitle: 'Import multiple drivers from Excel or CSV file',
      dragDrop: 'Drag and drop your file here, or click to browse',
      browse: 'Browse Files',
      supportedFormats: 'Supported formats: .csv, .xlsx, .xls',
      downloadTemplate: 'Download Template',
      previewTitle: 'Preview Data',
      previewSubtitle: 'Review and map columns before importing',
      mapColumns: 'Map Columns',
      requiredField: 'Required field',
      importingTitle: 'Importing Drivers',
      importingSubtitle: 'Please wait while we import your drivers',
      completeTitle: 'Import Complete',
      completeSubtitle: 'Your drivers have been successfully imported',
      errorTitle: 'Import Error',
      errorSubtitle: 'There was an error importing your drivers',
      tryAgain: 'Try Again',
      cancel: 'Cancel',
      back: 'Back',
      import: 'Import Drivers',
      close: 'Close',
      driversImported: 'drivers imported successfully',
      selectMapping: 'Select column mapping',
      columnName: 'Column Name',
      fieldMapping: 'Field Mapping',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      joinDate: 'Join Date',
      vehicleId: 'Vehicle ID',
      noFile: 'No file selected',
      processing: 'Processing file...',
      rowsFound: 'rows found in file',
      importPreview: 'Import Preview',
      chatbotImport: 'Import via Chatbot',
      chatbotImportDesc: 'You can also paste your data directly into the NavEdge AI Assistant chatbot with the command "import drivers" followed by your data.',
      importFromClipboard: 'Import from Clipboard',
      pasteData: 'Paste your data here',
      pasteDataDesc: 'Paste data from Excel or CSV (tab or comma separated)',
      pasteHere: 'Paste data here...',
      parseData: 'Parse Data'
    },
    ar: {
      title: 'استيراد السائقين بالجملة',
      uploadTitle: 'تحميل بيانات السائق',
      uploadSubtitle: 'استيراد سائقين متعددين من ملف Excel أو CSV',
      dragDrop: 'اسحب وأفلت الملف هنا، أو انقر للتصفح',
      browse: 'تصفح الملفات',
      supportedFormats: 'التنسيقات المدعومة: .csv، .xlsx، .xls',
      downloadTemplate: 'تنزيل القالب',
      previewTitle: 'معاينة البيانات',
      previewSubtitle: 'مراجعة وتعيين الأعمدة قبل الاستيراد',
      mapColumns: 'تعيين الأعمدة',
      requiredField: 'حقل مطلوب',
      importingTitle: 'جاري استيراد السائقين',
      importingSubtitle: 'يرجى الانتظار أثناء استيراد السائقين',
      completeTitle: 'اكتمل الاستيراد',
      completeSubtitle: 'تم استيراد السائقين بنجاح',
      errorTitle: 'خطأ في الاستيراد',
      errorSubtitle: 'حدث خطأ أثناء استيراد السائقين',
      tryAgain: 'حاول مرة أخرى',
      cancel: 'إلغاء',
      back: 'رجوع',
      import: 'استيراد السائقين',
      close: 'إغلاق',
      driversImported: 'تم استيراد السائقين بنجاح',
      selectMapping: 'حدد تعيين العمود',
      columnName: 'اسم العمود',
      fieldMapping: 'تعيين الحقل',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      joinDate: 'تاريخ الانضمام',
      vehicleId: 'معرف المركبة',
      noFile: 'لم يتم تحديد ملف',
      processing: 'معالجة الملف...',
      rowsFound: 'صفوف موجودة في الملف',
      importPreview: 'معاينة الاستيراد',
      chatbotImport: 'استيراد عبر روبوت المحادثة',
      chatbotImportDesc: 'يمكنك أيضًا لصق بياناتك مباشرة في مساعد NavEdge AI مع الأمر "استيراد السائقين" متبوعًا ببياناتك.',
      importFromClipboard: 'استيراد من الحافظة',
      pasteData: 'الصق بياناتك هنا',
      pasteDataDesc: 'الصق البيانات من Excel أو CSV (مفصولة بعلامة تبويب أو فاصلة)',
      pasteHere: 'الصق البيانات هنا...',
      parseData: 'تحليل البيانات'
    },
    hi: {
      title: 'बल्क ड्राइवर आयात',
      uploadTitle: 'ड्राइवर डेटा अपलोड करें',
      uploadSubtitle: 'एक्सेल या CSV फ़ाइल से कई ड्राइवरों को आयात करें',
      dragDrop: 'अपनी फ़ाइल यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      browse: 'फ़ाइलें ब्राउज़ करें',
      supportedFormats: 'समर्थित प्रारूप: .csv, .xlsx, .xls',
      downloadTemplate: 'टेम्पलेट डाउनलोड करें',
      previewTitle: 'डेटा प्रीव्यू',
      previewSubtitle: 'आयात करने से पहले कॉलम मैपिंग की समीक्षा करें',
      mapColumns: 'कॉलम मैप करें',
      requiredField: 'आवश्यक फ़ील्ड',
      importingTitle: 'ड्राइवर आयात हो रहे हैं',
      importingSubtitle: 'कृपया प्रतीक्षा करें जबकि हम आपके ड्राइवरों को आयात कर रहे हैं',
      completeTitle: 'आयात पूर्ण',
      completeSubtitle: 'आपके ड्राइवर सफलतापूर्वक आयात किए गए हैं',
      errorTitle: 'आयात त्रुटि',
      errorSubtitle: 'आपके ड्राइवरों को आयात करने में एक त्रुटि हुई',
      tryAgain: 'पुनः प्रयास करें',
      cancel: 'रद्द करें',
      back: 'वापस',
      import: 'ड्राइवर आयात करें',
      close: 'बंद करें',
      driversImported: 'ड्राइवर सफलतापूर्वक आयात किए गए',
      selectMapping: 'कॉलम मैपिंग चुनें',
      columnName: 'कॉलम नाम',
      fieldMapping: 'फ़ील्ड मैपिंग',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फोन',
      joinDate: 'शामिल होने की तिथि',
      vehicleId: 'वाहन आईडी',
      noFile: 'कोई फ़ाइल चयनित नहीं',
      processing: 'फ़ाइल प्रोसेसिंग...',
      rowsFound: 'फ़ाइल में पंक्तियाँ मिलीं',
      importPreview: 'आयात प्रीव्यू',
      chatbotImport: 'चैटबॉट के माध्यम से आयात करें',
      chatbotImportDesc: 'आप अपना डेटा सीधे NavEdge AI सहायक चैटबॉट में "ड्राइवर आयात करें" कमांड के बाद अपना डेटा पेस्ट कर सकते हैं।',
      importFromClipboard: 'क्लिपबोर्ड से आयात करें',
      pasteData: 'अपना डेटा यहां पेस्ट करें',
      pasteDataDesc: 'एक्सेल या CSV से डेटा पेस्ट करें (टैब या कॉमा से अलग किया गया)',
      pasteHere: 'यहां डेटा पेस्ट करें...',
      parseData: 'डेटा पार्स करें'
    },
    ur: {
      title: 'بلک ڈرائیور امپورٹ',
      uploadTitle: 'ڈرائیور ڈیٹا اپلوڈ کریں',
      uploadSubtitle: 'ایکسل یا CSV فائل سے متعدد ڈرائیوروں کو امپورٹ کریں',
      dragDrop: 'اپنی فائل یہاں کھینچیں اور چھوڑیں، یا براؤز کرنے کے لیے کلک کریں',
      browse: 'فائلیں براؤز کریں',
      supportedFormats: 'سپورٹڈ فارمیٹس: .csv، .xlsx، .xls',
      downloadTemplate: 'ٹیمپلیٹ ڈاؤنلوڈ کریں',
      previewTitle: 'ڈیٹا پیش نظارہ',
      previewSubtitle: 'امپورٹ کرنے سے پہلے کالم میپنگ کا جائزہ لیں',
      mapColumns: 'کالم میپ کریں',
      requiredField: 'ضروری فیلڈ',
      importingTitle: 'ڈرائیورز امپورٹ ہو رہے ہیں',
      importingSubtitle: 'براہ کرم انتظار کریں جبکہ ہم آپ کے ڈرائیوروں کو امپورٹ کر رہے ہیں',
      completeTitle: 'امپورٹ مکمل',
      completeSubtitle: 'آپ کے ڈرائیورز کامیابی سے امپورٹ کر لیے گئے ہیں',
      errorTitle: 'امپورٹ میں خرابی',
      errorSubtitle: 'آپ کے ڈرائیوروں کو امپورٹ کرنے میں ایک خرابی ہوئی',
      tryAgain: 'دوبارہ کوشش کریں',
      cancel: 'منسوخ کریں',
      back: 'واپس',
      import: 'ڈرائیورز امپورٹ کریں',
      close: 'بند کریں',
      driversImported: 'ڈرائیورز کامیابی سے امپورٹ کر لیے گئے',
      selectMapping: 'کالم میپنگ منتخب کریں',
      columnName: 'کالم کا نام',
      fieldMapping: 'فیلڈ میپنگ',
      name: 'نام',
      email: 'ای میل',
      phone: 'فون',
      joinDate: 'شمولیت کی تاریخ',
      vehicleId: 'گاڑی کی آئی ڈی',
      noFile: 'کوئی فائل منتخب نہیں',
      processing: 'فائل پروسیسنگ...',
      rowsFound: 'فائل میں قطاریں ملیں',
      importPreview: 'امپورٹ پیش نظارہ',
      chatbotImport: 'چیٹ بوٹ کے ذریعے امپورٹ کریں',
      chatbotImportDesc: 'آپ اپنا ڈیٹا براہ راست NavEdge AI اسسٹنٹ چیٹ بوٹ میں "ڈرائیورز امپورٹ کریں" کمانڈ کے بعد اپنا ڈیٹا پیسٹ کر سکتے ہیں۔',
      importFromClipboard: 'کلپ بورڈ سے امپورٹ کریں',
      pasteData: 'اپنا ڈیٹا یہاں پیسٹ کریں',
      pasteDataDesc: 'ایکسل یا CSV سے ڈیٹا پیسٹ کریں (ٹیب یا کاما سے الگ کیا گیا)',
      pasteHere: 'یہاں ڈیٹا پیسٹ کریں...',
      parseData: 'ڈیٹا پارس کریں'
    }
  };

  const t = texts[language];

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  // Parse the uploaded file
  const parseFile = async (selectedFile: File) => {
    setError(null);
    
    try {
      // In a real implementation, you would use a library like xlsx or papaparse
      // For this demo, we'll simulate parsing with a timeout
      
      // Simulate processing
      setTimeout(() => {
        // Mock data for demonstration
        const mockParsedData = [
          { Name: 'John Smith', Email: 'john@example.com', Phone: '+971501234567', 'Join Date': '2024-01-15', 'Vehicle ID': 'DXB-G-12345' },
          { Name: 'Sarah Johnson', Email: 'sarah@example.com', Phone: '+971502345678', 'Join Date': '2024-02-20', 'Vehicle ID': 'DXB-G-23456' },
          { Name: 'Mohammed Al-Farsi', Email: 'mohammed@example.com', Phone: '+971503456789', 'Join Date': '2024-03-10', 'Vehicle ID': 'DXB-G-34567' },
          { Name: 'Fatima Al-Zahra', Email: 'fatima@example.com', Phone: '+971504567890', 'Join Date': '2024-04-05', 'Vehicle ID': 'DXB-G-45678' },
          { Name: 'Raj Patel', Email: 'raj@example.com', Phone: '+971505678901', 'Join Date': '2024-05-12', 'Vehicle ID': 'DXB-G-56789' }
        ];
        
        setParsedData(mockParsedData);
        
        // Auto-detect column mapping
        if (mockParsedData.length > 0) {
          const firstRow = mockParsedData[0];
          const headers = Object.keys(firstRow);
          
          const mapping: {[key: string]: string} = {
            name: '',
            email: '',
            phone: '',
            joinDate: '',
            vehicleId: ''
          };
          
          // Try to match headers to fields
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            
            if (lowerHeader.includes('name')) {
              mapping.name = header;
            } else if (lowerHeader.includes('email')) {
              mapping.email = header;
            } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
              mapping.phone = header;
            } else if (lowerHeader.includes('join') || lowerHeader.includes('date')) {
              mapping.joinDate = header;
            } else if (lowerHeader.includes('vehicle') || lowerHeader.includes('car')) {
              mapping.vehicleId = header;
            }
          });
          
          setColumnMapping(mapping);
        }
        
        setStep('preview');
      }, 1500);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Failed to parse file. Please check the file format and try again.');
      setStep('error');
    }
  };

  // Parse clipboard data
  const parseClipboardData = (text: string) => {
    try {
      // Split by newlines
      const rows = text.trim().split(/\r?\n/);
      
      // Detect delimiter (tab or comma)
      const firstRow = rows[0];
      const delimiter = firstRow.includes('\t') ? '\t' : ',';
      
      // Parse headers
      const headers = firstRow.split(delimiter).map(h => h.trim());
      
      // Parse data rows
      const data = rows.slice(1).map(row => {
        const values = row.split(delimiter).map(v => v.trim());
        const rowData: {[key: string]: string} = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        return rowData;
      });
      
      setParsedData(data);
      
      // Auto-detect column mapping
      if (data.length > 0) {
        const mapping: {[key: string]: string} = {
          name: '',
          email: '',
          phone: '',
          joinDate: '',
          vehicleId: ''
        };
        
        // Try to match headers to fields
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          
          if (lowerHeader.includes('name')) {
            mapping.name = header;
          } else if (lowerHeader.includes('email')) {
            mapping.email = header;
          } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
            mapping.phone = header;
          } else if (lowerHeader.includes('join') || lowerHeader.includes('date')) {
            mapping.joinDate = header;
          } else if (lowerHeader.includes('vehicle') || lowerHeader.includes('car')) {
            mapping.vehicleId = header;
          }
        });
        
        setColumnMapping(mapping);
      }
      
      setStep('preview');
    } catch (err) {
      console.error('Error parsing clipboard data:', err);
      setError('Failed to parse data. Please check the format and try again.');
      setStep('error');
    }
  };

  // Download template file
  const downloadTemplate = () => {
    const templateContent = 'Name,Email,Phone,Join Date,Vehicle ID\nJohn Smith,john@example.com,+971501234567,2024-01-15,DXB-G-12345\nSarah Johnson,sarah@example.com,+971502345678,2024-02-20,DXB-G-23456';
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'driver_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Map columns to driver fields
  const handleColumnMappingChange = (field: string, value: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: value }));
  };

  // Import drivers
  const handleImport = () => {
    // Validate required fields
    if (!columnMapping.name || !columnMapping.email || !columnMapping.phone) {
      setError('Name, Email, and Phone are required fields. Please map these columns.');
      return;
    }
    
    setStep('importing');
    
    try {
      // Map parsed data to driver objects
      const drivers = parsedData.map(row => {
        const avatar = row[columnMapping.name]?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'XX';
        
        return {
          name: row[columnMapping.name] || '',
          email: row[columnMapping.email] || '',
          phone: row[columnMapping.phone] || '',
          avatar,
          trips: 0,
          earnings: 0,
          trips_today: 0,
          earnings_today: 0,
          status: 'active',
          performanceScore: 85,
          joinDate: row[columnMapping.joinDate] || new Date().toISOString().split('T')[0],
          location: { lat: 25.2048, lng: 55.2708 },
          vehicleId: row[columnMapping.vehicleId] || undefined
        };
      }).filter(driver => driver.name && driver.email && driver.phone);
      
      setMappedDrivers(drivers);
      
      // Simulate API call
      setTimeout(() => {
        onImportDrivers(drivers);
        setStep('complete');
      }, 2000);
    } catch (err) {
      console.error('Error importing drivers:', err);
      setError('Failed to import drivers. Please check your data and try again.');
      setStep('error');
    }
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.uploadTitle}</h3>
        <p className="text-gray-600">{t.uploadSubtitle}</p>
      </div>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) {
            handleFileSelect(droppedFile);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">{t.dragDrop}</p>
            <p className="text-sm text-gray-500">{t.supportedFormats}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.browse}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t border-gray-200 pt-6">
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <Download className="w-4 h-4" />
          <span>{t.downloadTemplate}</span>
        </button>
        
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
      
      {/* Clipboard Import Option */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="font-medium text-gray-900 mb-4">{t.importFromClipboard}</h4>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t.pasteDataDesc}</p>
          <textarea
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={t.pasteHere}
            onChange={(e) => {
              if (e.target.value.trim()) {
                parseClipboardData(e.target.value);
              }
            }}
          />
        </div>
      </div>
      
      {/* Chatbot Import Option */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="font-medium text-gray-900 mb-4">{t.chatbotImport}</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-800">{t.chatbotImportDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render preview step
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{t.previewTitle}</h3>
          <p className="text-gray-600">{t.previewSubtitle}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{file?.name || t.noFile}</span>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{parsedData.length} {t.rowsFound}</p>
        </div>
      </div>
      
      {/* Column Mapping */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">{t.mapColumns}</h4>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-4">{t.selectMapping}</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 font-medium text-gray-700 pb-2 border-b border-gray-200">
              <div>{t.fieldMapping}</div>
              <div>{t.columnName}</div>
            </div>
            
            {Object.entries({
              name: t.name,
              email: t.email,
              phone: t.phone,
              joinDate: t.joinDate,
              vehicleId: t.vehicleId
            }).map(([field, label]) => (
              <div key={field} className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <span>{label}</span>
                  {(field === 'name' || field === 'email' || field === 'phone') && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
                <select
                  value={columnMapping[field]}
                  onChange={(e) => handleColumnMappingChange(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Column --</option>
                  {parsedData.length > 0 && 
                    Object.keys(parsedData[0]).map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))
                  }
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Data Preview */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">{t.importPreview}</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {parsedData.length > 0 && Object.keys(parsedData[0]).map(header => (
                  <th key={header} className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parsedData.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-3 px-4 text-sm text-gray-900 border border-gray-200">
                      {cell as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {parsedData.length > 5 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing 5 of {parsedData.length} rows
          </p>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep('upload')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t.back}
        </button>
        
        <button
          onClick={handleImport}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t.import}
        </button>
      </div>
    </div>
  );

  // Render importing step
  const renderImportingStep = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 mx-auto relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.importingTitle}</h3>
        <p className="text-gray-600">{t.importingSubtitle}</p>
      </div>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.completeTitle}</h3>
        <p className="text-gray-600">{t.completeSubtitle}</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-lg font-semibold text-green-800 mb-2">
          {mappedDrivers.length} {t.driversImported}
        </p>
        <ul className="text-sm text-green-700 space-y-1 text-left">
          {mappedDrivers.slice(0, 5).map((driver, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{driver.name} ({driver.email})</span>
            </li>
          ))}
          {mappedDrivers.length > 5 && (
            <li className="text-center text-green-600 font-medium pt-2">
              + {mappedDrivers.length - 5} more
            </li>
          )}
        </ul>
      </div>
      
      <button
        onClick={onClose}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t.close}
      </button>
    </div>
  );

  // Render error step
  const renderErrorStep = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.errorTitle}</h3>
        <p className="text-gray-600">{t.errorSubtitle}</p>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-red-800">{error}</p>
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => setStep('upload')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t.tryAgain}
        </button>
        
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );

  // Render content based on current step
  const renderContent = () => {
    switch (step) {
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'importing':
        return renderImportingStep();
      case 'complete':
        return renderCompleteStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderUploadStep();
    }
  };

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
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Progress Steps - Only show if not on error or complete step */}
          {(step !== 'error' && step !== 'complete') && (
            <div className="flex items-center mt-6 space-x-4">
              {[
                { key: 'upload', label: t.uploadTitle },
                { key: 'preview', label: t.previewTitle },
                { key: 'importing', label: t.importingTitle }
              ].map((stepItem, index) => (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepItem.key ? 'bg-blue-600 text-white' : 
                    ['upload', 'preview', 'importing'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {['upload', 'preview', 'importing'].indexOf(step) > index ? '✓' : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{stepItem.label}</span>
                  {index < 2 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BulkImportDrivers;