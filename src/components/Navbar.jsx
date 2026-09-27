import React, { useState } from 'react';
import { Bus, Menu, X, UserCircle, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-red-600 p-2 rounded-xl">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-red-700">
              MeriYatra
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">{t('navDashboard')}</Link>
            <Link to="/routes" className="text-gray-700 hover:text-red-600 font-medium transition-colors">{t('navRoutes')}</Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">{t('navAbout')}</Link>
            
            <button 
              onClick={toggleLanguage}
              className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
            >
              {language === 'en' ? 'A / अ' : 'EN / HI'}
            </button>

            {user ? (
              <button onClick={signOut} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">
                <UserCircle className="h-5 w-5" />
                <span>{t('navLogin')}</span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors border border-red-200"
            >
              {language === 'en' ? 'A/अ' : 'EN'}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none bg-gray-50 p-2 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute w-full left-0 top-16">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <Link to="/" className="block px-4 py-3 text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 rounded-lg">{t('navDashboard')}</Link>
            <Link to="/routes" className="block px-4 py-3 text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 rounded-lg">{t('navRoutes')}</Link>
            <Link to="/about" className="block px-4 py-3 text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 rounded-lg">{t('navAbout')}</Link>
            
            <div className="border-t border-gray-100 mt-2 pt-4 px-4">
              {user ? (
                <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold transition-colors">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold transition-colors">
                  <UserCircle className="h-5 w-5" />
                  <span>{t('navLogin')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
