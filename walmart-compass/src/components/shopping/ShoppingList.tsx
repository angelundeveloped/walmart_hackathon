'use client';

import React, { useState, useEffect } from 'react';
import { useSelection } from '@/lib/selection';
import { getSimilarItems } from '@/lib/llm';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedSectionName } from '@/lib/i18n';

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
  const { setTargetsAbsolute, pendingItems, cartPosition, removeTarget } = useSelection();
  const { dictionary } = useLanguage();

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dairy': return '🥛';
      case 'bakery': return '🍞';
      case 'produce': return '🥬';
      case 'meat & seafood': return '🥩';
      case 'frozen foods': return '🧊';
      case 'pantry': return '🥫';
      case 'beverages': return '🥤';
      case 'health & beauty': return '💄';
      case 'household': return '🧽';
      case 'from chat': return '💬';
      default: return '🛒';
    }
  };
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
  
  // Track removed items to prevent them from being re-added
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());

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
    // Remove from local items state
    setItems(prev => prev.filter(i => i.id !== id));
    // Also remove from selection context targets
    removeTarget(id);
    // Track this item as removed to prevent re-adding
    setRemovedItems(prev => new Set([...prev, id]));
  };

  // Sort items: incomplete first (by proximity), then completed at bottom
  const sortedItems = React.useMemo(() => {
    if (!cartPosition) return items;
    
    const incompleteItems = items.filter(item => !item.isCompleted);
    const completedItems = items.filter(item => item.isCompleted);
    
    // Sort incomplete items by proximity (closest first)
    const sortedIncomplete = [...incompleteItems].sort((a, b) => {
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
    
    // Completed items go to the bottom (no sorting needed)
    return [...sortedIncomplete, ...completedItems];
  }, [items, cartPosition]);

  // Sync selections to shared context in one atomic update + merge parsed pendingItems
  useEffect(() => {
    // Merge any new pending chat items into the list if not present
    if (pendingItems.length > 0) {
      setItems(prev => {
        const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
        const additions = pendingItems
          .filter(p => !existingNames.has((p.label ?? p.id).toLowerCase()))
          .filter(p => !removedItems.has(p.id)) // Don't re-add removed items
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
  }, [pendingItems, removedItems]);

  // Separate effect for updating targets to avoid infinite loops
  useEffect(() => {
    const targets = items
      .filter(i => i.location && !i.isCompleted)
      .map(i => ({ id: i.id, x: i.location!.x, y: i.location!.y, label: i.name }));
    setTargetsAbsolute(targets);
  }, [items]); // Remove setTargetsAbsolute from dependencies

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;

  return (
    <div className={`bg-white border-2 border-blue-200 rounded-lg ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-[rgba(255,194,32,0.06)]">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-walmart">{dictionary?.shopping.title || "Shopping List"}</h3>
          <div className="text-sm text-contrast-muted">
            {completedCount}/{totalCount} {dictionary?.shopping.completedCount || "completed"}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-walmart-yellow h-2 rounded-full transition-all duration-500 shadow-sm"
            style={{ 
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`
            }}
          ></div>
        </div>
      </div>
      
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center text-contrast-muted py-8">
            <div className="text-4xl mb-2">🛒</div>
            <p>No items in your list yet</p>
            <p className="text-sm mt-1">Ask the assistant to add items!</p>
          </div>
        ) : (
          <div className="space-y-3">
                     {sortedItems.map((item, index) => (
                       <div
                         key={item.id}
                         className={`flex items-center p-3 rounded-lg border transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] animate-fadeInUp ${
                           item.isCompleted
                             ? 'bg-blue-50 border-blue-200 opacity-75'
                             : 'bg-white border-blue-200 hover:border-blue-400 text-black'
                         }`}
                         style={{
                           animationDelay: `${index * 50}ms`
                         }}
                       >
                         <button
                           onClick={() => toggleItem(item.id)}
                           className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                             item.isCompleted
                               ? 'bg-green-500 border-green-500 text-white animate-bounce-slow'
                               : 'border-blue-300 hover:border-green-500 hover:scale-110'
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
                      item.isCompleted ? 'text-contrast-muted line-through' : 'text-contrast'
                    }`}>
                      {item.name}
                    </p>
                    {cartPosition && !item.isCompleted && sortedItems.indexOf(item) === 0 && (
                      <span className="text-xs bg-walmart-yellow text-walmart px-2 py-1 rounded-full font-semibold">
                        {dictionary?.map.closest || 'Closest'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getCategoryIcon(item.category)}</span>
                    <p className="text-sm text-gray-600">
                      {item.category === 'From Chat' 
                        ? (dictionary?.map.fromChat || 'From Chat')
                        : getTranslatedSectionName(item.category, dictionary!)
                      }
                    </p>
                  </div>
                </div>
                
                {item.location && (
                  <div className="text-xs text-gray-600 ml-2">
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

                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 sm:ml-3">
                  <button
                    onClick={async () => {
                      try {
                        const similar = await getSimilarItems(item.id, 3);
                        if (similar.length > 0) {
                          const similarNames = similar.map(s => s.item.name).join(', ');
                          alert(`${dictionary?.shopping.similarItems || "Similar items to"} ${item.name}:\n${similarNames}`);
                        } else {
                          alert(`${dictionary?.shopping.noSimilarItems || "No similar items found for"} ${item.name}`);
                        }
                      } catch (error) {
                        console.error('Error getting similar items:', error);
                      }
                    }}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1 rounded border border-blue-300 hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-medium touch-manipulation"
                    title="Find similar items"
                  >
                    {dictionary?.shopping.similar || "Similar"}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1 rounded border border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 touch-manipulation"
                    aria-label={`Remove ${item.name}`}
                  >
                    {dictionary?.shopping.remove || "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
