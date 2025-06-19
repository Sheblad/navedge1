import React, { useState } from 'react';
import { X, Upload, User, Phone, Mail, Calendar, FileText, Car, MapPin, DollarSign, CheckCircle, Camera } from 'lucide-react';
import { Driver } from '../data/mockData';

interface AddDriverFormProps {
  onAddDriver: (driver: Omit<Driver, 'id'>) => void;
  onClose: () => void;
  language: 'en' | 'ar' | 'hi' | 'ur';
}

const AddDriverForm: React.FC<AddDriverFormProps> = ({ onAddDriver, onClose, language }) => {
  const [step, setStep] = useState<'personal' | 'documents' | 'vehicle' | 'contract' | 'complete'>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    
    // Document Information
    emiratesId: '',
    licenseNumber: '',
    licenseExpiry: '',
    passportNumber: '',
    passportExpiry: '',
    visaStatus: 'resident',
    
    // Vehicle Information
    vehicleId: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    
    // Contract Information
    contractType: 'rental',
    contractDuration: '12',
    monthlyRent: '1200',
    depositAmount: '5000',
    dailyKmLimit: '300',
    startDate: new Date().toISOString().split('T')[0],
    
    // System Fields
    avatar: '',
    status: 'active',
    trips: 0,
    earnings: 0,
    trips_today: 0,
    earnings_today: 0,
    performanceScore: 85,
    location: { lat: 25.2048, lng: 55.2708 }
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const texts = {
    en: {
      title: 'Add New Driver',
      personalInfo: 'Personal Information',
      documents: 'Documents & Licenses',
      vehicleInfo: 'Vehicle Assignment',
      contractInfo: 'Contract Details',
      complete: 'Driver Added',
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
      save: 'Save Driver',
      // Personal Info
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      address: 'Residential Address',
      uploadPhoto: 'Upload Photo',
      // Documents
      emiratesId: 'Emirates ID',
      licenseNumber: 'Driver License Number',
      licenseExpiry: 'License Expiry Date',
      passportNumber: 'Passport Number',
      passportExpiry: 'Passport Expiry Date',
      visaStatus: 'Visa Status',
      resident: 'Resident',
      tourist: 'Tourist',
      citizen: 'Citizen',
      // Vehicle
      vehicleId: 'Vehicle ID',
      vehicleMake: 'Make',
      vehicleModel: 'Model',
      vehicleYear: 'Year',
      vehicleColor: 'Color',
      noVehicle: 'No Vehicle Assignment',
      // Contract
      contractType: 'Contract Type',
      rental: 'Rental',
      employment: 'Employment',
      contractDuration: 'Duration (months)',
      monthlyRent: 'Monthly Rent (AED)',
      depositAmount: 'Security Deposit (AED)',
      dailyKmLimit: 'Daily KM Limit',
      startDate: 'Start Date',
      // Complete
      driverAdded: 'Driver Added Successfully!',
      driverAddedMessage: 'The driver has been added to your fleet.',
      viewDriver: 'View Driver Profile',
      addAnother: 'Add Another Driver',
      // Validation
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      // Placeholders
      namePlaceholder: 'Enter full name',
      emailPlaceholder: 'Enter email address',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'Enter residential address',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      licensePlaceholder: 'Enter license number',
      passportPlaceholder: 'Enter passport number',
      vehicleIdPlaceholder: 'DXB-A-12345'
    },
    ar: {
      title: 'إضافة سائق جديد',
      personalInfo: 'المعلومات الشخصية',
      documents: 'الوثائق والتراخيص',
      vehicleInfo: 'تخصيص المركبة',
      contractInfo: 'تفاصيل العقد',
      complete: 'تمت إضافة السائق',
      next: 'التالي',
      back: 'السابق',
      cancel: 'إلغاء',
      save: 'حفظ السائق',
      // Personal Info
      name: 'الاسم الكامل',
      email: 'عنوان البريد الإلكتروني',
      phone: 'رقم الهاتف',
      dateOfBirth: 'تاريخ الميلاد',
      nationality: 'الجنسية',
      address: 'العنوان السكني',
      uploadPhoto: 'تحميل صورة',
      // Documents
      emiratesId: 'الهوية الإماراتية',
      licenseNumber: 'رقم رخصة القيادة',
      licenseExpiry: 'تاريخ انتهاء الرخصة',
      passportNumber: 'رقم جواز السفر',
      passportExpiry: 'تاريخ انتهاء جواز السفر',
      visaStatus: 'حالة التأشيرة',
      resident: 'مقيم',
      tourist: 'سائح',
      citizen: 'مواطن',
      // Vehicle
      vehicleId: 'رقم المركبة',
      vehicleMake: 'الصنع',
      vehicleModel: 'الطراز',
      vehicleYear: 'السنة',
      vehicleColor: 'اللون',
      noVehicle: 'لا يوجد تخصيص مركبة',
      // Contract
      contractType: 'نوع العقد',
      rental: 'إيجار',
      employment: 'توظيف',
      contractDuration: 'المدة (أشهر)',
      monthlyRent: 'الإيجار الشهري (درهم)',
      depositAmount: 'مبلغ التأمين (درهم)',
      dailyKmLimit: 'حد الكيلومترات اليومي',
      startDate: 'تاريخ البدء',
      // Complete
      driverAdded: 'تمت إضافة السائق بنجاح!',
      driverAddedMessage: 'تمت إضافة السائق إلى أسطولك.',
      viewDriver: 'عرض ملف السائق',
      addAnother: 'إضافة سائق آخر',
      // Validation
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'الرجاء إدخال عنوان بريد إلكتروني صالح',
      invalidPhone: 'الرجاء إدخال رقم هاتف صالح',
      // Placeholders
      namePlaceholder: 'أدخل الاسم الكامل',
      emailPlaceholder: 'أدخل عنوان البريد الإلكتروني',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'أدخل العنوان السكني',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      licensePlaceholder: 'أدخل رقم الرخصة',
      passportPlaceholder: 'أدخل رقم جواز السفر',
      vehicleIdPlaceholder: 'DXB-A-12345'
    },
    hi: {
      title: 'नया ड्राइवर जोड़ें',
      personalInfo: 'व्यक्तिगत जानकारी',
      documents: 'दस्तावेज़ और लाइसेंस',
      vehicleInfo: 'वाहन असाइनमेंट',
      contractInfo: 'अनुबंध विवरण',
      complete: 'ड्राइवर जोड़ा गया',
      next: 'अगला',
      back: 'पीछे',
      cancel: 'रद्द करें',
      save: 'ड्राइवर सहेजें',
      // Personal Info
      name: 'पूरा नाम',
      email: 'ईमेल पता',
      phone: 'फोन नंबर',
      dateOfBirth: 'जन्म तिथि',
      nationality: 'राष्ट्रीयता',
      address: 'आवासीय पता',
      uploadPhoto: 'फोटो अपलोड करें',
      // Documents
      emiratesId: 'एमिरेट्स आईडी',
      licenseNumber: 'ड्राइवर लाइसेंस नंबर',
      licenseExpiry: 'लाइसेंस समाप्ति तिथि',
      passportNumber: 'पासपोर्ट नंबर',
      passportExpiry: 'पासपोर्ट समाप्ति तिथि',
      visaStatus: 'वीज़ा स्थिति',
      resident: 'निवासी',
      tourist: 'पर्यटक',
      citizen: 'नागरिक',
      // Vehicle
      vehicleId: 'वाहन आईडी',
      vehicleMake: 'मेक',
      vehicleModel: 'मॉडल',
      vehicleYear: 'वर्ष',
      vehicleColor: 'रंग',
      noVehicle: 'कोई वाहन असाइनमेंट नहीं',
      // Contract
      contractType: 'अनुबंध प्रकार',
      rental: 'किराया',
      employment: 'रोजगार',
      contractDuration: 'अवधि (महीने)',
      monthlyRent: 'मासिक किराया (AED)',
      depositAmount: 'सुरक्षा जमा (AED)',
      dailyKmLimit: 'दैनिक KM सीमा',
      startDate: 'प्रारंभ तिथि',
      // Complete
      driverAdded: 'ड्राइवर सफलतापूर्वक जोड़ा गया!',
      driverAddedMessage: 'ड्राइवर को आपके फ्लीट में जोड़ दिया गया है।',
      viewDriver: 'ड्राइवर प्रोफ़ाइल देखें',
      addAnother: 'एक और ड्राइवर जोड़ें',
      // Validation
      required: 'यह फ़ील्ड आवश्यक है',
      invalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें',
      invalidPhone: 'कृपया एक वैध फोन नंबर दर्ज करें',
      // Placeholders
      namePlaceholder: 'पूरा नाम दर्ज करें',
      emailPlaceholder: 'ईमेल पता दर्ज करें',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'आवासीय पता दर्ज करें',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      licensePlaceholder: 'लाइसेंस नंबर दर्ज करें',
      passportPlaceholder: 'पासपोर्ट नंबर दर्ज करें',
      vehicleIdPlaceholder: 'DXB-A-12345'
    },
    ur: {
      title: 'نیا ڈرائیور شامل کریں',
      personalInfo: 'ذاتی معلومات',
      documents: 'دستاویزات اور لائسنس',
      vehicleInfo: 'گاڑی کی تفویض',
      contractInfo: 'کنٹریکٹ کی تفصیلات',
      complete: 'ڈرائیور شامل کر دیا گیا',
      next: 'اگلا',
      back: 'پیچھے',
      cancel: 'منسوخ کریں',
      save: 'ڈرائیور محفوظ کریں',
      // Personal Info
      name: 'پورا نام',
      email: 'ای میل ایڈریس',
      phone: 'فون نمبر',
      dateOfBirth: 'تاریخ پیدائش',
      nationality: 'قومیت',
      address: 'رہائشی پتہ',
      uploadPhoto: 'تصویر اپلوڈ کریں',
      // Documents
      emiratesId: 'ایمریٹس آئی ڈی',
      licenseNumber: 'ڈرائیور لائسنس نمبر',
      licenseExpiry: 'لائسنس کی میعاد ختم ہونے کی تاریخ',
      passportNumber: 'پاسپورٹ نمبر',
      passportExpiry: 'پاسپورٹ کی میعاد ختم ہونے کی تاریخ',
      visaStatus: 'ویزا کی حیثیت',
      resident: 'رہائشی',
      tourist: 'سیاح',
      citizen: 'شہری',
      // Vehicle
      vehicleId: 'گاڑی کی آئی ڈی',
      vehicleMake: 'بنانے والا',
      vehicleModel: 'ماڈل',
      vehicleYear: 'سال',
      vehicleColor: 'رنگ',
      noVehicle: 'کوئی گاڑی تفویض نہیں',
      // Contract
      contractType: 'کنٹریکٹ کی قسم',
      rental: 'کرایہ',
      employment: 'ملازمت',
      contractDuration: 'مدت (مہینے)',
      monthlyRent: 'ماہانہ کرایہ (AED)',
      depositAmount: 'سیکیورٹی ڈپازٹ (AED)',
      dailyKmLimit: 'روزانہ KM حد',
      startDate: 'شروع کی تاریخ',
      // Complete
      driverAdded: 'ڈرائیور کامیابی سے شامل کر دیا گیا!',
      driverAddedMessage: 'ڈرائیور آپ کے فلیٹ میں شامل کر دیا گیا ہے۔',
      viewDriver: 'ڈرائیور پروفائل دیکھیں',
      addAnother: 'ایک اور ڈرائیور شامل کریں',
      // Validation
      required: 'یہ فیلڈ ضروری ہے',
      invalidEmail: 'براہ کرم ایک درست ای میل ایڈریس درج کریں',
      invalidPhone: 'براہ کرم ایک درست فون نمبر درج کریں',
      // Placeholders
      namePlaceholder: 'پورا نام درج کریں',
      emailPlaceholder: 'ای میل ایڈریس درج کریں',
      phonePlaceholder: '+971 50 123 4567',
      addressPlaceholder: 'رہائشی پتہ درج کریں',
      emiratesIdPlaceholder: '784-1990-1234567-1',
      licensePlaceholder: 'لائسنس نمبر درج کریں',
      passportPlaceholder: 'پاسپورٹ نمبر درج کریں',
      vehicleIdPlaceholder: 'DXB-A-12345'
    }
  };

  const t = texts[language];

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        // In a real app, you would upload this to a server and get a URL back
        // For now, we'll just use the initials for the avatar
        const nameParts = formData.name.split(' ');
        const initials = nameParts.map(part => part[0]).join('').toUpperCase();
        setFormData(prev => ({ ...prev, avatar: initials }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create driver object from form data
    const newDriver: Omit<Driver, 'id'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar || formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      trips: 0,
      earnings: 0,
      trips_today: 0,
      earnings_today: 0,
      status: 'active',
      performanceScore: 85,
      joinDate: new Date().toISOString().split('T')[0],
      location: { lat: 25.2048, lng: 55.2708 },
      vehicleId: formData.vehicleId || undefined
    };
    
    // Simulate API call
    setTimeout(() => {
      onAddDriver(newDriver);
      setIsSubmitting(false);
      setStep('complete');
    }, 1000);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div 
                className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center overflow-hidden border-2 border-gray-300 cursor-pointer"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="mt-2 text-sm text-gray-600">{t.uploadPhoto}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t.namePlaceholder}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t.emailPlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t.phonePlaceholder}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dateOfBirth}
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.nationality}
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.address}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t.addressPlaceholder}
              />
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.emiratesId} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="emiratesId"
                value={formData.emiratesId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t.emiratesIdPlaceholder}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.licenseNumber} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t.licensePlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.licenseExpiry} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passportNumber}
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t.passportPlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passportExpiry}
                </label>
                <input
                  type="date"
                  name="passportExpiry"
                  value={formData.passportExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.visaStatus}
              </label>
              <select
                name="visaStatus"
                value={formData.visaStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="resident">{t.resident}</option>
                <option value="tourist">{t.tourist}</option>
                <option value="citizen">{t.citizen}</option>
              </select>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                <span>Document upload functionality would be available here</span>
              </div>
            </div>
          </div>
        );
        
      case 'vehicle':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.vehicleId} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t.vehicleIdPlaceholder}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.vehicleMake}
                </label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.vehicleModel}
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.vehicleYear}
                </label>
                <input
                  type="text"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.vehicleColor}
                </label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="no-vehicle"
                checked={!formData.vehicleId}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      vehicleId: '',
                      vehicleMake: '',
                      vehicleModel: '',
                      vehicleYear: '',
                      vehicleColor: ''
                    }));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="no-vehicle" className="ml-2 block text-sm text-gray-700">
                {t.noVehicle}
              </label>
            </div>
          </div>
        );
        
      case 'contract':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.contractType}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contractType: 'rental' }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.contractType === 'rental'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.rental}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contractType: 'employment' }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.contractType === 'employment'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.employment}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.contractDuration}
                </label>
                <select
                  name="contractDuration"
                  value={formData.contractDuration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1</option>
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {formData.contractType === 'rental' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.monthlyRent}
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.depositAmount}
                    </label>
                    <input
                      type="number"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dailyKmLimit}
                  </label>
                  <input
                    type="number"
                    name="dailyKmLimit"
                    value={formData.dailyKmLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.driverAdded}</h3>
              <p className="text-gray-600">{t.driverAddedMessage}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {formData.avatar || formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formData.name}</div>
                  <div className="text-sm text-gray-500">{formData.email}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formData.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formData.vehicleId || t.noVehicle}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formData.contractType}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formData.startDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.viewDriver}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    // Personal Information
                    name: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    nationality: '',
                    address: '',
                    
                    // Document Information
                    emiratesId: '',
                    licenseNumber: '',
                    licenseExpiry: '',
                    passportNumber: '',
                    passportExpiry: '',
                    visaStatus: 'resident',
                    
                    // Vehicle Information
                    vehicleId: '',
                    vehicleMake: '',
                    vehicleModel: '',
                    vehicleYear: '',
                    vehicleColor: '',
                    
                    // Contract Information
                    contractType: 'rental',
                    contractDuration: '12',
                    monthlyRent: '1200',
                    depositAmount: '5000',
                    dailyKmLimit: '300',
                    startDate: new Date().toISOString().split('T')[0],
                    
                    // System Fields
                    avatar: '',
                    status: 'active',
                    trips: 0,
                    earnings: 0,
                    trips_today: 0,
                    earnings_today: 0,
                    performanceScore: 85,
                    location: { lat: 25.2048, lng: 55.2708 }
                  });
                  setPhotoPreview(null);
                  setStep('personal');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.addAnother}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Progress steps
  const steps = [
    { key: 'personal', label: t.personalInfo, icon: User },
    { key: 'documents', label: t.documents, icon: FileText },
    { key: 'vehicle', label: t.vehicleInfo, icon: Car },
    { key: 'contract', label: t.contractInfo, icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          
          {/* Progress Steps - Only show if not on complete step */}
          {step !== 'complete' && (
            <div className="flex items-center mt-6 space-x-4">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.key;
                const isCompleted = steps.findIndex(s => s.key === step) > index;
                
                return (
                  <div key={stepItem.key} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">{stepItem.label}</span>
                    {index < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderStepContent()}
          </div>
          
          {/* Footer with navigation buttons - Only show if not on complete step */}
          {step !== 'complete' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div>
                {step !== 'personal' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.key === step);
                      if (currentIndex > 0) {
                        setStep(steps[currentIndex - 1].key as any);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t.back}
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                
                {step !== 'contract' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.key === step);
                      if (currentIndex < steps.length - 1) {
                        setStep(steps[currentIndex + 1].key as any);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t.save}...</span>
                      </>
                    ) : (
                      <span>{t.save}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddDriverForm;