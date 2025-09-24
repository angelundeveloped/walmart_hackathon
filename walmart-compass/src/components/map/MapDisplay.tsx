'use client';

import React from 'react';

interface MapDisplayProps {
  className?: string;
}

export default function MapDisplay({ className = '' }: MapDisplayProps) {
  return (
    <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Store Map</h3>
        <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>Map will be rendered here</p>
            <p className="text-sm mt-1">Store layout, cart position, and navigation path</p>
          </div>
        </div>
      </div>
    </div>
  );
}
