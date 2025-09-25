'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Locale } from '@/lib/i18n';

const languageOptions = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Locale, name: 'Español', flag: '🇲🇽' }
];

export default function LanguageSwitcher() {
  const { locale, setLocale, dictionary } = useLanguage();

  if (!dictionary) return null;

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none bg-gray-800 bg-opacity-80 hover:bg-opacity-90 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 text-sm sm:text-base text-white font-medium border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors cursor-pointer touch-manipulation min-h-[44px] sm:min-h-auto"
        title="Select Language"
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code} className="text-gray-900">
            {option.flag} {option.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
