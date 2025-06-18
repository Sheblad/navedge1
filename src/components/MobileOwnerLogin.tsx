import React, { useState } from 'react';
import { Navigation, Eye, EyeOff, BarChart3, Users, Car, Shield } from 'lucide-react';

interface MobileOwnerLoginProps {
  onLogin: (ownerData: any) => void;
}

const MobileOwnerLogin: React.FC<MobileOwnerLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate login
    setTimeout(() => {
      if (username === 'admin' && password === 'password123') {
        onLogin({
          id: 1,
          name: 'Fleet Manager',
          company: 'NavEdge Fleet Management',
          avatar: 'FM'
        });
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6">
            <Navigation className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">NavEdge Fleet</h1>
          <p className="text-blue-200 text-lg">Mobile Fleet Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6 text-white/60" />
                  ) : (
                    <Eye className="w-6 h-6 text-white/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 mr-3" />
                  Access Dashboard
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-blue-200">
              Demo: admin / password123
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-blue-300 mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Driver Management</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
            <Car className="w-8 h-8 text-blue-300 mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Live GPS Tracking</p>
          </div>
        </div>

        {/* App Store Badges (Future) */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-xs mb-4">Available as Progressive Web App</p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-white text-xs">📱 Add to Home Screen</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-white text-xs">🌐 Works Offline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOwnerLogin;