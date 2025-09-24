import yaml from 'js-yaml';
import { StoreLayout } from '@/types/store';

// Load store layout data from YAML file
export async function loadStoreLayout(): Promise<StoreLayout> {
  try {
    // In a real app, this would be loaded from a file or API
    // For now, we'll import the YAML content directly
    const response = await fetch('/data/store-layout.yaml');
    const yamlText = await response.text();
    const data = yaml.load(yamlText) as StoreLayout;
    return data;
  } catch (error) {
    console.error('Error loading store layout:', error);
    throw new Error('Failed to load store layout data');
  }
}

// Find items by name or category
export function findItemsByName(storeLayout: StoreLayout, searchTerm: string): StoreLayout['items'] {
  const term = searchTerm.toLowerCase();
  return storeLayout.items.filter(item => 
    item.name.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term)
  );
}

// Find items by multiple search terms
export function findItemsByTerms(storeLayout: StoreLayout, searchTerms: string[]): StoreLayout['items'] {
  const foundItems: StoreLayout['items'] = [];
  
  for (const term of searchTerms) {
    const items = findItemsByName(storeLayout, term);
    foundItems.push(...items);
  }
  
  // Remove duplicates
  const uniqueItems = foundItems.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  return uniqueItems;
}

// Get items by section
export function getItemsBySection(storeLayout: StoreLayout, sectionId: string): StoreLayout['items'] {
  return storeLayout.items.filter(item => item.section === sectionId);
}

// Get UWB anchors within range of a position
export function getAnchorsInRange(
  storeLayout: StoreLayout, 
  position: { x: number; y: number }, 
  maxRange: number = 30
): StoreLayout['uwb_anchors'] {
  return storeLayout.uwb_anchors.filter(anchor => {
    const distance = Math.sqrt(
      Math.pow(anchor.coordinates[0] - position.x, 2) + 
      Math.pow(anchor.coordinates[1] - position.y, 2)
    );
    return distance <= maxRange;
  });
}

// Calculate distance between two points
export function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  );
}

// Get nearest entrance to a position
export function getNearestEntrance(storeLayout: StoreLayout, position: { x: number; y: number }) {
  let nearest = storeLayout.entrances[0];
  let minDistance = calculateDistance(position, { x: nearest.coordinates[0], y: nearest.coordinates[1] });
  
  for (const entrance of storeLayout.entrances) {
    const distance = calculateDistance(position, { x: entrance.coordinates[0], y: entrance.coordinates[1] });
    if (distance < minDistance) {
      minDistance = distance;
      nearest = entrance;
    }
  }
  
  return { entrance: nearest, distance: minDistance };
}

// Get nearest checkout to a position
export function getNearestCheckout(storeLayout: StoreLayout, position: { x: number; y: number }) {
  let nearest = storeLayout.checkouts[0];
  let minDistance = calculateDistance(position, { x: nearest.coordinates[0], y: nearest.coordinates[1] });
  
  for (const checkout of storeLayout.checkouts) {
    const distance = calculateDistance(position, { x: checkout.coordinates[0], y: checkout.coordinates[1] });
    if (distance < minDistance) {
      minDistance = distance;
      nearest = checkout;
    }
  }
  
  return { checkout: nearest, distance: minDistance };
}
