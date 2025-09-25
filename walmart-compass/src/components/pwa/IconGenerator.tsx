'use client';

import React from 'react';

// This component generates a simple icon for PWA
// In production, you would use actual PNG files
export default function IconGenerator() {
  return (
    <div className="hidden">
      {/* This is just a placeholder - in production you'd have actual icon files */}
      <div className="w-192 h-192 bg-walmart rounded-lg flex items-center justify-center">
        <span className="text-white text-6xl">🛒</span>
      </div>
    </div>
  );
}
