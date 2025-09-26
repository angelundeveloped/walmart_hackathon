'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MobileDpad from './MobileDpad';

interface MobileLayoutProps {
  mapContent: React.ReactNode;
  chatContent: React.ReactNode;
  listContent: React.ReactNode;
  className?: string;
}

export default function MobileLayout({ mapContent, chatContent, listContent, className = '' }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'list'>('map');
  const { dictionary } = useLanguage();

  const tabs = [
    { id: 'map' as const, label: dictionary?.navigation.map || 'Map', icon: '🗺️' },
    { id: 'chat' as const, label: dictionary?.navigation.chat || 'Chat', icon: '💬' },
    { id: 'list' as const, label: dictionary?.navigation.list || 'List', icon: '📝' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return mapContent;
      case 'chat':
        return chatContent;
      case 'list':
        return listContent;
      default:
        return mapContent;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Mobile Tab Navigation */}
      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors touch-manipulation ${
              activeTab === tab.id
                ? 'text-walmart bg-walmart-yellow border-b-2 border-walmart font-semibold'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
        
        {/* D-pad overlay for map tab */}
        {activeTab === 'map' && <MobileDpad />}
      </div>
    </div>
  );
}
