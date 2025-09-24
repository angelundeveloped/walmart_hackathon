// TypeScript types for store layout data

export interface MapConfig {
  width: number;
  height: number;
  scale: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Aisle {
  id: string;
  coordinates: number[][];
  type: 'rectangular' | 'circular' | 'custom';
}

export interface Section {
  name: string;
  id: string;
  color: string;
  aisles: Aisle[];
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  section: string;
  coordinates: number[];
  price: number;
  in_stock: boolean;
}

export interface UWBAnchor {
  id: string;
  coordinates: number[];
  range: number;
}

export interface Entrance {
  id: string;
  name: string;
  coordinates: number[];
  type: 'entrance' | 'exit';
}

export interface Checkout {
  id: string;
  name: string;
  coordinates: number[];
  type: 'standard' | 'self-service' | 'express';
}

export interface Service {
  id: string;
  name: string;
  coordinates: number[];
  type: 'service' | 'information' | 'support';
}

export interface StoreLayout {
  map: MapConfig;
  sections: Section[];
  items: StoreItem[];
  uwb_anchors: UWBAnchor[];
  entrances: Entrance[];
  checkouts: Checkout[];
  services: Service[];
}

// Cart and navigation types
export interface CartPosition {
  x: number;
  y: number;
  heading: number; // in degrees
}

export interface NavigationPath {
  waypoints: Coordinates[];
  totalDistance: number;
  estimatedTime: number; // in minutes
}

export interface ShoppingRoute {
  items: StoreItem[];
  path: NavigationPath;
  optimized: boolean;
}
