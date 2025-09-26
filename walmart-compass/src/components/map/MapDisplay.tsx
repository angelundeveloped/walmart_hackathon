'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoreLayout } from '@/types/store';
import { loadStoreLayout } from '@/lib/store-data';
import { simulateAndEstimate } from '@/simulation/uwb';
import { findPath, toGridPoint, snapToWalkable } from '@/lib/pathfinding';
import { useSelection } from '@/lib/selection';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import InteractiveLegend from './InteractiveLegend';

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

  const { targets, setCartPosition } = useSelection();
  const { preferences } = usePreferences();
  const { dictionary } = useLanguage();
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null);
  // Keyboard-controlled ground truth
  const [trueCart, setTrueCart] = useState<CartPose>({ x: 50, y: 0, heading: 0 });
  // Estimated from UWB
  const [estimatedCart, setEstimatedCart] = useState<CartPose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[] | null>(null);
  const targetsKey = React.useMemo(() =>
    (targets ?? []).map(t => `${t.id}:${t.x},${t.y}`).join('|'),
  [targets]
  );
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const prevPathRef = useRef<{ x: number; y: number }[] | null>(null);
  const lastComputeRef = useRef<number>(0);

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

    const { estimated } = simulateAndEstimate(
      storeLayout,
      { x: trueCart.x, y: trueCart.y },
      { noiseStdDev: 0.6, maxAnchors: 6 }
    );

    // setMeasuredAnchors(measured); // For future debugging/display
    if (estimated) {
      setEstimatedCart({ x: estimated.x, y: estimated.y, heading: trueCart.heading });
      // Share cart position with other components
      setCartPosition({ x: estimated.x, y: estimated.y });
    } else {
      setEstimatedCart(null);
      setCartPosition({ x: trueCart.x, y: trueCart.y });
    }
  }, [storeLayout, trueCart.x, trueCart.y, trueCart.heading, setCartPosition]);

  // Compute a multi-stop path from estimated cart position to selected targets (nearest-first greedy)
  useEffect(() => {
    if (!storeLayout) return;
    if (!targets || targets.length === 0) { if (pathPoints !== null) setPathPoints(null); return; }

    // Throttle recomputation to avoid spamming on tiny movements
    const now = Date.now();
    if (now - lastComputeRef.current < 120) return;
    lastComputeRef.current = now;

    // Stabilize by rounding to grid (reduces UWB jitter)
    let currentStart = snapToWalkable(storeLayout, toGridPoint(estimatedCart?.x ?? trueCart.x, estimatedCart?.y ?? trueCart.y));
    const allPoints: { x: number; y: number }[] = [];
    const remaining = [...targets];

    const dist = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    while (remaining.length > 0) {
      // choose nearest target to currentStart
      let nearestIdx = 0;
      let nearestD = Number.POSITIVE_INFINITY;
      for (let i = 0; i < remaining.length; i++) {
        const d = dist(currentStart, toGridPoint(remaining[i].x, remaining[i].y));
        if (d < nearestD) { nearestD = d; nearestIdx = i; }
      }
      const t = remaining.splice(nearestIdx, 1)[0];
      const goal = snapToWalkable(storeLayout, toGridPoint(t.x, t.y));
      const seg = findPath(storeLayout, currentStart, goal);
      if (seg.length > 0) {
        if (allPoints.length > 0) seg.shift(); // avoid duplicate node at joins
        allPoints.push(...seg);
        currentStart = goal;
      } else {
        // if no path, skip this target
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
    if (!equal(prevPathRef.current, nextPath)) {
      prevPathRef.current = nextPath;
      setPathPoints(nextPath);
    }
  }, [storeLayout, targetsKey, estimatedCart?.x, estimatedCart?.y, trueCart.x, trueCart.y, pathPoints, targets]);

  if (isLoading || !dictionary) {
    return (
      <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-contrast mb-2">{dictionary?.map.title || 'Store Map'}</h3>
          <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-contrast-muted">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p>{dictionary?.common.loading || 'Loading store layout...'}</p>
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
          <h3 className="text-lg font-semibold text-contrast mb-2">Store Map</h3>
          <div className="bg-white border border-gray-200 rounded p-4 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">❌</div>
              <p>Failed to load store layout</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { map, sections, uwb_anchors, entrances, checkouts, services } = storeLayout;
  
  // Filter sections based on user preferences
  const visibleSections = sections.filter(section => 
    preferences.mapFilters.showSections.includes(section.id)
  );

  return (
    <div className={`bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-walmart">{dictionary.map.title}</h3>
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
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-h-[400px] relative overflow-hidden map-container shadow-sm">
          <div 
            ref={mapCanvasRef}
            className="relative w-full h-full overflow-hidden map-canvas rounded-md"
            style={{ 
              aspectRatio: `${map.width}/${map.height}`,
              minHeight: '400px',
              maxWidth: '100%',
              maxHeight: '600px',
              position: 'relative',
              contain: 'layout style'
            }}
          >
            {/* Store Sections */}
            {preferences.mapFilters.showItems && visibleSections.map((section) => (
              <div key={section.id}>
                {section.aisles.map((aisle) => (
                  <div
                    key={aisle.id}
                    className="absolute border-2 border-gray-400 rounded-sm z-10"
                    style={{
                      left: `${(aisle.coordinates[0][0] / map.width) * 100}%`,
                      top: `${(aisle.coordinates[0][1] / map.height) * 100}%`,
                      width: `${((aisle.coordinates[1][0] - aisle.coordinates[0][0]) / map.width) * 100}%`,
                      height: `${((aisle.coordinates[2][1] - aisle.coordinates[0][1]) / map.height) * 100}%`,
                      backgroundColor: section.color,
                      opacity: 0.4
                    }}
                    title={`${section.name} - ${aisle.id}`}
                  />
                ))}
              </div>
            ))}

            {/* Section Labels */}
            {preferences.mapFilters.showItems && visibleSections.map((section) => {
              // Calculate center position for the first aisle of each section
              const firstAisle = section.aisles[0];
              if (!firstAisle) return null;
              
              const centerX = (firstAisle.coordinates[0][0] + firstAisle.coordinates[1][0]) / 2;
              const centerY = (firstAisle.coordinates[0][1] + firstAisle.coordinates[2][1]) / 2;
              
              // Get section icon
              const getSectionIcon = (sectionName: string) => {
                switch (sectionName.toLowerCase()) {
                  case 'dairy': return '🥛';
                  case 'bakery': return '🍞';
                  case 'produce': return '🥬';
                  case 'meat & seafood': return '🥩';
                  case 'frozen foods': return '🧊';
                  case 'pantry': return '🥫';
                  case 'beverages': return '🥤';
                  case 'health & beauty': return '💄';
                  case 'household': return '🧽';
                  default: return '🏪';
                }
              };

              return (
                <div
                  key={`label-${section.id}`}
                  className="absolute flex items-center gap-0.5 xs:gap-1 bg-white rounded-sm xs:rounded-md px-1 xs:px-2 py-0.5 xs:py-1 shadow-sm xs:shadow-md border border-gray-300 xs:border-2 text-black overflow-hidden map-element"
                  style={{
                    left: `${Math.max(0, Math.min(100, (centerX / map.width) * 100))}%`,
                    top: `${Math.max(0, Math.min(100, (centerY / map.height) * 100))}%`,
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '120px',
                    zIndex: 10
                  }}
                >
                  <span className="text-xs xs:text-sm leading-none flex-shrink-0">{getSectionIcon(section.name)}</span>
                  <span className="text-xs font-bold text-gray-800 hidden xs:inline truncate">{section.name}</span>
                </div>
              );
            })}

            {/* Path rendering */}
            {preferences.mapFilters.showRoute && pathPoints && pathPoints.length > 1 && (
              // Use store units by setting viewBox to map dimensions
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
                viewBox={`0 0 ${map.width} ${map.height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <marker id="arrowhead" markerUnits="strokeWidth" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                    <polygon points="0 0, 4 2, 0 4" fill="var(--walmart-blue)" />
                  </marker>
                </defs>
                <polyline
                  className="route-stroke-bold"
                  fill="none"
                  filter="url(#routeGlow)"
                  markerEnd="url(#arrowhead)"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={Math.max(2, Math.min(4, Math.round(Math.min(containerWidth, containerHeight) / 200)))}
                  points={pathPoints
                    .map(p => `${p.x},${p.y}`)
                    .join(' ')}
                />
              </svg>
            )}

            {/* UWB Anchors */}
            {preferences.mapFilters.showAnchors && uwb_anchors.map((anchor) => (
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
            {preferences.mapFilters.showServices && entrances.map((entrance) => (
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
            {preferences.mapFilters.showServices && checkouts.map((checkout) => (
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
            {preferences.mapFilters.showServices && services.map((service) => (
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

            {/* Selected target pins with smart labels */}
            {preferences.mapFilters.showItems && targets.map(t => {
              const cartPos = estimatedCart ?? trueCart;
              const distance = Math.sqrt((t.x - cartPos.x) ** 2 + (t.y - cartPos.y) ** 2);
              // Show labels within 20 units for better visibility
              
              return (
                <div
                  key={t.id}
                  className="absolute z-20 map-element"
                  style={{
                    left: `${Math.max(0, Math.min(100, (t.x / map.width) * 100))}%`,
                    top: `${Math.max(0, Math.min(100, (t.y / map.height) * 100))}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Item label above the pin - responsive sizing */}
                  <div
                    className="absolute -top-8 xs:-top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-white border border-walmart xs:border-2 rounded-sm xs:rounded-lg px-1 xs:px-2 py-0.5 xs:py-1 text-xs font-bold text-gray-800 shadow-sm xs:shadow-lg whitespace-nowrap z-30 overflow-hidden"
                    style={{ 
                      minWidth: 'max-content',
                      maxWidth: '150px',
                      backgroundColor: '#ffffff',
                      borderColor: WALMART_BLUE,
                      color: '#1f2937'
                    }}
                  >
                    <span className="truncate block">{t.label ?? 'Target'}</span>
                    {/* Arrow pointing down to pin */}
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 xs:border-l-3 border-r-2 xs:border-r-3 border-t-2 xs:border-t-3 border-transparent"
                      style={{ borderTopColor: WALMART_BLUE }}
                    ></div>
                  </div>
                  {/* Pin - larger and more prominent with inset shadow for "inside" effect */}
                  <div
                    className="w-4 h-4 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform"
                    style={{
                      backgroundColor: WALMART_YELLOW,
                      borderColor: '#b38600',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3)',
                      zIndex: 25
                    }}
                    title={`${t.label ?? 'Target'} - Click for details`}
                    onClick={() => {
                      // Show item details popup
                      alert(`Item: ${t.label}\nLocation: (${t.x.toFixed(1)}, ${t.y.toFixed(1)})\nDistance: ${distance.toFixed(1)} units`);
                    }}
                  />
                </div>
              );
            })}

            {/* Shopping Cart - Clean and prominent */}
            <div
              className="absolute w-6 h-6 rounded-full border-3 flex items-center justify-center shadow-lg z-30 map-element"
              style={{
                backgroundColor: WALMART_BLUE,
                borderColor: '#ffffff',
                left: `${Math.max(0, Math.min(100, ((estimatedCart?.x ?? trueCart.x) / map.width) * 100))}%`,
                top: `${Math.max(0, Math.min(100, ((estimatedCart?.y ?? trueCart.y) / map.height) * 100))}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 4px 12px rgba(0, 113, 206, 0.4)'
              }}
              title={`Your Cart (${(estimatedCart?.x ?? trueCart.x).toFixed(1)}, ${(estimatedCart?.y ?? trueCart.y).toFixed(1)})`}
            >
              <span className="text-white text-sm">🛒</span>
            </div>
          </div>
        </div>

        {/* Interactive Legend with Preferences */}
        <InteractiveLegend className="mt-4" />
      </div>
    </div>
  );
}
