'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SECTION_OPTIONS, DIETARY_OPTIONS, BRAND_OPTIONS } from '@/lib/constants';

interface InteractiveLegendProps {
  className?: string;
}

export default function InteractiveLegend({ className = '' }: InteractiveLegendProps) {
  const { preferences, updatePreferences } = usePreferences();
  const { dictionary } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'dietary' | 'brands'>('map');

  if (!dictionary) return null;

  const toggleMapFilter = (filter: keyof typeof preferences.mapFilters) => {
    if (filter === 'showSections') return; // Handle sections separately
    
    updatePreferences({
      mapFilters: {
        ...preferences.mapFilters,
        [filter]: !preferences.mapFilters[filter]
      }
    });
  };

  const toggleSection = (sectionId: string) => {
    const newSections = preferences.mapFilters.showSections.includes(sectionId)
      ? preferences.mapFilters.showSections.filter(id => id !== sectionId)
      : [...preferences.mapFilters.showSections, sectionId];
    
    updatePreferences({
      mapFilters: {
        ...preferences.mapFilters,
        showSections: newSections
      }
    });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const newRestrictions = preferences.dietaryRestrictions.includes(restriction)
      ? preferences.dietaryRestrictions.filter(r => r !== restriction)
      : [...preferences.dietaryRestrictions, restriction];
    
    updatePreferences({
      dietaryRestrictions: newRestrictions
    });
  };

  const toggleBrandPreference = (brand: string) => {
    const newBrands = preferences.brandPreferences.includes(brand)
      ? preferences.brandPreferences.filter(b => b !== brand)
      : [...preferences.brandPreferences, brand];
    
    updatePreferences({
      brandPreferences: newBrands
    });
  };

  const toggleOrganicPreference = () => {
    updatePreferences({
      organicPreference: !preferences.organicPreference
    });
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-2 xs:p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2 xs:mb-3">
        <h4 className="text-xs xs:text-sm sm:text-base font-semibold text-gray-800">{dictionary.map.legend}</h4>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-walmart-yellow text-walmart rounded hover:bg-yellow-400 transition-colors touch-manipulation flex items-center gap-1 font-semibold"
        >
          <span>{showAdvanced ? dictionary.map.simple : dictionary.map.advanced}</span>
          <svg className={`w-3 h-3 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Basic Legend - Always Visible */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 xs:gap-2 sm:gap-3 text-xs sm:text-sm mb-2 xs:mb-3">
        {/* Shopping Cart */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
          <div className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-walmart rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <span className="text-white text-xs sm:text-sm leading-none">🛒</span>
          </div>
          <span className="text-gray-800 font-medium text-xs sm:text-sm">{dictionary.map.cart}</span>
        </div>

        {/* Target Items - Toggleable */}
        <div 
          className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 rounded p-0.5 xs:p-1 transition-colors touch-manipulation"
          onClick={() => toggleMapFilter('showItems')}
        >
          <div className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-opacity flex-shrink-0 overflow-hidden ${
            preferences.mapFilters.showItems ? 'bg-walmart-yellow' : 'bg-gray-300'
          }`}>
            <span className="text-xs sm:text-sm leading-none">🎯</span>
          </div>
          <span className={`text-gray-800 font-medium text-xs sm:text-sm ${!preferences.mapFilters.showItems ? 'opacity-50' : ''}`}>
            {dictionary.map.items}
          </span>
        </div>

        {/* Route Path - Toggleable */}
        <div 
          className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 rounded p-0.5 xs:p-1 transition-colors touch-manipulation"
          onClick={() => toggleMapFilter('showRoute')}
        >
          <div className={`w-3 h-1 xs:w-4 xs:h-1 sm:w-5 sm:h-1.5 rounded-full transition-opacity flex-shrink-0 ${
            preferences.mapFilters.showRoute ? 'bg-walmart' : 'bg-gray-300'
          }`}></div>
          <span className={`text-gray-800 font-medium text-xs sm:text-sm ${!preferences.mapFilters.showRoute ? 'opacity-50' : ''}`}>
            {dictionary.map.route}
          </span>
        </div>

        {/* UWB Anchors - Toggleable */}
        <div 
          className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 rounded p-0.5 xs:p-1 transition-colors touch-manipulation"
          onClick={() => toggleMapFilter('showAnchors')}
        >
          <div className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-opacity flex-shrink-0 overflow-hidden ${
            preferences.mapFilters.showAnchors ? 'bg-red-500' : 'bg-gray-300'
          }`}>
            <span className="text-white text-xs sm:text-sm leading-none">📡</span>
          </div>
          <span className={`text-gray-800 font-medium text-xs sm:text-sm ${!preferences.mapFilters.showAnchors ? 'opacity-50' : ''}`}>
            {dictionary.map.anchors}
          </span>
        </div>

        {/* Services - Toggleable */}
        <div 
          className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 rounded p-0.5 xs:p-1 transition-colors touch-manipulation"
          onClick={() => toggleMapFilter('showServices')}
        >
          <div className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-opacity flex-shrink-0 overflow-hidden ${
            preferences.mapFilters.showServices ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            <span className="text-white text-xs sm:text-sm leading-none">🚪</span>
          </div>
          <span className={`text-gray-800 font-medium text-xs sm:text-sm ${!preferences.mapFilters.showServices ? 'opacity-50' : ''}`}>
            {dictionary.map.services}
          </span>
        </div>
      </div>

      {/* Advanced Preferences - Collapsible */}
      <div className={`border-t pt-3 transition-all duration-300 ease-in-out overflow-hidden ${
        showAdvanced ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pt-0'
      }`}>
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded transition-colors flex-1 sm:flex-none touch-manipulation ${
              activeTab === 'map' 
                ? 'bg-walmart text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🗺️ {dictionary.map.sections}
          </button>
          <button
            onClick={() => setActiveTab('dietary')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded transition-colors flex-1 sm:flex-none touch-manipulation ${
              activeTab === 'dietary' 
                ? 'bg-walmart text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🥗 {dictionary.map.dietary}
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded transition-colors flex-1 sm:flex-none touch-manipulation ${
              activeTab === 'brands' 
                ? 'bg-walmart text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🏷️ {dictionary.map.brands}
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-32 sm:max-h-40 overflow-y-auto">
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
              {SECTION_OPTIONS.map(section => (
                <label key={section.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded p-1.5 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={preferences.mapFilters.showSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 sm:w-3 sm:h-3 text-blue-600 rounded touch-manipulation"
                  />
                  <span className="text-gray-800 font-medium">{section.icon} {section.name}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'dietary' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1 text-xs">
                {DIETARY_OPTIONS.map(restriction => (
                  <label key={restriction} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded p-1">
                    <input
                      type="checkbox"
                      checked={preferences.dietaryRestrictions.includes(restriction)}
                      onChange={() => toggleDietaryRestriction(restriction)}
                      className="w-3 h-3 text-blue-600 rounded"
                    />
                    <span className="text-gray-800 font-medium">{restriction}</span>
                  </label>
                ))}
              </div>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded p-1">
                <input
                  type="checkbox"
                  checked={preferences.organicPreference}
                  onChange={toggleOrganicPreference}
                  className="w-3 h-3 text-blue-600 rounded"
                />
                <span className="text-gray-800 font-medium">🌱 {dictionary.preferences.preferOrganic}</span>
              </label>
            </div>
          )}

          {activeTab === 'brands' && (
            <div className="grid grid-cols-2 gap-1 text-xs">
              {BRAND_OPTIONS.map(brand => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded p-1">
                  <input
                    type="checkbox"
                    checked={preferences.brandPreferences.includes(brand)}
                    onChange={() => toggleBrandPreference(brand)}
                    className="w-3 h-3 text-blue-600 rounded"
                  />
                  <span className="text-gray-800 font-medium">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-friendly controls info */}
      <div className="mt-2 mb-2 text-xs text-gray-600 text-center leading-tight">
        {dictionary?.map.controls}
      </div>
    </div>
  );
}