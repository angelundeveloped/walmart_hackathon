'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Dictionary, getDictionary } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dictionary when locale changes
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true);
      try {
        const dict = await getDictionary(locale);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        // Fallback to English if loading fails
        if (locale !== 'en') {
          const fallbackDict = await getDictionary('en');
          setDictionary(fallbackDict);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, [locale]);

  // Initialize locale from localStorage or browser preference
  useEffect(() => {
    const savedLocale = localStorage.getItem('walmart-wavefinder-locale') as Locale;
    if (savedLocale && ['en', 'es'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLocaleState('es');
      } else {
        setLocaleState('en');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('walmart-wavefinder-locale', newLocale);
  };

  const value = {
    locale,
    dictionary,
    setLocale,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
