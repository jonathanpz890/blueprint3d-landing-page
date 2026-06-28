import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  t: (key: keyof typeof translations['en']) => string;
  formatPrice: (usdAmount: number) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to read from localStorage or default to Hebrew ('he') as requested "make it in hebrew as well"
  const [language, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('print3d-lang');
    return (saved === 'en' || saved === 'he') ? saved : 'he'; // Default to Hebrew
  });

  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('print3d-lang', language);
    // Dynamically update the html tag direction and lang attribute
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
  };

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'en' ? 'he' : 'en'));
  };

  const formatPrice = (usdAmount: number): string => {
    if (language === 'he') {
      return `₪${(usdAmount * 3.7).toFixed(2)}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const t = (key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations['en'];
    // Fallback to English translation if key is missing
    return (dict[key] || translations['en'][key] || key) as string;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, t, formatPrice, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
