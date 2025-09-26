'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

/**
 * Represents a target point on the map with coordinates and optional label
 */
export interface TargetPoint {
  /** Unique identifier for the target point */
  id: string;
  /** X coordinate position */
  x: number;
  /** Y coordinate position */
  y: number;
  /** Optional display label for the target */
  label?: string;
}

interface SelectionContextValue {
  targets: TargetPoint[];
  addTarget: (t: TargetPoint) => void;
  removeTarget: (id: string) => void;
  clearTargets: () => void;
  setTargetsAbsolute: (list: TargetPoint[]) => void;
  pendingItems: TargetPoint[];
  setPendingItems: (list: TargetPoint[]) => void;
  cartPosition: { x: number; y: number } | null;
  setCartPosition: (pos: { x: number; y: number } | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

// Error message constants
const ERROR_MESSAGES = {
  PROVIDER_REQUIRED: 'useSelection must be used within SelectionProvider'
} as const;

/**
 * Compares two TargetPoint objects for equality
 * @param pointA First target point
 * @param pointB Second target point
 * @returns true if points are equal, false otherwise
 */
const areTargetPointsEqual = (pointA: TargetPoint, pointB: TargetPoint): boolean => {
  return pointA.id === pointB.id && 
         pointA.x === pointB.x && 
         pointA.y === pointB.y && 
         pointA.label === pointB.label;
};

/**
 * Provider component that manages selection state including targets, pending items, and cart position
 */
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<TargetPoint[]>([]);
  const [pendingItems, setPendingItems] = useState<TargetPoint[]>([]);
  const [cartPosition, setCartPosition] = useState<{ x: number; y: number } | null>(null);

  /**
   * Compares two arrays of TargetPoints for deep equality
   * @param targetsA First array of target points
   * @param targetsB Second array of target points
   * @returns true if arrays are equal, false otherwise
   */
  const equalTargets = (targetsA: TargetPoint[], targetsB: TargetPoint[]) => {
    if (targetsA === targetsB) return true;
    if (targetsA.length !== targetsB.length) return false;
    
    return targetsA.every((pointA, index) => {
      const pointB = targetsB[index];
      return pointB && areTargetPointsEqual(pointA, pointB);
    });
  };

  const value = useMemo<SelectionContextValue>(() => ({
    targets,
    addTarget: (t: TargetPoint) => {
      setTargets(prev => (prev.find(p => p.id === t.id) ? prev : [...prev, t]));
    },
    removeTarget: (id: string) => {
      setTargets(prev => prev.filter(p => p.id !== id));
    },
    clearTargets: () => setTargets([]),
    setTargetsAbsolute: (list: TargetPoint[]) => {
      setTargets(prev => (equalTargets(prev, list) ? prev : list));
    },
    pendingItems,
    setPendingItems,
    cartPosition,
    setCartPosition,
  }), [targets, cartPosition, pendingItems]);

  return (
    <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
  );
}

/**
 * Hook to access the selection context
 * @returns SelectionContextValue with targets, pending items, cart position and related functions
 * @throws Error if used outside of SelectionProvider
 */
export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error(ERROR_MESSAGES.PROVIDER_REQUIRED);
  return ctx;
}
