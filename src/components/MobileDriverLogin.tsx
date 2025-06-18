import React, { useState } from 'react';
import { Navigation, Eye, EyeOff, MapPin, Car } from 'lucide-react';

interface MobileDriverLoginProps {
  onLogin: (driverData: any) => void;
}

const MobileDriverLogin: React.FC<MobileDriverLoginProps> = ({ onLogin }) => {
  const [driverId, setDriverId] = useState('');
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
      if (driverId === 'driver1' && password === 'password') {
        onLogin({
          id: 1,
          name: 'Ahmed Al-Rashid',
          vehicleId: 'DXB-A-12345',
          avatar: 'AR'
        });
      } else {
        setError('Invalid driver ID or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NavEdge Driver</h1>
          <p className="text-blue-200">GPS Tracking & Fleet Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Driver ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Driver ID
              </label>
              <input
                type="text"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your driver ID"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your password"
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
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Start Tracking
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-blue-200">
              Demo: driver1 / password
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
            <MapPin className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-white text-sm">Real-time GPS</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
            <Car className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-white text-sm">Fleet Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDriverLogin;