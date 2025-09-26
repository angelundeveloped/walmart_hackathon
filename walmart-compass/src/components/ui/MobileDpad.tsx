'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCartMovement } from '@/hooks/useCartMovement';

interface MobileDpadProps {
  className?: string;
}

// Constants for D-pad dimensions and positioning
const DPAD_SIZE = 200;
const DPAD_OFFSET = 220;

// Button styling constants
const BUTTON_CLASS = `
  flex items-center justify-center
  w-12 h-12
  bg-walmart/50 text-white
  rounded-lg
  shadow-md
  active:bg-walmart-dark
  active:scale-95
  hover:bg-walmart-dark
  transition-all duration-100
  touch-manipulation
  select-none
  text-xl
  font-bold
  border border-white/20
  focus:outline-none
  cursor-pointer
  user-select-none
`;

export default function MobileDpad({ className = '' }: MobileDpadProps) {
  const { moveCart } = useCartMovement();
  const [position, setPosition] = useState({ x: window.innerWidth - DPAD_OFFSET, y: window.innerHeight - DPAD_OFFSET });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleDirectionPress = (e: React.MouseEvent | React.TouchEvent, direction: 'up' | 'down' | 'left' | 'right') => {
    e.preventDefault();
    moveCart(direction);
  };

  // Drag functionality
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - DPAD_SIZE; // D-pad width
    const maxY = window.innerHeight - DPAD_SIZE; // D-pad height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div 
      className={`fixed z-50 ${className}`}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
    >
      {/* Drag handle */}
      <div 
        className="w-full h-6 bg-gray-300 cursor-move flex items-center justify-center mb-2 rounded-t-lg"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ touchAction: 'none' }}
      >
        <div className="w-8 h-1 bg-gray-500 rounded-full"></div>
      </div>
      
      {/* Simple D-pad - just the four buttons */}
      <div className="grid grid-cols-3 gap-1 w-40 h-40">
        {/* Up Arrow */}
        <button
          onClick={(e) => handleDirectionPress(e, 'up')}
          onTouchStart={(e) => handleDirectionPress(e, 'up')}
          className={`${BUTTON_CLASS} col-start-2 row-start-1`}
          aria-label="Move cart up"
        >
          ↑
        </button>
        
        {/* Left Arrow */}
        <button
          onClick={(e) => handleDirectionPress(e, 'left')}
          onTouchStart={(e) => handleDirectionPress(e, 'left')}
          className={`${BUTTON_CLASS} col-start-1 row-start-2`}
          aria-label="Move cart left"
        >
          ←
        </button>
        
        {/* Center (empty) */}
        <div></div>
        
        {/* Right Arrow */}
        <button
          onClick={(e) => handleDirectionPress(e, 'right')}
          onTouchStart={(e) => handleDirectionPress(e, 'right')}
          className={`${BUTTON_CLASS} col-start-3 row-start-2`}
          aria-label="Move cart right"
        >
          →
        </button>
        
        {/* Down Arrow */}
        <button
          onClick={(e) => handleDirectionPress(e, 'down')}
          onTouchStart={(e) => handleDirectionPress(e, 'down')}
          className={`${BUTTON_CLASS} col-start-2 row-start-3`}
          aria-label="Move cart down"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
