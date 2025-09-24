'use client';

import React, { useState, useEffect } from 'react';
import { StoreLayout, StoreItem, UWBAnchor, Section } from '@/types/store';
import { loadStoreLayout } from '@/lib/store-data';

interface MapDisplayProps {
  className?: string;
}

interface CartPosition {
  x: number;
  y: number;
  heading: number; // in degrees
}

export default function MapDisplay({ className = '' }: MapDisplayProps) {
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null);
  const [cartPosition, setCartPosition] = useState<CartPosition>({ x: 50, y: 0, heading: 0 });
  const [selectedItems, setSelectedItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const layout = await loadStoreLayout();
        setStoreLayout(layout);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load store layout:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle keyboard controls for cart movement
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const step = 2; // Grid units to move
      const rotationStep = 15; // Degrees to rotate

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setCartPosition(prev => ({ ...prev, y: Math.max(0, prev.y - step) }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCartPosition(prev => ({ 
            ...prev, 
            y: Math.min((storeLayout?.map.height || 80) - 1, prev.y + step) 
          }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCartPosition(prev => ({ 
            ...prev, 
            x: Math.max(0, prev.x - step),
            heading: (prev.heading - rotationStep + 360) % 360
          }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCartPosition(prev => ({ 
            ...prev, 
            x: Math.min((storeLayout?.map.width || 100) - 1, prev.x + step),
            heading: (prev.heading + rotationStep) % 360
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [storeLayout]);

  if (isLoading) {
    return (
      <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Store Map</h3>
          <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p>Loading store layout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!storeLayout) {
    return (
      <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Store Map</h3>
          <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-red-500">
              <div className="text-4xl mb-2">❌</div>
              <p>Failed to load store layout</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { map, sections, items, uwb_anchors, entrances, checkouts, services } = storeLayout;

  return (
    <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Store Map</h3>
          <div className="text-sm text-gray-500">
            Cart: ({cartPosition.x.toFixed(1)}, {cartPosition.y.toFixed(1)}) 
            {cartPosition.heading}°
          </div>
        </div>
        
        {/* Map Container */}
        <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] relative overflow-hidden">
          <div 
            className="relative w-full h-full"
            style={{ 
              aspectRatio: `${map.width}/${map.height}`,
              minHeight: '400px'
            }}
          >
            {/* Store Sections */}
            {sections.map((section) => (
              <div key={section.id}>
                {section.aisles.map((aisle) => (
                  <div
                    key={aisle.id}
                    className="absolute border-2 border-gray-400 rounded-sm"
                    style={{
                      left: `${(aisle.coordinates[0][0] / map.width) * 100}%`,
                      top: `${(aisle.coordinates[0][1] / map.height) * 100}%`,
                      width: `${((aisle.coordinates[1][0] - aisle.coordinates[0][0]) / map.width) * 100}%`,
                      height: `${((aisle.coordinates[2][1] - aisle.coordinates[0][1]) / map.height) * 100}%`,
                      backgroundColor: section.color,
                      opacity: 0.3
                    }}
                    title={`${section.name} - ${aisle.id}`}
                  />
                ))}
              </div>
            ))}

            {/* UWB Anchors */}
            {uwb_anchors.map((anchor) => (
              <div
                key={anchor.id}
                className="absolute w-2 h-2 bg-red-500 rounded-full border border-red-700"
                style={{
                  left: `${(anchor.coordinates[0] / map.width) * 100}%`,
                  top: `${(anchor.coordinates[1] / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`UWB Anchor ${anchor.id}`}
              />
            ))}

            {/* Entrances */}
            {entrances.map((entrance) => (
              <div
                key={entrance.id}
                className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-green-700"
                style={{
                  left: `${(entrance.coordinates[0] / map.width) * 100}%`,
                  top: `${(entrance.coordinates[1] / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${entrance.name}`}
              />
            ))}

            {/* Checkouts */}
            {checkouts.map((checkout) => (
              <div
                key={checkout.id}
                className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-700"
                style={{
                  left: `${(checkout.coordinates[0] / map.width) * 100}%`,
                  top: `${(checkout.coordinates[1] / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${checkout.name}`}
              />
            ))}

            {/* Services */}
            {services.map((service) => (
              <div
                key={service.id}
                className="absolute w-3 h-3 bg-purple-500 rounded-full border-2 border-purple-700"
                style={{
                  left: `${(service.coordinates[0] / map.width) * 100}%`,
                  top: `${(service.coordinates[1] / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${service.name}`}
              />
            ))}

            {/* Shopping Cart */}
            <div
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-blue-800 flex items-center justify-center"
              style={{
                left: `${(cartPosition.x / map.width) * 100}%`,
                top: `${(cartPosition.y / map.height) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${cartPosition.heading}deg)`
              }}
              title={`Shopping Cart (${cartPosition.x.toFixed(1)}, ${cartPosition.y.toFixed(1)})`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Cart Direction Arrow */}
            <div
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-blue-600"
              style={{
                left: `${(cartPosition.x / map.width) * 100}%`,
                top: `${(cartPosition.y / map.height) * 100}%`,
                transform: `translate(-50%, -100%) rotate(${cartPosition.heading}deg)`
              }}
            />
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Cart</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>UWB Anchor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Entrance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Checkout</span>
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-2 text-xs text-gray-500">
          Use arrow keys to move the cart around the store
        </div>
      </div>
    </div>
  );
}
