'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthButton from '@/components/auth/AuthButton';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface MobileMenuProps {
  className?: string;
}

export default function MobileMenu({ className = '' }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dictionary } = useLanguage();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="flex flex-col items-center justify-center w-8 h-8 space-y-1 touch-manipulation"
        aria-label="Toggle mobile menu"
      >
        <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{dictionary?.menu.title || 'Menu'}</h2>
                <button
                  onClick={toggleMenu}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={dictionary?.menu.closeMenu || 'Close menu'}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Language Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{dictionary?.menu.language || 'Language'}</h3>
                  <LanguageSwitcher />
                </div>

                {/* User Account */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{dictionary?.menu.account || 'Account'}</h3>
                  <AuthButton />
                </div>

                {/* Status Indicators */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{dictionary?.menu.status || 'Status'}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📡</span>
                      <span>{dictionary?.header.uwbActive || 'UWB Active'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🤖</span>
                      <span>{dictionary?.header.aiReady || 'AI Ready'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Footer */}
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {dictionary?.footer.description || 'AI-Powered In-Store Navigation'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
