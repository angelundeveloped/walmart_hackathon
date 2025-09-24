'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoreLayout, StoreItem } from '@/types/store';
import { loadStoreLayout } from '@/lib/store-data';
import { simulateAndEstimate, AnchorDistance } from '@/simulation/uwb';
import { findPath, toGridPoint } from '@/lib/pathfinding';
import { useSelection } from '@/lib/selection';

interface MapDisplayProps {
  className?: string;
}

interface CartPose {
  x: number;
  y: number;
  heading: number; // in degrees
}

export default function MapDisplay({ className = '' }: MapDisplayProps) {
  // Walmart-inspired palette
  const WALMART_BLUE = '#0071CE';
  const WALMART_YELLOW = '#FFC220';
  const GRAY_DARK = '#1f2937';

  const { targets } = useSelection();
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null);
  // Keyboard-controlled ground truth
  const [trueCart, setTrueCart] = useState<CartPose>({ x: 50, y: 0, heading: 0 });
  // Estimated from UWB
  const [estimatedCart, setEstimatedCart] = useState<CartPose | null>(null);
  const [measuredAnchors, setMeasuredAnchors] = useState<AnchorDistance[] | null>(null);
  const [selectedItems, setSelectedItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[] | null>(null);
  const targetsKey = React.useMemo(() =>
    (targets ?? []).map(t => `${t.id}:${t.x},${t.y}`).join('|'),
  [targets]
  );
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Observe container size to scale route thickness/markers
  useEffect(() => {
    if (!mapCanvasRef.current) return;
    const el = mapCanvasRef.current;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      setContainerWidth(cr.width);
      setContainerHeight(cr.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Handle keyboard controls for cart movement (updates TRUE position only)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const step = 2; // Grid units to move
      const rotationStep = 15; // Degrees to rotate

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setTrueCart(prev => ({ ...prev, y: Math.max(0, prev.y - step) }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setTrueCart(prev => ({ 
            ...prev, 
            y: Math.min((storeLayout?.map.height || 80) - 1, prev.y + step) 
          }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setTrueCart(prev => ({ 
            ...prev, 
            x: Math.max(0, prev.x - step),
            heading: (prev.heading - rotationStep + 360) % 360
          }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setTrueCart(prev => ({ 
            ...prev, 
            x: Math.min((storeLayout?.map.width || 100) - 1, prev.x + step),
            heading: (prev.heading + rotationStep) % 360
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyPress as EventListener);
  }, [storeLayout]);

  // UWB simulation + trilateration: estimate cart position from anchors
  useEffect(() => {
    if (!storeLayout) return;

    const { measured, estimated } = simulateAndEstimate(
      storeLayout,
      { x: trueCart.x, y: trueCart.y },
      { noiseStdDev: 0.6, maxAnchors: 6 }
    );

    setMeasuredAnchors(measured);
    if (estimated) {
      setEstimatedCart({ x: estimated.x, y: estimated.y, heading: trueCart.heading });
    } else {
      setEstimatedCart(null);
    }
  }, [storeLayout, trueCart.x, trueCart.y, trueCart.heading]);

  // Compute a multi-stop path from estimated cart position to selected targets (in order)
  useEffect(() => {
    if (!storeLayout) return;
    if (!targets || targets.length === 0) { if (pathPoints !== null) setPathPoints(null); return; }

    let currentStart = toGridPoint(estimatedCart?.x ?? trueCart.x, estimatedCart?.y ?? trueCart.y);
    const allPoints: { x: number; y: number }[] = [];
    for (const t of targets) {
      const goal = toGridPoint(t.x, t.y);
      const seg = findPath(storeLayout, currentStart, goal);
      if (seg.length > 0) {
        if (allPoints.length > 0) seg.shift(); // avoid duplicate node at joins
        allPoints.push(...seg);
        currentStart = goal;
      }
    }
    const nextPath = allPoints.length > 0 ? allPoints : null;
    const equal = (a: {x:number;y:number}[] | null, b: {x:number;y:number}[] | null) => {
      if (a === b) return true;
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].x !== b[i].x || a[i].y !== b[i].y) return false;
      }
      return true;
    };
    if (!equal(pathPoints, nextPath)) setPathPoints(nextPath);
  }, [storeLayout, estimatedCart?.x, estimatedCart?.y, trueCart.x, trueCart.y, targetsKey, pathPoints]);

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
          <h3 className="text-lg font-semibold text-walmart">Store Map</h3>
          <div className="text-sm space-x-3 text-contrast">
            <span>
              True: ({trueCart.x.toFixed(1)}, {trueCart.y.toFixed(1)}) {trueCart.heading}°
            </span>
            <span>
              Est: ({(estimatedCart?.x ?? trueCart.x).toFixed(1)}, {(estimatedCart?.y ?? trueCart.y).toFixed(1)})
            </span>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] relative overflow-hidden">
          <div 
            ref={mapCanvasRef}
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

            {/* Path rendering */}
            {(
              (pathPoints && pathPoints.length > 1) || true
            ) && (
              // Use store units by setting viewBox to map dimensions
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
                viewBox={`0 0 ${map.width} ${map.height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="var(--walmart-blue)" />
                  </marker>
                </defs>
                <polyline
                  className="route-stroke-bold"
                  fill="none"
                  filter="url(#routeGlow)"
                  markerEnd="url(#arrowhead)"
                  strokeWidth={Math.max(2, Math.min(6, Math.round(Math.min(containerWidth, containerHeight) / 80)))}
                  points={(pathPoints && pathPoints.length > 1
                    ? pathPoints
                    : [
                        { x: Math.max(1, Math.floor((estimatedCart?.x ?? trueCart.x) - 5)) , y: Math.max(1, Math.floor((estimatedCart?.y ?? trueCart.y) - 5)) },
                        { x: Math.min(map.width - 1, Math.floor((estimatedCart?.x ?? trueCart.x) + 5)) , y: Math.min(map.height - 1, Math.floor((estimatedCart?.y ?? trueCart.y) + 5)) }
                      ]
                  )
                    .map(p => `${p.x},${p.y}`)
                    .join(' ')}
                />
              </svg>
            )}

            {/* UWB Anchors */}
            {uwb_anchors.map((anchor) => (
              <div
                key={anchor.id}
                className="absolute w-2.5 h-2.5 rounded-full border"
                style={{
                  backgroundColor: '#ef4444',
                  borderColor: '#991b1b',
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
                className="absolute w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: '#22c55e',
                  borderColor: '#15803d',
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
                className="absolute w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: WALMART_BLUE,
                  borderColor: '#0b4c8c',
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
                className="absolute w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: '#8b5cf6',
                  borderColor: '#5530c3',
                  left: `${(service.coordinates[0] / map.width) * 100}%`,
                  top: `${(service.coordinates[1] / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${service.name}`}
              />
            ))}

            {/* Selected target pins */}
            {targets.map(t => (
              <div
                key={t.id}
                className="absolute w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: WALMART_YELLOW,
                  borderColor: '#b38600',
                  left: `${(t.x / map.width) * 100}%`,
                  top: `${(t.y / map.height) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={t.label ?? 'Target'}
              />
            ))}

            {/* True cart (ghost) */}
            <div
              className="absolute w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: '#93c5fd',
                borderColor: '#60a5fa',
                left: `${(trueCart.x / map.width) * 100}%`,
                top: `${(trueCart.y / map.height) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${trueCart.heading}deg)`
              }}
              title={`True Cart (${trueCart.x.toFixed(1)}, ${trueCart.y.toFixed(1)})`}
            />

            {/* Estimated cart (authoritative for rendering) */}
            <div
              className="absolute w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-md"
              style={{
                backgroundColor: WALMART_BLUE,
                borderColor: '#0b4c8c',
                left: `${((estimatedCart?.x ?? trueCart.x) / map.width) * 100}%`,
                top: `${((estimatedCart?.y ?? trueCart.y) / map.height) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${trueCart.heading}deg)`
              }}
              title={`Estimated Cart (${(estimatedCart?.x ?? trueCart.x).toFixed(1)}, ${(estimatedCart?.y ?? trueCart.y).toFixed(1)})`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Direction Arrow for estimated */}
            <div
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent"
              style={{
                borderBottomColor: WALMART_YELLOW,
                left: `${((estimatedCart?.x ?? trueCart.x) / map.width) * 100}%`,
                top: `${((estimatedCart?.y ?? trueCart.y) / map.height) * 100}%`,
                transform: `translate(-50%, -100%) rotate(${trueCart.heading}deg)`
              }}
            />
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 pin-blue rounded-full"></div>
            <span className="text-contrast">Cart</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 pin-red rounded-full"></div>
            <span className="text-contrast">UWB Anchor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 pin-green rounded-full"></div>
            <span className="text-contrast">Entrance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 pin-yellow rounded-full"></div>
            <span className="text-contrast">Target</span>
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-2 text-xs text-contrast-light">
          Use arrow keys to move the cart around the store
        </div>
      </div>
    </div>
  );
}
