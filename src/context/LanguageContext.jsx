import React, { createContext, useState, useContext } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // default to English

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'hi' : 'en'));
  };

  // Translation helper function
  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
