'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface TargetPoint {
  id: string;
  x: number;
  y: number;
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

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<TargetPoint[]>([]);
  const [pendingItems, setPendingItems] = useState<TargetPoint[]>([]);
  const [cartPosition, setCartPosition] = useState<{ x: number; y: number } | null>(null);

  const equalTargets = (a: TargetPoint[], b: TargetPoint[]) => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      const y = b[i];
      if (!y || x.id !== y.id || x.x !== y.x || x.y !== y.y || x.label !== y.label) return false;
    }
    return true;
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

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
