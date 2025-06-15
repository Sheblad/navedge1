import React, { useState } from 'react';
import { Navigation, Eye, EyeOff, Globe } from 'lucide-react';

type Language = 'en' | 'ar';

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
    }
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (username === 'admin' && password === 'password123') {
        const token = 'demo_token_' + Date.now();
        onLogin(token);
      } else {
        setError(t.invalidCredentials);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
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
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder={t.username}
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
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder={t.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 pt-6 border-t border-white/20">
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