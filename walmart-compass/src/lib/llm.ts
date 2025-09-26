import { vectorDB, SearchResult } from './vector-db';

export async function askGemini(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error('LLM request failed');
  }
  const data = await res.json();
  return data.text as string;
}

// Parse YAML list returned by the model into string[]
export function parseItemsFromYaml(yamlText: string): string[] {
  // light-weight YAML parse for expected structure: items: - name: ...
  // We'll avoid adding a new dependency; do minimal parsing.
  try {
    const lines = yamlText.split('\n').map(l => l.trim());
    const items: string[] = [];
    let inItems = false;
    for (const line of lines) {
      if (line.startsWith('items:')) { inItems = true; continue; }
      if (inItems) {
        const m = line.match(/-\s*name:\s*(.+)/i);
        if (m) {
          items.push(m[1].trim());
        } else if (line && !line.startsWith('-')) {
          // stop at next section
          break;
        }
      }
    }
    return items;
  } catch {
    return [];
  }
}

// Map item names to coordinates by scanning the YAML layout loaded in the app's public folder.
export async function mapItemsToCoordinates(names: string[]): Promise<{ id: string; name: string; x: number; y: number }[]> {
  try {
    const res = await fetch('/data/store-layout.yaml');
    const text = await res.text();
    // lightweight parse: look for lines like: "- id:" and following "name:" and "coordinates: [x, y]"
    const lines = text.split('\n');
    const entries: { id: string; name: string; x: number; y: number }[] = [];
    type WorkingEntry = { id: string; name?: string; coords?: [number, number] } | null;
    let current: WorkingEntry = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- id:')) {
        if (current && current.name && current.coords) {
          entries.push({ id: current.id, name: current.name, x: current.coords[0], y: current.coords[1] });
        }
        current = { id: line.replace('- id:', '').trim() };
      } else if (current && line.startsWith('name:')) {
        current.name = line.replace('name:', '').trim().replace(/^\"|\"$/g, '');
      } else if (current && line.startsWith('coordinates:')) {
        const m = line.match(/\[(\s*[-\d.]+)\s*,\s*([-\d.]+)\]/);
        if (m) current.coords = [Number(m[1]), Number(m[2])];
      }
    }
    if (current && current.name && current.coords) {
      entries.push({ id: current.id, name: current.name, x: current.coords[0], y: current.coords[1] });
    }

    // Enhanced name matching with fuzzy logic and fallbacks
    const results: { id: string; name: string; x: number; y: number }[] = [];
    const lower = names.map(n => n.toLowerCase());
    
    // First pass: exact and partial matches
    for (const entry of entries) {
      if (lower.some(n => entry.name.toLowerCase().includes(n))) {
        results.push(entry);
      }
    }
    
    // Second pass: fuzzy matching for unmatched items
    const matchedNames = new Set(results.map(r => r.name.toLowerCase()));
    const unmatchedNames = names.filter(n => 
      !matchedNames.has(n.toLowerCase()) && 
      !results.some(r => r.name.toLowerCase().includes(n.toLowerCase()))
    );
    
    // Add fallback coordinates for unmatched items based on category
    for (const name of unmatchedNames) {
      const category = getCategoryFromName(name);
      const fallbackCoords = getFallbackCoordinates(category);
      results.push({
        id: `fallback-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name: name,
        x: fallbackCoords.x,
        y: fallbackCoords.y
      });
    }
    
    return results;
  } catch {
    return [];
  }
}

// Helper function to determine category from item name
function getCategoryFromName(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter')) {
    return 'dairy';
  } else if (lower.includes('bread') || lower.includes('bagel') || lower.includes('muffin') || lower.includes('croissant')) {
    return 'bakery';
  } else if (lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || lower.includes('fruit') || lower.includes('vegetable')) {
    return 'produce';
  } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('fish') || lower.includes('meat')) {
    return 'meat';
  } else if (lower.includes('chips') || lower.includes('crackers') || lower.includes('snacks') || lower.includes('cookies')) {
    return 'pantry';
  } else if (lower.includes('soda') || lower.includes('juice') || lower.includes('water') || lower.includes('drink')) {
    return 'beverages';
  } else if (lower.includes('detergent') || lower.includes('cleaner') || lower.includes('paper') || lower.includes('soap')) {
    return 'household';
  } else if (lower.includes('vitamin') || lower.includes('medicine') || lower.includes('shampoo') || lower.includes('lotion')) {
    return 'health';
  } else {
    return 'pantry'; // default fallback
  }
}

// Helper function to get fallback coordinates based on category
function getFallbackCoordinates(category: string): { x: number; y: number } {
  const fallbackCoords: Record<string, { x: number; y: number }> = {
    dairy: { x: 12, y: 6 },
    bakery: { x: 22, y: 6 },
    produce: { x: 32, y: 6 },
    meat: { x: 42, y: 6 },
    pantry: { x: 52, y: 6 },
    beverages: { x: 62, y: 6 },
    household: { x: 72, y: 6 },
    health: { x: 82, y: 6 },
    frozen: { x: 52, y: 16 },
    default: { x: 50, y: 10 }
  };
  
  return fallbackCoords[category] || fallbackCoords.default;
}

// Extract natural response text before YAML section
export function extractNaturalResponse(fullResponse: string): string | null {
  try {
    const lines = fullResponse.split('\n');
    const naturalLines: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Stop when we hit the YAML section
      if (trimmed === 'items:' || trimmed.startsWith('items:')) {
        break;
      }
      // Skip empty lines at the beginning
      if (naturalLines.length === 0 && trimmed === '') {
        continue;
      }
      naturalLines.push(trimmed);
    }
    
    const naturalText = naturalLines.join(' ').trim();
    return naturalText || null;
  } catch {
    return null;
  }
}

// Enhanced semantic search using vector database
export async function semanticSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    await vectorDB.initialize();
    return await vectorDB.search(query, limit);
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

// Get similar items for a given item
export async function getSimilarItems(itemId: string, limit: number = 3): Promise<SearchResult[]> {
  try {
    await vectorDB.initialize();
    return await vectorDB.getSimilarItems(itemId, limit);
  } catch (error) {
    console.error('Get similar items failed:', error);
    return [];
  }
}

// Enhanced item mapping with semantic search fallback
export async function mapItemsToCoordinatesWithSemantic(names: string[]): Promise<{ id: string; name: string; x: number; y: number }[]> {
  try {
    // First try the original mapping
    const originalResults = await mapItemsToCoordinates(names);
    
    // For unmatched items, try semantic search
    const unmatchedNames = names.filter(name => 
      !originalResults.some(result => result.name.toLowerCase().includes(name.toLowerCase()))
    );
    
    const semanticResults: { id: string; name: string; x: number; y: number }[] = [];
    
    for (const name of unmatchedNames) {
      const searchResults = await semanticSearch(name, 1);
      if (searchResults.length > 0) {
        const result = searchResults[0];
        semanticResults.push({
          id: result.item.id,
          name: result.item.name,
          x: result.item.coordinates.x,
          y: result.item.coordinates.y
        });
      }
    }
    
    return [...originalResults, ...semanticResults];
  } catch (error) {
    console.error('Enhanced item mapping failed:', error);
    return await mapItemsToCoordinates(names); // Fallback to original
  }
}


