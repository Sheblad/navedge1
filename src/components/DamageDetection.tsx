import React, { useState } from 'react';
import { Camera, AlertTriangle, CheckCircle, Loader, Upload, Image as ImageIcon, XCircle } from 'lucide-react';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface DamageDetectionProps {
  language: Language;
  fleetMode: 'rental' | 'taxi';
  contractId?: string;
}

interface DamageLocation {
  type: string;
  severity: string;
  location: string;
  confidence: number;
}

interface ComparisonResult {
  damages_detected: boolean;
  damage_locations: DamageLocation[];
  estimated_cost: number;
}

const DamageDetection: React.FC<DamageDetectionProps> = ({ language, fleetMode, contractId }) => {
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    en: {
      title: 'AI Damage Detection',
      subtitle: 'Upload before and after photos to detect vehicle damage automatically',
      beforePhoto: 'Before Photo',
      afterPhoto: 'After Photo',
      uploadBefore: 'Upload vehicle photo before rental',
      uploadAfter: 'Upload vehicle photo after return',
      analyzing: 'Analyzing photos with AI...',
      comparePhotos: 'Compare & Detect Damage',
      results: 'Analysis Results',
      noDamage: 'No damage detected',
      damageDetected: 'Damage detected',
      damageCount: 'Damage locations found',
      estimatedCost: 'Estimated Repair Cost',
      location: 'Location',
      type: 'Type',
      severity: 'Severity',
      confidence: 'Confidence',
      reset: 'Start New Analysis',
      uploadingBefore: 'Uploading before photo...',
      uploadingAfter: 'Uploading after photo...',
      selectContractFirst: 'Please select a contract first',
    },
    ar: {
      title: 'كشف الأضرار بالذكاء الاصطناعي',
      subtitle: 'قم بتحميل الصور قبل وبعد للكشف عن تلف السيارة تلقائيًا',
      beforePhoto: 'صورة قبل',
      afterPhoto: 'صورة بعد',
      uploadBefore: 'تحميل صورة السيارة قبل الإيجار',
      uploadAfter: 'تحميل صورة السيارة بعد الإرجاع',
      analyzing: 'تحليل الصور بالذكاء الاصطناعي...',
      comparePhotos: 'مقارنة واكتشاف الأضرار',
      results: 'نتائج التحليل',
      noDamage: 'لم يتم الكشف عن أي ضرر',
      damageDetected: 'تم الكشف عن ضرر',
      damageCount: 'مواقع الأضرار الموجودة',
      estimatedCost: 'التكلفة التقديرية للإصلاح',
      location: 'الموقع',
      type: 'النوع',
      severity: 'الخطورة',
      confidence: 'الثقة',
      reset: 'بدء تحليل جديد',
      uploadingBefore: 'تحميل الصورة قبل...',
      uploadingAfter: 'تحميل الصورة بعد...',
      selectContractFirst: 'يرجى تحديد عقد أولاً',
    },
    hi: {
      title: 'AI क्षति पहचान',
      subtitle: 'वाहन क्षति को स्वचालित रूप से पहचानने के लिए पहले और बाद की तस्वीरें अपलोड करें',
      beforePhoto: 'पहले की तस्वीर',
      afterPhoto: 'बाद की तस्वीर',
      uploadBefore: 'किराए से पहले वाहन की तस्वीर अपलोड करें',
      uploadAfter: 'वापसी के बाद वाहन की तस्वीर अपलोड करें',
      analyzing: 'AI से तस्वीरों का विश्लेषण...',
      comparePhotos: 'तुलना करें और क्षति का पता लगाएं',
      results: 'विश्लेषण परिणाम',
      noDamage: 'कोई क्षति नहीं मिली',
      damageDetected: 'क्षति का पता चला',
      damageCount: 'क्षति स्थान मिले',
      estimatedCost: 'अनुमानित मरम्मत लागत',
      location: 'स्थान',
      type: 'प्रकार',
      severity: 'गंभीरता',
      confidence: 'विश्वास',
      reset: 'नया विश्लेषण शुरू करें',
      uploadingBefore: 'पहले की तस्वीर अपलोड हो रही है...',
      uploadingAfter: 'बाद की तस्वीर अपलोड हो रही है...',
      selectContractFirst: 'कृपया पहले एक अनुबंध चुनें',
    },
    ur: {
      title: 'AI نقصان کی شناخت',
      subtitle: 'گاڑی کے نقصان کو خودکار طریقے سے پہچاننے کے لیے پہلے اور بعد کی تصاویر اپ لوڈ کریں',
      beforePhoto: 'پہلے کی تصویر',
      afterPhoto: 'بعد کی تصویر',
      uploadBefore: 'کرایہ سے پہلے گاڑی کی تصویر اپ لوڈ کریں',
      uploadAfter: 'واپسی کے بعد گاڑی کی تصویر اپ لوڈ کریں',
      analyzing: 'AI سے تصاویر کا تجزیہ...',
      comparePhotos: 'موازنہ کریں اور نقصان کی تلاش کریں',
      results: 'تجزیہ کے نتائج',
      noDamage: 'کوئی نقصان نہیں ملا',
      damageDetected: 'نقصان کا پتہ چلا',
      damageCount: 'نقصان کی جگہیں ملیں',
      estimatedCost: 'تخمینی مرمت کی لاگت',
      location: 'مقام',
      type: 'قسم',
      severity: 'شدت',
      confidence: 'اعتماد',
      reset: 'نیا تجزیہ شروع کریں',
      uploadingBefore: 'پہلے کی تصویر اپ لوڈ ہو رہی ہے...',
      uploadingAfter: 'بعد کی تصویر اپ لوڈ ہو رہی ہے...',
      selectContractFirst: 'براہ کرم پہلے ایک معاہدہ منتخب کریں',
    }
  };

  const t = texts[language];

  const handleBeforePhotoUpload = async (file: File) => {
    if (!file) return;

    setBeforePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBeforePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);

    try {
      await FastAPIService.uploadBeforeDamagePhoto(file);
    } catch (err) {
      console.error('Error uploading before photo:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAfterPhotoUpload = async (file: File) => {
    if (!file) return;

    setAfterPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);

    try {
      await FastAPIService.uploadAfterDamagePhoto(file);
    } catch (err) {
      console.error('Error uploading after photo:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCompare = async () => {
    if (!contractId) {
      setError(t.selectContractFirst);
      return;
    }

    if (!beforePhoto || !afterPhoto) {
      setError('Please upload both before and after photos');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await FastAPIService.compareDamagePhotos(contractId);
      setResult(response);
    } catch (err) {
      console.error('Error comparing photos:', err);
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setBeforePhoto(null);
    setAfterPhoto(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'moderate':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'severe':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">{t.title}</h2>
              <p className="text-orange-100 text-sm mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                    {t.beforePhoto}
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    {beforePreview ? (
                      <div className="relative">
                        <img src={beforePreview} alt="Before" className="w-full h-64 object-cover" />
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-8 h-8 text-green-600 bg-white rounded-full" />
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBeforePhotoUpload(file);
                          }}
                          disabled={uploading}
                        />
                        {uploading && !afterPhoto ? (
                          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t.uploadBefore}</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-orange-600" />
                    {t.afterPhoto}
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    {afterPreview ? (
                      <div className="relative">
                        <img src={afterPreview} alt="After" className="w-full h-64 object-cover" />
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-8 h-8 text-green-600 bg-white rounded-full" />
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAfterPhotoUpload(file);
                          }}
                          disabled={uploading}
                        />
                        {uploading && afterPhoto ? (
                          <Loader className="w-12 h-12 text-orange-600 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t.uploadAfter}</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={!beforePhoto || !afterPhoto || analyzing || uploading}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                {analyzing ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span>{t.comparePhotos}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`flex items-center space-x-3 p-6 rounded-lg ${
                result.damages_detected
                  ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
              }`}>
                {result.damages_detected ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${
                    result.damages_detected ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'
                  }`}>
                    {result.damages_detected ? t.damageDetected : t.noDamage}
                  </h3>
                  <p className={`text-sm ${
                    result.damages_detected ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {result.damage_locations.length} {t.damageCount}
                  </p>
                </div>
                {result.estimated_cost > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.estimatedCost}</p>
                    <p className="text-2xl font-bold text-red-600">AED {result.estimated_cost.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {result.damage_locations.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t.results}</h3>
                  <div className="space-y-3">
                    {result.damage_locations.map((damage, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{damage.location}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getSeverityColor(damage.severity)}`}>
                                {damage.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{damage.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.confidence}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {(damage.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.beforePhoto}</p>
                  </div>
                  {beforePreview && <img src={beforePreview} alt="Before" className="w-full h-48 object-cover" />}
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.afterPhoto}</p>
                  </div>
                  {afterPreview && <img src={afterPreview} alt="After" className="w-full h-48 object-cover" />}
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t.reset}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DamageDetection;
