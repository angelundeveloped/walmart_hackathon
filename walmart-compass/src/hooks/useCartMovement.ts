'use client';

import { useCallback } from 'react';

export function useCartMovement() {
  const moveCart = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // Map direction to keyboard key
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };

    const key = keyMap[direction];
    
    // Create and dispatch a keyboard event that the MapDisplay will catch
    const event = new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true
    });

    // Dispatch the event to the window, which MapDisplay is listening to
    window.dispatchEvent(event);
  }, []);

  return { moveCart };
}
