'use client';

import React, { useState, useEffect } from 'react';
import { useSelection } from '@/lib/selection';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  isCompleted: boolean;
  location?: {
    x: number;
    y: number;
  };
}

interface ShoppingListProps {
  className?: string;
}

export default function ShoppingList({ className = '' }: ShoppingListProps) {
  const { setTargetsAbsolute, pendingItems, cartPosition } = useSelection();
  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: '1',
      name: 'Organic Milk',
      category: 'Dairy',
      isCompleted: false,
      location: { x: 10, y: 5 }
    },
    {
      id: '2',
      name: 'Whole Wheat Bread',
      category: 'Bakery',
      isCompleted: false,
      location: { x: 15, y: 8 }
    },
    {
      id: '3',
      name: 'Free Range Eggs',
      category: 'Dairy',
      isCompleted: true,
      location: { x: 10, y: 6 }
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Sort items by proximity to cart position (closest first)
  const sortedItems = React.useMemo(() => {
    if (!cartPosition) return items;
    
    return [...items].sort((a, b) => {
      if (!a.location || !b.location) return 0;
      
      const distA = Math.sqrt(
        Math.pow(a.location.x - cartPosition.x, 2) + 
        Math.pow(a.location.y - cartPosition.y, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.location.x - cartPosition.x, 2) + 
        Math.pow(b.location.y - cartPosition.y, 2)
      );
      
      return distA - distB;
    });
  }, [items, cartPosition]);

  // Sync selections to shared context in one atomic update + merge parsed pendingItems
  useEffect(() => {
    // Merge any new pending chat items into the list if not present
    if (pendingItems.length > 0) {
      setItems(prev => {
        const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
        const additions = pendingItems
          .filter(p => !existingNames.has((p.label ?? p.id).toLowerCase()))
          .map((p, idx) => ({
            id: `chat-${p.id}-${idx}`,
            name: p.label ?? p.id,
            category: 'From Chat',
            isCompleted: false,
            location: { x: p.x, y: p.y },
          }));
        if (additions.length === 0) return prev;
        return [...prev, ...additions];
      });
    }

    const targets = items
      .filter(i => i.location && !i.isCompleted)
      .map(i => ({ id: i.id, x: i.location!.x, y: i.location!.y, label: i.name }));
    setTargetsAbsolute(targets);
  }, [items, setTargetsAbsolute, pendingItems]);

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;

  return (
    <div className={`bg-white border-2 border-gray-300 rounded-lg ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-[rgba(255,194,32,0.06)]">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-walmart">Shopping List</h3>
          <div className="text-sm text-gray-500">
            {completedCount}/{totalCount} completed
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--walmart-blue)',
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`
            }}
          ></div>
        </div>
      </div>
      
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🛒</div>
            <p>No items in your list yet</p>
            <p className="text-sm mt-1">Ask the assistant to add items!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                  item.isCompleted
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                    item.isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.isCompleted && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${
                      item.isCompleted ? 'text-gray-500 line-through' : 'text-contrast'
                    }`}>
                      {item.name}
                    </p>
                    {cartPosition && !item.isCompleted && sortedItems.indexOf(item) === 0 && (
                      <span className="text-xs bg-walmart text-white px-2 py-1 rounded-full">
                        Closest
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-contrast-light">{item.category}</p>
                </div>
                
                {item.location && (
                  <div className="text-xs text-contrast-light ml-2">
                    {cartPosition ? (
                      <span>
                        {Math.round(Math.sqrt(
                          Math.pow(item.location.x - cartPosition.x, 2) + 
                          Math.pow(item.location.y - cartPosition.y, 2)
                        ))}m
                      </span>
                    ) : (
                      <span>({item.location.x}, {item.location.y})</span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-3 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  aria-label={`Remove ${item.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
