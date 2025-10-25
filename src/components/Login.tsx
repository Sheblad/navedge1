import React, { useState } from 'react';
import { Navigation, Eye, EyeOff, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { FastAPIService } from '../services/fastapi';

type Language = 'en' | 'ar' | 'hi' | 'ur';

interface LoginProps {
  onLogin: (token: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const texts = {
    en: {
      title: 'NavEdge Fleet Management',
      subtitle: 'Sign in to your dashboard',
      username: 'Username',
      password: 'Password',
      signIn: 'Sign In',
      invalidCredentials: 'Invalid username or password',
      demoCredentials: 'Demo: admin / password123'
    },
    ar: {
      title: 'نافيدج لإدارة الأسطول',
      subtitle: 'تسجيل الدخول إلى لوحة التحكم',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      signIn: 'تسجيل الدخول',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      demoCredentials: 'تجريبي: admin / password123'
    },
    hi: {
      title: 'नेवएज फ्लीट मैनेजमेंट',
      subtitle: 'अपने डैशबोर्ड में साइन इन करें',
      username: 'उपयोगकर्ता नाम',
      password: 'पासवर्ड',
      signIn: 'साइन इन',
      invalidCredentials: 'अमान्य उपयोगकर्ता नाम या पासवर्ड',
      demoCredentials: 'डेमो: admin / password123'
    },
    ur: {
      title: 'نیو ایج فلیٹ منیجمنٹ',
      subtitle: 'اپنے ڈیش بورڈ میں سائن ان کریں',
      username: 'صارف نام',
      password: 'پاس ورڈ',
      signIn: 'سائن ان',
      invalidCredentials: 'غلط صارف نام یا پاس ورڈ',
      demoCredentials: 'ڈیمو: admin / password123'
    }
  };

  const t = texts[language] || texts.en;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Try FastAPI login first
      try {
        const response = await FastAPIService.login(username, password);
        onLogin(response.access_token);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.log('FastAPI login failed, trying demo mode:', apiError);
      }

      // Fallback to demo login
      setTimeout(() => {
        if (username === 'admin' && password === 'password123') {
          const token = 'demo_token_' + Date.now();
          onLogin(token);
        } else {
          setError(t.invalidCredentials);
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError(t.invalidCredentials);
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 ${language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <div className="relative group">
          <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
            <Globe className="w-4 h-4" />
            <span>{languages.find(l => l.code === language)?.flag}</span>
            <span className="hidden sm:block">{languages.find(l => l.code === language)?.name}</span>
          </button>
          
          {/* Language Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-blue-200">{t.subtitle}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                  language === 'ar' || language === 'ur' ? 'text-right' : 'text-left'
                }`}
                placeholder={t.username}
                dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                    language === 'ar' || language === 'ur' ? 'text-right' : 'text-left'
                  }`}
                  placeholder={t.password}
                  dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${language === 'ar' || language === 'ur' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-white/60" />
                  ) : (
                    <Eye className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 dark:bg-red-500/30 border border-red-500/30 dark:border-red-500/40 rounded-lg p-3">
                <p className="text-red-200 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {t.signIn}
                </div>
              ) : (
                t.signIn
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-white/10">
            <p className="text-center text-sm text-blue-200">
              {t.demoCredentials}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;