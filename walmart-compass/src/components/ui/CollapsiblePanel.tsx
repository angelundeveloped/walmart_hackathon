'use client';

import React, { useState } from 'react';

interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  compact?: boolean;
}

export default function CollapsiblePanel({ 
  title, 
  icon, 
  children, 
  defaultOpen = true, 
  className = '',
  compact = false 
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`bg-white border-2 border-blue-200 rounded-lg shadow-md ${className}`}>
      {/* Panel Header */}
      <button
        onClick={togglePanel}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-blue-50 transition-colors touch-manipulation"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title} panel`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm sm:text-base font-semibold text-walmart">{title}</h3>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Panel Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`${compact ? 'p-2' : 'p-3 sm:p-4'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
