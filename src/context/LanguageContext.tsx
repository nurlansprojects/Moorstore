import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('moorstore_lang');
      if (saved === 'ru' || saved === 'uz' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'ru'; // Default requirement: Russian
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('moorstore_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[lang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to Russian
    if (translations.ru[key]) {
      return translations.ru[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
