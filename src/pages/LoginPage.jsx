import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, User, Key, Mail, Car, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { manualSignIn } = useAuth();
  
  // States for toggles
  const [role, setRole] = useState('passenger'); // 'passenger' or 'driver'
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('bus');
  const [rtoNumber, setRtoNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'register') {
        // Manual Registration using plain-text visible_password
        const newUserId = crypto.randomUUID();

        // 1. Insert into profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: newUserId, 
            identifier: identifier, 
            role: role,
            visible_password: password
          }]);
        
        if (profileError) {
          if (profileError.code === '23505') throw new Error("An account with this email/phone already exists.");
          throw profileError;
        }

        // 2. If driver, insert into driver_details
        if (role === 'driver') {
          const { error: driverError } = await supabase
            .from('driver_details')
            .insert([{ 
              id: newUserId, 
              vehicle_type: vehicleType, 
              rto_number: rtoNumber.toUpperCase() 
            }]);
          
          if (driverError) throw driverError;
        }

        // Registration success, sign in manually
        await manualSignIn(newUserId);
        navigate('/');

      } else {
        // Manual Login checking visible_password
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, visible_password')
          .eq('identifier', identifier)
          .single();
          
        if (profileError || !profile) {
          throw new Error("Invalid email/phone or password.");
        }

        if (profile.visible_password !== password) {
          throw new Error("Invalid email/phone or password.");
        }

        // Strict Role Cross-Check
        if (profile.role !== role) {
           const correctRole = profile.role === 'passenger' ? t('authPassenger') : t('authDriver');
           throw new Error(`Account mismatch: This account is registered as a ${correctRole}. Please select the correct tab.`);
        }

        // Login success
        await manualSignIn(profile.id);
        navigate('/');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 p-3 rounded-2xl shadow-lg">
            <Bus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'login' ? t('authSignIn') : t('authRegister')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
          
          {/* Role Toggle Switch */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex w-full">
              <button
                type="button"
                onClick={() => setRole('passenger')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === 'passenger' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="h-4 w-4" /> {t('authPassenger')}
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === 'driver' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Car className="h-4 w-4" /> {t('authDriver')}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('authEmailOrPhone')}</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50"
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('authPassword')}</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Driver Registration Specific Fields */}
            {role === 'driver' && mode === 'register' && (
              <div className="space-y-5 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('authVehicleType')}</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-lg bg-gray-50"
                  >
                    <option value="bus">{t('authVehicleTypeBus')}</option>
                    <option value="auto">{t('authVehicleTypeAuto')}</option>
                    <option value="cab">{t('authVehicleTypeCab')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('authRtoNumber')}</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={rtoNumber}
                      onChange={(e) => setRtoNumber(e.target.value.toUpperCase())}
                      className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50 uppercase"
                      placeholder="MH01AB1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('authUploadDoc')}</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-red-50 transition-colors cursor-pointer">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500 px-2 py-1">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'login' ? t('authSubmitLogin') : t('authSubmitRegister')}
              </button>
            </div>
          </form>

          {/* Mode Toggle Footer */}
          <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
            {mode === 'login' ? (
              <p>
                {t('authNoAccount')}{' '}
                <button onClick={() => setMode('register')} className="font-bold text-red-600 hover:text-red-500">
                  {t('authCreateOne')}
                </button>
              </p>
            ) : (
              <p>
                {t('authHasAccount')}{' '}
                <button onClick={() => setMode('login')} className="font-bold text-red-600 hover:text-red-500">
                  {t('authLoginHere')}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
