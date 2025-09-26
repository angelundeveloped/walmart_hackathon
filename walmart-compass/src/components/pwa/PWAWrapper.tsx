'use client';

import React from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import PWAManager from './PWAManager';

interface PWAWrapperProps {
  children: React.ReactNode;
}

export default function PWAWrapper({ children }: PWAWrapperProps) {
  useServiceWorker();
  
  return (
    <>
      {children}
      <PWAManager />
    </>
  );
}
